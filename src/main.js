// ============================================
// Archivo: /src/main.js
// ============================================
import Dexie              from 'dexie';
import { CacheService }   from './services/cacheService.js';
import { APIService }     from './services/apiService.js';
import { SyncService }    from './services/syncService.js';
import { SongListView }   from './ui/songListView.js';
import { SongFormView }   from './ui/songFormView.js';
import { AppStatusView }  from './ui/appStatusView.js';
import { Song }           from './models/songModel.js';
import { procesarCancion }from './ui/chordParser.js';

// Registrar Service Worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js')
    .then(() => console.log('Service Worker registrado'))
    .catch(err => console.error('Error al registrar SW:', err));
}

// Inicializar barra de estado
AppStatusView.init();

/**
 * Crea el modal con pestañas para letra, acordes, melodía y audios.
 */
function createModal() {
  const modal = document.createElement('div');
  modal.id = 'song-modal';
  modal.className = 'modal hidden';
  modal.innerHTML = `
    <div class="modal-content">
      <span class="modal-close">&times;</span>
      <h2 id="modal-title"></h2>
      <div class="modal-tabs">
        <button class="tab-btn active" data-tab="letra">Letra</button>
        <button class="tab-btn" data-tab="acordes">Acordes</button>
        <button class="tab-btn" data-tab="melodia">Melodía</button>
        <button class="tab-btn" data-tab="audios">Audios</button>
      </div>
      <div class="modal-body">
        <div class="tab-content active" id="tab-letra"></div>
        <div class="tab-content" id="tab-acordes"></div>
        <div class="tab-content" id="tab-melodia"></div>
        <div class="tab-content" id="tab-audios"></div>
      </div>
    </div>`;
  document.body.appendChild(modal);
  modal.querySelector('.modal-close').addEventListener('click', () => modal.classList.add('hidden'));
  // pestañas
  modal.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      modal.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const tab = btn.dataset.tab;
      modal.querySelectorAll('.tab-content').forEach(tc => tc.classList.toggle('active', tc.id === `tab-${tab}`));
    });
  });
  return modal;
}
const modal = createModal();

// Estado global
let allSongs = [];
const selectedTags = new Set();

/**
 * Ordena canciones por título de forma alfabética.
 */
function sortSongs(songs) {
  return songs.slice().sort((a, b) =>
    a.titulo.localeCompare(b.titulo, 'es', { sensitivity: 'base' })
  );
}

/**
 * Genera botones de filtro para cada etiqueta.
 * Al pulsar, alterna el estado activo/inactivo de la etiqueta.
 */
function populateTagButtons() {
  const container = document.getElementById('filter-container');
  container.innerHTML = '';
  const tags = Array.from(new Set(allSongs.flatMap(s => s.tags)));
  tags.sort((a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' }));
  tags.forEach(tag => {
    const btn = document.createElement('button');
    btn.textContent = tag;
    btn.className = selectedTags.has(tag) ? 'filter-btn active' : 'filter-btn';
    btn.addEventListener('click', () => {
      if (selectedTags.has(tag)) selectedTags.delete(tag);
      else selectedTags.add(tag);
      populateTagButtons();
      renderAndSync(false);
    });
    container.appendChild(btn);
  });
}

/**
 * Renderiza la lista de canciones aplicando filtros de etiquetas (AND lógico).
 * Si está online y doSync=true, sincroniza con la API.
 */
async function renderAndSync(doSync = true) {
  let lista = sortSongs(allSongs);
  if (selectedTags.size > 0) {
    // AND lógico: sólo canciones que contengan todas las etiquetas activas
    lista = lista.filter(song =>
      Array.from(selectedTags).every(tag => song.tags.includes(tag))
    );
  }
  SongListView.render(lista);

  if (doSync && navigator.onLine) {
    window.dispatchEvent(new Event('sync:start'));
    const last = await CacheService.getUltimaSync();
    const cambios = await APIService.fetchUpdates(last);
    await SyncService.aplicarCambios(cambios);
    const data = await APIService.getAll();
    allSongs = data.map(js => Song.fromJSON(js));
    allSongs = sortSongs(allSongs);
    populateTagButtons();
    const filtered = selectedTags.size > 0
      ? allSongs.filter(song => Array.from(selectedTags).every(tag => song.tags.includes(tag)))
      : allSongs;
    SongListView.render(filtered);
    const now = new Date();
    await CacheService.setUltimaSync(now.toISOString());
    window.dispatchEvent(new CustomEvent('sync:end', { detail: now }));
  }
}

// Inicialización
(async function init() {
  await CacheService.getUltimaSync();
  await CacheService.inicializar();
  if (navigator.onLine) {
    const data = await APIService.getAll();
    allSongs = data.map(js => Song.fromJSON(js));
  } else {
    const cached = await CacheService.getAllSongs();
    allSongs = cached.map(raw => Song.fromJSON(raw));
  }
  allSongs = sortSongs(allSongs);
  populateTagButtons();

  SongFormView.init();
  SongFormView.bindCreate(async data => {
    const ent = await CacheService.saveSong(data);
    await SyncService.queueOrSend({ type: 'save', data: ent });
    allSongs = (await APIService.getAll()).map(js => Song.fromJSON(js));
    allSongs = sortSongs(allSongs);
    populateTagButtons();
    renderAndSync();
    AppStatusView.showToast('Canción creada');
  });
  SongFormView.bindEdit(async data => {
    const ent = await CacheService.saveSong(data);
    await SyncService.queueOrSend({ type: 'save', data: ent });
    allSongs = (await APIService.getAll()).map(js => Song.fromJSON(js));
    allSongs = sortSongs(allSongs);
    populateTagButtons();
    renderAndSync();
    AppStatusView.showToast('Canción editada');
  });

  SongListView.bindSelect(id => {
    const song = allSongs.find(s => String(s.id) === id);
    if (!song) return;
    document.getElementById('modal-title').textContent = song.titulo;
    document.getElementById('tab-letra').innerHTML = `<pre style="white-space: pre-wrap;">${song.letra || ''}</pre>`;
    document.getElementById('tab-acordes').innerHTML = procesarCancion(song.acordes || '');
    document.getElementById('tab-melodia').innerHTML = `<pre>${song.melodia || ''}</pre>`;
    const audTab = document.getElementById('tab-audios');
    audTab.innerHTML = '';
    let audios = [];
    try {
      const parsed = JSON.parse(song.audios);
      audios = Array.isArray(parsed) ? parsed : [];
    } catch {
      audios = song.audios.split(',').map(u => u.trim()).filter(u => u);
    }
    audios.forEach(src => {
      const audio = document.createElement('audio'); audio.controls = true; audio.src = src;
      audTab.appendChild(audio);
    });
    modal.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === 'letra'));
    modal.querySelectorAll('.tab-content').forEach(tc => tc.classList.toggle('active', tc.id === 'tab-letra'));
    modal.classList.remove('hidden');
  });

  await renderAndSync();
  window.addEventListener('online', () => {
    AppStatusView.showToast('Volviste online, sincronizando...');
    renderAndSync();
  });
})();
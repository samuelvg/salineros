// src/controllers/UIManager.js
// ============================================================
// Gestor de interfaz: lista, modal de canción y herramientas
// Móvil-first, sin romper lo existente.
// - Barra flotante con A+/A-, ±½ semitono, ES/EN (persistentes)
// - Controles admin visibles sólo en modo admin UI
// - Emite eventos modal:opened / modal:closed para integrar con calendario
// ============================================================

import { SongListView } from '../ui/songListView.js';
import { SongFormView } from '../ui/songFormView.js';
import { AppStatusView } from '../ui/appStatusView.js';
import { procesarCancion } from '../ui/chordParser.js';
import { mostrarAcordesUtilizados } from '../ui/chordRenderer.js';
import { crearReproductorMultipista } from '../ui/multiTrackPlayer.js';
import notificacionService from '../services/notificacionService.js';
import { appEvents } from '../core/EventSystem.js';

// NUEVO
import { AdminMode } from '../core/AdminMode.js';
import { transposeText, convertNotation } from '../core/ChordTools.js';
//import { convertNotation, transposeText } from '../core/ChordTools.js';


export class UIManager {
  constructor(appController) {
    this.app = appController;
    this.elementosUI = {}; // referencias a nodos clave

    // Preferencias de UI y estado de herramientas
    this.transposicion = 0; // semitonos (0–11)
    this.notacion = this.app?.config?.ui?.defaultNotation || 'EN'; // 'EN'|'ES'
    this.fontSize = this.app?.config?.ui?.defaultFontSize || 18; // px

    // Filtros/estado adicional existente
    this.etiquetasSeleccionadas = new Set();
    this.subscriptions = [];

    // Cargar preferencias persistidas (si existen)
    try {
      const st = JSON.parse(localStorage.getItem('ui_prefs') || '{}');
      if (typeof st.transposicion === 'number') this.transposicion = st.transposicion;
      if (st.notacion) this.notacion = st.notacion;
      if (st.fontSize) this.fontSize = st.fontSize;
    } catch {}
  }

  // ==========================================================
  // Ciclo de vida
  // ==========================================================
  async createInterface() {
    try {
      await this.crearElementosUIAdaptados();
      this.configurarEventos();
      this.initializeViews();
      appEvents.emit('ui:initialized');
    } catch (error) {
      console.error('❌ Error creando la UI:', error);
      notificacionService.mostrar({
        tipo: 'error',
        titulo: 'Error de interfaz',
        mensaje: 'No se pudo inicializar la interfaz.',
      });
    }
  }

  initializeViews() {
    try { AppStatusView?.init?.(); } catch {}
    this.inicializarFormulario();

    // Vincular selección en lista
    SongListView.bindSelect(id => {
      this.app.songManager.setCurrentSong(id);
      const song = this.app.songManager.getCurrentSong();
      this.mostrarModal(song);
    });

    // Pintar lista inicial
    this.updateSongList();
    appEvents.emit('ui:views_initialized');
  }

  destroy() {
    this.subscriptions.forEach(unsub => { try { unsub(); } catch {} });
    this.subscriptions = [];
  }

  // ==========================================================
  // Lista de canciones
  // ==========================================================
  updateSongList() {
    const canciones = this.app.songManager.getAllSongs();
    const listaFiltrada = this.aplicarFiltrosEtiquetas(canciones);
    SongListView.render(listaFiltrada);
    this.generarBotonesEtiquetas();
    appEvents.emit('ui:song_list_updated', { count: listaFiltrada.length });
  }

  aplicarFiltrosEtiquetas(canciones) {
    if (this.etiquetasSeleccionadas.size === 0) return canciones;
    return canciones.filter(cancion =>
      Array.from(this.etiquetasSeleccionadas).every(tag => (cancion.tags || []).includes(tag))
    );
  }

  // ==========================================================
  // Modal de canción
  // ==========================================================
  mostrarModal(cancion) {
    if (!cancion) {
      console.warn('No se puede mostrar modal: canción no encontrada');
      return;
    }

    const { modal, modalBody } = this.elementosUI;
    try {
      // Título
      const tituloModal = document.getElementById('modal-title');
      if (tituloModal) tituloModal.textContent = cancion.titulo || '(Sin título)';

      // Cuerpo: letra envuelta para operar con herramientas
      const letraHTML = (cancion.letra || '').toString();
      const tabLetra = document.getElementById('tab-letra');
      if (tabLetra) {
        tabLetra.innerHTML =
          `<div class="letra-html" style="white-space:pre-wrap;line-height:1.6;">${letraHTML}</div>`;
      }

      // Acordes
      const tabAcordes = document.getElementById('tab-acordes');
      if (tabAcordes) {
        try {
          tabAcordes.innerHTML = procesarCancion(cancion.acordes || '');
          const cont = document.createElement('div');
          cont.className = 'diagram-container';
          tabAcordes.appendChild(cont);
          if (cancion.acordes) mostrarAcordesUtilizados(cancion.acordes, cont);
        } catch (e) {
          console.error('Error al procesar acordes:', e);
          tabAcordes.innerHTML = '<p class="error-audio">Error al procesar los acordes</p>';
        }
      }

      // Melodía (HTML permitido)
      const tabMelodia = document.getElementById('tab-melodia');
      if (tabMelodia) {
        const melodiaHTML = cancion.melodia || 'Sin información de melodía';
        tabMelodia.innerHTML =
          `<div class="melodia-content" style="white-space:pre-wrap;line-height:1.6;">${melodiaHTML}</div>`;
      }

      // Audios (HTML o reproductor multipista)
      this.mostrarAudios(cancion);

      // Pestaña por defecto
      this.cambiarPestanaModal('letra');

      // Mostrar modal
      modal.classList.remove('hidden');
      document.body.classList.add('modal-open');

      // Tamaño de fuente guardado
      if (modalBody) modalBody.style.fontSize = (this.fontSize || 18) + 'px';

      // Aplicar notación + transposición persistidas
      this._aplicarNotacionYTransposicion();

      // Asegurar barra de herramientas (una sola vez)
      this._asegurarBarraHerramientas();
      const tb = document.getElementById('song-tools'); if (tb) tb.classList.remove('hidden');
      try { this.updateToolbarForTab?.('letra'); } catch {}

      // Visibilidad admin
      if (AdminMode.isEnabled()) document.documentElement.classList.add('admin-on');
      else document.documentElement.classList.remove('admin-on');

      // Enfocar botón cerrar
      const btnClose = modal.querySelector('.modal-close');
      if (btnClose) btnClose.focus();

      // Evento apertura
      setTimeout(() => appEvents.emit('modal:opened'), 0);
    } catch (error) {
      console.error('Error al mostrar modal:', error);
      notificacionService.error('Error al mostrar canción', 'No se pudo cargar toda la información de la canción');
      appEvents.emit('ui:modal:error', { error, song: cancion });
    }
  }

  cerrarModal() {
    const { modal } = this.elementosUI;
    if (modal) modal.classList.add('hidden');
    document.body.classList.remove('modal-open');
    this.app.songManager.cancionActual = null;

    // Devolver foco a la lista (opcional)
    const btnSong = document.querySelector('.song-btn[data-id]');
    if (btnSong) btnSong.focus();

    const tb=document.getElementById('song-tools'); if (tb) tb.classList.add('hidden');
    appEvents.emit('modal:closed');
  }

  cambiarPestanaModal(nombrePestana) {
    const modal = this.elementosUI.modal;
    // Actualizar botones
    modal.querySelectorAll('.tab-btn').forEach(boton => {
      const activa = boton.dataset.tab === nombrePestana;
      boton.classList.toggle('active', activa);
      boton.setAttribute('aria-selected', activa);
    });
    // Actualizar contenidos
    modal.querySelectorAll('.tab-content').forEach(contenido => {
      const activa = contenido.id === `tab-${nombrePestana}`;
      contenido.classList.toggle('active', activa);
    });
    try { this.updateToolbarForTab?.(nombrePestana); } catch {}
  }

  // ==========================================================
  // Barra flotante de herramientas (
_asegurarBarraHerramientas() {
    let toolbar = document.getElementById('song-tools');
    if (!toolbar) {
      toolbar = document.createElement('div');
      toolbar.id = 'song-tools';
      toolbar.className = 'song-tools hidden'; // se muestra al abrir modal
      toolbar.innerHTML = `
        <button class="tool-btn" id="tool-font-plus" title="Aumentar tamaño">A+</button>
        <button class="tool-btn" id="tool-font-minus" title="Disminuir tamaño">A-</button>
        <button class="tool-btn" id="tool-transpose-up" title="Subir semitono">+½</button>
        <button class="tool-btn" id="tool-transpose-down" title="Bajar semitono">-½</button>
        <button class="tool-btn" id="tool-notation" title="Cambiar notación">ES/EN</button>
        <div class="admin-only tool-split"></div>
        <button class="tool-btn admin-only" id="tool-edit">Editar</button>
        <button class="tool-btn admin-only" id="tool-delete">Borrar</button>
      `;
      document.body.appendChild(toolbar);

      // Guardar referencia para uso externo
      this.elementosUI = this.elementosUI || {};
      this.elementosUI.toolbar = toolbar;

      // Tamaño de fuente (aplica al tab activo y persiste)
      const applyFont = () => {
        const activeTab = document.querySelector('.modal-body .tab-content.active');
        if (activeTab) {
          activeTab.style.fontSize = (this.fontSize || 18) + 'px';
          const letra = activeTab.querySelector('.letra-html');
          if (letra) letra.style.fontSize = (this.fontSize || 18) + 'px';
        }
        // además, sincronizamos letra y acordes por si el usuario cambia de pestaña
        const letraTab = document.getElementById('tab-letra');
        const acordesTab = document.getElementById('tab-acordes');
        if (letraTab) letraTab.style.fontSize = (this.fontSize || 18) + 'px';
        if (acordesTab) acordesTab.style.fontSize = (this.fontSize || 18) + 'px';
        this.saveUIPrefs?.();
      };
      toolbar.querySelector('#tool-font-plus').addEventListener('click', () => {
        this.fontSize = Math.min((this.fontSize || 18) + 2, 40);
        applyFont();
      });
      toolbar.querySelector('#tool-font-minus').addEventListener('click', () => {
        this.fontSize = Math.max((this.fontSize || 18) - 2, 12);
        applyFont();
      });

      // Transposición (reconstruye la pestaña Acordes desde la fuente original)
      const renderChordsFromState = () => {
        const current = this.app?.songManager?.getCurrentSong?.();
        if (!current) return;
        const original = (current.acordes || '').toString();
        const acordesTab = document.getElementById('tab-acordes');
        if (!acordesTab) return;
        let txt = convertNotation(original, 'EN');
        if (Number.isInteger(this.transposicion) && this.transposicion) {
          txt = transposeText(txt, this.transposicion);
        }
        if (this.notacion === 'ES') {
          txt = convertNotation(txt, 'ES');
        }
        // reconstruir HTML y diagramas
        acordesTab.innerHTML = procesarCancion(txt);
        const cont = document.createElement('div');
        cont.className = 'diagram-container';
        acordesTab.appendChild(cont);
        try { mostrarAcordesUtilizados(txt, cont); } catch {}
      };

      const applyTransposeDelta = (delta) => {
        this.transposicion = ((this.transposicion || 0) + delta + 12) % 12;
        renderChordsFromState();
        this.saveUIPrefs?.();
      };
      toolbar.querySelector('#tool-transpose-up').addEventListener('click', () => applyTransposeDelta(1));
      toolbar.querySelector('#tool-transpose-down').addEventListener('click', () => applyTransposeDelta(-1));

      // Notación ES/EN (sólo relevante para acordes)
      toolbar.querySelector('#tool-notation').addEventListener('click', () => {
        this.notacion = (this.notacion === 'EN') ? 'ES' : 'EN';
        renderChordsFromState();
      });

      // Editar / Borrar
      toolbar.querySelector('#tool-edit').addEventListener('click', (ev) => {
        ev.stopPropagation();
        const current = this.app?.songManager?.getCurrentSong?.();
        if (!current) return;
        this.cerrarModal();
        this.mostrarFormularioEditarCancion?.();
      });
      toolbar.querySelector('#tool-delete').addEventListener('click', async (ev) => {
        ev.stopPropagation();
        const current = this.app?.songManager?.getCurrentSong?.();
        if (!current) return;
        if (confirm(`¿Eliminar "${current.titulo}"?`)) {
          try {
            if (this.app?.songManager?.eliminarCancion) {
              await this.app.songManager.eliminarCancion(current.id);
            } else {
              appEvents.emit('song:delete', { id: current.id });
            }
            this.cerrarModal();
            this.updateSongList?.();
          } catch (e) {
            notificacionService.mostrar({ tipo: 'error', titulo: 'Error', mensaje: 'No se pudo eliminar.' });
          }
        }
      });

      // Helper: visibilidad de botones según pestaña
      this.updateToolbarForTab = (tabName) => {
        const btnUp = toolbar.querySelector('#tool-transpose-up');
        const btnDown = toolbar.querySelector('#tool-transpose-down');
        const btnNotation = toolbar.querySelector('#tool-notation');
        // A+/A- siempre, ±½ y ES/EN sólo en "acordes"
        const acordes = tabName === 'acordes';
        [btnUp, btnDown, btnNotation].forEach(el => { if (el) el.classList.toggle('hidden', !acordes); });
        // Asegurar tamaño actual aplicado
        const activeTab = document.querySelector('.modal-body .tab-content.active');
        if (activeTab) activeTab.style.fontSize = (this.fontSize || 18) + 'px';
      };

      // Estado inicial de preferencias si no existe
      if (typeof this.fontSize !== 'number') this.fontSize = 18;
      if (!this.notacion) this.notacion = 'ES';
      if (!Number.isInteger(this.transposicion)) this.transposicion = 0;
    }

    // Actualizar clase admin-on según modo
    if (typeof AdminMode !== 'undefined' && AdminMode.isEnabled?.()) {
      document.documentElement.classList.add('admin-on');
    } else {
      document.documentElement.classList.remove('admin-on');
    }
  }
  

  // ==========================================================
  // Preferencias UI
  // ==========================================================
  saveUIPrefs() {
    try {
      localStorage.setItem('ui_prefs', JSON.stringify({
        transposicion: this.transposicion,
        notacion: this.notacion,
        fontSize: this.fontSize
      }));
    } catch {}
  }

  _aplicarNotacionYTransposicion() {
    const letraEl = document.querySelector('.modal-body .letra-html');
    if (!letraEl) return;

    // Guardar base si no existe
    if (!letraEl.getAttribute('data-original')) {
      letraEl.setAttribute('data-original', letraEl.innerHTML);
    }
    const original = letraEl.getAttribute('data-original');

    // 1) Normaliza a EN
    let txt = convertNotation(original, 'EN');
    // 2) Aplica transposición acumulada
    if (this.transposicion && Number.isInteger(this.transposicion)) {
      txt = transposeText(txt, this.transposicion);
    }
    // 3) Cambia notación a preferida
    if (this.notacion === 'ES') {
      txt = convertNotation(txt, 'ES');
    }
    letraEl.innerHTML = txt;
  }

  // ==========================================================
  // Estructura/DOM existentes
  // ==========================================================
  async crearElementosUIAdaptados() {
    // Modal existente o crear uno básico compatible
    this.elementosUI.modal = document.getElementById('song-modal') || this.crearModal();
    this.elementosUI.modalBody = this.elementosUI.modal.querySelector('.modal-body');
    this.elementosUI.botonAgregar = document.getElementById('btn-add-song') || this.crearBotonAgregar();
    this.elementosUI.contenedorFormulario =
      document.getElementById('form-container') || this.crearContenedorFormulario();
  }

  crearModal() {
    const modal = document.createElement('div');
    modal.id = 'song-modal';
    modal.className = 'modal hidden';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'modal-title');

    modal.innerHTML = `
      <div class="modal-content">
        <button class="modal-close" aria-label="Cerrar modal">&times;</button>
        <h2 id="modal-title"></h2>

        <div class="modal-tabs" role="tablist">
          <button class="tab-btn active" data-tab="letra" role="tab" aria-selected="true" aria-controls="tab-letra">Letra</button>
          <button class="tab-btn" data-tab="acordes" role="tab" aria-selected="false" aria-controls="tab-acordes">Acordes</button>
          <button class="tab-btn" data-tab="melodia" role="tab" aria-selected="false" aria-controls="tab-melodia">Melodía</button>
          <button class="tab-btn" data-tab="audios" role="tab" aria-selected="false" aria-controls="tab-audios">Audios</button>
        </div>

        <div class="modal-body">
          <div class="tab-content active" id="tab-letra" role="tabpanel" aria-labelledby="tab-letra"></div>
          <div class="tab-content" id="tab-acordes" role="tabpanel" aria-labelledby="tab-acordes"></div>
          <div class="tab-content" id="tab-melodia" role="tabpanel" aria-labelledby="tab-melodia"></div>
          <div class="tab-content" id="tab-audios" role="tabpanel" aria-labelledby="tab-audios"></div>
        </div>

        <div class="modal-actions">
          <button id="btn-edit-song" class="btn-action btn-edit admin-only"><span>✏️</span> Editar</button>
          <button id="btn-delete-song" class="btn-action btn-delete admin-only"><span>🗑️</span> Eliminar</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    return modal;
  }

  crearBotonAgregar() {
    const boton = document.createElement('button');
    boton.id = 'btn-add-song';
    boton.className = 'btn-add-floating admin-only';
    boton.setAttribute('aria-label', 'Agregar nueva canción');
    boton.innerHTML = `<span class="add-icon">+</span><span class="add-text">Nueva Canción</span>`;
    document.body.appendChild(boton);
    return boton;
  }

  crearContenedorFormulario() {
    const contenedor = document.createElement('div');
    contenedor.id = 'form-container';
    contenedor.className = 'form-container hidden';
    contenedor.setAttribute('role', 'dialog');
    contenedor.setAttribute('aria-modal', 'true');

    contenedor.innerHTML = `
      <div class="form-header">
        <h3 id="form-title">Nueva Canción</h3>
        <button id="btn-close-form" class="btn-close-form" aria-label="Cerrar formulario">&times;</button>
      </div>
      <div id="form-content"></div>
    `;

    document.body.appendChild(contenedor);
    return contenedor;
  }

  configurarEventos() {
    this.configurarEventosModal();
    this.configurarEventosFormulario();

    // Refrescar lista cuando haya cambios (sync/CRUD)
    const unsub1 = appEvents.on('songs:updated', () => this.updateSongList());
    this.subscriptions.push(unsub1);
  }

  configurarEventosModal() {
    const modal = this.elementosUI.modal;

    // Cerrar modal
    const botonCerrar = modal.querySelector('.modal-close');
    if (botonCerrar) botonCerrar.addEventListener('click', () => this.cerrarModal());
    modal.addEventListener('keydown', ev => { if (ev.key === 'Escape') this.cerrarModal(); });

    // Pestañas
    modal.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => this.cambiarPestanaModal(btn.dataset.tab));
    });

    // Acciones admin (acciones de pie del modal)
    const botonEditar = modal.querySelector('#btn-edit-song');
    const botonEliminar = modal.querySelector('#btn-delete-song');

    if (botonEditar) {
    botonEditar.addEventListener('click', (ev) => {
    ev.preventDefault();
    ev.stopPropagation();

    const current = this.app.songManager.getCurrentSong();
    if (!current) {
      notificacionService?.advertencia?.('No hay canción seleccionada', 'Selecciona una canción en la lista primero.');
      return;
    }

    // (opcional) refuerza el estado por si acaso
    this.app.songManager.setCurrentSong?.(current);

    this.cerrarModal();

    // 👇👇 LA CLAVE: pásale la canción (o su id) a la función
    this.mostrarFormularioEditarCancion(current);
  });
}

    if (botonEliminar) {
      botonEliminar.addEventListener('click', async () => {
        const current = this.app.songManager.getCurrentSong();
        if (!current) return;

        const confirmar = await this.mostrarDialogoConfirmacion(
          '¿Eliminar canción?',
          `¿Estás seguro de que quieres eliminar "${current.titulo}"? Esta acción no se puede deshacer.`
        );

        if (confirmar) {
          try {
            await this.app.songManager.delete(current.id);
            this.cerrarModal();
            this.updateSongList();
          } catch (error) {
            // error ya gestionado por SongManager
          }
        }
      });
    }
  }

  configurarEventosFormulario() {
    // Botón agregar (flotante)
    if (this.elementosUI.botonAgregar) {
      this.elementosUI.botonAgregar.addEventListener('click', () => this.mostrarFormularioNuevaCancion());
    }

    // Cerrar formulario
    const botonCerrar = this.elementosUI.contenedorFormulario.querySelector('#btn-close-form');
    if (botonCerrar) botonCerrar.addEventListener('click', () => this.cerrarFormulario());
  }

  // ==========================================================
  // Formularios (nuevo/editar)
  // ==========================================================
  inicializarFormulario() {
    const contenidoFormulario = document.getElementById('form-content');
    if (!contenidoFormulario) {
      console.error('No se encontró el contenedor del formulario');
      return;
    }

    SongFormView.init(contenidoFormulario);

    // Crear
    SongFormView.bindCreate(async (datos) => {
      try {
        await this.app.songManager.create(datos);
        this.cerrarFormulario();
        this.updateSongList();
      } catch (error) {
        // gestionado por SongManager
      }
    });

    // Editar
    SongFormView.bindEdit(async (datos) => {
      try {
        await this.app.songManager.update(datos.id, datos);
        this.cerrarFormulario();
        this.updateSongList();
      } catch (error) {
        // gestionado por SongManager
      }
    });
  }

  mostrarFormularioNuevaCancion() {
    const tituloFormulario = document.getElementById('form-title');
    if (tituloFormulario) tituloFormulario.textContent = 'Nueva Canción';
    SongFormView.populate({});
    this.elementosUI.contenedorFormulario.classList.remove('hidden');
    setTimeout(() => { document.getElementById('titulo')?.focus(); }, 50);
    appEvents.emit('ui:form:open', { formType: 'create' });
  }

  mostrarFormularioEditarCancion(songOrId = null, evt = null) {
  // 1) Intentar resolver la canción desde el argumento
  let song = null;
  let id = null;
  if (songOrId && typeof songOrId === 'object' && songOrId.id) {
    song = songOrId;
  } else if (songOrId && (typeof songOrId === 'string' || typeof songOrId === 'number')) {
    id = String(songOrId);
  }
  // 2) Si viene de un click, intentar sacar el id del DOM más cercano
  if (!song && !id && evt && evt.target) {
    const host = evt.target.closest?.('[data-song-id], [data-id]');
    if (host) id = host.dataset.songId || host.dataset.id || null;
  }
  // 3) Si no hay id aún, intentar con la fila/tarjeta seleccionada en la lista
  if (!song && !id) {
    const selected = document.querySelector('.song-item.selected,[data-selected="true"][data-song-id],[data-selected="true"][data-id]');
    if (selected) id = selected.dataset.songId || selected.dataset.id || null;
  }
  // 4) Resolver desde el manager por id si lo tenemos
  if (!song && id) {
    const sm = this.app?.songManager;
    song = (sm?.getSongById?.(id) || sm?.getById?.(id) || null);
    if (song && sm?.setCurrentSong) sm.setCurrentSong(song); // fijar como actual
  }
  // 5) Último intento: “canción actual” del manager
  if (!song) {
    try { song = this.app?.songManager?.getCurrentSong?.() || null; } catch {}
  }
  // 6) Si seguimos sin canción, avisamos y paramos
  if (!song || !song.id) {
    notificacionService?.advertencia?.(
      'No hay canción seleccionada',
      'Selecciona una canción en la lista o usa el botón Editar dentro de esa canción.'
    );
    return;
  }

  // 7) Poner título del formulario y rellenar
  const tituloFormulario = document.getElementById('form-title');
  if (tituloFormulario) tituloFormulario.textContent = 'Editar Canción';

  // Rellenar con seguridad (tu populate ya es robusto)
  SongFormView.populate(song, 'edit');

  // 8) Mostrar el contenedor del formulario con seguridad
  const cont = this.elementosUI?.contenedorFormulario;
  if (cont) {
    cont.classList.remove('hidden');
    cont.style.display = 'flex'; // forzar visibilidad ante estilos “traviesos”
  }

  // 9) Foco y evento
  setTimeout(() => document.getElementById('titulo')?.focus?.(), 50);
  appEvents.emit('ui:form:open', { formType: 'edit', song });
}


  cerrarFormulario() {
    this.elementosUI.contenedorFormulario.classList.add('hidden');
    this.elementosUI.contenedorFormulario.style.display = ''; // limpia override
    try { SongFormView.form?.reset?.(); } catch {}
    setTimeout(() => { this.elementosUI.botonAgregar?.focus?.(); }, 50);
    appEvents.emit('ui:form:close');
  }

  // ==========================================================
  // Audios (HTML simple o multipista)
  // ==========================================================
  mostrarAudios(cancion) {
    const tabAudios = document.getElementById('tab-audios');
    if (!tabAudios) return;

    tabAudios.innerHTML = '';

    if (!cancion.audios || !cancion.audios.trim()) {
      tabAudios.innerHTML = '<p class="no-content">No hay audios disponibles para esta canción.</p>';
      return;
    }

    try {
      // ¿Incluye reproductor multipista?
      const tieneReproductor = /\[reproductor:\s*(\[[\s\S]*?\])\]/.test(cancion.audios);
      if (!tieneReproductor) {
        // HTML tal cual (audio, iframes, etc.)
        const div = document.createElement('div');
        div.className = 'audio-text';
        div.innerHTML = cancion.audios.replace(/\n/g, '<br>');
        tabAudios.appendChild(div);
        return;
      }

      // Separar texto + configuraciones de reproductor
      const partes = cancion.audios.split(/\[reproductor:\s*(\[[\s\S]*?\])\]/);

      partes.forEach((parte, i) => {
        if (i % 2 === 0) {
          // Texto normal
          if (parte.trim()) {
            const div = document.createElement('div');
            div.className = 'audio-text';
            div.innerHTML = parte.trim().replace(/\n/g, '<br>');
            tabAudios.appendChild(div);
          }
        } else {
          // JSON de reproductor
          let cfg;
          try { cfg = JSON.parse(parte); }
          catch (e) {
            console.error('JSON inválido en configuración de audios:', e);
            const p = document.createElement('p');
            p.textContent = 'Error: Configuración de reproductor inválida';
            p.className = 'error-audio';
            tabAudios.appendChild(p);
            return;
          }
          const cont = document.createElement('div');
          cont.className = 'multiTrackPlayer';
          tabAudios.appendChild(cont);
          try { crearReproductorMultipista(cfg, cont); }
          catch (e) {
            console.error('Error al crear reproductor:', e);
            cont.innerHTML = '<p class="error-audio">Error al cargar el reproductor de audio</p>';
          }
        }
      });
    } catch (error) {
      console.error('Error al procesar audios:', error);
      tabAudios.innerHTML = '<p class="error-audio">Error al procesar los audios de la canción</p>';
    }
  }

  // ==========================================================
  // Filtros por etiquetas (mejorados)
  // ==========================================================
  generarBotonesEtiquetas() {
    const cont = document.getElementById('filter-container');
    if (!cont) return;

    cont.innerHTML = '';
    const tags = this.app.songManager.getAllTags() || [];
    if (!tags.length) {
      cont.style.display = 'none';
      return;
    }
    cont.style.display = 'flex';

    // Botón limpiar si hay filtros activos
    if (this.etiquetasSeleccionadas.size > 0) {
      const b = document.createElement('button');
      b.textContent = `✕ Limpiar (${this.etiquetasSeleccionadas.size})`;
      b.className = 'filter-btn filter-clear';
      b.title = 'Limpiar todos los filtros';
      b.addEventListener('click', () => this.limpiarFiltros());
      cont.appendChild(b);
    }

    tags.forEach((tag, idx) => {
      const active = this.etiquetasSeleccionadas.has(tag);
      const btn = document.createElement('button');
      btn.className = active ? 'filter-btn active' : 'filter-btn';
      btn.setAttribute('aria-pressed', active);
      btn.setAttribute('data-etiqueta', tag);
      btn.style.animationDelay = `${idx * 0.05}s`;
      btn.textContent = tag;
      btn.addEventListener('click', () => this.alternarEtiqueta(tag));
      btn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.alternarEtiqueta(tag);
        }
      });
      cont.appendChild(btn);
    });

    appEvents.emit('ui:filters_updated', {
      tags,
      selectedCount: this.etiquetasSeleccionadas.size,
      totalCount: tags.length
    });
  }

  limpiarFiltros() {
    const prev = new Set(this.etiquetasSeleccionadas);
    this.etiquetasSeleccionadas.clear();
    this.generarBotonesEtiquetas();
    this.updateSongList();
    notificacionService.informacion('Filtros limpiados', `Se quitaron ${prev.size} filtro(s) activo(s)`);
    appEvents.emit('ui:filters_cleared', { previousTags: Array.from(prev) });
  }

  alternarEtiqueta(etiqueta) {
    const wasActive = this.etiquetasSeleccionadas.has(etiqueta);
    if (wasActive) this.etiquetasSeleccionadas.delete(etiqueta);
    else this.etiquetasSeleccionadas.add(etiqueta);

    this.generarBotonesEtiquetas();
    this.updateSongList();

    const msg = wasActive ? `Filtro "${etiqueta}" desactivado` : `Filtro "${etiqueta}" activado`;
    if (this.etiquetasSeleccionadas.size > 3) {
      notificacionService.informacion('Filtro actualizado', msg);
    }

    appEvents.emit('ui:filter_changed', {
      etiqueta,
      accion: wasActive ? 'removed' : 'added',
      selectedTags: Array.from(this.etiquetasSeleccionadas),
      totalSelected: this.etiquetasSeleccionadas.size
    });
  }

  obtenerEstadisticasFiltros() {
    const all = this.app.songManager.getAllSongs();
    const filtradas = this.aplicarFiltrosEtiquetas(all);
    const tags = this.app.songManager.getAllTags();
    return {
      totalEtiquetas: tags.length,
      etiquetasSeleccionadas: this.etiquetasSeleccionadas.size,
      cancionesTotales: all.length,
      cancionesFiltradas: filtradas.length,
      porcentajeFiltrado: all.length ? Math.round((filtradas.length / all.length) * 100) : 0
    };
  }

  aplicarFiltroRapido(etiqueta) {
    this.etiquetasSeleccionadas.clear();
    if (etiqueta && etiqueta.trim()) this.etiquetasSeleccionadas.add(etiqueta.trim());
    this.generarBotonesEtiquetas();
    this.updateSongList();
    appEvents.emit('ui:quick_filter_applied', { etiqueta });
  }

  obtenerSugerenciasEtiquetas() {
    const visibles = this.aplicarFiltrosEtiquetas(this.app.songManager.getAllSongs());
    const sugeridas = new Set();
    visibles.forEach(c => (c.tags || []).forEach(tag => {
      if (!this.etiquetasSeleccionadas.has(tag)) sugeridas.add(tag);
    }));
    return Array.from(sugeridas).sort();
  }

  // ==========================================================
  // Utilidades varias
  // ==========================================================
  mostrarDialogoConfirmacion(titulo, mensaje) {
    return new Promise((resolve) => {
      notificacionService.mostrar({
        tipo: 'advertencia',
        titulo,
        mensaje,
        persistente: true,
        acciones: [
          { texto: 'Cancelar', callback: () => resolve(false) },
          { texto: 'Confirmar', callback: () => resolve(true) }
        ]
      });
    });
  }
}

// ============================================
// Archivo: /src/ui/songListView.js
// ============================================

/**
 * Vista de listado de canciones como botones.
 * Ahora detecta cada campo como string:
 * - letra     (string)
 * - acordes   (string)
 * - melodia   (string)
 * - audios    (string; se mostrará tal cual o se procesará luego)
 * - tags      (array de etiquetas)
 */
export const SongListView = {
  bindSelect(callback) {
    this.onSelect = callback;
  },

  render(canciones) {
    const cont = document.getElementById('app');
    cont.innerHTML = '';

    const lista = document.createElement('div');
    lista.className = 'song-list';

    canciones.forEach(c => {
      const btn = document.createElement('button');
      btn.className = 'song-btn';
      btn.dataset.id = c.id;

      // Tipos disponibles basados en strings
      const tipos = [];
      if (c.letra && c.letra.trim())   tipos.push('Letra');
      if (c.acordes && c.acordes.trim()) tipos.push('Acordes');
      if (c.melodia && c.melodia.trim()) tipos.push('Melodía');
      if (c.audios && c.audios.trim())   tipos.push('Audios');

      // Etiquetas
      const tags = Array.isArray(c.tags) ? c.tags : [];

      btn.innerHTML = `
        <span class="song-title">${c.titulo}</span>
        <span class="song-types">${tipos.join(' | ') || '— Sin contenido extra —'}</span>
        <div class="song-tags">
          ${tags.length
            ? tags.map(t => `<span class="tag-pill">${t}</span>`).join(' ')
            : '<span class="no-tags">— Sin etiquetas —</span>'
          }
        </div>
      `;

      lista.appendChild(btn);
    });

    cont.appendChild(lista);

    // Click handler
    lista.querySelectorAll('.song-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (this.onSelect) this.onSelect(btn.dataset.id);
      });
    });
  }
};

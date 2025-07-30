// ============================================
// Archivo: /src/ui/songFormView.js
// ============================================

export const SongFormView = {
  init() {
    this.container = document.getElementById('app');

    // Construcción del formulario de creación/edición de canciones
    this.form = document.createElement('form');
    this.form.className = 'song-form';
    this.form.innerHTML = `
      <input type="hidden" name="id" value="">

      <label for="titulo">Título:</label>
      <input type="text" name="titulo" id="titulo" required>

      <label for="letra">Letra:</label>
      <textarea name="letra" id="letra" rows="6" required></textarea>

      <label for="acordes">Acordes (JSON):</label>
      <textarea name="acordes" id="acordes" rows="4"></textarea>

      <label for="melodia">Melodía:</label>
      <textarea name="melodia" id="melodia" rows="3"></textarea>

      <label for="audios">Audios (JSON Array):</label>
      <textarea name="audios" id="audios" rows="2"></textarea>

      <label for="etiquetas">Etiquetas (CSV):</label>
      <input type="text" name="etiquetas" id="etiquetas">

      <div class="form-buttons">
        <button type="submit">Guardar</button>
        <button type="button" id="cancel-btn">Cancelar</button>
      </div>
    `;

    // Callbacks para creación y edición
    this.onCreateSubmit = null;
    this.onEditSubmit = null;

    // Manejador de envío del formulario
    this.form.addEventListener('submit', event => {
      event.preventDefault();

      // Construir objeto de datos
      const idValue = this.form.id.value;
      const data = {
        id:       idValue ? Number(idValue) : undefined,
        titulo:   this.form.titulo.value.trim(),
        letra:    this.form.letra.value.trim(),
        acordes:  (() => {
          try {
            return JSON.parse(this.form.acordes.value);
          } catch {
            return this.form.acordes.value.trim();
          }
        })(),
        melodia:  this.form.melodia.value.trim(),
        audios:   this.form.audios.value.trim(),
        etiquetas: this.form.etiquetas.value.trim()
      };

      // Llamar al callback adecuado según si existe ID
      if (data.id && this.onEditSubmit) {
        this.onEditSubmit(data);
      } else if (!data.id && this.onCreateSubmit) {
        this.onCreateSubmit(data);
      }

      // Reset del formulario tras el envío
      this.form.reset();
    });

    // Botón de cancelar para limpiar y ocultar el formulario si es necesario
    this.form.querySelector('#cancel-btn').addEventListener('click', () => {
      this.form.reset();
      // Si utilizan modal, podrían ocultarlo aquí
    });

    // Insertar el formulario en el DOM
    this.container.appendChild(this.form);
  },

  /**
   * Registra el callback para creación de nuevas canciones.
   * @param {Function} callback (data) => Promise
   */
  bindCreate(callback) {
    this.onCreateSubmit = callback;
  },

  /**
   * Registra el callback para edición de canciones existentes.
   * @param {Function} callback (data) => Promise
   */
  bindEdit(callback) {
    this.onEditSubmit = callback;
  },

  /**
   * Precarga el formulario con los datos de la canción a editar
   * @param {Object} song {id, titulo, letra, acordes, melodia, audios, etiquetas}
   */
  populate(song) {
    this.form.id.value        = song.id || '';
    this.form.titulo.value    = song.titulo || '';
    this.form.letra.value     = song.letra || '';
    this.form.acordes.value   = JSON.stringify(song.acordes || song.acordes || '');
    this.form.melodia.value   = song.melodia || '';
    this.form.audios.value    = typeof song.audios === 'string'
      ? song.audios
      : JSON.stringify(song.audios || []);
    this.form.etiquetas.value = Array.isArray(song.tags)
      ? song.tags.join(', ')
      : song.etiquetas || '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

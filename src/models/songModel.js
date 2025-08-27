// ============================================
// Archivo: /src/models/songModel.js
// ============================================

/**
 * Modelo de datos para una canción.
 * Traslada directamente desde la API/DB los textos de:
 * - letra (string)
 * - acordes (string)
 * - melodia (string)
 * - audios (string, p.ej. CSV o JSON-texto)
 * - etiquetas (string CSV)
 */
export class Song {
  constructor({ id, titulo, letra, acordes, melodia, audios, etiquetas, updated_at }) {
    this.id         = id ? Number(id) : null;
    this.titulo     = titulo || '';
    // ✅ CORRECTO: No escapar HTML aquí, se hace en ValidacionService
    this.letra      = letra || '';       
    this.acordes    = acordes || '';     
    this.melodia    = melodia || '';     
    this.audios     = audios || '';      
    this.tags       = this.parseEtiquetas(etiquetas);
    this.updated_at = updated_at || new Date().toISOString();
  }

  /**
   * Parsea las etiquetas desde string CSV a array
   */
  parseEtiquetas(etiquetas) {
    if (Array.isArray(etiquetas)) {
      return etiquetas;
    }
    if (typeof etiquetas === 'string' && etiquetas.trim()) {
      return etiquetas.split(',')
        .map(t => t.trim())
        .filter(t => t.length > 0);
    }
    return [];
  }

  /**
   * Crea una instancia de Song a partir del JSON de la API.
   */
  static fromJSON(json) {
    if (!json || typeof json !== 'object') {
      throw new Error('Invalid JSON data for Song');
    }

    return new Song({
      id:         json.id,
      titulo:     json.titulo,
      letra:      json.letra,
      acordes:    json.acordes,
      melodia:    json.melodia,
      audios:     json.audios,
      etiquetas:  json.etiquetas || json.tags,
      updated_at: json.updated_at
    });
  }

  /**
   * Serializa la instancia para enviar/almacenar.
   */
  toJSON() {
    return {
      id:         this.id,
      titulo:     this.titulo,
      letra:      this.letra,
      acordes:    this.acordes,
      melodia:    this.melodia,
      audios:     this.audios,
      etiquetas:  this.tags.join(', '),
      updated_at: this.updated_at
    };
  }

  /**
   * Crea una copia limpia del objeto sin referencias circulares
   */
  toPlainObject() {
    return {
      id:         this.id,
      titulo:     this.titulo,
      letra:      this.letra,
      acordes:    this.acordes,
      melodia:    this.melodia,
      audios:     this.audios,
      etiquetas:  this.tags.join(', '),
      tags:       [...this.tags], // copia del array
      updated_at: this.updated_at
    };
  }

  /**
   * Valida que la canción tenga los datos mínimos requeridos
   */
  isValid() {
    return this.titulo && this.titulo.trim().length > 0 &&
           this.letra && this.letra.trim().length > 0;
  }
}
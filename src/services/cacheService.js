// =================================
// Archivo: /src/services/cacheService.js
// =================================
import Dexie from 'https://cdn.jsdelivr.net/npm/dexie@3.2.4/dist/dexie.mjs';

// Definición de la base IndexedDB con Dexie
const db = new Dexie('CancionesDB');
db.version(1).stores({
  // Tabla de canciones: indexada por id y updated_at para consultas por fecha
  songs: 'id, updated_at',
  // Cola de operaciones pendientes cuando el usuario está offline
  outbox: '++id, type, data',
  // Metadatos generales como última sincronización
  metadata: '&clave, valor'
});

export const CacheService = {
  /**
   * Inicializa la base de datos local.
   * Crea el registro de última sincronización si no existe.
   */
  async inicializar() {
    const meta = await db.metadata.get('ultimaSync');
    if (!meta) {
      await db.metadata.put({ clave: 'ultimaSync', valor: null });
    }
  },

  /**
   * Obtiene todas las canciones locales.
   * @returns {Promise<Array>} Array de objetos canción.
   */
  getAllSongs() {
    return db.songs.toArray();
  },

  /**
   * Guarda o actualiza una canción localmente.
   * @param {Object} song Objeto canción con propiedades id, titulo, letra, acordes, updated_at.
   * @returns {Promise<Object>} La canción guardada.
   */
  async saveSong(song) {
    // Crear una copia limpia del objeto para evitar problemas con WeakMap
    const cleanSong = {
      id: song.id,
      titulo: song.titulo,
      letra: song.letra,
      acordes: song.acordes,
      melodia: song.melodia,
      audios: song.audios,
      etiquetas: song.etiquetas,
      updated_at: song.updated_at || new Date().toISOString()
    };

    // Si no tiene ID, generar uno temporal para operaciones offline
   if (!cleanSong.id) {
   cleanSong.id = `local-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
   }

    try {
      await db.songs.put(cleanSong);
      return cleanSong;
    } catch (error) {
      console.error('Error al guardar canción en cache:', error);
      throw error;
    }
  },

  /**
   * Elimina una canción de la base local por su ID.
   * @param {number|string} id ID de la canción.
   * @returns {Promise<void>}
   */
  deleteSong(id) {
    return db.songs.delete(Number(id));
  },

  /**
   * Obtiene el timestamp ISO de la última sincronización.
   * @returns {Promise<string|null>} Timestamp en ISO o null.
   */
  async getUltimaSync() {
    const meta = await db.metadata.get('ultimaSync');
    return meta ? meta.valor : null;
  },

  /**
   * Guarda el timestamp ISO de la última sincronización.
   * @param {string} timestamp Timestamp en formato ISO.
   * @returns {Promise<void>}
   */
  setUltimaSync(timestamp) {
    return db.metadata.put({ clave: 'ultimaSync', valor: timestamp });
  },

  /**
   * Añade una operación a la cola offline (outbox).
   * @param {Object} op Objeto con { type: 'save'|'delete', data }.
   * @returns {Promise<number>} ID del registro en la cola.
   */
  enqueue(op) {
    // Limpiar el objeto data para evitar problemas con WeakMap
    const cleanOp = {
      type: op.type,
      data: op.data ? {
        id: op.data.id,
        titulo: op.data.titulo,
        letra: op.data.letra,
        acordes: op.data.acordes,
        melodia: op.data.melodia,
        audios: op.data.audios,
        etiquetas: op.data.etiquetas,
        updated_at: op.data.updated_at
      } : null
    };
    return db.outbox.add(cleanOp);
  },

  /**
   * Recupera todas las operaciones pendientes.
   * @returns {Promise<Array>} Array de operaciones.
   */
  getOutbox() {
    return db.outbox.toArray();
  },

  /**
   * Elimina una operación procesada de la cola.
   * @param {number} id ID del registro en la cola.
   * @returns {Promise<void>}
   */
  clearOutboxItem(id) {
    return db.outbox.delete(id);
  }
};
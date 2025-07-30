// =================================
// Archivo: /src/services/cacheService.js
// =================================
import Dexie from 'dexie';

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
  saveSong(song) {
    return db.songs.put(song).then(() => song);
  },

  /**
   * Elimina una canción de la base local por su ID.
   * @param {number|string} id ID de la canción.
   * @returns {Promise<void>}
   */
  deleteSong(id) {
    return db.songs.delete(id);
  },

  /**
   * Obtiene el timestamp ISO de la última sincronización.
   * @returns {Promise<string|null>} Timestamp en ISO o null.
   */
  getUltimaSync() {
    return db.metadata.get('ultimaSync').then(m => m ? m.valor : null);
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
    return db.outbox.add(op);
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

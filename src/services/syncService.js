// =================================
// Archivo: /src/services/syncService.js
// =================================
import { APIService } from './apiService.js';
import { CacheService } from './cacheService.js';
import { Song } from '../models/songModel.js';

/**
 * Servicio de sincronización entre la cache local y el servidor.
 */
export const SyncService = {
  /**
   * Aplica los cambios recibidos del servidor a la cache local.
   * @param {Object} cambios { creadas:[], modificadas:[], eliminadas:[] }
   */
  async aplicarCambios(cambios) {
    // Procesar nuevas canciones
    for (const item of cambios.creadas) {
      const song = Song.fromJSON(item);
      await CacheService.saveSong(song);
    }
    // Procesar actualizaciones
    for (const item of cambios.modificadas) {
      const song = Song.fromJSON(item);
      await CacheService.saveSong(song);
    }
    // Procesar eliminaciones
    for (const id of cambios.eliminadas) {
      await CacheService.deleteSong(id);
    }
  },

  /**
   * Decide si enviar la operación inmediatamente o encolarla.
   * @param {Object} op { type: 'save'|'delete', data }
   */
  async queueOrSend(op) {
    if (navigator.onLine) {
      await this._enviarAlServidor(op);
    } else {
      await CacheService.enqueue(op);
    }
  },

  /**
   * Envía todas las operaciones pendientes en la cola (outbox).
   */
  async sincronizarOutbox() {
    const pendientes = await CacheService.getOutbox();
    for (const op of pendientes) {
      try {
        await this._enviarAlServidor(op);
        await CacheService.clearOutboxItem(op.id);
      } catch (err) {
        console.error('Error al procesar op:', op, err);
        // Si falla, se mantiene en la cola para reintento futuro
      }
    }
  },

  /**
   * Lógica interna para enviar una operación al servidor.
   * @param {Object} op { type, data }
   */
  async _enviarAlServidor(op) {
    const { type, data } = op;
    switch (type) {
      case 'save':
        if (!data.id) {
          const creado = await APIService.create(data);
          // Si el servidor asigna un ID, actualizar en cache local
          await CacheService.saveSong(Song.fromJSON(creado));
        } else {
          const actualizado = await APIService.update(data.id, data);
          await CacheService.saveSong(Song.fromJSON(actualizado));
        }
        break;
      case 'delete':
        await APIService.remove(data.id);
        // Ya fue eliminado localmente en el UI
        break;
      default:
        throw new Error(`Tipo de operación desconocido: ${type}`);
    }
  }
};

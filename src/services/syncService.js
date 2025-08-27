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
    case 'create': {
      // preparar payload sin id local
      const { id: localId, ...payload } = data;
      const creada = await APIService.create(payload);
      // guardar con id de servidor
      await CacheService.saveSong(creada);
      // si el id local era distinto, elimina el temporal
      if (localId && String(localId).startsWith('local-') && localId !== creada.id) {
        await CacheService.deleteSong(localId);
      }
      return;
    }
    case 'save': {
      // update normal (sólo si el id NO es local)
      if (String(data.id).startsWith('local-')) {
        // seguridad: tratarlo como create
        const { id: _loc, ...payload } = data;
        const creada = await APIService.create(payload);
        await CacheService.saveSong(creada);
        await CacheService.deleteSong(_loc);
        return;
      }
      const actualizado = await APIService.update(data.id, data);
      await CacheService.saveSong(actualizado);
      return;
    }
    case 'delete': {
      await APIService.remove(data.id);
      return;
    }
    default:
      throw new Error(`Tipo de operación desconocido: ${type}`);
  }
}
};
// ============================================
// Archivo: /src/services/apiService.js
// ============================================

/**
 * Servicio para interactuar con la API de canciones.
 * Cada acción apunta a su script PHP dedicado.
 */
export class APIService {
  // Carpeta donde viven los endpoints
  static basePath = 'api/songs';

  /**
   * Obtiene todas las canciones.
   * Llama a GET api/songs/index.php
   * @returns {Promise<Array>}
   */
  static async getAll() {
    const resp = await fetch(`${APIService.basePath}/index.php`, {
      method: 'GET'
    });
    if (!resp.ok) {
      throw new Error(`Error al obtener canciones: ${resp.status}`);
    }
    return resp.json();
  }

  /**
   * Obtiene actualizaciones desde un timestamp.
   * Llama a GET api/songs/updates.php?since=...
   * @param {string|null} since
   * @returns {Promise<{creadas:Array,modificadas:Array,eliminadas:Array}>}
   */
  static async fetchUpdates(since) {
    const url = new URL(`${APIService.basePath}/updates.php`, location);
    if (since) url.searchParams.set('since', since);
    const resp = await fetch(url.toString(), { method: 'GET' });
    if (!resp.ok) {
      throw new Error(`Error al obtener actualizaciones: ${resp.status}`);
    }
    return resp.json();
  }

  /**
   * Crea una nueva canción.
   * Llama a POST api/songs/create.php
   * @param {Object} data { titulo, letra, acordes }
   * @returns {Promise<Object>} Canción creada
   */
  static async create(data) {
    const resp = await fetch(`${APIService.basePath}/create.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!resp.ok) {
      throw new Error(`Error al crear canción: ${resp.status}`);
    }
    return resp.json();
  }

  /**
   * Actualiza una canción existente.
   * Llama a PUT api/songs/update.php?id={id}
   * @param {number|string} id
   * @param {Object} data { titulo, letra, acordes }
   * @returns {Promise<Object>} Canción actualizada
   */
  static async update(id, data) {
    const url = new URL(`${APIService.basePath}/update.php`, location);
    url.searchParams.set('id', id);
    const resp = await fetch(url.toString(), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!resp.ok) {
      throw new Error(`Error al actualizar canción ${id}: ${resp.status}`);
    }
    return resp.json();
  }

  /**
   * Elimina una canción.
   * Llama a DELETE api/songs/delete.php?id={id}
   * @param {number|string} id
   * @returns {Promise<void>}
   */
  static async remove(id) {
    const url = new URL(`${APIService.basePath}/delete.php`, location);
    url.searchParams.set('id', id);
    const resp = await fetch(url.toString(), {
      method: 'DELETE'
    });
    if (!resp.ok) {
      throw new Error(`Error al eliminar canción ${id}: ${resp.status}`);
    }
  }
}

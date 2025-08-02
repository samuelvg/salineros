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
   * Maneja las respuestas de la API con mejor control de errores
   */
  static async handleResponse(response) {
    const contentType = response.headers.get('content-type');
    
    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      
      try {
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          if (errorData.error) {
            errorMessage = errorData.error;
            if (errorData.details) {
              console.error('Detalles del error:', errorData.details);
            }
          }
        } else {
          // Si no es JSON, obtener el texto del error
          const errorText = await response.text();
          console.error('Respuesta del servidor (no JSON):', errorText);
          if (errorText.length < 200) {
            errorMessage += ': ' + errorText;
          }
        }
      } catch (parseError) {
        console.error('Error al parsear respuesta de error:', parseError);
      }
      
      throw new Error(errorMessage);
    }

    if (contentType && contentType.includes('application/json')) {
      return response.json();
    } else {
      const text = await response.text();
      console.warn('Respuesta no es JSON:', text);
      throw new Error('La respuesta del servidor no es JSON válido');
    }
  }

  /**
   * Obtiene todas las canciones.
   * Llama a GET api/songs/index.php
   * @returns {Promise<Array>}
   */
  static async getAll() {
    try {
      console.log('Obteniendo todas las canciones...');
      const response = await fetch(`${APIService.basePath}/index.php`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      const data = await APIService.handleResponse(response);
      console.log('Canciones obtenidas:', data.length);
      return data;
    } catch (error) {
      console.error('Error en getAll:', error);
      throw new Error(`Error al obtener canciones: ${error.message}`);
    }
  }

  /**
   * Obtiene actualizaciones desde un timestamp.
   * Llama a GET api/songs/updates.php?since=...
   * @param {string|null} since
   * @returns {Promise<{creadas:Array,modificadas:Array,eliminadas:Array}>}
   */
  static async fetchUpdates(since) {
    try {
      const url = new URL(`${APIService.basePath}/updates.php`, location);
      if (since) {
        url.searchParams.set('since', since);
      }
      
      console.log('Obteniendo actualizaciones desde:', since || 'inicio');
      const response = await fetch(url.toString(), { 
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      const data = await APIService.handleResponse(response);
      console.log('Actualizaciones obtenidas:', {
        creadas: data.creadas?.length || 0,
        modificadas: data.modificadas?.length || 0,
        eliminadas: data.eliminadas?.length || 0
      });
      return data;
    } catch (error) {
      console.error('Error en fetchUpdates:', error);
      throw new Error(`Error al obtener actualizaciones: ${error.message}`);
    }
  }

  /**
   * Crea una nueva canción.
   * Llama a POST api/songs/create.php
   * @param {Object} data { titulo, letra, acordes }
   * @returns {Promise<Object>} Canción creada
   */
  static async create(data) {
    try {
      console.log('Creando canción:', data);
      
      const response = await fetch(`${APIService.basePath}/create.php`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(data)
      });
      
      const result = await APIService.handleResponse(response);
      console.log('Canción creada exitosamente:', result);
      return result;
    } catch (error) {
      console.error('Error en create:', error);
      throw new Error(`Error al crear canción: ${error.message}`);
    }
  }

  /**
   * Actualiza una canción existente.
   * Llama a PUT api/songs/update.php?id={id}
   * @param {number|string} id
   * @param {Object} data { titulo, letra, acordes }
   * @returns {Promise<Object>} Canción actualizada
   */
  static async update(id, data) {
    try {
      console.log('Actualizando canción ID:', id, 'con datos:', data);
      
      const url = new URL(`${APIService.basePath}/update.php`, location);
      url.searchParams.set('id', id);
      
      const response = await fetch(url.toString(), {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(data)
      });
      
      const result = await APIService.handleResponse(response);
      console.log('Canción actualizada exitosamente:', result);
      return result;
    } catch (error) {
      console.error('Error en update:', error);
      throw new Error(`Error al actualizar canción ${id}: ${error.message}`);
    }
  }

  /**
   * Elimina una canción.
   * Llama a DELETE api/songs/delete.php?id={id}
   * @param {number|string} id
   * @returns {Promise<void>}
   */
  static async remove(id) {
    try {
      console.log('Eliminando canción ID:', id);
      
      const url = new URL(`${APIService.basePath}/delete.php`, location);
      url.searchParams.set('id', id);
      
      const response = await fetch(url.toString(), {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      await APIService.handleResponse(response);
      console.log('Canción eliminada exitosamente');
    } catch (error) {
      console.error('Error en remove:', error);
      throw new Error(`Error al eliminar canción ${id}: ${error.message}`);
    }
  }
}
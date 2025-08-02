// src/controllers/SongManager.js
import { Song } from '../models/songModel.js';
import { APIService } from '../services/apiService.js';
import { CacheService } from '../services/cacheService.js';
import { SyncService } from '../services/syncService.js';
import { ValidacionService } from '../services/validacionService.js';
import notificacionService from '../services/notificacionService.js';
import { appEvents } from '../core/EventSystem.js';

export class SongManager {
  constructor(appController) {
    this.app = appController;
    this.todasLasCanciones = [];
    this.cancionActual = null;
    this.subscriptions = [];
  }

  /**
   * Carga los datos iniciales
   */
  async loadInitialData() {
    const idCarga = notificacionService.cargando(
      'Cargando canciones',
      'Preparando la aplicación...'
    );

    try {
      await CacheService.inicializar();
      
      if (navigator.onLine) {
        await this.cargarDatosDesdeServidor();
      } else {
        await this.cargarDatosDesdeCache();
      }
      
      this.ordenarCanciones();
      
      notificacionService.cerrar(idCarga);
      notificacionService.exito(
        'Aplicación lista',
        `${this.todasLasCanciones.length} canciones cargadas`
      );

      appEvents.emit('songs:loaded', { 
        count: this.todasLasCanciones.length,
        source: navigator.onLine ? 'server' : 'cache'
      });
      
    } catch (error) {
      notificacionService.cerrar(idCarga);
      console.error('Error al cargar datos iniciales:', error);
      appEvents.emit('songs:load_error', { error });
      
      // Intentar cargar desde cache como fallback
      try {
        await this.cargarDatosDesdeCache();
        this.ordenarCanciones();
      } catch (fallbackError) {
        console.error('Error en fallback:', fallbackError);
      }
    }
  }

  /**
   * Obtiene todas las canciones
   */
  getAllSongs() {
    return this.todasLasCanciones;
  }

  /**
   * Obtiene una canción por ID
   */
  getSong(id) {
    return this.todasLasCanciones.find(c => String(c.id) === String(id));
  }

  /**
   * Crea una nueva canción
   */
  async create(datos) {
    const idCarga = notificacionService.cargando(
      'Guardando canción',
      'Procesando información...'
    );

    try {
      // Sanitizar y validar datos
      const datosSanitizados = ValidacionService.sanitizarDatos(datos);
      const validacion = ValidacionService.validarCancion(datosSanitizados);
      
      if (!validacion.esCompletamenteValido) {
        notificacionService.cerrar(idCarga);
        throw new Error('Datos de canción inválidos');
      }

      // Crear objeto canción
      const nuevaCancion = new Song({
        titulo: datosSanitizados.titulo,
        letra: datosSanitizados.letra,
        acordes: datosSanitizados.acordes,
        melodia: datosSanitizados.melodia,
        audios: datosSanitizados.audios,
        etiquetas: datosSanitizados.etiquetas,
        updated_at: new Date().toISOString()
      });

      let cancionGuardada;
      
      if (navigator.onLine) {
        try {
          const datosParaServidor = nuevaCancion.toJSON();
          delete datosParaServidor.id; // El servidor asignará el ID
          
          cancionGuardada = await APIService.create(datosParaServidor);
          await CacheService.saveSong(cancionGuardada);
        } catch (errorServidor) {
          console.warn('Error al guardar en servidor, guardando localmente:', errorServidor);
          cancionGuardada = await CacheService.saveSong(nuevaCancion.toPlainObject());
          await SyncService.queueOrSend({ type: 'save', data: cancionGuardada });
        }
      } else {
        cancionGuardada = await CacheService.saveSong(nuevaCancion.toPlainObject());
        await SyncService.queueOrSend({ type: 'save', data: cancionGuardada });
      }
      
      // Actualizar lista local
      this.todasLasCanciones.push(Song.fromJSON(cancionGuardada));
      this.ordenarCanciones();
      
      notificacionService.cerrar(idCarga);
      notificacionService.exito(
        'Canción creada',
        `"${cancionGuardada.titulo}" se guardó correctamente`
      );

      appEvents.emit('song:created', { song: cancionGuardada });
      return cancionGuardada;
      
    } catch (error) {
      notificacionService.cerrar(idCarga);
      console.error('Error completo al crear canción:', error);
      
      notificacionService.error(
        'Error al crear canción',
        error.message || 'No se pudo guardar la canción'
      );

      appEvents.emit('song:create_error', { error, datos });
      throw error;
    }
  }

  /**
   * Actualiza una canción existente
   */
  async update(id, datos) {
    const idCarga = notificacionService.cargando(
      'Actualizando canción',
      'Guardando cambios...'
    );

    try {
      // Sanitizar y validar datos
      const datosSanitizados = ValidacionService.sanitizarDatos(datos);
      const validacion = ValidacionService.validarCancion(datosSanitizados);
      
      if (!validacion.esCompletamenteValido) {
        notificacionService.cerrar(idCarga);
        throw new Error('Datos de canción inválidos');
      }
      
      // Crear objeto canción actualizada
      const cancionActualizada = new Song({
        id: id,
        titulo: datosSanitizados.titulo,
        letra: datosSanitizados.letra,
        acordes: datosSanitizados.acordes,
        melodia: datosSanitizados.melodia,
        audios: datosSanitizados.audios,
        etiquetas: datosSanitizados.etiquetas,
        updated_at: new Date().toISOString()
      });

      let cancionGuardada;
      
      if (navigator.onLine) {
        try {
          const datosParaServidor = cancionActualizada.toJSON();
          cancionGuardada = await APIService.update(id, datosParaServidor);
          await CacheService.saveSong(cancionGuardada);
        } catch (errorServidor) {
          console.warn('Error al actualizar en servidor, guardando localmente:', errorServidor);
          cancionGuardada = await CacheService.saveSong(cancionActualizada.toPlainObject());
          await SyncService.queueOrSend({ type: 'save', data: cancionGuardada });
        }
      } else {
        cancionGuardada = await CacheService.saveSong(cancionActualizada.toPlainObject());
        await SyncService.queueOrSend({ type: 'save', data: cancionGuardada });
      }
      
      // Actualizar lista local
      const indice = this.todasLasCanciones.findIndex(c => c.id === id);
      if (indice !== -1) {
        this.todasLasCanciones[indice] = Song.fromJSON(cancionGuardada);
      }
      
      this.ordenarCanciones();
      
      notificacionService.cerrar(idCarga);
      notificacionService.exito(
        'Canción actualizada',
        `Los cambios en "${cancionGuardada.titulo}" se guardaron correctamente`
      );

      appEvents.emit('song:updated', { song: cancionGuardada });
      return cancionGuardada;
      
    } catch (error) {
      notificacionService.cerrar(idCarga);
      console.error('Error al editar canción:', error);
      
      notificacionService.error(
        'Error al editar canción',
        error.message || 'No se pudieron guardar los cambios'
      );

      appEvents.emit('song:update_error', { error, id, datos });
      throw error;
    }
  }

  /**
   * Elimina una canción
   */
  async delete(id) {
    const cancion = this.getSong(id);
    if (!cancion) {
      throw new Error('Canción no encontrada');
    }

    const idCarga = notificacionService.cargando(
      'Eliminando canción',
      'Procesando solicitud...'
    );
    
    try {
      await CacheService.deleteSong(id);
      
      if (navigator.onLine) {
        try {
          await APIService.remove(id);
        } catch (errorServidor) {
          console.warn('Error al eliminar del servidor, encolando para sincronización:', errorServidor);
          await SyncService.queueOrSend({ 
            type: 'delete', 
            data: { id: id } 
          });
        }
      } else {
        await SyncService.queueOrSend({ 
          type: 'delete', 
          data: { id: id } 
        });
      }
      
      // Actualizar lista local
      this.todasLasCanciones = this.todasLasCanciones.filter(c => c.id !== id);
      
      const tituloEliminado = cancion.titulo;
      
      notificacionService.cerrar(idCarga);
      notificacionService.exito(
        'Canción eliminada',
        `"${tituloEliminado}" se eliminó correctamente`
      );

      appEvents.emit('song:deleted', { id, titulo: tituloEliminado });
      
    } catch (error) {
      notificacionService.cerrar(idCarga);
      console.error('Error al eliminar canción:', error);
      
      notificacionService.error(
        'Error al eliminar',
        'No se pudo eliminar la canción'
      );

      appEvents.emit('song:delete_error', { error, id });
      throw error;
    }
  }

  /**
   * Busca canciones por término
   */
  search(termino) {
    if (!termino || termino.trim() === '') {
      return this.todasLasCanciones;
    }
    
    const terminoLimpio = termino.toLowerCase().trim();
    
    return this.todasLasCanciones.filter(cancion =>
      cancion.titulo.toLowerCase().includes(terminoLimpio) ||
      cancion.letra.toLowerCase().includes(terminoLimpio) ||
      cancion.acordes.toLowerCase().includes(terminoLimpio) ||
      cancion.tags.some(tag => tag.toLowerCase().includes(terminoLimpio))
    );
  }

  /**
   * Filtra canciones por etiquetas
   */
  filterByTags(etiquetasSeleccionadas) {
    if (!etiquetasSeleccionadas || etiquetasSeleccionadas.size === 0) {
      return this.todasLasCanciones;
    }

    return this.todasLasCanciones.filter(cancion =>
      Array.from(etiquetasSeleccionadas).every(etiqueta =>
        cancion.tags.includes(etiqueta)
      )
    );
  }

  /**
   * Obtiene todas las etiquetas únicas
   */
  getAllTags() {
    const todasLasEtiquetas = Array.from(
      new Set(this.todasLasCanciones.flatMap(cancion => 
        Array.isArray(cancion.tags) ? cancion.tags : []
      ))
    );
    
    return todasLasEtiquetas.sort((a, b) => 
      a.localeCompare(b, 'es', { sensitivity: 'base' })
    );
  }

  /**
   * Establece la canción actual
   */
  setCurrentSong(id) {
    this.cancionActual = this.getSong(id);
    if (this.cancionActual) {
      appEvents.emit('song:selected', { song: this.cancionActual });
    }
    return this.cancionActual;
  }

  /**
   * Obtiene la canción actual
   */
  getCurrentSong() {
    return this.cancionActual;
  }

  // ======= MÉTODOS PRIVADOS =======

  async cargarDatosDesdeServidor() {
    try {
      const datos = await APIService.getAll();
      this.todasLasCanciones = datos.map(cancion => Song.fromJSON(cancion));
      
      // Guardar en cache para uso offline
      for (const cancion of this.todasLasCanciones) {
        await CacheService.saveSong(cancion.toPlainObject());
      }
    } catch (error) {
      console.error('Error al cargar desde servidor:', error);
      throw new Error('No se pudieron cargar los datos del servidor');
    }
  }

  async cargarDatosDesdeCache() {
    try {
      const datosCacheados = await CacheService.getAllSongs();
      this.todasLasCanciones = datosCacheados.map(cancion => Song.fromJSON(cancion));
    } catch (error) {
      console.error('Error al cargar desde cache:', error);
      this.todasLasCanciones = [];
    }
  }

  ordenarCanciones() {
    this.todasLasCanciones.sort((a, b) =>
      a.titulo.localeCompare(b.titulo, 'es', { sensitivity: 'base' })
    );
  }

  destroy() {
    this.subscriptions.forEach(unsub => unsub());
    this.subscriptions = [];
    this.todasLasCanciones = [];
    this.cancionActual = null;
  }
}
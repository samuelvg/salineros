// src/controllers/SongManager.js

// Importación de modelos y servicios necesarios
import { Song } from '../models/songModel.js';
import { APIService } from '../services/apiService.js';
import { CacheService } from '../services/cacheService.js';
import { SyncService } from '../services/syncService.js';
import { ValidacionService } from '../services/validacionService.js';
import notificacionService from '../services/notificacionService.js';
import { appEvents } from '../core/EventSystem.js';

// Clase SongManager: gestiona canciones en la aplicación
export class SongManager {
  constructor(appController) {
    this.app = appController; // Referencia al controlador principal
    this.todasLasCanciones = []; // Lista de canciones en memoria
    this.cancionActual = null; // Canción actualmente seleccionada
    this.subscriptions = []; // Suscripciones a eventos
  }

  /**
   * Carga los datos al iniciar la aplicación
   */
  async loadInitialData() {
    const idCarga = notificacionService.cargando(
      'Cargando canciones',
      'Preparando la aplicación...'
    );

    try {
      await CacheService.inicializar();
      
      // Si hay conexión, cargar desde el servidor; si no, desde caché
      if (navigator.onLine) {
        await this.cargarDatosDesdeServidor();
      } else {
        await this.cargarDatosDesdeCache();
      }

      // Ordena alfabéticamente las canciones
      this.ordenarCanciones();

      notificacionService.cerrar(idCarga);
      notificacionService.exito(
        'Aplicación lista',
        `${this.todasLasCanciones.length} canciones cargadas`
      );

      // Emite evento indicando que las canciones fueron cargadas
      appEvents.emit('songs:loaded', { 
        count: this.todasLasCanciones.length,
        source: navigator.onLine ? 'server' : 'cache'
      });

    } catch (error) {
      notificacionService.cerrar(idCarga);
      console.error('Error al cargar datos iniciales:', error);
      appEvents.emit('songs:load_error', { error });

      // Intenta recuperar datos desde la caché si falla todo
      try {
        await this.cargarDatosDesdeCache();
        this.ordenarCanciones();
      } catch (fallbackError) {
        console.error('Error en fallback:', fallbackError);
      }
    }
  }

  // Devuelve todas las canciones en memoria
  getAllSongs() {
    return this.todasLasCanciones;
  }

  // Busca una canción por su ID
  getSong(id) {
    return this.todasLasCanciones.find(c => String(c.id) === String(id));
  }

  // Crea y guarda una nueva canción
  async create(datos) {
    const idCarga = notificacionService.cargando('Guardando canción', 'Procesando información...');

    try {
      // Limpia y valida los datos
      const datosSanitizados = ValidacionService.sanitizarDatos(datos);
      const validacion = ValidacionService.validarCancion(datosSanitizados);

      if (!validacion.esCompletamenteValido) {
        notificacionService.cerrar(idCarga);
        throw new Error('Datos de canción inválidos');
      }

      // Construye una instancia de Song con los datos
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

      // Guardado online o en caché según conexión
      if (navigator.onLine) {
        try {
          const datosParaServidor = nuevaCancion.toJSON();
          delete datosParaServidor.id; // El servidor genera el ID

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

      // Agrega la canción a la lista local y ordena
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

  // Actualiza los datos de una canción existente
  async update(id, datos) {
    const idCarga = notificacionService.cargando(
      'Actualizando canción',
      'Guardando cambios...'
    );

    try {
      const datosSanitizados = ValidacionService.sanitizarDatos(datos);
      const validacion = ValidacionService.validarCancion(datosSanitizados);

      if (!validacion.esCompletamenteValido) {
        notificacionService.cerrar(idCarga);
        throw new Error('Datos de canción inválidos');
      }

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
          cancionGuardada = await APIService.update(datosParaServidor);
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

      // Reemplaza la canción en la lista local
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

  // Elimina una canción por ID
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

      this.todasLasCanciones = this.todasLasCanciones.filter(c => c.id !== id);

      notificacionService.cerrar(idCarga);
      notificacionService.exito(
        'Canción eliminada',
        `"${cancion.titulo}" se eliminó correctamente`
      );

      appEvents.emit('song:deleted', { id, titulo: cancion.titulo });

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

  // Busca canciones según un término (en título, letra, acordes o etiquetas)
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

  // Filtra canciones por un conjunto de etiquetas
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

  // Devuelve una lista con todas las etiquetas únicas
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

  // Establece la canción seleccionada actualmente
  setCurrentSong(id) {
    this.cancionActual = this.getSong(id);
    if (this.cancionActual) {
      appEvents.emit('song:selected', { song: this.cancionActual });
    }
    return this.cancionActual;
  }

  // Devuelve la canción actualmente seleccionada
  getCurrentSong() {
    return this.cancionActual;
  }

  // ======= MÉTODOS PRIVADOS =======

  // Carga canciones desde el servidor y las guarda en caché
  async cargarDatosDesdeServidor() {
    try {
      const datos = await APIService.getAll();
      this.todasLasCanciones = datos.map(cancion => Song.fromJSON(cancion));

      for (const cancion of this.todasLasCanciones) {
        await CacheService.saveSong(cancion.toPlainObject());
      }
    } catch (error) {
      console.error('Error al cargar desde servidor:', error);
      throw new Error('No se pudieron cargar los datos del servidor');
    }
  }

  // Carga canciones desde la caché local
  async cargarDatosDesdeCache() {
    try {
      const datosCacheados = await CacheService.getAllSongs();
      this.todasLasCanciones = datosCacheados.map(cancion => Song.fromJSON(cancion));
    } catch (error) {
      console.error('Error al cargar desde cache:', error);
      this.todasLasCanciones = [];
    }
  }

  // Ordena alfabéticamente las canciones por título
  ordenarCanciones() {
    this.todasLasCanciones.sort((a, b) =>
      a.titulo.localeCompare(b.titulo, 'es', { sensitivity: 'base' })
    );
  }

  // Limpia las suscripciones y datos almacenados
  destroy() {
    this.subscriptions.forEach(unsub => unsub());
    this.subscriptions = [];
    this.todasLasCanciones = [];
    this.cancionActual = null;
  }
}

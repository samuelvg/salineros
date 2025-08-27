// src/controllers/AppController.js
import { SongManager } from './SongManager.js';
import { UIManager } from './UIManager.js';
import { SyncManager } from './SyncManager.js';
import { appEvents } from '../core/EventSystem.js';
import notificacionService from '../services/notificacionService.js';

/**
 * Controlador principal de la aplicación
 * Coordina todos los managers y la lógica de negocio
 */
export class AppController {
  constructor(config) {
    this.config = config;
    this.subscriptions = [];
    this.isInitialized = false;
    
    // Crear managers especializados
    this.songManager = new SongManager(this);
    this.uiManager = new UIManager(this);
    this.syncManager = new SyncManager(this);
    
    // Inicializar
    this.init();
  }

  /**
   * Inicialización principal
   */
  async init() {
    try {
      appEvents.emit('app:init');
      
      // 1. Crear interfaz de usuario
      await this.uiManager.createInterface();
      
      // 2. Cargar datos iniciales
      await this.songManager.loadInitialData();
      
      // 3. Inicializar sincronización
      await this.syncManager.initialize();
      
      // 4. Configurar eventos
      this.setupEventListeners();
      
      // 5. Actualizar UI inicial
      this.uiManager.updateSongList();
      
      // 6. Configurar conectividad
      this.setupConnectivityHandling();
      
      this.isInitialized = true;
      appEvents.emit('app:ready');
      
      console.log('🎵 AppController inicializado correctamente');
      
    } catch (error) {
      console.error('Error al inicializar AppController:', error);
      appEvents.emit('app:init_error', { error });
      throw error;
    }
  }

  /**
   * Configura todos los event listeners
   */
  setupEventListeners() {
    // Eventos de canciones
    this.subscriptions.push(
      appEvents.on('song:created', ({ song }) => {
        this.uiManager.updateSongList();
      }),
      
      appEvents.on('song:updated', ({ song }) => {
        this.uiManager.updateSongList();
      }),
      
      appEvents.on('song:deleted', ({ id }) => {
        this.uiManager.updateSongList();
      })
    );

    // Eventos de sincronización
    this.subscriptions.push(
      appEvents.on('sync:complete', ({ stats }) => {
        this.uiManager.updateSongList();
      }),
      
      appEvents.on('sync:conflict', ({ conflicts }) => {
        this.handleSyncConflicts(conflicts);
      })
    );

    // Eventos de UI
    this.subscriptions.push(
      appEvents.on('ui:shortcut', ({ action }) => {
        this.handleKeyboardShortcut(action);
      })
    );

    // Eventos de conectividad
    this.subscriptions.push(
      appEvents.on('connectivity:online', () => {
        this.handleConnectivityChange(true);
      }),
      
      appEvents.on('connectivity:offline', () => {
        this.handleConnectivityChange(false);
      })
    );
  }

  /**
   * Maneja los atajos de teclado
   */
  handleKeyboardShortcut(action) {
    switch (action) {
      case 'new_song':
        this.uiManager.mostrarFormularioNuevaCancion();
        break;
        
      case 'escape':
        // Cerrar cualquier modal o formulario abierto
        this.uiManager.cerrarModal();
        this.uiManager.cerrarFormulario();
        break;
        
      case 'search':
        // Enfocar campo de búsqueda si existe
        const filtroContainer = document.getElementById('filter-container');
        if (filtroContainer && filtroContainer.children.length > 0) {
          filtroContainer.children[0].focus();
        }
        break;
    }
  }

  /**
   * Maneja cambios en la conectividad
   */
  async handleConnectivityChange(isOnline) {
    if (isOnline) {
      const idNotificacion = notificacionService.informacion(
        'Conectado',
        'Sincronizando datos...'
      );
      
      try {
        await this.syncManager.syncOnReconnect();
        
        notificacionService.cerrar(idNotificacion);
        notificacionService.exito(
          'Sincronización completa',
          'Todos los datos están actualizados'
        );
      } catch (error) {
        console.error('Error al sincronizar tras reconexión:', error);
        notificacionService.cerrar(idNotificacion);
        notificacionService.advertencia(
          'Sincronización parcial',
          'Algunos datos pueden no estar actualizados'
        );
      }
    } else {
      notificacionService.advertencia(
        'Sin conexión',
        'Trabajando en modo offline'
      );
    }
  }

  /**
   * Maneja conflictos de sincronización
   */
  handleSyncConflicts(conflicts) {
    console.warn('Conflictos de sincronización detectados:', conflicts);
    
    notificacionService.mostrar({
      tipo: 'advertencia',
      titulo: 'Conflictos de sincronización',
      mensaje: `Se detectaron ${conflicts.length} conflicto(s). Se resolverán automáticamente.`,
      duracion: 6000,
      acciones: [
        {
          texto: 'Ver detalles',
          callback: () => {
            console.log('Detalles de conflictos:', conflicts);
            // Aquí se podría mostrar un modal con los detalles
          }
        }
      ]
    });
  }

  /**
   * Configura el manejo de conectividad específico
   */
  setupConnectivityHandling() {
    // Detectar estado inicial
    if (navigator.onLine) {
      console.log('🌐 Aplicación iniciada con conexión');
    } else {
      console.log('📴 Aplicación iniciada sin conexión');
      notificacionService.informacion(
        'Modo offline',
        'Los cambios se sincronizarán cuando haya conexión'
      );
    }
  }

  /**
   * Obtiene estadísticas de la aplicación
   */
  getStats() {
    const canciones = this.songManager.getAllSongs();
    const tags = this.songManager.getAllTags();
    
    const cancionesConAcordes = canciones.filter(c => c.acordes && c.acordes.trim()).length;
    const cancionesConMelodia = canciones.filter(c => c.melodia && c.melodia.trim()).length;
    const cancionesConAudios = canciones.filter(c => c.audios && c.audios.trim()).length;
    
    return {
      totalCanciones: canciones.length,
      totalEtiquetas: tags.length,
      cancionesConAcordes,
      cancionesConMelodia,
      cancionesConAudios,
      porcentajeCompletas: Math.round((cancionesConAcordes / canciones.length) * 100) || 0,
      ultimaSync: this.syncManager.getLastSyncTime(),
      isOnline: navigator.onLine,
      version: this.config.version || '1.0.0'
    };
  }

  /**
   * Exporta todas las canciones
   */
  async exportData() {
    try {
      const canciones = this.songManager.getAllSongs();
      const stats = this.getStats();
      
      const datosExportacion = {
        version: '1.0',
        fechaExportacion: new Date().toISOString(),
        estadisticas: stats,
        canciones: canciones.map(cancion => cancion.toJSON())
      };
      
      const blob = new Blob([JSON.stringify(datosExportacion, null, 2)], {
        type: 'application/json'
      });
      
      const url = URL.createObjectURL(blob);
      const enlace = document.createElement('a');
      enlace.href = url;
      enlace.download = `salineros-canciones-${new Date().toISOString().split('T')[0]}.json`;
      enlace.click();
      
      URL.revokeObjectURL(url);
      
      notificacionService.exito(
        'Exportación completa',
        `${canciones.length} canciones exportadas`
      );
      
      appEvents.emit('data:exported', { count: canciones.length });
      
    } catch (error) {
      console.error('Error al exportar:', error);
      notificacionService.error(
        'Error de exportación',
        'No se pudieron exportar las canciones'
      );
      
      appEvents.emit('data:export_error', { error });
    }
  }

  /**
   * Importa datos desde un archivo
   */
  async importData(file) {
    try {
      const text = await file.text();
      const datos = JSON.parse(text);
      
      if (!datos.canciones || !Array.isArray(datos.canciones)) {
        throw new Error('Formato de archivo inválido');
      }
      
      const importadas = [];
      
      for (const cancionData of datos.canciones) {
        try {
          const cancion = await this.songManager.create(cancionData);
          importadas.push(cancion);
        } catch (error) {
          console.warn('Error al importar canción:', cancionData.titulo, error);
        }
      }
      
      notificacionService.exito(
        'Importación completa',
        `${importadas.length} de ${datos.canciones.length} canciones importadas`
      );
      
      appEvents.emit('data:imported', { 
        imported: importadas.length, 
        total: datos.canciones.length 
      });
      
    } catch (error) {
      console.error('Error al importar:', error);
      notificacionService.error(
        'Error de importación',
        'No se pudieron importar las canciones'
      );
      
      appEvents.emit('data:import_error', { error });
    }
  }

  /**
   * Reinicia la aplicación
   */
  async restart() {
    try {
      console.log('🔄 Reiniciando aplicación...');
      
      await this.destroy();
      await this.init();
      
      notificacionService.exito(
        'Aplicación reiniciada',
        'Todos los componentes se han reinicializado'
      );
      
      appEvents.emit('app:restarted');
      
    } catch (error) {
      console.error('Error al reiniciar aplicación:', error);
      notificacionService.error(
        'Error al reiniciar',
        'Será necesario recargar la página manualmente'
      );
    }
  }

  /**
   * Búsqueda global de canciones
   */
  searchSongs(termino) {
    const resultados = this.songManager.search(termino);
    
    // Actualizar UI con resultados de búsqueda
    this.uiManager.updateSongList();
    
    appEvents.emit('search:performed', { 
      query: termino, 
      results: resultados.length 
    });
    
    return resultados;
  }

  /**
   * Obtiene configuración actual
   */
  getConfig() {
    return { ...this.config };
  }

  /**
   * Actualiza configuración
   */
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    
    // Aplicar cambios de configuración a los managers
    this.syncManager.updateConfig(this.config.sync);
    
    appEvents.emit('config:updated', { config: this.config });
  }

  /**
   * Verifica el estado de la aplicación
   */
  healthCheck() {
    const health = {
      timestamp: new Date().toISOString(),
      isInitialized: this.isInitialized,
      isOnline: navigator.onLine,
      songManager: this.songManager ? 'OK' : 'ERROR',
      uiManager: this.uiManager ? 'OK' : 'ERROR',
      syncManager: this.syncManager ? 'OK' : 'ERROR',
      songsCount: this.songManager?.getAllSongs().length || 0,
      lastSync: this.syncManager?.getLastSyncTime() || null,
      errors: []
    };
    
    // Verificar integridad de datos
    try {
      const canciones = this.songManager.getAllSongs();
      const cancionesInvalidas = canciones.filter(c => !c.titulo || !c.letra);
      if (cancionesInvalidas.length > 0) {
        health.errors.push(`${cancionesInvalidas.length} canciones con datos incompletos`);
      }
    } catch (error) {
      health.errors.push('Error al verificar datos de canciones');
    }
    
    // Verificar estado de la UI
    try {
      const elementos = ['song-modal', 'form-container', 'btn-add-song'];
      elementos.forEach(id => {
        if (!document.getElementById(id)) {
          health.errors.push(`Elemento UI faltante: ${id}`);
        }
      });
    } catch (error) {
      health.errors.push('Error al verificar elementos UI');
    }
    
    health.status = health.errors.length === 0 ? 'HEALTHY' : 'WARNING';
    
    return health;
  }

  /**
   * Limpieza y destrucción
   */
  async destroy() {
    console.log('🧹 Destruyendo AppController...');
    
    try {
      // Limpiar subscripciones de eventos
      this.subscriptions.forEach(unsub => unsub());
      this.subscriptions = [];
      
      // Destruir managers
      if (this.syncManager) {
        await this.syncManager.destroy();
        this.syncManager = null;
      }
      
      if (this.uiManager) {
        this.uiManager.destroy();
        this.uiManager = null;
      }
      
      if (this.songManager) {
        this.songManager.destroy();
        this.songManager = null;
      }
      
      // Limpiar estado
      this.isInitialized = false;
      this.config = null;
      
      appEvents.emit('app:destroyed');
      
      console.log('✅ AppController destruido correctamente');
      
    } catch (error) {
      console.error('Error al destruir AppController:', error);
      throw error;
    }
  }
}

// === MODO ADMINISTRADOR ===

(function () {
  const encodedPass = "c2FsaW5lcm9zMjAyNQ=="; // 'salineros2025' codificada en base64

  const isAdmin = localStorage.getItem("modoAdmin") === "true";

  function activarModoAdmin() {
    document.querySelectorAll(".admin-only").forEach(el => {
      el.style.display = "inline-block";
    });
    localStorage.setItem("modoAdmin", "true");
  }

  if (isAdmin) activarModoAdmin();

  const toggleBtn = document.getElementById("admin-toggle");
  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      const pass = prompt("Introduce la contraseña de administrador:");
      const decoded = atob(encodedPass);
      if (pass === decoded) {
        activarModoAdmin();
      } else {
        alert("Contraseña incorrecta");
      }
    });
  }
})();
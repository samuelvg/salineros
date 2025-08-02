// src/controllers/SyncManager.js
import { APIService } from '../services/apiService.js';
import { CacheService } from '../services/cacheService.js';
import { SyncService } from '../services/syncService.js';
import { appEvents } from '../core/EventSystem.js';
import { Song } from '../models/songModel.js';

export class SyncManager {
  constructor(appController) {
    this.app = appController;
    this.syncInterval = null;
    this.isInitialized = false;
    this.syncInProgress = false;
    this.lastSyncTime = null;
    this.retryCount = 0;
    this.maxRetries = 3;
    this.subscriptions = [];
    
    this.estadoSincronizacion = {
      enProgreso: false,
      ultimaSync: null,
      intentosReconexion: 0,
      maxIntentosReconexion: 3
    };
  }

  /**
   * Inicializa el manager de sincronización
   */
  async initialize() {
    try {
      // Configurar sincronización automática
      this.setupAutoSync();
      
      // Configurar eventos
      this.setupEventListeners();
      
      // Procesar cola offline si hay conexión
      if (navigator.onLine) {
        await this.processOfflineQueue();
      }
      
      this.isInitialized = true;
      console.log('🔄 SyncManager inicializado');
      
    } catch (error) {
      console.error('Error al inicializar SyncManager:', error);
      throw error;
    }
  }

  /**
   * Configura la sincronización automática
   */
  setupAutoSync() {
    const syncInterval = this.app.config.sync?.interval || 5 * 60 * 1000; // 5 minutos
    
    this.syncInterval = setInterval(() => {
      if (navigator.onLine && !this.syncInProgress) {
        this.performAutoSync();
      }
    }, syncInterval);
  }

  /**
   * Configura event listeners
   */
  setupEventListeners() {
    this.subscriptions.push(
      appEvents.on('connectivity:online', () => {
        this.handleReconnection();
      }),
      
      appEvents.on('song:created', ({ song }) => {
        // La canción ya se procesó en SongManager, aquí solo monitoreamos
      }),
      
      appEvents.on('song:updated', ({ song }) => {
        // La canción ya se procesó en SongManager, aquí solo monitoreamos
      }),
      
      appEvents.on('song:deleted', ({ id }) => {
        // La canción ya se procesó en SongManager, aquí solo monitoreamos
      })
    );
  }

  /**
   * Sincronización automática en segundo plano
   */
  async performAutoSync() {
    if (this.syncInProgress || !navigator.onLine) {
      return;
    }

    try {
      await this.syncWithServer();
    } catch (error) {
      console.warn('Error en sincronización automática:', error);
      // No mostrar notificación para sync automática fallida
    }
  }

  /**
   * Sincronización manual o tras reconexión
   */
  async syncOnReconnect() {
    if (this.syncInProgress) {
      return;
    }

    try {
      await this.processOfflineQueue();
      await this.syncWithServer();
      this.retryCount = 0; // Reset retry count on successful sync
    } catch (error) {
      console.error('Error en sincronización tras reconexión:', error);
      throw error;
    }
  }

  /**
   * Sincronización principal con el servidor
   */
  async syncWithServer() {
    if (this.syncInProgress || !navigator.onLine) {
      return;
    }

    this.syncInProgress = true;
    this.estadoSincronizacion.enProgreso = true;
    
    try {
      appEvents.emit('sync:start');
      window.dispatchEvent(new Event('sync:start'));
      
      // Obtener timestamp de última sincronización
      const ultimaSync = await CacheService.getUltimaSync();
      
      // Obtener cambios desde el servidor
      const cambios = await APIService.fetchUpdates(ultimaSync);
      
      if (cambios && (cambios.creadas?.length || cambios.modificadas?.length || cambios.eliminadas?.length)) {
        // Aplicar cambios localmente
        await SyncService.aplicarCambios(cambios);
        
        // Actualizar lista de canciones en memoria
        await this.updateInMemorySongs();
        
        console.log('Sincronización completada:', {
          creadas: cambios.creadas?.length || 0,
          modificadas: cambios.modificadas?.length || 0,
          eliminadas: cambios.eliminadas?.length || 0
        });
      }
      
      // Actualizar timestamp de última sincronización
      const ahora = new Date();
      await CacheService.setUltimaSync(ahora.toISOString());
      this.lastSyncTime = ahora;
      this.estadoSincronizacion.ultimaSync = ahora;
      
      appEvents.emit('sync:complete', { 
        stats: cambios,
        timestamp: ahora
      });
      
      window.dispatchEvent(new CustomEvent('sync:end', { detail: ahora }));
      
    } catch (error) {
      console.error('Error en sincronización:', error);
      
      this.estadoSincronizacion.intentosReconexion++;
      this.retryCount++;
      
      if (this.retryCount <= this.maxRetries) {
        // Reintentar después de un delay progresivo
        const delay = 5000 * Math.pow(2, this.retryCount - 1);
        setTimeout(() => {
          if (navigator.onLine) {
            this.syncWithServer();
          }
        }, delay);
      }
      
      appEvents.emit('sync:error', { error, retryCount: this.retryCount });
      throw error;
      
    } finally {
      this.syncInProgress = false;
      this.estadoSincronizacion.enProgreso = false;
    }
  }

  /**
   * Procesa la cola de operaciones offline
   */
  async processOfflineQueue() {
    try {
      await SyncService.sincronizarOutbox();
      console.log('Cola offline procesada');
    } catch (error) {
      console.error('Error al procesar cola offline:', error);
      throw error;
    }
  }

  /**
   * Actualiza las canciones en memoria tras sincronización
   */
  async updateInMemorySongs() {
    try {
      // Recargar todas las canciones desde cache actualizada
      const datosCacheados = await CacheService.getAllSongs();
      const cancionesActualizadas = datosCacheados.map(cancion => Song.fromJSON(cancion));
      
      // Actualizar en SongManager
      this.app.songManager.todasLasCanciones = cancionesActualizadas;
      this.app.songManager.ordenarCanciones();
      
    } catch (error) {
      console.error('Error al actualizar canciones en memoria:', error);
    }
  }

  /**
   * Maneja la reconexión
   */
  async handleReconnection() {
    console.log('🌐 Reconexión detectada, iniciando sincronización...');
    
    try {
      await this.syncOnReconnect();
      this.estadoSincronizacion.intentosReconexion = 0;
    } catch (error) {
      console.error('Error durante reconexión:', error);
    }
  }

  /**
   * Obtiene el estado actual de sincronización
   */
  getSyncStatus() {
    return {
      isInitialized: this.isInitialized,
      syncInProgress: this.syncInProgress,
      lastSyncTime: this.lastSyncTime,
      retryCount: this.retryCount,
      maxRetries: this.maxRetries,
      isOnline: navigator.onLine,
      hasAutoSync: !!this.syncInterval
    };
  }

  /**
   * Obtiene el tiempo de última sincronización
   */
  getLastSyncTime() {
    return this.lastSyncTime;
  }

  /**
   * Fuerza una sincronización manual
   */
  async forcSync() {
    if (!navigator.onLine) {
      throw new Error('No hay conexión disponible para sincronizar');
    }

    console.log('🔄 Forzando sincronización manual...');
    
    try {
      await this.syncWithServer();
      
      appEvents.emit('sync:manual_complete');
      
      return {
        success: true,
        timestamp: this.lastSyncTime
      };
      
    } catch (error) {
      appEvents.emit('sync:manual_error', { error });
      throw error;
    }
  }

  /**
   * Pausa la sincronización automática
   */
  pauseAutoSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
      console.log('⏸️ Sincronización automática pausada');
      
      appEvents.emit('sync:auto_paused');
    }
  }

  /**
   * Reanuda la sincronización automática
   */
  resumeAutoSync() {
    if (!this.syncInterval) {
      this.setupAutoSync();
      console.log('▶️ Sincronización automática reanudada');
      
      appEvents.emit('sync:auto_resumed');
    }
  }

  /**
   * Actualiza la configuración de sincronización
   */
  updateConfig(syncConfig) {
    console.log('⚙️ Actualizando configuración de sincronización');
    
    // Reiniciar sincronización automática con nuevo intervalo
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
    
    if (syncConfig.interval) {
      this.setupAutoSync();
    }
    
    // Actualizar límites de reintentos
    if (syncConfig.maxRetries) {
      this.maxRetries = syncConfig.maxRetries;
    }
    
    appEvents.emit('sync:config_updated', { config: syncConfig });
  }

  /**
   * Obtiene estadísticas de sincronización
   */
  getStats() {
    return {
      lastSyncTime: this.lastSyncTime,
      syncInProgress: this.syncInProgress,
      retryCount: this.retryCount,
      totalSyncs: this.totalSyncs || 0,
      successfulSyncs: this.successfulSyncs || 0,
      failedSyncs: this.failedSyncs || 0,
      averageSyncTime: this.averageSyncTime || 0
    };
  }

  /**
   * Limpia todos los datos de sincronización
   */
  async clearSyncData() {
    try {
      await CacheService.setUltimaSync(null);
      this.lastSyncTime = null;
      this.retryCount = 0;
      
      console.log('🧹 Datos de sincronización limpiados');
      appEvents.emit('sync:data_cleared');
      
    } catch (error) {
      console.error('Error al limpiar datos de sincronización:', error);
      throw error;
    }
  }

  /**
   * Destruye el SyncManager
   */
  async destroy() {
    console.log('🧹 Destruyendo SyncManager...');
    
    try {
      // Limpiar intervalo de sincronización
      if (this.syncInterval) {
        clearInterval(this.syncInterval);
        this.syncInterval = null;
      }
      
      // Limpiar subscripciones
      this.subscriptions.forEach(unsub => unsub());
      this.subscriptions = [];
      
      // Resetear estado
      this.isInitialized = false;
      this.syncInProgress = false;
      this.lastSyncTime = null;
      this.retryCount = 0;
      
      appEvents.emit('sync:destroyed');
      
      console.log('✅ SyncManager destruido correctamente');
      
    } catch (error) {
      console.error('Error al destruir SyncManager:', error);
      throw error;
    }
  }
}
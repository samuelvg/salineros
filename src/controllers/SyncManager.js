// src/controllers/SyncManager.js
import { APIService } from '../services/apiService.js';
import { CacheService } from '../services/cacheService.js';
import { SyncService } from '../services/syncService.js';
import { appEvents } from '../core/EventSystem.js';
import { Song } from '../models/songModel.js';

export class SyncManager {
  constructor(appController) {
    this.app = appController;

    // Timers/estado
    this.syncInterval = null;
    this._autoSyncPauseTimer = null;
    this._autoSyncPausedUntil = 0;

    // Estado de ejecución
    this.isInitialized = false;
    this.syncInProgress = false;
    this.lastSyncTime = null;

    // Reintentos/backoff
    this.retryCount = 0;
    this.maxRetries = 3;

    // Métricas simples
    this.totalSyncs = 0;
    this.successfulSyncs = 0;
    this.failedSyncs = 0;
    this.averageSyncTime = 0;

    // Suscripciones a eventos
    this.subscriptions = [];

    // Estado público
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
    // Limpia intervalos previos si los hubiera
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }

    const syncInterval = this.app?.config?.sync?.interval || 5 * 60 * 1000; // 5 minutos

    this.syncInterval = setInterval(() => {
      // Si está pausado por backoff (p.ej. 403), no intentamos
      if (Date.now() < this._autoSyncPausedUntil) return;

      if (navigator.onLine && !this.syncInProgress) {
        // Capturamos cualquier error para evitar "unhandledrejection"
        this.performAutoSync().catch((err) => {
          console.warn('performAutoSync() error capturado:', err);
        });
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

      appEvents.on('song:created', (_payload) => {
        // La canción ya se procesó en SongManager; aquí solo podríamos disparar un sync suave
      }),

      appEvents.on('song:updated', (_payload) => {
        // Ídem
      }),

      appEvents.on('song:deleted', (_payload) => {
        // Ídem
      })
    );
  }

  /**
   * Sincronización automática en segundo plano
   */
  async performAutoSync() {
    if (this.syncInProgress || !navigator.onLine) return;
    if (Date.now() < this._autoSyncPausedUntil) return;

    try {
      await this.syncWithServer();
    } catch (error) {
      console.warn('Error en sincronización automática:', error);
      // No mostramos notificación aquí; ya se gestiona en syncWithServer()
    }
  }

  /**
   * Sincronización manual o tras reconexión
   */
  async syncOnReconnect() {
    if (this.syncInProgress) return;

    try {
      await this.processOfflineQueue();
      await this.syncWithServer();
      this.retryCount = 0; // Reset al sincronizar bien
    } catch (error) {
      console.error('Error en sincronización tras reconexión:', error);
      throw error;
    }
  }

  /**
   * Sincronización principal con el servidor
   */
  async syncWithServer() {
    if (this.syncInProgress || !navigator.onLine) return;

    // Si está pausado por backoff, no intentamos
    if (Date.now() < this._autoSyncPausedUntil) return;

    const t0 = performance.now();
    this.syncInProgress = true;
    this.estadoSincronizacion.enProgreso = true;

    try {
      appEvents.emit('sync:start');
      window.dispatchEvent(new Event('sync:start'));

      // Obtener timestamp de última sincronización
      const ultimaSync = await CacheService.getUltimaSync();

      // ⚠️ Parche: si ultimaSync es nulo/vacío, usa un valor por defecto válido.
      // Esto evita llamadas del tipo ?since= (vacío) que algunos servidores bloquean (403).
      const sinceSeguro =
        (ultimaSync != null && String(ultimaSync).trim() !== '')
          ? ultimaSync
          : '1970-01-01T00:00:00Z';

      // Obtener cambios desde el servidor
      const cambios = await APIService.fetchUpdates(sinceSeguro);

      // Aplicar cambios si los hay
      const hayCambios = Boolean(
        cambios && (
          (Array.isArray(cambios.creadas) && cambios.creadas.length) ||
          (Array.isArray(cambios.modificadas) && cambios.modificadas.length) ||
          (Array.isArray(cambios.eliminadas) && cambios.eliminadas.length)
        )
      );

      if (hayCambios) {
        await SyncService.aplicarCambios(cambios);

        // Actualizar lista de canciones en memoria
        await this.updateInMemorySongs();

        console.log('Sincronización completada:', {
          creadas: cambios.creadas?.length || 0,
          modificadas: cambios.modificadas?.length || 0,
          eliminadas: cambios.eliminadas?.length || 0
        });
      }

      // Actualizar marcador de última sincronización
      const ahora = new Date();
      // Si el backend devuelve un marcador (p.ej. cambios.lastSince), úsalo; si no, ISO local.
      const nuevoMarcador = cambios?.lastSince || ahora.toISOString();

      await CacheService.setUltimaSync(nuevoMarcador);
      this.lastSyncTime = ahora;
      this.estadoSincronizacion.ultimaSync = ahora;

      // Métricas
      const dt = performance.now() - t0;
      this.totalSyncs += 1;
      this.successfulSyncs += 1;
      // Media móvil simple
      this.averageSyncTime = this.averageSyncTime === 0
        ? dt
        : (this.averageSyncTime * 0.8 + dt * 0.2);

      appEvents.emit('sync:complete', {
        stats: cambios,
        timestamp: ahora
      });

      window.dispatchEvent(new CustomEvent('sync:end', { detail: ahora }));

      // Reset de reintentos al sincronizar con éxito
      this.retryCount = 0;
      this.estadoSincronizacion.intentosReconexion = 0;

    } catch (error) {
      console.error('Error en sincronización:', error);

      // Métricas
      this.totalSyncs += 1;
      this.failedSyncs += 1;

      this.estadoSincronizacion.intentosReconexion++;
      this.retryCount++;

      // Detección heurística de 403 (mientras no podamos leer status del APIService)
      const msg = (error && (error.message || error.body || String(error))) || '';
      const es403 = (error && error.status === 403) ||
                    /403\s*Forbidden/i.test(msg);

      if (es403) {
        // Pausa la autosync 5 minutos para no spamear el servidor
        this._pauseAutoSync(5 * 60 * 1000);
        console.warn('⛔️ 403 detectado. Autosync pausada 5 minutos.');
      } else if (this.retryCount <= this.maxRetries) {
        // Reintento con backoff exponencial (5s, 10s, 20s)
        const delay = 5000 * Math.pow(2, this.retryCount - 1);
        setTimeout(() => {
          if (navigator.onLine) {
            // Capturamos para evitar "unhandledrejection"
            this.syncWithServer().catch((e) => {
              console.warn('Reintento de sync fallido:', e);
            });
          }
        }, delay);
      }

      appEvents.emit('sync:error', { error, retryCount: this.retryCount });
      // Importante: no relanzamos el error aquí hacia arriba si viene de autosync,
      // pero sí lo dejamos salir si quien llama quiere capturarlo. Mantenemos el throw:
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
      hasAutoSync: !!this.syncInterval,
      autoSyncPausedUntil: this._autoSyncPausedUntil
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
   * Pausa la sincronización automática explícitamente
   */
  pauseAutoSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
    console.log('⏸️ Sincronización automática pausada');
    appEvents.emit('sync:auto_paused');
  }

  /**
   * Reanuda la sincronización automática explícitamente
   */
  resumeAutoSync() {
    if (!this.syncInterval) {
      this.setupAutoSync();
      console.log('▶️ Sincronización automática reanudada');
      appEvents.emit('sync:auto_resumed');
    }
  }

  /**
   * Pausa temporalmente la autosync (backoff programático)
   * @param {number} ms - milisegundos de pausa
   */
  _pauseAutoSync(ms) {
    // Momento hasta el que está pausado
    this._autoSyncPausedUntil = Date.now() + Math.max(0, ms | 0);

    // Si además hay intervalo activo, lo mantenemos (el check de tiempo ya bloquea)
    // Pero programamos un timer para “reanudar” simbólicamente y notificar.
    if (this._autoSyncPauseTimer) {
      clearTimeout(this._autoSyncPauseTimer);
      this._autoSyncPauseTimer = null;
    }

    this._autoSyncPauseTimer = setTimeout(() => {
      this._autoSyncPausedUntil = 0;
      appEvents.emit('sync:auto_backoff_ended');
      // Intento suave tras el backoff
      if (navigator.onLine && !this.syncInProgress) {
        this.performAutoSync().catch(() => {});
      }
    }, Math.max(0, ms | 0));

    appEvents.emit('sync:auto_backoff_started', { until: this._autoSyncPausedUntil });
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

    // Guardar la config nueva (si tu AppController la conserva)
    if (!this.app.config) this.app.config = {};
    this.app.config.sync = { ...(this.app.config.sync || {}), ...(syncConfig || {}) };

    // Reactivar el intervalo si procede
    if (this.app.config.sync.interval) {
      this.setupAutoSync();
    }

    // Actualizar límites de reintentos
    if (typeof syncConfig?.maxRetries === 'number') {
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

      // Limpiar backoff timer
      if (this._autoSyncPauseTimer) {
        clearTimeout(this._autoSyncPauseTimer);
        this._autoSyncPauseTimer = null;
      }
      this._autoSyncPausedUntil = 0;

      // Limpiar suscripciones
      this.subscriptions.forEach(unsub => unsub && unsub());
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

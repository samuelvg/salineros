// src/core/EventSystem.js - Versión sin dependencias circulares
export class TypedEventEmitter extends EventTarget {
  constructor() {
    super();
    this.eventTypes = new Map();
    this.middlewares = [];
  }

  // Registrar tipos de eventos disponibles
  registerEventType(eventName, schema = {}) {
    this.eventTypes.set(eventName, schema);
  }

  // Middleware para logging, validación, etc.
  use(middleware) {
    this.middlewares.push(middleware);
  }

  emit(eventName, data = {}) {
    // Validar tipo de evento
    if (!this.eventTypes.has(eventName)) {
      console.warn(`Evento no registrado: ${eventName}`);
    }

    // Ejecutar middlewares
    for (const middleware of this.middlewares) {
      try {
        const result = middleware(eventName, data);
        if (result === false) return; // Cancelar evento
      } catch (error) {
        console.error('Error en middleware:', error);
      }
    }

    const event = new CustomEvent(eventName, { 
      detail: data,
      bubbles: false,
      cancelable: true
    });

    this.dispatchEvent(event);
  }

  on(eventName, handler, options = {}) {
    if (typeof handler !== 'function') {
      throw new Error('Handler debe ser una función');
    }

    const wrappedHandler = (event) => {
      try {
        handler(event.detail, event);
      } catch (error) {
        console.error(`Error en handler para ${eventName}:`, error);
        this.emit('error', { eventName, error, originalData: event.detail });
      }
    };

    this.addEventListener(eventName, wrappedHandler, options);

    // Retornar función de cleanup
    return () => {
      this.removeEventListener(eventName, wrappedHandler, options);
    };
  }

  once(eventName, handler) {
    return this.on(eventName, handler, { once: true });
  }

  off(eventName, handler) {
    this.removeEventListener(eventName, handler);
  }
}

// Eventos tipados para la aplicación
export class AppEvents extends TypedEventEmitter {
  constructor(config = null) {
    super();
    this.config = config;
    this.setupEventTypes();
    this.setupMiddleware();
  }

  // Método para actualizar configuración después de la inicialización
  updateConfig(config) {
    this.config = config;
  }

  setupEventTypes() {
    // Eventos de la aplicación
    this.registerEventType('app:init');
    this.registerEventType('app:ready');
    this.registerEventType('app:error', { error: 'object' });
    this.registerEventType('app:init_error', { error: 'object' });
    this.registerEventType('app:promise_rejection', { reason: 'any' });
    this.registerEventType('app:fatal_error', { error: 'object' });
    this.registerEventType('app:restarted');
    this.registerEventType('app:destroyed');

    // Eventos de canciones
    this.registerEventType('song:created', { song: 'object' });
    this.registerEventType('song:updated', { song: 'object' });
    this.registerEventType('song:deleted', { id: 'number|string' });
    this.registerEventType('song:selected', { song: 'object' });
    this.registerEventType('songs:loaded', { count: 'number', source: 'string' });
    this.registerEventType('songs:load_error', { error: 'object' });
    this.registerEventType('song:create_error', { error: 'object', datos: 'object' });
    this.registerEventType('song:update_error', { error: 'object', id: 'any', datos: 'object' });
    this.registerEventType('song:delete_error', { error: 'object', id: 'any' });

    // Eventos de sincronización
    this.registerEventType('sync:start');
    this.registerEventType('sync:complete', { stats: 'object' });
    this.registerEventType('sync:error', { error: 'object' });
    this.registerEventType('sync:conflict', { conflicts: 'array' });
    this.registerEventType('sync:manual_complete');
    this.registerEventType('sync:manual_error', { error: 'object' });
    this.registerEventType('sync:auto_paused');
    this.registerEventType('sync:auto_resumed');
    this.registerEventType('sync:config_updated', { config: 'object' });
    this.registerEventType('sync:data_cleared');
    this.registerEventType('sync:destroyed');

    // Eventos de conectividad
    this.registerEventType('connectivity:online');
    this.registerEventType('connectivity:offline');

    // Eventos de UI
    this.registerEventType('ui:initialized');
    this.registerEventType('ui:error', { error: 'object', context: 'string' });
    this.registerEventType('ui:views_initialized');
    this.registerEventType('ui:song_list_updated', { count: 'number' });
    this.registerEventType('ui:modal:open', { modalType: 'string', data: 'object' });
    this.registerEventType('ui:modal:close', { modalType: 'string' });
    this.registerEventType('ui:modal:error', { error: 'object', song: 'object' });
    this.registerEventType('ui:form:open', { formType: 'string', song: 'object' });
    this.registerEventType('ui:form:close');
    this.registerEventType('ui:form:submit', { formType: 'string', data: 'object' });
    this.registerEventType('ui:filters_updated', { tags: 'array' });
    this.registerEventType('ui:filter_changed', { selectedTags: 'array' });
    this.registerEventType('ui:shortcut', { action: 'string' });

    // Eventos de datos
    this.registerEventType('data:exported', { count: 'number' });
    this.registerEventType('data:export_error', { error: 'object' });
    this.registerEventType('data:imported', { imported: 'number', total: 'number' });
    this.registerEventType('data:import_error', { error: 'object' });

    // Eventos de búsqueda
    this.registerEventType('search:performed', { query: 'string', results: 'number' });

    // Eventos de configuración
    this.registerEventType('config:updated', { config: 'object' });

    // UI
    this.registerEventType('ui:filters_updated');
    this.registerEventType('ui:filters_cleared');
    this.registerEventType('ui:views_initialized');
    this.registerEventType('ui:form:open');
    this.registerEventType('ui:form:close');
    this.registerEventType('ui:modal:error');
 
    // Modal canción (para integraciones como el calendario)
    this.registerEventType('modal:opened');
    this.registerEventType('modal:closed');
 
    // Sync
    this.registerEventType('sync:complete');
    this.registerEventType('sync:error', { error: 'object' });
  }

  setupMiddleware() {
    // Middleware de logging sin dependencias externas
    this.use((eventName, data) => {
      // Detección simple de entorno de desarrollo
      const isDevelopment = 
        location.hostname === 'localhost' || 
        location.hostname === '127.0.0.1' ||
        location.hostname.startsWith('192.168.') ||
        location.port !== '';
      
      // Solo log en desarrollo o si debug está explícitamente activado
      const shouldLog = isDevelopment || (this.config && this.config.api && this.config.api.debug);
      
      if (shouldLog) {
        console.log(`🎵 Event: ${eventName}`, data);
      }
    });

    // Middleware de métricas (si Google Analytics está disponible)
    this.use((eventName, data) => {
      if (typeof window.gtag === 'function') {
        try {
          window.gtag('event', eventName.replace(':', '_'), {
            custom_parameter: JSON.stringify(data)
          });
        } catch (error) {
          console.warn('Error enviando métrica:', error);
        }
      }
    });

    // Middleware de validación de eventos críticos
    this.use((eventName, data) => {
      // Validar eventos críticos
      if (eventName.includes('error') || eventName.includes('Error')) {
        if (!data || !data.error) {
          console.warn(`Evento de error ${eventName} sin información de error`);
        }
      }
    });
  }
}

// Instancia global - se inicializa sin configuración y se actualiza después
export const appEvents = new AppEvents();
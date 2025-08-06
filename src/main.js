// ============================================
// Archivo: /src/main.js - VERSIÓN REFACTORIZADA
// Solo inicialización y coordinación
// ============================================

import { AppController } from './controllers/AppController.js';
import { getEnvironmentConfig } from './config/AppConfig.js';
import { appEvents } from './core/EventSystem.js';
import notificacionService from './services/notificacionService.js';

// ======= CONFIGURACIÓN GLOBAL =======
const config = getEnvironmentConfig();

// ======= REGISTRO DEL SERVICE WORKER =======
async function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    try {
      const registro = await navigator.serviceWorker.register('sw.js');
      console.log('Service Worker registrado exitosamente:', registro);
      
      notificacionService.informacion(
        'Aplicación lista', 
        'Funciona offline y se sincroniza automáticamente'
      );
    } catch (error) {
      console.error('Error al registrar Service Worker:', error);
      notificacionService.advertencia(
        'Modo offline limitado',
        'Algunas funciones offline pueden no estar disponibles'
      );
    }
  }
}

// ======= MANEJO GLOBAL DE ERRORES =======
function setupGlobalErrorHandling() {
  window.addEventListener('error', (evento) => {
    console.error('Error global capturado:', evento.error);
    notificacionService.error(
      'Error inesperado',
      'Se produjo un error. La aplicación puede seguir funcionando.'
    );
    
    appEvents.emit('app:error', { 
      error: evento.error, 
      context: 'global' 
    });
  });

  window.addEventListener('unhandledrejection', (evento) => {
    console.error('Promesa rechazada no manejada:', evento.reason);
    notificacionService.error(
      'Error de conexión',
      'Problema al procesar la solicitud. Revisa tu conexión.'
    );
    
    appEvents.emit('app:promise_rejection', { 
      reason: evento.reason 
    });
    
    evento.preventDefault();
  });
}

// ======= INICIALIZACIÓN PRINCIPAL =======
async function initializeApp() {
  try {
    console.log('🎵 Inicializando Los Salineros...');
    
    // Configurar manejo de errores
    setupGlobalErrorHandling();
    
    // Registrar Service Worker
    await registerServiceWorker();
    
    // Actualizar sistema de eventos con configuración
    appEvents.updateConfig(config);
    
    // Crear controlador principal de la aplicación
    const app = new AppController(config);
    
    // Configurar eventos globales de la aplicación
    setupAppEvents(app);
    
    // Hacer la aplicación accesible globalmente para debugging
    if (config.api.debug) {
      window.AplicacionSalineros = app;
      window.appEvents = appEvents;
      window.appConfig = config;
    }
    
    console.log('✅ Los Salineros - Aplicación inicializada correctamente');
    
  } catch (error) {
    console.error('❌ Error fatal al inicializar la aplicación:', error);
    
    appEvents.emit('app:fatal_error', { error });
    
    // Mostrar error al usuario con opción de recarga
    showFatalError(error);
  }
}

// ======= CONFIGURACIÓN DE EVENTOS GLOBALES =======
function setupAppEvents(app) {
  // Eventos de inicialización
  appEvents.on('app:ready', () => {
    console.log('🎉 Aplicación lista para usar');
  });
  
  appEvents.on('app:error', ({ error, context }) => {
    console.error(`Error en contexto ${context}:`, error);
  });
  
  // Eventos de canciones
  appEvents.on('song:created', ({ song }) => {
    console.log('Nueva canción creada:', song.titulo);
  });
  
  appEvents.on('song:updated', ({ song }) => {
    console.log('Canción actualizada:', song.titulo);
  });
  
  appEvents.on('song:deleted', ({ id, titulo }) => {
    console.log('Canción eliminada:', titulo);
  });
  
  // Eventos de sincronización
  appEvents.on('sync:complete', ({ stats }) => {
    console.log('Sincronización completada:', stats);
  });
  
  appEvents.on('sync:error', ({ error }) => {
    console.warn('Error de sincronización:', error);
  });
}

// ======= PANTALLA DE ERROR FATAL =======
function showFatalError(error) {
  const errorContainer = document.createElement('div');
  errorContainer.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: var(--bg-surface, #1a1a1a);
    color: var(--text-primary, white);
    padding: 2rem;
    border-radius: var(--radius-lg, 12px);
    text-align: center;
    z-index: 10000;
    max-width: 400px;
    border: 1px solid var(--error, #f44336);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
  `;
  
  errorContainer.innerHTML = `
    <h3 style="color: var(--error, #f44336); margin-bottom: 1rem;">
      🚨 Error de Inicialización
    </h3>
    <p style="margin-bottom: 1.5rem; line-height: 1.5;">
      No se pudo inicializar la aplicación correctamente.
    </p>
    <p style="margin-bottom: 2rem; font-size: 0.9rem; opacity: 0.8;">
      ${config.api.debug ? error.message : 'Por favor, recarga la página o contacta con soporte técnico.'}
    </p>
    <button onclick="location.reload()" 
            style="
              background: var(--accent-primary, #00d4aa);
              color: white;
              border: none;
              padding: 0.75rem 1.5rem;
              border-radius: var(--radius-md, 8px);
              cursor: pointer;
              font-weight: 600;
              transition: all 0.3s ease;
            "
            onmouseover="this.style.transform='translateY(-2px)'"
            onmouseout="this.style.transform='translateY(0)'">
      🔄 Recargar Página
    </button>
  `;
  
  document.body.appendChild(errorContainer);
}

// ======= MANEJO DE RECURSOS =======
function handleResourceErrors() {
  window.addEventListener('error', (evento) => {
    if (evento.target !== window) {
      console.warn('Error al cargar recurso:', evento.target.src || evento.target.href);
      
      // Intentar recargar recursos críticos
      if (evento.target.tagName === 'SCRIPT') {
        console.log('Intentando recargar script fallido...');
        // Se podría implementar lógica de retry aquí
      }
    }
  });
}

// ======= ATAJOS DE TECLADO GLOBALES =======
function setupKeyboardShortcuts() {
  document.addEventListener('keydown', (evento) => {
    // Solo procesar si no estamos en un input/textarea
    if (evento.target.tagName === 'INPUT' || evento.target.tagName === 'TEXTAREA') {
      return;
    }
    
    // Ctrl/Cmd + N: Nueva canción
    if ((evento.ctrlKey || evento.metaKey) && evento.key === 'n') {
      evento.preventDefault();
      appEvents.emit('ui:shortcut', { action: 'new_song' });
    }
    
    // Escape: Cerrar modales/formularios
    if (evento.key === 'Escape') {
      appEvents.emit('ui:shortcut', { action: 'escape' });
    }
    
    // Ctrl/Cmd + F: Buscar
    if ((evento.ctrlKey || evento.metaKey) && evento.key === 'f') {
      evento.preventDefault();
      appEvents.emit('ui:shortcut', { action: 'search' });
    }
  });
}

// ======= MONITOREO DE CONECTIVIDAD =======
function setupConnectivityMonitoring() {
  window.addEventListener('online', () => {
    console.log('🌐 Conexión restaurada');
    appEvents.emit('connectivity:online');
  });
  
  window.addEventListener('offline', () => {
    console.log('📴 Conexión perdida - modo offline');
    appEvents.emit('connectivity:offline');
  });
}

// ======= INICIALIZACIÓN AL CARGAR EL DOM =======
document.addEventListener('DOMContentLoaded', async () => {
  // Configurar funcionalidades adicionales
  handleResourceErrors();
  setupKeyboardShortcuts();
  setupConnectivityMonitoring();
  
  // Inicializar la aplicación principal
  await initializeApp();
});

// ======= EXPORTAR PARA USO EN MÓDULOS =======
export { appEvents, config };
// ============================================
// Archivo: /src/main.js - VERSIÓN FINAL CON CALENDARIO FUNCIONAL
// ============================================

import { AppController } from './controllers/AppController.js';
import { getEnvironmentConfig } from './config/AppConfig.js';
import { appEvents } from './core/EventSystem.js';
import notificacionService from './services/notificacionService.js';

import { Calendar } from "https://cdn.skypack.dev/@fullcalendar/core@6.1.8";
import dayGridPlugin from "https://cdn.skypack.dev/@fullcalendar/daygrid@6.1.8";
import icalendarPlugin from "https://cdn.skypack.dev/@fullcalendar/icalendar@6.1.8";
// ---- Calendar config helpers (ICS instead of Google Calendar) ----
function getIcsUrl() {
  try {
    const cfg = getEnvironmentConfig?.() || {};
    if (cfg?.calendar?.icsUrl) return cfg.calendar.icsUrl;
  } catch {}
  const meta = document.querySelector('meta[name="calendar-ics"]');
  if (meta && meta.content) return meta.content;
  // Fallback: a local ICS file deployed with the app (place it under /intranet2/assets/calendar.icss)
  return window.location.origin + window.location.pathname.replace(/\/?[^\/]*$/, '/') + 'assets/calendar.icss';
}


const config = getEnvironmentConfig();

async function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    try {
      const registro = await navigator.serviceWorker.register('sw.js');
      console.log('Service Worker registrado exitosamente:', registro);
      notificacionService.informacion('Aplicación lista', 'Funciona offline y se sincroniza automáticamente');
    } catch (error) {
      console.error('Error al registrar Service Worker:', error);
      notificacionService.advertencia('Modo offline limitado', 'Algunas funciones offline pueden no estar disponibles');
    }
  }
}

function setupGlobalErrorHandling() {
  window.addEventListener('error', (evento) => {
    console.error('Error global capturado:', evento.error);
    notificacionService.error('Error inesperado', 'Se produjo un error. La aplicación puede seguir funcionando.');
    appEvents.emit('app:error', { error: evento.error, context: 'global' });
  });

  window.addEventListener('unhandledrejection', (evento) => {
    console.error('Promesa rechazada no manejada:', evento.reason);
    notificacionService.error('Error de conexión', 'Problema al procesar la solicitud. Revisa tu conexión.');
    appEvents.emit('app:promise_rejection', { reason: evento.reason });
    evento.preventDefault();
  });
}

async function initializeApp() {
  try {
    console.log('🎵 Inicializando Los Salineros...');
    setupGlobalErrorHandling();
    await registerServiceWorker();
    appEvents.updateConfig(config);
    const app = new AppController(config);
    setupAppEvents(app);
    if (config.api.debug) {
      window.AplicacionSalineros = app;
      window.appEvents = appEvents;
      window.appConfig = config;
    }
    console.log('✅ Los Salineros - Aplicación inicializada correctamente');
  } catch (error) {
    console.error('❌ Error fatal al inicializar la aplicación:', error);
    appEvents.emit('app:fatal_error', { error });
    showFatalError(error);
  }
}

function setupAppEvents(app) {
  appEvents.on('app:ready', () => console.log('🎉 Aplicación lista para usar'));
  appEvents.on('app:error', ({ error, context }) => console.error(`Error en contexto ${context}:`, error));
  appEvents.on('song:created', ({ song }) => console.log('Nueva canción creada:', song.titulo));
  appEvents.on('song:updated', ({ song }) => console.log('Canción actualizada:', song.titulo));
  appEvents.on('song:deleted', ({ id, titulo }) => console.log('Canción eliminada:', titulo));
  appEvents.on('sync:complete', ({ stats }) => console.log('Sincronización completada:', stats));
  appEvents.on('sync:error', ({ error }) => console.warn('Error de sincronización:', error));
}

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
    <h3 style="color: var(--error, #f44336); margin-bottom: 1rem;">🚨 Error de Inicialización</h3>
    <p style="margin-bottom: 1.5rem;">No se pudo inicializar la aplicación correctamente.</p>
    <p style="margin-bottom: 2rem; font-size: 0.9rem; opacity: 0.8;">
      ${config.api.debug ? error.message : 'Por favor, recarga la página o contacta con soporte técnico.'}
    </p>
    <button onclick="location.reload()" style="background: var(--accent-primary, #00d4aa); color: white; border: none; padding: 0.75rem 1.5rem; border-radius: var(--radius-md, 8px); cursor: pointer; font-weight: 600;">🔄 Recargar Página</button>
  `;
  document.body.appendChild(errorContainer);
}

function handleResourceErrors() {
  window.addEventListener('error', (evento) => {
    if (evento.target !== window) {
      console.warn('Error al cargar recurso:', evento.target.src || evento.target.href);
    }
  });
}

function setupKeyboardShortcuts() {
  document.addEventListener('keydown', (evento) => {
    if (['INPUT', 'TEXTAREA'].includes(evento.target.tagName)) return;
    if ((evento.ctrlKey || evento.metaKey) && evento.key === 'n') {
      evento.preventDefault();
      appEvents.emit('ui:shortcut', { action: 'new_song' });
    }
    if (evento.key === 'Escape') {
      appEvents.emit('ui:shortcut', { action: 'escape' });
    }
    if ((evento.ctrlKey || evento.metaKey) && evento.key === 'f') {
      evento.preventDefault();
      appEvents.emit('ui:shortcut', { action: 'search' });
    }
  });
}

function setupConnectivityMonitoring() {
  window.addEventListener('online', () => appEvents.emit('connectivity:online'));
  window.addEventListener('offline', () => appEvents.emit('connectivity:offline'));
}

document.addEventListener('DOMContentLoaded', async () => {
  handleResourceErrors();
  setupKeyboardShortcuts();
  setupConnectivityMonitoring();
  await initializeApp();
});

export { appEvents, config };

let calendar = null;

// Recalcular tamaños cuando se abre/cierra el modal (💡 añadido)
appEvents.on('modal:opened', () => {
  try { calendar?.updateSize(); } catch {}
});
appEvents.on('modal:closed', () => {
  try { calendar?.updateSize(); } catch {}
});

document.getElementById("open-calendar-btn").addEventListener("click", () => {
  document.getElementById("calendar-modal").classList.add("show");
  const calendarEl = document.getElementById("fullcalendar");
  if (!calendar && calendarEl) {
    calendar = new Calendar(calendarEl, {
      plugins: [dayGridPlugin, icalendarPlugin],
      initialView: "dayGridMonth",
      height: "100%",
      locale: "es",
      timeZone: "Atlantic/Canary",
      firstDay: 1,
      headerToolbar: {
        left: "prev,next today",
        center: "title",
        right: ""
      },
      
      eventSources: [{ id: 'ics', url: getIcsUrl(), format: 'ics' }]
    });
    requestAnimationFrame(() => { calendar.render(); calendar.updateSize(); });
  } else if (calendar) {
    calendar.updateSize();
  }
});

document.getElementById("close-calendar-btn").addEventListener("click", () => {
  document.getElementById("calendar-modal").classList.remove("show");
});

// Close calendar modal on Escape and manage focus
function handleCalendarEscClose(e) {
  if (e.key === 'Escape') {
    const modal = document.getElementById('calendar-modal');
    if (modal && modal.classList.contains('show')) {
      const btn = document.getElementById('close-calendar-btn');
      btn?.click();
    }
  }
}
window.addEventListener('keydown', handleCalendarEscClose);
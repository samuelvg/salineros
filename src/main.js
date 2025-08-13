// ============================================
// Archivo: /src/main.js - VERSIÓN REFACTORIZADA + CALENDARIO FIX
// ============================================

import { AppController } from './controllers/AppController.js';
import { getEnvironmentConfig } from './config/AppConfig.js';
import { appEvents } from './core/EventSystem.js';
import notificacionService from './services/notificacionService.js';

// FullCalendar (Skypack para evitar bundling)
import { Calendar } from "https://cdn.skypack.dev/@fullcalendar/core@6.1.8";
import dayGridPlugin from "https://cdn.skypack.dev/@fullcalendar/daygrid@6.1.8";
import icalendarPlugin from "https://cdn.skypack.dev/@fullcalendar/icalendar@6.1.8";

// ----------------------------------------------------
// Helpers de calendario (fuente ICS)
// ----------------------------------------------------
function getIcsUrl() {
  // 1) Prioriza AppConfig si define calendar.icsUrl
  try {
    const cfg = getEnvironmentConfig?.();
    if (cfg?.calendar?.icsUrl) return cfg.calendar.icsUrl;
  } catch (e) { /* noop */ }

  // 2) Meta tag en el HTML
  const meta = document.querySelector('meta[name="calendar-ics"]');
  if (meta?.content) return meta.content;

  // 3) Fallback: ICS estático dentro de assets
  const basePath = window.location.pathname.replace(/\/?[^/]*$/, '/');
  return `${basePath}assets/calendar.ics`;
}

// ----------------------------------------------------
// Registro de Service Worker
// ----------------------------------------------------
async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  try {
    const reg = await navigator.serviceWorker.register('/intranet2/sw.js');
    console.log('Service Worker registrado exitosamente:', reg);
  } catch (err) {
    console.warn('No se pudo registrar el Service Worker:', err);
  }
}

// ----------------------------------------------------
// Manejo global de errores para UX y depuración
// ----------------------------------------------------
function setupGlobalErrorHandling() {
  window.addEventListener('unhandledrejection', (e) => {
    console.error('Promesa rechazada no manejada:', e.reason || e);
    try { appEvents.emit?.('ui:modal:error', { error: e.reason || e }); } catch {}
  });
  window.addEventListener('error', (e) => {
    console.error('Error global:', e.error || e.message || e);
  });
}

// ----------------------------------------------------
// App init
// ----------------------------------------------------
const cfg = getEnvironmentConfig();
const config = cfg;
console.log('🌍 Entorno detectado:', cfg.environment?.isDevelopment ? 'desarrollo' : 'producción');
console.log('🔗 Hostname:', cfg.environment?.hostname || location.hostname);

let app = null;

// Calendario (instancia única)
let calendar = null;

function setupAppEvents(appInstance) {
  // Estado de conexión (si tu AppController ya los emite)
  appEvents.on?.('app:online', () => console.log('🌐 Aplicación iniciada con conexión'));
  appEvents.on?.('app:offline', () => console.log('📴 Aplicación en modo offline'));

  // Sync feedback (si SyncManager los emite)
  appEvents.on?.('sync:complete', () => console.log('🔁 Sincronización OK'));
  appEvents.on?.('sync:error', (err) => console.error('Error de sincronización:', err?.error || err));
}

async function initializeApp() {
  try {
    console.log('🎵 Inicializando Los Salineros...');
    setupGlobalErrorHandling();
    await registerServiceWorker();

    // Expone config a EventSystem por si lo usas para feature flags
    try { appEvents.updateConfig?.(config); } catch {}

    app = new AppController(config);
    setupAppEvents(app);

    if (config?.api?.debug) {
      // Facilita depuración en producción
      window.AplicacionSalineros = app;
      window.appEvents = appEvents;
      window.appConfig = config;
    }

    console.log('✅ Los Salineros - Aplicación inicializada correctamente');
  } catch (err) {
    console.error('💥 Error inicializando la app:', err);
    notificacionService?.toast?.('Error inicializando la aplicación', { type: 'error' });
  } finally {
    console.log('🎉 Aplicación lista para usar');
  }
}

// ----------------------------------------------------
// Calendario: apertura/cierre modal + render fiable
// ----------------------------------------------------
function openCalendarModal() {
  const modal = document.getElementById('calendar-modal');
  const calendarEl = document.getElementById('fullcalendar');

  if (!modal || !calendarEl) {
    console.warn('No se encontró el modal o el contenedor del calendario.');
    return;
  }

  // Mostrar modal
  modal.classList.add('show');
  // Emit opcional (solo si tienes registrado el evento)
  try { appEvents.emit?.('modal:opened', { modal: 'calendar' }); } catch {}

  // Crear instancia la primera vez
  if (!calendar) {
    calendar = new Calendar(calendarEl, {
      plugins: [dayGridPlugin, icalendarPlugin],
      initialView: 'dayGridMonth',
      firstDay: 1,                  // Semana empieza en lunes
      locale: 'es',
      timeZone: 'Atlantic/Canary',
      height: '100%',
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: ''
      },
      // Fuente ICS
      eventSources: [
        {
          url: getIcsUrl(),
          format: 'ics',
          method: 'GET',
          failure: (error) => {
            console.error('Error cargando ICS:', error);
            notificacionService?.toast?.('No se pudo cargar el calendario', { type: 'warning' });
          }
        }
      ],
      // Comportamiento típico: abrir enlaces del evento en nueva pestaña
      eventClick: (info) => {
        if (info.event.url) {
          info.jsEvent?.preventDefault();
          window.open(info.event.url, '_blank', 'noopener,noreferrer');
        }
      }
    });
  }

  // El primer pintado a veces sale mal si el modal se acaba de mostrar.
  // Forzamos render y ajuste de tamaño en el próximo frame.
  requestAnimationFrame(() => {
    try { calendar.render(); } catch (e) { console.warn('Calendar render falló:', e); }
    try { calendar.updateSize(); } catch (e) { /* noop */ }
  });
}

function closeCalendarModal() {
  const modal = document.getElementById('calendar-modal');
  if (!modal) return;
  modal.classList.remove('show');
  // Emit opcional (solo si tienes registrado el evento)
  try { appEvents.emit?.('modal:closed', { modal: 'calendar' }); } catch {}
}

// Resize robusto
function onWindowResize() {
  if (!calendar) return;
  try { calendar.updateSize(); } catch {}
}

// Accesibilidad: cerrar con Escape
function handleCalendarEscClose(e) {
  if (e.key === 'Escape') {
    const modal = document.getElementById('calendar-modal');
    if (modal && modal.classList.contains('show')) {
      const btn = document.getElementById('close-calendar-btn');
      if (btn) btn.click();
      else closeCalendarModal();
    }
  }
}

// ----------------------------------------------------
// Listeners de UI (sólo se activan si los elementos existen)
// ----------------------------------------------------
function wireUi() {
  const openBtn = document.getElementById('open-calendar-btn');
  const closeBtn = document.getElementById('close-calendar-btn');

  if (openBtn) {
    openBtn.addEventListener('click', (e) => {
      e.preventDefault();
      openCalendarModal();
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', (e) => {
      e.preventDefault();
      closeCalendarModal();
    });
  }

  window.addEventListener('resize', onWindowResize);
  window.addEventListener('keydown', handleCalendarEscClose);
}

// ----------------------------------------------------
// Boot
// ----------------------------------------------------
document.addEventListener('DOMContentLoaded', async () => {
  await initializeApp();
  wireUi();
});

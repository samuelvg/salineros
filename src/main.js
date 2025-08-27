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
    const manifestHref = document.querySelector('link[rel="manifest"]')?.href;
    const baseURL = manifestHref ? new URL(manifestHref) : new URL(location.href);
    const swURL = new URL('sw.js', baseURL);
    const reg = await navigator.serviceWorker.register(swURL.pathname);
    console.log('Service Worker OK:', reg);
  } catch (err) {
    console.warn('SW registro falló:', err);
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
  document.body.classList.add('modal-open');
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
  expandRows: true,
  dayMaxEvents: 3,
  eventDisplay: 'block',
  eventTimeFormat: { hour: '2-digit', minute: '2-digit', meridiem: false },
  headerToolbar: {
    left: 'prev,next today',
    center: 'title',
    right: ''
  },
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
  eventDidMount(info) {
    const dayCell = info.el.closest('.fc-daygrid-day');
    if (dayCell) dayCell.classList.add('has-events');

    const { title } = info.event;
    const start = info.event.start;
    const end   = info.event.end;
    const opts = { hour: '2-digit', minute: '2-digit' };
    const rango = start
      ? start.toLocaleTimeString('es-ES', opts) +
        (end ? ' - ' + end.toLocaleTimeString('es-ES', opts) : '')
      : '';
    info.el.title = rango ? `${title}\n${rango}` : title;
  },
  eventClick(arg) {
    arg.jsEvent?.preventDefault();
    openEventDetailModal(arg.event);
  }
});

  }

  // El primer pintado a veces sale mal si el modal se acaba de mostrar.
  // 1) Empujón inicial al siguiente frame
  requestAnimationFrame(() => {
    try { calendar.render(); } catch (e) { console.warn('Calendar render falló:', e); }
    try { calendar.updateSize(); } catch (e) { /* noop */ }
  });

  // 2) Ajuste definitivo cuando termine la transición CSS del modal
  const onTransitionEnd = (evt) => {
    // Asegura que el evento es del propio modal
    if (evt && evt.target !== modal) return;
    try { calendar.updateSize(); } catch {}
    modal.removeEventListener('transitionend', onTransitionEnd);
  };
  // Usa { once: true } para autolimpiar; algunos navegadores no lo soportan con passive, pero aquí no lo usamos
  modal.addEventListener('transitionend', onTransitionEnd, { once: true });

  // 3) Fallback por si no hay transición (o el navegador no dispara el evento)
  setTimeout(() => {
    try { calendar.updateSize(); } catch {}
  }, 150);
}

function closeCalendarModal() {
  const modal = document.getElementById('calendar-modal');
  if (!modal) return;
  modal.classList.remove('show');
  document.body.classList.remove('modal-open');
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


// === Event Detail Modal (reusable) ===
function ensureEventDetailModal() {
  let m = document.getElementById('event-detail-modal');
  if (m) return m;
  m = document.createElement('div');
  m.id = 'event-detail-modal';
  m.className = 'modal hidden';
  m.innerHTML = `
    <div class="modal-content" role="dialog" aria-modal="true" aria-labelledby="event-detail-title">
      <button class="modal-close" aria-label="Cerrar">×</button>
      <h2 id="event-detail-title" class="modal-title"></h2>
      <div class="modal-body">
        <div class="event-meta"></div>
        <div class="event-desc" style="white-space: pre-wrap;"></div>
      </div>
    </div>`;
  document.body.appendChild(m);
  m.querySelector('.modal-close').addEventListener('click', () => m.classList.add('hidden'));
  m.addEventListener('click', (e) => { if (e.target === m) m.classList.add('hidden'); });
  return m;
}
function openEventDetailModal(event) {
  const m = ensureEventDetailModal();
  const titleEl = m.querySelector('#event-detail-title');
  const metaEl  = m.querySelector('.event-meta');
  const descEl  = m.querySelector('.event-desc');
  titleEl.textContent = event.title || '(Sin título)';
  const start = event.start;
  const end   = event.end;
  const fFecha = (d) => d ? d.toLocaleString('es-ES', {
    weekday:'long', year:'numeric', month:'long', day:'numeric',
    hour:'2-digit', minute:'2-digit'
  }) : '';
  const loc = event.extendedProps?.location || '';
  const url = event.url || '';
  metaEl.innerHTML = `
    <p><strong>Inicio:</strong> ${fFecha(start)}</p>
    ${end ? `<p><strong>Fin:</strong> ${fFecha(end)}</p>` : ''}
    ${loc ? `<p><strong>Ubicación:</strong> ${loc}</p>` : ''}
    ${url ? `<p><a href="${url}" target="_blank" rel="noopener">Enlace</a></p>` : ''}
  `;
  const desc = event.extendedProps?.description || '';
  descEl.textContent = desc;
  m.classList.remove('hidden');
}

// ----------------------------------------------------
// Boot
// ----------------------------------------------------
document.addEventListener('DOMContentLoaded', async () => {
  try {
    await initializeApp();
  } catch (err) {
    // Por si alguna promesa burbujea desde initializeApp (no debería), la capturamos aquí
    console.error('Fallo al iniciar la app:', err);
  }
  wireUi();
});
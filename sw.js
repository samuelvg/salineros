/* ============================================
   Service Worker - Los Salineros (intranet)
   - Offline-first realista
   - Runtime caching para ESM/CSS (incluye WebView)
   - Network-first para API
   - SWR para calendarios ICS/CDN
   - Cache-first para imágenes
   - Limpieza de versiones antiguas
   ============================================ */

const CACHE_VERSION = 'v5-2025-08-13';
const STATIC_CACHE = `static-${CACHE_VERSION}`;
const RUNTIME_CACHE = `runtime-${CACHE_VERSION}`;
const BASE_PATH = new URL(self.registration?.scope || self.location, self.location).pathname;

// Precache mínimo seguro (completa según tu estructura)
// Nota: No es obligatorio listar TODOS los módulos ESM si activamos SWR en runtime.
const PRECACHE_URLS = [
  '/', 'index.html',
  'css/main.css', 'css/songs.css', 'css/modals.css', 'css/responsive.css',
  'src/lib/raphael-min.js', 'src/lib/chord.js', 'src/lib/acordes.js', 'src/lib/wavesurfer.js',
  'src/main.js',
  'assets/icons/icon-192.png', 'assets/icons/icon-512.png'
];

// Hosts de terceros que queremos cachear en runtime (SWR)
const RUNTIME_CDN_HOSTS = new Set([
  'cdn.jsdelivr.net',
  'cdn.skypack.dev',
  'ga.jspm.io',
]);

self.addEventListener('install', (event) => {
  // Tomamos control en cuanto se instale
  self.skipWaiting();

  event.waitUntil(
    (async () => {
      const cache = await caches.open(STATIC_CACHE);
      // Añadimos cada recurso de forma individual para no fallar toda la instalación si uno no existe
      await Promise.all(
        PRECACHE_URLS.map(async (url) => {
          try {
            const res = await fetch(url, { credentials: 'same-origin' });
            if (res.ok) await cache.put(url, res.clone());
          } catch (_) {
            // Ignoramos fallos puntuales de algún recurso
          }
        })
      );
    })()
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      // Limpiamos cachés antiguas
      const names = await caches.keys();
      await Promise.all(
        names
          .filter((n) => n !== STATIC_CACHE && n !== RUNTIME_CACHE)
          .map((n) => caches.delete(n))
      );
      await self.clients.claim();
    })()
  );
});

// Utilidad: carrera con timeout para network-first
async function fetchWithTimeout(request, timeoutMs = 3500) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(request, { signal: controller.signal });
    return res;
  } finally {
    clearTimeout(t);
  }
}

// Estrategias básicas
async function cacheFirst(req, cacheName = RUNTIME_CACHE) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(req);
  if (cached) return cached;
  const res = await fetch(req);
  if (res && res.ok) cache.put(req, res.clone());
  return res;
}

async function networkFirst(req, cacheName = RUNTIME_CACHE, timeout = 3500) {
  const cache = await caches.open(cacheName);
  try {
    const res = await fetchWithTimeout(req, timeout);
    if (res && res.ok) cache.put(req, res.clone());
    return res;
  } catch (_) {
    const cached = await cache.match(req);
    if (cached) return cached;
    throw _;
  }
}

async function staleWhileRevalidate(req, cacheName = RUNTIME_CACHE) {
  const cache = await caches.open(cacheName);
  const cachedPromise = cache.match(req);
  const networkPromise = fetch(req)
    .then((res) => {
      if (res && res.ok) cache.put(req, res.clone());
      return res;
    })
    .catch(() => null);

  const cached = await cachedPromise;
  if (cached) {
    // Disparamos actualización en segundo plano (no bloquea la respuesta)
    networkPromise.catch(() => {});
    return cached;
  }
  const res = await networkPromise;
  if (res) return res;
  // Último recurso: nada en caché y red falló
  return new Response('Offline', { status: 503, statusText: 'Offline' });
}

// Offline fallback para navegaciones SPA
async function navigationFallback() {
  const cache = await caches.open(STATIC_CACHE);
  const cachedIndex = await cache.match(`${BASE_PATH}index.html`);
  if (cachedIndex) return cachedIndex;
  return new Response('Offline', { status: 503, statusText: 'Offline' });
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Solo GET se beneficia del SW
  if (req.method !== 'GET') {
    return; // deja pasar al network
  }

  // Navegaciones (SPA): intentamos red, si falla servimos index en caché
  if (req.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          // Intento normal de navegación
          const res = await fetch(req);
          // Opcional: cachear index.html cuando sea navegación a BASE_PATH
          return res;
        } catch {
          return navigationFallback();
        }
      })()
    );
    return;
  }

  // Scripts y estilos (incluye módulos ESM y CSS) => SWR para mantenerlos frescos
  if (req.destination === 'script' || req.destination === 'style') {
    event.respondWith(staleWhileRevalidate(req, RUNTIME_CACHE));
    return;
  }

  // Recursos de CDNs conocidos (Dexie, import maps polyfill, etc.) => SWR
  if (RUNTIME_CDN_HOSTS.has(url.host)) {
    event.respondWith(staleWhileRevalidate(req, RUNTIME_CACHE));
    return;
  }

  // Imágenes => cache-first (rápidas y ahorran datos)
  if (
    req.destination === 'image' ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.jpg') ||
    url.pathname.endsWith('.jpeg') ||
    url.pathname.endsWith('.webp') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.gif') ||
    url.pathname.endsWith('.ico')
  ) {
    event.respondWith(cacheFirst(req, RUNTIME_CACHE));
    return;
  }

  // Calendario ICS (proxy local) => SWR para tener algo offline pero refrescar cuando haya red
  if (
    url.origin === location.origin &&
    url.pathname.startsWith(`${BASE_PATH}api/calendar`)
  ) {
    event.respondWith(staleWhileRevalidate(req, RUNTIME_CACHE));
    return;
  }

  // API propia (JSON: canciones, etc.) => network-first con timeout y fallback a caché
  if (
    url.origin === location.origin &&
    url.pathname.startsWith(`${BASE_PATH}api/`)
  ) {
    event.respondWith(networkFirst(req, RUNTIME_CACHE, 3500));
    return;
  }

  // Tipografías => SWR (siempre que sea seguro)
  if (req.destination === 'font') {
    event.respondWith(staleWhileRevalidate(req, RUNTIME_CACHE));
    return;
  }

  // Por defecto:
  // - Misma-origin assets estáticos => cache-first
  // - Terceros desconocidos => SWR (mejor experiencia)
  if (url.origin === location.origin) {
    event.respondWith(cacheFirst(req, STATIC_CACHE));
  } else {
    event.respondWith(staleWhileRevalidate(req, RUNTIME_CACHE));
  }
});

// Permitir activar SW nuevo inmediatamente desde la app
self.addEventListener('message', (event) => {
  if (!event.data) return;
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// ============================================
// Archivo: /intranet3/sw.js
// ============================================

const CACHE_NAME      = 'static-cache-v1';
const DATA_CACHE_NAME = 'data-cache-v1';

// Lista de ficheros que realmente existen bajo /intranet3/
const FILES_TO_CACHE = [
  './',                 // index.html
  'index.html',
  'css/main.css',
  'manifest.json',
  // Sólo inclúyelos si están en intranet3/icons/
  'icons/icon-192.png',
  'icons/icon-512.png',
  // Tu código fuente
  'src/main.js',
  'src/models/songModel.js',
  'src/services/apiService.js',
  'src/services/cacheService.js',
  'src/services/syncService.js',
  'src/ui/appStatusView.js',
  'src/ui/songListView.js',
  'src/ui/songFormView.js',
  'src/ui/chordParser.js'
];

self.addEventListener('install', evt => {
  evt.waitUntil(
    caches.open(CACHE_NAME)
          .then(cache => cache.addAll(FILES_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener('activate', evt => {
  evt.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', evt => {
  const req = evt.request;

  // Si es llamada a la API
  if (req.url.includes('/intranet3/api/')) {
    evt.respondWith(
      caches.open(DATA_CACHE_NAME).then(cache =>
        fetch(req)
          .then(res => {
            if (res.status === 200) cache.put(req.url, res.clone());
            return res;
          })
          .catch(() => cache.match(req))
      )
    );
    return;
  }

  // Para el resto, cache-first
  evt.respondWith(
    caches.match(req).then(resp => resp || fetch(req))
  );
});
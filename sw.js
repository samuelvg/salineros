// ============================================
// Archivo: sw.js
// ============================================

const CACHE_NAME = 'static-cache-v3';
const DATA_CACHE_NAME = 'data-cache-v1';

// Lista de ficheros que realmente existen bajo /intranet3/
const FILES_TO_CACHE = [
  './',
  'index.html',
  'css/main.css',
  'manifest.json',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'src/main.js',
  'src/config/AppConfig.js',
  'src/controllers/AppController.js',
  'src/controllers/SongManager.js',
  'src/controllers/SyncManager.js',
  'src/controllers/UIManager.js',
  'src/core/EventSystem.js',
  'src/lib/acordes.js',
  'src/lib/chord.js',
  'src/lib/raphael-min.js',
  'src/lib/wavesurfer.js',
  'src/models/songModel.js',
  'src/services/apiService.js',
  'src/services/cacheService.js',
  'src/services/notificacionService.js',
  'src/services/syncService.js',
  'src/services/validacionService.js',
  'src/ui/appStatusView.js',
  'src/ui/chordParser.js',
  'src/ui/chordRenderer.js',
  'src/ui/multiTrackPlayer.js',
  'src/ui/songFormView.js',
  'src/ui/songListView.js',
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
  if (req.url.includes('/api/')) {
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

  // Navegaciones: app-shell fallback
  if (req.mode === 'navigate') {
    evt.respondWith(
      fetch(req).catch(() => caches.match('index.html'))
    );
    return;
  }

  // Para el resto, cache-first
  evt.respondWith(
    caches.match(req).then(resp => resp || fetch(req))
  );
});
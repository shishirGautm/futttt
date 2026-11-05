const CACHE_NAME = 'futsal-nepal-shell-v49';
const APP_SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './css/style.css',
  './css/responsive.css',
  './js/admins.js',
  './js/app.js',
  './js/auth.js',
  './js/bookings.js',
  './js/components.js',
  './js/courts.js',
  './js/dashboard.js',
  './js/firebase-config.js',
  './js/firebase-data.js',
  './js/install.js',
  './js/matches.js',
  './js/notification-center.js',
  './js/notifications.js',
  './js/owner-portal.js',
  './js/payments.js',
  './js/reports.js',
  './js/reviews.js',
  './js/settings.js',
  './js/teams.js',
  './js/tournaments.js',
  './js/user-portal.js',
  './js/users.js',
  './assets/icon-180.png',
  './assets/icon-192.png',
  './assets/icon-512.png',
  './assets/icon-maskable-512.png',
  './assets/logo.svg',
  './assets/favicon.svg'
];
const APP_SHELL_PATHS = new Set(APP_SHELL.map(function(path) {
  return new URL(path, self.location.href).pathname;
}));

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(APP_SHELL);
    }).then(function() {
      return self.skipWaiting();
    })
  );
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(cacheNames.filter(function(cacheName) {
        return cacheName.startsWith('futsal-nepal-shell-') && cacheName !== CACHE_NAME;
      }).map(function(cacheName) {
        return caches.delete(cacheName);
      }));
    }).then(function() {
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', function(event) {
  if (event.request.method !== 'GET') return;

  const requestUrl = new URL(event.request.url);
  if (requestUrl.origin !== self.location.origin) return;

  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).then(function(response) {
        if (response.ok) {
          const responseCopy = response.clone();
          caches.open(CACHE_NAME).then(function(cache) {
            return cache.put('./index.html', responseCopy);
          });
        }
        return response;
      }).catch(function() {
        return caches.match('./index.html');
      })
    );
    return;
  }

  if (APP_SHELL_PATHS.has(requestUrl.pathname)) {
    event.respondWith(
      caches.match(event.request, { ignoreSearch: true }).then(function(cachedResponse) {
        if (cachedResponse) return cachedResponse;
        return fetch(event.request).then(function(response) {
          if (response.ok) {
            const responseCopy = response.clone();
            caches.open(CACHE_NAME).then(function(cache) {
              return cache.put(event.request, responseCopy);
            });
          }
          return response;
        });
      })
    );
  }
});
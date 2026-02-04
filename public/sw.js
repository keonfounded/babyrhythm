const CACHE_NAME = 'babyrhythm-v4';
const STATIC_ASSETS = [
  '/manifest.json'
];
// Note: Don't cache index.html or / to ensure fresh content on deploy

// Install - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Listen for notification requests from main app
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SHOW_NOTIFICATION') {
    const { title, body, tag, data } = event.data;
    self.registration.showNotification(title, {
      body,
      tag,
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-72.png',
      data,
      requireInteraction: false,
      silent: false
    });
  }
});

// Handle notification clicks - open/focus app
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  // Focus existing window or open new one
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Try to focus an existing window
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      // No existing window found, open a new one
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});

// Fetch - network first for HTML, cache first for assets
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // Skip chrome-extension and other non-http requests
  if (!event.request.url.startsWith('http')) return;

  const url = new URL(event.request.url);

  // Network first for HTML/navigation requests (ensures fresh content)
  if (event.request.mode === 'navigate' || event.request.destination === 'document') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          return response;
        })
        .catch(() => {
          // Offline fallback
          return caches.match('/index.html');
        })
    );
    return;
  }

  // Cache first for static assets (JS, CSS, images)
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request).then((response) => {
        // Cache successful responses for assets
        if (response.ok && (url.pathname.includes('/assets/') || url.pathname.endsWith('.js') || url.pathname.endsWith('.css'))) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      });
    })
  );
});

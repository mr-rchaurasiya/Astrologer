const CACHE_NAME = 'astrologer-static-v14';
const DYNAMIC_CACHE = 'astrologer-dynamic-v14';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
];

// Sensitive endpoints that MUST NEVER be cached in service worker
const SENSITIVE_PATTERNS = [
  '/api/v1/auth/',
  '/api/v1/payments/',
  '/api/v1/subscription/',
  '/api/v1/account/',
  '/api/v1/ai/chat',
  '/api/v1/ai/voice',
  '/api/v1/admin/',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== DYNAMIC_CACHE)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Exclude non-GET requests and browser extensions
  if (event.request.method !== 'GET' || !url.protocol.startsWith('http')) {
    return;
  }

  // Never cache sensitive authentication, payment, or private AI data
  if (SENSITIVE_PATTERNS.some((pattern) => url.pathname.includes(pattern))) {
    return;
  }

  // Handle static assets & navigation requests: Network First with Cache Fallback
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (
          networkResponse &&
          networkResponse.status === 200 &&
          (url.pathname.endsWith('.js') ||
            url.pathname.endsWith('.css') ||
            url.pathname.endsWith('.svg') ||
            url.pathname.endsWith('.png') ||
            url.pathname.endsWith('.ico') ||
            url.pathname.endsWith('.woff2'))
        ) {
          const responseToCache = networkResponse.clone();
          caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(async () => {
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) {
          return cachedResponse;
        }
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html');
        }
        return new Response(JSON.stringify({ offline: true, message: 'You are currently offline.' }), {
          status: 503,
          headers: { 'Content-Type': 'application/json' },
        });
      })
  );
});

// Phase 14: Web Push Notification Event Listener
self.addEventListener('push', (event) => {
  let payload = {
    title: 'Astrologer Alert',
    body: 'New astrological update available.',
    icon: '/icon-192.png',
    badge: '/favicon.ico',
    url: '/dashboard',
  };

  if (event.data) {
    try {
      payload = { ...payload, ...event.data.json() };
    } catch {
      payload.body = event.data.text();
    }
  }

  const options = {
    body: payload.body,
    icon: payload.icon || '/icon-192.png',
    badge: payload.badge || '/favicon.ico',
    data: { url: payload.url || '/dashboard' },
  };

  event.waitUntil(self.registration.showNotification(payload.title, options));
});

// Notification Click Deep Link Routing
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/dashboard';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

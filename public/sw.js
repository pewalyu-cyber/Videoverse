/**
 * VideoVerse 2.0 - Service Worker
 * Cache versioning, App Shell caching & offline resilience.
 */

const CACHE_NAME = 'videoverse-v2.0-cache-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192.svg',
  '/icons/icon-512.svg'
];

// Install event: Pre-cache core app shell assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[ServiceWorker] Pre-cache warning:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// Activate event: Clean up legacy caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[ServiceWorker] Removing old cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event: Network-first with cache fallback for app shell, never cache YouTube streams or auth
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Never cache YouTube media, analytics, or Google APIs
  if (
    url.hostname.includes('youtube.com') ||
    url.hostname.includes('googlevideo.com') ||
    url.hostname.includes('ytimg.com') ||
    url.hostname.includes('googleapis.com') ||
    url.hostname.includes('firebaseio.com') ||
    url.hostname.includes('identitytoolkit') ||
    event.request.method !== 'GET'
  ) {
    return; // Pass through to standard browser network
  }

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // If response is valid and from same origin or CDN assets, cache a copy
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(async () => {
        // Network failed: Try serving from cache
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) {
          return cachedResponse;
        }

        // If navigating to an HTML page while offline, return cached index.html
        if (event.request.headers.get('accept')?.includes('text/html')) {
          const fallbackShell = await caches.match('/');
          if (fallbackShell) return fallbackShell;
        }

        return new Response(
          JSON.stringify({
            error: 'Offline',
            message: 'You are currently offline. Check your internet connection.'
          }),
          {
            status: 503,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      })
  );
});

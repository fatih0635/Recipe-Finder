const CACHE_NAME = 'recipe-app-v1';
const DYNAMIC_CACHE = 'dynamic-cache-v1';

const ASSETS = [
  '/',
  '/index.html',
  '/offline.html',
  '/styles/style.css',
  '/scripts/app.js',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
];

// Install Event - Static Files Caching
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Caching static assets...');
      return cache.addAll(ASSETS);
    })
  );
});

// Activate Event - Clean Old Caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cache) => cache !== CACHE_NAME && cache !== DYNAMIC_CACHE)
          .map((cache) => caches.delete(cache))
      );
    })
  );
  console.log('Service Worker activated.');
});

// Fetch Event - Handle Dynamic and Offline Requests
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // API çağrıları için
  if (url.hostname === 'api.opencagedata.com' || url.hostname === 'api.spoonacular.com') {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        return (
          cachedResponse ||
          fetch(event.request)
            .then((response) => {
              return caches.open(DYNAMIC_CACHE).then((cache) => {
                cache.put(event.request, response.clone());
                return response;
              });
            })
            .catch(() => caches.match('/offline.html'))
        );
      })
    );
    return;
  }

  // Statik varlıklar için
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request)
        .then((networkResponse) => {
          if (!networkResponse || networkResponse.status !== 200) {
            return caches.match('/offline.html');
          }

          return caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        })
        .catch(() => caches.match('/offline.html'));
    })
  );
});

// Sync Event
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-recipes') {
    event.waitUntil(syncRecipes());
  }
});

async function syncRecipes() {
  console.log('Syncing recipes...');
  // Add IndexedDB or local database sync logic here
}
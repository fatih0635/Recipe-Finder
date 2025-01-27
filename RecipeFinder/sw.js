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

const API_HOSTS = ['api.spoonacular.com', 'api.opencagedata.com'];

// Install Event - Static Files Caching
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Caching static assets...');
      return cache.addAll(ASSETS);
    })
  );
});

// Activate Event - Clean Old Caches and Preload
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

  // API Requests (network-first strategy)
  if (API_HOSTS.includes(url.hostname)) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          return caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(event.request, response.clone());
            return response;
          });
        })
        .catch(() => caches.match('/offline.html'))
    );
    return;
  }

  // Static Files (cache-first strategy)
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return (
        cachedResponse ||
        fetch(event.request).then((networkResponse) => {
          return caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        }).catch(() => caches.match('/offline.html'))
      );
    })
  );
});

// Sync Event - Background Sync Logic
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-recipes') {
    event.waitUntil(syncRecipes());
  }
});

// Sync Recipes Function
async function syncRecipes() {
  console.log('Syncing recipes...');
  // Example: Fetch unsynced recipes from IndexedDB and sync with API
  const db = await openIndexedDB(); // Assuming this function exists
  const unsyncedRecipes = await getUnsyncedRecipes(db); // Example function
  unsyncedRecipes.forEach(async (recipe) => {
    try {
      const response = await fetch('https://api.example.com/sync', {
        method: 'POST',
        body: JSON.stringify(recipe),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        console.log('Recipe synced:', recipe);
        markRecipeAsSynced(db, recipe.id); // Example function
      }
    } catch (error) {
      console.error('Failed to sync recipe:', recipe, error);
    }
  });
}

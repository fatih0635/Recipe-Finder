const CACHE_NAME = 'recipe-app-v3'; // 📌 Versiyon artırıldı
const DYNAMIC_CACHE = 'dynamic-cache-v3';

const ASSETS = [
  '/',
  '/index.html',
  '/offline.html',  // 📌 Offline sayfası önbelleğe ekleniyor
  '/styles/style.css',
  '/scripts/app.js',
  '/icons/icon-144x144.png',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
];

// 📌 API çağrıları için izin verilen domainler
const API_HOSTS = ['api.spoonacular.com', 'api.opencagedata.com'];

// ✅ Install Event - Statik Dosyaları Önbelleğe Alma
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('📦 Caching static assets...');
      return cache.addAll(ASSETS);
    }).catch((err) => {
      console.error('❌ Cache Storage Error:', err);
    })
  );
  self.skipWaiting(); // Yeni service worker hemen aktif olsun
});

// ✅ Activate Event - Eski Önbellekleri Temizle
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
  console.log('⚡ Service Worker activated.');
  return self.clients.claim();
});

// ✅ Fetch Event - Offline Desteği Sağla
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // 🌍 API çağrıları için (Ağ Öncelikli Strateji)
  if (API_HOSTS.includes(url.hostname)) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          return caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(event.request, response.clone());
            return response;
          });
        })
        .catch(() => caches.match('/offline.html')) // 🔴 Eğer internet yoksa offline.html döndür
    );
    return;
  }

  // 🗂️ Statik Dosyalar için (Önbellek Öncelikli Strateji)
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request)
        .then((networkResponse) => {
          return caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        })
        .catch(() => caches.match('/offline.html')); // 🔴 Eğer sayfa isteği ise, offline sayfasını göster
    })
  );
});

// ✅ Background Sync - Tarifleri Arkaplanda Senkronize Etme
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-recipes') {
    event.waitUntil(syncRecipes());
  }
});

async function syncRecipes() {
  console.log('🔄 Syncing recipes...');
  // 📌 Buraya IndexedDB senkronizasyon kodlarını ekleyebilirsin
}

// ✅ Push Notification (Opsiyonel)
self.addEventListener('push', (event) => {
  const options = {
    body: '🍽️ Yeni bir tarif var!',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-192x192.png'
  };
  event.waitUntil(
    self.registration.showNotification('Recipe Finder', options)
  );
});

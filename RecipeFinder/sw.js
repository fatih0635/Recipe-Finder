const CACHE_NAME = "recipe-finder-cache-v1";
const urlsToCache = [
    "/",
    "/index.html",
    "/styles/style.css",
    "/scripts/app.js",
];

// Cache Kaydet
self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log("Cache oluşturuldu.");
            return cache.addAll(urlsToCache);
        })
    );
});

// Cache'den Alma
self.addEventListener("fetch", event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request);
        })
    );
});

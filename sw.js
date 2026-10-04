const CACHE_NAME = 'pzu-calc-cache';
const urlsToCache = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './calc-engine.js',
  './manifest.json',
  './icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});

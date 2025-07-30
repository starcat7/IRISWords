const CACHE_NAME = 'iriswords-v2';
const FILES_TO_CACHE = [
  '.',
  'index.html',
  'style.css',
  'main.js',
  'manifest.json',
  'data/books.json',
  'data/duo.json',
  'data/toeic_core.json',
  'src/img/icon-512.png',
  'src/img/duo.jpg',
  'src/img/toeic_core.jpg',
];
self.addEventListener('install', evt => {
  evt.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(FILES_TO_CACHE))
  );
  self.skipWaiting();
});
self.addEventListener('fetch', evt => {
  evt.respondWith(
    caches.match(evt.request).then(resp => resp || fetch(evt.request))
  );
});
self.addEventListener('activate', evt => {
  evt.waitUntil(self.clients.claim());
});

const CACHE_NAME = 'curitiba-bus-v1';
const ASSETS = [
    './',
    './index.html',
    './app.js',
    './manifest.json',
    './icon.png'
];

// Instala o Service Worker e guarda os arquivos no cache
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
    );
});

// Responde com o cache se estiver offline (para os arquivos do app, não para os horários)
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request);
        })
    );
});

var CACHE_NAME = "cacher_v1";
var urlsToCache = [
    '/index.html',
    '/js/axios.js',
    '/js/jquery.min.js',
    '/js/currency.js',
    '/js/indexeddb.js',
    '/css/currency.css',
];

self.addEventListener('fetch', function (event) {
    event.respondWith(caches.match(event.request)
        .then(function (response) {
            console.log('sending the caches');
            if (response) {
                return response;
            }
            return fetch(event.request);
        }));
});

self.addEventListener('install', function (event) {
    console.log('installing');
    event.waitUntil(caches.open(CACHE_NAME).then(function (cache) {
        console.log(urlsToCache);
        return cache.addAll(urlsToCache);
    }));
});

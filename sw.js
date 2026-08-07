/*
 * CYBERPATH service worker — offline-first for same-origin assets.
 * Bump CACHE on every deploy to invalidate (no build step, so this is manual).
 * Third-party links (TryHackMe, YouTube, …) are never intercepted — they open to
 * the live web in new tabs.
 */
var CACHE = 'cyberpath-v3';
var ASSETS = [
  './', './index.html',
  './assets/css/styles.css',
  './assets/js/data.js', './assets/js/match.js', './assets/js/app.js',
  './manifest.webmanifest',
  './assets/img/icon-192.png', './assets/img/icon-512.png'
];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(ASSETS); }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  if (new URL(req.url).origin !== location.origin) return; // never touch third-party requests
  e.respondWith(
    caches.match(req).then(function (hit) {
      return hit || fetch(req).then(function (res) {
        var copy = res.clone();
        caches.open(CACHE).then(function (c) { c.put(req, copy); });
        return res;
      }).catch(function () {
        if (req.mode === 'navigate') return caches.match('./index.html');
      });
    })
  );
});

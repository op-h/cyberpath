/*
 * CYBERPATH service worker — network-first with offline fallback.
 * Strategy: always try the network first so visitors get the latest deploy immediately,
 * and fall back to the cache only when offline. (The previous cache-first strategy could
 * pin visitors to a stale version until CACHE was manually bumped.)
 * Bump CACHE on every deploy so the old cache is purged on activate.
 * Third-party links (TryHackMe, YouTube, …) are never intercepted — they open to the live web.
 */
var CACHE = 'cyberpath-v7';
var ASSETS = [
  './', './index.html',
  './assets/css/styles.css',
  './assets/js/data.js', './assets/js/match.js',
  './assets/js/i18n-content.js', './assets/js/i18n.js', './assets/js/app.js',
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
  // Network-first: fresh content when online, cached copy when offline.
  e.respondWith(
    fetch(req).then(function (res) {
      // Cache successful, same-origin ("basic") responses for offline use — never 404s/opaque.
      if (res && res.ok && res.type === 'basic') {
        var copy = res.clone();
        caches.open(CACHE).then(function (c) { c.put(req, copy); });
      }
      return res;
    }).catch(function () {
      return caches.match(req).then(function (hit) {
        return hit || (req.mode === 'navigate' ? caches.match('./index.html') : Response.error());
      });
    })
  );
});

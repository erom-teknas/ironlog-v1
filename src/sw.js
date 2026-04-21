// IronLog Service Worker — cache-first + rest timer notifications
// self.__WB_MANIFEST is injected by vite-plugin-pwa with all built asset URLs

var CACHE = 'ironlog-v10';

self.addEventListener('install', function(e) {
  var entries = self.__WB_MANIFEST || [];
  var urls = entries.map(function(entry) { return entry.url; });
  if (urls.indexOf('/') === -1) urls.push('/');
  e.waitUntil(
    caches.open(CACHE).then(function(cache) {
      return Promise.allSettled(
        urls.map(function(url) {
          return cache.add(url).catch(function() {});
        })
      );
    }).then(function() { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE; })
            .map(function(k) { return caches.delete(k); })
      );
    }).then(function() { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function(e) {
  // Only intercept same-origin and basic requests
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(function(cached) {
      if (cached) return cached;
      return fetch(e.request).then(function(r) {
        if (r && r.ok && (r.type === 'basic' || r.type === 'cors')) {
          var rc = r.clone();
          caches.open(CACHE).then(function(c) { c.put(e.request, rc); });
        }
        return r;
      }).catch(function() {
        return new Response('Offline — open IronLog online first.', {
          status: 503,
          headers: { 'Content-Type': 'text/plain' },
        });
      });
    })
  );
});

// ── Rest-timer notifications ───────────────────────────────────────────────────
var _notifTimer = null;
self.addEventListener('message', function(e) {
  if (!e.data) return;
  if (e.data.type === 'SKIP_WAITING') { self.skipWaiting(); return; }
  if (e.data.type === 'SCHEDULE_NOTIF') {
    if (_notifTimer) { clearTimeout(_notifTimer); _notifTimer = null; }
    var delay = parseInt(e.data.delay) || 0;
    var label = e.data.label || 'Rest done — time for your next set!';
    if (delay <= 0) return;
    _notifTimer = setTimeout(function() {
      _notifTimer = null;
      self.registration.showNotification('IronLog — Rest Done', {
        body: label,
        icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><rect width="512" height="512" rx="120" fill="%237C6EFA"/><text x="256" y="340" text-anchor="middle" font-size="280">🏋️</text></svg>',
        tag: 'ironlog-rest',
        renotify: true,
        silent: false,
        vibrate: [200, 100, 200],
      });
    }, delay);
    return;
  }
  if (e.data.type === 'CANCEL_NOTIF') {
    if (_notifTimer) { clearTimeout(_notifTimer); _notifTimer = null; }
    return;
  }
  // Workout reminder: fires after a delay (ms) if user hasn't trained
  if (e.data.type === 'SCHEDULE_REMINDER') {
    var rDelay = parseInt(e.data.delay) || 0;
    var rLabel = e.data.label || "Time to train 💪 You haven't logged a workout in a while.";
    if (rDelay <= 0) return;
    setTimeout(function() {
      self.registration.showNotification('IronLog — Time to Train 💪', {
        body: rLabel,
        icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><rect width="512" height="512" rx="120" fill="%237C6EFA"/><text x="256" y="340" text-anchor="middle" font-size="280">🏋️</text></svg>',
        tag: 'ironlog-reminder',
        renotify: false,
        silent: false,
        vibrate: [100, 50, 100],
      });
    }, rDelay);
    return;
  }
});

self.addEventListener('notificationclick', function(e) {
  e.notification.close();
  e.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clients) {
      for (var i = 0; i < clients.length; i++) {
        if ('focus' in clients[i]) return clients[i].focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow('/');
    })
  );
});

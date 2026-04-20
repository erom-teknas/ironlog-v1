// IronLog Service Worker — cache-first + rest timer notifications
// Must be served from /sw.js — iOS Safari blocks blob: URL workers

var CACHE = 'ironlog-v8';
var CDN_SCRIPTS = [
  'https://cdnjs.cloudflare.com/ajax/libs/react/18.2.0/umd/react.production.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.2.0/umd/react-dom.production.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/7.23.5/babel.min.js'
];

self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE).then(function(cache) {
      var pageUrl = self.registration.scope;
      var toCache = [pageUrl].concat(CDN_SCRIPTS);
      return Promise.allSettled(
        toCache.map(function(url) {
          return fetch(url, {mode:'cors'})
            .then(function(r){if(r&&r.ok)cache.put(url,r);})
            .catch(function(){});
        })
      );
    }).then(function(){return self.skipWaiting();})
  );
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(
        keys.filter(function(k){return k!==CACHE;}).map(function(k){return caches.delete(k);})
      );
    }).then(function(){return self.clients.claim();})
  );
});

self.addEventListener('fetch', function(e) {
  var url=e.request.url, scope=self.registration.scope;
  var isOurPage=url===scope||url===scope.replace(/\/$/,'')||url.startsWith(scope);
  var isCdnScript=CDN_SCRIPTS.some(function(s){return url===s;});
  if(!isOurPage&&!isCdnScript)return;
  e.respondWith(
    caches.match(e.request).then(function(cached){
      if(cached){
        // CDN scripts are versioned/immutable — no need to revalidate them
        if(!isCdnScript){
          fetch(e.request,{mode:'cors'}).then(function(r){
            if(r&&r.ok)caches.open(CACHE).then(function(c){c.put(e.request,r);});
          }).catch(function(){});
        }
        return cached;
      }
      return fetch(e.request,{mode:'cors'}).then(function(r){
        if(r&&r.ok)caches.open(CACHE).then(function(c){c.put(e.request.clone(),r.clone());});
        return r;
      }).catch(function(){return new Response('Offline — open IronLog online first.',{status:503});});
    })
  );
});

// ── Rest-timer notifications ──────────────────────────────────────────────────
var _notifTimer=null;
self.addEventListener('message',function(e){
  if(!e.data)return;
  if(e.data.type==='SKIP_WAITING'){self.skipWaiting();return;}
  if(e.data.type==='SCHEDULE_NOTIF'){
    if(_notifTimer){clearTimeout(_notifTimer);_notifTimer=null;}
    var delay=parseInt(e.data.delay)||0;
    var label=e.data.label||'Rest done — time for your next set!';
    if(delay<=0)return;
    _notifTimer=setTimeout(function(){
      _notifTimer=null;
      self.registration.showNotification('IronLog — Rest Done',{
        body:label,
        icon:'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><rect width="512" height="512" rx="120" fill="%237C6EFA"/><text x="256" y="340" text-anchor="middle" font-size="280">🏋️</text></svg>',
        tag:'ironlog-rest',
        renotify:true,
        silent:false,
        vibrate:[200,100,200]
      });
    },delay);
    return;
  }
  if(e.data.type==='CANCEL_NOTIF'){
    if(_notifTimer){clearTimeout(_notifTimer);_notifTimer=null;}
    return;
  }
});

self.addEventListener('notificationclick',function(e){
  e.notification.close();
  e.waitUntil(
    self.clients.matchAll({type:'window',includeUncontrolled:true}).then(function(clients){
      for(var i=0;i<clients.length;i++){if('focus'in clients[i])return clients[i].focus();}
      if(self.clients.openWindow)return self.clients.openWindow('/');
    })
  );
});

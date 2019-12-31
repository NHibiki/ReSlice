const CACHE_VER = '3.0.1';
const CACHE_FULLNAME = 'reslice'+'-'+CACHE_VER;

// install sw
self.addEventListener('install', e => {
  self.skipWaiting();
  console.log('[SW]', 'ReSlice Installing...');
  e.waitUntil(
    caches.open(CACHE_FULLNAME).then(cache => {
      return fetch('/asset-manifest.json').then(response => {
        return response.json();
      }).then(files => {
        return cache.addAll([
          '/',
          '/manifest.json',
          '/index.html',
          '/highlight/highlight.js',
          '/fonts/loader.css',
          '/fonts/Ubuntu/Ubuntu-Bold.ttf',
          '/fonts/Ubuntu/Ubuntu-Light.ttf',
          '/favicon.jpg',
          ...Object.keys(files)
            .map(k => k.endsWith('.map') ? null : ('/' + files[k]))
            .filter(Boolean)]);
      });
    })
  );
});

// hijack requests
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request)
      .then(response => {
        return response
          ? response
          : fetch(e.request)
            .then(resp => resp)
            .catch(() => {
              if (e.request.url.split('/').pop().indexOf('.') > -1) {
                throw Error('Network Failure.');
              } else {
                return caches.match('/index.html');
              }
            })
      })
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.map(key => {
        if (CACHE_FULLNAME !== key) {
          return caches.delete(key);
        }
      })
    )).then(() => {
      console.log('[SW]', 'ReSlice Activated.', CACHE_VER);
    })
  );
});
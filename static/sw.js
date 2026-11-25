const CACHE_PREFIX = 'waiting-for-home-mobile-';
const APP_CACHE = `${CACHE_PREFIX}v21`;
const SHELL = ['/', '/manifest.webmanifest',
  '/static/app.css', '/static/mobile.js', '/static/swipe.js',
  '/static/insights.js', '/static/profile.js', '/static/icon-192.png', '/static/icon-512.png',
  '/static/icon-maskable-512.png', '/static/nav-icons.png', '/static/account.js', '/static/actions.js',
  '/static/qr.js', '/static/learn.js'];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(APP_CACHE).then(cache => cache.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith(CACHE_PREFIX) && key !== APP_CACHE)
    .map(key => caches.delete(key)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  const shellUrl = url.pathname;
  if (!SHELL.includes(shellUrl)) return;
  event.respondWith(fetch(event.request).then(async response => {
    if (response.ok) {
      const cache = await caches.open(APP_CACHE);
      await cache.put(shellUrl, response.clone());
    }
    return response;
  }).catch(async () => (await caches.match(shellUrl)) || Response.error()));
});

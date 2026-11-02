/* Standards-based Web Push service worker. A push must always display a notification. */
const CACHE = 'punnu-birthday-v9';
const SHELL = ['./','./index.html','./styles.css','./chapter06.css','./app.js','./chapter06.js','./chapter07_12.css','./chapter07_12.js','./config.js','./manifest.json','./assets/icon-192.png'];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== self.location.origin) return;
  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request).catch(() => caches.match('./index.html')));
    return;
  }
  event.respondWith(fetch(event.request).then(response => {
    if (response.ok) { const copy = response.clone(); caches.open(CACHE).then(cache => cache.put(event.request, copy)); }
    return response;
  }).catch(() => caches.match(event.request)));
});
self.addEventListener('push', event => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch { data = { body: event.data?.text() || '' }; }
  const title = String(data.title || 'A little note for Punnu ♡').slice(0, 110);
  const body = String(data.body || 'A new little surprise is waiting for you.').slice(0, 240);
  const safeUrl = new URL('./', self.registration.scope);
  event.waitUntil(self.registration.showNotification(title, {
    body, icon: './assets/icon-192.png', badge: './assets/icon-192.png',
    tag: 'punnu-' + String(data.chapter || 'update'),
    renotify: true,
    data: { url: safeUrl.href },
    vibrate: [100, 40, 80]
  }));
});
self.addEventListener('notificationclick', event => {
  event.notification.close();
  const destination = event.notification.data?.url || new URL('./', self.registration.scope).href;
  event.waitUntil(self.clients.matchAll({type: 'window', includeUncontrolled: true}).then(clients => {
    const found = clients.find(client => client.url.startsWith(destination));
    return found ? found.focus() : self.clients.openWindow(destination);
  }));
});

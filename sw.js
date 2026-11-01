// Stage 1 service worker: prepares the app shell.
// Push event handling will be added after we configure the push provider.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

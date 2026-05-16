const REDIRECT_TARGET = "/apps/preset-mutator/ui/audio/";

self.addEventListener("install", (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.map((key) => caches.delete(key)))));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") {
    return;
  }

  const url = new URL(request.url);
  if (url.origin !== self.location.origin || url.pathname.endsWith("/service-worker.js")) {
    return;
  }

  if (url.pathname.startsWith("/apps/audio-alchemy/ui")) {
    event.respondWith(Response.redirect(REDIRECT_TARGET, 301));
  }
});

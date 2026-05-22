const CACHE_NAME = "preset-mutator-shell-v6";
const SHELL_ASSETS = [
  "./index.html",
  "./styles.css",
  "./app.js",
  "./preset-mutator-knob.js",
  "./scratch/index.html",
  "./scratch/styles.css",
  "./scratch/app.js",
  "./mutate/index.html",
  "./mutate/styles.css",
  "./mutate/app.js",
  "./audio/index.html",
  "./audio/app.js",
  "./engine/common.js",
  "./engine/quality.js",
  "./engine/scratch-engine.js",
  "./engine/audio-engine.js",
  "./engine/preset-mutate-engine.js",
  "./engine/vital-export.js",
  "../assets/seeds/vital/raw/KS%20Dread%20Lantern.vital",
  "../assets/seeds/vital/raw/KS%20Frozen%20Hollow.vital",
  "../assets/seeds/vital/raw/KS%20Iron%20Wake.vital",
  "../assets/seeds/vital/raw/KS%20Shadow%20Archive.vital",
  "./manifest.webmanifest",
  "./preset-mutator-mark.svg",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_ASSETS)),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key)),
      ),
    ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") {
    return;
  }

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) {
    return;
  }

  const shouldPreferNetwork =
    request.mode === "navigate" ||
    ["document", "script", "style"].includes(request.destination);

  if (shouldPreferNetwork) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (!response.ok && request.mode === "navigate") {
            return caches.match("./index.html").then((cached) => cached || response);
          }

          if (!response.ok || response.type === "opaque") {
            return response;
          }

          const cloned = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, cloned));
          return response;
        })
        .catch(() =>
          caches.match(request).then((cached) => {
            if (cached) {
              return cached;
            }
            if (request.mode === "navigate") {
              return caches.match("./index.html").then((fallback) => fallback || Response.error());
            }
            return Response.error();
          }),
        ),
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) {
        return cached;
      }

      return fetch(request).then((response) => {
        if (!response.ok || response.type === "opaque") {
          return response;
        }

        const cloned = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, cloned));
        return response;
      });
    }),
  );
});

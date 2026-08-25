import fs from "node:fs";
import path from "node:path";

const rootDir = process.cwd();
const publicDir = path.join(rootDir, "public");
const presetMutatorSourceDir = path.join(rootDir, "apps/preset-mutator/public");
const presetMutatorPublicDir = path.join(publicDir, "preset-mutator");
const presetMutatorProSourceDir = path.join(rootDir, "apps/preset-mutator-pro/public");
const presetMutatorProPublicDir = path.join(publicDir, "preset-mutator-pro");
const presetMutatorLegacyPublicDir = path.join(publicDir, "apps/preset-mutator");
const presetMutatorLegacyUiDir = path.join(presetMutatorLegacyPublicDir, "ui");
const waveMutatorSourceDir = path.join(rootDir, "apps/wave-mutator/public");
const waveMutatorPublicDir = path.join(publicDir, "tools/wave-mutator");
const patternMutatorSourceDir = path.join(rootDir, "apps/pattern-mutator/public");
const patternMutatorPublicDir = path.join(publicDir, "tools/pattern-mutator");

const requiredPublicEntries = [
  "favicon.svg",
  "favicon.ico",
  "favicon-16x16.png",
  "favicon-32x32.png",
  "apple-touch-icon.png",
  "logo-128.svg",
  "kreativ-sound-logo-128.svg",
  "kreativ-sound-wordmark.svg",
  "kreativ-sound-product-badge.svg",
  "site.webmanifest",
  "og-image.svg",
  "site.js",
  "share.js",
  "robots.txt",
  "CNAME",
  "assets",
  "apps",
  "preset-mutator",
  "preset-mutator-pro"
];

const generatedFiles = ["sitemap.xml"];

if (!fs.existsSync(publicDir)) {
  throw new Error("Missing public/ directory. Static site assets should be committed under public/.");
}

if (!fs.existsSync(presetMutatorSourceDir)) {
  throw new Error("Missing apps/preset-mutator/public. Preset Mutator source must be available before syncing public assets.");
}

if (!fs.existsSync(presetMutatorProSourceDir)) {
  throw new Error("Missing apps/preset-mutator-pro/public. Preset Mutator PRO source must be available before syncing public assets.");
}

if (!fs.existsSync(waveMutatorSourceDir)) {
  throw new Error("Missing apps/wave-mutator/public. Wave Mutator source must be available before syncing public assets.");
}

if (!fs.existsSync(patternMutatorSourceDir)) {
  throw new Error("Missing apps/pattern-mutator/public. Pattern Mutator source must be available before syncing public assets.");
}

function redirectPage(target, message) {
  const canonical = `https://kreativsound.com${target}`;
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Preset Mutator moved</title>
    <meta name="description" content="This old Preset Mutator URL has moved to the canonical Kreativ Sound tool page." />
    <meta name="robots" content="noindex, follow" />
    <link rel="canonical" href="${canonical}" />
    <meta http-equiv="refresh" content="0; url=${target}" />
    <script>
      window.location.replace(${JSON.stringify(target)});
    </script>
  </head>
  <body>
    <main>
      <h1>Preset Mutator moved</h1>
      <p>${message}</p>
      <p><a href="${target}">Open Preset Mutator</a></p>
    </main>
  </body>
</html>
`;
}

function writeRedirect(relativePath, target, message) {
  const filePath = path.join(presetMutatorLegacyUiDir, relativePath);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, redirectPage(target, message));
}

function writeLegacyServiceWorker() {
  const serviceWorker = `function targetFor(pathname) {
  if (pathname.startsWith("/apps/preset-mutator/ui/audio")) {
    return "/preset-mutator/audio/";
  }
  if (pathname.startsWith("/apps/preset-mutator/ui/mutate")) {
    return "/preset-mutator/mutate/";
  }
  if (pathname.startsWith("/apps/preset-mutator/ui/scratch")) {
    return "/preset-mutator/scratch/";
  }
  return "/preset-mutator/";
}

self.addEventListener("install", (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.map((key) => caches.delete(key)))));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.registration.unregister().then(() => self.clients.claim()));
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

  if (url.pathname.startsWith("/apps/preset-mutator/ui")) {
    event.respondWith(Response.redirect(targetFor(url.pathname), 301));
  }
});
`;
  fs.writeFileSync(path.join(presetMutatorLegacyUiDir, "service-worker.js"), serviceWorker);
}

function writeLegacyPresetMutatorRedirects() {
  fs.rmSync(presetMutatorLegacyPublicDir, { recursive: true, force: true });
  writeRedirect("index.html", "/preset-mutator/", "The old app path now redirects to the canonical Preset Mutator URL.");
  writeRedirect("scratch/index.html", "/preset-mutator/scratch/", "The old From Scratch path now redirects to the canonical Preset Mutator URL.");
  writeRedirect("mutate/index.html", "/preset-mutator/mutate/", "The old Mutate Preset path now redirects to the canonical Preset Mutator URL.");
  writeRedirect("audio/index.html", "/preset-mutator/audio/", "The old Audio to Preset path now redirects to the canonical Preset Mutator URL.");
  writeLegacyServiceWorker();
}

fs.rmSync(presetMutatorPublicDir, { recursive: true, force: true });
fs.mkdirSync(path.dirname(presetMutatorPublicDir), { recursive: true });
fs.cpSync(presetMutatorSourceDir, presetMutatorPublicDir, { recursive: true });
fs.mkdirSync(path.join(presetMutatorPublicDir, "scratch"), { recursive: true });
fs.copyFileSync(
  path.join(presetMutatorSourceDir, "index.html"),
  path.join(presetMutatorPublicDir, "scratch/index.html")
);

fs.rmSync(presetMutatorProPublicDir, { recursive: true, force: true });
fs.mkdirSync(path.dirname(presetMutatorProPublicDir), { recursive: true });
fs.cpSync(presetMutatorProSourceDir, presetMutatorProPublicDir, { recursive: true });
fs.mkdirSync(path.join(presetMutatorProPublicDir, "scratch"), { recursive: true });
fs.copyFileSync(
  path.join(presetMutatorProSourceDir, "index.html"),
  path.join(presetMutatorProPublicDir, "scratch/index.html")
);
writeLegacyPresetMutatorRedirects();

fs.rmSync(waveMutatorPublicDir, { recursive: true, force: true });
fs.mkdirSync(path.dirname(waveMutatorPublicDir), { recursive: true });
fs.cpSync(waveMutatorSourceDir, waveMutatorPublicDir, { recursive: true });

fs.rmSync(patternMutatorPublicDir, { recursive: true, force: true });
fs.mkdirSync(path.dirname(patternMutatorPublicDir), { recursive: true });
fs.cpSync(patternMutatorSourceDir, patternMutatorPublicDir, { recursive: true });

const missing = requiredPublicEntries.filter((entry) => !fs.existsSync(path.join(publicDir, entry)));
if (missing.length) {
  throw new Error(`Missing public assets: ${missing.join(", ")}`);
}

for (const filePath of generatedFiles) {
  const sourcePath = path.join(rootDir, filePath);
  if (!fs.existsSync(sourcePath)) {
    continue;
  }
  fs.copyFileSync(sourcePath, path.join(publicDir, filePath));
}

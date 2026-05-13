import fs from "node:fs";
import path from "node:path";

const rootDir = process.cwd();
const publicDir = path.join(rootDir, "public");

const filesToCopy = [
  "favicon.svg",
  "favicon-16x16.png",
  "favicon-32x32.png",
  "apple-touch-icon.png",
  "logo-128.svg",
  "kreativ-sound-logo-128.svg",
  "kreativ-sound-wordmark.svg",
  "kreativ-sound-product-badge.svg",
  "site.webmanifest",
  "og-image.svg",
  "search-index.json",
  "site.js",
  "share.js",
  "robots.txt",
  "sitemap.xml",
  "CNAME",
  "404.html"
];

const directoriesToCopy = [
  "assets",
];

const appDirectoriesToCopy = [
  "apps/preset-mutator",
  "apps/wave-fracture",
];

const appRedirectFilesToCopy = [
  "apps/audio-alchemy/ui/index.html",
  "apps/audio-alchemy/ui/service-worker.js",
  "apps/presetmutator/index.html",
  "apps/presetmutator/ui/index.html",
];

function resetDirectory(targetDir) {
  fs.rmSync(targetDir, { recursive: true, force: true });
  fs.mkdirSync(targetDir, { recursive: true });
}

function copyEntry(relativePath) {
  const sourcePath = path.join(rootDir, relativePath);
  const targetPath = path.join(publicDir, relativePath);
  fs.cpSync(sourcePath, targetPath, { recursive: true });
}

function copyIfExists(relativePath) {
  const sourcePath = path.join(rootDir, relativePath);
  if (!fs.existsSync(sourcePath)) {
    return;
  }
  const targetPath = path.join(publicDir, relativePath);
  fs.mkdirSync(path.dirname(targetPath), { recursive: true });
  fs.cpSync(sourcePath, targetPath, { recursive: true });
}

resetDirectory(publicDir);

for (const filePath of filesToCopy) {
  copyEntry(filePath);
}

for (const directoryPath of directoriesToCopy) {
  copyEntry(directoryPath);
}

for (const directoryPath of appDirectoriesToCopy) {
  copyIfExists(directoryPath);
}

for (const filePath of appRedirectFilesToCopy) {
  copyIfExists(filePath);
}

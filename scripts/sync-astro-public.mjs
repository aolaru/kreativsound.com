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
  "og-image.svg",
  "site.js",
  "share.js",
  "robots.txt",
  "sitemap.xml",
  "CNAME",
  "404.html",
  "about.html",
  "contact.html",
  "learn.html",
  "news.html",
  "sound.html",
  "tools.html"
];

const directoriesToCopy = [
  "apps",
  "assets",
  "products"
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

resetDirectory(publicDir);

for (const filePath of filesToCopy) {
  copyEntry(filePath);
}

for (const directoryPath of directoriesToCopy) {
  copyEntry(directoryPath);
}

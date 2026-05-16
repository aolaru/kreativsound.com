import fs from "node:fs";
import path from "node:path";

const rootDir = process.cwd();
const publicDir = path.join(rootDir, "public");

const requiredPublicEntries = [
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
  "CNAME",
  "assets",
  "apps"
];

const generatedFiles = ["sitemap.xml"];

if (!fs.existsSync(publicDir)) {
  throw new Error("Missing public/ directory. Static site assets should be committed under public/.");
}

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

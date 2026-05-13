import fs from "node:fs";
import path from "node:path";

const rootDir = process.cwd();
const distDir = path.join(rootDir, "dist");
const siteOrigin = "https://kreativsound.com";

function walkHtmlFiles(dir, files = []) {
  if (!fs.existsSync(dir)) return files;

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkHtmlFiles(fullPath, files);
      continue;
    }
    if (entry.isFile() && entry.name.endsWith(".html")) {
      files.push(fullPath);
    }
  }
  return files;
}

function assetExists(pathname) {
  const normalized = pathname.replace(/^\/+/, "");
  if (!normalized) return true;

  const exactPath = path.join(distDir, normalized);
  return (
    fs.existsSync(exactPath) ||
    fs.existsSync(path.join(exactPath, "index.html")) ||
    fs.existsSync(`${exactPath}.html`)
  );
}

function internalPathFromUrl(value) {
  if (!value || value.startsWith("#")) return "";
  if (value.startsWith("mailto:") || value.startsWith("tel:")) return "";

  if (value.startsWith(siteOrigin)) {
    return new URL(value).pathname;
  }

  if (value.startsWith("/")) {
    return value.split(/[?#]/)[0];
  }

  return "";
}

const brokenLinks = [];

for (const filePath of walkHtmlFiles(distDir)) {
  const relativeFilePath = path.relative(distDir, filePath);
  const html = fs.readFileSync(filePath, "utf8");
  const attributePattern = /(?:href|src)=["']([^"']+)["']/g;
  let match;

  while ((match = attributePattern.exec(html))) {
    const pathname = internalPathFromUrl(match[1]);
    if (pathname && !assetExists(pathname)) {
      brokenLinks.push(`${relativeFilePath} -> ${match[1]}`);
    }
  }
}

if (brokenLinks.length) {
  console.error(`Broken internal links found: ${brokenLinks.length}`);
  for (const link of brokenLinks) {
    console.error(link);
  }
  process.exit(1);
}

console.log("Internal links are valid.");

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

function routeForFile(filePath) {
  const relative = path.relative(distDir, filePath).replaceAll(path.sep, "/");
  if (relative === "index.html") return "/";
  if (relative.endsWith("/index.html")) {
    return `/${relative.replace(/index\.html$/, "")}`;
  }
  return `/${relative}`;
}

function fileForPathname(pathname) {
  let normalized;
  try {
    normalized = decodeURIComponent(pathname).replace(/^\/+/, "");
  } catch {
    return null;
  }

  if (!normalized) return path.join(distDir, "index.html");

  const exactPath = path.join(distDir, normalized);
  const candidates = [
    exactPath,
    path.join(exactPath, "index.html"),
    `${exactPath}.html`
  ];
  return candidates.find((candidate) => fs.existsSync(candidate) && fs.statSync(candidate).isFile()) || null;
}

const idCache = new Map();

function idsForFile(filePath) {
  if (idCache.has(filePath)) return idCache.get(filePath);

  const html = fs.readFileSync(filePath, "utf8");
  const ids = new Set();
  const idPattern = /\bid=["']([^"']+)["']/gi;
  let match;
  while ((match = idPattern.exec(html))) {
    ids.add(match[1]);
  }
  idCache.set(filePath, ids);
  return ids;
}

const brokenLinks = [];
const brokenFragments = [];
const malformedLinks = [];

for (const filePath of walkHtmlFiles(distDir)) {
  const relativeFilePath = path.relative(distDir, filePath);
  const html = fs.readFileSync(filePath, "utf8");
  const pageUrl = new URL(routeForFile(filePath), siteOrigin);
  const attributePattern = /\b(?:href|src|action|poster)=["']([^"']+)["']/gi;
  let match;

  while ((match = attributePattern.exec(html))) {
    const value = match[1].replaceAll("&amp;", "&").trim();
    if (!value || /^(?:mailto:|tel:|javascript:|data:|blob:)/i.test(value)) continue;

    let resolved;
    try {
      resolved = new URL(value, pageUrl);
    } catch {
      malformedLinks.push(`${relativeFilePath} -> ${match[1]}`);
      continue;
    }

    if (resolved.origin !== siteOrigin) continue;

    const targetFile = fileForPathname(resolved.pathname);
    if (!targetFile) {
      brokenLinks.push(`${relativeFilePath} -> ${match[1]}`);
      continue;
    }

    if (resolved.hash && resolved.hash !== "#") {
      let fragment;
      try {
        fragment = decodeURIComponent(resolved.hash.slice(1));
      } catch {
        brokenFragments.push(`${relativeFilePath} -> ${match[1]} (invalid encoding)`);
        continue;
      }
      if (!idsForFile(targetFile).has(fragment)) {
        brokenFragments.push(`${relativeFilePath} -> ${match[1]} (missing #${fragment})`);
      }
    }
  }
}

const failures = [
  ...malformedLinks.map((link) => `Malformed internal URL: ${link}`),
  ...brokenLinks.map((link) => `Missing internal target: ${link}`),
  ...brokenFragments.map((link) => `Missing fragment target: ${link}`)
];

if (failures.length) {
  console.error(`Internal link validation failed: ${failures.length}`);
  for (const failure of failures) {
    console.error(failure);
  }
  process.exit(1);
}

console.log("Internal links and fragments are valid.");

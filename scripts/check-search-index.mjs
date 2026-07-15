import fs from "node:fs";
import path from "node:path";

const rootDir = process.cwd();
const distDir = path.join(rootDir, "dist");
const searchIndexPath = path.join(distDir, "search-index.json");
const sitemapPath = path.join(distDir, "sitemap.xml");
const siteOrigin = "https://kreativsound.com";

function fail(message) {
  failures.push(message);
}

function pathFromLoc(loc) {
  return new URL(loc).pathname;
}

const failures = [];

if (!fs.existsSync(searchIndexPath)) {
  fail("Missing dist/search-index.json. Run npm run build first.");
}

if (!fs.existsSync(sitemapPath)) {
  fail("Missing dist/sitemap.xml. Run npm run build first.");
}

let entries = [];
let sitemapPaths = [];

if (!failures.length) {
  entries = JSON.parse(fs.readFileSync(searchIndexPath, "utf8"));
  sitemapPaths = [...fs.readFileSync(sitemapPath, "utf8").matchAll(/<loc>(.*?)<\/loc>/g)]
    .map((match) => pathFromLoc(match[1]));
}

if (!Array.isArray(entries)) {
  fail("search-index.json must contain an array.");
}

const entryUrls = new Set(entries.map((entry) => entry.url));
const duplicateUrls = entries
  .map((entry) => entry.url)
  .filter((url, index, urls) => urls.indexOf(url) !== index);

for (const url of new Set(duplicateUrls)) {
  fail(`Duplicate search index URL: ${url}`);
}

for (const route of sitemapPaths) {
  if (!entryUrls.has(route)) {
    fail(`Sitemap route missing from search index: ${route}`);
  }
}

for (const requiredRoute of [
  "/sounds/",
  "/sounds/kreativ-kollection-v1",
  "/sounds/preset-mutator",
  "/tools/wave-mutator/",
  "/preset-mutator/",
  "/preset-mutator/audio/",
  "/preset-mutator/mutate/"
]) {
  if (!entryUrls.has(requiredRoute)) {
    fail(`Required search index route missing: ${requiredRoute}`);
  }
}

const browseSound = entries.find((entry) => entry.title === "Browse Sound");
if (!browseSound) {
  fail("Missing Browse Sound search entry.");
} else if (browseSound.url !== "/sounds/") {
  fail(`Browse Sound search entry points to ${browseSound.url}, expected /sounds/.`);
}

for (const entry of entries) {
  if (!entry.title || !entry.url || !entry.type || !entry.description) {
    fail(`Incomplete search entry: ${JSON.stringify(entry)}`);
  }
  if (entry.url.startsWith(siteOrigin)) {
    fail(`Search entry should use a local URL, not absolute site URL: ${entry.url}`);
  }
}

if (failures.length) {
  console.error(`Search index validation failed: ${failures.length}`);
  for (const message of failures) {
    console.error(`- ${message}`);
  }
  process.exit(1);
}

console.log(`Search index validation passed (${entries.length} entries).`);

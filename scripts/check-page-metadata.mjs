import fs from "node:fs";
import path from "node:path";

const rootDir = process.cwd();
const distDir = path.join(rootDir, "dist");
const sitemapPath = path.join(rootDir, "sitemap.xml");
const maxTitleLength = 60;
const minDescriptionLength = 70;
const maxDescriptionLength = 165;

function decodeHtml(value) {
  return value
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)))
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">");
}

function getAttribute(tag, name) {
  const pattern = new RegExp(`\\b${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)')`, "i");
  const match = tag.match(pattern);
  return match ? decodeHtml(match[1] ?? match[2] ?? "") : null;
}

function tags(html, name) {
  return html.match(new RegExp(`<${name}\\b[^>]*>`, "gi")) || [];
}

function metaContent(html, name) {
  const tag = tags(html, "meta").find((candidate) =>
    getAttribute(candidate, "name")?.toLowerCase() === name.toLowerCase()
  );
  return tag ? getAttribute(tag, "content") : null;
}

function canonicalHref(html) {
  const tag = tags(html, "link").find((candidate) =>
    (getAttribute(candidate, "rel") || "").toLowerCase().split(/\s+/).includes("canonical")
  );
  return tag ? getAttribute(tag, "href") : null;
}

function fileForUrl(url) {
  const pathname = new URL(url).pathname;
  if (pathname === "/") return path.join(distDir, "index.html");

  const relative = pathname.replace(/^\/+/, "");
  const exact = path.join(distDir, relative);
  const candidates = pathname.endsWith(".html")
    ? [exact]
    : pathname.endsWith("/")
      ? [path.join(exact, "index.html")]
      : [`${exact}.html`, path.join(exact, "index.html")];
  return candidates.find((candidate) => fs.existsSync(candidate)) || null;
}

if (!fs.existsSync(sitemapPath)) {
  console.error("sitemap.xml is required. Run npm run build first.");
  process.exit(1);
}

const sitemap = fs.readFileSync(sitemapPath, "utf8");
const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => decodeHtml(match[1]));
const failures = [];
const titles = new Map();
const descriptions = new Map();

for (const url of urls) {
  const filePath = fileForUrl(url);
  if (!filePath) {
    failures.push(`${url}: sitemap target is missing from dist`);
    continue;
  }

  const html = fs.readFileSync(filePath, "utf8");
  const titleMatches = [...html.matchAll(/<title>([\s\S]*?)<\/title>/gi)];
  const title = titleMatches.length === 1 ? decodeHtml(titleMatches[0][1].trim()) : "";
  const description = metaContent(html, "description") || "";
  const canonical = canonicalHref(html);
  const h1Count = (html.match(/<h1\b/gi) || []).length;

  if (titleMatches.length !== 1) failures.push(`${url}: expected one title, found ${titleMatches.length}`);
  if (title.length > maxTitleLength) failures.push(`${url}: title is ${title.length} characters (max ${maxTitleLength})`);
  if (!description) failures.push(`${url}: missing meta description`);
  if (description && description.length < minDescriptionLength) {
    failures.push(`${url}: description is ${description.length} characters (min ${minDescriptionLength})`);
  }
  if (description.length > maxDescriptionLength) {
    failures.push(`${url}: description is ${description.length} characters (max ${maxDescriptionLength})`);
  }
  if (canonical !== url) failures.push(`${url}: canonical is ${canonical || "missing"}`);
  if (h1Count !== 1) failures.push(`${url}: expected one h1, found ${h1Count}`);

  for (const image of tags(html, "img")) {
    if (getAttribute(image, "alt") === null) failures.push(`${url}: image is missing alt text`);
  }

  for (const anchor of tags(html, "a")) {
    if (getAttribute(anchor, "target")?.toLowerCase() !== "_blank") continue;
    const rel = (getAttribute(anchor, "rel") || "").toLowerCase().split(/\s+/);
    if (!rel.includes("noopener")) failures.push(`${url}: target=_blank link is missing rel=noopener`);
  }

  if (title) {
    const existing = titles.get(title);
    if (existing && existing !== url) failures.push(`${url}: duplicate title also used by ${existing}`);
    titles.set(title, url);
  }
  if (description) {
    const existing = descriptions.get(description);
    if (existing && existing !== url) failures.push(`${url}: duplicate description also used by ${existing}`);
    descriptions.set(description, url);
  }
}

if (failures.length) {
  console.error(`Page metadata validation failed: ${failures.length}`);
  for (const failure of failures) console.error(failure);
  process.exit(1);
}

console.log(`Page metadata is valid for ${urls.length} sitemap URLs.`);

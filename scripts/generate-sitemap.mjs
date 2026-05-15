import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { productRedirects } from "../src/lib/product-routes.ts";

const rootDir = process.cwd();
const distDir = path.join(rootDir, "dist");
const siteUrl = "https://kreativsound.com";
const legacyProductRoutes = new Set(productRedirects.map(({ from }) => `/products/${from}/`));

function runGit(args) {
  try {
    return execFileSync("git", args, { cwd: rootDir, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
  } catch {
    return "";
  }
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function escapeXml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function walkHtmlFiles(dir, files = []) {
  if (!fs.existsSync(dir)) {
    return files;
  }

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

function routeFromFile(filePath) {
  const relative = path.relative(distDir, filePath).replaceAll(path.sep, "/");
  if (relative === "index.html") {
    return "/";
  }
  if (relative === "404.html") {
    return null;
  }
  if (relative.startsWith("apps/")) {
    return null;
  }
  if (relative.endsWith("/index.html")) {
    const route = `/${relative.replace(/\/index\.html$/, "/")}`;
    return legacyProductRoutes.has(route) ? null : route;
  }
  if (relative.startsWith("products/") && relative.endsWith(".html")) {
    return `/${relative.replace(/\.html$/, "")}`;
  }
  return `/${relative}`;
}

function sourcePathForRoute(route) {
  if (route === "/") {
    return "src/pages/index.astro";
  }
  if (route.startsWith("/posts/") && route.endsWith(".html")) {
    const slug = route.slice("/posts/".length, -".html".length);
    return `src/content/posts/${slug}.md`;
  }
  if (route.startsWith("/products/")) {
    return "src/lib/product-pages.ts";
  }
  if (route.endsWith("/")) {
    return `src/pages/${route.slice(1)}index.astro`;
  }
  return route.slice(1);
}

function lastmodForRoute(route) {
  const sourcePath = sourcePathForRoute(route);
  const absoluteSource = path.join(rootDir, sourcePath);
  if (!fs.existsSync(absoluteSource)) {
    return today();
  }

  if (runGit(["status", "--porcelain", "--", sourcePath])) {
    return today();
  }

  return runGit(["log", "-1", "--format=%cs", "--", sourcePath]) || today();
}

function priorityForRoute(route) {
  if (route === "/") return "1.0";
  if (route === "/sound/") return "0.9";
  if (route === "/news/" || route === "/learn/" || route === "/tools/") return "0.8";
  if (route.startsWith("/tools/")) return "0.8";
  if (route.startsWith("/products/")) return "0.8";
  if (route.startsWith("/posts/")) return "0.7";
  return "0.7";
}

function changefreqForRoute(route) {
  if (route === "/" || route === "/sound/" || route === "/news/" || route === "/learn/" || route === "/tools/" || route.startsWith("/tools/")) {
    return "weekly";
  }
  return "monthly";
}

function sortRoutes(a, b) {
  const order = ["/", "/sound/", "/news/", "/learn/", "/tools/", "/music/", "/about/", "/contact/"];
  const aIndex = order.indexOf(a);
  const bIndex = order.indexOf(b);
  if (aIndex !== -1 || bIndex !== -1) {
    return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
  }
  return a.localeCompare(b);
}

function buildSitemap() {
  const routes = [...new Set(walkHtmlFiles(distDir).map(routeFromFile).filter(Boolean))].sort(sortRoutes);
  const entries = routes.map((route) => {
    const loc = `${siteUrl}${route}`;
    return [
      "  <url>",
      `    <loc>${escapeXml(loc)}</loc>`,
      `    <lastmod>${lastmodForRoute(route)}</lastmod>`,
      `    <changefreq>${changefreqForRoute(route)}</changefreq>`,
      `    <priority>${priorityForRoute(route)}</priority>`,
      "  </url>",
    ].join("\n");
  });

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join("\n")}\n</urlset>\n`;
}

function writeIfChanged(filePath, contents) {
  if (fs.existsSync(filePath) && fs.readFileSync(filePath, "utf8") === contents) {
    return false;
  }
  fs.writeFileSync(filePath, contents);
  return true;
}

const checkOnly = process.argv.includes("--check");
const sitemap = buildSitemap();
const rootSitemap = path.join(rootDir, "sitemap.xml");
const distSitemap = path.join(distDir, "sitemap.xml");

if (checkOnly) {
  const current = fs.existsSync(rootSitemap) ? fs.readFileSync(rootSitemap, "utf8") : "";
  if (current !== sitemap) {
    console.error("sitemap.xml is stale. Run npm run sitemap and commit the result.");
    process.exit(1);
  }
  console.log("sitemap.xml is current.");
  process.exit(0);
}

const changedRoot = writeIfChanged(rootSitemap, sitemap);
const changedDist = fs.existsSync(distDir) ? writeIfChanged(distSitemap, sitemap) : false;
console.log(`Generated sitemap.xml${changedRoot || changedDist ? "." : " (unchanged)."}`);

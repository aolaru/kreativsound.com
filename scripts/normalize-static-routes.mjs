import fs from "node:fs";
import path from "node:path";

const distDir = path.join(process.cwd(), "dist");

function flattenRouteDirectory(parentDir, entryName, preserveDirectory = false) {
  const entryDir = path.join(parentDir, entryName);
  const nestedIndex = path.join(entryDir, "index.html");
  const flatFile = path.join(parentDir, `${entryName.replace(/\.html$/, "")}.html`);

  if (!fs.existsSync(nestedIndex)) {
    return;
  }

  const contents = fs.readFileSync(nestedIndex);
  const tempFile = `${flatFile}.tmp`;
  fs.writeFileSync(tempFile, contents);
  if (!preserveDirectory) {
    fs.rmSync(entryDir, { recursive: true, force: true });
  }
  fs.renameSync(tempFile, flatFile);
}

function flattenMatchingRouteDirs(parentDir, shouldFlatten, preserveDirectory = false) {
  if (!fs.existsSync(parentDir)) {
    return;
  }

  for (const entry of fs.readdirSync(parentDir, { withFileTypes: true })) {
    if (!entry.isDirectory() || !shouldFlatten(entry.name)) {
      continue;
    }

    flattenRouteDirectory(parentDir, entry.name, preserveDirectory);
  }
}

flattenMatchingRouteDirs(path.join(distDir, "posts"), (name) => name.endsWith(".html"));
flattenMatchingRouteDirs(path.join(distDir, "products"), (name) => name.endsWith(".html"));
// Keep directory indexes for /sounds/product/ as well as the existing flat
// files for /sounds/product and /sounds/product.html on GitHub Pages.
// Both copies retain the same canonical URL; the sitemap deduplicates them.
flattenMatchingRouteDirs(path.join(distDir, "sounds"), () => true, true);

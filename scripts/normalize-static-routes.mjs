import fs from "node:fs";
import path from "node:path";

const distDir = path.join(process.cwd(), "dist");

function flattenRouteDirectory(parentDir, entryName) {
  const entryDir = path.join(parentDir, entryName);
  const nestedIndex = path.join(entryDir, "index.html");
  const flatFile = path.join(parentDir, `${entryName.replace(/\.html$/, "")}.html`);

  if (!fs.existsSync(nestedIndex)) {
    return;
  }

  const contents = fs.readFileSync(nestedIndex);
  const tempFile = `${flatFile}.tmp`;
  fs.writeFileSync(tempFile, contents);
  fs.rmSync(entryDir, { recursive: true, force: true });
  fs.renameSync(tempFile, flatFile);
}

function flattenMatchingRouteDirs(parentDir, shouldFlatten) {
  if (!fs.existsSync(parentDir)) {
    return;
  }

  for (const entry of fs.readdirSync(parentDir, { withFileTypes: true })) {
    if (!entry.isDirectory() || !shouldFlatten(entry.name)) {
      continue;
    }

    flattenRouteDirectory(parentDir, entry.name);
  }
}

flattenMatchingRouteDirs(path.join(distDir, "posts"), (name) => name.endsWith(".html"));
flattenMatchingRouteDirs(path.join(distDir, "products"), (name) => name.endsWith(".html"));
flattenMatchingRouteDirs(path.join(distDir, "sounds"), () => true);

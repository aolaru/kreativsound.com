import fs from "node:fs";
import path from "node:path";

const distDir = path.join(process.cwd(), "dist");

function flattenHtmlRouteDirs(parentDir) {
  if (!fs.existsSync(parentDir)) {
    return;
  }

  for (const entry of fs.readdirSync(parentDir)) {
    const entryDir = path.join(parentDir, entry);
    const nestedIndex = path.join(entryDir, "index.html");
    const flatFile = path.join(parentDir, entry);

    if (!entry.endsWith(".html") || !fs.existsSync(nestedIndex)) {
      continue;
    }

    const contents = fs.readFileSync(nestedIndex);
    const tempFile = path.join(parentDir, `${entry}.tmp`);
    fs.writeFileSync(tempFile, contents);
    fs.rmSync(entryDir, { recursive: true, force: true });
    fs.renameSync(tempFile, flatFile);
  }
}

flattenHtmlRouteDirs(path.join(distDir, "posts"));
flattenHtmlRouteDirs(path.join(distDir, "products"));

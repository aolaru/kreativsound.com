import fs from "node:fs";
import path from "node:path";

const postsDir = path.join(process.cwd(), "dist", "posts");

if (!fs.existsSync(postsDir)) {
  process.exit(0);
}

for (const entry of fs.readdirSync(postsDir)) {
  const entryDir = path.join(postsDir, entry);
  const nestedIndex = path.join(entryDir, "index.html");
  const flatFile = path.join(postsDir, entry);

  if (!entry.endsWith(".html") || !fs.existsSync(nestedIndex)) {
    continue;
  }

  const contents = fs.readFileSync(nestedIndex);
  const tempFile = path.join(postsDir, `${entry}.tmp`);
  fs.writeFileSync(tempFile, contents);
  fs.rmSync(entryDir, { recursive: true, force: true });
  fs.renameSync(tempFile, flatFile);
}

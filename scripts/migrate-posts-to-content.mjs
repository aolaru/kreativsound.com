import fs from "node:fs";
import path from "node:path";

const rootDir = process.cwd();
const sourceDir = path.join(rootDir, "posts");
const outputDir = path.join(rootDir, "src", "content", "posts");

const fallbackSection = {
  "building-a-repeatable-sound-brand.html": "learn",
  "preset-pack-production-notes.html": "learn",
  "scoring-with-minimal-sound-design.html": "learn"
};

function extract(source, regex) {
  const match = source.match(regex);
  return match ? match[1].trim() : "";
}

function detectSection(source, filename) {
  if (source.includes('<a class="nav-link active" href="/news/">News</a>')) {
    return "news";
  }
  if (source.includes('<a class="nav-link active" href="/learn/">Learn</a>')) {
    return "learn";
  }
  return fallbackSection[filename] || "learn";
}

function extractBody(source) {
  return (
    extract(source, /<div class="stack article-stack">([\s\S]*?)<\/div>\s*<\/article>/i) ||
    extract(source, /<div class="stack">([\s\S]*?)<\/div>\s*<\/section>/i)
  );
}

fs.rmSync(outputDir, { recursive: true, force: true });
fs.mkdirSync(outputDir, { recursive: true });

for (const filename of fs.readdirSync(sourceDir).filter((file) => file.endsWith(".html")).sort()) {
  const source = fs.readFileSync(path.join(sourceDir, filename), "utf8");
  const slug = filename.replace(/\.html$/, "");
  const title = extract(source, /<h1 class="page-title">([\s\S]*?)<\/h1>/i);
  const description =
    extract(source, /<meta name="description" content="([\s\S]*?)"\s*\/>/i) ||
    extract(source, /<meta name="description" content="([\s\S]*?)">/i);
  const canonical = extract(source, /<link rel="canonical" href="([^"]+)"/i);
  const ogImage = extract(source, /<meta property="og:image" content="([^"]+)"/i) || "https://kreativsound.com/og-image.svg";
  const published = extract(source, /<meta property="article:published_time" content="([^"]+)"/i);
  const draft = source.includes('content="noindex,nofollow"');
  const section = detectSection(source, filename);
  const body = extractBody(source);

  const frontmatter = [
    "---",
    `title: ${JSON.stringify(title)}`,
    `description: ${JSON.stringify(description)}`,
    `canonical: ${JSON.stringify(canonical)}`,
    `ogImage: ${JSON.stringify(ogImage)}`,
    `section: ${section}`,
    published ? `published: ${JSON.stringify(published)}` : "",
    `draft: ${draft ? "true" : "false"}`,
    "---",
    "",
    body.trim(),
    ""
  ]
    .filter(Boolean)
    .join("\n");

  fs.writeFileSync(path.join(outputDir, `${slug}.md`), frontmatter);
}

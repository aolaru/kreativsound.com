import fs from "node:fs";
import path from "node:path";

export type PostSection = "news" | "learn";

export type ParsedPost = {
  slug: string;
  filename: string;
  title: string;
  description: string;
  canonical: string;
  ogImage: string;
  publishedTime: string;
  articleHtml: string;
  section: PostSection;
};

const postsDir = path.join(process.cwd(), "posts");

const sectionFallbacks: Record<string, PostSection> = {
  "building-a-repeatable-sound-brand.html": "learn",
  "preset-pack-production-notes.html": "learn",
  "scoring-with-minimal-sound-design.html": "learn"
};

function matchOrEmpty(source: string, regex: RegExp, group = 1) {
  const match = source.match(regex);
  return match ? match[group].trim() : "";
}

function parseSection(source: string, filename: string): PostSection {
  if (source.includes('class="nav-link active" href="/learn/"')) {
    return "learn";
  }
  if (source.includes('class="nav-link active" href="/news/"')) {
    return "news";
  }
  return sectionFallbacks[filename] || "news";
}

export function getAllPosts(): ParsedPost[] {
  const filenames = fs.readdirSync(postsDir).filter((file) => file.endsWith(".html")).sort();
  return filenames.map((filename) => {
    const fullPath = path.join(postsDir, filename);
    const source = fs.readFileSync(fullPath, "utf8");
    const slug = filename.replace(/\.html$/, "");
    const articleHtml = matchOrEmpty(
      source,
      /<article class="card page-main">([\s\S]*?)<\/article>/i
    );

    return {
      slug,
      filename,
      title: matchOrEmpty(source, /<title>(.*?)<\/title>/i),
      description: matchOrEmpty(source, /<meta name="description" content="(.*?)"/i),
      canonical: matchOrEmpty(source, /<link rel="canonical" href="(.*?)"/i),
      ogImage: matchOrEmpty(source, /<meta property="og:image" content="(.*?)"/i) || "https://kreativsound.com/og-image.svg",
      publishedTime: matchOrEmpty(source, /<meta property="article:published_time" content="(.*?)"/i),
      articleHtml,
      section: parseSection(source, filename)
    };
  });
}

export function getPostsBySection(section: PostSection) {
  return getAllPosts().filter((post) => post.section === section);
}

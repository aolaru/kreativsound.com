import fs from "node:fs";
import path from "node:path";
import { products } from "../src/lib/products.ts";
import { productRedirects } from "../src/lib/product-routes.ts";
import { landingCopyOverrides } from "../src/lib/product-content.ts";

const rootDir = process.cwd();
const publicDir = path.join(rootDir, "public");

function slugFromDetailsUrl(url) {
  return url?.replace(/^\/products\//, "").replace(/\/$/, "") || "";
}

function publicAssetExists(url) {
  if (!url || /^https?:\/\//.test(url)) return true;
  return fs.existsSync(path.join(publicDir, url.replace(/^\/+/, "")));
}

function hasText(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function assertUnique(values, label, errors) {
  const seen = new Set();
  for (const value of values) {
    if (!value) continue;
    if (seen.has(value)) {
      errors.push(`Duplicate ${label}: ${value}`);
    }
    seen.add(value);
  }
}

const errors = [];
const productSlugs = products.map((product) => slugFromDetailsUrl(product.detailsUrl)).filter(Boolean);
const productSlugSet = new Set(productSlugs);
const landingCopySlugSet = new Set(Object.keys(landingCopyOverrides));

assertUnique(products.map((product) => product.detailsUrl).filter(Boolean), "product detailsUrl", errors);
assertUnique(productSlugs, "product slug", errors);

for (const slug of productSlugs) {
  if (!landingCopySlugSet.has(slug)) {
    errors.push(`Missing landing copy override for product slug: ${slug}`);
  }
}

for (const slug of landingCopySlugSet) {
  if (!productSlugSet.has(slug)) {
    errors.push(`Landing copy override does not match a product detailsUrl: ${slug}`);
  }
}

for (const product of products) {
  if (!hasText(product.title)) errors.push("Product is missing title.");
  if (!hasText(product.category)) errors.push(`${product.title}: missing category.`);
  if (!hasText(product.format)) errors.push(`${product.title}: missing format.`);
  if (!hasText(product.count)) errors.push(`${product.title}: missing count.`);
  if (!hasText(product.useCase)) errors.push(`${product.title}: missing useCase.`);
  if (product.thumbnail && !publicAssetExists(product.thumbnail)) {
    errors.push(`${product.title}: missing thumbnail asset ${product.thumbnail}`);
  }
  if (product.coverImage && !publicAssetExists(product.coverImage)) {
    errors.push(`${product.title}: missing cover image asset ${product.coverImage}`);
  }
  if (product.demo?.src && !publicAssetExists(product.demo.src)) {
    errors.push(`${product.title}: missing demo asset ${product.demo.src}`);
  }
}

for (const [slug, content] of Object.entries(landingCopyOverrides)) {
  if (!hasText(content.subtitle)) errors.push(`${slug}: missing subtitle.`);
  if (!hasText(content.shortMeta)) errors.push(`${slug}: missing shortMeta.`);
  if (!content.longDescription?.length) errors.push(`${slug}: missing longDescription.`);
  if (!content.specifications?.length) errors.push(`${slug}: missing specifications.`);
  if (!content.requirements?.length) errors.push(`${slug}: missing requirements.`);
}

for (const redirect of productRedirects) {
  if (!productSlugSet.has(redirect.to)) {
    errors.push(`Redirect target does not match a product slug: ${redirect.from} -> ${redirect.to}`);
  }
}

if (errors.length) {
  console.error(`Product data validation failed: ${errors.length}`);
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log("Product data validation passed.");

import fs from "node:fs";
import path from "node:path";
import { products } from "../src/lib/products.ts";
import { productRedirects } from "../src/lib/product-routes.ts";
import { landingCopyOverrides } from "../src/lib/product-content.ts";
import { productInstallations } from "../src/lib/product-installation.ts";
import { getBurnshaperOffer } from "../src/lib/plugin-offers.ts";

const rootDir = process.cwd();
const publicDir = path.join(rootDir, "public");

function slugFromDetailsUrl(url) {
  return url?.replace(/^\/+|\/+$/g, "").split("/").at(-1) || "";
}

function publicAssetExists(url) {
  if (!url || /^https?:\/\//.test(url)) return true;
  return fs.existsSync(path.join(publicDir, url.replace(/^\/+/, "")));
}

function srcSetUrls(srcset) {
  if (!srcset) return [];
  return String(srcset)
    .split(",")
    .map((entry) => entry.trim().split(/\s+/)[0])
    .filter(Boolean);
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
const introOffer = getBurnshaperOffer(new Date("2026-10-10T12:00:00Z"));
const regularOffer = getBurnshaperOffer(new Date("2026-11-10T12:00:00Z"));
if (introOffer.priceAmount !== 9 || introOffer.priceValidUntil !== "2026-11-08") {
  errors.push("BurnShaper: introductory offer must be €9 with a dated expiry.");
}
if (regularOffer.priceAmount !== 19 || regularOffer.priceValidUntil !== undefined) {
  errors.push("BurnShaper: builds after the introductory offer must use €19.");
}
const productSlugs = products.map((product) => slugFromDetailsUrl(product.detailsUrl)).filter(Boolean);
const productSlugSet = new Set(productSlugs);
const landingCopySlugSet = new Set(Object.keys(landingCopyOverrides));
const paidSoundCategories = new Set(["Presets", "Samples"]);
const allowedStatuses = new Set(["available", "comingSoon", "free", "archive"]);

assertUnique(products.map((product) => product.detailsUrl).filter(Boolean), "product detailsUrl", errors);
assertUnique(productSlugs, "product slug", errors);
assertUnique(products.map((product) => product.featuredRank).filter(Boolean), "homepage feature rank", errors);

if (!products.some((product) => product.featuredRank === 1)) {
  errors.push("Missing homepage featuredRank: 1 product.");
}

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
  if (!allowedStatuses.has(product.status)) errors.push(`${product.title}: missing or invalid status.`);
  if (!hasText(product.format)) errors.push(`${product.title}: missing format.`);
  if (!hasText(product.count)) errors.push(`${product.title}: missing count.`);
  if (!hasText(product.useCase)) errors.push(`${product.title}: missing useCase.`);
  if (product.featuredRank && (!Number.isInteger(product.featuredRank) || product.featuredRank < 1)) {
    errors.push(`${product.title}: featuredRank must be a positive integer.`);
  }
  if (product.thumbnail && !publicAssetExists(product.thumbnail)) {
    errors.push(`${product.title}: missing thumbnail asset ${product.thumbnail}`);
  }
  if (product.coverImage && !publicAssetExists(product.coverImage)) {
    errors.push(`${product.title}: missing cover image asset ${product.coverImage}`);
  }
  if (product.homeImage && !publicAssetExists(product.homeImage)) {
    errors.push(`${product.title}: missing homepage image asset ${product.homeImage}`);
  }
  for (const srcsetUrl of srcSetUrls(product.homeImageSrcSet)) {
    if (!publicAssetExists(srcsetUrl)) {
      errors.push(`${product.title}: missing homepage srcset asset ${srcsetUrl}`);
    }
  }
  if (product.demo?.src && !publicAssetExists(product.demo.src)) {
    errors.push(`${product.title}: missing demo asset ${product.demo.src}`);
  }
  if (paidSoundCategories.has(product.category)) {
    if (product.price !== "9 EUR") errors.push(`${product.title}: paid sound pack price should be 9 EUR.`);
    if (product.priceAmount !== 9) errors.push(`${product.title}: paid sound pack priceAmount should be 9.`);
    if (product.priceCurrency !== "EUR") errors.push(`${product.title}: paid sound pack priceCurrency should be EUR.`);
  }
}

for (const [slug, content] of Object.entries(landingCopyOverrides)) {
  if (!hasText(content.subtitle)) errors.push(`${slug}: missing subtitle.`);
  if (!hasText(content.shortMeta)) errors.push(`${slug}: missing shortMeta.`);
  if (!content.longDescription?.length) errors.push(`${slug}: missing longDescription.`);
  if (!content.specifications?.length) errors.push(`${slug}: missing specifications.`);
  if (!content.requirements?.length) errors.push(`${slug}: missing requirements.`);
}

for (const product of products) {
  const slug = slugFromDetailsUrl(product.detailsUrl);
  if (["Presets", "Free", "Legacy"].includes(product.category) || product.detailsUrl?.startsWith("/plugins/")) {
    if (!productInstallations[slug]?.steps.length) errors.push(`${slug}: missing installation steps.`);
  }
}
for (const [slug, installation] of Object.entries(productInstallations)) {
  if (!productSlugSet.has(slug)) errors.push(`${slug}: installation does not match a product.`);
  if (installation.steps.some((step) => !hasText(step))) errors.push(`${slug}: empty installation step.`);
  if (installation.sourceUrl && !installation.sourceUrl.startsWith("https://")) errors.push(`${slug}: invalid installation source URL.`);
}

const sampleVerification = JSON.parse(fs.readFileSync(path.join(rootDir, "src/data/sample-pack-verification.json"), "utf8"));
for (const [slug, expected] of Object.entries(sampleVerification.packs)) {
  const product = products.find((item) => slugFromDetailsUrl(item.detailsUrl) === slug);
  const copy = landingCopyOverrides[slug];
  if (!product || !copy) {
    errors.push(`${slug}: missing verified sample pack.`);
    continue;
  }
  if (Number.parseInt(product.count, 10) !== expected.count) errors.push(`${slug}: catalog count differs from archive audit.`);
  if (product.format !== expected.format) errors.push(`${slug}: catalog format differs from archive audit.`);
  const soundCount = copy.specifications.find((spec) => spec.label === "Sound count")?.value;
  if (Number.parseInt(soundCount || "", 10) !== expected.count) errors.push(`${slug}: product-page count differs from archive audit.`);
  const specifications = copy.specifications.map((spec) => spec.value).join(" ");
  for (const rate of expected.sampleRates) {
    if (!specifications.includes(`${rate / 1000} kHz`)) errors.push(`${slug}: missing verified sample rate ${rate}.`);
  }
  if (expected.bitDepthNote && !specifications.includes(expected.bitDepthNote)) errors.push(`${slug}: missing mixed-format disclosure.`);
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

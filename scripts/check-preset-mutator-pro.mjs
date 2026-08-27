import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const appDir = path.join(rootDir, "apps/preset-mutator-pro/public");
const failures = [];

function assert(condition, message) {
  if (!condition) {
    failures.push(message);
  }
}

async function read(relativePath) {
  return readFile(path.join(appDir, relativePath), "utf8");
}

async function exists(relativePath) {
  try {
    await access(path.join(appDir, relativePath));
    return true;
  } catch {
    return false;
  }
}

const pages = [
  { name: "From Scratch", html: "index.html", app: "app.js", proEngine: "buildScratchProPack", freeEngine: "buildScratchFreePack" },
  { name: "Audio", html: "audio/index.html", app: "audio/app.js", proEngine: "buildAudioProPack", freeEngine: "buildAudioFreePack" },
  { name: "Mutate Preset", html: "mutate/index.html", app: "mutate/app.js", proEngine: "PRESET_MUTATE_PRO_PACK_COUNT", freeEngine: "mode: \"free\"" },
];

for (const page of pages) {
  const [html, app] = await Promise.all([read(page.html), read(page.app)]);
  assert(html.includes('content="noindex, nofollow"'), `${page.name}: legacy page must stay out of search indexes`);
  assert(html.includes("Preset Mutator PRO"), `${page.name}: PRO access must be clearly labelled`);
  assert(html.includes("v0.4.4"), `${page.name}: release version should be v0.4.4`);
  assert(html.includes("Enter license token"), `${page.name}: license token entry is missing`);
  assert(html.includes("Generate 32 PRO Variants"), `${page.name}: PRO batch action is missing`);
  assert(!/\bfree\b/i.test(html), `${page.name}: free-tier copy must not appear in the PRO app`);
  assert(!html.includes("Buy on Gumroad"), `${page.name}: legacy page must not expose a Gumroad checkout link`);
  assert(!html.includes("Pay with PayPal"), `${page.name}: legacy page must not expose a PayPal checkout link`);
  assert(!html.includes('href="/preset-mutator/'), `${page.name}: legacy page must not route customers to the free app`);
  assert(html.includes('href="/preset-mutator-pro/changelog/"'), `${page.name}: changelog link is missing from the footer`);
  assert(app.includes("verifyLicenseToken"), `${page.name}: signed-token verification is missing`);
  assert(app.includes(page.proEngine), `${page.name}: Pro generation engine is missing`);
  assert(!app.includes(page.freeEngine), `${page.name}: free generation engine is still present`);
  assert(!app.includes("generate_free"), `${page.name}: free generation analytics should not ship`);
}

const [manifest, serviceWorker, licenseScript, changelogHtml] = await Promise.all([
  read("manifest.webmanifest"),
  read("service-worker.js"),
  read("engine/license.js"),
  read("changelog/index.html"),
]);

assert(manifest.includes('"scope": "/preset-mutator-pro/"'), "Manifest: legacy route scope is incorrect");
assert(serviceWorker.includes("preset-mutator-pro-shell"), "Service worker: PRO cache namespace is missing");
assert(serviceWorker.includes("./changelog/index.html"), "Service worker: changelog should be cached");
assert(licenseScript.includes('LICENSE_PRODUCT = "preset-mutator-pro"'), "License verifier: product identifier changed unexpectedly");
assert(await exists("assets/seeds/vital/raw/KS Dread Lantern.vital"), "Legacy Pro: missing Vital seed assets");
assert(changelogHtml.includes("Preset Mutator PRO Changelog"), "Changelog: page title is missing");
assert(changelogHtml.includes("v0.4.4"), "Changelog: current version is missing");
assert(changelogHtml.includes("Current release"), "Changelog: current release marker is missing");

if (failures.length) {
  console.error("Preset Mutator PRO QA failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("Preset Mutator PRO QA passed.");

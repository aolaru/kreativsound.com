import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const rootDir = process.cwd();
const appDir = path.join(rootDir, "apps/wave-mutator-pro/public");
const requiredFiles = [
  "index.html",
  "styles.css",
  "app.js",
  "audio-source.js",
  "pro-license.js",
  "engine/license.js",
  "vendor/lame.min.js",
];
const errors = [];
const fail = (message) => errors.push(message);

for (const file of requiredFiles) {
  if (!existsSync(path.join(appDir, file))) fail(`Missing Wave Mutator Pro source file: ${file}`);
}

if (!errors.length) {
  const html = readFileSync(path.join(appDir, "index.html"), "utf8");
  const app = readFileSync(path.join(appDir, "app.js"), "utf8");
  const gate = readFileSync(path.join(appDir, "pro-license.js"), "utf8");
  const waveLicense = readFileSync(path.join(appDir, "engine/license.js"), "utf8");
  const presetLicense = readFileSync(path.join(rootDir, "apps/preset-mutator-pro/public/engine/license.js"), "utf8");
  const sitemapGenerator = readFileSync(path.join(rootDir, "scripts/generate-sitemap.mjs"), "utf8");

  if (!html.includes("Wave Mutator Pro") || !html.includes("v0.1.0")) fail("Pro name or version is missing.");
  if (!html.includes('content="noindex, nofollow"')) fail("The private Pro route must remain noindex, nofollow.");
  if (!html.includes('src="./pro-license.js?v=1"')) fail("The Pro license gate is missing.");
  if (!html.includes("Preset Mutator Pro license also unlocks Wave Mutator Pro")) fail("Shared-license copy is missing.");
  if (/\bWave Mutator (Free|Lite)\b/.test(html)) fail("Free-tier branding leaked into the Pro app.");
  if (html.includes("kreativ-analytics.js")) fail("The private Pro route must not load site analytics.");
  if (waveLicense !== presetLicense) fail("Wave Mutator Pro must use the exact Preset Mutator Pro verifier.");
  if (!gate.includes('event.key === "preset-mutator-pro-license"')) fail("Cross-tab automatic license restore is missing.");
  if (!sitemapGenerator.includes('route === "/tools/wave-mutator-pro/"')) fail("The sitemap generator must exclude the private Pro route.");

  for (const feature of [
    "applyVolumeEnvelope",
    "getEnvelopeGainAtRatio",
    "applyEnvelopeDraft",
    "drawVolumeEnvelope",
    'type: "envelope"',
  ]) {
    if (!app.includes(feature)) fail(`Missing Pro envelope feature: ${feature}`);
  }

  for (const relativeFile of [
    "src/pages/tools/index.astro",
    "src/pages/search-index.json.ts",
    "src/lib/site-updates.ts",
    "sitemap.xml",
  ]) {
    const contents = readFileSync(path.join(rootDir, relativeFile), "utf8");
    if (contents.includes("/tools/wave-mutator-pro/")) {
      fail(`Private Pro route must not be published in ${relativeFile}.`);
    }
  }

  for (const script of ["app.js", "pro-license.js", "engine/license.js"]) {
    const syntax = spawnSync(process.execPath, ["--check", path.join(appDir, script)], { encoding: "utf8" });
    if (syntax.status !== 0) fail(`${script} syntax check failed: ${syntax.stderr || syntax.stdout}`);
  }
}

if (errors.length) {
  console.error(`Wave Mutator Pro validation failed: ${errors.length}`);
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log("Wave Mutator Pro validation passed.");

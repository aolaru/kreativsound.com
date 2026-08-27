import { execFile as execFileCallback } from "node:child_process";
import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";
import { buildAudioProPack } from "../apps/preset-mutator-pro/public/engine/audio-engine.js";
import { generatePresetVariants, presetSummary } from "../apps/preset-mutator-pro/public/engine/preset-mutate-engine.js";
import { buildScratchProfile, buildScratchProPack } from "../apps/preset-mutator-pro/public/engine/scratch-engine.js";
import { VELVET_TEMPLATE_LIBRARY } from "../apps/preset-mutator-pro/public/engine/velvet-template-library.js";
import { applyParameterMapToPreset } from "../apps/preset-mutator-pro/public/engine/vital-export.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const appDir = path.join(rootDir, "apps/preset-mutator-pro/public");
const failures = [];
const execFile = promisify(execFileCallback);

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
  assert(html.includes("v0.4.5"), `${page.name}: release version should be v0.4.5`);
  assert(html.includes("Gumroad license key"), `${page.name}: Gumroad license key entry is missing`);
  assert(html.includes("Generate 32 PRO Variants"), `${page.name}: PRO batch action is missing`);
  assert(!/\bfree\b/i.test(html), `${page.name}: free-tier copy must not appear in the PRO app`);
  assert(!html.includes("Buy on Gumroad"), `${page.name}: legacy page must not expose a Gumroad checkout link`);
  assert(!html.includes("Pay with PayPal"), `${page.name}: legacy page must not expose a PayPal checkout link`);
  assert(!html.includes('href="/preset-mutator/'), `${page.name}: legacy page must not route customers to the free app`);
  assert(html.includes('href="/preset-mutator-pro/changelog/"'), `${page.name}: changelog link is missing from the footer`);
  assert(app.includes("verifyLicenseToken"), `${page.name}: license verification is missing`);
  assert(app.includes(page.proEngine), `${page.name}: Pro generation engine is missing`);
  assert(!app.includes(page.freeEngine), `${page.name}: free generation engine is still present`);
  assert(!app.includes("generate_free"), `${page.name}: free generation analytics should not ship`);

  try {
    await execFile(process.execPath, ["--check", path.join(appDir, page.app)]);
  } catch {
    assert(false, `${page.name}: application script has a syntax error`);
  }
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
assert(licenseScript.includes('GUMROAD_PRODUCT_ID = "-A9fzCUAIYZ0QZKoRvyOQA=="'), "License verifier: Gumroad product identifier changed unexpectedly");
assert(licenseScript.includes("GUMROAD_VERIFY_URL"), "License verifier: Gumroad verification endpoint is missing");
assert(await exists("assets/seeds/vital/raw/KS Dread Lantern.vital"), "Legacy Pro: missing Vital seed assets");
assert(changelogHtml.includes("Preset Mutator PRO Changelog"), "Changelog: page title is missing");
assert(changelogHtml.includes("v0.4.5"), "Changelog: current version is missing");
assert(changelogHtml.includes("Current release"), "Changelog: current release marker is missing");

const templateFiles = Object.values(VELVET_TEMPLATE_LIBRARY).flat();
assert(templateFiles.length === 16, "Velvet library: expected 16 curated templates");
for (const fileName of templateFiles) {
  assert(await exists(`assets/seeds/vital/velvet-ruins/${fileName}`), `Velvet library: missing template ${fileName}`);
}

const scratchProfile = buildScratchProfile({ family: "pad", mood: "dark", register: "mid", intent: "evolving dark glass", mutationAmount: 55 });
const scratchPack = buildScratchProPack(scratchProfile, 48271);
const nextScratchPack = buildScratchProPack(scratchProfile, 93614);
assert(scratchPack.length === 32, "Scratch: expected a 32-preset PRO pack");
assert(new Set(scratchPack.map((preset) => preset.templateFile)).size >= 3, "Scratch: pack should use multiple Velvet structures");
assert(new Set(scratchPack.map((preset) => preset.topology)).size === 4, "Scratch: pack should balance four sound topologies");
assert(
  JSON.stringify(scratchPack.map((preset) => preset.parameterMap)) !== JSON.stringify(nextScratchPack.map((preset) => preset.parameterMap)),
  "Scratch: a new run seed must change generated parameters",
);

const audioProfile = {
  family: "texture",
  brightness: 0.32,
  body: 0.68,
  attack: 0.24,
  sustain: 0.76,
  movement: 0.62,
  noise: 0.48,
  width: 0.72,
  mutationAmount: 0.55,
  pitchHz: 146,
};
const audioPack = buildAudioProPack(audioProfile, 48271);
assert(audioPack.length === 32, "Audio: expected a 32-preset PRO pack");
assert(new Set(audioPack.map((preset) => preset.templateFile)).size >= 3, "Audio: pack should use multiple Velvet structures");
assert(new Set(audioPack.map((preset) => preset.topology)).size === 4, "Audio: pack should balance four sound topologies");

const templateData = JSON.parse(await readFile(path.join(appDir, "assets/seeds/vital/velvet-ruins/KS Burial Bloom.vital"), "utf8"));
const renderedTemplate = applyParameterMapToPreset(templateData, scratchPack[0]);
const activeRoutes = (renderedTemplate.settings.modulations || []).filter((route) => route?.source && route?.destination);
assert(activeRoutes.length >= 8, "Vital export: template modulation routes must be retained");
assert(renderedTemplate.macro1 === "ATMOS", "Vital export: curated macro names must be retained");
assert(renderedTemplate.preset_name === scratchPack[0].name, "Vital export: generated preset name must be written to the Vital payload");

const sourcePreset = { data: templateData, summary: presetSummary(templateData), fileName: "source.vital" };
const mutationStrategy = { tone: 0.15, motion: 0.45, attack: 0, space: 0.2, dirt: 0.1, amount: 0.6 };
const firstMutations = generatePresetVariants({ sourcePreset, strategy: mutationStrategy, generationSeed: 48271 });
const nextMutations = generatePresetVariants({ sourcePreset, strategy: mutationStrategy, generationSeed: 93614 });
assert(firstMutations.length === 32, "Preset: expected a 32-preset PRO pack");
assert(new Set(firstMutations.map((preset) => preset.mutationLane)).size === 4, "Preset: pack should balance four mutation lanes");
assert(
  firstMutations.some((preset) => preset.changedParameters.some((key) => /^(osc_3|noise|distortion|compressor|flanger|phaser)_/.test(key))),
  "Preset: corpus-informed expressive parameter areas should be eligible for mutation",
);
assert(
  JSON.stringify(firstMutations.map((preset) => preset.changedParameters)) !== JSON.stringify(nextMutations.map((preset) => preset.changedParameters)),
  "Preset: a new run seed must change selected mutations",
);

if (failures.length) {
  console.error("Preset Mutator PRO QA failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("Preset Mutator PRO QA passed.");

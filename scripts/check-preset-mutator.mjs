import { access, readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  buildAudioFreePack,
  buildAudioPresetSummary,
  buildAudioProfile,
} from "../apps/preset-mutator/public/engine/audio-engine.js";
import {
  buildPresetMutateStrategy,
  generatePresetVariants,
  parameterConfigForKey,
  presetSummary,
  safeScalarParameterKeys,
} from "../apps/preset-mutator/public/engine/preset-mutate-engine.js";
import {
  buildScratchFreePack,
  buildScratchProfile,
} from "../apps/preset-mutator/public/engine/scratch-engine.js";
import { buildVitalPresetPayload } from "../apps/preset-mutator/public/engine/vital-export.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const uiDir = path.join(rootDir, "apps/preset-mutator/public");
const seedDir = path.join(rootDir, "apps/preset-mutator/public/assets/seeds/vital/raw");

const failures = [];

const modePages = [
  { name: "Scratch root", html: "index.html", app: "app.js", requiredImports: ["scratch-engine.js", "audio-preview.js", "vital-export.js"] },
  { name: "Scratch route", html: "index.html", app: "scratch/app.js", requiredImports: ["../app.js"] },
  { name: "Audio", html: "audio/index.html", app: "audio/app.js", requiredImports: ["audio-engine.js", "audio-preview.js", "vital-export.js"] },
  { name: "Preset", html: "mutate/index.html", app: "mutate/app.js", requiredImports: ["preset-mutate-engine.js", "audio-preview.js"] },
];

const generatedParameterRanges = {
  osc_1_level: [0, 1],
  osc_2_level: [0, 1],
  osc_1_unison_voices: [1, 8],
  osc_2_unison_voices: [1, 8],
  osc_1_unison_detune: [0, 1],
  osc_2_unison_detune: [0, 1],
  osc_1_stereo_spread: [0, 1],
  osc_2_stereo_spread: [0, 1],
  filter_1_cutoff: [0, 127],
  filter_1_resonance: [0, 1],
  filter_1_drive: [0, 4],
  filter_1_keytrack: [0, 1],
  filter_1_mix: [0, 1],
  env_1_attack: [0, 1],
  env_1_decay: [0, 1],
  env_1_sustain: [0, 1],
  env_1_release: [0, 1],
  chorus_dry_wet: [0, 1],
  chorus_mod_depth: [0, 1],
  chorus_feedback: [0, 0.95],
  reverb_dry_wet: [0, 1],
  reverb_size: [0, 1],
  reverb_decay_time: [0, 1],
  delay_dry_wet: [0, 1],
  delay_feedback: [0, 0.95],
  delay_filter_cutoff: [0, 127],
  distortion_mix: [0, 1],
  distortion_drive: [0, 4.5],
  filter_fx_cutoff: [0, 127],
  filter_fx_resonance: [0, 1],
  sample_on: [0, 1],
  noise_on: [0, 1],
  noise_level: [0, 1],
};

function fail(message) {
  failures.push(message);
}

function assert(condition, message) {
  if (!condition) {
    fail(message);
  }
}

function validateRange(label, key, value, [low, high]) {
  assert(typeof value === "number" && Number.isFinite(value), `${label}: ${key} is not a finite number`);
  assert(value >= low && value <= high, `${label}: ${key}=${value} is outside ${low}..${high}`);
}

function validatePresetShape(data, label) {
  assert(data && typeof data === "object" && !Array.isArray(data), `${label}: preset is not an object`);
  assert(data.settings && typeof data.settings === "object" && !Array.isArray(data.settings), `${label}: missing settings object`);
  assert(typeof data.preset_name === "string" || typeof data.preset_style === "string", `${label}: missing preset name/style`);

  for (const [key, value] of Object.entries(data.settings || {})) {
    if (typeof value === "number") {
      assert(Number.isFinite(value), `${label}: ${key} is not finite`);
    }
  }
}

function validateGeneratedPresetModel(preset, label) {
  assert(preset.name && typeof preset.name === "string", `${label}: missing generated preset name`);
  assert(preset.summary && typeof preset.summary === "string", `${label}: missing generated summary`);
  assert(preset.familyKey && typeof preset.familyKey === "string", `${label}: missing family key`);
  assert(preset.roleLabel && typeof preset.roleLabel === "string", `${label}: missing role label`);
  assert(preset.parameterMap && typeof preset.parameterMap === "object", `${label}: missing parameter map`);
  assert(Array.isArray(preset.parameters) && preset.parameters.length >= 4, `${label}: missing visible parameter facts`);

  for (const [key, range] of Object.entries(generatedParameterRanges)) {
    validateRange(label, key, preset.parameterMap[key], range);
  }
}

function validateRenderedGeneratedPreset(seed, preset, label) {
  const payload = buildVitalPresetPayload(seed, preset);
  assert(payload.fileName.endsWith(".vital"), `${label}: rendered filename should be .vital`);
  validatePresetShape(payload.data, `${label}: rendered`);

  for (const [key, range] of Object.entries(generatedParameterRanges)) {
    validateRange(`${label}: rendered`, key, payload.data.settings[key], range);
  }
}

function validateMutatedVariant(variant, label) {
  validatePresetShape(variant.data, label);
  assert(variant.changedParameters.length > 0, `${label}: no parameters changed`);
  assert(variant.downloadName.endsWith(".vital"), `${label}: download name should be .vital`);
  assert(variant.role?.label && typeof variant.role.label === "string", `${label}: missing role label`);
  assert(variant.groupLabel && typeof variant.groupLabel === "string", `${label}: missing group label`);

  for (const key of variant.changedParameters) {
    const config = parameterConfigForKey(key);
    assert(Boolean(config), `${label}: ${key} is not a safe mutation parameter`);
    if (!config) {
      continue;
    }
    validateRange(label, key, variant.data.settings[key], [config.low, config.high]);
  }
}

async function readText(relativePath) {
  return readFile(path.join(uiDir, relativePath), "utf8");
}

async function sourceExists(relativePath) {
  try {
    await access(path.join(uiDir, relativePath));
    return true;
  } catch {
    return false;
  }
}

async function loadSeed(file) {
  return JSON.parse(await readFile(path.join(seedDir, file), "utf8"));
}

async function checkPages() {
  assert(!(await sourceExists("scratch/index.html")), "Scratch route HTML should be generated from index.html during sync, not duplicated in source.");

  for (const page of modePages) {
    const html = await readText(page.html);
    const app = await readText(page.app);
    const renderedApp = page.name === "Scratch route" ? await readText("app.js") : app;
    assert(html.includes("id=\"mutation-knob\""), `${page.name}: missing Mutation Amount knob mount`);
    assert(html.includes("local-trust-strip"), `${page.name}: missing compact local trust strip`);
    assert(!html.includes("hero-cover"), `${page.name}: hero cover should not be present in app UI`);
    assert(!html.includes("<h1></h1>"), `${page.name}: empty h1 found`);
    assert(html.includes("Generate 3 Variants"), `${page.name}: main action should use simple variants language`);
    assert(!html.includes("Generate 3 Free Variants"), `${page.name}: old free-mode action copy is still visible`);
    assert(html.includes("Preset Mutator PRO"), `${page.name}: PRO upgrade should be visible`);
    assert(html.includes("Get Preset Mutator PRO for €19"), `${page.name}: PRO Gumroad CTA is missing`);
    assert(html.includes("https://kreativ.gumroad.com/l/preset-mutator"), `${page.name}: PRO Gumroad URL is missing`);
    assert(html.includes("Already purchased? Open PRO"), `${page.name}: PRO access link is missing`);
    assert(!html.includes("license token"), `${page.name}: license-token copy should not be visible`);
    assert(!html.includes("Pay with PayPal"), `${page.name}: PayPal CTA should not be visible in the free app`);
    assert(!html.includes("Download 32-Pack"), `${page.name}: 32-pack download should not be visible`);
    assert(!html.includes("purchase code"), `${page.name}: purchase-code copy should not be visible`);
    assert(html.includes("advanced-controls"), `${page.name}: fine-tune controls should use progressive disclosure`);
    assert(html.includes("result-set-toolbar"), `${page.name}: result-set comparison controls are missing`);
    assert(renderedApp.includes("Hear Direction Preview"), `${page.name}: preview should be labelled as a direction preview`);
    assert(html.includes('role="status"'), `${page.name}: generation status should be announced accessibly`);
    assert(!app.includes("AA-PRO-32-DGTW9930"), `${page.name}: hard-coded Pro unlock code is still present`);
    assert(!app.includes("PURCHASE_CODE"), `${page.name}: hard-coded purchase-code constant is still present`);
    assert(!app.includes("verifyLicenseToken"), `${page.name}: license verification should not ship in the free app`);
    assert(!app.includes("generate_pro"), `${page.name}: Pro generation analytics should not ship`);
    assert(!app.includes("download_pack"), `${page.name}: pack download analytics should not ship`);
    assert(!app.includes("Quality notes"), `${page.name}: generated results should not claim heuristic quality notes`);
    assert(!app.includes("quality_score"), `${page.name}: analytics should not emit heuristic quality scores`);
    for (const rangeInput of html.match(/<input[^>]*type="range"[^>]*>/g) || []) {
      assert(rangeInput.includes("aria-label="), `${page.name}: range input is missing an accessible name`);
    }

    for (const requiredImport of page.requiredImports) {
      assert(app.includes(requiredImport), `${page.name}: app is not using ${requiredImport}`);
    }
  }

  const mutateHtml = await readText("mutate/index.html");
  assert(!mutateHtml.includes("trust-panel"), "Preset mode: Local Processing panel should stay removed");
  assert(!mutateHtml.includes("insight-panel"), "Preset mode: tips panel should stay removed");
  assert(mutateHtml.includes("Load Example Preset"), "Preset mode: included example preset action is missing");

  const scratchHtml = await readText("index.html");
  assert(scratchHtml.includes("Direction Keywords"), "Scratch mode: keyword direction input is missing");
  assert(scratchHtml.includes("data-intent-keyword"), "Scratch mode: quick direction keywords are missing");

  const audioHtml = await readText("audio/index.html");
  assert(audioHtml.includes("Try Example Sound"), "Audio mode: included example sound action is missing");

  const serviceWorker = await readText("service-worker.js");
  assert(serviceWorker.includes("cacheShellAssets"), "Service worker: install should use tolerant asset caching");
  assert(!serviceWorker.includes("cache.addAll"), "Service worker: cache.addAll should not block install");
  assert(!serviceWorker.includes("./engine/license.js"), "Service worker: license verifier asset should not be cached");
  assert(serviceWorker.includes("./engine/audio-preview.js"), "Service worker: missing browser preview asset");
}

function checkScratchEngine(seedByFamily) {
  const profile = buildScratchProfile({
    family: "pad",
    mood: "dark",
    register: "mid",
    intent: "dark evolving key for a tense intro",
    mutationAmount: 72,
    brightness: -12,
    motion: 34,
    attack: -8,
    width: 18,
    texture: 24,
  });
  const freePack = buildScratchFreePack(profile);
  const alternatePack = buildScratchFreePack(profile, 1);

  assert(freePack.length === 3, `Scratch engine: expected 3 free presets, found ${freePack.length}`);
  assert(freePack.map((preset) => preset.roleLabel).join("|") === "Closest|Darker|More Motion", "Scratch engine: free roles are inconsistent");
  assert(JSON.stringify(freePack[0].parameterMap) !== JSON.stringify(alternatePack[0].parameterMap), "Scratch engine: a new variation seed should produce a distinct set");

  for (const [index, preset] of freePack.entries()) {
    const label = `Scratch engine preset ${index + 1}`;
    validateGeneratedPresetModel(preset, label);
    validateRenderedGeneratedPreset(seedByFamily[preset.familyKey], preset, label);
  }
}

function checkAudioEngine(seedByFamily) {
  const analysis = {
    rms: 0.18,
    peak: 0.62,
    zeroCrossRate: 0.045,
    onsetRatio: 0.22,
    sustainRatio: 0.66,
    movement: 0.34,
    centroidHz: 2450,
    flatness: 0.18,
    stereoWidth: 0.52,
    pitchHz: 146,
    duration: 4.2,
  };
  const profile = buildAudioProfile(analysis, {
    inputMode: "auto",
    brightnessBias: -10,
    movementBias: 28,
    attackBias: 14,
    dirtBias: 18,
    widthBias: 20,
    mutationAmount: 68,
  });
  const freePack = buildAudioFreePack(profile);
  const alternatePack = buildAudioFreePack(profile, 1);

  assert(freePack.length === 3, `Audio engine: expected 3 free presets, found ${freePack.length}`);
  assert(freePack.map((preset) => preset.roleLabel).join("|") === "Closest|Darker|More Motion", "Audio engine: free roles are inconsistent");
  assert(JSON.stringify(freePack[0].parameterMap) !== JSON.stringify(alternatePack[0].parameterMap), "Audio engine: a new variation seed should produce a distinct set");
  assert(buildAudioPresetSummary({ family: "pad", brightness: 0.5, movement: 0.4, width: 0.5, sustain: 0.5, attack: 0.8, register: "C3" }).includes("harder attack"), "Audio engine: high attack summary should say harder attack");

  for (const [index, preset] of freePack.entries()) {
    const label = `Audio engine preset ${index + 1}`;
    validateGeneratedPresetModel(preset, label);
    validateRenderedGeneratedPreset(seedByFamily[preset.familyKey], preset, label);
  }
}

function checkPresetMutationEngine(seedFile, seedData) {
  const summary = presetSummary(seedData);
  const scalarKeys = safeScalarParameterKeys(seedData.settings);
  assert(summary.scalarKeys.length === scalarKeys.length, `${seedFile}: summary scalar key count does not match safe key scan`);
  assert(scalarKeys.length >= 8, `${seedFile}: expected at least 8 safe mutation parameters, found ${scalarKeys.length}`);

  const strategy = buildPresetMutateStrategy({
    amount: 74,
    tone: -18,
    motion: 42,
    attack: 12,
    space: 24,
    dirt: 28,
  });
  const sourcePreset = { data: seedData, summary, fileName: seedFile };
  const freeVariants = generatePresetVariants({
    sourcePreset,
    strategy,
    controls: { amount: 74, tone: -18, motion: 42, attack: 12, space: 24, dirt: 28 },
  });
  const alternateVariants = generatePresetVariants({
    sourcePreset,
    strategy,
    controls: { amount: 74, tone: -18, motion: 42, attack: 12, space: 24, dirt: 28 },
    variationSeed: 1,
  });

  assert(freeVariants.length === 3, `${seedFile}: expected 3 free mutation variants, found ${freeVariants.length}`);
  assert(freeVariants.map((variant) => variant.role.label).join("|") === "Closest|Darker|More Motion", `${seedFile}: free mutation roles are inconsistent`);
  assert(JSON.stringify(freeVariants[0].data.settings) !== JSON.stringify(alternateVariants[0].data.settings), `${seedFile}: a new variation seed should produce distinct mutations`);

  for (const [index, variant] of freeVariants.entries()) {
    validateMutatedVariant(variant, `${seedFile}: mutation variant ${index + 1}`);
  }
}

async function checkEngines() {
  const seedFiles = (await readdir(seedDir)).filter((file) => file.endsWith(".vital")).sort();
  assert(seedFiles.length >= 4, `Expected at least 4 Vital seed presets, found ${seedFiles.length}`);

  const seedByFamily = {
    pad: await loadSeed("KS Frozen Hollow.vital"),
    pluck: await loadSeed("KS Dread Lantern.vital"),
    bass: await loadSeed("KS Iron Wake.vital"),
    texture: await loadSeed("KS Shadow Archive.vital"),
  };

  for (const file of seedFiles) {
    const seed = await loadSeed(file);
    validatePresetShape(seed, `Seed ${file}`);
    checkPresetMutationEngine(file, seed);
  }

  checkScratchEngine(seedByFamily);
  checkAudioEngine(seedByFamily);
}

await checkPages();
await checkEngines();

if (failures.length) {
  console.error("Preset Mutator QA failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("Preset Mutator QA passed.");

import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  buildAudioFreePack,
  buildAudioPresetSummary,
  buildAudioProPack,
  buildAudioProfile,
  AUDIO_PRO_PACK_COUNT,
} from "../public/apps/preset-mutator/ui/engine/audio-engine.js";
import {
  buildPresetMutateStrategy,
  generatePresetVariants,
  parameterConfigForKey,
  PRESET_MUTATE_PRO_PACK_COUNT,
  presetSummary,
  safeScalarParameterKeys,
} from "../public/apps/preset-mutator/ui/engine/preset-mutate-engine.js";
import {
  buildScratchFreePack,
  buildScratchProPack,
  buildScratchProfile,
  SCRATCH_PRO_PACK_COUNT,
} from "../public/apps/preset-mutator/ui/engine/scratch-engine.js";
import {
  scoreGeneratedPreset,
  scoreMutationVariant,
} from "../public/apps/preset-mutator/ui/engine/quality.js";
import { buildVitalPresetPayload } from "../public/apps/preset-mutator/ui/engine/vital-export.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const uiDir = path.join(rootDir, "public/apps/preset-mutator/ui");
const seedDir = path.join(rootDir, "public/apps/preset-mutator/assets/seeds/vital/raw");

const failures = [];

const modePages = [
  { name: "Scratch root", html: "index.html", app: "app.js", requiredImports: ["scratch-engine.js", "quality.js", "vital-export.js"] },
  { name: "Scratch route", html: "scratch/index.html", app: "scratch/app.js", requiredImports: ["scratch-engine.js", "quality.js", "vital-export.js"] },
  { name: "Audio", html: "audio/index.html", app: "audio/app.js", requiredImports: ["audio-engine.js", "quality.js", "vital-export.js"] },
  { name: "Preset", html: "mutate/index.html", app: "mutate/app.js", requiredImports: ["preset-mutate-engine.js", "quality.js"] },
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
  assert(preset.parameterMap && typeof preset.parameterMap === "object", `${label}: missing parameter map`);

  for (const [key, range] of Object.entries(generatedParameterRanges)) {
    validateRange(label, key, preset.parameterMap[key], range);
  }

  const quality = scoreGeneratedPreset(preset);
  assert(quality.score >= 60 && quality.score <= 98, `${label}: quality score ${quality.score} is outside expected range`);
  assert(quality.notes.length > 0, `${label}: missing quality notes`);
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

  for (const key of variant.changedParameters) {
    const config = parameterConfigForKey(key);
    assert(Boolean(config), `${label}: ${key} is not a safe mutation parameter`);
    if (!config) {
      continue;
    }
    validateRange(label, key, variant.data.settings[key], [config.low, config.high]);
  }

  const quality = scoreMutationVariant(variant);
  assert(quality.score >= 60 && quality.score <= 98, `${label}: quality score ${quality.score} is outside expected range`);
  assert(quality.notes.length > 0, `${label}: missing quality notes`);
}

async function readText(relativePath) {
  return readFile(path.join(uiDir, relativePath), "utf8");
}

async function loadSeed(file) {
  return JSON.parse(await readFile(path.join(seedDir, file), "utf8"));
}

async function checkPages() {
  for (const page of modePages) {
    const html = await readText(page.html);
    const app = await readText(page.app);
    assert(html.includes("id=\"mutation-knob\""), `${page.name}: missing Mutation Amount knob mount`);
    assert(html.includes("local-trust-strip"), `${page.name}: missing compact local trust strip`);
    assert(!html.includes("hero-cover"), `${page.name}: hero cover should not be present in app UI`);
    assert(!html.includes("<h1></h1>"), `${page.name}: empty h1 found`);
    assert(html.includes("Generate 3 Free Variants"), `${page.name}: free action should use variants language`);
    assert(html.includes("32 Pro variants"), `${page.name}: Pro output should use variants language`);

    for (const requiredImport of page.requiredImports) {
      assert(app.includes(requiredImport), `${page.name}: app is not using ${requiredImport}`);
    }
  }

  const mutateHtml = await readText("mutate/index.html");
  assert(!mutateHtml.includes("trust-panel"), "Preset mode: Local Processing panel should stay removed");
  assert(!mutateHtml.includes("insight-panel"), "Preset mode: tips panel should stay removed");
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
  const proPack = buildScratchProPack(profile);

  assert(freePack.length === 3, `Scratch engine: expected 3 free presets, found ${freePack.length}`);
  assert(proPack.length === SCRATCH_PRO_PACK_COUNT, `Scratch engine: expected ${SCRATCH_PRO_PACK_COUNT} pro presets, found ${proPack.length}`);
  assert(freePack.map((preset) => preset.roleLabel).join("|") === "Closest|Darker|More Motion", "Scratch engine: free roles are inconsistent");

  for (const [index, preset] of [...freePack, ...proPack].entries()) {
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
  const proPack = buildAudioProPack(profile);

  assert(freePack.length === 3, `Audio engine: expected 3 free presets, found ${freePack.length}`);
  assert(proPack.length === AUDIO_PRO_PACK_COUNT, `Audio engine: expected ${AUDIO_PRO_PACK_COUNT} pro presets, found ${proPack.length}`);
  assert(freePack.map((preset) => preset.roleLabel).join("|") === "Closest|Darker|More Motion", "Audio engine: free roles are inconsistent");
  assert(buildAudioPresetSummary({ family: "pad", brightness: 0.5, movement: 0.4, width: 0.5, sustain: 0.5, attack: 0.8, register: "C3" }).includes("harder attack"), "Audio engine: high attack summary should say harder attack");

  for (const [index, preset] of [...freePack, ...proPack].entries()) {
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
    mode: "free",
    controls: { amount: 74, tone: -18, motion: 42, attack: 12, space: 24, dirt: 28 },
  });
  const proVariants = generatePresetVariants({
    sourcePreset,
    strategy,
    mode: "pro",
    controls: { amount: 74, tone: -18, motion: 42, attack: 12, space: 24, dirt: 28 },
  });

  assert(freeVariants.length === 3, `${seedFile}: expected 3 free mutation variants, found ${freeVariants.length}`);
  assert(proVariants.length === PRESET_MUTATE_PRO_PACK_COUNT, `${seedFile}: expected ${PRESET_MUTATE_PRO_PACK_COUNT} pro mutation variants, found ${proVariants.length}`);
  assert(freeVariants.map((variant) => variant.role.label).join("|") === "Closest|Darker|More Motion", `${seedFile}: free mutation roles are inconsistent`);

  for (const [index, variant] of [...freeVariants, ...proVariants].entries()) {
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

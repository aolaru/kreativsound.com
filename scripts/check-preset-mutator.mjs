import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const uiDir = path.join(rootDir, "public/apps/preset-mutator/ui");
const seedDir = path.join(rootDir, "public/apps/preset-mutator/assets/seeds/vital/raw");

const failures = [];

const modePages = [
  { name: "Scratch root", html: "index.html", app: "app.js" },
  { name: "Scratch route", html: "scratch/index.html", app: "scratch/app.js" },
  { name: "Audio", html: "audio/index.html", app: "audio/app.js" },
  { name: "Preset", html: "mutate/index.html", app: "mutate/app.js" },
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

const generationMaps = [
  {
    role: "Closest",
    parameterMap: {
      osc_1_level: 0.72,
      osc_2_level: 0.34,
      osc_1_unison_voices: 3,
      osc_2_unison_voices: 2,
      osc_1_unison_detune: 0.08,
      osc_2_unison_detune: 0.1,
      osc_1_stereo_spread: 0.42,
      osc_2_stereo_spread: 0.38,
      filter_1_cutoff: 42,
      filter_1_resonance: 0.22,
      filter_1_drive: 1.1,
      filter_1_keytrack: 0.38,
      filter_1_mix: 1,
      env_1_attack: 0.22,
      env_1_decay: 0.42,
      env_1_sustain: 0.68,
      env_1_release: 0.55,
      chorus_dry_wet: 0.22,
      chorus_mod_depth: 0.3,
      chorus_feedback: 0.18,
      reverb_dry_wet: 0.26,
      reverb_size: 0.58,
      reverb_decay_time: 0.6,
      delay_dry_wet: 0.08,
      delay_feedback: 0.22,
      delay_filter_cutoff: 56,
      distortion_mix: 0.08,
      distortion_drive: 0.8,
      filter_fx_cutoff: 54,
      filter_fx_resonance: 0.16,
      sample_on: 0,
      noise_on: 1,
      noise_level: 0.08,
    },
  },
  {
    role: "Darker",
    parameterMap: {
      osc_1_level: 0.86,
      osc_2_level: 0.26,
      osc_1_unison_voices: 2,
      osc_2_unison_voices: 1,
      osc_1_unison_detune: 0.05,
      osc_2_unison_detune: 0.07,
      osc_1_stereo_spread: 0.28,
      osc_2_stereo_spread: 0.24,
      filter_1_cutoff: 24,
      filter_1_resonance: 0.34,
      filter_1_drive: 1.8,
      filter_1_keytrack: 0.22,
      filter_1_mix: 1,
      env_1_attack: 0.34,
      env_1_decay: 0.52,
      env_1_sustain: 0.78,
      env_1_release: 0.68,
      chorus_dry_wet: 0.14,
      chorus_mod_depth: 0.22,
      chorus_feedback: 0.12,
      reverb_dry_wet: 0.34,
      reverb_size: 0.66,
      reverb_decay_time: 0.72,
      delay_dry_wet: 0.06,
      delay_feedback: 0.2,
      delay_filter_cutoff: 42,
      distortion_mix: 0.18,
      distortion_drive: 1.6,
      filter_fx_cutoff: 34,
      filter_fx_resonance: 0.26,
      sample_on: 0,
      noise_on: 1,
      noise_level: 0.14,
    },
  },
  {
    role: "More Motion",
    parameterMap: {
      osc_1_level: 0.68,
      osc_2_level: 0.52,
      osc_1_unison_voices: 6,
      osc_2_unison_voices: 5,
      osc_1_unison_detune: 0.22,
      osc_2_unison_detune: 0.24,
      osc_1_stereo_spread: 0.72,
      osc_2_stereo_spread: 0.66,
      filter_1_cutoff: 68,
      filter_1_resonance: 0.3,
      filter_1_drive: 1.4,
      filter_1_keytrack: 0.46,
      filter_1_mix: 1,
      env_1_attack: 0.18,
      env_1_decay: 0.5,
      env_1_sustain: 0.62,
      env_1_release: 0.58,
      chorus_dry_wet: 0.42,
      chorus_mod_depth: 0.62,
      chorus_feedback: 0.5,
      reverb_dry_wet: 0.38,
      reverb_size: 0.72,
      reverb_decay_time: 0.74,
      delay_dry_wet: 0.18,
      delay_feedback: 0.44,
      delay_filter_cutoff: 72,
      distortion_mix: 0.16,
      distortion_drive: 1.3,
      filter_fx_cutoff: 64,
      filter_fx_resonance: 0.22,
      sample_on: 0,
      noise_on: 1,
      noise_level: 0.12,
    },
  },
];

const safeParameterBounds = {
  level: { low: 0, high: 1, integral: false },
  pan: { low: -1, high: 1, integral: false },
  transpose: { low: -24, high: 24, integral: true },
  tune: { low: -1, high: 1, integral: false },
  frame_spread: { low: 0, high: 1, integral: false },
  stereo_spread: { low: 0, high: 1, integral: false },
  unison_blend: { low: 0, high: 1, integral: false },
  unison_detune: { low: 0, high: 1, integral: false },
  wave_frame: { low: 0, high: 1, integral: false },
  spectral_morph_amount: { low: 0, high: 1, integral: false },
  distortion_amount: { low: 0, high: 1, integral: false },
  cutoff: { low: 0, high: 100, integral: false },
  resonance: { low: 0, high: 1, integral: false },
  drive: { low: 0, high: 4, integral: false },
  keytrack: { low: 0, high: 1, integral: false },
  mix: { low: 0, high: 1, integral: false },
  attack: { low: 0, high: 1, integral: false },
  decay: { low: 0, high: 1, integral: false },
  sustain: { low: 0, high: 1, integral: false },
  release: { low: 0, high: 1, integral: false },
  dry_wet: { low: 0, high: 1, integral: false },
  feedback: { low: 0, high: 0.95, integral: false },
  mod_depth: { low: 0, high: 1, integral: false },
  spread: { low: 0, high: 1, integral: false },
  decay_time: { low: 0, high: 1, integral: false },
  size: { low: 0, high: 1, integral: false },
  pre_high_cutoff: { low: 0, high: 100, integral: false },
  pre_low_cutoff: { low: 0, high: 100, integral: false },
  filter_cutoff: { low: 0, high: 100, integral: false },
};

const safeParameterPrefixes = [
  "osc_1_",
  "osc_2_",
  "filter_1_",
  "filter_2_",
  "env_1_",
  "env_2_",
  "chorus_",
  "delay_",
  "reverb_",
];

function fail(message) {
  failures.push(message);
}

function assert(condition, message) {
  if (!condition) {
    fail(message);
  }
}

function cloneJson(value) {
  return JSON.parse(JSON.stringify(value));
}

function clamp(value, low, high) {
  return Math.min(high, Math.max(low, value));
}

function configForKey(key) {
  for (const [suffix, config] of Object.entries(safeParameterBounds)) {
    if (key.endsWith(suffix)) {
      return config;
    }
  }
  return null;
}

function safeScalarParameterKeys(settings) {
  return Object.keys(settings)
    .filter((key) => {
      const value = settings[key];
      if (typeof value !== "number" || !Number.isFinite(value)) {
        return false;
      }
      if (!safeParameterPrefixes.some((prefix) => key.startsWith(prefix))) {
        return false;
      }
      if (/_on$|_style$|_model$|_destination$|_filter_input$|_midi_track$|_sync$|_tempo$|_voices$/.test(key)) {
        return false;
      }
      if (/_attack_power$|_decay_power$|_release_power$|_delay$|_hold$/.test(key)) {
        return false;
      }
      if (key.includes("formant_") || key.endsWith("blend_transpose")) {
        return false;
      }
      return Boolean(configForKey(key));
    })
    .sort();
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

function validateGeneratedPreset(data, label) {
  validatePresetShape(data, label);
  for (const [key, range] of Object.entries(generatedParameterRanges)) {
    validateRange(label, key, data.settings[key], range);
  }
}

function buildGeneratedPreset(seed, role) {
  const data = cloneJson(seed);
  for (const [key, value] of Object.entries(role.parameterMap)) {
    data.settings[key] = value;
  }
  data.author = "Preset Mutator QA";
  data.comments = `${role.role} generated QA preset.`;
  data.preset_name = `QA ${role.role}`;
  data.preset_style = "QA";
  return data;
}

function buildMutatedPreset(seed, label, amount) {
  const data = cloneJson(seed);
  const keys = safeScalarParameterKeys(data.settings);
  assert(keys.length >= 8, `${label}: expected at least 8 safe mutation parameters, found ${keys.length}`);

  const changeCount = Math.min(18, Math.max(6, Math.round(6 + amount * 14)));
  const chosen = [];
  for (let index = 0; chosen.length < Math.min(changeCount, keys.length) && index < keys.length * 2; index += 1) {
    const key = keys[(index * 7 + Math.round(amount * 10)) % keys.length];
    if (!chosen.includes(key)) {
      chosen.push(key);
    }
  }

  for (const [index, key] of chosen.entries()) {
    const config = configForKey(key);
    const span = config.high - config.low;
    const direction = index % 2 === 0 ? 1 : -1;
    const nextValue = clamp(Number(data.settings[key]) + direction * span * amount * 0.08, config.low, config.high);
    data.settings[key] = config.integral ? Math.round(nextValue) : nextValue;
    assert(data.settings[key] >= config.low && data.settings[key] <= config.high, `${label}: ${key} mutation escaped safe bounds`);
  }

  data.preset_name = `${data.preset_name || data.preset_style || "Preset"} / QA Mutation`;
  data.comments = `QA mutation changed ${chosen.length} safe parameters.`;
  return { data, changedCount: chosen.length };
}

async function readText(relativePath) {
  return readFile(path.join(uiDir, relativePath), "utf8");
}

async function checkPages() {
  for (const page of modePages) {
    const html = await readText(page.html);
    assert(html.includes("id=\"mutation-knob\""), `${page.name}: missing Mutation Amount knob mount`);
    assert(html.includes("local-trust-strip"), `${page.name}: missing compact local trust strip`);
    assert(!html.includes("hero-cover"), `${page.name}: hero cover should not be present in app UI`);
    assert(!html.includes("<h1></h1>"), `${page.name}: empty h1 found`);
  }

  const mutateHtml = await readText("mutate/index.html");
  assert(!mutateHtml.includes("trust-panel"), "Preset mode: Local Processing panel should stay removed");
  assert(!mutateHtml.includes("insight-panel"), "Preset mode: tips panel should stay removed");
}

async function checkModeConsistency() {
  const requiredDirections = ["Closest", "Darker", "More Motion"];

  for (const page of modePages) {
    const app = await readText(page.app);
    for (const direction of requiredDirections) {
      assert(app.includes(direction), `${page.name}: missing '${direction}' free direction`);
    }
  }

  const audioApp = await readText("audio/app.js");
  assert(!audioApp.includes('attack > 0.62 ? "softer attack"'), "Audio mode: attack summary is reversed");
}

async function checkSeedsAndGeneratedPresets() {
  const seedFiles = (await readdir(seedDir)).filter((file) => file.endsWith(".vital")).sort();
  assert(seedFiles.length >= 4, `Expected at least 4 Vital seed presets, found ${seedFiles.length}`);

  for (const file of seedFiles) {
    const label = `Seed ${file}`;
    const data = JSON.parse(await readFile(path.join(seedDir, file), "utf8"));
    validatePresetShape(data, label);

    for (const role of generationMaps) {
      validateGeneratedPreset(buildGeneratedPreset(data, role), `${label} -> generated ${role.role}`);
    }

    for (const amount of [0.25, 0.6, 0.9]) {
      const mutation = buildMutatedPreset(data, `${label} -> mutate ${amount}`, amount);
      validatePresetShape(mutation.data, `${label} -> mutate ${amount}`);
      assert(mutation.changedCount > 0, `${label} -> mutate ${amount}: no parameters changed`);
    }
  }
}

await checkPages();
await checkModeConsistency();
await checkSeedsAndGeneratedPresets();

if (failures.length) {
  console.error("Preset Mutator QA failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("Preset Mutator QA passed.");

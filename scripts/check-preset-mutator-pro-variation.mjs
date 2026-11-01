import assert from "node:assert/strict";
import fs from "node:fs";
import { decode } from "cbor-x";
import { Zstd } from "@hpcc-js/wasm-zstd";
import { buildScratchProfile, buildScratchProPack } from "../apps/preset-mutator-pro/public/engine/scratch-engine.js";
import { buildAudioProfile, buildAudioProPack } from "../apps/preset-mutator-pro/public/engine/audio-engine.js";
import { applyParameterMapToPreset } from "../apps/preset-mutator-pro/public/engine/vital-export.js";
import { applyGeneratedPresetToSerum2, generateSerum2PresetVariants, parseSerum2Container, summarizeSerum2Preset } from "../apps/preset-mutator-pro/public/engine/serum2-format.js";
import { applyGeneratedPresetToPigments, bytesToBinaryString, generatePigmentsPresetVariants, summarizePigmentsPreset } from "../apps/preset-mutator-pro/public/engine/pigments-format.js";
import { generatePresetVariants, presetSummary, parameterConfigForKey } from "../apps/preset-mutator-pro/public/engine/preset-mutate-engine.js";
import { COMPONENTS, normalizeVariationOptions, vitalComponent, serumComponent, pigmentsComponent } from "../apps/preset-mutator-pro/public/engine/variation-controls.js";

const base = new URL("../apps/preset-mutator-pro/public/", import.meta.url);
const read = (path) => fs.readFileSync(new URL(path, base));
const zstd = await Zstd.load();
const serum = parseSerum2Container(read("assets/seeds/serum2/raw/KS Serum 2 Base.SerumPreset"), { decode, decompress: (bytes) => zstd.decompress(bytes) }).data;
const pigments = bytesToBinaryString(read("assets/seeds/pigments/raw/KS Pigments Base.pgtpreset"));
const vitalCache = new Map();
function vitalSeed(preset) {
  const file = preset.templateFile;
  if (!vitalCache.has(file)) vitalCache.set(file, JSON.parse(read(`assets/seeds/vital/velvet-ruins/${file}`)));
  return vitalCache.get(file);
}
function pigmentScalars(text) {
  return Object.fromEntries([...text.matchAll(/(?:^| )(\d+) ([A-Za-z][A-Za-z\d_]*) (-?\d+(?:\.\d+)?(?:e[-+]?\d+)?)(?= )/gi)]
    .filter((match) => Number(match[1]) === match[2].length)
    .map((match) => [match[2], Number(match[3])]));
}
function componentData(data, classify, locks) {
  return Object.fromEntries(Object.entries(data).filter(([key]) => locks[classify(key)]));
}
function assertLocked(actual, reference, classify, options, label) {
  assert.deepEqual(componentData(actual, classify, options.locks), componentData(reference, classify, options.locks), label);
}

const scratch = buildScratchProfile({ family: "pad", mood: "dark", register: "high", intent: "evolving glass", mutationAmount: 65 });
const audio = buildAudioProfile({ centroidHz: 1800, pitchHz: 146, onsetRatio: 0.3, sustainRatio: 0.7, movement: 0.35, flatness: 0.2, zeroCrossRate: 0.04, stereoWidth: 0.4, duration: 4 });
for (const [mode, build, profile] of [["scratch", buildScratchProPack, scratch], ["audio", buildAudioProPack, audio]]) {
  for (let mask = 1; mask < 16; mask += 1) {
    const options = normalizeVariationOptions({ direction: "reimagine", locks: Object.fromEntries(COMPONENTS.map((key, index) => [key, Boolean(mask & (1 << index))])) });
    const pack = build(profile, 1234, options);
    const laterPack = build(profile, 9876, options);
    assert.equal(pack.length, 32);
    const reference = pack[0].variationReference;
    assert(reference && !reference.variationReference, "References must remain bounded and independent of prior generations");
    const seed = vitalSeed(reference);
    const nativeReference = applyParameterMapToPreset(seed, reference).settings;
    const serumReference = applyGeneratedPresetToSerum2(serum, reference);
    const pigmentsReference = pigmentScalars(applyGeneratedPresetToPigments(pigments, reference));
    for (const candidate of [pack[0], pack[15], pack[31], laterPack[20]]) {
      assert.equal(candidate.templateFile, reference.templateFile, "Locked components must not inherit a different template");
      assertLocked(applyParameterMapToPreset(seed, candidate).settings, nativeReference, vitalComponent, options, `${mode}: Vital lock mask ${mask}`);
      assertLocked(applyGeneratedPresetToSerum2(serum, candidate), serumReference, serumComponent, options, `${mode}: Serum lock mask ${mask}`);
      assertLocked(pigmentScalars(applyGeneratedPresetToPigments(pigments, candidate)), pigmentsReference, pigmentsComponent, options, `${mode}: Pigments lock mask ${mask}`);
    }
  }
  const close = build(profile, 1234, { direction: "stay-close" });
  const explore = build(profile, 1234, { direction: "explore" });
  const reimagine = build(profile, 1234, { direction: "reimagine" });
  assert.equal(new Set(close.map((preset) => preset.templateFile)).size, 1, "Stay close retains one sound architecture");
  assert.equal(new Set(close.map((preset) => preset.topology)).size, 1);
  assert(new Set(explore.map((preset) => preset.templateFile)).size >= 3);
  assert.equal(new Set(reimagine.map((preset) => preset.topology)).size, 4);
  assert.notDeepEqual(explore.map((p) => p.parameterMap), reimagine.map((p) => p.parameterMap));
  assert.deepEqual(reimagine, build(profile, 1234, { direction: "reimagine" }), "Direction and seed are reproducible");
}

const vital = vitalSeed(buildScratchProPack(scratch, 1234)[0]);
const strategy = { amount: 0.65, tone: 0.1, motion: 0.2, attack: 0.15, dirt: 0.1, space: 0.1 };
const sources = [
  { format: "Vital", source: { data: vital, fileName: "test.vital", summary: presetSummary(vital) }, build: generatePresetVariants, native: (preset) => preset.data.settings, classify: vitalComponent },
  { format: "Serum", source: { data: serum, metadata: {}, fileName: "test.SerumPreset", summary: summarizeSerum2Preset({ data: serum, metadata: {} }) }, build: generateSerum2PresetVariants, native: (preset) => preset.data, classify: serumComponent },
  { format: "Pigments", source: { presetText: pigments, fileName: "test.pgtx", summary: summarizePigmentsPreset(pigments) }, build: generatePigmentsPresetVariants, native: (preset) => pigmentScalars(preset.presetText), classify: pigmentsComponent },
];
for (const { format, source, build, native, classify } of sources) {
  const input = structuredClone(source);
  const sourceNative = native(source);
  for (let mask = 0; mask < 16; mask += 1) {
    const options = normalizeVariationOptions({ direction: "reimagine", locks: Object.fromEntries(COMPONENTS.map((key, index) => [key, Boolean(mask & (1 << index))])) });
    if (mask === 15) {
      assert.throws(() => build({ sourcePreset: source, strategy, variationOptions: options }), /unlock/i);
      continue;
    }
    const pack = build({ sourcePreset: source, strategy, generationSeed: 1234, variationSeed: 1234, variationOptions: options });
    assert.equal(pack.length, 32);
    for (const candidate of pack) assertLocked(native(candidate), sourceNative, classify, options, `${format}: imported lock mask ${mask}`);
    assert(pack.some((candidate) => candidate.changedParameters.length > 0), `${format}: unlocked components must still vary`);
  }
  assert.deepEqual(source, input, "Never mutate the imported source");
  const packs = Object.fromEntries(["stay-close", "explore", "reimagine"].map((direction) => [direction, build({ sourcePreset: source, strategy, generationSeed: 1234, variationSeed: 1234, variationOptions: { direction } })]));
  assert.notDeepEqual(native(packs.explore[0]), native(packs.reimagine[0]));
  for (const candidate of packs["stay-close"]) {
    if (format === "Vital") assert.equal(candidate.data.settings.env_1_attack, source.data.settings.env_1_attack);
    if (format === "Serum") assert.deepEqual(candidate.data.Env0?.plainParams?.kParamAttack, source.data.Env0?.plainParams?.kParamAttack);
    if (format === "Pigments") assert.equal(pigmentScalars(candidate.presetText).Env1_Attack, sourceNative.Env1_Attack);
  }
  if (format === "Vital") {
    const distance = (pack) => pack.reduce((sum, preset) => sum + Object.keys(sourceNative).reduce((total, key) => {
      const config = parameterConfigForKey(key);
      return total + (config && typeof sourceNative[key] === "number" ? Math.abs(preset.data.settings[key] - sourceNative[key]) / (config.high - config.low) : 0);
    }, 0), 0);
    assert(distance(packs["stay-close"]) < distance(packs.explore));
    assert(distance(packs.explore) < distance(packs.reimagine));
  }
}

for (const mode of ["", "audio/", "mutate/"]) {
  const html = read(`${mode}index.html`).toString();
  const app = read(`${mode}app.js`).toString();
  assert.equal((html.match(/data-pro-variation-controls/g) || []).length, 1);
  assert(app.includes("mountProVariationControls"));
  assert(app.includes("Unlock at least one component"));
}
const worker = read("service-worker.js").toString();
assert(worker.includes('"./engine/variation-controls.js"'));
assert(worker.includes('"./pro-variation-controls.js"'));
console.log("Pro variation checks passed: every lock combination, native exports for three synths, Scratch/Audio baselines, source preservation, directions, reproducibility, and offline assets.");

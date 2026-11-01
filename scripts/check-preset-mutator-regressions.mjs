import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import vm from "node:vm";

export async function checkPresetRegressions(edition) {
  const base = new URL(`../apps/${edition}/public/`, import.meta.url);
  const load = (file) => import(new URL(file, base));
  const read = (file) => readFile(new URL(file, base), "utf8");
  const common = await load("engine/common.js");
  const mutate = await load("engine/preset-mutate-engine.js");
  const scratch = await load("engine/scratch-engine.js");
  const vital = await load("engine/vital-export.js");
  const serum = await load("engine/serum2-format.js");
  const pigments = await load("engine/pigments-format.js");
  const { analyzeAudio } = await load("engine/audio-analysis.js");
  const seed = JSON.parse(await read("assets/seeds/vital/raw/KS Frozen Hollow.vital"));
  const sourcePreset = { data: seed, fileName: "source.vital", summary: mutate.presetSummary(seed) };

  for (const variant of mutate.generatePresetVariants({ sourcePreset, strategy: mutate.buildPresetMutateStrategy({ amount: 0 }) })) {
    assert.deepEqual(variant.data.settings, seed.settings, `${edition}: 0% must preserve every source setting`);
  }
  for (const [key, value] of [["osc_1_wave_frame", 47], ["phaser_mod_depth", 24], ["osc_1_unison_detune", 4.47], ["env_1_release", 1.8]]) {
    const data = { preset_name: "Range probe", settings: { [key]: value } };
    const variants = mutate.generatePresetVariants({ sourcePreset: { data, fileName: "range.vital", summary: mutate.presetSummary(data) }, strategy: mutate.buildPresetMutateStrategy({ amount: 1 }) });
    assert(variants.every((variant) => Math.abs(variant.data.settings[key] - value) < (key.includes("wave_frame") ? 2 : 0.5)), `${edition}: native ${key} must not snap into a normalized range`);
  }

  const build = scratch.buildScratchFreePack || scratch.buildScratchProPack;
  const pigmentsSeed = new Uint8Array(await readFile(new URL("assets/seeds/pigments/raw/KS Pigments Base.pgtpreset", base)));
  const probe = build(scratch.buildScratchProfile({ family: "pad", register: "mid" }), 42)[0];
  const serumSource = { data: serum.applyGeneratedPresetToSerum2({}, probe), metadata: { presetName: "Zero probe" }, fileName: "zero.SerumPreset" };
  const zeroStrategy = mutate.buildPresetMutateStrategy({ amount: 0 });
  for (const variant of serum.generateSerum2PresetVariants({ sourcePreset: serumSource, strategy: zeroStrategy })) {
    assert.deepEqual(variant.data, serumSource.data, `${edition}: zero Serum mutation must preserve source settings`);
  }
  const pigmentsText = pigments.applyGeneratedPresetToPigments(pigmentsSeed, probe);
  const pigmentsSource = { presetText: pigmentsText, summary: pigments.summarizePigmentsPreset(pigmentsText), fileName: "zero.pgtx" };
  for (const variant of pigments.generatePigmentsPresetVariants({ sourcePreset: pigmentsSource, strategy: zeroStrategy })) {
    assert.equal(variant.changedParameters.length, 0, `${edition}: zero Pigments mutation must report no changes`);
    for (const key of pigmentsSource.summary.scalarKeys) assert.equal(pigments.readPigmentsParameter(variant.presetText, key), pigments.readPigmentsParameter(pigmentsText, key));
  }
  for (const family of ["pad", "pluck", "bass", "texture"]) {
    const low = build(scratch.buildScratchProfile({ family, register: "low" }), 42)[0];
    const high = build(scratch.buildScratchProfile({ family, register: "high" }), 42)[0];
    assert.equal(vital.applyParameterMapToPreset(seed, high).settings.osc_1_transpose - vital.applyParameterMapToPreset(seed, low).settings.osc_1_transpose, 24, `${edition}: Vital register`);
    assert.equal(serum.applyGeneratedPresetToSerum2({}, high).Oscillator0.plainParams.kParamOctave - serum.applyGeneratedPresetToSerum2({}, low).Oscillator0.plainParams.kParamOctave, 2, `${edition}: Serum register`);
    const lowText = pigments.applyGeneratedPresetToPigments(pigmentsSeed, low);
    const highText = pigments.applyGeneratedPresetToPigments(pigmentsSeed, high);
    assert(pigments.readPigmentsParameter(highText, "Engine1_Coarse") > pigments.readPigmentsParameter(lowText, "Engine1_Coarse"), `${edition}: Pigments register`);
  }

  const makeBuffer = (channels, sampleRate = 44100) => ({ length: channels[0].length, duration: channels[0].length / sampleRate, sampleRate, numberOfChannels: channels.length, getChannelData: (i) => channels[i] });
  const tone = Float32Array.from({ length: 22050 }, (_, i) => 0.4 * Math.sin(2 * Math.PI * 220 * i / 44100));
  assert.throws(() => analyzeAudio(makeBuffer([new Float32Array(22050)])), /silent|quiet/, `${edition}: reject silence`);
  const delayed = new Float32Array(30000);
  delayed.set(tone, 7500);
  for (const buffer of [makeBuffer([tone]), makeBuffer([delayed]), makeBuffer([tone, Float32Array.from(tone, (v) => -v)])]) {
    const analysis = analyzeAudio(buffer);
    assert(Math.abs(analysis.pitchHz - 220) < 2, `${edition}: active-window pitch detection`);
    assert(analysis.flatness < 0.1 && analysis.rms > 0.1, `${edition}: tonal and antiphase audio must retain their content`);
  }

  const marker = '<img src="x" onerror="window.audit=1">';
  assert(!common.escapeHtml(marker).includes("<img"));
  const app = await read("mutate/app.js");
  const render = app.match(/function renderSourceMetrics\(\) \{[\s\S]*?\n\}/)[0];
  const elements = { sourceMetrics: {} };
  vm.runInNewContext(`${render}\nrenderSourceMetrics();`, {
    state: { sourceFormat: "vital", sourcePreset: { summary: { ...sourcePreset.summary, author: marker, sampleName: marker } } },
    elements, escapeHtml: common.escapeHtml, synthTargetDetails: common.synthTargetDetails,
  });
  assert(!elements.sourceMetrics.innerHTML.includes(marker), `${edition}: imported metadata must render as text`);
  assert(app.includes("escapeHtml(variant.name)"), `${edition}: result names must render as text`);
  for (const file of ["app.js", "audio/app.js"]) assert((await read(file)).includes("escapeHtml(preset.name)"), `${edition}: ${file} result names must render as text`);

  const workerSource = await read("service-worker.js");
  const currentCache = /const CACHE_NAME = "([^"]+)"/.exec(workerSource)[1];
  const handlers = {}, deleted = [];
  let waiting;
  vm.runInNewContext(workerSource, {
    self: { addEventListener: (type, fn) => { handlers[type] = fn; }, clients: { claim() {} } },
    caches: { keys: async () => [currentCache, `${edition}-shell-old`, "other-app-cache", edition.endsWith("-pro") ? "preset-mutator-shell-v18" : "preset-mutator-pro-shell-v12"], delete: async (key) => deleted.push(key) },
  });
  handlers.activate({ waitUntil: (promise) => { waiting = promise; } });
  await waiting;
  assert.deepEqual(deleted, [`${edition}-shell-old`], `${edition}: cleanup must preserve other app caches`);
  assert(workerSource.includes("./engine/audio-analysis.js"));
  if (edition.endsWith("-pro")) {
    for (const name of await readdir(new URL("assets/seeds/vital/velvet-ruins/", base))) {
      if (name.endsWith(".vital")) assert(workerSource.includes(encodeURIComponent(name)), `Offline Pro must cache ${name}`);
    }
    assert(workerSource.includes("./vendor/jszip.min.js") && workerSource.includes("./mutate/styles.css"));
  }
  console.log(`${edition}: security, native bounds, register, audio, and cache regressions passed.`);
}

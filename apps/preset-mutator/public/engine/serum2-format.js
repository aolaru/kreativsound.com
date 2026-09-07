import { clamp, createRng, hashString, sanitizeFileName } from "./common.js";
import { FREE_VARIANT_ROLES } from "./preset-mutate-engine.js";

const MAGIC = "XferJson";
const HEADER_SIZE = 17;
const PAYLOAD_HEADER_SIZE = 8;
const ZSTD_CODEC = 2;

const SERUM_PARAMETERS = [
  { path: ["VoiceFilter0", "plainParams", "kParamFreq"], label: "filter cutoff", low: 0.03, high: 0.97, zone: "tone" },
  { path: ["VoiceFilter0", "plainParams", "kParamReso"], label: "filter resonance", low: 0, high: 20, zone: "tone" },
  { path: ["VoiceFilter0", "plainParams", "kParamDrive"], label: "filter drive", low: 0, high: 40, zone: "dirt" },
  { path: ["Env0", "plainParams", "kParamAttack"], label: "amp attack", low: 0, high: 4, zone: "attack" },
  { path: ["Env0", "plainParams", "kParamDecay"], label: "amp decay", low: 0.02, high: 8, zone: "motion" },
  { path: ["Env0", "plainParams", "kParamSustain"], label: "amp sustain", low: 0, high: 1, zone: "tone" },
  { path: ["Env0", "plainParams", "kParamRelease"], label: "amp release", low: 0.03, high: 10, zone: "motion" },
  { path: ["Oscillator0", "plainParams", "kParamVolume"], label: "oscillator A level", low: 0.08, high: 1, zone: "tone" },
  { path: ["Oscillator0", "plainParams", "kParamDetune"], label: "oscillator A detune", low: 0, high: 0.5, zone: "space" },
  { path: ["Oscillator0", "plainParams", "kParamDetuneWid"], label: "oscillator A width", low: 0, high: 100, zone: "space" },
  { path: ["Oscillator1", "plainParams", "kParamVolume"], label: "oscillator B level", low: 0, high: 0.8, zone: "tone" },
  { path: ["Oscillator1", "plainParams", "kParamDetune"], label: "oscillator B detune", low: 0, high: 0.5, zone: "space" },
  { path: ["Oscillator1", "plainParams", "kParamDetuneWid"], label: "oscillator B width", low: 0, high: 100, zone: "space" },
  { path: ["Oscillator3", "plainParams", "kParamVolume"], label: "noise level", low: 0, high: 0.35, zone: "dirt" },
  { path: ["Global0", "plainParams", "kParamMasterVolume"], label: "master level", low: 0.2, high: 0.82, zone: "tone" },
];

function readUint32(bytes, offset) {
  return new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength).getUint32(offset, true);
}

function writeUint32(target, offset, value) {
  new DataView(target.buffer, target.byteOffset, target.byteLength).setUint32(offset, value, true);
}

function bytesToText(bytes) {
  return new TextDecoder().decode(bytes);
}

function textToBytes(value) {
  return new TextEncoder().encode(value);
}

function cloneData(value) {
  return structuredClone(value);
}

function plainParams(module) {
  if (!module || typeof module !== "object") {
    return {};
  }
  if (!module.plainParams || typeof module.plainParams !== "object") {
    module.plainParams = {};
  }
  return module.plainParams;
}

function getPath(data, path) {
  let value = data;
  for (const key of path) {
    if (!value || typeof value !== "object") {
      return undefined;
    }
    value = value[key];
  }
  return value;
}

function setPath(data, path, value) {
  let target = data;
  for (const key of path.slice(0, -1)) {
    if (!target[key] || typeof target[key] !== "object") {
      target[key] = {};
    }
    target = target[key];
  }
  target[path.at(-1)] = value;
}

function wavetableOscillator(index, path, tablePosition = 0) {
  return {
    [`GranularOsc${index}`]: { plainParams: "default" },
    [`MultiSampleOsc${index}`]: { plainParams: "default" },
    [`SampleOsc${index}`]: { plainParams: "default" },
    [`SpectralOsc${index}`]: { plainParams: "default" },
    [`WTOsc${index}`]: {
      flex: {},
      numChannels: 1,
      numFrames: 8192,
      plainParams: { kParamTablePos: tablePosition },
      relativePathToWT: path,
      sampleRate: 44100,
    },
    plainParams: {},
  };
}

function resetGeneratedSerumPreset(data) {
  for (let index = 0; index < 64; index += 1) {
    data[`ModSlot${index}`] = { plainParams: "default" };
  }
  data.lfoPointModAssignments = [];

  for (let index = 0; index < 3; index += 1) {
    data[`FXRack${index}`] = { FX: [], displayName: "", plainParams: "default" };
  }

  const macroNames = ["Tone", "Motion", "Space", "Drive", "Macro 5", "Macro 6", "Macro 7", "Macro 8"];
  macroNames.forEach((name, index) => {
    data[`Macro${index}`] = { name, plainParams: { kParamValue: 0 } };
  });

  data.Oscillator0 = wavetableOscillator(0, "Analog/Basic Mini.wav");
  data.Oscillator1 = wavetableOscillator(1, "S2 Tables/Default Shapes.wav");
  data.Oscillator2 = wavetableOscillator(2, "S2 Tables/Default Shapes.wav");
  plainParams(data.Oscillator2).kParamEnable = 0;
  data.Oscillator3 = {
    NoiseOsc3: {
      numChannels: 1,
      numFrames: 78241,
      plainParams: "default",
      relativePathToNoiseSample: "Organics/AC hum1.wav",
      sampleRate: 44100,
    },
    plainParams: {},
  };
  data.Oscillator4 = { SubOsc4: { plainParams: { kParamShape: "kTriangle" } }, plainParams: {} };
  data.VoiceFilter0 = { plainParams: { kParamEnable: 1, kParamType: "L12" } };
  data.VoiceFilter1 = { plainParams: "default" };
  data.Env0 = { plainParams: {} };
  data.Global0 = { plainParams: { kParamMonoToggle: 0, kParamLegato: 0, kParamPortaAlways: 0, kParamPortamentoTime: 0 } };
  data.fileType = "SerumPreset";
}

function registerOctave(preset) {
  const familyBase = { bass: 82, pad: 220, pluck: 440, texture: 146 }[preset.familyKey] || 220;
  const pitch = Number(preset.pitchHz || preset.parameterMap?._pitchHz || familyBase);
  return Math.round(Math.log2(Math.max(20, pitch) / familyBase));
}

export function applyGeneratedPresetToSerum2(seedData, preset) {
  const data = cloneData(seedData);
  resetGeneratedSerumPreset(data);

  const map = preset.parameterMap || {};
  const family = preset.familyKey || "texture";
  const width = clamp(Number(map.osc_1_stereo_spread ?? 0.5));
  const movement = clamp((Number(map.chorus_feedback ?? 0.2) - 0.08) / 0.4);
  const noise = clamp(Number(map.noise_level ?? map.distortion_mix ?? 0));
  const octave = registerOctave(preset);
  const cutoff = clamp(Number(map.filter_1_cutoff ?? 72) / 127, 0.06, 0.96);
  const attack = clamp(Number(map.env_1_attack ?? 0.1), 0, 1) * 2.5;
  const decay = clamp(Number(map.env_1_decay ?? 0.3), 0, 1) * 3.4;
  const release = clamp(Number(map.env_1_release ?? 0.3), 0, 1) * 6.5;

  Object.assign(plainParams(data.Oscillator0), {
    kParamEnable: 1,
    kParamOctave: family === "bass" ? octave - 2 : octave - 1,
    kParamVolume: clamp(Number(map.osc_1_level ?? 0.7), 0.1, 1),
    kParamUnison: Math.round(clamp(Number(map.osc_1_unison_voices ?? 3), 1, 8)),
    kParamDetune: clamp(Number(map.osc_1_unison_detune ?? 0.08), 0, 0.5),
    kParamDetuneWid: width * 100,
  });
  Object.assign(plainParams(data.Oscillator1), {
    kParamEnable: 1,
    kParamOctave: family === "bass" ? octave - 1 : octave,
    kParamVolume: clamp(Number(map.osc_2_level ?? 0.35), 0, 0.8),
    kParamUnison: Math.round(clamp(Number(map.osc_2_unison_voices ?? 2), 1, 8)),
    kParamDetune: clamp(Number(map.osc_2_unison_detune ?? 0.1), 0, 0.5),
    kParamDetuneWid: clamp(Number(map.osc_2_stereo_spread ?? width), 0, 1) * 100,
  });
  Object.assign(plainParams(data.Oscillator3), {
    kParamEnable: noise > 0.04 ? 1 : 0,
    kParamVolume: clamp(noise * 0.28, 0, 0.28),
  });
  Object.assign(plainParams(data.Oscillator4), {
    kParamEnable: family === "bass" ? 1 : 0,
    kParamOctave: family === "bass" ? -2 : -1,
    kParamVolume: family === "bass" ? 0.24 : 0,
  });
  Object.assign(plainParams(data.VoiceFilter0), {
    kParamEnable: 1,
    kParamFreq: cutoff,
    kParamReso: clamp(Number(map.filter_1_resonance ?? 0.2), 0, 1) * 20,
    kParamDrive: clamp(Number(map.filter_1_drive ?? 0.8), 0, 4) * 8,
    kParamKeyTrack: clamp(Number(map.filter_1_keytrack ?? 0.35), 0, 1),
    kParamType: "L12",
  });
  Object.assign(plainParams(data.Env0), {
    kParamAttack: attack,
    kParamDecay: Math.max(0.02, decay),
    kParamSustain: clamp(Number(map.env_1_sustain ?? 0.65), 0, 1),
    kParamRelease: Math.max(0.03, release),
  });
  Object.assign(plainParams(data.Global0), {
    kParamMasterVolume: family === "bass" ? 0.58 : 0.52,
    kParamPolyCount: family === "bass" ? 8 : 16,
  });

  data.LFO0 = {
    curveData: { curveVals: [0.5, 0.5, 0.5], numPoints: 2, xVals: [0, 0.5, 1], yVals: [0, 1, 0] },
    curveDisplayName: "Triangle",
    pathData: {},
    plainParams: { kParamRate: 0.08 + movement * 0.32, kParamBeatSync: 0, kParamMode: "Free" },
  };
  if (movement > 0.08) {
    data.ModSlot0 = {
      destModuleID: 0,
      destModuleParamID: 3,
      destModuleParamName: "kParamFreq",
      destModuleTypeString: "VoiceFilter",
      plainParams: { kParamAmount: 12 + movement * 44, kParamBipolar: 1 },
      source: [16, 0],
    };
  }

  return data;
}

export function isSerum2PresetBytes(input) {
  const bytes = input instanceof Uint8Array ? input : new Uint8Array(input);
  return bytes.byteLength >= HEADER_SIZE && bytesToText(bytes.subarray(0, 8)) === MAGIC;
}

export function parseSerum2Container(input, { decode, decompress }) {
  const bytes = input instanceof Uint8Array ? input : new Uint8Array(input);
  if (!isSerum2PresetBytes(bytes)) {
    throw new Error("This is not a recognized Serum 2 preset.");
  }

  const metadataLength = readUint32(bytes, 9);
  const metadataStart = HEADER_SIZE;
  const payloadHeader = metadataStart + metadataLength;
  if (payloadHeader + PAYLOAD_HEADER_SIZE > bytes.byteLength) {
    throw new Error("The Serum 2 preset header is incomplete.");
  }
  if (readUint32(bytes, payloadHeader + 4) !== ZSTD_CODEC) {
    throw new Error("This Serum 2 preset uses an unsupported compression format.");
  }

  const metadata = JSON.parse(bytesToText(bytes.subarray(metadataStart, payloadHeader)));
  const expectedLength = readUint32(bytes, payloadHeader);
  const decodedBytes = decompress(bytes.subarray(payloadHeader + PAYLOAD_HEADER_SIZE));
  if (decodedBytes.byteLength !== expectedLength) {
    throw new Error("The Serum 2 preset payload is incomplete.");
  }
  const data = decode(decodedBytes);
  if (!data || data.fileType !== "SerumPreset") {
    throw new Error("The file does not contain Serum 2 preset data.");
  }
  return { metadata, data };
}

export function buildSerum2Container({ metadata, data }, { encode, compress, md5 }) {
  const encoded = encode(data);
  const compressed = compress(encoded, 5);
  const nextMetadata = {
    ...metadata,
    fileType: "SerumPreset",
    hash: md5(compressed),
    product: "Serum2",
    vendor: "Xfer Records",
    version: 5,
  };
  const metadataBytes = textToBytes(JSON.stringify(nextMetadata));
  const output = new Uint8Array(HEADER_SIZE + metadataBytes.byteLength + PAYLOAD_HEADER_SIZE + compressed.byteLength);
  output.set(textToBytes(MAGIC), 0);
  output[8] = 0;
  writeUint32(output, 9, metadataBytes.byteLength);
  output.set(metadataBytes, HEADER_SIZE);
  const payloadHeader = HEADER_SIZE + metadataBytes.byteLength;
  writeUint32(output, payloadHeader, encoded.byteLength);
  writeUint32(output, payloadHeader + 4, ZSTD_CODEC);
  output.set(compressed, payloadHeader + PAYLOAD_HEADER_SIZE);
  return output;
}

export function buildGeneratedSerum2Document(seedDocument, preset) {
  const name = preset.name || "Preset Mutator Variant";
  return {
    metadata: {
      ...seedDocument.metadata,
      presetAuthor: "Preset Mutator Free",
      presetDescription: preset.summary || "Generated locally with Preset Mutator Free.",
      presetName: name,
      tags: ["Preset Mutator Free", "Serum 2", preset.family || "Generated"],
    },
    data: applyGeneratedPresetToSerum2(seedDocument.data, preset),
  };
}

export function summarizeSerum2Preset(document) {
  const { data, metadata } = document;
  const activeModulations = Object.keys(data).filter((key) => /^ModSlot\d+$/.test(key) && data[key]?.plainParams !== "default").length;
  const wavetablePaths = [0, 1, 2]
    .map((index) => data[`Oscillator${index}`]?.[`WTOsc${index}`]?.relativePathToWT)
    .filter(Boolean);
  const noisePath = data.Oscillator3?.NoiseOsc3?.relativePathToNoiseSample;
  const scalarParameters = SERUM_PARAMETERS.filter((parameter) => Number.isFinite(Number(getPath(data, parameter.path))));

  return {
    name: metadata.presetName || "Untitled Serum 2 Preset",
    author: metadata.presetAuthor || "Unknown author",
    sampleName: noisePath ? noisePath.split(/[\\/]/).at(-1) : "None",
    wavetableCount: new Set(wavetablePaths).size,
    modulationCount: activeModulations,
    scalarKeys: scalarParameters.map((parameter) => parameter.label),
    macroCount: Array.from({ length: 8 }, (_, index) => data[`Macro${index}`]).filter(Boolean).length,
  };
}

function zoneBias(strategy, role, zone) {
  const strategyBias = {
    tone: strategy.tone,
    motion: strategy.motion,
    attack: -strategy.attack,
    space: strategy.space,
    dirt: strategy.dirt,
  }[zone] || 0;
  const roleBias = {
    tone: role.toneBias,
    motion: role.motionBias,
    space: role.spaceBias,
    dirt: role.dirtBias,
  }[zone] || 0;
  return strategyBias + roleBias;
}

export function generateSerum2PresetVariants({ sourcePreset, strategy, controls = {}, variationSeed = 0 }) {
  const summary = sourcePreset.summary || summarizeSerum2Preset(sourcePreset);
  return FREE_VARIANT_ROLES.map((role, index) => {
    const data = cloneData(sourcePreset.data);
    const rng = createRng(hashString(`serum2:${sourcePreset.fileName}:${role.key}:${JSON.stringify(controls)}:${variationSeed}`));
    const changedParameters = [];
    const intensity = (0.08 + strategy.amount * 0.16) * role.multiplier;

    for (const parameter of SERUM_PARAMETERS) {
      const current = Number(getPath(data, parameter.path));
      if (!Number.isFinite(current)) {
        continue;
      }
      const span = parameter.high - parameter.low;
      const directed = zoneBias(strategy, role, parameter.zone) * span * 0.1 * role.multiplier;
      const random = (rng() * 2 - 1) * span * intensity;
      const next = clamp(current + directed + random, parameter.low, parameter.high);
      if (Math.abs(next - current) > span * 0.002) {
        setPath(data, parameter.path, next);
        changedParameters.push(parameter.label);
      }
    }

    const baseName = summary.name.replace(/\s+\/\s+(Closest|Darker|More Motion)$/i, "").trim();
    const name = `${baseName} / ${role.nameSuffix}`;
    const description = `${role.label} Serum 2 variant generated locally from ${summary.name}.`;
    return {
      role,
      groupKey: "variants",
      groupLabel: "Variants",
      groupDescription: "Three starter mutations generated from the loaded Serum 2 preset.",
      name,
      description,
      changedParameters,
      data,
      metadata: { ...sourcePreset.metadata, presetName: name, presetAuthor: "Preset Mutator Free", presetDescription: description },
      downloadName: `${sanitizeFileName(name)}.SerumPreset`,
      format: "serum2",
    };
  });
}

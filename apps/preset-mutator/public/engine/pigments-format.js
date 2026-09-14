import { clamp, createRng, hashString, slugifyFilename } from "./common.js";

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();
const PIGMENTS_PATH_PREFIX = "Pigments/User/Preset Mutator Free/";

const CRC_TABLE = Array.from({ length: 256 }, (_, index) => {
  let value = index;
  for (let bit = 0; bit < 8; bit += 1) {
    value = (value & 1) ? (0xedb88320 ^ (value >>> 1)) : (value >>> 1);
  }
  return value >>> 0;
});

const SAFE_MUTATION_PARAMETERS = {
  Engine1_HarmonicOsc_Tilt: { low: 0.04, high: 0.96, zone: "tone" },
  Engine1_HarmonicOsc_OddEven: { low: 0.08, high: 0.92, zone: "tone" },
  Engine1_HarmonicOsc_FormB: { low: 0.05, high: 0.95, zone: "tone" },
  Engine1_HarmonicOsc_FormDepth: { low: 0, high: 0.72, zone: "motion" },
  Engine1_HarmonicOsc_FM: { low: 0, high: 0.55, zone: "dirt" },
  Engine1_HarmonicOsc_ClusterDW: { low: 0, high: 0.62, zone: "dirt" },
  Engine1_HarmonicOsc_SelStereo: { low: 0.08, high: 0.92, zone: "space" },
  Engine2_HarmonicOsc_Tilt: { low: 0.04, high: 0.96, zone: "tone" },
  Engine2_HarmonicOsc_OddEven: { low: 0.08, high: 0.92, zone: "tone" },
  Engine2_HarmonicOsc_FormB: { low: 0.05, high: 0.95, zone: "tone" },
  Engine2_HarmonicOsc_FormDepth: { low: 0, high: 0.72, zone: "motion" },
  Engine2_HarmonicOsc_FM: { low: 0, high: 0.55, zone: "dirt" },
  Engine2_HarmonicOsc_SelStereo: { low: 0.08, high: 0.92, zone: "space" },
  Filter1_Cutoff: { low: 0.04, high: 0.94, zone: "tone" },
  Filter1_Resonance: { low: 0.02, high: 0.68, zone: "tone" },
  Filter1_MultiModeBiquad_Waveshaper_Drive: { low: 0, high: 0.68, zone: "dirt" },
  Env1_Attack: { low: 0, high: 0.82, zone: "attack" },
  Env1_Decay: { low: 0.03, high: 0.92, zone: "motion" },
  Env1_Sustain: { low: 0.08, high: 1, zone: "tone" },
  Env1_Release: { low: 0.03, high: 0.94, zone: "motion" },
  LFO1_RateUnSynced: { low: 0.08, high: 0.92, zone: "motion" },
  LFO1_Smooth: { low: 0, high: 0.72, zone: "motion" },
  FX1_Chorus_Depth: { low: 0, high: 0.78, zone: "space" },
  FX1_Chorus_Feedback: { low: 0, high: 0.72, zone: "motion" },
  FX1_Delay_Feedback: { low: 0.04, high: 0.74, zone: "motion" },
  FX1_Delay_StereoWidth: { low: 0.05, high: 0.95, zone: "space" },
  FX2_Dattorro_Decay: { low: 0.08, high: 0.9, zone: "space" },
  FX2_Dattorro_E_Size: { low: 0.12, high: 0.9, zone: "space" },
};

const MUTATION_ROLES = [
  { key: "closest", label: "Closest", suffix: "Closest", multiplier: 0.7 },
  { key: "darker", label: "Darker", suffix: "Darker", multiplier: 1, toneBias: -0.72, motionBias: -0.08 },
  { key: "more-motion", label: "More Motion", suffix: "More Motion", multiplier: 1.16, motionBias: 0.82, spaceBias: 0.16 },
];

function toBytes(input) {
  if (input instanceof Uint8Array) {
    return input;
  }
  if (input instanceof ArrayBuffer) {
    return new Uint8Array(input);
  }
  if (ArrayBuffer.isView(input)) {
    return new Uint8Array(input.buffer, input.byteOffset, input.byteLength);
  }
  throw new Error("Expected Pigments preset bytes.");
}

export function bytesToBinaryString(input) {
  const bytes = toBytes(input);
  const parts = [];
  for (let offset = 0; offset < bytes.length; offset += 32768) {
    parts.push(String.fromCharCode(...bytes.subarray(offset, offset + 32768)));
  }
  return parts.join("");
}

export function binaryStringToBytes(value) {
  const bytes = new Uint8Array(value.length);
  for (let index = 0; index < value.length; index += 1) {
    bytes[index] = value.charCodeAt(index) & 0xff;
  }
  return bytes;
}

function crc32(bytes) {
  let value = 0xffffffff;
  for (const byte of bytes) {
    value = CRC_TABLE[(value ^ byte) & 0xff] ^ (value >>> 8);
  }
  return (value ^ 0xffffffff) >>> 0;
}

function findEndOfCentralDirectory(bytes) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const earliest = Math.max(0, bytes.length - 65557);
  for (let offset = bytes.length - 22; offset >= earliest; offset -= 1) {
    if (view.getUint32(offset, true) === 0x06054b50) {
      return offset;
    }
  }
  throw new Error("This file is not a readable Pigments .pgtx bank.");
}

async function inflateRaw(bytes) {
  if (typeof DecompressionStream !== "function") {
    throw new Error("Compressed Pigments banks are not supported by this browser.");
  }
  const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream("deflate-raw"));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

export async function readZipEntries(input, options = {}) {
  const bytes = toBytes(input);
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const eocdOffset = findEndOfCentralDirectory(bytes);
  const entryCount = view.getUint16(eocdOffset + 10, true);
  let offset = view.getUint32(eocdOffset + 16, true);
  const entries = [];

  for (let index = 0; index < entryCount; index += 1) {
    if (view.getUint32(offset, true) !== 0x02014b50) {
      throw new Error("The Pigments bank directory is invalid.");
    }
    const method = view.getUint16(offset + 10, true);
    const compressedSize = view.getUint32(offset + 20, true);
    const uncompressedSize = view.getUint32(offset + 24, true);
    const nameLength = view.getUint16(offset + 28, true);
    const extraLength = view.getUint16(offset + 30, true);
    const commentLength = view.getUint16(offset + 32, true);
    const localOffset = view.getUint32(offset + 42, true);
    const name = textDecoder.decode(bytes.subarray(offset + 46, offset + 46 + nameLength));
    const localNameLength = view.getUint16(localOffset + 26, true);
    const localExtraLength = view.getUint16(localOffset + 28, true);
    offset += 46 + nameLength + extraLength + commentLength;
    if (options.filter && !options.filter(name)) {
      continue;
    }
    const dataOffset = localOffset + 30 + localNameLength + localExtraLength;
    const compressed = bytes.slice(dataOffset, dataOffset + compressedSize);
    const data = method === 0 ? compressed : method === 8 ? await inflateRaw(compressed) : null;
    if (!data || data.length !== uncompressedSize) {
      throw new Error(`Unsupported or damaged Pigments bank entry: ${name}`);
    }
    entries.push({ name, data });
    if (entries.length >= (options.limit ?? Number.POSITIVE_INFINITY)) {
      break;
    }
  }

  return entries;
}

export function buildZip(entries) {
  const prepared = entries.map(({ name, data }) => {
    const nameBytes = textEncoder.encode(name);
    const dataBytes = toBytes(data);
    return { nameBytes, dataBytes, crc: crc32(dataBytes), offset: 0 };
  });
  let localSize = 0;
  for (const entry of prepared) {
    entry.offset = localSize;
    localSize += 30 + entry.nameBytes.length + entry.dataBytes.length;
  }
  const centralSize = prepared.reduce((total, entry) => total + 46 + entry.nameBytes.length, 0);
  const output = new Uint8Array(localSize + centralSize + 22);
  const view = new DataView(output.buffer);
  let localOffset = 0;

  for (const entry of prepared) {
    view.setUint32(localOffset, 0x04034b50, true);
    view.setUint16(localOffset + 4, 20, true);
    view.setUint16(localOffset + 6, 0x0800, true);
    view.setUint16(localOffset + 8, 0, true);
    view.setUint32(localOffset + 14, entry.crc, true);
    view.setUint32(localOffset + 18, entry.dataBytes.length, true);
    view.setUint32(localOffset + 22, entry.dataBytes.length, true);
    view.setUint16(localOffset + 26, entry.nameBytes.length, true);
    output.set(entry.nameBytes, localOffset + 30);
    output.set(entry.dataBytes, localOffset + 30 + entry.nameBytes.length);
    localOffset += 30 + entry.nameBytes.length + entry.dataBytes.length;
  }

  let centralOffset = localSize;
  for (const entry of prepared) {
    view.setUint32(centralOffset, 0x02014b50, true);
    view.setUint16(centralOffset + 4, 20, true);
    view.setUint16(centralOffset + 6, 20, true);
    view.setUint16(centralOffset + 8, 0x0800, true);
    view.setUint16(centralOffset + 10, 0, true);
    view.setUint32(centralOffset + 16, entry.crc, true);
    view.setUint32(centralOffset + 20, entry.dataBytes.length, true);
    view.setUint32(centralOffset + 24, entry.dataBytes.length, true);
    view.setUint16(centralOffset + 28, entry.nameBytes.length, true);
    view.setUint32(centralOffset + 42, entry.offset, true);
    output.set(entry.nameBytes, centralOffset + 46);
    centralOffset += 46 + entry.nameBytes.length;
  }

  view.setUint32(centralOffset, 0x06054b50, true);
  view.setUint16(centralOffset + 8, prepared.length, true);
  view.setUint16(centralOffset + 10, prepared.length, true);
  view.setUint32(centralOffset + 12, centralSize, true);
  view.setUint32(centralOffset + 16, localSize, true);
  return output;
}

function parseHeaderStrings(text) {
  const prefix = /^22 serialization::archive \d+ \d+ \d+ \d+ \d+ /;
  const match = prefix.exec(text);
  if (!match) {
    throw new Error("The Pigments preset archive header is not recognized.");
  }
  let cursor = match[0].length;
  const readString = () => {
    const lengthEnd = text.indexOf(" ", cursor);
    const length = Number(text.slice(cursor, lengthEnd));
    const valueStart = lengthEnd + 1;
    const valueEnd = valueStart + length;
    const field = { start: cursor, end: valueEnd, value: text.slice(valueStart, valueEnd) };
    cursor = valueEnd + 1;
    return field;
  };
  const name = readString();
  const pack = readString();
  cursor = text.indexOf(" ", cursor) + 1;
  const author = readString();
  return { name, pack, author };
}

function replaceLengthField(text, field, value) {
  return `${text.slice(0, field.start)}${value.length} ${value}${text.slice(field.end)}`;
}

function replaceNamedString(text, key, value) {
  const expression = new RegExp(`(${key.length} ${key} )(\\d+) `);
  const match = expression.exec(text);
  if (!match) {
    return text;
  }
  const valueStart = match.index + match[0].length;
  const oldLength = Number(match[2]);
  return `${text.slice(0, match.index)}${match[1]}${value.length} ${value}${text.slice(valueStart + oldLength)}`;
}

export function readPigmentsParameter(text, key) {
  const expression = new RegExp(`(?:^| )${key.length} ${key} (-?\\d+(?:\\.\\d+)?(?:e[-+]?\\d+)?)(?= )`, "i");
  const match = expression.exec(text);
  return match ? Number(match[1]) : null;
}

export function setPigmentsParameter(text, key, value) {
  if (!Number.isFinite(value)) {
    return text;
  }
  const expression = new RegExp(`((?:^| )${key.length} ${key} )(-?\\d+(?:\\.\\d+)?(?:e[-+]?\\d+)?)(?= )`, "i");
  return text.replace(expression, (_, prefix) => `${prefix}${Number(value).toFixed(8).replace(/0+$/, "").replace(/\\.$/, "")}`);
}

export function renamePigmentsPreset(text, name, pack = "Preset Mutator Free") {
  const cleanName = slugifyFilename(name, "Preset Mutator Variant").slice(0, 64);
  const cleanPack = pack.slice(0, 64);
  const header = parseHeaderStrings(text);
  let output = replaceLengthField(text, header.pack, cleanPack);
  output = replaceLengthField(output, parseHeaderStrings(output).name, cleanName);
  output = replaceNamedString(output, "OriginalPackName", cleanPack);
  output = replaceNamedString(output, "OriginalPresetName", cleanName);
  return output;
}

export function summarizePigmentsPreset(text) {
  const header = parseHeaderStrings(text);
  const parameterCount = Object.keys(SAFE_MUTATION_PARAMETERS)
    .filter((key) => readPigmentsParameter(text, key) !== null)
    .length;
  return {
    name: header.name.value || "Untitled Pigments Preset",
    author: header.author.value || "Unknown author",
    sampleName: "Embedded Pigments resources",
    wavetableCount: 0,
    modulationCount: parameterCount,
    scalarKeys: Object.keys(SAFE_MUTATION_PARAMETERS).filter((key) => readPigmentsParameter(text, key) !== null),
    macroCount: 4,
  };
}

export async function parsePigmentsBank(input, fileName = "Pigments preset.pgtx") {
  const entries = await readZipEntries(input, {
    filter: (name) => name.startsWith("Pigments/") && !name.endsWith("/"),
    limit: 1,
  });
  const entry = entries.find(({ data }) => textDecoder.decode(data.subarray(0, 32)).startsWith("22 serialization::archive"));
  if (!entry) {
    throw new Error("No Pigments preset was found in this .pgtx bank.");
  }
  const presetText = bytesToBinaryString(entry.data);
  return {
    format: "pigments",
    fileName,
    entryName: entry.name,
    presetText,
    summary: summarizePigmentsPreset(presetText),
  };
}

export function buildPigmentsBank(presetText, name) {
  const cleanName = slugifyFilename(name, "Preset Mutator Variant").slice(0, 64);
  return buildZip([{ name: `${PIGMENTS_PATH_PREFIX}${cleanName}`, data: binaryStringToBytes(presetText) }]);
}

export function applyGeneratedPresetToPigments(seed, preset) {
  const seedText = typeof seed === "string" ? seed : bytesToBinaryString(seed);
  const source = preset.parameterMap || {};
  const mappings = {
    Engine1_HarmonicOsc_Volume: clamp(source.osc_1_level ?? 0.72),
    Engine2_HarmonicOsc_Volume: clamp(source.osc_2_level ?? 0.42),
    Engine1_HarmonicOsc_Tilt: clamp((source.filter_1_cutoff ?? 64) / 127),
    Engine2_HarmonicOsc_Tilt: clamp(((source.filter_1_cutoff ?? 64) / 127) * 0.88 + 0.06),
    Engine1_HarmonicOsc_FormDepth: clamp(source.phaser_dry_wet ?? source.chorus_mod_depth ?? 0.18, 0, 0.72),
    Engine1_HarmonicOsc_FM: clamp((source.distortion_mix ?? 0.08) * 0.48, 0, 0.55),
    Engine1_HarmonicOsc_ClusterDW: clamp((source.noise_level ?? 0.05) * 0.72, 0, 0.62),
    Engine2_HarmonicOsc_FormDepth: clamp(source.flanger_dry_wet ?? source.chorus_mod_depth ?? 0.14, 0, 0.72),
    Engine2_HarmonicOsc_FM: clamp((source.distortion_mix ?? 0.08) * 0.36, 0, 0.55),
    Engine1_HarmonicOsc_SelStereo: clamp(source.osc_1_stereo_spread ?? 0.5, 0.08, 0.92),
    Engine2_HarmonicOsc_SelStereo: clamp(source.osc_2_stereo_spread ?? 0.46, 0.08, 0.92),
    Filter1_Cutoff: clamp((source.filter_1_cutoff ?? 64) / 127, 0.04, 0.94),
    Filter1_Resonance: clamp(source.filter_1_resonance ?? 0.2, 0.02, 0.68),
    Filter1_MultiModeBiquad_Waveshaper_Drive: clamp((source.distortion_drive ?? 0.2) / 6, 0, 0.68),
    Env1_Attack: clamp(source.env_1_attack ?? 0.2, 0, 0.82),
    Env1_Decay: clamp(source.env_1_decay ?? 0.5, 0.03, 0.92),
    Env1_Sustain: clamp(source.env_1_sustain ?? 0.65, 0.08, 1),
    Env1_Release: clamp(source.env_1_release ?? 0.55, 0.03, 0.94),
    LFO1_RateUnSynced: clamp(0.12 + (source.chorus_feedback ?? source.delay_feedback ?? 0.3) * 0.76, 0.08, 0.92),
    LFO1_Smooth: clamp((source.chorus_mod_depth ?? 0.2) * 0.64, 0, 0.72),
    FX1_Chorus_Depth: clamp(source.chorus_mod_depth ?? source.chorus_dry_wet ?? 0.2, 0, 0.78),
    FX1_Chorus_Feedback: clamp(source.chorus_feedback ?? 0.12, 0, 0.72),
    FX1_Delay_Feedback: clamp(source.delay_feedback ?? 0.22, 0.04, 0.74),
    FX1_Delay_StereoWidth: clamp(source.osc_1_stereo_spread ?? 0.5, 0.05, 0.95),
    FX2_Dattorro_Decay: clamp(source.reverb_decay_time ?? 0.52, 0.08, 0.9),
    FX2_Dattorro_E_Size: clamp(source.reverb_size ?? 0.52, 0.12, 0.9),
    MasterVolume: 0.42,
  };
  let output = renamePigmentsPreset(seedText, preset.name);
  const category = {
    pad: { type: "Pad", subtype: "Atmosphere", characteristics: "Characteristics,Long|Wide;Genres,Ambient|Cinematic;Styles,Evolving|Deep;" },
    pluck: { type: "Keys", subtype: "Plucked", characteristics: "Characteristics,Short;Genres,Ambient|Cinematic;Styles,Melodic|Modern;" },
    bass: { type: "Bass", subtype: "Synth Bass", characteristics: "Characteristics,Low;Genres,Electronic|Cinematic;Styles,Deep|Modern;" },
    texture: { type: "SFX", subtype: "Texture", characteristics: "Characteristics,Complex|Long;Genres,Cinematic|Game Audio;Styles,Evolving|Experimental;" },
  }[preset.familyKey] || null;
  if (category) {
    output = replaceNamedString(output, "Type", category.type);
    output = replaceNamedString(output, "Subtype", category.subtype);
    output = replaceNamedString(output, "Characteristics", category.characteristics);
  }
  for (const [key, value] of Object.entries(mappings)) {
    output = setPigmentsParameter(output, key, value);
  }
  return output;
}

function strategyValue(strategy, zone) {
  if (zone === "tone") return Number(strategy.tone ?? 0);
  if (zone === "motion") return Number(strategy.motion ?? 0);
  if (zone === "attack") return -Number(strategy.attack ?? 0);
  if (zone === "space") return Number(strategy.space ?? 0);
  if (zone === "dirt") return Number(strategy.dirt ?? 0);
  return 0;
}

export function generatePigmentsPresetVariants({ sourcePreset, strategy, variationSeed = 0 }) {
  const sourceName = sourcePreset.summary?.name || "Pigments Preset";
  return MUTATION_ROLES.map((role, index) => {
    const rng = createRng(hashString(`pigments:${sourcePreset.fileName}:${role.key}:${JSON.stringify(strategy)}:${variationSeed}`));
    const amount = clamp(strategy.amount ?? 0.45) * role.multiplier;
    let presetText = sourcePreset.presetText;
    const changedParameters = [];
    for (const [key, config] of Object.entries(SAFE_MUTATION_PARAMETERS)) {
      const current = readPigmentsParameter(presetText, key);
      if (current === null) continue;
      const span = config.high - config.low;
      const roleBias = config.zone === "tone"
        ? role.toneBias ?? 0
        : config.zone === "motion"
          ? role.motionBias ?? 0
          : config.zone === "space"
            ? role.spaceBias ?? 0
            : 0;
      const randomOffset = (rng() * 2 - 1) * span * amount * 0.12;
      const directedOffset = span * strategyValue(strategy, config.zone) * amount * 0.1;
      const biasedOffset = span * roleBias * amount * 0.08;
      presetText = setPigmentsParameter(presetText, key, clamp(current + randomOffset + directedOffset + biasedOffset, config.low, config.high));
      changedParameters.push(key);
    }
    const name = `${sourceName} ${role.suffix}`.slice(0, 64);
    presetText = renamePigmentsPreset(presetText, name);
    return {
      format: "pigments",
      name,
      role: { key: role.key, label: role.label },
      roleLabel: role.label,
      groupKey: "free",
      groupLabel: "Free Variants",
      groupDescription: "Three bounded Pigments variations generated locally from the source preset.",
      description: `${role.label} Pigments variation with ${changedParameters.length} bounded parameter changes.`,
      presetText,
      changedParameters,
      changedCount: changedParameters.length,
    };
  });
}

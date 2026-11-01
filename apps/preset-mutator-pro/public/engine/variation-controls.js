import { clamp, cloneJson } from "./common.js";

export const COMPONENTS = ["oscillators", "envelopes", "filters", "effects"];
export const VARIATION_DIRECTIONS = {
  "stay-close": { label: "Stay close", scale: 0.35 },
  explore: { label: "Explore", scale: 1 },
  reimagine: { label: "Reimagine", scale: 1.6 },
};

export function normalizeVariationOptions(options = {}) {
  options ||= {};
  return {
    direction: Object.hasOwn(VARIATION_DIRECTIONS, options.direction) ? options.direction : "explore",
    locks: Object.fromEntries(COMPONENTS.map((key) => [key, options.locks?.[key] === true])),
  };
}

export function vitalComponent(key) {
  if (/^(osc_\d+_|noise_|sample$|wavetables$)/.test(key)) return "oscillators";
  if (/^env_\d+_/.test(key)) return "envelopes";
  if (/^filter_[12]_/.test(key)) return "filters";
  if (/^(chorus_|delay_|reverb_|distortion_|compressor_|flanger_|phaser_|eq_|filter_fx_|effect_)/.test(key)) return "effects";
  return null;
}

export function serumComponent(key) {
  if (/^Oscillator\d+(?:$|\.)/.test(key)) return "oscillators";
  if (/^Env\d+(?:$|\.)/.test(key)) return "envelopes";
  if (/^VoiceFilter\d+(?:$|\.)/.test(key)) return "filters";
  if (/^FXRack\d+(?:$|\.)/.test(key)) return "effects";
  return null;
}

export function pigmentsComponent(key) {
  if (/^(Engine\d+_|Noise_)/.test(key)) return "oscillators";
  if (/^Env\d+_/.test(key)) return "envelopes";
  if (/^Filter\d+_/.test(key)) return "filters";
  if (/^FX\d+_/.test(key)) return "effects";
  return null;
}

export function isComponentLocked(key, options, classify = vitalComponent) {
  return options?.locks?.[classify(key)] === true;
}

export function directionScale(options) {
  return VARIATION_DIRECTIONS[normalizeVariationOptions(options).direction].scale;
}

export function mutationParameterAllowed(key, zone, options, classify = vitalComponent) {
  if (COMPONENTS.every((component) => options.locks?.[component])) return false;
  if (isComponentLocked(key, options, classify)) return false;
  // Close variations retain oscillator character and envelope timing.
  if (options.direction === "stay-close") {
    if (classify(key) === "oscillators" && !/level|Volume|DetuneWid|SelStereo/.test(key)) return false;
    if (classify(key) === "envelopes" && !/sustain/i.test(key)) return false;
  }
  return true;
}

export function reimagineBias(index, zone, options) {
  if (options.direction !== "reimagine") return 0;
  const biases = { tone: [-0.6, 0.6, -0.25, 0.25], attack: [0.65, -0.65, -0.3, 0.3], motion: [-0.5, 0.5, 0.7, -0.7], dirt: [-0.6, -0.2, 0.7, 0.1], space: [-0.7, 0.7, 0.3, -0.3] };
  return biases[zone]?.[index % 4] || 0;
}

export function shapeForDirection(base, shaped, index, options) {
  const scale = directionScale(options);
  const output = { ...shaped };
  for (const key of ["brightness", "body", "attack", "sustain", "movement", "noise", "width", "wetness", "wash", "drive"]) {
    if (Number.isFinite(base[key]) && Number.isFinite(shaped[key])) {
      output[key] = clamp(base[key] + (shaped[key] - base[key]) * scale);
    }
  }
  if (options.direction === "stay-close") output.topology = "foundation";
  if (options.direction === "reimagine") {
    output.topology = ["focused", "layered", "textural", "foundation"][index % 4];
    output.attack = clamp(output.attack + [0.18, -0.18, -0.08, 0.12][index % 4]);
    output.sustain = clamp(output.sustain + [-0.16, 0.12, 0.16, -0.1][index % 4]);
  }
  return output;
}

export function finishGeneratedVariant(candidate, reference, rawOptions, index) {
  const options = normalizeVariationOptions(rawOptions);
  const preset = { ...candidate, parameterMap: { ...candidate.parameterMap }, variationDirection: options.direction };
  if (options.direction === "reimagine") {
    const lane = index % 4;
    // Alternate layer emphasis, rather than only increasing random offsets.
    preset.parameterMap.osc_1_level *= [1, 0.78, 0.9, 1][lane];
    preset.parameterMap.osc_2_level *= [0.45, 1, 0.65, 0.8][lane];
    preset.parameterMap.noise_level *= [0.3, 0.55, 1, 0.4][lane];
  }
  const hasLocks = COMPONENTS.some((key) => options.locks[key]);
  if (hasLocks || options.direction === "stay-close") preset.templateFile = reference.templateFile;
  if (hasLocks) {
    for (const key of new Set([...Object.keys(preset.parameterMap), ...Object.keys(reference.parameterMap)])) {
      if (!isComponentLocked(key, options) && !/^(lfo_|macro_control_)/.test(key)) continue;
      if (Object.hasOwn(reference.parameterMap, key)) preset.parameterMap[key] = reference.parameterMap[key];
      else delete preset.parameterMap[key];
    }
    preset.componentLocks = options.locks;
    preset.variationReference = reference;
    const referenceLabels = new Map(reference.parameters);
    preset.parameters = candidate.parameters.map(([label, value]) => {
      const component = /^Env /.test(label) ? "envelopes" : /Filter|Resonance/.test(label) ? "filters"
        : /Oscillator|Unison|Detune|Noise/.test(label) ? "oscillators"
          : /Chorus|Reverb|Delay|Distortion/.test(label) ? "effects" : null;
      return [label, (options.locks[component] || /^LFO /.test(label)) && referenceLabels.has(label) ? referenceLabels.get(label) : value];
    });
    preset.summary = `${candidate.family} / ${VARIATION_DIRECTIONS[options.direction].label} / ${COMPONENTS.filter((key) => options.locks[key]).join(", ")} locked.`;
  }
  return preset;
}

export function restoreLockedVitalComponents(settings, reference, locks) {
  for (const key of new Set([...Object.keys(settings), ...Object.keys(reference)])) {
    // Freeze shared modulation when locks are active so it cannot indirectly
    // change the locked components through existing template routes.
    const modulation = /^(modulations$|modulation_|lfo_|random_|macro_control_)/.test(key);
    if (!locks[vitalComponent(key)] && !modulation) continue;
    if (Object.hasOwn(reference, key)) settings[key] = cloneJson(reference[key]);
    else delete settings[key];
  }
}

export function restoreLockedSerumComponents(data, reference, locks) {
  for (const key of new Set([...Object.keys(data), ...Object.keys(reference)])) {
    const modulation = /^(ModSlot\d+$|LFO\d+$|Macro\d+$|lfoPointModAssignments$)/.test(key);
    if (!locks[serumComponent(key)] && !modulation) continue;
    if (Object.hasOwn(reference, key)) data[key] = structuredClone(reference[key]);
    else delete data[key];
  }
}

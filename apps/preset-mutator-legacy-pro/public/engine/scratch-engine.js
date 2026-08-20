import { clamp, familyLabel, lerp, noteName, titleCase, vary } from "./common.js";

export const SCRATCH_FREE_VARIANT_LIMIT = 3;
export const SCRATCH_PRO_PACK_COUNT = 32;

const MOOD_PROFILE = {
  dark: { brightness: 0.32, body: 0.68, movement: 0.44, noise: 0.34, width: 0.48, sustain: 0.64, wetness: 0.32, drive: 0.18 },
  warm: { brightness: 0.5, body: 0.72, movement: 0.36, noise: 0.18, width: 0.42, sustain: 0.58, wetness: 0.24, drive: 0.08 },
  clean: { brightness: 0.62, body: 0.54, movement: 0.32, noise: 0.08, width: 0.5, sustain: 0.46, wetness: 0.18, drive: 0.02 },
  broken: { brightness: 0.43, body: 0.48, movement: 0.7, noise: 0.62, width: 0.62, sustain: 0.52, wetness: 0.34, drive: 0.32 },
};

const FAMILY_PROFILE = {
  pad: { attack: 0.28, sustain: 0.74, movement: 0.5, width: 0.64, pitchHz: 220 },
  pluck: { attack: 0.82, sustain: 0.24, movement: 0.34, width: 0.38, pitchHz: 440 },
  bass: { attack: 0.72, sustain: 0.42, movement: 0.28, width: 0.22, pitchHz: 82 },
  texture: { attack: 0.2, sustain: 0.82, movement: 0.68, width: 0.7, pitchHz: 146 },
};

const REGISTER_PITCH = {
  low: { pad: 146, pluck: 220, bass: 55, texture: 98 },
  mid: { pad: 220, pluck: 440, bass: 82, texture: 146 },
  high: { pad: 392, pluck: 660, bass: 110, texture: 262 },
};

const PRO_RECIPES = [
  { role: "Closest", brightness: 0, movement: -0.03, width: 0, noise: 0, spread: 0.04 },
  { role: "Darker", brightness: -0.18, body: 0.08, noise: 0.03, spread: 0.05 },
  { role: "Brighter", brightness: 0.18, width: 0.04, wetness: 0.04, spread: 0.05 },
  { role: "More Motion", movement: 0.2, width: 0.08, wetness: 0.06, spread: 0.06 },
  { role: "Steadier", movement: -0.18, width: -0.04, wetness: -0.04, spread: 0.05 },
  { role: "Wider", width: 0.2, sustain: 0.05, wetness: 0.06, spread: 0.05 },
  { role: "Tighter", width: -0.16, sustain: -0.08, wetness: -0.08, spread: 0.05 },
  { role: "Textured", noise: 0.18, movement: 0.1, drive: 0.08, spread: 0.06 },
];

function percentValue(value) {
  return Number(value || 0) / 100;
}

export function buildScratchProfile(input = {}) {
  const family = input.family || "pad";
  const mood = input.mood || "dark";
  const register = input.register || "mid";
  const moodBase = MOOD_PROFILE[mood] || MOOD_PROFILE.dark;
  const familyBase = FAMILY_PROFILE[family] || FAMILY_PROFILE.pad;
  const intent = String(input.intent || "").trim();
  const intentLower = intent.toLowerCase();
  const textBrightness = /\b(bright|glass|clear|shimmer|open|air)\b/.test(intentLower)
    ? 0.08
    : /\b(dark|deep|noir|shadow|black)\b/.test(intentLower)
      ? -0.08
      : 0;
  const textMotion = /\b(evolving|moving|pulsing|motion|animated)\b/.test(intentLower)
    ? 0.1
    : /\b(static|still|steady|simple)\b/.test(intentLower)
      ? -0.08
      : 0;
  const textNoise = /\b(broken|industrial|dirty|noise|fractured|grit)\b/.test(intentLower) ? 0.12 : 0;
  const textureBias = percentValue(input.texture);

  return {
    family,
    mood,
    register,
    intent,
    mutationAmount: Number(input.mutationAmount ?? 50) / 100,
    brightness: clamp(moodBase.brightness + percentValue(input.brightness) * 0.26 + textBrightness),
    body: clamp(moodBase.body),
    attack: clamp(familyBase.attack + percentValue(input.attack) * 0.24),
    sustain: clamp((moodBase.sustain + familyBase.sustain) / 2),
    movement: clamp((moodBase.movement + familyBase.movement) / 2 + percentValue(input.motion) * 0.28 + textMotion),
    noise: clamp(moodBase.noise + textNoise + textureBias * 0.18),
    width: clamp((moodBase.width + familyBase.width) / 2 + percentValue(input.width) * 0.28),
    wetness: clamp(moodBase.wetness),
    drive: clamp(moodBase.drive + textureBias * 0.12),
    pitchHz: (REGISTER_PITCH[register] || REGISTER_PITCH.mid)[family] || familyBase.pitchHz,
  };
}

function buildPresetName(profile, shaped, index) {
  const intentName = titleCase(profile.intent);
  if (intentName) {
    return `${intentName} ${index + 1}`;
  }

  const tone = shaped.brightness < 0.42 ? "Shadow" : shaped.brightness > 0.6 ? "Lumen" : "Signal";
  const body = profile.family === "bass" ? "Current" : profile.family === "pluck" ? "Key" : profile.family === "texture" ? "Drift" : "Bloom";
  return `${tone} ${body} ${index + 1}`;
}

export function buildScratchPresetSummary({ family, brightness, movement, width, sustain, attack, register }) {
  const tone = brightness > 0.58 ? "brighter" : brightness < 0.42 ? "darker" : "balanced";
  const motion = movement > 0.5 ? "animated" : movement < 0.3 ? "steady" : "lightly moving";
  const space = width > 0.55 ? "wide" : width < 0.3 ? "tight" : "centered";
  const tail = sustain > 0.58 ? "longer tail" : sustain < 0.32 ? "shorter tail" : "controlled tail";
  const onset = attack > 0.62 ? "harder attack" : attack < 0.36 ? "softer attack" : "balanced attack";

  if (family === "bass") {
    return `${tone.charAt(0).toUpperCase() + tone.slice(1)} bass around ${register} with ${onset} and ${space} weight.`;
  }
  if (family === "pluck") {
    return `${tone.charAt(0).toUpperCase() + tone.slice(1)} pluck around ${register} with ${motion} movement and a ${tail}.`;
  }
  if (family === "texture") {
    return `${tone.charAt(0).toUpperCase() + tone.slice(1)} texture around ${register} with ${motion} detail and ${space} space.`;
  }
  return `${tone.charAt(0).toUpperCase() + tone.slice(1)} pad around ${register} with ${motion} movement and a ${tail}.`;
}

export function mapScratchProfileToVital(profile, index, roleLabel, spread = 1) {
  const brightness = vary(profile.brightness, 0.08 * spread, index, 1);
  const body = vary(profile.body, 0.07 * spread, index, 2);
  const attack = vary(profile.attack, 0.08 * spread, index, 3);
  const sustain = vary(profile.sustain, 0.08 * spread, index, 4);
  const movement = vary(profile.movement, 0.11 * spread, index, 5);
  const noise = vary(profile.noise, 0.08 * spread, index, 6);
  const width = vary(profile.width, 0.09 * spread, index, 7);
  const wetness = vary(profile.wetness, 0.06 * spread, index, 8);
  const drive = vary(profile.drive, 0.05 * spread, index, 9);
  const family = profile.family;
  const voices = family === "bass" ? Math.round(lerp(1, 3, width)) : Math.round(lerp(2, 8, width));
  const detune = family === "bass" ? lerp(0.02, 0.1, width) : lerp(0.05, 0.28, width);
  const filterCutoff = family === "bass" ? lerp(120, 2200, brightness) : lerp(320, 14000, brightness);
  const resonance = lerp(0.08, 0.45, 1 - body);
  const envAttack = family === "pluck" ? lerp(0.001, 0.08, 1 - attack) : lerp(0.01, 2.4, 1 - attack);
  const envDecay = family === "pluck" ? lerp(0.08, 1.4, sustain) : lerp(0.3, 3.4, sustain);
  const envSustain = family === "pluck" ? lerp(0.05, 0.6, sustain) : lerp(0.35, 0.96, sustain);
  const envRelease = family === "pluck" ? lerp(0.08, 1.8, sustain) : lerp(0.6, 6.5, sustain);
  const chorusMix = clamp((family === "bass" ? lerp(0.02, 0.18, width) : lerp(0.1, 0.58, width)) + wetness * 0.14);
  const reverbMix = clamp((family === "pluck" ? lerp(0.08, 0.28, sustain) : lerp(0.12, 0.62, sustain)) + wetness * 0.18);
  const delayMix = clamp(0.02 + wetness * 0.12 + movement * 0.05);
  const distortion = clamp(lerp(0, 0.56, noise * 0.65 + brightness * 0.35) + drive * 0.18);
  const noiseLevel = lerp(0, 0.34, noise);
  const cutoffNormalized = clamp((filterCutoff - 120) / (14000 - 120));
  const presetName = buildPresetName(profile, { brightness, movement, noise, width }, index);

  return {
    name: presetName,
    roleLabel,
    family: familyLabel(family),
    familyKey: family,
    summary: buildScratchPresetSummary({ family, brightness, movement, width, sustain, attack, register: noteName(profile.pitchHz) }),
    parameterMap: {
      osc_1_level: family === "bass" ? lerp(0.78, 0.98, body) : lerp(0.48, 0.86, body),
      osc_2_level: family === "bass" ? lerp(0.18, 0.42, brightness) : lerp(0.24, 0.72, brightness),
      osc_1_unison_voices: voices,
      osc_2_unison_voices: Math.max(1, voices - (family === "bass" ? 1 : 0)),
      osc_1_unison_detune: detune,
      osc_2_unison_detune: clamp(detune * 1.14, 0.02, 0.35),
      osc_1_stereo_spread: width,
      osc_2_stereo_spread: clamp(width * 0.92, 0, 1),
      filter_1_cutoff: lerp(18, 92, cutoffNormalized),
      filter_1_resonance: resonance,
      filter_1_drive: lerp(0.2, 3.2, body * 0.5 + noise * 0.5),
      filter_1_keytrack: family === "bass" ? 0.75 : lerp(0.12, 0.52, brightness),
      filter_1_mix: 1,
      env_1_attack: clamp(envAttack / 2.5, 0.001, 1),
      env_1_decay: clamp(envDecay / 3.4, 0.02, 1),
      env_1_sustain: envSustain,
      env_1_release: clamp(envRelease / 6.5, 0.03, 1),
      chorus_dry_wet: chorusMix,
      chorus_mod_depth: clamp(0.12 + width * 0.6, 0, 1),
      chorus_feedback: clamp(0.08 + movement * 0.4, 0, 0.95),
      reverb_dry_wet: reverbMix,
      reverb_size: clamp(0.3 + sustain * 0.6, 0, 1),
      reverb_decay_time: clamp(0.22 + sustain * 0.72, 0, 1),
      delay_dry_wet: delayMix,
      delay_feedback: clamp(0.16 + movement * 0.28, 0, 0.95),
      delay_filter_cutoff: clamp(36 + brightness * 44 + drive * 6, 0, 127),
      distortion_mix: distortion,
      distortion_drive: lerp(0.1, 4, clamp(distortion + drive * 0.18)),
      filter_fx_cutoff: lerp(26, 86, brightness) - drive * 8,
      filter_fx_resonance: clamp(0.08 + noise * 0.26 + drive * 0.12, 0, 1),
      sample_on: 0,
      noise_on: noiseLevel > 0.03 ? 1 : 0,
      noise_level: noiseLevel,
    },
    parameters: [
      ["Filter Cutoff", filterCutoff >= 1000 ? `${(filterCutoff / 1000).toFixed(2)} kHz` : `${Math.round(filterCutoff)} Hz`],
      ["Env Attack", `${envAttack.toFixed(2)} s`],
      ["Env Release", `${envRelease.toFixed(2)} s`],
      ["Reverb Mix", `${Math.round(reverbMix * 100)}%`],
    ],
  };
}

export function shapeScratchProfile(base, recipe, index) {
  const mutationScale = 0.55 + (base.mutationAmount ?? 0.5) * 1.15;
  const spread = (recipe.spread ?? 0.06) * mutationScale;

  return {
    ...base,
    brightness: vary(clamp(base.brightness + (recipe.brightness ?? 0)), spread, index, 11),
    body: vary(clamp(base.body + (recipe.body ?? 0)), spread, index, 12),
    attack: vary(clamp(base.attack + (recipe.attack ?? 0)), spread, index, 13),
    sustain: vary(clamp(base.sustain + (recipe.sustain ?? 0)), spread, index, 14),
    movement: vary(clamp(base.movement + (recipe.movement ?? 0)), spread, index, 15),
    noise: vary(clamp(base.noise + (recipe.noise ?? 0)), spread, index, 16),
    width: vary(clamp(base.width + (recipe.width ?? 0)), spread, index, 17),
    wetness: vary(clamp(base.wetness + (recipe.wetness ?? 0)), spread, index, 18),
    drive: vary(clamp(base.drive + (recipe.drive ?? 0)), spread, index, 19),
  };
}

export function buildScratchFreePack(profile) {
  return [
    { role: "Closest", spread: 0.04 },
    { role: "Darker", brightness: -0.16, body: 0.06, spread: 0.05 },
    { role: "More Motion", movement: 0.18, width: 0.06, wetness: 0.04, spread: 0.05 },
  ].map((recipe, index) => mapScratchProfileToVital(shapeScratchProfile(profile, recipe, index), index, recipe.role, 0.9));
}

export function buildScratchProPack(profile) {
  return Array.from({ length: SCRATCH_PRO_PACK_COUNT }, (_, index) => {
    const recipe = PRO_RECIPES[index % PRO_RECIPES.length];
    return mapScratchProfileToVital(shapeScratchProfile(profile, recipe, index), index, recipe.role, 1.15);
  });
}

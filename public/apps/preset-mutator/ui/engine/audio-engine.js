import { clamp, familyLabel, formatHz, lerp, noteName, vary } from "./common.js";

export const AUDIO_FREE_VARIANT_LIMIT = 3;
export const AUDIO_PRO_PACK_COUNT = 32;

function percentValue(value) {
  return Number(value || 0) / 100;
}

export function determineAudioFamily(analysis, requestedMode = "auto") {
  if (requestedMode !== "auto") {
    return requestedMode;
  }

  if (analysis.pitchHz > 0 && analysis.pitchHz < 160 && analysis.centroidHz < 1800) {
    return "bass";
  }
  if (analysis.onsetRatio < 0.18 && analysis.sustainRatio < 0.32) {
    return "pluck";
  }
  if (analysis.sustainRatio > 0.68 && analysis.movement < 0.24) {
    return "pad";
  }
  return "texture";
}

export function buildAudioProfile(analysis, options = {}) {
  const brightnessBias = percentValue(options.brightnessBias);
  const movementBias = percentValue(options.movementBias);
  const attackBias = percentValue(options.attackBias);
  const family = determineAudioFamily(analysis, options.inputMode || "auto");

  return {
    family,
    brightness: clamp(analysis.centroidHz / 6000 + brightnessBias * 0.35),
    body: clamp(1 - analysis.centroidHz / 9000 + (analysis.pitchHz > 0 && analysis.pitchHz < 220 ? 0.12 : 0)),
    attack: clamp(1 - analysis.onsetRatio + attackBias * 0.3),
    sustain: clamp(analysis.sustainRatio),
    movement: clamp(analysis.movement * 1.4 + movementBias * 0.35),
    noise: clamp(analysis.flatness * 1.8 + analysis.zeroCrossRate * 8),
    width: clamp(analysis.stereoWidth * 1.2),
    mutationAmount: Number(options.mutationAmount ?? 50) / 100,
    dirtBias: percentValue(options.dirtBias),
    widthBias: percentValue(options.widthBias),
    pitchHz: analysis.pitchHz,
  };
}

function chooseOscillator(family, brightness, noise) {
  if (family === "bass") {
    return brightness < 0.35 ? "Basic Shapes / Sine-Saw" : "Basic Shapes / Saw";
  }
  if (family === "pluck") {
    return brightness > 0.55 ? "Bright Digital / Glassy" : "Basic Shapes / Triangle-Saw";
  }
  if (family === "texture") {
    return noise > 0.42 ? "Spectral Texture / Noisy WT" : "Complex Warp / Hollow";
  }
  return brightness > 0.6 ? "Smooth Harmonics / Wide WT" : "Basic Shapes / Triangle";
}

function buildAudioVariantName(profile) {
  const adjectivePools = {
    pad: {
      dark: ["Velvet", "Nocturne", "Shadow", "Ash", "Dusk"],
      bright: ["Lumen", "Glass", "Silver", "Halo", "Prism"],
      neutral: ["Soft", "Quiet", "Pale", "Still", "Cold"],
    },
    pluck: {
      dark: ["Ember", "Smoked", "Copper", "Rust", "Cinder"],
      bright: ["Quartz", "Bright", "Crystal", "Neon", "Lucent"],
      neutral: ["Tight", "Clean", "Fine", "Wire", "Sharp"],
    },
    bass: {
      dark: ["Black", "Coal", "Deep", "Iron", "Stone"],
      bright: ["Chrome", "Steel", "Volt", "Signal", "Acid"],
      neutral: ["Low", "Sub", "Core", "Heavy", "Dense"],
    },
    texture: {
      dark: ["Dust", "Ghost", "Ruin", "Static", "Ash"],
      bright: ["Mist", "Signal", "Frost", "Glint", "Solar"],
      neutral: ["Thin", "Granite", "Hollow", "Drift", "Shiver"],
    },
  };

  const nounPools = {
    pad: ["Veil", "Bloom", "Meridian", "Archive", "Drift", "Canopy", "Haze", "Chamber"],
    pluck: ["Click", "Strike", "Tone", "Needle", "Petal", "Spark", "Key", "Pulse"],
    bass: ["Engine", "Vault", "Furnace", "Axis", "Pressure", "Coil", "Current", "Pulse"],
    texture: ["Fabric", "Horizon", "Moss", "Choir", "Canopy", "Bloom", "Field", "Static"],
  };

  const brightnessKey = profile.brightness > 0.58 ? "bright" : profile.brightness < 0.4 ? "dark" : "neutral";
  const adjectiveSource = adjectivePools[profile.family][brightnessKey];
  const nounSource = nounPools[profile.family];
  const moodOffset = profile.movement > 0.45 ? 2 : 0;
  const toneOffset = profile.noise > 0.38 ? 3 : profile.body > 0.62 ? 1 : 0;
  const registerOffset = profile.pitchHz > 0 ? Math.abs(Math.round(profile.pitchHz)) : 0;
  const adjectiveIndex = (profile.index + moodOffset + toneOffset + registerOffset) % adjectiveSource.length;
  const nounIndex = (profile.index * 2 + toneOffset + Math.round(profile.width * 10)) % nounSource.length;

  return `${adjectiveSource[adjectiveIndex]} ${nounSource[nounIndex]}`;
}

export function buildAudioPresetSummary({ family, brightness, movement, width, sustain, attack, register }) {
  const tone = brightness > 0.58 ? "brighter" : brightness < 0.42 ? "darker" : "balanced";
  const motion = movement > 0.5 ? "more animated" : movement < 0.3 ? "steadier" : "lightly moving";
  const space = width > 0.55 ? "with a wider image" : width < 0.3 ? "with a tighter image" : "with a centered image";
  const tail = sustain > 0.58 ? "longer tail" : sustain < 0.32 ? "shorter tail" : "controlled tail";
  const onset = attack > 0.62 ? "harder attack" : attack < 0.36 ? "softer attack" : "balanced attack";

  if (family === "bass") {
    return `${tone.charAt(0).toUpperCase() + tone.slice(1)} bass with ${onset}, ${space}, and a ${tail}.`;
  }
  if (family === "pluck") {
    return `${tone.charAt(0).toUpperCase() + tone.slice(1)} pluck with ${onset}, ${motion}, and a ${tail}.`;
  }
  if (family === "texture") {
    return `${tone.charAt(0).toUpperCase() + tone.slice(1)} texture around ${register}, ${motion}, and ${space}.`;
  }
  return `${tone.charAt(0).toUpperCase() + tone.slice(1)} pad around ${register} with ${onset}, ${motion}, and a ${tail}.`;
}

export function mapAudioProfileToVital(profile, index, options = {}) {
  const amountScale = options.amountScale ?? 1;
  const roleLabel = options.roleLabel ?? null;
  const family = profile.family;
  const brightness = vary(profile.brightness, 0.08 * amountScale, index, 1);
  const body = vary(profile.body, 0.08 * amountScale, index, 2);
  const attack = vary(profile.attack, 0.1 * amountScale, index, 3);
  const sustain = vary(profile.sustain, 0.08 * amountScale, index, 4);
  const movement = vary(profile.movement, 0.12 * amountScale, index, 5);
  const noise = vary(profile.noise, 0.08 * amountScale, index, 6);
  const width = vary(profile.width, 0.1 * amountScale, index, 7);

  const oscMode = chooseOscillator(family, brightness, noise);
  const voices = family === "bass" ? Math.round(lerp(1, 3, width)) : Math.round(lerp(2, 8, width));
  const detune = family === "bass" ? lerp(0.02, 0.1, width) : lerp(0.05, 0.28, width);
  const filterCutoff = family === "bass" ? lerp(120, 2200, brightness) : lerp(320, 14000, brightness);
  const resonance = lerp(0.08, 0.45, 1 - body);
  const envAttack = family === "pluck" ? lerp(0.001, 0.08, 1 - attack) : lerp(0.01, 2.4, 1 - attack);
  const envDecay = family === "pluck" ? lerp(0.08, 1.4, sustain) : lerp(0.3, 3.4, sustain);
  const envSustain = family === "pluck" ? lerp(0.05, 0.6, sustain) : lerp(0.35, 0.96, sustain);
  const envRelease = family === "pluck" ? lerp(0.08, 1.8, sustain) : lerp(0.6, 6.5, sustain);
  const lfoRate = family === "texture" ? lerp(0.05, 1.8, movement) : lerp(0.08, 6.2, movement);
  const lfoDepth = lerp(0.04, 0.68, movement);
  const chorusMix = clamp((family === "bass" ? lerp(0.02, 0.18, width) : lerp(0.1, 0.58, width)) + (profile.wetness ?? 0) * 0.16);
  const reverbMix = clamp((family === "pluck" ? lerp(0.08, 0.28, sustain) : lerp(0.12, 0.62, sustain)) + (profile.wetness ?? 0) * 0.22 + (profile.wash ?? 0) * 0.18);
  const delayMix = clamp(0.02 + Math.max(0, profile.wetness ?? 0) * 0.12 + Math.max(0, profile.wash ?? 0) * 0.08);
  const distortion = clamp(lerp(0, 0.56, noise * 0.65 + brightness * 0.35) + (profile.drive ?? 0) * 0.16);
  const noiseLevel = lerp(0, 0.34, noise);
  const cutoffNormalized = clamp((filterCutoff - 120) / (14000 - 120));
  const register = profile.pitchHz > 0 ? noteName(profile.pitchHz) : "Unknown";
  const name = buildAudioVariantName({
    family,
    index,
    brightness,
    body,
    movement,
    noise,
    width,
    attack,
    sustain,
    pitchHz: profile.pitchHz,
  });

  return {
    name,
    roleLabel,
    family: familyLabel(family),
    familyKey: family,
    summary: buildAudioPresetSummary({ family, brightness, movement, width, sustain, attack, register }),
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
      reverb_size: clamp(0.3 + sustain * 0.6 + (profile.wash ?? 0) * 0.16, 0, 1),
      reverb_decay_time: clamp(0.22 + sustain * 0.72 + (profile.wash ?? 0) * 0.2, 0, 1),
      delay_dry_wet: delayMix,
      delay_feedback: clamp(0.16 + movement * 0.28 + Math.max(0, profile.wash ?? 0) * 0.16, 0, 0.95),
      delay_filter_cutoff: clamp(36 + brightness * 44 + (profile.drive ?? 0) * 6, 0, 127),
      distortion_mix: distortion,
      distortion_drive: lerp(0.1, 4, clamp(distortion + Math.max(0, profile.drive ?? 0) * 0.18)),
      filter_fx_cutoff: lerp(26, 86, brightness) - (profile.drive ?? 0) * 8,
      filter_fx_resonance: clamp(0.08 + noise * 0.26 + Math.max(0, profile.drive ?? 0) * 0.12, 0, 1),
      sample_on: 0,
      noise_on: noiseLevel > 0.03 ? 1 : 0,
      noise_level: noiseLevel,
    },
    parameters: [
      ["Oscillator", oscMode],
      ["Unison Voices", String(voices)],
      ["Detune", `${detune.toFixed(2)}`],
      ["Filter Cutoff", formatHz(filterCutoff)],
      ["Resonance", `${Math.round(resonance * 100)}%`],
      ["Env Attack", `${envAttack.toFixed(2)} s`],
      ["Env Decay", `${envDecay.toFixed(2)} s`],
      ["Env Sustain", `${Math.round(envSustain * 100)}%`],
      ["Env Release", `${envRelease.toFixed(2)} s`],
      ["LFO Rate", `${lfoRate.toFixed(2)} Hz`],
      ["LFO Depth", `${Math.round(lfoDepth * 100)}%`],
      ["Chorus Mix", `${Math.round(chorusMix * 100)}%`],
      ["Reverb Mix", `${Math.round(reverbMix * 100)}%`],
      ["Delay Mix", `${Math.round(delayMix * 100)}%`],
      ["Distortion", `${Math.round(distortion * 100)}%`],
      ["Noise Level", `${Math.round(noiseLevel * 100)}%`],
    ],
  };
}

export function shapeAudioProfile(baseProfile, recipe, index) {
  const mutationScale = 0.55 + (baseProfile.mutationAmount ?? 0.5) * 1.15;
  const spread = (fallback) => fallback * mutationScale;

  return {
    ...baseProfile,
    family: recipe.family || baseProfile.family,
    brightness: vary(clamp(baseProfile.brightness + (recipe.brightness ?? 0)), spread(recipe.spread ?? 0.07), index, 21),
    body: vary(clamp(baseProfile.body + (recipe.body ?? 0)), spread(recipe.spread ?? 0.06), index, 22),
    attack: vary(clamp(baseProfile.attack + (recipe.attack ?? 0)), spread(recipe.spread ?? 0.08), index, 23),
    sustain: vary(clamp(baseProfile.sustain + (recipe.sustain ?? 0)), spread(recipe.spread ?? 0.07), index, 24),
    movement: vary(clamp(baseProfile.movement + (recipe.movement ?? 0)), spread(recipe.spread ?? 0.09), index, 25),
    noise: vary(clamp(baseProfile.noise + (recipe.noise ?? 0) + (baseProfile.dirtBias ?? 0) * 0.18), spread(recipe.spread ?? 0.07), index, 26),
    width: vary(clamp(baseProfile.width + (recipe.width ?? 0) + (baseProfile.widthBias ?? 0) * 0.18), spread(recipe.spread ?? 0.08), index, 27),
    wetness: vary(clamp((baseProfile.wetness ?? 0.18) + (recipe.wetness ?? 0)), spread(recipe.spread ?? 0.05), index, 28),
    wash: vary(clamp((baseProfile.wash ?? 0.12) + (recipe.wash ?? 0)), spread(recipe.spread ?? 0.05), index, 29),
    drive: vary(clamp((baseProfile.drive ?? 0.08) + (recipe.drive ?? 0)), spread(recipe.spread ?? 0.05), index, 30),
  };
}

export function buildAudioFreePack(profile) {
  const recipes = [
    { role: "Closest", brightness: -0.01, movement: -0.02, spread: 0.035, amountScale: 0.82 },
    { role: "Darker", brightness: -0.15, body: 0.06, movement: -0.03, spread: 0.04, amountScale: 0.9 },
    { role: "More Motion", movement: 0.18, width: 0.06, wetness: 0.04, spread: 0.045, amountScale: 0.94 },
  ];

  return recipes.map((recipe, index) => {
    const shaped = shapeAudioProfile(profile, recipe, index);
    return mapAudioProfileToVital(shaped, index, {
      amountScale: recipe.amountScale,
      roleLabel: recipe.role,
    });
  });
}

export function buildAudioProPack(profile) {
  const recipes = [
    { role: "Closest", brightness: -0.02, movement: -0.02, spread: 0.04, amountScale: 0.85 },
    { role: "Closest", brightness: 0.03, width: 0.04, spread: 0.04, amountScale: 0.85 },
    { role: "Darker", brightness: -0.16, body: 0.08, spread: 0.05, amountScale: 1 },
    { role: "Darker", brightness: -0.12, sustain: 0.06, noise: 0.03, drive: 0.03, spread: 0.05, amountScale: 1 },
    { role: "Brighter", brightness: 0.16, body: -0.04, wetness: 0.04, spread: 0.05, amountScale: 1 },
    { role: "Brighter", brightness: 0.12, width: 0.08, movement: 0.04, wetness: 0.06, spread: 0.05, amountScale: 1 },
    { role: "Steadier", movement: -0.18, sustain: 0.05, wash: -0.05, spread: 0.05, amountScale: 0.95 },
    { role: "Steadier", movement: -0.12, width: -0.06, body: 0.05, wetness: -0.04, spread: 0.05, amountScale: 0.95 },
    { role: "More Motion", movement: 0.2, width: 0.08, wetness: 0.03, spread: 0.06, amountScale: 1.05 },
    { role: "More Motion", movement: 0.16, brightness: 0.05, noise: 0.04, drive: 0.04, spread: 0.06, amountScale: 1.05 },
    { role: "Wider", width: 0.18, sustain: 0.04, wetness: 0.04, spread: 0.05, amountScale: 1 },
    { role: "Wider", width: 0.14, movement: 0.06, brightness: 0.04, wash: 0.05, spread: 0.05, amountScale: 1 },
    { role: "Tighter", width: -0.14, body: 0.08, wetness: -0.06, wash: -0.05, spread: 0.05, amountScale: 0.95 },
    { role: "Tighter", width: -0.1, movement: -0.06, attack: 0.05, drive: 0.03, spread: 0.05, amountScale: 0.95 },
    { role: "Textured", noise: 0.18, movement: 0.08, wash: 0.05, spread: 0.06, amountScale: 1.05 },
    { role: "Textured", noise: 0.14, brightness: -0.04, width: 0.04, drive: 0.05, spread: 0.06, amountScale: 1.05 },
  ];

  return Array.from({ length: AUDIO_PRO_PACK_COUNT }, (_, index) => {
    const recipe = recipes[index % recipes.length];
    const shaped = shapeAudioProfile(profile, recipe, index);
    return mapAudioProfileToVital(shaped, index, {
      amountScale: recipe.amountScale ?? 1,
      roleLabel: recipe.role,
    });
  });
}

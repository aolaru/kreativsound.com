import { hashString } from "./common.js";

// Curated from the author-owned Velvet Ruins collection. These templates are
// used internally to provide proven Vital structures, macro mappings, and
// modulation behaviour; generated files keep Preset Mutator branding.
export const VELVET_TEMPLATE_LIBRARY = {
  pad: [
    "KS Burial Bloom.vital",
    "KS Haze Reliquary.vital",
    "KS Ruin Sleep.vital",
    "KS Monolith Haze.vital",
  ],
  pluck: [
    "KS Ash Bell Ritual.vital",
    "KS Sable Dulcimer.vital",
    "KS Hollow Bellframe.vital",
    "KS Ritual Ivory.vital",
  ],
  bass: [
    "KS Crypt Foundation.vital",
    "KS Worn Subharmonic.vital",
    "KS Mourning Engine.vital",
    "KS Black Tonnage.vital",
  ],
  texture: [
    "KS Sepulcher Glass.vital",
    "KS Shard Procession.vital",
    "KS Fracture Bloom.vital",
    "KS Shard Relay.vital",
  ],
};

// These tags describe the audible centre of each author-owned source preset.
// They let generation start from an appropriate structure before the run-level
// parameter variation is applied.
export const VELVET_TEMPLATE_METADATA = {
  "KS Burial Bloom.vital": { brightness: 0.28, body: 0.76, movement: 0.56, noise: 0.34, width: 0.68 },
  "KS Haze Reliquary.vital": { brightness: 0.46, body: 0.58, movement: 0.72, noise: 0.24, width: 0.74 },
  "KS Ruin Sleep.vital": { brightness: 0.34, body: 0.7, movement: 0.3, noise: 0.18, width: 0.54 },
  "KS Monolith Haze.vital": { brightness: 0.18, body: 0.88, movement: 0.42, noise: 0.42, width: 0.44 },
  "KS Ash Bell Ritual.vital": { brightness: 0.58, body: 0.42, movement: 0.48, noise: 0.2, width: 0.48 },
  "KS Sable Dulcimer.vital": { brightness: 0.4, body: 0.62, movement: 0.28, noise: 0.3, width: 0.36 },
  "KS Hollow Bellframe.vital": { brightness: 0.68, body: 0.34, movement: 0.62, noise: 0.16, width: 0.6 },
  "KS Ritual Ivory.vital": { brightness: 0.52, body: 0.52, movement: 0.36, noise: 0.12, width: 0.42 },
  "KS Crypt Foundation.vital": { brightness: 0.22, body: 0.9, movement: 0.26, noise: 0.24, width: 0.2 },
  "KS Worn Subharmonic.vital": { brightness: 0.16, body: 0.84, movement: 0.5, noise: 0.52, width: 0.28 },
  "KS Mourning Engine.vital": { brightness: 0.38, body: 0.72, movement: 0.64, noise: 0.38, width: 0.32 },
  "KS Black Tonnage.vital": { brightness: 0.3, body: 0.86, movement: 0.34, noise: 0.6, width: 0.24 },
  "KS Sepulcher Glass.vital": { brightness: 0.62, body: 0.36, movement: 0.7, noise: 0.46, width: 0.72 },
  "KS Shard Procession.vital": { brightness: 0.5, body: 0.48, movement: 0.84, noise: 0.56, width: 0.66 },
  "KS Fracture Bloom.vital": { brightness: 0.42, body: 0.56, movement: 0.52, noise: 0.72, width: 0.58 },
  "KS Shard Relay.vital": { brightness: 0.7, body: 0.3, movement: 0.78, noise: 0.38, width: 0.76 },
};

// These destination groups are drawn from the active macro and modulation
// routes across the Velvet Ruins corpus. Preset mutation uses them as a bias,
// never as a replacement for the customer's uploaded patch structure.
export const VELVET_PARAMETER_PRIORS = {
  tone: ["osc_1_wave_frame", "osc_2_wave_frame", "osc_3_wave_frame", "filter_1_cutoff", "filter_2_cutoff", "filter_1_resonance", "filter_2_resonance"],
  motion: ["osc_1_wave_frame", "osc_2_wave_frame", "osc_3_wave_frame", "osc_1_frame_spread", "osc_2_frame_spread", "osc_3_frame_spread", "chorus_mod_depth", "delay_feedback", "phaser_mod_frequency"],
  space: ["osc_1_stereo_spread", "osc_2_stereo_spread", "osc_3_stereo_spread", "chorus_dry_wet", "delay_dry_wet", "reverb_dry_wet", "reverb_size", "reverb_decay_time"],
  dirt: ["noise_level", "distortion_mix", "distortion_drive", "filter_1_drive", "filter_2_drive"],
};

export function velvetPriorityScore(key, strategy) {
  return Object.entries(VELVET_PARAMETER_PRIORS).reduce((score, [zone, candidates]) => {
    if (!candidates.includes(key)) {
      return score;
    }
    return score + Math.abs(Number(strategy[zone] || 0)) * 1.25;
  }, 0);
}

export function templateNamesForFamily(family) {
  return VELVET_TEMPLATE_LIBRARY[family] || VELVET_TEMPLATE_LIBRARY.texture;
}

export function chooseVelvetTemplate(family, generationSeed, index = 0, profile = {}) {
  const templates = templateNamesForFamily(family);
  const target = {
    brightness: Number(profile.brightness ?? 0.5),
    body: Number(profile.body ?? 0.5),
    movement: Number(profile.movement ?? 0.5),
    noise: Number(profile.noise ?? 0.3),
    width: Number(profile.width ?? 0.5),
  };

  // Rank by sound intent, then rotate through the ranked choices so every
  // pack remains structurally varied instead of repeating its best match.
  const ranked = templates
    .map((fileName) => {
      const metadata = VELVET_TEMPLATE_METADATA[fileName] || target;
      const distance = Object.keys(target).reduce((total, key) => total + Math.abs(target[key] - metadata[key]), 0);
      const tieBreak = hashString(`velvet:${fileName}:${generationSeed}`) / 0xffffffff;
      return { fileName, score: distance + tieBreak * 0.025 };
    })
    .sort((left, right) => left.score - right.score);

  return ranked[index % ranked.length].fileName;
}

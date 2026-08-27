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

export function chooseVelvetTemplate(family, generationSeed, index = 0) {
  const templates = templateNamesForFamily(family);
  const offset = hashString(`velvet:${family}:${generationSeed}`) % templates.length;
  return templates[(offset + index) % templates.length];
}

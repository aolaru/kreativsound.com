import { clamp, cloneJson, sanitizeFileName } from "./common.js";

export const SEED_BY_FAMILY = {
  pad: "KS Frozen Hollow.vital",
  pluck: "KS Dread Lantern.vital",
  bass: "KS Iron Wake.vital",
  texture: "KS Shadow Archive.vital",
};

export function applyParameterMapToPreset(seedData, preset) {
  const rendered = cloneJson(seedData);
  const settings = rendered.settings || {};

  for (const [key, value] of Object.entries(preset.parameterMap || {})) {
    if (key.startsWith("_")) {
      continue;
    }
    if (typeof value === "boolean") {
      settings[key] = value ? 1 : 0;
      continue;
    }
    if (typeof value === "number" && Number.isFinite(value)) {
      settings[key] = value;
    }
  }

  settings.osc_1_on = 1;
  settings.osc_2_on = 1;
  settings.filter_1_on = 1;
  settings.chorus_on = settings.chorus_dry_wet > 0.01 ? 1 : 0;
  settings.reverb_on = settings.reverb_dry_wet > 0.01 ? 1 : 0;
  settings.distortion_on = settings.distortion_mix > 0.01 ? 1 : 0;
  settings.osc_1_unison_voices = Math.round(clamp(settings.osc_1_unison_voices, 1, 8));
  settings.osc_2_unison_voices = Math.round(clamp(settings.osc_2_unison_voices, 1, 8));
  settings.preset_name = preset.name;

  rendered.settings = settings;
  rendered.author = "Preset Mutator";
  rendered.comments = preset.summary;
  rendered.preset_style = preset.familyKey.charAt(0).toUpperCase() + preset.familyKey.slice(1);
  rendered.macro1 = "Tone";
  rendered.macro2 = "Motion";
  rendered.macro3 = "Space";
  rendered.macro4 = "Drive";

  return rendered;
}

export function buildVitalPresetPayload(seedData, preset) {
  return {
    fileName: `${sanitizeFileName(preset.name)}.vital`,
    data: applyParameterMapToPreset(seedData, preset),
  };
}

export function createVitalPresetBlob(seedData, preset) {
  const payload = buildVitalPresetPayload(seedData, preset);
  return {
    fileName: payload.fileName,
    blob: new Blob([JSON.stringify(payload.data)], { type: "application/json;charset=utf-8" }),
  };
}

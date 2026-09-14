import {
  applyGeneratedPresetToPigments,
  buildPigmentsBank,
  parsePigmentsBank,
} from "./pigments-format.js";
import { slugifyFilename } from "./common.js";

export { parsePigmentsBank };

export function createPigmentsPresetBlob(seedText, preset) {
  const presetText = applyGeneratedPresetToPigments(seedText, preset);
  const bytes = buildPigmentsBank(presetText, preset.name);
  return {
    fileName: `${slugifyFilename(preset.name, "Preset Mutator Pigments")}.pgtx`,
    blob: new Blob([bytes], { type: "application/zip" }),
  };
}

export function createPigmentsVariantBlob(variant) {
  const bytes = buildPigmentsBank(variant.presetText, variant.name);
  return {
    fileName: `${slugifyFilename(variant.name, "Preset Mutator Pigments Variant")}.pgtx`,
    blob: new Blob([bytes], { type: "application/zip" }),
  };
}

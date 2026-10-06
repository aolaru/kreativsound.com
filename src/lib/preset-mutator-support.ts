// Keep the current marketing support matrix shared between both detail pages.
export const presetMutatorFormats = [
  { synth: "Vital", extension: ".vital", free: "Stable", pro: "Stable" },
  { synth: "Serum 2", extension: ".SerumPreset", free: "Beta", pro: "Beta" },
  { synth: "Arturia Pigments", extension: ".pgtx", free: "Beta", pro: "Not included" }
];

export const presetMutatorActivation = {
  steps: [
    "Copy the license key from your Gumroad purchase or library.",
    "Open Preset Mutator Pro, paste the key into the activation field, and activate."
  ],
  verification: "Gumroad license-key verification needs an internet connection. Your key is saved in this browser; earlier signed Pro tokens still work.",
  privacy: "Preset generation stays local. Activation sends your license key to Gumroad for verification, not your source presets or audio."
};

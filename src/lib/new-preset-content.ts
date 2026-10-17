import type { ProductLandingCopy } from "./product-content.ts";

const serumRequirements = [
  "Xfer Serum 2 and a compatible DAW are required and are not included. These presets do not work in Serum 1.",
  "Tested with Serum 2.1.5; earlier versions are unverified. The download contains native .SerumPreset files, not WAV samples or a standalone instrument."
];
const miniRequirements = [
  "Arturia Mini V2, Mini V3, or Mini V4 is required and is not included. Choose the bank for the instrument version you own.",
  "V3 was checked through native instrument rendering. V2 bank parsing was checked, but playback in a licensed V2 installation remains unverified.",
  "V4 browser counts and representative loading were checked in demo; complete audio and level comparisons remain pending. Native menu import of the release archives has not been verified.",
  "The V4 edition recreates the sounds for its newer engine. Tone, modulation, and effects can differ across versions."
];

export const newPresetCopy = {
  "obsidian-serum-2-presets": {
    subtitle: "128 dark cinematic presets for Xfer Serum 2.",
    shortMeta: "128 presets • Serum 2 • Includes all 32 Lite sounds",
    longDescription: [
      "OBSIDIAN brings evolving drones, spacious pads, fractured leads, basses, plucks, and rhythmic sequences to Serum 2. Category-prefixed filenames, musical descriptions, and named macros keep the bank practical to browse and shape.",
      "The full bank includes every OBSIDIAN Lite sound plus 96 more: 128 unique presets in total, not 160. The download includes an installation guide, complete preset list, and commercial-use license."
    ],
    specifications: [
      { label: "Synth", value: "Xfer Serum 2; tested with 2.1.5" },
      { label: "Format", value: "128 native .SerumPreset files in a ZIP" },
      { label: "Contents", value: "32 Lite presets plus 96 additional presets; 128 unique sounds" },
      { label: "Performance", value: "Named macros and musical descriptions" },
      { label: "Extras", value: "Installation guide, complete preset list, and commercial-use license" },
      { label: "License", value: "Royalty-free use in music, client projects, and sync work; no preset redistribution or resale" },
      { label: "Purchase", value: "One-time purchase; no subscription" }
    ],
    requirements: serumRequirements
  },
  "obsidian-lite-serum-2-presets": {
    subtitle: "32 free dark cinematic presets for Xfer Serum 2.",
    shortMeta: "32 presets • Serum 2 • Free subset of OBSIDIAN",
    ctaLine: "Enter 0 on Gumroad to download free. Contributions are optional.",
    longDescription: [
      "Try the OBSIDIAN palette with 32 native Serum 2 presets, including pads, drones, basses, leads, plucks, arps, sequences, and FX. Category-prefixed filenames, musical descriptions, and named macros are included.",
      "Every Lite sound is also in the full 128-preset collection. Lite is a subset, not an additional exclusive bank. The download includes an installation guide, preset list, and commercial-use license."
    ],
    specifications: [
      { label: "Synth", value: "Xfer Serum 2; tested with 2.1.5" },
      { label: "Format", value: "32 native .SerumPreset files in a ZIP" },
      { label: "Edition", value: "All 32 Lite presets are included in OBSIDIAN Full" },
      { label: "Extras", value: "Named macros, descriptions, installation guide, preset list, and license" },
      { label: "License", value: "Royalty-free music, client-project, and sync use; no preset redistribution or resale" },
      { label: "Access", value: "Free; optional contributions on Gumroad" }
    ],
    requirements: serumRequirements
  },
  "analog-drift-mini-v-presets": {
    subtitle: "256 experimental vintage presets, with banks for Arturia Mini V2, V3, and V4.",
    shortMeta: "256 presets per edition • Mini V2 / V3 / V4 • Includes the 32 Lite sounds",
    longDescription: [
      "ANALOG DRIFT combines 89 canonical designs with 167 organic or wild variants for deep basses, animated sequences, warm pads, and experimental textures. Leads, keys, percussion, and brass sounds expand the palette.",
      "Each instrument edition contains 256 presets with matching names. These are version-specific editions of the same collection, not 768 different sounds. The V4 recreations can differ in tone, modulation, and effects.",
      "The 32-preset Lite selection is included in Full. Installation notes, a complete preset list, and the product license accompany the banks."
    ],
    specifications: [
      { label: "Synths", value: "Arturia Mini V2, Mini V3, and Mini V4" },
      { label: "Count", value: "256 presets in each version-specific edition" },
      { label: "Designs", value: "89 canonical designs plus 167 organic or wild variants" },
      { label: "Banks", value: "V2 .minibank, V3 .minix, and V4 .min4x" },
      { label: "Extras", value: "Individual V4 User presets for local Mac installation, installation notes, preset list, and license" },
      { label: "Lite selection", value: "All 32 Lite sounds are included in Full" }
    ],
    requirements: miniRequirements
  },
  "analog-drift-lite-mini-v-presets": {
    subtitle: "32 free vintage presets, with banks for Arturia Mini V2, V3, and V4.",
    shortMeta: "32 presets per edition • 8 basses / 8 sequences / 8 pads / 8 effects",
    ctaLine: "Download free from Gumroad; contributions are optional.",
    longDescription: [
      "ANALOG DRIFT Lite is a balanced selection of eight basses, eight sequences, eight pads, and eight effects from the full collection, with separate banks for Mini V2, V3, and V4.",
      "Each Lite sound uses the same settings as its Full counterpart within that edition. All 32 sounds are included in Full. Matching names do not imply identical audio between instrument versions."
    ],
    specifications: [
      { label: "Synths", value: "Arturia Mini V2, Mini V3, and Mini V4" },
      { label: "Count", value: "32 selected presets in each version-specific edition" },
      { label: "Selection", value: "8 basses, 8 sequences, 8 pads, and 8 effects" },
      { label: "Banks", value: "V2 .minibank, V3 .minix, and V4 .min4x" },
      { label: "Extras", value: "Individual V4 User presets, installation notes, preset list, and license" },
      { label: "Access", value: "Free; optional support at checkout" }
    ],
    requirements: miniRequirements
  }
} satisfies Record<string, ProductLandingCopy>;

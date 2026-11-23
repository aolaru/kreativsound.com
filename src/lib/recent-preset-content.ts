import type { ProductLandingCopy } from "./product-content.ts";

const brutusRequirements = [
  "GForce impOSCar 2 or impOSCar 3 and a compatible host are required and are not included.",
  "The versions contain related sounds and may sound different. impOSCar 2 audio, approximate backports, and installation compatibility require further review. Windows installation has not been verified."
];
const sylenthRequirements = [
  "LennarDigital Sylenth1 and a compatible host are required and are not included.",
  "The download contains a Sylenth1 FXB bank. Save your current bank before loading it."
];

export const recentPresetCopy = {
  "brutus-imposcar-presets": {
    subtitle: "Atmospheric and experimental presets for GForce impOSCar 2 and 3.",
    shortMeta: "134 impOSCar 3 XML patches • 132 impOSCar 2 FXP files • Compatibility notes below",
    longDescription: [
      "BRUTUS brings together Vicious, Ferocious, and earlier Kreativ Sound impOSCar sounds: basses, leads, arpeggios, pads, drones, and effects.",
      "The collection contains 134 individual impOSCar 3 XML patches and 132 individual impOSCar 2 FXP files, including four approximate backport candidates. Counts are per instrument: the related versions may sound different and are not 266 separate sounds. An installation guide and artwork are included."
    ],
    specifications: [
      { label: "Instruments", value: "GForce impOSCar 2 or impOSCar 3" },
      { label: "impOSCar 3", value: "134 individual XML patches" },
      { label: "impOSCar 2", value: "132 individual FXP files, including four approximate backports" },
      { label: "Delivery", value: "Individual presets; no combined FXB or .imp3Col bank" },
      { label: "Extras", value: "Installation guide and artwork" }
    ],
    requirements: brutusRequirements
  },
  "brutus-lite-imposcar-presets": {
    subtitle: "16 free atmospheric sounds for GForce impOSCar 2 and 3.",
    shortMeta: "16 sounds per instrument • XML and FXP • Free",
    ctaLine: "Enter 0 on Gumroad to download free; contributions are optional.",
    longDescription: [
      "BRUTUS Lite introduces the full collection with basses, arpeggios, pads, drones, and textures.",
      "It includes 16 individual impOSCar 3 XML patches and 16 related impOSCar 2 FXP presets, plus an installation guide and artwork. Matching sounds may differ between the instruments."
    ],
    specifications: [
      { label: "Instruments", value: "GForce impOSCar 2 or impOSCar 3" },
      { label: "Included", value: "16 XML patches for impOSCar 3 and 16 related FXP presets for impOSCar 2" },
      { label: "Delivery", value: "Individual presets; no combined FXB or .imp3Col bank" },
      { label: "Access", value: "Free; optional Gumroad contribution" }
    ],
    requirements: brutusRequirements
  },
  "strange-signals-sylenth1-presets": {
    subtitle: "122 atmospheric and experimental presets for LennarDigital Sylenth1.",
    shortMeta: "122 presets • Sylenth1 FXB • Includes the 16 Lite sounds",
    longDescription: [
      "STRANGE SIGNALS combines evolving textures, long-form drones, shifting sequences, and unusual effects from Kreativ Sound's Textural, Sequential, Wild FX, and Agonizer collections.",
      "The download includes one 122-preset FXB bank, a preset list with source collections, installation guide, manual, and usage terms. Try the free 16-preset Lite selection first."
    ],
    specifications: [
      { label: "Instrument", value: "LennarDigital Sylenth1" },
      { label: "Presets", value: "122 presets in one FXB bank" },
      { label: "Lite selection", value: "16 sounds selected from Full" },
      { label: "Extras", value: "Preset list, installation guide, manual, and usage terms" }
    ],
    requirements: sylenthRequirements
  },
  "strange-signals-lite-sylenth1-presets": {
    subtitle: "16 free atmospheric and experimental presets for Sylenth1.",
    shortMeta: "16 presets • Sylenth1 FXB • Free selection from Full",
    ctaLine: "Enter 0 on Gumroad to download free; contributions are optional.",
    longDescription: [
      "Explore a selection of textures, sequences, drones, and unusual effects from STRANGE SIGNALS.",
      "The 16 selected presets are supplied as a Sylenth1 FXB bank with installation information and usage terms. The full collection contains 122 presets."
    ],
    specifications: [
      { label: "Instrument", value: "LennarDigital Sylenth1" },
      { label: "Presets", value: "16 presets in one FXB bank" },
      { label: "Edition", value: "Selection from the 122-preset Full collection" },
      { label: "Access", value: "Free; optional Gumroad contribution" }
    ],
    requirements: sylenthRequirements
  },
  "surgical-cz-surge-xt-presets": {
    subtitle: "132 free CZ-inspired presets for the free Surge XT synthesizer.",
    shortMeta: "132 presets • Surge XT • Embedded wavetable data • Free",
    ctaLine: "Enter 0 on Gumroad to download free; contributions are optional.",
    longDescription: [
      "SURGICAL CZ brings digital character to Surge XT through basses, leads, keys, pads, and electronic textures, from playful tones to evolving sounds.",
      "The collection contains 132 presets, including eight KS XTRA alternate versions, with embedded wavetable data, installation instructions, and a patch list. It is inspired by the original DAFT sound set for reFX PlastiCZ."
    ],
    specifications: [
      { label: "Instrument", value: "Surge XT; developed with version 1.3.4" },
      { label: "Presets", value: "132, including eight KS XTRA alternate versions" },
      { label: "Wavetables", value: "Embedded; no separate wavetable installation" },
      { label: "Access", value: "Free; optional Gumroad contribution" }
    ],
    requirements: ["The free Surge XT synthesizer is required. The bank was developed with Surge XT 1.3.4."]
  }
} satisfies Record<string, ProductLandingCopy>;

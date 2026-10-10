export type ProductInstallation = {
  steps: string[];
  sourceUrl?: string;
  sourceLabel?: string;
};

const arturiaBank = (synth: string, extension: string): ProductInstallation => ({
  steps: [
    "Download and unzip the pack from your Gumroad library.",
    `Open ${synth}, choose Import from its main menu, and select the included ${extension} bank.`,
    "Find the imported bank in the synth's preset browser. The instrument itself is not included."
  ]
});

const fm8: ProductInstallation = {
  steps: [
    "Unzip the pack and keep its preset folder in a permanent location.",
    "In FM8, open File → Options → Database. Add the preset folder to User Library Directories.",
    "Choose Rebuild DB, then open the imported sounds in FM8's File Browser."
  ],
  sourceUrl: "https://support.native-instruments.com/support/solutions/articles/69000879938-native-instruments-how-to-import-third-party-sounds-in-absynth-fm8-massive",
  sourceLabel: "Native Instruments import guide"
};

const vital: ProductInstallation = {
  steps: [
    "Download and unzip the pack. Open Vital or Vital Free.",
    "Use Vital's preset menu to open an included .vital preset, or import a .vitalbank file if one is supplied.",
    "Save edited sounds under new names so the original presets remain available."
  ]
};

export const productInstallations: Record<string, ProductInstallation> = {
  "burnshaper": {
    steps: [
      "Download the ZIP for your operating system from Gumroad. Unzip it and read the included installation guide; there is no installer.",
      "macOS: copy the complete .component bundle to ~/Library/Audio/Plug-Ins/Components for AU, or the complete .vst3 bundle to ~/Library/Audio/Plug-Ins/VST3 for VST3.",
      "Windows: install the required Microsoft Visual C++ v14 x64 Redistributable (14.44 or later), then copy the complete .vst3 bundle to C:\\Program Files\\Common Files\\VST3\\. If security software blocks the unsigned plugin, contact support; do not disable protections.",
      "Restart or rescan plug-ins in your DAW and add BurnShaper as an audio effect. Open the information button beside BURNSHAPER, choose Licence, and activate online with your Gumroad licence key.",
      "Once activation is saved, the plugin works offline. Re-activate on a new computer/account or if the activation receipt is deleted."
    ],
    sourceUrl: "https://kreativ.gumroad.com/l/ks-burnshaper",
    sourceLabel: "Downloads, installation guides, and customer terms"
  },
  "ghostform": {
    steps: [
      "Download the macOS or Windows archive and the Ghostform User Manual v1.0 from Gumroad. Unzip the archive.",
      "macOS: copy KS Ghostform.component to ~/Library/Audio/Plug-Ins/Components for AU, or KS Ghostform.vst3 to ~/Library/Audio/Plug-Ins/VST3 for VST3.",
      "Windows: copy the entire KS Ghostform.vst3 folder to C:\\Program Files\\Common Files\\VST3\\.",
      "Restart or rescan plug-ins in your DAW, then load KS Ghostform on an instrument track. It is not a standalone application."
    ],
    sourceUrl: "https://kreativ.gumroad.com/l/ks-ghostform",
    sourceLabel: "Download and user manual"
  },
  "callisto-drift-jup-8-v4-presets": arturiaBank("Arturia Jup-8 V4", ".jup4x"),
  "callisto-drift-lite-jup-8-v4-presets": arturiaBank("Arturia Jup-8 V4", ".jup4x"),
  "juno-nocturnes-jun-6-v-presets": arturiaBank("Arturia JUN-6 V", ".junx"),
  "juno-nocturnes-lite-jun-6-v-presets": arturiaBank("Arturia JUN-6 V", ".junx"),
  "black-arcology-pigments-presets": arturiaBank("Arturia Pigments", "Pigments"),
  "black-arcology-lite-pigments-presets": arturiaBank("Arturia Pigments", "Pigments"),
  "operators-fm8-presets": fm8,
  "operators-lite-fm8-presets": fm8,
  "velvet-ruins-vital-presets": vital,
  "velvet-ruins-lite-vital-presets": vital,
  "bioforms-synplant-2-presets": {
    steps: [
      "Unzip BIOFORMS and locate the .synplant files in the Presets folder.",
      "Open Synplant 2 and load a .synplant file through its patch browser. Synplant 1 is not supported.",
      "Keep the files together in your user patch folder for easy browsing; save variations separately."
    ]
  },
  "neolith-softube-models-presets": {
    steps: [
      "Unzip NEOLITH and open the included Presets Banks folder.",
      "Match MONOGRIT to Model 72, POLYMOD to Model 80, and CHROMA to Model 84. Each bank requires its matching Softube instrument.",
      "Open that instrument's Preset Collection, choose Import Preset(s), and select its .spt bank. Repeat for the other instruments you own."
    ],
    sourceUrl: "https://www.softube.com/uk/user-manuals/preset-collection",
    sourceLabel: "Softube Preset Collection guide"
  },
  "monolush-fabfilter-one-presets": {
    steps: [
      "Unzip MONOLUSH and locate its .ffp presets.",
      "In FabFilter One's preset menu, choose Options → Open Other Preset to load a file directly.",
      "For a permanent bank, copy the preset folder into Documents/FabFilter/Presets/One, or your configured One preset folder."
    ],
    sourceUrl: "https://www.fabfilter.com/help/one/presets/howpresetsarestored",
    sourceLabel: "FabFilter preset-folder guide"
  },
  "dirty-model-moog-model-d-presets": {
    steps: [
      "Unzip DIRTY MODEL and locate KREATIV_DIRTY_MODEL.mdb.",
      "With Moog Model D installed, open the .mdb file with Model D to import the bank.",
      "Select the imported DIRTY MODEL bank in Model D's preset browser."
    ]
  },
  "zephyr-animoog-z-presets": {
    steps: [
      "Download the ZEPHYR ZIP from Gumroad.",
      "Open Animoog Z and drag the ZIP onto its window to import the presets, as described in the included README.",
      "Browse the imported ZEPHYR sounds in Animoog Z and save your own variations separately."
    ]
  },
  "abyss-pro-53-presets": {
    steps: [
      "Unzip ABYSS and open Native Instruments PRO-53 in a compatible legacy host.",
      "Use PRO-53's preset-bank loading controls to open the included bank. Follow the archive's README for the supplied file format.",
      "Keep a backup of your existing bank. PRO-53 is discontinued; modern-host compatibility is not guaranteed."
    ]
  },
  "daft-plasticz-presets": {
    steps: [
      "Unzip DAFT and open reFX PlastiCZ in a compatible legacy host.",
      "Use the instrument or host's bank-loading controls to open the included preset bank, following the archive's README.",
      "Back up your current bank first. A compatible PlastiCZ installation is required."
    ]
  },
  "the-black-angel-refill": {
    steps: [
      "Unzip the archive, if needed, and keep the Reason ReFill in a permanent location.",
      "In Reason's browser, open the ReFill and load its NN-XT patches or REX2 material into the matching device.",
      "Keep the ReFill available at the same location when reopening projects."
    ]
  }
};

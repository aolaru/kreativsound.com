export type ProductLandingCopy = {
  subtitle: string;
  shortMeta: string;
  ctaLine?: string;
  finalCtaTitle?: string;
  finalCtaText?: string;
  includedProducts?: string[];
  longDescription: string[];
  specifications: Array<{ label: string; value: string }>;
  requirements: string[];
};

export const landingCopyOverrides = {
  "kreativ-kollection-v1": {
    subtitle: "9 synth preset banks and 7 WAV sound packs in one native Gumroad bundle.",
    shortMeta: "16 products • 9 preset banks • 7 WAV sound packs • €144 individual value",
    ctaLine: "Get all 16 products for €49 through February 19, 2027, then €69.",
    finalCtaTitle: "Build a broader sound palette for less.",
    finalCtaText: "Get the €144 collection for €49 through February 19, 2027. The price moves to €69 after the introductory period.",
    includedProducts: [
      "juno-nocturnes-jun-6-v-presets",
      "bioforms-synplant-2-presets",
      "velvet-ruins-vital-presets",
      "black-arcology-pigments-presets",
      "neolith-softube-models-presets",
      "dirty-model-moog-model-d-presets",
      "zephyr-animoog-z-presets",
      "monolush-fabfilter-one-presets",
      "operators-fm8-presets",
      "horror-2-cinematic-textures",
      "bleeps-2-percussion-sounds",
      "sfxs-2-sound-effects",
      "noize-2-noise-textures",
      "enigma-2-cinematic-atmospheres",
      "space-2-atmospheres-textures",
      "tectonic-2-dark-subs-textures"
    ],
    longDescription: [
      "Kreativ Kollection V1 brings together 16 complete Kreativ Sound releases: 9 synth preset banks and 7 WAV sound packs spanning dark ambient, cinematic, industrial, experimental, and electronic production.",
      "The preset side covers Arturia JUN-6 V and Pigments, Native Instruments FM8, Vital, Synplant 2, Softube Synth Models, FabFilter One, Moog Model D, and Animoog Z. The WAV side adds percussion, transitions, atmospheres, noise, subs, horror textures, and experimental sound material that works in any modern DAW.",
      "Each included product is delivered separately through your Gumroad library, so you can download only what a project needs and receive eligible product updates in the same place. Dark Drones 2 will also be added as a free future V1 update."
    ],
    specifications: [
      { label: "Product type", value: "Native Gumroad product bundle" },
      { label: "Format", value: "Synth preset banks and WAV audio packs" },
      { label: "Includes", value: "16 products: 9 preset banks and 7 WAV sound packs" },
      { label: "Best for", value: "Ambient, cinematic, electronic, industrial, experimental, and darker production" },
      { label: "Individual value", value: "€144" },
      { label: "Introductory price", value: "€49 through February 19, 2027; €69 afterward" },
      { label: "Delivery", value: "Separate products in your Gumroad library" },
      { label: "License", value: "Personal and commercial music production use" },
      { label: "Updates", value: "Eligible included-product updates plus Dark Drones 2 as a free future V1 update" },
      { label: "Checkout", value: "Gumroad" }
    ],
    requirements: [
      "The preset banks require their matching instruments: Arturia JUN-6 V, Arturia Pigments, Native Instruments FM8, Vital, Synplant 2, Softube Synth Models, FabFilter One, Moog Model D, or Animoog Z.",
      "The 7 WAV sound packs can be used in any DAW, sampler, or audio editor that supports standard WAV files.",
      "Please check the individual product notes inside the collection for exact plugin requirements."
    ]
  },
  "preset-mutator": {
    subtitle: "Browser-Based Vital Preset Generator",
    shortMeta: "Free browser tool • 3 variants per run • Vital presets",
    ctaLine: "Open the free browser tool and export playable Vital preset variants.",
    finalCtaTitle: "Open Preset Mutator.",
    finalCtaText: "Create three Vital preset variants from scratch intent, one source preset, or a short audio source.",
    longDescription: [
      "Preset Mutator creates Vital preset starts from scratch ideas, existing Vital presets, or short audio sources.",
      "It is built for quick sketches: generate a playable direction, then finish the sound inside Vital.",
      "The tool runs locally in your browser and exports individual `.vital` variants without uploads or accounts."
    ],
    specifications: [
      { label: "Product type", value: "Browser sound-design tool" },
      { label: "Format", value: "Vital preset generation and export" },
      { label: "Output", value: "3 Vital preset variants per run" },
      { label: "Best for", value: "Fast Vital preset starts, preset mutation, audio-to-preset experiments, and sound-design sketching" },
      { label: "Processing", value: "Local browser processing" },
      { label: "Price", value: "Free" }
    ],
    requirements: [
      "A modern web browser is required to run Preset Mutator.",
      "Vital is required to load and edit the generated preset files.",
      "Generated presets are best treated as starting points for sound design, not final mix-ready presets."
    ]
  },
  "juno-nocturnes-jun-6-v-presets": {
    subtitle: "96 Arturia JUN-6 V presets for dark ambient pads, drones, sequences, basses, leads, keys, and FX.",
    shortMeta: "96 presets • JUN-6 V preset bank • 1.5 MB download",
    ctaLine: "Download the 96-preset Arturia JUN-6 V bank.",
    longDescription: [
      "Juno Nocturnes is a cinematic dark ambient preset bank for Arturia JUN-6 V, built around massive pads, deep drones, pulsing sequences, shadowed basses, fragile leads, dusty keys, and atmospheric FX.",
      "The bank focuses on nocturnal analog motion, wide chorus, deep reverb, unstable modulation, low-frequency pressure, and soundtrack-ready atmosphere.",
      "Use it for dark ambient, drone, experimental electronic music, cinematic scoring, sci-fi texture work, introspective downtempo, and sparse chord-driven sound design."
    ],
    specifications: [
      { label: "Product type", value: "Preset bank" },
      { label: "Synth", value: "Arturia JUN-6 V" },
      { label: "Format", value: "JUN-6 V preset bank in .junx format" },
      { label: "Preset count", value: "96 presets" },
      { label: "Categories", value: "32 Pads, 16 Drones, 13 Sequences, 8 Bass, 9 Leads, 9 Keys, 9 FX" },
      { label: "Download size", value: "1.5 MB" },
      { label: "Delivery", value: "ZIP download" },
      { label: "License", value: "Personal and commercial music production use" },
      { label: "Checkout", value: "Gumroad" }
    ],
    requirements: [
      "Arturia JUN-6 V is required to use these presets.",
      "JUN-6 V 1.6.x or newer is recommended.",
      "Import the included .junx preset bank through the Arturia preset browser."
    ]
  },
  "juno-nocturnes-lite-jun-6-v-presets": {
    subtitle: "Free 16-preset Arturia JUN-6 V preview bank from Juno Nocturnes.",
    shortMeta: "16 presets • JUN-6 V preset bank • Free download",
    ctaLine: "Download the free 16-preset Arturia JUN-6 V bank.",
    longDescription: [
      "Juno Nocturnes Lite is a free preview of the full Juno Nocturnes preset bank for Arturia JUN-6 V.",
      "It gives you a focused selection of dark ambient pads, drones, sequences, basses, leads, keys, and FX so you can test the nocturnal JUN-6 V sound before getting the full 96-preset bank.",
      "Use it when you want a small, usable JUN-6 V preset set for dark ambient, drone, cinematic, sci-fi, and experimental electronic music."
    ],
    specifications: [
      { label: "Product type", value: "Free preset bank" },
      { label: "Synth", value: "Arturia JUN-6 V" },
      { label: "Format", value: "JUN-6 V preset bank in .junx format" },
      { label: "Preset count", value: "16 presets" },
      { label: "Categories", value: "5 Pads, 3 Drones, 2 Sequences, 2 Bass, 1 Lead, 1 Keys, 2 FX" },
      { label: "Download size", value: "1.64 MB" },
      { label: "Delivery", value: "ZIP download" },
      { label: "License", value: "Personal and commercial music production use" },
      { label: "Checkout", value: "Free Gumroad download" }
    ],
    requirements: [
      "Arturia JUN-6 V is required to use these presets.",
      "JUN-6 V 1.6.x or newer is recommended.",
      "The full Juno Nocturnes release expands this Lite pack to 96 presets."
    ]
  },
  "operators-fm8-presets": {
    subtitle: "64 FM8 Presets for Native Instruments FM8",
    shortMeta: "64 presets • 4 MB download • FM8 preset bank",
    ctaLine: "Get the 64-preset FM8 bank.",
    longDescription: [
      "OPERATORS is a 64-preset sound bank for Native Instruments FM8, built around cold digital motion, metallic FM detail, and cinematic atmosphere.",
      "The bank focuses on evolving pads, dark drones, expressive basses, bells, plucks, leads, strings, sweeps, and experimental FX for ambient, cinematic, electronic, industrial, and darker experimental production.",
      "Instead of trying to imitate analog subtractive synths, OPERATORS embraces the character of FM synthesis: glassy harmonics, metallic movement, precise digital textures, and frequency-driven motion."
    ],
    specifications: [
      { label: "Product type", value: "Preset bank" },
      { label: "Synth", value: "Native Instruments FM8" },
      { label: "Format", value: "FM8 presets" },
      { label: "Preset count", value: "64 presets" },
      { label: "Download size", value: "4 MB" },
      { label: "Categories", value: "Pads, drones, basses, bells, leads, plucks, sweeps, strings, FX" },
      { label: "Delivery", value: "Digital download" },
      { label: "License", value: "Personal and commercial music production use" },
      { label: "Checkout", value: "PayPal or Gumroad" }
    ],
    requirements: [
      "Native Instruments FM8 is required to use these presets.",
      "You need a DAW or host that can load FM8, such as Ableton Live, Logic Pro, Cubase, FL Studio, Bitwig Studio, Reaper, or similar.",
      "Use these presets for ambient, cinematic, electronic, industrial, and experimental FM parts."
    ]
  },
  "operators-lite-fm8-presets": {
    subtitle: "Free 16-Preset Native Instruments FM8 Bank from OPERATORS",
    shortMeta: "16 presets • FM8 preset bank • Free download",
    ctaLine: "Download the free 16-preset FM8 bank.",
    longDescription: [
      "OPERATORS Lite is a free 16-preset FM8 bank selected from the full OPERATORS collection.",
      "The Lite version gives you a compact slice of cold digital movement, metallic harmonic detail, dark atmosphere, and cinematic FM sound design.",
      "Use it for ambient, cinematic, industrial, IDM, experimental electronic, and darker soundtrack sessions before moving to the full 64-preset release."
    ],
    specifications: [
      { label: "Product type", value: "Free preset bank" },
      { label: "Synth", value: "Native Instruments FM8" },
      { label: "Format", value: "FM8 preset bank" },
      { label: "Preset count", value: "16 presets" },
      { label: "Categories", value: "Pads, drones, basses, bells, plucks, sweeps, and FX" },
      { label: "Download size", value: "1.84 MB" },
      { label: "Delivery", value: "Digital download" },
      { label: "License", value: "Personal and commercial music production use" },
      { label: "Checkout", value: "Free Gumroad download" }
    ],
    requirements: [
      "Native Instruments FM8 is required to use these presets.",
      "You need a DAW or host that can load FM8.",
      "The full OPERATORS release expands this Lite pack to 64 FM8 presets."
    ]
  },
  "bioforms-synplant-2-presets": {
    subtitle: "Evolving Synplant 2 Presets for Organic Motion",
    shortMeta: "32+ patches • Synplant 2 presets • Organic ambient motion",
    ctaLine: "Download the Synplant 2 preset pack.",
    longDescription: [
      "BIOFORMS is a Synplant 2 preset pack built around organic movement, slow harmonic change, and atmospheric tone that feels alive without becoming crowded.",
      "The collection focuses on evolving patches, ambient beds, living textures, and restrained melodic material. It works best when a cue needs motion under the surface rather than a static pad.",
      "BIOFORMS leans into the generative and biological character of Synplant 2: unstable growth, soft mutation, and musical movement that can support ambient, cinematic, and experimental production."
    ],
    specifications: [
      { label: "Product type", value: "Preset bank" },
      { label: "Synth", value: "Sonic Charge Synplant 2" },
      { label: "Format", value: "Synplant 2 presets" },
      { label: "Preset count", value: "32+ patches" },
      { label: "Focus", value: "Organic movement, evolving tone, ambient beds" },
      { label: "Delivery", value: "Digital download" },
      { label: "License", value: "Personal and commercial music production use" },
      { label: "Checkout", value: "Gumroad" }
    ],
    requirements: [
      "Sonic Charge Synplant 2 is required to use these presets.",
      "You need a DAW or host that can load Synplant 2, such as Ableton Live, Logic Pro, Cubase, FL Studio, Bitwig Studio, Reaper, or similar.",
      "Use these presets for evolving harmonic parts in ambient, cinematic, electronic, and experimental tracks."
    ]
  },
  "neolith-softube-models-presets": {
    subtitle: "Softube Models Presets for Analog Weight and Cinematic Tension",
    shortMeta: "Full pack • Softube Models presets • Analog cinematic tone",
    ctaLine: "Download the Softube Models preset pack.",
    longDescription: [
      "NEOLITH is a preset pack for Softube Models shaped around analog-forward tone, heavy synth body, and controlled cinematic pressure.",
      "The bank focuses on darker synth beds, low-register melodic material, tension patches, and textured analog movement for cues that need weight without excessive modulation or clutter.",
      "NEOLITH keeps the sound palette deliberate: thick harmonic body, restrained movement, and enough edge to support ambient, cinematic, electronic, and darker soundtrack work."
    ],
    specifications: [
      { label: "Product type", value: "Preset bank" },
      { label: "Synth", value: "Softube Models" },
      { label: "Format", value: "Softube Models presets" },
      { label: "Preset count", value: "Full pack" },
      { label: "Focus", value: "Analog weight, cinematic tension, pressure-building synth beds" },
      { label: "Delivery", value: "Digital download" },
      { label: "License", value: "Personal and commercial music production use" },
      { label: "Checkout", value: "Gumroad" }
    ],
    requirements: [
      "Softube Models is required to use these presets.",
      "You need a DAW or host that can load the Softube instrument format used by the pack.",
      "Use these presets for dark scoring, pressure beds, electronic production, and cinematic synth layers."
    ]
  },
  "velvet-ruins-vital-presets": {
    subtitle: "Vital Presets for Dark Melody and Spectral Motion",
    shortMeta: "Full pack • Vital presets • Dark spectral textures",
    ctaLine: "Download the full VELVET RUINS preset pack.",
    longDescription: [
      "VELVET RUINS is a preset pack for Vital focused on worn-down cinematic texture, dark melodic tone, and controlled spectral movement.",
      "The pack is built for atmospheric pads, tense melodic patches, spectral layers, and darker electronic material that feels aged without becoming muddy.",
      "Instead of a glossy EDM-style Vital palette, VELVET RUINS leans into damaged harmonics, soft spectral smear, and mood-first sound design for ambient, cinematic, industrial, and experimental music."
    ],
    specifications: [
      { label: "Product type", value: "Preset bank" },
      { label: "Synth", value: "Vital" },
      { label: "Format", value: "Vital presets" },
      { label: "Preset count", value: "Full pack" },
      { label: "Focus", value: "Dark melody, spectral motion, cinematic atmosphere" },
      { label: "Delivery", value: "Digital download" },
      { label: "License", value: "Personal and commercial music production use" },
      { label: "Checkout", value: "Gumroad" }
    ],
    requirements: [
      "Vital is required to use these presets.",
      "You need a DAW or host that can load Vital, such as Ableton Live, Logic Pro, Cubase, FL Studio, Bitwig Studio, Reaper, or similar.",
      "Use these presets for dark spectral layers in ambient, cinematic, electronic, and experimental tracks."
    ]
  },
  "black-arcology-pigments-presets": {
    subtitle: "128 Arturia Pigments Presets for Industrial Cinematic Sound Design",
    shortMeta: "128 presets • Pigments preset bank • Industrial drones, keys, textures, FX",
    ctaLine: "Download the full 128-preset Pigments bank.",
    longDescription: [
      "BLACK ARCOLOGY is a 128-preset Arturia Pigments collection built for industrial pressure, evolving tension, and character-driven synthetic tone.",
      "The bank is organized around drones, industrial textures, melodic keys, and FX/noise patches for dark ambient, industrial, cinematic, techno, experimental, trailer, and game-audio work.",
      "Expect mechanical movement, noir harmony, broken digital edges, and spatial pressure."
    ],
    specifications: [
      { label: "Product type", value: "Preset bank" },
      { label: "Synth", value: "Arturia Pigments" },
      { label: "Format", value: "Pigments preset bank" },
      { label: "Preset count", value: "128 presets" },
      { label: "Categories", value: "Drones, industrial textures, melodic keys, FX and noise" },
      { label: "Delivery", value: "Digital download" },
      { label: "License", value: "Personal and commercial music production use" },
      { label: "Checkout", value: "Gumroad or PayPal" }
    ],
    requirements: [
      "Arturia Pigments is required to use these presets.",
      "Use a DAW or host that can load Pigments, such as Ableton Live, Logic Pro, Cubase, FL Studio, Bitwig Studio, Reaper, or similar.",
      "Import the included Pigments preset file through the Pigments preset browser. The latest Pigments version is recommended."
    ]
  },
  "monolush-fabfilter-one-presets": {
    subtitle: "132 FabFilter One Presets for Warm Mono Bass and Lead Sounds",
    shortMeta: "132 patches • FabFilter One presets • Warm mono synth tone",
    ctaLine: "Download the 132-patch FabFilter One bank.",
    longDescription: [
      "MONOLUSH is a FabFilter One preset pack focused on warm mono synth tone, basses, leads, and simple tonal layers.",
      "The bank keeps the scope narrow: stable mono lines, clear low-mid presence, and sounds that sit quickly in an arrangement.",
      "Use it when you need a compact mono palette instead of a broad utility bank."
    ],
    specifications: [
      { label: "Product type", value: "Preset bank" },
      { label: "Synth", value: "FabFilter One" },
      { label: "Format", value: "FabFilter One presets" },
      { label: "Preset count", value: "132 patches" },
      { label: "Focus", value: "Warm basses, focused leads, simple tonal layers" },
      { label: "Delivery", value: "Digital download" },
      { label: "License", value: "Personal and commercial music production use" },
      { label: "Checkout", value: "Gumroad" }
    ],
    requirements: [
      "FabFilter One is required to use these presets.",
      "You need a DAW or host that can load FabFilter One.",
      "Use these presets for basses, leads, and simple melodic layers."
    ]
  },
  "dirty-model-moog-model-d-presets": {
    subtitle: "64 Moog Model D Presets for Driven Bass, Grit, and Analog Weight",
    shortMeta: "64 patches • Moog Model D presets • Audio demo included",
    ctaLine: "Download the 64-patch Moog Model D bank.",
    longDescription: [
      "DIRTY MODEL is a Moog Model D preset pack focused on driven basses, analog grit, and darker low-end tone.",
      "The bank is shaped for heavy bass pressure, rougher mono leads, and low-register movement that keeps note definition intact before extra processing.",
      "DIRTY MODEL leans into the Model D character directly: drive, weight, body, and raw analog movement for electronic, industrial, cinematic, and darker production work."
    ],
    specifications: [
      { label: "Product type", value: "Preset bank" },
      { label: "Synth", value: "Moog Model D" },
      { label: "Format", value: "Moog Model D presets" },
      { label: "Preset count", value: "64 patches" },
      { label: "Focus", value: "Driven basses, analog grit, darker mono tone" },
      { label: "Audio demo", value: "Included" },
      { label: "Delivery", value: "Digital download" },
      { label: "License", value: "Personal and commercial music production use" },
      { label: "Checkout", value: "Gumroad" }
    ],
    requirements: [
      "Moog Model D is required to use these presets.",
      "You need a DAW or host that can load Moog Model D.",
      "Use these presets for basses, leads, low-end pressure, and darker synth lines."
    ]
  },
  "zephyr-animoog-z-presets": {
    subtitle: "96 Animoog Z Presets for Airy Motion and Melodic Drift",
    shortMeta: "96 patches • Animoog Z presets • Audio demo included",
    ctaLine: "Download the 96-patch Animoog Z bank.",
    longDescription: [
      "ZEPHYR is a Moog Animoog Z preset pack built for airy movement, melodic motion, and layered atmosphere.",
      "The collection focuses on lighter harmonic drift, soft internal motion, and layer-friendly material that can lift a track without crowding it.",
      "ZEPHYR works best when you need open movement, melodic shimmer, and atmosphere that stays active but does not add dense low-end pressure."
    ],
    specifications: [
      { label: "Product type", value: "Preset bank" },
      { label: "Synth", value: "Moog Animoog Z" },
      { label: "Format", value: "Animoog Z presets" },
      { label: "Preset count", value: "96 patches" },
      { label: "Focus", value: "Airy melodic movement, soft motion, layered atmosphere" },
      { label: "Audio demo", value: "Included" },
      { label: "Delivery", value: "Digital download" },
      { label: "License", value: "Personal and commercial music production use" },
      { label: "Checkout", value: "Gumroad" }
    ],
    requirements: [
      "Moog Animoog Z is required to use these presets.",
      "Use a DAW or host that can load Animoog Z.",
      "Use these presets for melodic motion in ambient, electronic, cinematic, and atmospheric tracks."
    ]
  },
  "sfxs-2-sound-effects": {
    subtitle: "WAV Sound Effects for Creative Accents and Cinematic Transitions",
    shortMeta: "FX pack • WAV samples • Audio demo included",
    ctaLine: "Download the creative sound-effects collection.",
    longDescription: [
      "SFXS 2 is a focused sound-effects collection built for creative accents, cinematic transitions, and small design details that add motion quickly.",
      "The pack covers edits, intros, scene movement, punctuation points, and layered production moments where one sharp design sound is enough.",
      "It is compact enough to browse quickly when you need a transition or accent."
    ],
    specifications: [
      { label: "Product type", value: "Sample collection" },
      { label: "Format", value: "WAV samples" },
      { label: "Collection", value: "FX pack" },
      { label: "Focus", value: "Sound effects, transitions, accents, design details" },
      { label: "Audio demo", value: "Included" },
      { label: "Delivery", value: "Digital download" },
      { label: "License", value: "Personal and commercial music production use" },
      { label: "Checkout", value: "Gumroad" }
    ],
    requirements: [
      "Use any DAW, sampler, video editor, or audio editor that can import WAV audio.",
      "No specific synth plugin is required.",
      "Use these sounds for cinematic accents, transitions, edits, layers, and small production details."
    ]
  },
  "noize-2-noise-textures": {
    subtitle: "WAV Noise Textures and FX for Abstract Sound Design",
    shortMeta: "Noise pack • WAV samples • Audio demo included",
    ctaLine: "Download the experimental noise texture collection.",
    longDescription: [
      "NOIZE 2 is an experimental noise and FX collection built for abstract layers, glitch detail, unstable motion, and texture shaping.",
      "The material sits under cleaner arrangements as roughness, tension, broken movement, and synthetic edge.",
      "NOIZE 2 is less about traditional musical parts and more about texture: noise beds, fractured details, and unstable sound-design material for electronic, cinematic, and experimental work."
    ],
    specifications: [
      { label: "Product type", value: "Sample collection" },
      { label: "Format", value: "WAV samples" },
      { label: "Collection", value: "Noise pack" },
      { label: "Focus", value: "Noise textures, glitch layers, abstract FX" },
      { label: "Audio demo", value: "Included" },
      { label: "Delivery", value: "Digital download" },
      { label: "License", value: "Personal and commercial music production use" },
      { label: "Checkout", value: "Gumroad" }
    ],
    requirements: [
      "Use any DAW, sampler, or audio editor that can import WAV audio.",
      "No specific synth plugin is required.",
      "Use these sounds for abstract texture, noise layers, glitch detail, and unstable movement."
    ]
  },
  "enigma-2-cinematic-atmospheres": {
    subtitle: "WAV Cinematic Atmospheres for Mystery, Suspense, and Dark Beds",
    shortMeta: "Atmosphere pack • WAV samples • Audio demo included",
    ctaLine: "Download the cinematic atmosphere collection.",
    longDescription: [
      "ENIGMA 2 is a cinematic atmosphere collection focused on dark tension beds, restrained mystery, and slow-building ambiguity.",
      "The pack covers suspense beds, darker ambience, and subtle movement that leaves room for other elements.",
      "ENIGMA 2 sits between ambient texture and overt horror material for film, trailer, game audio, ambient, and experimental production."
    ],
    specifications: [
      { label: "Product type", value: "Sample collection" },
      { label: "Format", value: "WAV samples" },
      { label: "Collection", value: "Atmosphere pack" },
      { label: "Focus", value: "Mystery, suspense beds, dark cinematic ambience" },
      { label: "Audio demo", value: "Included" },
      { label: "Delivery", value: "Digital download" },
      { label: "License", value: "Personal and commercial music production use" },
      { label: "Checkout", value: "Gumroad" }
    ],
    requirements: [
      "Use any DAW, sampler, video editor, or audio editor that can import WAV audio.",
      "No specific synth plugin is required.",
      "Use these sounds for cinematic beds, suspense cues, ambient layers, and darker atmosphere."
    ]
  },
  "bleeps-2-percussion-sounds": {
    subtitle: "WAV Percussion Sounds for Synthetic One-Shots and Rhythm Accents",
    shortMeta: "Percussion pack • WAV samples • Audio demo included",
    ctaLine: "Download the experimental percussion collection.",
    longDescription: [
      "BLEEPS 2 is an experimental percussion sample pack built for strange rhythm accents, synthetic one-shots, and sharper percussive detail.",
      "The collection works best as a detail library: unusual hits, design accents, and rhythmic punctuation that can cut through when standard percussion feels too familiar.",
      "BLEEPS 2 is not a full drum toolkit. It is a compact source of synthetic bite and odd percussive movement for electronic and experimental work."
    ],
    specifications: [
      { label: "Product type", value: "Sample collection" },
      { label: "Format", value: "WAV samples" },
      { label: "Collection", value: "Percussion pack" },
      { label: "Focus", value: "Experimental percussion, one-shots, rhythmic FX" },
      { label: "Audio demo", value: "Included" },
      { label: "Delivery", value: "Digital download" },
      { label: "License", value: "Personal and commercial music production use" },
      { label: "Checkout", value: "Gumroad" }
    ],
    requirements: [
      "Use any DAW, sampler, drum rack, or audio editor that can import WAV audio.",
      "No specific synth plugin is required.",
      "Use these sounds for rhythm programming, synthetic percussion layers, transitions, and sharp design accents."
    ]
  },
  "space-2-atmospheres-textures": {
    subtitle: "WAV Space Atmospheres and Textures for Sci-Fi Ambience",
    shortMeta: "Atmosphere pack • WAV samples • Audio demo included",
    ctaLine: "Download the space atmosphere collection.",
    longDescription: [
      "SPACE 2 is an atmosphere and texture library shaped for sci-fi ambience, distant environments, and suspended motion.",
      "The pack focuses on wide environmental beds, softer atmospheric movement, and space-inspired textures that can make a scene or track feel larger.",
      "SPACE 2 works when you need distance, width, and suspended tone rather than dense foreground design or aggressive impacts."
    ],
    specifications: [
      { label: "Product type", value: "Sample collection" },
      { label: "Format", value: "WAV samples" },
      { label: "Collection", value: "Atmosphere pack" },
      { label: "Focus", value: "Sci-fi ambience, distant environments, suspended textures" },
      { label: "Audio demo", value: "Included" },
      { label: "Delivery", value: "Digital download" },
      { label: "License", value: "Personal and commercial music production use" },
      { label: "Checkout", value: "Gumroad" }
    ],
    requirements: [
      "Use any DAW, sampler, video editor, or audio editor that can import WAV audio.",
      "No specific synth plugin is required.",
      "Use these sounds for sci-fi ambience, environmental beds, ambient production, and cinematic background texture."
    ]
  },
  "tectonic-2-dark-subs-textures": {
    subtitle: "WAV Dark Subs and Underground Textures for Low-End Pressure",
    shortMeta: "Low-end pack • WAV samples • Audio demo included",
    ctaLine: "Download the dark subs and texture collection.",
    longDescription: [
      "TECTONIC 2 is a dark subs and underground texture collection focused on low-end pressure, subterranean atmosphere, and cinematic heaviness.",
      "The material is designed to support cues before melodic detail appears: rumbling beds, low-register texture, pressure layers, and heavier underground movement.",
      "TECTONIC 2 adds weight and tension without turning into a busy foreground element."
    ],
    specifications: [
      { label: "Product type", value: "Sample collection" },
      { label: "Format", value: "WAV samples" },
      { label: "Collection", value: "Low-end pack" },
      { label: "Focus", value: "Dark subs, low-end pressure, subterranean textures" },
      { label: "Audio demo", value: "Included" },
      { label: "Delivery", value: "Digital download" },
      { label: "License", value: "Personal and commercial music production use" },
      { label: "Checkout", value: "Gumroad" }
    ],
    requirements: [
      "Use any DAW, sampler, or audio editor that can import WAV audio.",
      "No specific synth plugin is required.",
      "Use appropriate monitoring when working with low-frequency material. These sounds fit pressure beds, cinematic weight, and underground texture layers."
    ]
  },
  "horror-2-cinematic-textures": {
    subtitle: "WAV Horror Textures for Stingers, Uneasy Drones, and Threat Cues",
    shortMeta: "Horror pack • WAV samples • Audio demo included",
    ctaLine: "Download the cinematic horror texture collection.",
    longDescription: [
      "HORROR 2 is a cinematic horror texture collection focused on uneasy drones, threat cues, stingers, and darker atmosphere.",
      "The pack covers tension gestures, scene punctuation, and atmospheric unease when subtle ambience is not enough.",
      "HORROR 2 works for film, game audio, trailer, dark ambient, experimental, and sound-design contexts where threat and psychological pressure need to appear quickly."
    ],
    specifications: [
      { label: "Product type", value: "Sample collection" },
      { label: "Format", value: "WAV samples" },
      { label: "Collection", value: "Horror pack" },
      { label: "Focus", value: "Uneasy drones, stingers, threat cues, dark atmosphere" },
      { label: "Audio demo", value: "Included" },
      { label: "Delivery", value: "Digital download" },
      { label: "License", value: "Personal and commercial music production use" },
      { label: "Checkout", value: "Gumroad" }
    ],
    requirements: [
      "Use any DAW, sampler, video editor, or audio editor that can import WAV audio.",
      "No specific synth plugin is required.",
      "Use these sounds for horror scoring, darker cinematic cues, threat layers, stingers, and uneasy atmosphere."
    ]
  },
  "velvet-ruins-lite-vital-presets": {
    subtitle: "Free Vital Presets from VELVET RUINS",
    shortMeta: "20 presets • Vital presets • Free download",
    ctaLine: "Download the free Vital preset pack.",
    longDescription: [
      "VELVET RUINS Lite is a free Vital preset pack drawn from the worn-down atmosphere of the full VELVET RUINS release.",
      "The pack gives you dark spectral tone, cinematic mood, and experimental Vital material in a smaller bank.",
      "Use it for pads, melodic fragments, and darker layers before moving to the full preset pack."
    ],
    specifications: [
      { label: "Product type", value: "Free preset bank" },
      { label: "Synth", value: "Vital" },
      { label: "Format", value: "Vital presets" },
      { label: "Preset count", value: "20 presets" },
      { label: "Focus", value: "Dark Vital presets, spectral texture, cinematic mood" },
      { label: "Delivery", value: "Digital download" },
      { label: "License", value: "Personal and commercial music production use" },
      { label: "Checkout", value: "Free Gumroad download" }
    ],
    requirements: [
      "Vital is required to use these presets.",
      "You need a DAW or host that can load Vital.",
      "Use these presets for darker cinematic and experimental Vital patches."
    ]
  },
  "black-arcology-lite-pigments-presets": {
    subtitle: "Free 32-Preset Arturia Pigments Bank from BLACK ARCOLOGY",
    shortMeta: "32 presets • Pigments preset bank • Free download",
    ctaLine: "Download the free 32-preset Pigments bank.",
    longDescription: [
      "BLACK ARCOLOGY Lite is a free 32-preset Arturia Pigments bank that introduces the darker industrial tone of the full BLACK ARCOLOGY release.",
      "The free version includes drones, industrial textures, melodic keys, and FX/noise presets from the same darker Pigments palette.",
      "Use it for dark, cinematic, industrial material before moving to the full 128-preset collection."
    ],
    specifications: [
      { label: "Product type", value: "Free preset bank" },
      { label: "Synth", value: "Arturia Pigments" },
      { label: "Format", value: "Pigments preset bank" },
      { label: "Preset count", value: "32 presets" },
      { label: "Categories", value: "Drones, industrial textures, melodic keys, FX and noise" },
      { label: "Delivery", value: "Digital download" },
      { label: "License", value: "Personal and commercial music production use" },
      { label: "Checkout", value: "Free Gumroad download" }
    ],
    requirements: [
      "Arturia Pigments is required to use these presets.",
      "Use a DAW or host that can load Pigments.",
      "The latest Pigments version is recommended. The full BLACK ARCOLOGY release expands this Lite pack to 128 presets."
    ]
  },
  "abyss-pro-53-presets": {
    subtitle: "Free Dark Ambient PRO-53 Presets from the Kreativ Sound Archive",
    shortMeta: "215 sounds • PRO-53 presets • Legacy archive",
    ctaLine: "Download the free legacy PRO-53 preset archive.",
    longDescription: [
      "ABYSS is a free PRO-53 preset archive focused on dark ambient tone and earlier Kreativ Sound atmosphere work.",
      "The release is preserved as a legacy sound-design snapshot: dark pads, older ambient material, and a historic preset direction from the catalog.",
      "ABYSS remains useful if you still work with PRO-53 or want older dark ambient presets from the archive."
    ],
    specifications: [
      { label: "Product type", value: "Legacy preset archive" },
      { label: "Synth", value: "Native Instruments PRO-53" },
      { label: "Format", value: "PRO-53 presets" },
      { label: "Preset count", value: "215 sounds" },
      { label: "Focus", value: "Dark ambient presets and archive atmospheres" },
      { label: "Delivery", value: "Digital download" },
      { label: "License", value: "Personal and commercial music production use" },
      { label: "Checkout", value: "Gumroad" }
    ],
    requirements: [
      "Native Instruments PRO-53 is required to use these presets.",
      "PRO-53 is legacy software, so compatibility depends on your operating system, plugin format, and host setup.",
      "This release is an archive download."
    ]
  },
  "the-black-angel-refill": {
    subtitle: "Reason ReFill Archive from the First Kreativ Sound Release",
    shortMeta: "101 NNXT + 102 REX2 • Reason ReFill • Archive entry",
    longDescription: [
      "The Black Angel is an archive-only Reason ReFill and the first product release in the Kreativ Sound catalog history.",
      "The release is built around classic Prophet V material and older Reason-centered production.",
      "This page remains online as an archive note for the early catalog."
    ],
    specifications: [
      { label: "Product type", value: "Legacy archive" },
      { label: "Platform", value: "Reason" },
      { label: "Format", value: "Reason ReFill" },
      { label: "Content", value: "101 NNXT + 102 REX2" },
      { label: "Focus", value: "Classic Prophet V material and archive Reason production" },
      { label: "Delivery", value: "Archive reference" },
      { label: "Checkout", value: "Not currently sold" }
    ],
    requirements: [
      "Reason with ReFill support is required to use the original archive material.",
      "Compatibility depends on the Reason version and operating system used.",
      "This page is an archive reference rather than an active checkout page."
    ]
  },
  "daft-plasticz-presets": {
    subtitle: "Legacy Presets for Plastic Synthetic Texture and Archive Sound Design",
    shortMeta: "Archive • Legacy presets • Synthetic texture",
    ctaLine: "Download the legacy preset archive.",
    longDescription: [
      "DAFT Plasticz is a legacy preset archive focused on plastic, synthetic textures and older sound-design experiments.",
      "The release shows a brighter, more synthetic side of the older catalog.",
      "DAFT Plasticz is archive material for older plastic and synthetic tones."
    ],
    specifications: [
      { label: "Product type", value: "Legacy preset archive" },
      { label: "Format", value: "Legacy presets" },
      { label: "Collection", value: "Archive" },
      { label: "Focus", value: "Plastic synthetic textures and older sound-design experiments" },
      { label: "Delivery", value: "Digital download" },
      { label: "License", value: "Personal and commercial music production use" },
      { label: "Checkout", value: "Gumroad" }
    ],
    requirements: [
      "Use the compatible legacy instrument or host setup referenced in the download files.",
      "Compatibility may depend on older software versions, plugin formats, or operating systems.",
      "This release is a legacy archive download."
    ]
  }
} satisfies Record<string, ProductLandingCopy>;

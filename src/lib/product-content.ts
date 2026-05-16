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
    subtitle: "The complete Kreativ Sound preset and sample collection.",
    shortMeta: "Coming soon • Presets • Samples • Loops • Textures",
    ctaLine: "Kreativ Kollection V1 is being prepared as the first complete Kreativ Sound bundle.",
    finalCtaTitle: "Kreativ Kollection V1 is coming soon.",
    finalCtaText: "The first wave of Kreativ Sound presets, samples, textures, and sound-design material is being prepared as a single bundle.",
    includedProducts: [
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
      "Kreativ Kollection V1 brings together the first wave of Kreativ Sound products into one complete bundle — presets, samples, loops, drones, textures, and experimental sound design material for producers, composers, and creators.",
      "Kreativ Kollection V1 is the first complete bundle from Kreativ Sound, collecting the core sound-design releases into one focused package.",
      "It brings together preset banks, sample packs, loops, drones, textures, and experimental sound material designed for ambient, cinematic, electronic, industrial, and darker creative workflows.",
      "Instead of buying individual packs one by one, Kreativ Kollection V1 gives you a single entry point into the Kreativ Sound universe — a compact but varied collection of playable presets, raw audio material, and atmospheric production tools.",
      "The collection is built for creators who want mood, texture, movement, and usable sound design without bloated libraries or generic filler."
    ],
    specifications: [
      { label: "Product type", value: "Complete sound bundle" },
      { label: "Format", value: "Digital download" },
      { label: "Includes", value: "Preset banks, samples, loops, textures, and sound design packs" },
      { label: "Best for", value: "Ambient, cinematic, electronic, industrial, experimental, and darker production" },
      { label: "Delivery", value: "Digital download when released" },
      { label: "License", value: "Personal and commercial music production use" },
      { label: "Updates", value: "V1 collection snapshot, with future versions released separately unless otherwise specified" },
      { label: "Checkout", value: "Coming soon" }
    ],
    requirements: [
      "Some included preset banks require specific synths or plugins such as Synplant 2, Vital, Arturia Pigments, Native Instruments FM8, Native Instruments PRO-53, FabFilter One, Moog Model D, Animoog Z, or Softube Synth Models.",
      "Audio samples, loops, drones, and textures can be used in any DAW or sampler that supports standard audio files.",
      "Please check the individual product notes inside the collection for exact plugin requirements."
    ]
  },
  "operators-fm8-presets": {
    subtitle: "64 FM8 Presets for Native Instruments FM8",
    shortMeta: "64 presets • 4 MB download • FM8 preset bank",
    ctaLine: "Get the 64-preset FM8 bank.",
    longDescription: [
      "OPERATORS is a 64-preset sound bank for Native Instruments FM8, built around cold digital motion, metallic FM detail, and cinematic atmosphere.",
      "The bank focuses on evolving pads, dark drones, expressive basses, bells, plucks, leads, strings, sweeps, and experimental FX. It is designed for ambient, cinematic, electronic, industrial, and darker experimental production.",
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
      "The presets are best used as digital FM material for ambient, cinematic, electronic, industrial, and experimental music production."
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
      "The presets are best used as evolving harmonic material for ambient, cinematic, electronic, and experimental music production."
    ]
  },
  "neolith-softube-models-presets": {
    subtitle: "Softube Models Presets for Analog Weight and Cinematic Tension",
    shortMeta: "Full pack • Softube Models presets • Analog cinematic tone",
    ctaLine: "Download the Softube Models preset pack.",
    longDescription: [
      "NEOLITH is a preset pack for Softube Models shaped around analog-forward tone, heavy synth body, and controlled cinematic pressure.",
      "The bank focuses on darker synth beds, low-register melodic material, tension patches, and textured analog movement. It is designed for cues that need weight without excessive modulation or clutter.",
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
      "The presets are best used as analog-style material for dark scoring, pressure beds, electronic production, and cinematic synth layering."
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
      "The presets are best used as dark spectral material for ambient, cinematic, electronic, and experimental production."
    ]
  },
  "black-arcology-pigments-presets": {
    subtitle: "128 Arturia Pigments Presets for Industrial Cinematic Sound Design",
    shortMeta: "128 presets • Pigments preset bank • Industrial drones, keys, textures, FX",
    ctaLine: "Download the full 128-preset Pigments bank.",
    longDescription: [
      "BLACK ARCOLOGY is a 128-preset Arturia Pigments collection built for industrial pressure, evolving tension, and character-driven synthetic tone.",
      "The bank is organized around drones, industrial textures, melodic keys, and FX/noise patches. It is designed for dark ambient, industrial, cinematic, techno, experimental, trailer, and game-audio work.",
      "BLACK ARCOLOGY is less a utility preset bank and more a mood engine: mechanical movement, noir harmony, broken digital edges, and spatial pressure shaped into usable production material."
    ],
    specifications: [
      { label: "Product type", value: "Preset bank" },
      { label: "Synth", value: "Arturia Pigments" },
      { label: "Format", value: "Pigments preset bank" },
      { label: "Preset count", value: "128 presets" },
      { label: "Categories", value: "Drones, industrial textures, melodic keys, FX and noise" },
      { label: "Delivery", value: "Digital download" },
      { label: "License", value: "Personal and commercial music production use" },
      { label: "Checkout", value: "Gumroad" }
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
      "MONOLUSH is a FabFilter One preset pack focused on warm mono synth tone, direct melodic usefulness, and fast track-ready bass and lead sounds.",
      "The bank keeps the scope narrow on purpose: basses, focused leads, and simple tonal layers that sit quickly in an arrangement without heavy sound-design overhead.",
      "MONOLUSH is built for producers who want stable mono lines, clear low-mid presence, and a compact palette that moves quickly from browsing to writing."
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
      "The presets are best used as mono synth material for basses, leads, and simple melodic layers."
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
      "The presets are best used as analog mono material for basses, leads, low-end pressure, and darker synth lines."
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
      "The presets are best used as melodic motion material for ambient, electronic, cinematic, and atmospheric production."
    ]
  },
  "sfxs-2-sound-effects": {
    subtitle: "WAV Sound Effects for Creative Accents and Cinematic Transitions",
    shortMeta: "FX pack • WAV samples • Audio demo included",
    ctaLine: "Download the creative sound-effects collection.",
    longDescription: [
      "SFXS 2 is a focused sound-effects collection built for creative accents, cinematic transitions, and small design details that add motion quickly.",
      "The pack is useful for edits, intros, scene movement, quick punctuation points, and layered production moments where one sharp design sound is more useful than a huge effects dump.",
      "SFXS 2 is intentionally compact and browsable, making it easier to find a usable transition or accent without leaving the creative flow."
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
      "The sounds are best used for cinematic accents, transitions, edits, sound-design layers, and production details."
    ]
  },
  "noize-2-noise-textures": {
    subtitle: "WAV Noise Textures and FX for Abstract Sound Design",
    shortMeta: "Noise pack • WAV samples • Audio demo included",
    ctaLine: "Download the experimental noise texture collection.",
    longDescription: [
      "NOIZE 2 is an experimental noise and FX collection built for abstract layers, glitch detail, unstable motion, and texture shaping.",
      "The material works well as a layer under cleaner arrangements, adding roughness, tension, broken movement, and synthetic edge without needing to build everything from scratch.",
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
      "The sounds are best used as abstract texture, noise layering, glitch detail, and unstable movement in sound-design workflows."
    ]
  },
  "enigma-2-cinematic-atmospheres": {
    subtitle: "WAV Cinematic Atmospheres for Mystery, Suspense, and Dark Beds",
    shortMeta: "Atmosphere pack • WAV samples • Audio demo included",
    ctaLine: "Download the cinematic atmosphere collection.",
    longDescription: [
      "ENIGMA 2 is a cinematic atmosphere collection focused on dark tension beds, restrained mystery, and slow-building ambiguity.",
      "The pack is designed for scenes and cues that need atmosphere without constant impact sounds: suspense beds, darker ambience, and subtle movement that leaves room for other elements.",
      "ENIGMA 2 sits between ambient texture and overt horror material, making it useful for film, trailer, game audio, ambient, and experimental production."
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
      "The sounds are best used for cinematic beds, suspense cues, ambient layers, and darker atmospheric production."
    ]
  },
  "bleeps-2-percussion-sounds": {
    subtitle: "WAV Percussion Sounds for Synthetic One-Shots and Rhythm Accents",
    shortMeta: "Percussion pack • WAV samples • Experimental one-shots",
    ctaLine: "Download the experimental percussion collection.",
    longDescription: [
      "BLEEPS 2 is an experimental percussion sample pack built for strange rhythm accents, synthetic one-shots, and sharper percussive detail.",
      "The collection works best as a detail library: unusual hits, design accents, and rhythmic punctuation that can cut through when standard percussion feels too familiar.",
      "BLEEPS 2 is not a full drum toolkit. It is a compact source of synthetic bite and odd percussive movement for electronic, experimental, and sound-design workflows."
    ],
    specifications: [
      { label: "Product type", value: "Sample collection" },
      { label: "Format", value: "WAV samples" },
      { label: "Collection", value: "Percussion pack" },
      { label: "Focus", value: "Experimental percussion, one-shots, rhythmic FX" },
      { label: "Delivery", value: "Digital download" },
      { label: "License", value: "Personal and commercial music production use" },
      { label: "Checkout", value: "Gumroad" }
    ],
    requirements: [
      "Use any DAW, sampler, drum rack, or audio editor that can import WAV audio.",
      "No specific synth plugin is required.",
      "The sounds are best used for rhythm programming, synthetic percussion layers, transitions, and sharp design accents."
    ]
  },
  "space-2-atmospheres-textures": {
    subtitle: "WAV Space Atmospheres and Textures for Sci-Fi Ambience",
    shortMeta: "Atmosphere pack • WAV samples • Audio demo included",
    ctaLine: "Download the space atmosphere collection.",
    longDescription: [
      "SPACE 2 is an atmosphere and texture library shaped for sci-fi ambience, distant environments, and suspended motion.",
      "The pack focuses on wide environmental beds, softer atmospheric movement, and space-inspired textures that can make a scene or track feel larger.",
      "SPACE 2 is useful when you need distance, width, and suspended tone rather than dense foreground sound design or aggressive impact effects."
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
      "The sounds are best used for sci-fi ambience, environmental beds, ambient production, and cinematic background texture."
    ]
  },
  "tectonic-2-dark-subs-textures": {
    subtitle: "WAV Dark Subs and Underground Textures for Low-End Pressure",
    shortMeta: "Low-end pack • WAV samples • Audio demo included",
    ctaLine: "Download the dark subs and texture collection.",
    longDescription: [
      "TECTONIC 2 is a dark subs and underground texture collection focused on low-end pressure, subterranean atmosphere, and cinematic heaviness.",
      "The material is designed to support cues before melodic detail appears: rumbling beds, low-register texture, pressure layers, and heavier underground movement.",
      "TECTONIC 2 is most useful when a track or scene needs weight and tension without turning into a busy foreground element."
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
      "Use appropriate monitoring when working with low-frequency material. The sounds are best used for pressure beds, cinematic weight, and underground texture layers."
    ]
  },
  "horror-2-cinematic-textures": {
    subtitle: "WAV Horror Textures for Stingers, Uneasy Drones, and Threat Cues",
    shortMeta: "Horror pack • WAV samples • Audio demo included",
    ctaLine: "Download the cinematic horror texture collection.",
    longDescription: [
      "HORROR 2 is a cinematic horror texture collection focused on uneasy drones, threat cues, stingers, and darker atmosphere.",
      "The pack is designed for moments that need a more direct horror signal than subtle ambience: tension gestures, scene punctuation, and atmospheric unease.",
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
      "The sounds are best used for horror scoring, darker cinematic cues, threat layers, stingers, and uneasy atmosphere."
    ]
  },
  "velvet-ruins-lite-vital-presets": {
    subtitle: "Free Vital Presets from the VELVET RUINS Sound World",
    shortMeta: "20 presets • Vital presets • Free download",
    ctaLine: "Download the free Vital preset pack.",
    longDescription: [
      "VELVET RUINS Lite is a free Vital preset pack offering a smaller entry point into the worn-down atmosphere of the full VELVET RUINS release.",
      "The pack gives you a usable slice of dark spectral tone, cinematic mood, and experimental Vital material without requiring the full commercial bank.",
      "Use it to test the darker VELVET RUINS direction in your own sessions before moving to the full preset pack."
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
      "The presets are best used as a free entry point into darker cinematic and experimental Vital sound design."
    ]
  },
  "black-arcology-lite-pigments-presets": {
    subtitle: "Free 32-Preset Arturia Pigments Bank from BLACK ARCOLOGY",
    shortMeta: "32 presets • Pigments preset bank • Free download",
    ctaLine: "Download the free 32-preset Pigments bank.",
    longDescription: [
      "BLACK ARCOLOGY Lite is a free 32-preset Arturia Pigments bank that introduces the darker industrial tone of the full BLACK ARCOLOGY release.",
      "The free version includes a compact selection of drones, industrial textures, melodic keys, and FX/noise presets so you can test the sound palette in real production context.",
      "It is designed as a useful entry point, not filler: dark, cinematic, industrial material that connects directly to the full 128-preset collection."
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
      "ABYSS is best approached as archive material. It remains useful if you still work with PRO-53 or want to explore the older Kreativ Sound ambient vocabulary."
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
      "This release is maintained as an archive download rather than a current flagship product."
    ]
  },
  "the-black-angel-refill": {
    subtitle: "Reason ReFill Archive from the First Kreativ Sound Release",
    shortMeta: "101 NNXT + 102 REX2 • Reason ReFill • Archive entry",
    longDescription: [
      "The Black Angel is an archive-only Reason ReFill and the first product release in the Kreativ Sound catalog history.",
      "The release is built around classic Prophet V material and older Reason-centered workflows, preserved here as historical context for the project.",
      "This page is not positioned as a current storefront product. It remains online as part of the Kreativ Sound archive and early catalog timeline."
    ],
    specifications: [
      { label: "Product type", value: "Legacy archive" },
      { label: "Platform", value: "Reason" },
      { label: "Format", value: "Reason ReFill" },
      { label: "Content", value: "101 NNXT + 102 REX2" },
      { label: "Focus", value: "Classic Prophet V material and archive Reason workflows" },
      { label: "Delivery", value: "Archive reference" },
      { label: "Checkout", value: "Not currently sold" }
    ],
    requirements: [
      "Reason with ReFill support is required to use the original archive material.",
      "Compatibility depends on the Reason version and operating system used.",
      "This page is preserved for catalog history rather than active commercial checkout."
    ]
  },
  "daft-plasticz-presets": {
    subtitle: "Legacy Presets for Plastic Synthetic Texture and Archive Sound Design",
    shortMeta: "Archive • Legacy presets • Synthetic texture",
    ctaLine: "Download the legacy preset archive.",
    longDescription: [
      "DAFT Plasticz is a legacy preset archive focused on plastic, synthetic textures and older sound-design experiments.",
      "The release represents a brighter, more synthetic side of the older catalog, contrasting with the darker industrial and cinematic direction of the current products.",
      "DAFT Plasticz is best treated as historical flavor and archive material for producers who want older synthetic texture from the Kreativ Sound catalog."
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
      "This release is maintained as a legacy archive download rather than a current flagship product."
    ]
  }
} satisfies Record<string, ProductLandingCopy>;

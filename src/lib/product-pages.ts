import { products, type Product, type ProductCategory } from "./products";

export type ProductPage = {
  slug: string;
  title: string;
  headline: string;
  subtitle: string;
  description: string;
  canonical: string;
  ogImage: string;
  ogImageAlt: string;
  image: string;
  imageAlt: string;
  kicker: string;
  lead: string;
  summary: string;
  variant: "flagship" | "standard" | "free" | "archive";
  primaryUrl?: string;
  primaryLabel?: string;
  purchaseAltUrl?: string;
  purchaseAltLabel?: string;
  secondaryUrl: string;
  secondaryLabel: string;
  liteUrl?: string;
  liteLabel?: string;
  liteNote?: string;
  shortMeta?: string;
  valueLine?: string;
  ctaLine?: string;
  proofPoints?: string[];
  heroNote: string;
  demoBlurb?: string;
  demoPlaceholder?: string;
  demo?: { label: string; src: string; type?: string };
  specs: Array<{ label: string; value: string }>;
  specifications: Array<{ label: string; value: string }>;
  requirements: string[];
  longDescription: string[];
  panels: Array<{ title: string; body?: string; items?: string[] }>;
  related: Array<{ label: string; url: string }>;
};

type ProductPageOverride = Partial<Omit<ProductPage, "slug" | "title" | "canonical" | "ogImage" | "image">> & {
  headline?: string;
};

const sharedRelatedByCategory: Record<ProductCategory, Array<{ label: string; url: string }>> = {
  Presets: [
    { label: "Browse workflow guides", url: "/learn/" },
    { label: "Back to the full sound catalog", url: "/" }
  ],
  Samples: [
    { label: "Browse workflow guides", url: "/learn/" },
    { label: "Back to the full sound catalog", url: "/" }
  ],
  Free: [
    { label: "Browse workflow guides", url: "/learn/" },
    { label: "Back to the full sound catalog", url: "/" }
  ],
  Legacy: [
    { label: "Browse the full archive", url: "/" },
    { label: "Read the latest news", url: "/news/" }
  ]
};

const productOverrides: Record<string, ProductPageOverride> = {
  "operators-fm8-presets": {
    headline: "OPERATORS",
    description: "OPERATORS is a 64-preset soundset for Native Instruments FM8, focused on atmospheric motion, digital textures, and frequency-driven synthesis.",
    kicker: "New preset pack",
    lead: "64 presets for Native Instruments FM8.",
    subtitle: "64 FM8 Presets for Native Instruments FM8",
    summary: "Digital FM material for pads, drones, basses, bells, leads, plucks, sweeps, strings, and FX.",
    heroNote: "Requires Native Instruments FM8. Delivered as a small preset download with PayPal and Gumroad checkout options.",
    shortMeta: "64 presets • 4 MB download • FM8 preset bank",
    valueLine: "64 FM8 presets | 4 MB download | PayPal or Gumroad",
    ctaLine: "Get the 64-preset FM8 bank.",
    primaryUrl: "https://www.paypal.com/ncp/payment/TS44NMWAGW2DL",
    primaryLabel: "Pay with PayPal",
    purchaseAltUrl: "https://kreativ.gumroad.com/l/operators-fm8-sounds",
    purchaseAltLabel: "Buy on Gumroad",
    proofPoints: [
      "Native Instruments FM8 preset bank.",
      "64 presets in a 4 MB download.",
      "Pads, drones, basses, bells, leads, plucks, sweeps, strings, and FX."
    ],
    specs: [
      { label: "Synth", value: "Native Instruments FM8" },
      { label: "Format", value: "FM8 presets" },
      { label: "Count", value: "64 presets" },
      { label: "Download", value: "4 MB" }
    ],
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
    ],
    panels: [
      {
        title: "At a glance",
        body: "OPERATORS is a 64-preset FM8 bank in a 4 MB download. The sound set is focused on digital FM tone: motion, metal, bass, drones, and atmospheric keys."
      },
      {
        title: "Patch groups",
        items: [
          "Evolving pads and dark drones.",
          "Synthetic basses and expressive leads.",
          "Metallic bells, plucks, and sweeps.",
          "Strings, FX, and experimental FM textures."
        ]
      },
      {
        title: "Sound character",
        items: [
          "Cold digital atmosphere.",
          "Frequency-driven motion and harmonic shimmer.",
          "Metallic FM detail.",
          "Useful for ambient, cinematic, and electronic production."
        ]
      },
      {
        title: "Requirements",
        items: [
          "Native Instruments FM8.",
          "A host or workflow that can load FM8 preset banks.",
          "Best treated as digital FM material, not analog-style subtractive patches."
        ]
      }
    ],
    related: [
      { label: "Read the release note", url: "/posts/operators-fm8-release-2026-05-14.html" },
      { label: "Back to the full sound catalog", url: "/" }
    ]
  },
  "bioforms-synplant-2-presets": {
    title: "BIOFORMS | Kreativ Sound",
    headline: "BIOFORMS",
    description: "BIOFORMS is a Synplant 2 preset pack focused on evolving motion, organic tone, and atmospheric movement.",
    kicker: "Flagship preset pack",
    lead: "Evolving presets for Synplant 2.",
    summary: "A preset collection built for organic motion, slow harmonic change, and atmospheric layers that feel alive without turning busy.",
    heroNote: "Built for producers who want evolving tone that stays musical and mixable over longer cues.",
    secondaryUrl: "/posts/how-to-layer-bioforms-for-organic-motion-2026-03-14.html",
    secondaryLabel: "Hear it in context",
    demoPlaceholder: "A dedicated audio demo is being prepared for BIOFORMS. Until then, the workflow guide shows where the pack fits in real ambient layering.",
    specs: [
      { label: "Format", value: "Synplant 2 presets" },
      { label: "Focus", value: "Organic movement and evolving tone" },
      { label: "Best for", value: "Ambient beds and living harmonic layers" }
    ],
    panels: [
      {
        title: "Sound character",
        body: "BIOFORMS is designed for motion with control. The presets shift gradually, keep space in the mix, and work well when a track needs atmosphere that keeps moving under the surface."
      },
      {
        title: "What you get",
        items: [
          "Evolving presets with restrained internal movement.",
          "Organic harmonic layers for ambient work and scoring.",
          "Textures that sit under leads without becoming static."
        ]
      }
    ],
    related: [
      { label: "How to layer BIOFORMS for organic motion", url: "/posts/how-to-layer-bioforms-for-organic-motion-2026-03-14.html" },
      { label: "More workflow guides", url: "/learn/" }
    ]
  },
  "neolith-softube-models-presets": {
    title: "NEOLITH | Kreativ Sound",
    headline: "NEOLITH",
    description: "NEOLITH is a preset pack for Softube Models built around analog-forward tone, cinematic tension, and textured synth weight.",
    kicker: "Flagship preset pack",
    lead: "Presets for Softube Models.",
    summary: "An analog-forward preset set shaped for cinematic tension, heavy synth tone, and motion that feels deliberate rather than overdesigned.",
    heroNote: "Made for darker cues that need pressure, analog body, and enough movement to stay alive without losing focus.",
    secondaryUrl: "/posts/three-ways-to-use-neolith-for-cinematic-tension-2026-03-14.html",
    secondaryLabel: "Hear it in context",
    demoPlaceholder: "A dedicated audio demo is being prepared for NEOLITH. Until then, the workflow guide shows how to use it for cinematic tension.",
    specs: [
      { label: "Format", value: "Softube Models presets" },
      { label: "Focus", value: "Analog weight and cinematic tone" },
      { label: "Best for", value: "Dark scoring and pressure-building synth beds" }
    ],
    panels: [
      {
        title: "Sound character",
        body: "NEOLITH is built for tone first. The presets lean into thick harmonic body, restrained movement, and enough edge to hold tension without becoming harsh."
      },
      {
        title: "What you get",
        items: [
          "Analog-forward presets with cinematic weight.",
          "Tension beds and low-register melodic material.",
          "Focused movement that stays out of the way."
        ]
      }
    ],
    related: [
      { label: "3 ways to use NEOLITH for cinematic tension", url: "/posts/three-ways-to-use-neolith-for-cinematic-tension-2026-03-14.html" },
      { label: "NEOLITH release notes", url: "/posts/neolith-release-2026-03-03.html" }
    ]
  },
  "velvet-ruins-vital-presets": {
    title: "VELVET RUINS | Kreativ Sound",
    headline: "VELVET RUINS",
    description: "VELVET RUINS is a Vital preset pack focused on worn-down cinematic texture, dark melody, and spectral motion.",
    kicker: "Flagship preset pack",
    lead: "Presets for Vital spectral synth.",
    summary: "A dark Vital preset set built for spectral movement, worn melodic tone, and cinematic atmosphere that feels aged without turning muddy.",
    heroNote: "Shaped for musicians who want immediate mood, spectral movement, and darker melodic material without a polished preset-bank feel.",
    secondaryUrl: "/posts/velvet-ruins-release-2026-03-21.html",
    secondaryLabel: "Hear it in context",
    liteUrl: "/products/velvet-ruins-lite-vital-presets",
    liteLabel: "Download Lite",
    liteNote: "Want to try the sound first? Start with the free Lite version, then come back for the full pack.",
    demoPlaceholder: "A dedicated audio demo is being prepared for VELVET RUINS. The free Lite version is the best way to test the sound palette right now.",
    specs: [
      { label: "Format", value: "Vital presets" },
      { label: "Focus", value: "Dark melody and spectral motion" },
      { label: "Best for", value: "Cinematic tension and ambient scoring" }
    ],
    panels: [
      {
        title: "Sound character",
        body: "VELVET RUINS is built for patches that carry mood immediately. The pack leans into soft spectral smear, damaged harmonic edges, and motion that stays musical instead of noisy."
      },
      {
        title: "What you get",
        items: [
          "Dark melodic presets with worn harmonic tone.",
          "Spectral textures that stay controlled in a mix.",
          "Atmospheric layers for tension and ambient scoring."
        ]
      }
    ],
    related: [
      { label: "VELVET RUINS release notes", url: "/posts/velvet-ruins-release-2026-03-21.html" },
      { label: "More workflow guides", url: "/learn/" }
    ]
  },
  "black-arcology-pigments-presets": {
    headline: "BLACK ARCOLOGY",
    description: "BLACK ARCOLOGY is a dark cinematic Arturia Pigments preset collection built for industrial pressure, evolving tension, and character-driven synthetic tone.",
    kicker: "New preset pack",
    lead: "Industrial presets for Arturia Pigments.",
    summary: "A 128-preset Pigments collection built for industrial drones, textures, melodic keys, and fractured FX that feel dark, modern, cinematic, and immediately useful in real productions.",
    heroNote: "BLACK ARCOLOGY is built for producers who want depth, tension, movement, and character without ending up in the generic preset-bank lane. It is less a utility pack and more a mood engine.",
    liteUrl: "/products/black-arcology-lite-pigments-presets",
    liteLabel: "Download Lite",
    liteNote: "Try the free 32-preset Lite version first. Upgrade when you want the full 128-preset collection.",
    demoPlaceholder: "A dedicated audio demo is being prepared for BLACK ARCOLOGY. The free Lite version is the best way to test the Pigments sound palette right now.",
    specs: [
      { label: "Format", value: "Arturia Pigments presets" },
      { label: "Included", value: "128 presets" },
      { label: "Best for", value: "Industrial atmospheres, cinematic drones, keys, and fractured FX" }
    ],
    secondaryUrl: "/learn/",
    secondaryLabel: "See workflow guides",
    panels: [
      {
        title: "Why this pack hits differently",
        body: "BLACK ARCOLOGY is designed around texture, movement, and atmosphere first. The presets balance usable musicality with experimental edge, so they work for layering, intros, transitions, and full compositions without feeling static or overpolished."
      },
      {
        title: "Inside the pack",
        items: [
          "128 presets for Arturia Pigments.",
          "32 drones.",
          "32 industrial textures.",
          "32 melodic keys.",
          "32 FX and noise presets."
        ]
      },
      {
        title: "Sound palette",
        items: [
          "Dark industrial atmospheres.",
          "Evolving cinematic drones.",
          "Noir-inspired melodic keys.",
          "Broken, metallic, and spatial FX.",
          "Experimental textures for sound design."
        ]
      },
      {
        title: "Best use and requirements",
        items: [
          "Ambient, industrial, techno, and experimental electronic work.",
          "Film, soundtrack, trailer, and game-audio scoring.",
          "Arturia Pigments, latest version recommended.",
          "Import the included .pgtx file directly into Pigments via the preset browser."
        ]
      }
    ],
    related: [
      { label: "Browse workflow guides", url: "/learn/" },
      { label: "Back to the full sound catalog", url: "/" }
    ]
  },
  "monolush-fabfilter-one-presets": {
    headline: "MONOLUSH",
    description: "MONOLUSH is a FabFilter One preset pack shaped around warm mono synth tone and direct melodic usefulness.",
    kicker: "Preset pack",
    lead: "Presets for FabFilter One.",
    summary: "A direct mono-synth preset set for warm basses, focused leads, and simple tonal layers that fit quickly into a track.",
    heroNote: "Built for straight-to-work mono lines that feel warm, stable, and immediately usable.",
    panels: [
      {
        title: "Why it lands quickly",
        body: "MONOLUSH keeps the scope narrow on purpose. The presets focus on warm mono tone, clear low-mid presence, and simple melodic usefulness instead of trying to cover every synth role at once."
      },
      {
        title: "Inside the pack",
        items: [
          "Warm basses and leads that sit quickly in a mix.",
          "Simple tonal layers for direct arrangement work.",
          "A tighter palette for producers who prefer fewer but more usable starting points."
        ]
      }
    ],
    secondaryUrl: "/learn/",
    secondaryLabel: "See workflow guides"
  },
  "dirty-model-moog-model-d-presets": {
    headline: "DIRTY MODEL",
    description: "DIRTY MODEL is a Moog Model D preset pack focused on driven basses, analog grit, and darker low-end tone.",
    kicker: "Preset pack",
    lead: "Presets for Moog Model D.",
    summary: "A heavier analog preset set for bass, grit, and low-register movement when a track needs pressure without losing definition.",
    heroNote: "Made for lines that need drive, body, and analog grit before any extra processing.",
    demoBlurb: "The demo leans into the pack's stronger side: darker bass weight, driven tone, and rougher analog movement.",
    panels: [
      {
        title: "Why it hits harder",
        body: "DIRTY MODEL leans on Model D character instead of disguising it. The presets are shaped for dirtier bass pressure, rougher edge, and low-register movement that stays defined."
      },
      {
        title: "Inside the pack",
        items: [
          "Driven bass patches with analog grit.",
          "Low-register leads and heavier mono phrases.",
          "A darker tonal range that still keeps note definition intact."
        ]
      }
    ],
    secondaryUrl: "/learn/",
    secondaryLabel: "See workflow guides"
  },
  "zephyr-animoog-z-presets": {
    headline: "ZEPHYR",
    description: "ZEPHYR is a preset pack for Moog Animoog Z built for airy movement, melodic motion, and layered atmosphere.",
    kicker: "Preset pack",
    lead: "Presets for Moog Animoog Z.",
    summary: "A motion-led preset collection for melodic layers, lighter harmonic drift, and airier synth movement.",
    heroNote: "A better fit for tracks that need lift, melodic drift, and lighter movement instead of dense low-end weight.",
    demoBlurb: "The demo focuses on ZEPHYR's airier side: melodic drift, soft motion, and layered movement that stays light on its feet.",
    panels: [
      {
        title: "Why it stays open",
        body: "ZEPHYR is built around lighter motion and clearer upper-range movement. It works best when a track needs air, melodic drift, and atmosphere that stays active without becoming busy."
      },
      {
        title: "Inside the pack",
        items: [
          "Airier melodic presets with soft internal motion.",
          "Layer-friendly tonal material for wider arrangements.",
          "A more open and floating direction than the darker flagship packs."
        ]
      }
    ],
    secondaryUrl: "/learn/",
    secondaryLabel: "See workflow guides"
  },
  "sfxs-2-sound-effects": {
    headline: "SFXS 2",
    description: "SFXS 2 is a sound-effects collection focused on creative accents, cinematic transitions, and design detail.",
    kicker: "Sample collection",
    lead: "Creative sound effects collection.",
    summary: "A focused sample pack for transitions, accents, and quick design moments that give scenes or tracks extra motion.",
    heroNote: "Built for editors, producers, and sound designers who want quick-impact accents rather than a giant unfocused FX library.",
    demoBlurb: "The demo gives a fast overview of the pack's design accents, transitions, and smaller cinematic punctuation points.",
    panels: [
      {
        title: "Why this library stays useful",
        body: "SFXS 2 is focused on accents and motion cues rather than trying to become a complete effects archive. That makes it quicker to browse when you need one sharp design move."
      },
      {
        title: "Inside the collection",
        items: [
          "Transition material for edits, intros, and scene movement.",
          "Short cinematic accents and punctuation points.",
          "A compact browsing experience instead of a sprawling FX dump."
        ]
      }
    ],
    secondaryUrl: "/learn/",
    secondaryLabel: "See workflow guides"
  },
  "noize-2-noise-textures": {
    headline: "NOIZE 2",
    description: "NOIZE 2 is an experimental noise and FX collection built for abstract layers, glitch detail, and texture shaping.",
    kicker: "Sample collection",
    lead: "Experimental noise textures and FX.",
    summary: "A library of abstract noise layers and glitch material for shaping movement, tension, and unstable detail.",
    heroNote: "A good fit when clean source material feels too polite and the track needs unstable texture or abstract edge.",
    demoBlurb: "The demo highlights the pack's abstract side: unstable noise layers, glitch detail, and broken motion.",
    panels: [
      {
        title: "Why it feels less polite",
        body: "NOIZE 2 is intentionally less stable than the atmosphere packs. It is built for abstract edge, broken detail, and noise material that can rough up a cleaner arrangement."
      },
      {
        title: "Inside the collection",
        items: [
          "Abstract noise layers and glitch textures.",
          "Broken movement for tension-building or sound design.",
          "Material that works as a layer rather than a traditional melodic element."
        ]
      }
    ],
    secondaryUrl: "/learn/",
    secondaryLabel: "See workflow guides"
  },
  "enigma-2-cinematic-atmospheres": {
    headline: "ENIGMA 2",
    description: "ENIGMA 2 is a cinematic atmosphere collection focused on dark tension beds and restrained mystery.",
    kicker: "Sample collection",
    lead: "Cinematic mysterious atmospheres.",
    summary: "A tension-focused sample pack for darker scenes, slow-building beds, and atmospheric ambiguity.",
    heroNote: "Designed for scenes and cues that need mystery, slower build, and tension that stays restrained rather than loud.",
    demoBlurb: "The demo stays close to the collection's intent: darker beds, slow suspense, and atmosphere with held-back motion.",
    panels: [
      {
        title: "Why it stays restrained",
        body: "ENIGMA 2 works best when you want tension without obvious impact sounds. The material is built to sit under a scene, hold ambiguity, and leave room for other elements."
      },
      {
        title: "Inside the collection",
        items: [
          "Dark suspense beds for slower scenes and cues.",
          "Atmospheric ambiguity without constant dramatic peaks.",
          "A useful middle ground between ambient texture and overt horror material."
        ]
      }
    ],
    secondaryUrl: "/learn/",
    secondaryLabel: "See workflow guides"
  },
  "bleeps-2-percussion-sounds": {
    headline: "BLEEPS 2",
    description: "BLEEPS 2 is an experimental percussion sample pack built for strange rhythm accents and synthetic percussive detail.",
    kicker: "Sample collection",
    lead: "Experimental percussion sounds.",
    summary: "A compact set of one-shots and odd percussive textures for sharper rhythmic movement and design accents.",
    heroNote: "Made for rhythm work that needs strange edges, unusual punctuation, and synthetic bite instead of standard drums.",
    panels: [
      {
        title: "Why it cuts through",
        body: "BLEEPS 2 is shaped around odd synthetic attacks and sharper percussive moments. It works best as a detail library for rhythmic punctuation rather than as a full drum toolkit."
      },
      {
        title: "Inside the collection",
        items: [
          "Odd one-shots and sharper synthetic percussion.",
          "Design accents for rhythm programming and transitions.",
          "A useful layer pack when standard percussion feels too familiar."
        ]
      }
    ],
    secondaryUrl: "/learn/",
    secondaryLabel: "See workflow guides"
  },
  "space-2-atmospheres-textures": {
    headline: "SPACE 2",
    description: "SPACE 2 is an atmosphere and texture library shaped for sci-fi ambience, distant environments, and suspended motion.",
    kicker: "Sample collection",
    lead: "Space-inspired atmospheres and textures.",
    summary: "A sample set for sci-fi space, distant environmental tone, and wide suspended ambience.",
    heroNote: "A stronger fit for wide, suspended environments and sci-fi atmosphere than for dense foreground sound design.",
    demoBlurb: "The demo focuses on the pack's suspended side: distant environments, wider ambience, and softer environmental motion.",
    panels: [
      {
        title: "Why it feels distant",
        body: "SPACE 2 is built for width and suspension. The material leans toward environmental atmosphere, sci-fi distance, and the kind of slow movement that helps a scene feel larger."
      },
      {
        title: "Inside the collection",
        items: [
          "Sci-fi environmental beds and distant textures.",
          "Wide ambience for suspended scene work.",
          "A cleaner atmospheric direction than the darker pressure-based packs."
        ]
      }
    ],
    secondaryUrl: "/learn/",
    secondaryLabel: "See workflow guides"
  },
  "tectonic-2-dark-subs-textures": {
    headline: "TECTONIC 2",
    description: "TECTONIC 2 is a dark subs and underground texture collection focused on low-end pressure and subterranean atmosphere.",
    kicker: "Sample collection",
    lead: "Dark subs and underground textures.",
    summary: "A lower-register texture pack built for pressure, underground movement, and cinematic heaviness.",
    heroNote: "Built for cues that need subterranean weight, low-end pressure, and darker understructure before melodic detail.",
    demoBlurb: "The demo leans into TECTONIC 2's core strength: pressure, subs, and heavier underground movement.",
    panels: [
      {
        title: "Why it carries pressure",
        body: "TECTONIC 2 puts the focus on lower-register force. The collection is designed to add weight, underground tension, and subs that can hold a cue together before anything melodic enters."
      },
      {
        title: "Inside the collection",
        items: [
          "Dark subs and low-register texture layers.",
          "Underground movement for heavier cinematic work.",
          "Material that helps build pressure without overcomplicating arrangement decisions."
        ]
      }
    ],
    secondaryUrl: "/posts/how-to-use-tectonic-2-for-low-end-pressure-2026-03-14.html",
    secondaryLabel: "Read the guide"
  },
  "horror-2-cinematic-textures": {
    headline: "HORROR 2",
    description: "HORROR 2 is a cinematic horror texture collection focused on stingers, uneasy drones, and darker atmosphere.",
    kicker: "Sample collection",
    lead: "Cinematic scary texture.",
    summary: "A horror-focused sample pack for drones, stingers, and uneasy sonic weight in darker scenes.",
    heroNote: "This collection works when a cue needs unease, stingers, and atmospheric threat rather than subtle ambience.",
    demoBlurb: "The demo emphasizes the horror side directly: uneasy drones, threat cues, and sharper darker gestures.",
    panels: [
      {
        title: "Why it feels threatening",
        body: "HORROR 2 is aimed at overt unease. The collection centers on darker threat textures, drones, and stingers that can shift a scene quickly without needing a large horror library."
      },
      {
        title: "Inside the collection",
        items: [
          "Uneasy drones and darker tension layers.",
          "Stingers and short threat cues for scene punctuation.",
          "A more direct horror angle than the suspense-focused atmosphere packs."
        ]
      }
    ],
    secondaryUrl: "/learn/",
    secondaryLabel: "See workflow guides"
  },
  "velvet-ruins-lite-vital-presets": {
    headline: "VELVET RUINS Lite",
    description: "VELVET RUINS Lite is a free Vital preset pack offering a lighter entry point into the worn-down atmosphere of the full release.",
    kicker: "Free release",
    lead: "Free presets for Vital.",
    summary: "A free set of darker experimental Vital presets that gives a quick entry point into the VELVET RUINS sound world.",
    heroNote: "A practical way to try the darker VELVET RUINS direction before moving to the full pack.",
    panels: [
      {
        title: "Why start here",
        body: "VELVET RUINS Lite is designed as a real entry point, not throwaway filler. It gives you a smaller but usable slice of the darker spectral direction behind the full release."
      },
      {
        title: "Inside the free pack",
        items: [
          "A compact Vital set with the VELVET RUINS mood intact.",
          "Good starting material for darker cinematic sketches.",
          "A direct bridge into the full pack if the sound world fits your work."
        ]
      }
    ],
    secondaryUrl: "/products/velvet-ruins-vital-presets",
    secondaryLabel: "See the full pack"
  },
  "black-arcology-lite-pigments-presets": {
    headline: "BLACK ARCOLOGY Lite",
    description: "BLACK ARCOLOGY Lite is a free 32-preset Pigments collection offering a compact entry point into the darker industrial tone of the full release.",
    kicker: "Free release",
    lead: "Free presets for Arturia Pigments.",
    summary: "A free 32-preset Pigments set built around industrial drones, evolving keys, melodic keys, and fractured FX that introduces the BLACK ARCOLOGY sound world without the full pack.",
    heroNote: "This is the compact entry point into the BLACK ARCOLOGY sound palette: dark, cinematic, industrial, and immediately usable enough to test before going deeper.",
    specs: [
      { label: "Format", value: "Arturia Pigments presets" },
      { label: "Included", value: "32 presets" },
      { label: "Best for", value: "Industrial drones, melodic keys, and fractured FX" }
    ],
    panels: [
      {
        title: "Why start here",
        body: "BLACK ARCOLOGY Lite is designed as a real, compact introduction to the darker cinematic world of BLACK ARCOLOGY. It gives you a usable slice of the full sound palette, from evolving drones and industrial textures to melodic keys and experimental FX, instead of acting like a throwaway teaser."
      },
      {
        title: "Inside the free pack",
        items: [
          "32 presets for Arturia Pigments.",
          "8 drones.",
          "8 industrial textures.",
          "8 melodic keys.",
          "8 FX and noise presets."
        ]
      },
      {
        title: "Sound palette",
        items: [
          "Dark evolving drones.",
          "Industrial and mechanical tones.",
          "Moody melodic keys.",
          "Broken and experimental FX textures."
        ]
      },
      {
        title: "Requirements and upgrade path",
        items: [
          "Arturia Pigments, latest version recommended.",
          "Built to be instantly usable, dark, atmospheric, and character-driven.",
          "The full BLACK ARCOLOGY release expands this to 128 presets with deeper variation and a broader toolkit."
        ]
      }
    ],
    secondaryUrl: "/products/black-arcology-pigments-presets",
    secondaryLabel: "Upgrade to the full pack"
  },
  "abyss-pro-53-presets": {
    headline: "ABYSS",
    description: "ABYSS is a free PRO-53 preset archive focused on dark ambient tone and earlier Kreativ Sound atmosphere work.",
    kicker: "Legacy archive",
    lead: "Free dark ambient presets for PRO-53.",
    summary: "A legacy free preset release that reflects an earlier atmospheric toolkit for darker ambient work.",
    heroNote: "Kept online as a usable archive snapshot from an earlier period of darker ambient preset work.",
    panels: [
      {
        title: "Why it still matters",
        body: "ABYSS sits closer to the early catalog history, but it still carries a clear atmospheric direction. It is worth treating as an archive toolset rather than a current flagship release."
      },
      {
        title: "Archive notes",
        items: [
          "An earlier PRO-53 preset release with darker ambient intent.",
          "Useful as a historical snapshot of older Kreativ Sound tone-shaping.",
          "Best approached as archive material rather than a new commercial centerpiece."
        ]
      }
    ],
    secondaryUrl: "/news/",
    secondaryLabel: "See latest updates"
  },
  "the-black-angel-refill": {
    headline: "The Black Angel",
    description: "The Black Angel is an archive-only Reason ReFill and the first product release in the Kreativ Sound catalog history.",
    kicker: "Archive-only first release",
    lead: "Reason ReFill archive.",
    summary: "An early archive release built around Prophet V material and classic Reason workflows. This entry remains here as part of the catalog history.",
    heroNote: "This is preserved as a first-release archive entry rather than a currently sold product.",
    panels: [
      {
        title: "Why it stays in the archive",
        body: "The Black Angel matters because it marks the starting point. It belongs on the site as catalog history first, and as a reference to earlier Reason-centered workflows second."
      },
      {
        title: "Archive notes",
        items: [
          "The first product release in the catalog timeline.",
          "Built around Prophet V material for classic Reason workflows.",
          "Preserved as an archive entry rather than an active storefront product."
        ]
      }
    ],
    secondaryUrl: "/",
    secondaryLabel: "Back to the archive"
  },
  "daft-plasticz-presets": {
    headline: "DAFT Plasticz",
    description: "DAFT Plasticz is a legacy preset archive focused on plastic, synthetic textures and older sound-design experiments.",
    kicker: "Legacy archive",
    lead: "Legacy plasticz presets.",
    summary: "An older preset archive kept online as part of the broader catalog history and earlier synthetic texture work.",
    heroNote: "Archived as an earlier synthetic-texture experiment with a brighter, more plastic tone than the darker main catalog.",
    panels: [
      {
        title: "Why it feels different",
        body: "DAFT Plasticz comes from an older and more synthetic direction than the current darker flagship work. That difference is part of why it remains useful as an archive reference."
      },
      {
        title: "Archive notes",
        items: [
          "Older plastic and synthetic preset textures.",
          "A brighter archive contrast to the darker current catalog tone.",
          "Best treated as historical flavor rather than a core release."
        ]
      }
    ],
    secondaryUrl: "/news/",
    secondaryLabel: "See latest updates"
  }
};

type LandingCopyOverride = Pick<ProductPage, "subtitle" | "shortMeta" | "longDescription" | "specifications" | "requirements"> &
  Partial<Pick<ProductPage, "ctaLine">>;

const landingCopyOverrides: Record<string, LandingCopyOverride> = {
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
};

function slugFromDetailsUrl(url?: string) {
  return url?.replace(/^\/products\//, "").replace(/\/$/, "") || "";
}

function productTitle(product: Product) {
  const [name] = product.title.split(" - ");
  return name;
}

function categoryKicker(category: ProductCategory) {
  switch (category) {
    case "Presets":
      return "Preset pack";
    case "Samples":
      return "Sample collection";
    case "Free":
      return "Free release";
    case "Legacy":
      return "Legacy archive";
  }
}

function productVariant(slug: string, category: ProductCategory): ProductPage["variant"] {
  if (
    slug === "black-arcology-pigments-presets" ||
    slug === "bioforms-synplant-2-presets" ||
    slug === "neolith-softube-models-presets" ||
    slug === "velvet-ruins-vital-presets"
  ) {
    return "flagship";
  }
  if (category === "Legacy") {
    return "archive";
  }
  if (category === "Free") {
    return "free";
  }
  return "standard";
}

function defaultDescription(product: Product, name: string) {
  switch (product.category) {
    case "Presets":
      return `${name} is a preset release from Kreativ Sound built for ${product.useCase.toLowerCase()}.`;
    case "Samples":
      return `${name} is a sample collection from Kreativ Sound built for ${product.useCase.toLowerCase()}.`;
    case "Free":
      return `${name} is a free release from Kreativ Sound built for ${product.useCase.toLowerCase()}.`;
    case "Legacy":
      return `${name} is a legacy archive release from Kreativ Sound shaped around ${product.useCase.toLowerCase()}.`;
  }
}

function defaultLead(product: Product) {
  return `${product.format} focused on ${product.useCase.toLowerCase()}.`;
}

function defaultSummary(product: Product, name: string) {
  switch (product.category) {
    case "Presets":
      return `${name} is built for producers who want ${product.useCase.toLowerCase()} with a more direct preset workflow.`;
    case "Samples":
      return `${name} gives you a focused sample set for ${product.useCase.toLowerCase()} without forcing a large library workflow.`;
    case "Free":
      return `${name} is a lighter free entry point for ${product.useCase.toLowerCase()}.`;
    case "Legacy":
      return `${name} stays in the archive as part of the earlier catalog and still reflects a useful direction for ${product.useCase.toLowerCase()}.`;
  }
}

function defaultHeroNote(product: Product, name: string) {
  switch (product.category) {
    case "Presets":
      return `${name} is built for musicians who want a faster preset starting point around ${product.useCase.toLowerCase()}.`;
    case "Samples":
      return `${name} is built for producers and sound designers who want a tighter sample set around ${product.useCase.toLowerCase()}.`;
    case "Free":
      return `${name} is a lighter free way into the broader sound world without committing to a full commercial pack first.`;
    case "Legacy":
      return `${name} remains online as catalog history first, and as a still-usable archive direction second.`;
  }
}

function defaultDemoBlurb(product: Product, name: string) {
  return `This demo gives a quick read on ${name}'s core direction: ${product.useCase.toLowerCase()}.`;
}

function defaultSpecs(product: Product) {
  return [
    { label: "Format", value: product.format },
    { label: "Collection", value: product.count },
    { label: "Best for", value: product.useCase }
  ];
}

function defaultShortMeta(product: Product) {
  return [product.count, product.format, product.useCase].filter(Boolean).join(" • ");
}

function defaultSpecifications(product: Product, specs: ProductPage["specs"]) {
  return [
    { label: "Product type", value: product.category === "Samples" ? "Sample collection" : product.category === "Free" ? "Free release" : product.category === "Legacy" ? "Legacy archive" : "Preset bank" },
    ...specs,
    { label: "Delivery", value: "Digital download" },
    { label: "Checkout", value: product.url ? "External checkout" : "See product notes" }
  ];
}

function uniqueText(values: Array<string | undefined>) {
  return [...new Set(values.map((value) => value?.trim()).filter(Boolean) as string[])];
}

function defaultLongDescription(product: Product, description: string, summary: string, heroNote: string) {
  return uniqueText([description, summary, heroNote]);
}

function defaultRequirements(product: Product, panels: ProductPage["panels"]) {
  const requirementPanel = panels.find((panel) => panel.title.toLowerCase().includes("requirement"));
  if (requirementPanel?.items?.length) {
    return requirementPanel.items;
  }

  if (product.category === "Presets") {
    return [
      `${product.format} support is required to use this release.`,
      "Use a DAW or host that can load the target instrument or preset format."
    ];
  }

  if (product.category === "Samples") {
    return [
      "Use any DAW, sampler, or audio editor that can import WAV audio.",
      "No specific synth plugin is required."
    ];
  }

  return ["See the product notes and linked checkout page for compatibility details."];
}

function defaultPanels(product: Product) {
  const formatLabel = product.category === "Samples" ? "Collection focus" : "Sound character";
  const getLabel = product.category === "Legacy" ? "Archive notes" : "What you get";

  return [
    {
      title: formatLabel,
      body: `${productTitle(product)} is built for ${product.useCase.toLowerCase()}. The release stays focused on one usable direction rather than spreading itself across too many unrelated sounds.`
    },
    {
      title: getLabel,
      items: [
        `${product.count} shaped in ${product.format.toLowerCase()} format.`,
        `A focused direction around ${product.useCase.toLowerCase()}.`,
        product.category === "Legacy" ? "Kept online as part of the broader Kreativ Sound archive." : "A faster path from browsing to actually using the material in a session."
      ]
    }
  ];
}

export const productPages: ProductPage[] = products
  .filter((product) => product.detailsUrl)
  .map((product) => {
    const slug = slugFromDetailsUrl(product.detailsUrl);
    const name = productTitle(product);
    const override = { ...(productOverrides[slug] || {}), ...(landingCopyOverrides[slug] || {}) };

    return {
      slug,
      title: override.title || `${name} | Kreativ Sound`,
      headline: override.headline || name,
      subtitle: override.subtitle || override.lead || defaultLead(product),
      description: override.description || defaultDescription(product, name),
      canonical: `https://kreativsound.com/products/${slug}`,
      ogImage: `https://kreativsound.com${product.coverImage || product.thumbnail || "/logo-128.svg"}`,
      ogImageAlt: override.ogImageAlt || `${name} product cover`,
      image: product.coverImage || product.thumbnail || "/logo-128.svg",
      imageAlt: override.imageAlt || `${name} cover`,
      kicker: override.kicker || categoryKicker(product.category),
      lead: override.lead || defaultLead(product),
      summary: override.summary || defaultSummary(product, name),
      variant: override.variant || productVariant(slug, product.category),
      primaryUrl: override.primaryUrl || product.url,
      primaryLabel: override.primaryLabel || (product.category === "Free" ? "Get free download" : product.url ? "Buy on Gumroad" : undefined),
      purchaseAltUrl: override.purchaseAltUrl,
      purchaseAltLabel: override.purchaseAltLabel,
      secondaryUrl: override.secondaryUrl || "/learn/",
      secondaryLabel: override.secondaryLabel || "See workflow guides",
      liteUrl: override.liteUrl,
      liteLabel: override.liteLabel,
      liteNote: override.liteNote,
      valueLine: override.valueLine,
      ctaLine: override.ctaLine,
      proofPoints: override.proofPoints,
      heroNote: override.heroNote || defaultHeroNote(product, name),
      demoBlurb: override.demoBlurb || (product.demo ? defaultDemoBlurb(product, name) : undefined),
      demoPlaceholder: override.demoPlaceholder || `Drop the ${name} demo file here next. This block is ready for an inline player.`,
      demo: product.demo,
      specs: override.specs || defaultSpecs(product),
      specifications: override.specifications || defaultSpecifications(product, override.specs || defaultSpecs(product)),
      requirements: override.requirements || defaultRequirements(product, override.panels || defaultPanels(product)),
      longDescription: override.longDescription || defaultLongDescription(product, override.description || defaultDescription(product, name), override.summary || defaultSummary(product, name), override.heroNote || defaultHeroNote(product, name)),
      panels: override.panels || defaultPanels(product),
      related: override.related || sharedRelatedByCategory[product.category]
    };
  });

import { products, type Product, type ProductCategory } from "./products";
import { landingCopyOverrides } from "./product-content";

export type ProductIncludedGroup = {
  title: string;
  items: Array<{ name: string; detail: string; url?: string }>;
};

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
  variant: "bundle" | "flagship" | "standard" | "free" | "archive";
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
  includedGroups: ProductIncludedGroup[];
  finalCtaTitle?: string;
  finalCtaText?: string;
  panels: Array<{ title: string; body?: string; items?: string[] }>;
  related: Array<{ label: string; url: string }>;
};

type ProductPageOverride = Partial<Omit<ProductPage, "slug" | "title" | "canonical" | "ogImage" | "image">> & {
  headline?: string;
};

const sharedRelatedByCategory: Record<ProductCategory, Array<{ label: string; url: string }>> = {
  Bundle: [
    { label: "Browse individual packs", url: "/sound/" },
    { label: "Read workflow guides", url: "/learn/" }
  ],
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
  "kreativ-kollection-v1": {
    title: "Kreativ Kollection V1 — Complete Kreativ Sound Preset & Sample Bundle",
    headline: "Kreativ Kollection V1",
    description: "Kreativ Kollection V1 is the complete Kreativ Sound bundle, collecting presets, samples, loops, textures, and experimental sound design packs for ambient, cinematic, electronic, and dark production.",
    kicker: "Flagship bundle"
  },
  "operators-fm8-presets": {
    headline: "OPERATORS",
    description: "OPERATORS is a 64-preset soundset for Native Instruments FM8, focused on atmospheric motion, digital textures, and frequency-driven synthesis.",
    kicker: "New preset pack",
    lead: "64 presets for Native Instruments FM8.",
    summary: "Digital FM material for pads, drones, basses, bells, leads, plucks, sweeps, strings, and FX.",
    heroNote: "Requires Native Instruments FM8. Delivered as a small preset download with PayPal and Gumroad checkout options.",
    valueLine: "64 FM8 presets | 4 MB download | PayPal or Gumroad",
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

function slugFromDetailsUrl(url?: string) {
  return url?.replace(/^\/products\//, "").replace(/\/$/, "") || "";
}

function productTitle(product: Product) {
  const [name] = product.title.split(" - ");
  return name;
}

function categoryKicker(category: ProductCategory) {
  switch (category) {
    case "Bundle":
      return "Flagship bundle";
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
  if (category === "Bundle") {
    return "bundle";
  }
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
    case "Bundle":
      return `${name} is a complete Kreativ Sound bundle built for ${product.useCase.toLowerCase()}.`;
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
    case "Bundle":
      return `${name} brings the current Kreativ Sound preset and sample catalog into one focused download.`;
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
    case "Bundle":
      return `${name} is the main entry point for producers who want the complete Kreativ Sound V1 sound-design palette in one place.`;
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
    { label: "Product type", value: product.category === "Bundle" ? "Complete sound bundle" : product.category === "Samples" ? "Sample collection" : product.category === "Free" ? "Free release" : product.category === "Legacy" ? "Legacy archive" : "Preset bank" },
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

  if (product.category === "Bundle") {
    return [
      "Preset banks require the matching synth or plugin listed in the included product notes.",
      "Audio samples, loops, drones, and textures can be used in any DAW or sampler that supports standard audio files."
    ];
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

function includedGroupTitle(product: Product) {
  if (product.category === "Samples") return "Samples / Audio Packs";
  if (product.category === "Free") return "Free / Legacy";
  if (product.category === "Legacy" && !product.format.toLowerCase().includes("preset")) return "Free / Legacy";
  return "Preset Banks";
}

function includedItemDetail(product: Product) {
  if (product.category === "Samples") return product.useCase.toLowerCase();
  return product.format;
}

function buildIncludedGroups(includedProducts?: string[]): ProductIncludedGroup[] {
  if (!includedProducts?.length) return [];

  const productBySlug = new Map(
    products
      .filter((product) => product.detailsUrl)
      .map((product) => [slugFromDetailsUrl(product.detailsUrl), product])
  );
  const groupMap = new Map<string, ProductIncludedGroup>();

  for (const slug of includedProducts) {
    const product = productBySlug.get(slug);
    if (!product) continue;

    const title = includedGroupTitle(product);
    const group = groupMap.get(title) || { title, items: [] };
    group.items.push({
      name: productTitle(product),
      detail: includedItemDetail(product),
      url: product.detailsUrl
    });
    groupMap.set(title, group);
  }

  return ["Preset Banks", "Samples / Audio Packs", "Free / Legacy"]
    .map((title) => groupMap.get(title))
    .filter(Boolean) as ProductIncludedGroup[];
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
      shortMeta: override.shortMeta || defaultShortMeta(product),
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
      includedGroups: override.includedGroups || buildIncludedGroups(override.includedProducts),
      finalCtaTitle: override.finalCtaTitle,
      finalCtaText: override.finalCtaText,
      panels: override.panels || defaultPanels(product),
      related: override.related || sharedRelatedByCategory[product.category]
    };
  });

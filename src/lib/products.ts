export type ProductCategory = "Bundle" | "Tools" | "Presets" | "Samples" | "Free" | "Legacy";

export type ProductDemo = {
  label: string;
  src: string;
  type?: string;
};

export type ProductAction = {
  label: string;
  url: string;
};

export type Product = {
  title: string;
  category: ProductCategory;
  url?: string;
  detailsUrl?: string;
  badge?: string;
  extraAction?: ProductAction;
  thumbnail?: string;
  coverImage?: string;
  format: string;
  count: string;
  useCase: string;
  demo?: ProductDemo;
};

export const products: Product[] = [
  {
    title: "Kreativ Kollection V1",
    category: "Bundle",
    detailsUrl: "/sounds/kreativ-kollection-v1",
    badge: "Coming soon",
    thumbnail: "/assets/thumbs/kreativ-kollection-v1.svg",
    coverImage: "/assets/thumbs/kreativ-kollection-v1.svg",
    format: "Preset and sample bundle",
    count: "V1 collection",
    useCase: "Complete Kreativ Sound preset, sample, loop, and texture collection"
  },
  {
    title: "Preset Mutator - Vital Preset Generator",
    category: "Tools",
    url: "https://kreativ.gumroad.com/l/preset-mutator-pro",
    detailsUrl: "/sounds/preset-mutator",
    badge: "Tool",
    extraAction: {
      label: "Open Free",
      url: "/apps/preset-mutator/ui/"
    },
    thumbnail: "/assets/thumbs/preset-mutator.svg",
    coverImage: "/assets/thumbs/preset-mutator.svg",
    format: "Browser tool",
    count: "Free + Pro",
    useCase: "Vital preset starts from scratch, preset mutation, and audio sources"
  },
  {
    title: "OPERATORS - Atmos & Motion for Native Instruments FM8",
    category: "Presets",
    url: "https://kreativ.gumroad.com/l/operators-fm8-sounds",
    detailsUrl: "/sounds/operators-fm8-presets",
    badge: "New",
    thumbnail: "/assets/thumbs/operators-fm8-thumb.webp",
    coverImage: "/assets/thumbs/operators-fm8.webp",
    format: "FM8 presets",
    count: "64 presets",
    useCase: "Atmospheric motion and digital FM textures"
  },
  {
    title: "BLACK ARCOLOGY - Industrial Presets for Pigments",
    category: "Presets",
    url: "https://kreativ.gumroad.com/l/black-arcology-industrial-presets-for-pigments",
    detailsUrl: "/sounds/black-arcology-pigments-presets",
    thumbnail: "/assets/thumbs/black-arcology-thumb.png",
    coverImage: "/assets/thumbs/black-arcology.webp",
    extraAction: {
      label: "Try Lite",
      url: "/sounds/black-arcology-lite-pigments-presets"
    },
    format: "Pigments presets",
    count: "128 presets",
    useCase: "Industrial pressure and machine tone"
  },
  {
    title: "VELVET RUINS - Presets for Vital spectral synth",
    category: "Presets",
    url: "https://kreativ.gumroad.com/l/velvet-ruins-vital-synth-presets?layout=profile",
    detailsUrl: "/sounds/velvet-ruins-vital-presets",
    thumbnail: "/assets/thumbs/velvet-ruins.jpg",
    extraAction: {
      label: "Try Lite",
      url: "/sounds/velvet-ruins-lite-vital-presets"
    },
    format: "Vital presets",
    count: "Full pack",
    useCase: "Dark melody and spectral motion"
  },
  {
    title: "NEOLITH - Presets for Softube Models",
    category: "Presets",
    url: "https://kreativ.gumroad.com/l/neolith-softube-models-presets?layout=profile",
    detailsUrl: "/sounds/neolith-softube-models-presets",
    thumbnail: "/assets/thumbs/neolith.jpg",
    format: "Softube Models presets",
    count: "Full pack",
    useCase: "Analog tension and cinematic weight"
  },
  {
    title: "BIOFORMS - Evolving Presets for Synplant 2",
    category: "Presets",
    url: "https://kreativ.gumroad.com/l/bioforms-synplant-2-presets?layout=profile",
    detailsUrl: "/sounds/bioforms-synplant-2-presets",
    thumbnail: "/assets/thumbs/bioforms.jpg",
    format: "Synplant 2 presets",
    count: "32+ patches",
    useCase: "Organic motion and ambient beds"
  },
  {
    title: "MONOLUSH - Presets for FabFilter One",
    category: "Presets",
    url: "https://kreativ.gumroad.com/l/monolush-fabfilter-one-presets?layout=profile",
    detailsUrl: "/sounds/monolush-fabfilter-one-presets",
    thumbnail: "/assets/thumbs/monolush.jpg",
    format: "FabFilter One presets",
    count: "132 patches",
    useCase: "Warm mono basses and leads"
  },
  {
    title: "DIRTY MODEL - Presets for Moog Model D",
    category: "Presets",
    url: "https://kreativ.gumroad.com/l/dirty-model?layout=profile",
    detailsUrl: "/sounds/dirty-model-moog-model-d-presets",
    thumbnail: "/assets/thumbs/dirty-model.jpg",
    format: "Moog Model D presets",
    count: "64 patches",
    useCase: "Driven basses and analog grit",
    demo: {
      label: "Listen to demo",
      src: "/assets/audio/dirty-model-d-demo-01.mp3",
      type: "audio/mpeg"
    }
  },
  {
    title: "ZEPHYR - Presets for Moog Animoog Z",
    category: "Presets",
    url: "https://kreativ.gumroad.com/l/zephy-animoog-z-presets?layout=profile",
    detailsUrl: "/sounds/zephyr-animoog-z-presets",
    thumbnail: "/assets/thumbs/zephyr.jpg",
    format: "Animoog Z presets",
    count: "96 patches",
    useCase: "Airy melodic movement",
    demo: {
      label: "Listen to demo",
      src: "/assets/audio/zephyr-demo-01.mp3",
      type: "audio/mpeg"
    }
  },
  {
    title: "SFXS 2 - Creative Sound Effects Collection",
    category: "Samples",
    url: "https://kreativ.gumroad.com/l/sfxs-sound-effects-library?layout=profile",
    detailsUrl: "/sounds/sfxs-2-sound-effects",
    thumbnail: "/assets/thumbs/sfxs-2.jpg",
    format: "WAV samples",
    count: "FX pack",
    useCase: "Cinematic accents and transitions",
    demo: {
      label: "Listen to demo",
      src: "/assets/audio/sfxs-2-demo-01.mp3",
      type: "audio/mpeg"
    }
  },
  {
    title: "NOIZE 2 - Experimental Noise Textures and FX",
    category: "Samples",
    url: "https://kreativ.gumroad.com/l/noize-oscillators?layout=profile",
    detailsUrl: "/sounds/noize-2-noise-textures",
    thumbnail: "/assets/thumbs/noize-2.jpg",
    format: "WAV samples",
    count: "Noise pack",
    useCase: "Abstract noise and glitch layers",
    demo: {
      label: "Listen to demo",
      src: "/assets/audio/noize-2-demo-01.mp3",
      type: "audio/mpeg"
    }
  },
  {
    title: "ENIGMA 2 - Cinematic Mysterious Atmospheres",
    category: "Samples",
    url: "https://kreativ.gumroad.com/l/enigma?layout=profile",
    detailsUrl: "/sounds/enigma-2-cinematic-atmospheres",
    thumbnail: "/assets/thumbs/enigma-2.jpg",
    format: "WAV samples",
    count: "Atmosphere pack",
    useCase: "Dark suspense beds",
    demo: {
      label: "Listen to demo",
      src: "/assets/audio/enigma-2-demo-01.mp3",
      type: "audio/mpeg"
    }
  },
  {
    title: "BLEEPS 2 - Experimental Percussion Sounds",
    category: "Samples",
    url: "https://kreativ.gumroad.com/l/bleeps-sharp-percussion-drum-samples?layout=profile",
    detailsUrl: "/sounds/bleeps-2-percussion-sounds",
    thumbnail: "/assets/thumbs/bleeps-2.jpg",
    format: "WAV samples",
    count: "Percussion pack",
    useCase: "Percussive one-shots and rhythmic FX"
  },
  {
    title: "SPACE 2 - Space Inspired Atmospheres and Textures",
    category: "Samples",
    url: "https://kreativ.gumroad.com/l/space-inspired-atmospheres-textures?layout=profile",
    detailsUrl: "/sounds/space-2-atmospheres-textures",
    thumbnail: "/assets/thumbs/space-2.jpg",
    format: "WAV samples",
    count: "Atmosphere pack",
    useCase: "Sci-fi ambience and distant environments",
    demo: {
      label: "Listen to demo",
      src: "/assets/audio/space-2-demo-01.mp3",
      type: "audio/mpeg"
    }
  },
  {
    title: "TECTONIC 2 - Dark Subs and Underground Textures",
    category: "Samples",
    url: "https://kreativ.gumroad.com/l/tectonic-underground-textures?layout=profile",
    detailsUrl: "/sounds/tectonic-2-dark-subs-textures",
    thumbnail: "/assets/thumbs/tectonic-2.jpg",
    format: "WAV samples",
    count: "Low-end pack",
    useCase: "Low-end pressure and subterranean textures",
    demo: {
      label: "Listen to demo",
      src: "/assets/audio/tectonic-2-demo-01.mp3",
      type: "audio/mpeg"
    }
  },
  {
    title: "HORROR 2 - Cinematic Scary Texture",
    category: "Samples",
    url: "https://kreativ.gumroad.com/l/horror-cinematic-scary-texture?layout=profile",
    detailsUrl: "/sounds/horror-2-cinematic-textures",
    thumbnail: "/assets/thumbs/horror-2.jpg",
    format: "WAV samples",
    count: "Horror pack",
    useCase: "Horror stingers and uneasy drones",
    demo: {
      label: "Listen to demo",
      src: "/assets/audio/horror-2-demo-01.mp3",
      type: "audio/mpeg"
    }
  },
  {
    title: "VELVET RUINS Lite - Free presets for Vital",
    category: "Free",
    url: "https://kreativ.gumroad.com/l/velvet-ruins-demo-presets-for-vital?layout=profile",
    detailsUrl: "/sounds/velvet-ruins-lite-vital-presets",
    badge: "New",
    thumbnail: "/assets/thumbs/velvet-ruins-lite.jpg",
    format: "Vital presets",
    count: "20 presets",
    useCase: "Free dark Vital presets"
  },
  {
    title: "BLACK ARCOLOGY Lite - Free presets for Pigments",
    category: "Free",
    url: "https://kreativ.gumroad.com/l/black-arcology-lite",
    detailsUrl: "/sounds/black-arcology-lite-pigments-presets",
    badge: "New",
    thumbnail: "/assets/thumbs/black-arcology-lite-thumb.png",
    coverImage: "/assets/thumbs/black-arcology-lite.webp",
    format: "Pigments presets",
    count: "32 presets",
    useCase: "Free industrial drones and fractured FX for Pigments"
  },
  {
    title: "ABYSS - Free Dark Ambient Presets for PRO-53",
    category: "Legacy",
    url: "https://kreativ.gumroad.com/l/abyss-dark-ambient-presets-for-pro-53?layout=profile",
    detailsUrl: "/sounds/abyss-pro-53-presets",
    thumbnail: "/assets/thumbs/abyss.jpg",
    format: "PRO-53 presets",
    count: "215 sounds",
    useCase: "Free dark ambient toolkit"
  },
  {
    title: "The Black Angel - ReFill",
    category: "Legacy",
    detailsUrl: "/sounds/the-black-angel-refill",
    badge: "Archive",
    thumbnail: "/assets/thumbs/the-black-angel.jpg",
    format: "Reason ReFill",
    count: "101 NNXT + 102 REX2",
    useCase: "Archive built around classic Prophet V material"
  },
  {
    title: "DAFT Plasticz Presets",
    category: "Legacy",
    url: "https://kreativ.gumroad.com/l/daft-free-plasticz-presets?layout=profile",
    detailsUrl: "/sounds/daft-plasticz-presets",
    thumbnail: "/assets/thumbs/daft-plasticz.jpg",
    format: "Legacy presets",
    count: "Archive",
    useCase: "Legacy plastic and synthetic textures"
  }
];

export const preferredCategoryOrder: ProductCategory[] = ["Bundle", "Tools", "Presets", "Free", "Samples", "Legacy"];

export const categoryLabels: Record<ProductCategory, string> = {
  Bundle: "Flagship Bundle",
  Tools: "Creative Tools",
  Presets: "Preset Packs",
  Samples: "Sample Packs",
  Free: "Free Packs",
  Legacy: "Legacy Archive"
};

export const categoryIds: Record<ProductCategory, string> = {
  Bundle: "catalog-bundle",
  Tools: "catalog-tools",
  Presets: "catalog-presets",
  Samples: "catalog-samples",
  Free: "catalog-free",
  Legacy: "catalog-legacy"
};

export type ProductCategory = "Presets" | "Samples" | "Free" | "Legacy";

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
    title: "BIOFORMS - Evolving Presets for Synplant 2",
    category: "Presets",
    url: "https://kreativ.gumroad.com/l/bioforms-synplant-2-presets?layout=profile",
    detailsUrl: "/products/bioforms/",
    thumbnail: "/assets/thumbs/bioforms.jpg",
    format: "Presets",
    count: "32+ patches",
    useCase: "Organic evolving tones and ambient beds"
  },
  {
    title: "MONOLUSH - Presets for FabFilter One",
    category: "Presets",
    url: "https://kreativ.gumroad.com/l/monolush-fabfilter-one-presets?layout=profile",
    detailsUrl: "/products/monolush/",
    thumbnail: "/assets/thumbs/monolush.jpg",
    format: "Presets",
    count: "132 patches",
    useCase: "Warm mono synth textures"
  },
  {
    title: "DIRTY MODEL - Presets for Moog Model D",
    category: "Presets",
    url: "https://kreativ.gumroad.com/l/dirty-model?layout=profile",
    detailsUrl: "/products/dirty-model/",
    thumbnail: "/assets/thumbs/dirty-model.jpg",
    format: "Presets",
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
    detailsUrl: "/products/zephyr/",
    thumbnail: "/assets/thumbs/zephyr.jpg",
    format: "Presets",
    count: "96 patches",
    useCase: "Airy motion-driven melodic layers",
    demo: {
      label: "Listen to demo",
      src: "/assets/audio/zephyr-demo-01.mp3",
      type: "audio/mpeg"
    }
  },
  {
    title: "NEOLITH - Presets for Softube Models",
    category: "Presets",
    url: "https://kreativ.gumroad.com/l/neolith-softube-models-presets?layout=profile",
    detailsUrl: "/products/neolith/",
    thumbnail: "/assets/thumbs/neolith.jpg",
    format: "Presets",
    count: "Collection",
    useCase: "Analog-forward textures and cinematic synth tone shaping"
  },
  {
    title: "VELVET RUINS - Presets for Vital spectral synth",
    category: "Presets",
    url: "https://kreativ.gumroad.com/l/velvet-ruins-vital-synth-presets?layout=profile",
    detailsUrl: "/products/velvet-ruins/",
    badge: "New",
    extraAction: {
      label: "Lite Free",
      url: "/assets/downloads/velvet-ruins-lite.zip"
    },
    thumbnail: "/assets/thumbs/velvet-ruins.jpg",
    format: "Presets",
    count: "Collection",
    useCase: "Worn-down cinematic synth textures and dark melodic atmosphere"
  },
  {
    title: "BLACK ARCOLOGY - Industrial Presets for Pigments",
    category: "Presets",
    url: "https://kreativ.gumroad.com/l/black-arcology-industrial-presets-for-pigments",
    detailsUrl: "/products/black-arcology/",
    badge: "New",
    thumbnail: "/assets/thumbs/black-arcology-thumb.png",
    coverImage: "/assets/thumbs/black-arcology.png",
    format: "Presets",
    count: "Collection",
    useCase: "Industrial pressure, darker machine tone, and cinematic synthetic weight"
  },
  {
    title: "SFXS 2 - Creative Sound Effects Collection",
    category: "Samples",
    url: "https://kreativ.gumroad.com/l/sfxs-sound-effects-library?layout=profile",
    detailsUrl: "/products/sfxs-2/",
    thumbnail: "/assets/thumbs/sfxs-2.jpg",
    format: "WAV samples",
    count: "Collection",
    useCase: "Design accents and cinematic transitions",
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
    detailsUrl: "/products/noize-2/",
    thumbnail: "/assets/thumbs/noize-2.jpg",
    format: "WAV samples",
    count: "Collection",
    useCase: "Abstract noise layers and glitches",
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
    detailsUrl: "/products/enigma-2/",
    thumbnail: "/assets/thumbs/enigma-2.jpg",
    format: "WAV samples",
    count: "Collection",
    useCase: "Dark tension beds for film scenes",
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
    detailsUrl: "/products/bleeps-2/",
    thumbnail: "/assets/thumbs/bleeps-2.jpg",
    format: "WAV samples",
    count: "Collection",
    useCase: "Percussive one-shots and rhythmic FX"
  },
  {
    title: "SPACE 2 - Space Inspired Atmospheres and Textures",
    category: "Samples",
    url: "https://kreativ.gumroad.com/l/space-inspired-atmospheres-textures?layout=profile",
    detailsUrl: "/products/space-2/",
    thumbnail: "/assets/thumbs/space-2.jpg",
    format: "WAV samples",
    count: "Collection",
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
    detailsUrl: "/products/tectonic-2/",
    thumbnail: "/assets/thumbs/tectonic-2.jpg",
    format: "WAV samples",
    count: "Collection",
    useCase: "Low-end pressure and subterranean atmospheres",
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
    detailsUrl: "/products/horror-2/",
    thumbnail: "/assets/thumbs/horror-2.jpg",
    format: "WAV samples",
    count: "Collection",
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
    detailsUrl: "/products/velvet-ruins-lite/",
    badge: "New",
    thumbnail: "/assets/thumbs/velvet-ruins-lite.jpg",
    format: "Presets",
    count: "20 presets",
    useCase: "Free dark experimental Vital presets"
  },
  {
    title: "BLACK ARCOLOGY Lite - Free presets for Pigments",
    category: "Free",
    url: "https://kreativ.gumroad.com/l/black-arcology-lite",
    detailsUrl: "/products/black-arcology-lite/",
    badge: "New",
    thumbnail: "/assets/thumbs/black-arcology-lite-thumb.png",
    coverImage: "/assets/thumbs/black-arcology-lite.png",
    format: "Presets",
    count: "Free pack",
    useCase: "Free industrial drones, evolving keys, and fractured FX for Pigments"
  },
  {
    title: "ABYSS - Free Dark Ambient Presets for PRO-53",
    category: "Legacy",
    url: "https://kreativ.gumroad.com/l/abyss-dark-ambient-presets-for-pro-53?layout=profile",
    detailsUrl: "/products/abyss/",
    thumbnail: "/assets/thumbs/abyss.jpg",
    format: "Presets",
    count: "215 sounds",
    useCase: "Free atmospheric toolkit for dark ambient work"
  },
  {
    title: "The Black Angel - ReFill",
    category: "Legacy",
    detailsUrl: "/products/the-black-angel/",
    badge: "Archive",
    thumbnail: "/assets/thumbs/the-black-angel.jpg",
    format: "Reason ReFill",
    count: "101 NNXT + 102 REX2",
    useCase: "First release archive built around Prophet V material for classic Reason workflows"
  },
  {
    title: "DAFT Plasticz Presets",
    category: "Legacy",
    url: "https://kreativ.gumroad.com/l/daft-free-plasticz-presets?layout=profile",
    detailsUrl: "/products/daft-plasticz/",
    badge: "New",
    thumbnail: "/assets/thumbs/daft-plasticz.jpg",
    format: "Presets",
    count: "Archive",
    useCase: "Legacy plastic and synthetic preset textures"
  }
];

export const preferredCategoryOrder: ProductCategory[] = ["Presets", "Samples", "Free", "Legacy"];

export const categoryLabels: Record<ProductCategory, string> = {
  Presets: "Preset Packs",
  Samples: "Sample Packs",
  Free: "Free Sounds",
  Legacy: "Legacy Archive"
};

export const categoryIds: Record<ProductCategory, string> = {
  Presets: "catalog-presets",
  Samples: "catalog-samples",
  Free: "catalog-free",
  Legacy: "catalog-legacy"
};

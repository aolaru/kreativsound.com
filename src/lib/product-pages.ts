import { products, type Product, type ProductCategory } from "./products";

export type ProductPage = {
  slug: string;
  title: string;
  headline: string;
  description: string;
  canonical: string;
  ogImage: string;
  ogImageAlt: string;
  image: string;
  imageAlt: string;
  kicker: string;
  lead: string;
  summary: string;
  primaryUrl: string;
  secondaryUrl: string;
  secondaryLabel: string;
  demoPlaceholder?: string;
  demo?: { label: string; src: string; type?: string };
  specs: Array<{ label: string; value: string }>;
  panels: Array<{ title: string; body?: string; items?: string[] }>;
  related: Array<{ label: string; url: string }>;
};

type ProductPageOverride = Partial<Omit<ProductPage, "slug" | "title" | "canonical" | "primaryUrl" | "ogImage" | "image">> & {
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
  bioforms: {
    title: "BIOFORMS | Kreativ Sound",
    headline: "BIOFORMS",
    description: "BIOFORMS is a Synplant 2 preset pack focused on evolving motion, organic tone, and atmospheric movement.",
    kicker: "Flagship preset pack",
    lead: "Evolving presets for Synplant 2.",
    summary: "A preset collection built for organic motion, slow harmonic change, and atmospheric layers that feel alive without turning busy.",
    secondaryUrl: "/posts/how-to-layer-bioforms-for-organic-motion-2026-03-14.html",
    secondaryLabel: "Hear it in context",
    demoPlaceholder: "Drop the BIOFORMS demo file here next. This block is ready for an inline player.",
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
  neolith: {
    title: "NEOLITH | Kreativ Sound",
    headline: "NEOLITH",
    description: "NEOLITH is a preset pack for Softube Models built around analog-forward tone, cinematic tension, and textured synth weight.",
    kicker: "Flagship preset pack",
    lead: "Presets for Softube Models.",
    summary: "An analog-forward preset set shaped for cinematic tension, heavy synth tone, and motion that feels deliberate rather than overdesigned.",
    secondaryUrl: "/posts/three-ways-to-use-neolith-for-cinematic-tension-2026-03-14.html",
    secondaryLabel: "Hear it in context",
    demoPlaceholder: "Drop the NEOLITH demo file here next. This block is ready for an inline player.",
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
  "velvet-ruins": {
    title: "VELVET RUINS | Kreativ Sound",
    headline: "VELVET RUINS",
    description: "VELVET RUINS is a Vital preset pack focused on worn-down cinematic texture, dark melody, and spectral motion.",
    kicker: "Flagship preset pack",
    lead: "Presets for Vital spectral synth.",
    summary: "A dark Vital preset set built for spectral movement, worn melodic tone, and cinematic atmosphere that feels aged without turning muddy.",
    secondaryUrl: "/posts/velvet-ruins-release-2026-03-21.html",
    secondaryLabel: "Hear it in context",
    demoPlaceholder: "Drop the VELVET RUINS demo file here next. This block is ready for an inline player.",
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
  monolush: {
    headline: "MONOLUSH",
    description: "MONOLUSH is a FabFilter One preset pack shaped around warm mono synth tone and direct melodic usefulness.",
    kicker: "Preset pack",
    lead: "Presets for FabFilter One.",
    summary: "A direct mono-synth preset set for warm basses, focused leads, and simple tonal layers that fit quickly into a track.",
    secondaryUrl: "/learn/",
    secondaryLabel: "See workflow guides"
  },
  "dirty-model": {
    headline: "DIRTY MODEL",
    description: "DIRTY MODEL is a Moog Model D preset pack focused on driven basses, analog grit, and darker low-end tone.",
    kicker: "Preset pack",
    lead: "Presets for Moog Model D.",
    summary: "A heavier analog preset set for bass, grit, and low-register movement when a track needs pressure without losing definition.",
    secondaryUrl: "/learn/",
    secondaryLabel: "See workflow guides"
  },
  zephyr: {
    headline: "ZEPHYR",
    description: "ZEPHYR is a preset pack for Moog Animoog Z built for airy movement, melodic motion, and layered atmosphere.",
    kicker: "Preset pack",
    lead: "Presets for Moog Animoog Z.",
    summary: "A motion-led preset collection for melodic layers, lighter harmonic drift, and airier synth movement.",
    secondaryUrl: "/learn/",
    secondaryLabel: "See workflow guides"
  },
  "sfxs-2": {
    headline: "SFXS 2",
    description: "SFXS 2 is a sound-effects collection focused on creative accents, cinematic transitions, and design detail.",
    kicker: "Sample collection",
    lead: "Creative sound effects collection.",
    summary: "A focused sample pack for transitions, accents, and quick design moments that give scenes or tracks extra motion.",
    secondaryUrl: "/learn/",
    secondaryLabel: "See workflow guides"
  },
  "noize-2": {
    headline: "NOIZE 2",
    description: "NOIZE 2 is an experimental noise and FX collection built for abstract layers, glitch detail, and texture shaping.",
    kicker: "Sample collection",
    lead: "Experimental noise textures and FX.",
    summary: "A library of abstract noise layers and glitch material for shaping movement, tension, and unstable detail.",
    secondaryUrl: "/learn/",
    secondaryLabel: "See workflow guides"
  },
  "enigma-2": {
    headline: "ENIGMA 2",
    description: "ENIGMA 2 is a cinematic atmosphere collection focused on dark tension beds and restrained mystery.",
    kicker: "Sample collection",
    lead: "Cinematic mysterious atmospheres.",
    summary: "A tension-focused sample pack for darker scenes, slow-building beds, and atmospheric ambiguity.",
    secondaryUrl: "/learn/",
    secondaryLabel: "See workflow guides"
  },
  "bleeps-2": {
    headline: "BLEEPS 2",
    description: "BLEEPS 2 is an experimental percussion sample pack built for strange rhythm accents and synthetic percussive detail.",
    kicker: "Sample collection",
    lead: "Experimental percussion sounds.",
    summary: "A compact set of one-shots and odd percussive textures for sharper rhythmic movement and design accents.",
    secondaryUrl: "/learn/",
    secondaryLabel: "See workflow guides"
  },
  "space-2": {
    headline: "SPACE 2",
    description: "SPACE 2 is an atmosphere and texture library shaped for sci-fi ambience, distant environments, and suspended motion.",
    kicker: "Sample collection",
    lead: "Space-inspired atmospheres and textures.",
    summary: "A sample set for sci-fi space, distant environmental tone, and wide suspended ambience.",
    secondaryUrl: "/learn/",
    secondaryLabel: "See workflow guides"
  },
  "tectonic-2": {
    headline: "TECTONIC 2",
    description: "TECTONIC 2 is a dark subs and underground texture collection focused on low-end pressure and subterranean atmosphere.",
    kicker: "Sample collection",
    lead: "Dark subs and underground textures.",
    summary: "A lower-register texture pack built for pressure, underground movement, and cinematic heaviness.",
    secondaryUrl: "/posts/how-to-use-tectonic-2-for-low-end-pressure-2026-03-14.html",
    secondaryLabel: "Read the guide"
  },
  "horror-2": {
    headline: "HORROR 2",
    description: "HORROR 2 is a cinematic horror texture collection focused on stingers, uneasy drones, and darker atmosphere.",
    kicker: "Sample collection",
    lead: "Cinematic scary texture.",
    summary: "A horror-focused sample pack for drones, stingers, and uneasy sonic weight in darker scenes.",
    secondaryUrl: "/learn/",
    secondaryLabel: "See workflow guides"
  },
  "velvet-ruins-lite": {
    headline: "VELVET RUINS Lite",
    description: "VELVET RUINS Lite is a free Vital preset pack offering a lighter entry point into the worn-down atmosphere of the full release.",
    kicker: "Free release",
    lead: "Free presets for Vital.",
    summary: "A free set of darker experimental Vital presets that gives a quick entry point into the VELVET RUINS sound world.",
    secondaryUrl: "/products/velvet-ruins/",
    secondaryLabel: "See the full pack"
  },
  abyss: {
    headline: "ABYSS",
    description: "ABYSS is a free PRO-53 preset archive focused on dark ambient tone and earlier Kreativ Sound atmosphere work.",
    kicker: "Legacy archive",
    lead: "Free dark ambient presets for PRO-53.",
    summary: "A legacy free preset release that reflects an earlier atmospheric toolkit for darker ambient work.",
    secondaryUrl: "/news/",
    secondaryLabel: "See latest updates"
  },
  "the-black-angel": {
    headline: "The Black Angel",
    description: "The Black Angel is an archive-only Reason ReFill and the first product release in the Kreativ Sound catalog history.",
    kicker: "Archive-only first release",
    lead: "Reason ReFill archive.",
    summary: "An early archive release built around Prophet V material and classic Reason workflows. This entry remains here as part of the catalog history.",
    secondaryUrl: "/",
    secondaryLabel: "Back to the archive"
  },
  "daft-plasticz": {
    headline: "DAFT Plasticz",
    description: "DAFT Plasticz is a legacy preset archive focused on plastic, synthetic textures and older sound-design experiments.",
    kicker: "Legacy archive",
    lead: "Legacy plasticz presets.",
    summary: "An older preset archive kept online as part of the broader catalog history and earlier synthetic texture work.",
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

function defaultSpecs(product: Product) {
  return [
    { label: "Format", value: product.format },
    { label: "Collection", value: product.count },
    { label: "Best for", value: product.useCase }
  ];
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
    const override = productOverrides[slug] || {};

    return {
      slug,
      title: override.title || `${name} | Kreativ Sound`,
      headline: override.headline || name,
      description: override.description || defaultDescription(product, name),
      canonical: `https://kreativsound.com/products/${slug}/`,
      ogImage: `https://kreativsound.com${product.thumbnail || "/logo-128.svg"}`,
      ogImageAlt: override.ogImageAlt || `${name} product cover`,
      image: product.thumbnail || "/logo-128.svg",
      imageAlt: override.imageAlt || `${name} cover`,
      kicker: override.kicker || categoryKicker(product.category),
      lead: override.lead || defaultLead(product),
      summary: override.summary || defaultSummary(product, name),
      primaryUrl: product.url || "/",
      secondaryUrl: override.secondaryUrl || "/learn/",
      secondaryLabel: override.secondaryLabel || "See workflow guides",
      demoPlaceholder: override.demoPlaceholder || `Drop the ${name} demo file here next. This block is ready for an inline player.`,
      demo: product.demo,
      specs: override.specs || defaultSpecs(product),
      panels: override.panels || defaultPanels(product),
      related: override.related || sharedRelatedByCategory[product.category]
    };
  });

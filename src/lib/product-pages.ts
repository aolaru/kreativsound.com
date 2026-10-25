import { products, type Product, type ProductCategory } from "./products";
import { landingCopyOverrides, type ProductLandingCopy } from "./product-content";
import { productInstallations, type ProductInstallation } from "./product-installation";

export type ProductIncludedGroup = {
  title: string;
  items: Array<{ name: string; detail: string; url?: string }>;
};

export type ProductLiteComparison = {
  title: string;
  intro: string;
  liteLabel: string;
  fullLabel: string;
  rows: Array<{ label: string; lite: string; full: string }>;
  upgradeUrl: string;
  upgradeLabel: string;
  secondaryUrl?: string;
  secondaryLabel?: string;
  note?: string;
};

export type ProductRelatedItem = {
  title: string;
  url: string;
  image: string;
  imageAlt: string;
  meta: string;
  category: ProductCategory;
};

export type ProductPage = {
  slug: string;
  route: string;
  hubLabel: "Sounds" | "Plugins";
  hubUrl: "/sounds/" | "/plugins/";
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
  variant: "bundle" | "flagship" | "standard" | "free" | "archive";
  primaryUrl?: string;
  primaryLabel?: string;
  purchaseAltUrl?: string;
  purchaseAltLabel?: string;
  previewUrl?: string;
  previewLabel?: string;
  secondaryUrl?: string;
  secondaryLabel?: string;
  shortMeta?: string;
  price?: string;
  priceAmount?: number;
  priceCurrency?: string;
  priceValidUntil?: string;
  ctaLine?: string;
  demoBlurb?: string;
  demo?: { label: string; src: string; type?: string };
  specifications: Array<{ label: string; value: string }>;
  requirements: string[];
  installation?: ProductInstallation;
  longDescription: string[];
  includedGroups: ProductIncludedGroup[];
  relatedProducts: ProductRelatedItem[];
  liteComparison?: ProductLiteComparison;
  finalCtaTitle?: string;
  finalCtaText?: string;
};

type ProductPageOverride = Partial<Pick<
  ProductPage,
  | "title"
  | "headline"
  | "description"
  | "kicker"
  | "variant"
  | "primaryUrl"
  | "primaryLabel"
  | "purchaseAltUrl"
  | "purchaseAltLabel"
  | "secondaryUrl"
  | "secondaryLabel"
>>;

const productPageOverrides: Record<string, ProductPageOverride> = {
  "bioforms-synplant-2-presets": {
    headline: "BIOFORMS 2",
    description: "128 evolving Synplant 2 presets across seven categories for organic motion, cinematic atmospheres, and experimental textures. Includes all 32 Lite sounds.",
    kicker: "Synplant 2 preset bank"
  },
  "bioforms-lite-synplant-2-presets": {
    headline: "BIOFORMS Lite",
    description: "32 free Synplant 2 presets selected from BIOFORMS 2 Full: basses, drones, FX, keys, multis, pads, and vocals. Preset list, installation readme, and license included.",
    kicker: "Free Synplant 2 preset bank"
  },
  "obsidian-serum-2-presets": {
    headline: "OBSIDIAN",
    description: "128 dark cinematic Serum 2 presets, including all 32 Lite sounds plus 96 more. Tested with Serum 2.1.5; named macros, preset list, and installation guide included.",
    kicker: "Serum 2 preset bank"
  },
  "obsidian-lite-serum-2-presets": {
    headline: "OBSIDIAN Lite",
    description: "32 free dark cinematic Serum 2 presets from the full OBSIDIAN bank, with named macros and an installation guide. Tested with Serum 2.1.5.",
    kicker: "Free Serum 2 preset bank"
  },
  "analog-drift-mini-v-presets": {
    headline: "ANALOG DRIFT",
    description: "256 experimental vintage presets per Arturia Mini V2, V3, or V4 edition, with native banks, installation notes, and transparent compatibility caveats.",
    kicker: "Mini V preset collection"
  },
  "analog-drift-lite-mini-v-presets": {
    headline: "ANALOG DRIFT Lite",
    description: "32 free Arturia Mini V presets per V2, V3, or V4 edition: eight basses, sequences, pads, and effects, with native banks and compatibility notes.",
    kicker: "Free Mini V preset collection"
  },
  "burnshaper": {
    title: "KS BurnShaper | Creative Multiband Distortion",
    headline: "KS BurnShaper",
    description: "KS BurnShaper is a three-band distortion effect with editable A/B waveshaping curves, six character modes, Afterburn, and 144 factory presets.",
    kicker: "Multiband distortion plugin",
    variant: "flagship",
    primaryUrl: "https://kreativ.gumroad.com/l/ks-burnshaper",
    primaryLabel: "Buy on Gumroad"
  },
  "ghostform": {
    title: "KS Ghostform | Free Drone & String Synth",
    headline: "KS Ghostform",
    description: "KS Ghostform is a free evolving drone and string synthesizer with 144 factory presets for cinematic beds, deep drones, and textured ambient sound design.",
    kicker: "Free synthesizer plugin",
    variant: "flagship",
    primaryUrl: "https://kreativ.gumroad.com/l/ks-ghostform",
    primaryLabel: "Download Free"
  },
  "kreativ-kollection-v1": {
    title: "Kreativ Kollection V1 | Preset & Sample Bundle",
    headline: "Kreativ Kollection V1",
    description: "Kreativ Kollection V1: 932+ presets across 9 synth banks and 147 WAV samples in 7 packs for ambient, cinematic, industrial, and experimental production.",
    kicker: "16-product flagship bundle",
    primaryUrl: "https://kreativ.gumroad.com/l/kreativ-kollection-v1",
    primaryLabel: "Get the bundle on Gumroad",
    variant: "bundle"
  },
  "preset-mutator": {
    title: "Preset Mutator Free | Synth Preset Generator",
    headline: "Preset Mutator Free",
    description: "Create three local preset variants for Vital, Serum 2 beta, or Arturia Pigments beta from scratch ideas, existing presets, or short audio sources.",
    kicker: "Free browser tool",
    secondaryUrl: "/preset-mutator/",
    secondaryLabel: "Open Preset Mutator Free",
    variant: "flagship"
  },
  "juno-nocturnes-jun-6-v-presets": {
    headline: "JUNO NOCTURNES",
    description: "Juno Nocturnes is a 96-preset Arturia JUN-6 V bank for dark ambient pads, drones, sequences, basses, leads, keys, and FX.",
    kicker: "JUN-6 V preset pack"
  },
  "callisto-drift-jup-8-v4-presets": {
    headline: "Callisto Drift",
    description: "128 Arturia Jup-8 V4 presets for dark ambient, cinematic scoring, and experimental electronic production. Includes a .jup4x bank and PDF catalogue for €9.",
    kicker: "New Jup-8 V4 preset bank"
  },
  "callisto-drift-lite-jup-8-v4-presets": {
    headline: "Callisto Drift Lite",
    description: "32 free Arturia Jup-8 V4 presets: cold pads, dark sequences, basses, leads, FX, keys, and a synthetic choir. Includes a .jup4x bank and PDF catalogue.",
    kicker: "Free Jup-8 V4 preset bank"
  },
  "daft-plasticz-presets": {
    headline: "DAFT",
    description: "102 free legacy presets for reFX PlastiCZ, with lo-fi tones, digital artifacts, and ambient textures. Requires a compatible PlastiCZ setup.",
    primaryLabel: "Download Free"
  },
  "juno-nocturnes-lite-jun-6-v-presets": {
    headline: "Juno Nocturnes Lite",
    description: "Juno Nocturnes Lite is a free 16-preset Arturia JUN-6 V preview bank drawn from the full Juno Nocturnes release.",
    kicker: "Free JUN-6 V preset bank"
  },
  "operators-fm8-presets": {
    headline: "OPERATORS",
    description: "OPERATORS is a 64-preset soundset for Native Instruments FM8, focused on atmospheric motion, digital textures, and frequency-driven synthesis.",
    kicker: "FM8 preset pack"
  },
  "operators-lite-fm8-presets": {
    headline: "OPERATORS Lite",
    description: "OPERATORS Lite is a free 16-preset Native Instruments FM8 bank focused on cold digital motion, metallic textures, and atmospheric sound design.",
    kicker: "Free FM8 preset bank"
  },
  "velvet-ruins-vital-presets": {
    headline: "VELVET RUINS 2",
    description: "VELVET RUINS 2 is a 256-preset Vital bank for dark ambient, cinematic, industrial, experimental electronic, horror, game audio, and soundtrack work.",
    kicker: "256-preset Vital bank"
  },
  "velvet-ruins-lite-vital-presets": {
    headline: "VELVET RUINS Lite",
    description: "VELVET RUINS Lite is a free 32-preset Vital bank of cinematic experiments, dark sequences, drones, pads, SFX, and textures.",
    kicker: "Free 32-preset Vital bank"
  },
  "black-arcology-pigments-presets": {
    headline: "BLACK ARCOLOGY",
    description: "BLACK ARCOLOGY is a dark cinematic Arturia Pigments preset collection built for industrial pressure, evolving tension, and character-driven synthetic tone.",
    kicker: "Flagship preset pack"
  }
};

const liteComparisons: Record<string, ProductLiteComparison> = {
  "bioforms-lite-synplant-2-presets": {
    title: "BIOFORMS Lite vs BIOFORMS 2",
    intro: "Try all seven categories free. Full includes these 32 sounds plus 96 more.",
    liteLabel: "Lite",
    fullLabel: "BIOFORMS 2 Full",
    rows: [
      { label: "Included", lite: "32 selected presets", full: "128 unique presets, including all Lite sounds" },
      { label: "Categories", lite: "4 basses, 4 drones, 6 FX, 4 keys, 5 multis, 5 pads, 4 vocals", full: "15 basses, 15 drones, 22 FX, 14 keys, 29 multis, 22 pads, 11 vocals" },
      { label: "Price", lite: "Free; optional contributions", full: "€9" }
    ],
    upgradeUrl: "https://kreativ.gumroad.com/l/bioforms-synplant-2-presets",
    upgradeLabel: "Get BIOFORMS 2 Full",
    secondaryUrl: "/sounds/bioforms-synplant-2-presets",
    secondaryLabel: "View full details",
    note: "Lite is a subset. Owning both gives you 128 unique sounds, not 160. Both editions require Synplant 2; Synplant 1 is not supported."
  },
  "obsidian-lite-serum-2-presets": {
    title: "OBSIDIAN Lite vs Full",
    intro: "Try 32 sounds free. Full includes those same sounds plus 96 more.",
    liteLabel: "Lite",
    fullLabel: "OBSIDIAN Full",
    rows: [
      { label: "Included", lite: "32 presets", full: "128 unique presets, including all Lite sounds" },
      { label: "Requirements", lite: "Serum 2; tested with 2.1.5", full: "Serum 2; tested with 2.1.5" },
      { label: "Price", lite: "Free; optional contributions", full: "€9" }
    ],
    upgradeUrl: "https://kreativ.gumroad.com/l/obsidian-serum-2-presets",
    upgradeLabel: "Get OBSIDIAN Full",
    secondaryUrl: "/sounds/obsidian-serum-2-presets",
    secondaryLabel: "View full details",
    note: "Lite is a subset. Owning both editions gives you 128 unique sounds, not 160. Serum 1 is not supported."
  },
  "analog-drift-lite-mini-v-presets": {
    title: "ANALOG DRIFT Lite vs Full",
    intro: "Choose the edition for the Mini V version you own. All Lite sounds are included in Full.",
    liteLabel: "Lite",
    fullLabel: "ANALOG DRIFT Full",
    rows: [
      { label: "Included", lite: "32 presets per edition", full: "256 presets per edition" },
      { label: "Versions", lite: "Mini V2, V3, and V4 banks", full: "Mini V2, V3, and V4 banks" },
      { label: "Price", lite: "Free; optional contributions", full: "€9" }
    ],
    upgradeUrl: "https://kreativ.gumroad.com/l/analog-drift-mini-v-presets",
    upgradeLabel: "Get ANALOG DRIFT Full",
    secondaryUrl: "/sounds/analog-drift-mini-v-presets",
    secondaryLabel: "View full details",
    note: "These are instrument-specific editions of one collection, not additional unique sounds. Read the compatibility caveats below before downloading."
  },
  "callisto-drift-lite-jup-8-v4-presets": {
    title: "Callisto Drift Lite vs Full",
    intro: "Try every core category free. The full bank gives you four times the presets and deeper category coverage.",
    liteLabel: "Lite",
    fullLabel: "Full Callisto Drift",
    rows: [
      { label: "Included", lite: "32 presets", full: "128 presets" },
      { label: "Pads / sequences", lite: "12 pads (6 wild), 8 sequences", full: "47 pads (16 wild), 43 sequences" },
      { label: "Other sounds", lite: "4 basses, 4 leads, 2 FX, 1 key, 1 choir", full: "15 basses, 16 leads, 5 FX, 1 key, 1 choir" },
      { label: "Price", lite: "Free", full: "€9" }
    ],
    upgradeUrl: "https://kreativ.gumroad.com/l/callisto-drift-jup-8-v4-presets",
    upgradeLabel: "Get full Callisto Drift",
    secondaryUrl: "/sounds/callisto-drift-jup-8-v4-presets",
    secondaryLabel: "View full details",
    note: "Both editions require Arturia Jup-8 V4 and include a native .jup4x bank and PDF preset catalogue."
  },
  "juno-nocturnes-lite-jun-6-v-presets": {
    title: "Juno Nocturnes Lite vs Full",
    intro: "Juno Nocturnes Lite is the free entry point. The full bank expands the same Arturia JUN-6 V direction into a larger dark ambient preset palette.",
    liteLabel: "Lite",
    fullLabel: "Full Juno Nocturnes",
    rows: [
      { label: "Included", lite: "16 selected JUN-6 V presets", full: "96 JUN-6 V presets" },
      { label: "Palette", lite: "Pads, drones, sequences, basses, leads, keys, and FX in a compact preview", full: "32 Pads, 16 Drones, 13 Sequences, 8 Bass, 9 Leads, 9 Keys, and 9 FX" },
      { label: "Best use", lite: "Test the nocturnal JUN-6 V tone in a session", full: "Build a broader dark ambient and cinematic palette around JUN-6 V" }
    ],
    upgradeUrl: "https://kreativ.gumroad.com/l/juno-nocturnes",
    upgradeLabel: "Upgrade to full Juno Nocturnes",
    secondaryUrl: "/sounds/juno-nocturnes-jun-6-v-presets",
    secondaryLabel: "View full details",
    note: "If the Lite bank fits your session, the full release keeps the same JUN-6 V mood and gives you six times the preset count."
  },
  "operators-lite-fm8-presets": {
    title: "OPERATORS Lite vs Full",
    intro: "OPERATORS Lite is the free entry point. The full bank expands the same FM8 direction into a larger preset set for complete tracks and cues.",
    liteLabel: "Lite",
    fullLabel: "Full OPERATORS",
    rows: [
      { label: "Included", lite: "16 selected FM8 presets", full: "64 FM8 presets" },
      { label: "Palette", lite: "Cold digital motion, metallic detail, and dark atmosphere", full: "Pads, drones, basses, bells, plucks, leads, sweeps, strings, and FX" },
      { label: "Best use", lite: "Test the FM8 tone or add a few focused colors", full: "Build a wider FM8 palette across a full track or score cue" }
    ],
    upgradeUrl: "https://kreativ.gumroad.com/l/operators-fm8-sounds",
    upgradeLabel: "Upgrade to full OPERATORS",
    secondaryUrl: "/sounds/operators-fm8-presets",
    secondaryLabel: "View full details",
    note: "If the Lite bank fits your session, the full release keeps the same FM8 character and gives you four times the preset count."
  },
  "velvet-ruins-lite-vital-presets": {
    title: "VELVET RUINS Lite vs VELVET RUINS 2",
    intro: "VELVET RUINS Lite gives you 32 selected sounds from the same dark cinematic palette. VELVET RUINS 2 expands it into a complete 256-preset collection.",
    liteLabel: "Lite",
    fullLabel: "VELVET RUINS 2",
    rows: [
      { label: "Included", lite: "32 Vital presets", full: "256 Vital presets" },
      { label: "Palette", lite: "Cinematic experiments, dark sequences, drones, pads, SFX, and textures", full: "Adds basses, ritual keys and plucks, experimental drums, and deeper coverage across every Lite category" },
      { label: "Best use", lite: "Try the palette or add a focused set of dark Vital sounds", full: "Build complete tracks, scores, and sound-design palettes with eight times the presets" }
    ],
    upgradeUrl: "https://kreativ.gumroad.com/l/velvet-ruins-vital-synth-presets?layout=profile",
    upgradeLabel: "Upgrade to VELVET RUINS 2",
    secondaryUrl: "/sounds/velvet-ruins-vital-presets",
    secondaryLabel: "View full details",
    note: "Every Lite and full-edition preset includes ATMOS, MOTION, DUST, and SPACE performance macros."
  },
  "black-arcology-lite-pigments-presets": {
    title: "BLACK ARCOLOGY Lite vs Full",
    intro: "BLACK ARCOLOGY Lite is the free Pigments sampler. The full release expands the same industrial palette into a 128-preset collection.",
    liteLabel: "Lite",
    fullLabel: "Full BLACK ARCOLOGY",
    rows: [
      { label: "Included", lite: "32 Pigments presets", full: "128 Pigments presets" },
      { label: "Palette", lite: "Industrial drones, melodic keys, textures, and FX/noise presets", full: "Deeper coverage across drones, industrial textures, melodic keys, FX, and noise material" },
      { label: "Best use", lite: "Test the Pigments direction in a session", full: "Build a larger dark industrial palette with more variation per category" }
    ],
    upgradeUrl: "https://kreativ.gumroad.com/l/black-arcology-industrial-presets-for-pigments",
    upgradeLabel: "Upgrade to full BLACK ARCOLOGY",
    secondaryUrl: "/sounds/black-arcology-pigments-presets",
    secondaryLabel: "View full details",
    note: "If the Lite version has the right pressure and tone, the full collection gives you four times the presets."
  }
};

const copyBySlug = landingCopyOverrides as Record<string, ProductLandingCopy>;

function slugFromDetailsUrl(url?: string) {
  return url?.replace(/^\/+|\/+$/g, "").split("/").at(-1) || "";
}

function productTitle(product: Product) {
  const [name] = product.title.split(" - ");
  return name;
}

function categoryKicker(category: ProductCategory) {
  switch (category) {
    case "Bundle":
      return "Flagship bundle";
    case "Tools":
      return "Creative tool";
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
  if (category === "Bundle") return "bundle";
  if (category === "Legacy") return "archive";
  if (category === "Free") return "free";

  const flagshipSlugs = new Set([
    "black-arcology-pigments-presets",
    "bioforms-synplant-2-presets",
    "neolith-softube-models-presets",
    "velvet-ruins-vital-presets"
  ]);

  return flagshipSlugs.has(slug) ? "flagship" : "standard";
}

function defaultDescription(product: Product, name: string) {
  const categoryLabel: Record<ProductCategory, string> = {
    Bundle: "a Kreativ Sound bundle",
    Tools: "a Kreativ Sound browser tool",
    Presets: "a Kreativ Sound preset bank",
    Samples: "a Kreativ Sound sample collection",
    Free: "a free Kreativ Sound release",
    Legacy: "a Kreativ Sound archive release"
  };
  const details = product.category === "Legacy"
    ? "format, requirements, and availability notes"
    : product.status === "free"
      ? "format, requirements, and download details"
      : "format, requirements, and checkout details";
  return `${name} is ${categoryLabel[product.category]} for ${product.useCase.toLowerCase()}. Review ${details}.`;
}

function defaultSubtitle(product: Product) {
  return `${product.format} focused on ${product.useCase.toLowerCase()}.`;
}

function defaultShortMeta(product: Product) {
  return [product.count, product.format, product.useCase].filter(Boolean).join(" - ");
}

function defaultSpecifications(product: Product) {
  return [
    { label: "Product type", value: productTypeLabel(product.category) },
    { label: "Format", value: product.format },
    { label: "Included", value: product.count },
    { label: "Best for", value: product.useCase },
    { label: "Delivery", value: "Digital download" },
    { label: "Checkout", value: product.url ? "Gumroad" : "See product notes" }
  ];
}

function productTypeLabel(category: ProductCategory) {
  switch (category) {
    case "Bundle":
      return "Complete sound bundle";
    case "Tools":
      return "Browser sound-design tool";
    case "Samples":
      return "Sample collection";
    case "Free":
      return "Free release";
    case "Legacy":
      return "Legacy archive";
    case "Presets":
      return "Preset bank";
  }
}

function defaultRequirements(product: Product) {
  if (product.category === "Bundle") {
    return [
      "Preset banks require the matching synth or plugin listed in the included product notes.",
      "Audio samples, loops, drones, and textures can be used in any DAW or sampler that supports standard audio files."
    ];
  }

  if (product.category === "Tools") {
    return [
      "A modern web browser is required to run this tool.",
      "Use the target synth or plugin to load generated presets where applicable."
    ];
  }

  if (product.category === "Samples") {
    return [
      "Use any DAW, sampler, or audio editor that can import WAV audio.",
      "No specific synth plugin is required."
    ];
  }

  if (product.category === "Presets" || product.category === "Free" || product.category === "Legacy") {
    return [
      `${product.format} support is required to use this release.`,
      "Use a DAW or host that can load the target instrument or preset format."
    ];
  }
}

function defaultLongDescription(product: Product, name: string, description: string) {
  return [
    description,
    `${name} focuses on ${product.useCase.toLowerCase()}.`
  ];
}

function primaryLabel(product: Product) {
  if (!product.url) return undefined;
  if (product.status === "free") return "Download Free";
  if (product.status === "archive") return "Open Archive";
  if (product.category === "Tools") return "Buy on Gumroad";
  return "Buy on Gumroad";
}

function demoBlurb(product: Product, name: string) {
  if (!product.demo) return undefined;
  return `A quick listen to ${name}'s core direction: ${product.useCase.toLowerCase()}.`;
}

function includedGroupTitle(product: Product) {
  if (product.category === "Samples") return "Samples / Audio Packs";
  if (product.category === "Free" || product.category === "Legacy") return "Free / Legacy";
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

function buildRelatedProducts(current: Product): ProductRelatedItem[] {
  const candidates = products.filter((candidate) =>
    candidate.detailsUrl && candidate.detailsUrl !== current.detailsUrl
  );

  function relationScore(candidate: Product) {
    const isCounterpart =
      current.extraAction?.url === candidate.detailsUrl ||
      candidate.extraAction?.url === current.detailsUrl;
    if (isCounterpart) return 0;
    if (candidate.format === current.format) return 1;
    if (candidate.category === current.category) return 2;
    if (candidate.featuredRank) return 3;
    return 4;
  }

  return candidates
    .sort((a, b) =>
      relationScore(a) - relationScore(b) ||
      (a.featuredRank ?? 999) - (b.featuredRank ?? 999) ||
      productTitle(a).localeCompare(productTitle(b))
    )
    .slice(0, 3)
    .map((product) => ({
      title: productTitle(product),
      url: product.detailsUrl as string,
      image: product.thumbnail || product.coverImage || "/logo-128.svg",
      imageAlt: `${productTitle(product)} cover`,
      meta: [product.count, product.format].filter(Boolean).join(" | "),
      category: product.category
    }));
}

export const productPages: ProductPage[] = products
  .filter((product) => product.detailsUrl)
  .map((product) => {
    const route = product.detailsUrl as string;
    const slug = slugFromDetailsUrl(route);
    const isPlugin = route.startsWith("/plugins/");
    const name = productTitle(product);
    const copy = copyBySlug[slug];
    const override = productPageOverrides[slug] || {};
    const description = override.description || defaultDescription(product, name);

    return {
      slug,
      route,
      hubLabel: isPlugin ? "Plugins" : "Sounds",
      hubUrl: isPlugin ? "/plugins/" : "/sounds/",
      title: override.title || `${name} | Kreativ Sound`,
      headline: override.headline || name,
      subtitle: copy?.subtitle || defaultSubtitle(product),
      description,
      canonical: `https://kreativsound.com${route}`,
      ogImage: `https://kreativsound.com${product.coverImage || product.thumbnail || "/logo-128.svg"}`,
      ogImageAlt: `${name} product cover`,
      image: product.coverImage || product.thumbnail || "/logo-128.svg",
      imageAlt: `${name} cover`,
      kicker: override.kicker || categoryKicker(product.category),
      variant: override.variant || productVariant(slug, product.category),
      primaryUrl: override.primaryUrl || product.url,
      primaryLabel: override.primaryLabel || primaryLabel(product),
      purchaseAltUrl: override.purchaseAltUrl,
      purchaseAltLabel: override.purchaseAltLabel,
      previewUrl: product.category === "Presets" ? product.extraAction?.url : undefined,
      previewLabel: product.category === "Presets" && product.extraAction?.url ? "Try Lite free" : undefined,
      secondaryUrl: override.secondaryUrl || product.appUrl,
      secondaryLabel: override.secondaryLabel || (product.appUrl ? "Open Preset Mutator Free" : undefined),
      shortMeta: copy?.shortMeta || defaultShortMeta(product),
      price: product.price,
      priceAmount: product.priceAmount,
      priceCurrency: product.priceCurrency,
      priceValidUntil: product.priceValidUntil,
      ctaLine: copy?.ctaLine,
      demoBlurb: demoBlurb(product, name),
      demo: product.demo,
      specifications: copy?.specifications || defaultSpecifications(product),
      requirements: copy?.requirements || defaultRequirements(product),
      installation: productInstallations[slug],
      longDescription: copy?.longDescription || defaultLongDescription(product, name, description),
      includedGroups: buildIncludedGroups(copy?.includedProducts),
      relatedProducts: buildRelatedProducts(product),
      liteComparison: liteComparisons[slug],
      finalCtaTitle: copy?.finalCtaTitle,
      finalCtaText: copy?.finalCtaText
    };
  });

import { products, type Product, type ProductCategory } from "./products";
import { landingCopyOverrides, type ProductLandingCopy } from "./product-content";

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
  variant: "bundle" | "flagship" | "standard" | "free" | "archive";
  primaryUrl?: string;
  primaryLabel?: string;
  purchaseAltUrl?: string;
  purchaseAltLabel?: string;
  secondaryUrl?: string;
  secondaryLabel?: string;
  shortMeta?: string;
  price?: string;
  priceAmount?: number;
  priceCurrency?: string;
  ctaLine?: string;
  demoBlurb?: string;
  demo?: { label: string; src: string; type?: string };
  specifications: Array<{ label: string; value: string }>;
  requirements: string[];
  longDescription: string[];
  includedGroups: ProductIncludedGroup[];
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
  "kreativ-kollection-v1": {
    title: "Kreativ Kollection V1 - Complete Kreativ Sound Preset & Sample Bundle",
    headline: "Kreativ Kollection V1",
    description: "Kreativ Kollection V1 is the complete Kreativ Sound bundle, collecting presets, samples, loops, textures, and experimental sound design packs for ambient, cinematic, electronic, and dark production.",
    kicker: "Flagship bundle"
  },
  "preset-mutator": {
    title: "Preset Mutator | Vital Preset Generator",
    headline: "Preset Mutator",
    description: "Preset Mutator is a browser-based Vital preset generator for creating preset starts from scratch ideas, existing presets, or short audio sources.",
    kicker: "Browser tool",
    primaryUrl: "https://kreativ.gumroad.com/l/preset-mutator",
    primaryLabel: "Buy on Gumroad",
    purchaseAltUrl: "https://www.paypal.com/ncp/payment/RUGQ6S3NW7HE4",
    purchaseAltLabel: "Pay with PayPal",
    secondaryUrl: "/apps/preset-mutator/ui/",
    secondaryLabel: "Open Preset Mutator",
    variant: "flagship"
  },
  "operators-fm8-presets": {
    headline: "OPERATORS",
    description: "OPERATORS is a 64-preset soundset for Native Instruments FM8, focused on atmospheric motion, digital textures, and frequency-driven synthesis.",
    kicker: "New preset pack",
    purchaseAltUrl: "https://www.paypal.com/ncp/payment/TS44NMWAGW2DL",
    purchaseAltLabel: "Pay with PayPal"
  },
  "black-arcology-pigments-presets": {
    headline: "BLACK ARCOLOGY",
    description: "BLACK ARCOLOGY is a dark cinematic Arturia Pigments preset collection built for industrial pressure, evolving tension, and character-driven synthetic tone.",
    kicker: "Flagship preset pack",
    purchaseAltUrl: "https://www.paypal.com/ncp/payment/MUN23XJLKABU8",
    purchaseAltLabel: "Pay with PayPal"
  }
};

const copyBySlug = landingCopyOverrides as Record<string, ProductLandingCopy>;

function slugFromDetailsUrl(url?: string) {
  return url?.replace(/^\/(?:products|sounds)\//, "").replace(/\/$/, "") || "";
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
  const categoryLabel = product.category === "Tools" ? "browser tool" : product.category.toLowerCase();
  return `${name} is a Kreativ Sound ${categoryLabel} built for ${product.useCase.toLowerCase()}.`;
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
    `${name} stays focused on ${product.useCase.toLowerCase()} without turning into a broad, unfocused library.`
  ];
}

function primaryLabel(product: Product) {
  if (!product.url) return undefined;
  if (product.category === "Free") return "Download Free";
  if (product.category === "Legacy") return "Open Archive";
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

export const productPages: ProductPage[] = products
  .filter((product) => product.detailsUrl)
  .map((product) => {
    const slug = slugFromDetailsUrl(product.detailsUrl);
    const name = productTitle(product);
    const copy = copyBySlug[slug];
    const override = productPageOverrides[slug] || {};
    const description = override.description || defaultDescription(product, name);

    return {
      slug,
      title: override.title || `${name} | Kreativ Sound`,
      headline: override.headline || name,
      subtitle: copy?.subtitle || defaultSubtitle(product),
      description,
      canonical: `https://kreativsound.com/sounds/${slug}`,
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
      secondaryUrl: override.secondaryUrl,
      secondaryLabel: override.secondaryLabel,
      shortMeta: copy?.shortMeta || defaultShortMeta(product),
      price: product.price,
      priceAmount: product.priceAmount,
      priceCurrency: product.priceCurrency,
      ctaLine: copy?.ctaLine,
      demoBlurb: demoBlurb(product, name),
      demo: product.demo,
      specifications: copy?.specifications || defaultSpecifications(product),
      requirements: copy?.requirements || defaultRequirements(product),
      longDescription: copy?.longDescription || defaultLongDescription(product, name, description),
      includedGroups: buildIncludedGroups(copy?.includedProducts),
      finalCtaTitle: copy?.finalCtaTitle,
      finalCtaText: copy?.finalCtaText
    };
  });

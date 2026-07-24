import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { musicArtists } from "../lib/music";
import { productPages } from "../lib/product-pages";

type SearchEntry = {
  title: string;
  url: string;
  type: string;
  thumbnail: string;
  description: string;
};

function localImage(url?: string) {
  if (!url) return "/logo-128.svg";

  try {
    const parsed = new URL(url);
    if (parsed.origin === "https://kreativsound.com") {
      return parsed.pathname;
    }
    return url;
  } catch {
    return url;
  }
}

function articleUrl(id: string) {
  return `/posts/${id.replace(/\.md$/, "")}.html`;
}

function musicReleaseUrl(artistSlug: string, title: string) {
  const releaseSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return `/music/#${artistSlug}-${releaseSlug}`;
}

const staticEntries: SearchEntry[] = [
  {
    title: "Kreativ Sound",
    url: "/",
    type: "Page",
    thumbnail: "/assets/home/operators-fm8-480.webp",
    description: "Latest Kreativ Sound releases and flagship products for darker electronic, ambient, cinematic, and experimental production."
  },
  {
    title: "Browse Sound",
    url: "/sounds/",
    type: "Page",
    thumbnail: "/assets/thumbs/operators-fm8-thumb.webp",
    description: "Preset packs, sample packs, free Lite banks, and legacy archive releases from Kreativ Sound."
  },
  {
    title: "Tools",
    url: "/tools/",
    type: "Page",
    thumbnail: "/preset-mutator/preset-mutator-mark.svg",
    description: "Browser tools for local-first preset generation and audio wave preparation."
  },
  {
    title: "Preset Mutator",
    url: "/preset-mutator/",
    type: "Tool",
    thumbnail: "/preset-mutator/preset-mutator-mark.svg",
    description: "Create Vital preset starts from scratch ideas, existing presets, or one short audio source."
  },
  {
    title: "Preset Mutator Product Details",
    url: "/tools/preset-mutator/",
    type: "Tool",
    thumbnail: "/preset-mutator/preset-mutator-mark.svg",
    description: "Free mode creates 3 Vital starts. Pro unlocks 32-preset batches and ZIP export."
  },
  {
    title: "Audio to Preset",
    url: "/preset-mutator/audio/",
    type: "Tool",
    thumbnail: "/preset-mutator/preset-mutator-mark.svg",
    description: "Analyze one short source sound locally and export Vital preset variants."
  },
  {
    title: "Mutate Preset",
    url: "/preset-mutator/mutate/",
    type: "Tool",
    thumbnail: "/preset-mutator/preset-mutator-mark.svg",
    description: "Load one Vital preset and create related playable variants in the browser."
  },
  {
    title: "Wave Mutator",
    url: "/tools/wave-mutator/",
    type: "Tool",
    thumbnail: "/assets/thumbs/wave-mutator.jpg",
    description: "Clean messy WAV files, export sample packs, and build short preview montages locally."
  },
  {
    title: "Music",
    url: "/music/",
    type: "Page",
    thumbnail: "/assets/music/olaru-memories.jpg",
    description: "Olaru releases built from the same dark ambient and cinematic sound palette."
  },
  {
    title: "News",
    url: "/news/",
    type: "Page",
    thumbnail: "/assets/thumbs/juno-nocturnes.webp",
    description: "Release news, practical guides, and selected tool updates from Kreativ Sound."
  },
  {
    title: "About",
    url: "/about/",
    type: "Page",
    thumbnail: "/logo-128.svg",
    description: "About Kreativ Sound, an independent sound design project for atmospheric presets and textures."
  },
  {
    title: "Contact",
    url: "/contact/",
    type: "Page",
    thumbnail: "/logo-128.svg",
    description: "Support, licensing, collaboration, and direct contact details for Kreativ Sound."
  },
  {
    title: "Privacy Policy",
    url: "/privacy/",
    type: "Policy",
    thumbnail: "/logo-128.svg",
    description: "Analytics preferences, local browser data, purchases, contact details, and browser tool privacy."
  },
  {
    title: "Terms of Use",
    url: "/terms/",
    type: "Policy",
    thumbnail: "/logo-128.svg",
    description: "Terms for the Kreativ Sound website, digital products, downloads, and browser tools."
  },
  {
    title: "Refund Policy",
    url: "/refunds/",
    type: "Policy",
    thumbnail: "/logo-128.svg",
    description: "Refund and support policy for Kreativ Sound digital products."
  },
  {
    title: "Product License",
    url: "/license/",
    type: "Policy",
    thumbnail: "/logo-128.svg",
    description: "Usage license for Kreativ Sound presets, samples, sound packs, and browser tool exports."
  }
];

export const GET: APIRoute = async () => {
  const posts = await getCollection("posts", ({ data }) => !data.draft);
  const productEntries: SearchEntry[] = productPages.map((product) => ({
    title: product.title.replace(" | Kreativ Sound", ""),
    url: `/sounds/${product.slug}`,
    type: product.variant === "bundle" ? "Bundle" : product.variant === "archive" ? "Archive" : "Product",
    thumbnail: product.image,
    description: product.description
  }));
  const musicEntries: SearchEntry[] = musicArtists.flatMap((artist) =>
    artist.releases.map((release) => ({
      title: release.title,
      url: musicReleaseUrl(artist.slug, release.title),
      type: `${release.type} by ${artist.name}`,
      thumbnail: release.image,
      description: [
        release.summary,
        release.mood?.length ? `Mood: ${release.mood.join(", ")}.` : "",
        `Listen to ${artist.name} on Bandcamp.`
      ].filter(Boolean).join(" ")
    }))
  );
  const postEntries: SearchEntry[] = posts
    .sort((a, b) => (b.data.published || "").localeCompare(a.data.published || ""))
    .map((post) => ({
      title: post.data.title,
      url: articleUrl(post.id),
      type: post.data.section === "learn" ? "Guide" : "Article",
      thumbnail: localImage(post.data.ogImage),
      description: post.data.description
    }));

  const seen = new Set<string>();
  const entries = [...staticEntries, ...productEntries, ...musicEntries, ...postEntries].filter((entry) => {
    if (seen.has(entry.url)) return false;
    seen.add(entry.url);
    return true;
  });

  return new Response(JSON.stringify(entries, null, 2), {
    headers: {
      "content-type": "application/json; charset=utf-8"
    }
  });
};

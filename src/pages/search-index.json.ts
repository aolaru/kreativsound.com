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
    title: "Plugins",
    url: "/plugins/",
    type: "Page",
    thumbnail: "/assets/thumbs/ghostform.png",
    description: "Kreativ Sound instrument and effect plugins, starting with KS Ghostform."
  },
  {
    title: "Preset Mutator Free",
    url: "/preset-mutator/",
    type: "Tool",
    thumbnail: "/preset-mutator/preset-mutator-mark.svg",
    description: "Create three local preset variants for Vital, Serum 2 beta, or Arturia Pigments beta from scratch ideas, existing presets, or short audio."
  },
  {
    title: "Preset Mutator Pro",
    url: "/preset-mutator-pro/",
    type: "Tool",
    thumbnail: "/preset-mutator-pro/preset-mutator-mark.svg",
    description: "Activate with a Gumroad license key, generate 32 variants for Vital or Serum 2 beta, and export ZIP preset packs. Pigments is not included in Pro."
  },
  {
    title: "Preset Mutator Free Changelog",
    url: "/preset-mutator/changelog/",
    type: "Tool",
    thumbnail: "/preset-mutator/preset-mutator-mark.svg",
    description: "A concise public record of Preset Mutator Free improvements, fixes, and release versions."
  },
  {
    title: "Preset Mutator Pro Changelog",
    url: "/preset-mutator-pro/changelog/",
    type: "Tool",
    thumbnail: "/preset-mutator-pro/preset-mutator-mark.svg",
    description: "A concise public record of Preset Mutator Pro improvements, fixes, and release versions."
  },
  {
    title: "Preset Mutator Free Product Details",
    url: "/tools/preset-mutator/",
    type: "Tool",
    thumbnail: "/preset-mutator/preset-mutator-mark.svg",
    description: "Free exports 3 presets for Vital, Serum 2 beta, and Pigments beta. Pro exports 32-variant ZIP packs for Vital and Serum 2 beta. Includes activation instructions."
  },
  {
    title: "Audio to Preset",
    url: "/preset-mutator/audio/",
    type: "Tool",
    thumbnail: "/preset-mutator/preset-mutator-mark.svg",
    description: "Analyze one short sound locally and export presets for Vital, Serum 2 beta, or Pigments beta."
  },
  {
    title: "Mutate Preset",
    url: "/preset-mutator/mutate/",
    type: "Tool",
    thumbnail: "/preset-mutator/preset-mutator-mark.svg",
    description: "Load a Vital, Serum 2 beta, or Pigments beta preset and create related variants locally."
  },
  {
    title: "Wave Mutator Lite",
    url: "/tools/wave-mutator/",
    type: "Tool",
    thumbnail: "/assets/thumbs/wave-mutator.jpg",
    description: "Free local tool to clean messy WAV files, export sample packs, and build short preview montages."
  },
  {
    title: "Wave Mutator Lite Changelog",
    url: "/tools/wave-mutator/changelog/",
    type: "Tool",
    thumbnail: "/assets/thumbs/wave-mutator.jpg",
    description: "A concise public record of Wave Mutator Lite beta releases, delivery-profile improvements, and current scope limits."
  },
  {
    title: "Pattern Mutator Lite",
    url: "/tools/pattern-mutator/",
    type: "Tool",
    thumbnail: "/assets/thumbs/preset-mutator.webp",
    description: "Generate free scale-aware MIDI patterns, lock the parts that work, mutate the rest, and export an editable MIDI file locally."
  },
  {
    title: "Pattern Mutator Lite Changelog",
    url: "/tools/pattern-mutator/changelog/",
    type: "Tool",
    thumbnail: "/assets/thumbs/preset-mutator.webp",
    description: "A concise public record of Pattern Mutator Lite releases, improvements, and fixes."
  },
  {
    title: "Music",
    url: "/music/",
    type: "Page",
    thumbnail: "/assets/music/olaru-memories.jpg",
    description: "Olaru releases built from the same dark ambient and cinematic sound palette."
  },
  {
    title: "Updates & Changelog",
    url: "/updates/",
    type: "Page",
    thumbnail: "/assets/thumbs/juno-nocturnes.webp",
    description: "Kreativ Sound updates and public changelog: releases, fixes, catalog and tool changes, plus practical sound-design guides."
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
    url: product.route,
    type: product.hubLabel === "Plugins" ? "Plugin" : product.variant === "bundle" ? "Bundle" : product.variant === "archive" ? "Archive" : "Product",
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

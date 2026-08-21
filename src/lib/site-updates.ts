export type SiteUpdateKind = "new" | "release" | "update" | "fix";

export type SiteUpdate = {
  date: string;
  kind: SiteUpdateKind;
  title: string;
  description: string;
  href?: string;
};

export const siteUpdates: SiteUpdate[] = [
  { date: "2026-08-22", kind: "update", title: "Preset Mutator PRO v0.4.3", description: "A public changelog now records PRO workflow improvements and fixes, with direct links from every mode.", href: "/preset-mutator-pro/changelog/" },
  { date: "2026-08-22", kind: "update", title: "Preset Mutator Free v0.4.2", description: "A public changelog now records Free workflow improvements and fixes, with direct links from every mode.", href: "/preset-mutator/changelog/" },
  { date: "2026-08-21", kind: "update", title: "Wave Mutator beta v0.2.1", description: "Four local Delivery Profiles now set practical cleanup, export, naming, pack, and preview defaults for sample packs, music, game SFX, and store previews.", href: "/tools/wave-mutator/" },
  { date: "2026-08-21", kind: "update", title: "Preset Mutator PRO v0.4.2", description: "The three PRO workflows now share a clearer activation path, cleaner source states, and a more consistent layout across Scratch, Preset, and Audio mode.", href: "https://kreativ.gumroad.com/l/preset-mutator" },
  { date: "2026-08-21", kind: "update", title: "Preset Mutator Free v0.4.1", description: "The free Vital workflow creates three downloadable variants per run with no account or purchase required.", href: "/tools/preset-mutator/" },
  { date: "2026-08-20", kind: "new", title: "Public Updates log added", description: "Kreativ Sound now keeps a dedicated public record of visitor-visible catalog, tool, site, and reliability changes.", href: "/updates/" },
  { date: "2026-08-20", kind: "release", title: "Wave Mutator beta v0.2.0", description: "Wave Mutator now supports cleaner WAV workflows, ZIP pack export, and locally encoded MP3 preview montages.", href: "/tools/wave-mutator/" },
  { date: "2026-08-20", kind: "new", title: "Plugins section added", description: "A dedicated Plugins page is live to establish the upcoming instrument and effect release area.", href: "/plugins/" },
  { date: "2026-08-20", kind: "update", title: "Catalog and collection purchase paths refined", description: "The sound catalog and Kreativ Kollection V1 now use clearer current pricing, purchase copy, and product placement.", href: "/sounds/kreativ-kollection-v1" },
  { date: "2026-08-20", kind: "fix", title: "Deployment validation strengthened", description: "Pull requests now validate the full site before merge, while production deploys run only after the same quality checks pass.", href: "/updates/" },
  { date: "2026-08-19", kind: "fix", title: "Analytics unified across the site", description: "The production build now uses the same Google Analytics setup across the main site and browser tools, alongside Cloudflare Web Analytics.", href: "/privacy/" },
  { date: "2026-08-19", kind: "update", title: "Sound catalog discovery improved", description: "Direct paths for synths, sound styles, and free packs make it faster to start browsing with a useful filter.", href: "/sounds/" },
  { date: "2026-08-19", kind: "update", title: "Updates and deployment checks refreshed", description: "Release notes became easier to browse, and the build pipeline gained faster dependency and readiness handling.", href: "/updates/" },
  { date: "2026-08-18", kind: "fix", title: "Site quality and analytics coverage improved", description: "Metadata, internal links, thumbnails, product data, search, and browser-tool routes gained broader automated checks.", href: "/privacy/" },
  { date: "2026-07-29", kind: "update", title: "Sample-pack audio demos added and remastered", description: "BLEEPS 2, HORROR 2, TECTONIC 2, SPACE 2, ENIGMA 2, NOIZE 2, and SFXS 2 product pages now include current demo playback.", href: "/sounds/" },
  { date: "2026-07-28", kind: "update", title: "Catalog navigation improved for mobile browsing", description: "The catalog now keeps its sound-focused filters, practical search behavior, and a more manageable mobile browsing flow.", href: "/sounds/" },
  { date: "2026-07-24", kind: "release", title: "Kreativ Kollection V1 launched", description: "The 16-product bundle is now available with its own product page, artwork, demo reel, and direct Gumroad purchase path.", href: "/sounds/kreativ-kollection-v1" },
  { date: "2026-07-24", kind: "fix", title: "JUNO NOCTURNES artwork crops corrected", description: "Catalog and product thumbnails were adjusted so the Juno release is more consistently framed across the site.", href: "/sounds/juno-nocturnes-jun-6-v-presets" },
  { date: "2026-07-23", kind: "update", title: "Catalog search and accessibility refined", description: "Catalog filtering, search links, labels, and keyboard-friendly states were tightened for faster, more reliable discovery.", href: "/sounds/" },
  { date: "2026-07-21", kind: "update", title: "Guides moved into Updates", description: "The separate Learn area now points visitors to the combined release, update, and practical workflow experience.", href: "/updates/#guides" },
  { date: "2026-07-18", kind: "release", title: "JUNO NOCTURNES and Lite released", description: "The 96-preset Arturia JUN-6 V bank and a free Lite edition joined the main sound catalog.", href: "/sounds/juno-nocturnes-jun-6-v-presets" },
  { date: "2026-07-15", kind: "fix", title: "SEO, performance, and Pages delivery repaired", description: "Site metadata, route handling, thumbnail checks, and GitHub Pages deployment visibility were improved for more dependable publishing.", href: "/" },
  { date: "2026-07-15", kind: "update", title: "Music page focused on Olaru", description: "The Music section now presents the Olaru catalog only, with the retired Rethyn material removed.", href: "/music/" },
  { date: "2026-06-18", kind: "new", title: "Wave Mutator beta and Lite comparisons added", description: "The browser-based WAV preparation tool launched alongside clearer full-versus-Lite comparisons for preset releases.", href: "/tools/" },
  { date: "2026-06-18", kind: "update", title: "Cloudflare Web Analytics enabled", description: "Aggregate traffic and performance measurement was added site-wide with the related privacy information updated.", href: "/privacy/" },
  { date: "2026-06-16", kind: "new", title: "Kreativ Sample Prep added", description: "A local browser utility for preparing sample files joined the wider Kreativ Sound tools direction.", href: "/tools/kreativ-sample-prep/" },
  { date: "2026-06-13", kind: "release", title: "OPERATORS Lite free pack released", description: "A free introduction to the FM8 preset bank was added with direct upgrade paths to the full OPERATORS release.", href: "/sounds/operators-lite-fm8-presets" },
  { date: "2026-05-16", kind: "update", title: "Sound catalog and product pages rebuilt", description: "The site gained richer product landing pages, focused sound routes, a flagship home layout, and clearer purchase actions.", href: "/sounds/" },
  { date: "2026-05-14", kind: "release", title: "OPERATORS for FM8 released", description: "The FM8 atmosphere and motion preset bank was added to the catalog with dedicated landing and purchase pages.", href: "/sounds/operators-fm8-presets" },
  { date: "2026-05-06", kind: "new", title: "Preset Mutator introduced", description: "The former Audio Alchemy direction became Preset Mutator, with Scratch, Preset, and Audio workflows for creating Vital starting points locally.", href: "/tools/preset-mutator/" },
  { date: "2026-04-30", kind: "release", title: "BLACK ARCOLOGY and Lite released", description: "The Pigments preset bank and free Lite edition were added, supported by new product pages, artwork, and release coverage.", href: "/sounds/black-arcology-pigments-presets" },
  { date: "2026-04-28", kind: "update", title: "Website rebuilt with Astro and GitHub Pages", description: "The catalog, product details, content pages, site search, and publishing flow moved to the current static website architecture.", href: "/" },
  { date: "2026-04-08", kind: "new", title: "First browser preset workflow launched", description: "The original local-first Audio Alchemy prototype established the product direction that later became Preset Mutator.", href: "/tools/preset-mutator/" }
];

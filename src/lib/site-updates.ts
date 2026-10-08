export type SiteUpdateKind = "new" | "release" | "update" | "fix";
export type SiteUpdateAudience = "customer" | "maintenance";

export type SiteUpdate = {
  date: string;
  kind: SiteUpdateKind;
  title: string;
  description: string;
  href?: string;
  audience?: SiteUpdateAudience;
  releaseNote?: string;
};

export const siteUpdates: SiteUpdate[] = [
  { date: "2026-10-07", kind: "update", title: "Updates overview and guides refreshed", description: "Launches, monthly updates, and guides now have separate, shorter sections.", href: "/updates/", audience: "maintenance" },
  { date: "2026-10-07", kind: "update", title: "Preset Mutator Pro v0.5.0", description: "Pigments beta now supports 32-preset ZIP packs across all three Pro modes.", href: "/preset-mutator-pro/changelog/" },
  { date: "2026-10-07", kind: "update", title: "Installation help and Ghostform release details added", description: "Product pages now include preset import steps and Ghostform setup instructions.", href: "/plugins/ghostform#product-installation-title" },
  { date: "2026-10-07", kind: "fix", title: "Sample-pack counts and audio formats verified", description: "Seven WAV packs now list verified file counts, sample rates, and bit depths.", href: "/sounds/" },
  { date: "2026-10-06", kind: "new", title: "Callisto Drift and Lite added to the catalog", description: "Choose the 128-preset Jup-8 V4 bank or its free 32-preset Lite edition.", href: "/sounds/callisto-drift-jup-8-v4-presets", releaseNote: "/posts/callisto-drift-release-2026-10-07.html" },
  { date: "2026-10-06", kind: "fix", title: "Preset Mutator product information corrected", description: "Product pages clarify synth support, Pro activation, and local file handling.", href: "/tools/preset-mutator/" },
  { date: "2026-10-06", kind: "fix", title: "Guides and sound-pack specifications corrected", description: "Six guide layouts and sound-pack specifications were corrected.", href: "/updates/#guides" },
  { date: "2026-09-25", kind: "release", title: "KS Ghostform released", description: "A free macOS/Windows synth provides 144 factory presets for evolving drones and strings.", href: "/plugins/ghostform", releaseNote: "/posts/ghostform-release-2026-10-07.html" },
  { date: "2026-09-14", kind: "update", title: "Preset Mutator Free v0.5.0", description: "Pigments beta export is available in Scratch, Preset, and Audio modes.", href: "/preset-mutator/changelog/" },
  { date: "2026-09-13", kind: "update", title: "Preset Mutator Free v0.4.12", description: "The Wide direction adjusts width, unison, and chorus for broader stereo presets.", href: "/preset-mutator/changelog/" },
  { date: "2026-09-13", kind: "update", title: "Preset Mutator Pro v0.4.11", description: "The Wide direction adjusts width, unison, and chorus for broader stereo presets.", href: "/preset-mutator-pro/changelog/" },
  { date: "2026-09-13", kind: "update", title: "Preset Mutator Pro v0.4.10", description: "Serum 2 beta and a unified interface are available across all three Pro modes.", href: "/preset-mutator-pro/changelog/" },
  { date: "2026-09-08", kind: "update", title: "Preset Mutator Free v0.4.11", description: "All three modes now share the same refinement layout and responsive controls.", href: "/preset-mutator/changelog/" },
  { date: "2026-09-07", kind: "update", title: "Preset Mutator Free v0.4.10", description: "Serum 2 beta export joins Vital, with clearer synth selection.", href: "/preset-mutator/changelog/" },
  { date: "2026-09-07", kind: "update", title: "Wave Mutator Lite beta v0.2.3", description: "A guided first-run flow covers file loading, delivery targets, cleanup previews, and downloads.", href: "/tools/wave-mutator/changelog/" },
  { date: "2026-09-06", kind: "update", title: "Pattern Mutator Lite v0.3.0", description: "Quick Starters, register controls, undo/redo, and selected-bar regeneration expand MIDI editing.", href: "/tools/pattern-mutator/changelog/" },
  { date: "2026-09-06", kind: "update", title: "Pattern Mutator Lite v0.2.2", description: "Rhythm Feel adds straight, syncopated, half-time, driving, and sparse patterns.", href: "/tools/pattern-mutator/changelog/" },
  { date: "2026-09-05", kind: "update", title: "Preset Mutator Free v0.4.9", description: "Pro is directly accessible from Tools, product pages, search, and Free workflows.", href: "/preset-mutator/changelog/" },
  { date: "2026-09-05", kind: "update", title: "Preset Mutator Pro v0.4.9", description: "The paid edition uses the Preset Mutator Pro name throughout the app.", href: "/preset-mutator-pro/changelog/" },
  { date: "2026-09-05", kind: "update", title: "Preset Mutator Free v0.4.8", description: "The Preset Mutator Free name is consistent across the app and website.", href: "/preset-mutator/changelog/" },
  { date: "2026-09-05", kind: "update", title: "Pattern Mutator Lite v0.2.1", description: "The renamed MIDI tool keeps existing links and its single-pattern workflow.", href: "/tools/pattern-mutator/changelog/" },
  { date: "2026-09-05", kind: "update", title: "Wave Mutator Lite beta v0.2.2", description: "The renamed WAV tool keeps its existing URL and updates local export labels.", href: "/tools/wave-mutator/changelog/" },
  { date: "2026-09-02", kind: "update", title: "Preset Mutator Pro v0.4.8", description: "An All tools link connects every Pro mode to the browser-tool catalog.", href: "/preset-mutator-pro/changelog/" },
  { date: "2026-09-02", kind: "update", title: "Preset Mutator Free v0.4.7", description: "An All tools link connects every Free mode to the browser-tool catalog.", href: "/preset-mutator/changelog/" },
  { date: "2026-08-28", kind: "update", title: "Preset Mutator Pro v0.4.7", description: "Pack generation uses distinct Vital structures, near-duplicate retries, and safer output limits.", href: "/preset-mutator-pro/changelog/", releaseNote: "/posts/preset-mutator-release-2026-08-28.html" },
  { date: "2026-08-28", kind: "update", title: "Preset Mutator Free v0.4.6", description: "Generation uses more varied Vital structures and responds more closely to source direction.", href: "/preset-mutator/changelog/" },
  { date: "2026-08-25", kind: "update", title: "Pattern Mutator Lite adds free piano roll editing", description: "Edit notes, timing, length, and velocity before exporting MIDI.", href: "/tools/pattern-mutator/" },
  { date: "2026-08-25", kind: "update", title: "Pattern Mutator Lite changelog added", description: "Version history is accessible from the MIDI tool's footer.", href: "/tools/pattern-mutator/changelog/" },
  { date: "2026-08-25", kind: "new", title: "Pattern Mutator Lite first draft released", description: "Generate, audition, and export scale-aware MIDI ideas locally.", href: "/tools/pattern-mutator/" },
  { date: "2026-08-22", kind: "update", title: "Preset Mutator Pro v0.4.3", description: "A public changelog records Pro improvements and fixes.", href: "/preset-mutator-pro/changelog/" },
  { date: "2026-08-22", kind: "update", title: "Preset Mutator Free v0.4.2", description: "A public changelog records Free improvements and fixes.", href: "/preset-mutator/changelog/" },
  { date: "2026-08-21", kind: "update", title: "Wave Mutator Lite beta v0.2.1", description: "Four Delivery Profiles set cleanup and export defaults for different destinations.", href: "/tools/wave-mutator/changelog/" },
  { date: "2026-08-21", kind: "update", title: "Preset Mutator Pro v0.4.2", description: "All three Pro modes share clearer activation and source states.", href: "https://kreativ.gumroad.com/l/preset-mutator" },
  { date: "2026-08-21", kind: "update", title: "Preset Mutator Free v0.4.1", description: "Generate three downloadable Vital variants locally without an account.", href: "/tools/preset-mutator/" },
  { date: "2026-08-20", kind: "new", title: "Public Updates log added", description: "A public log records catalog, tool, and website changes.", href: "/updates/", audience: "maintenance" },
  { date: "2026-08-20", kind: "update", title: "Wave Mutator Lite beta v0.2.0", description: "WAV cleanup now includes ZIP export and local MP3 preview montages.", href: "/tools/wave-mutator/" },
  { date: "2026-08-20", kind: "new", title: "Plugins section added", description: "A dedicated page introduces the planned instrument and effect releases.", href: "/plugins/", audience: "maintenance" },
  { date: "2026-08-20", kind: "update", title: "Catalog and collection purchase paths refined", description: "Catalog placement, pricing, and purchase links are clearer.", href: "/sounds/kreativ-kollection-v1" },
  { date: "2026-08-20", kind: "fix", title: "Deployment validation strengthened", description: "Site checks run before pull-request merges and production deployments.", href: "/updates/", audience: "maintenance" },
  { date: "2026-08-19", kind: "fix", title: "Analytics unified across the site", description: "The main site and browser tools share Google Analytics and Cloudflare measurement.", href: "/privacy/", audience: "maintenance" },
  { date: "2026-08-19", kind: "update", title: "Sound catalog discovery improved", description: "Catalog shortcuts were added for synths, sound styles, and free packs.", href: "/sounds/", audience: "maintenance" },
  { date: "2026-08-19", kind: "update", title: "Updates and deployment checks refreshed", description: "Release browsing and build-pipeline readiness checks were improved.", href: "/updates/", audience: "maintenance" },
  { date: "2026-08-18", kind: "fix", title: "Site quality and analytics coverage improved", description: "Automated checks cover metadata, links, images, product data, search, and tool routes.", href: "/privacy/", audience: "maintenance" },
  { date: "2026-07-29", kind: "update", title: "Sample-pack audio demos added and remastered", description: "All seven WAV packs have updated audio previews.", href: "/sounds/" },
  { date: "2026-07-28", kind: "update", title: "Catalog navigation improved for mobile browsing", description: "Catalog filters and search were refined for mobile browsing.", href: "/sounds/", audience: "maintenance" },
  { date: "2026-07-24", kind: "release", title: "Kreativ Kollection V1 launched", description: "Nine preset banks and seven WAV packs are available in one bundle.", href: "/sounds/kreativ-kollection-v1", releaseNote: "/posts/kreativ-kollection-v1-release-2026-07-24.html" },
  { date: "2026-07-24", kind: "fix", title: "JUNO NOCTURNES artwork crops corrected", description: "Product artwork is consistently framed across catalog and detail pages.", href: "/sounds/juno-nocturnes-jun-6-v-presets" },
  { date: "2026-07-23", kind: "update", title: "Catalog search and accessibility refined", description: "Catalog filters, search labels, and keyboard navigation were improved.", href: "/sounds/", audience: "maintenance" },
  { date: "2026-07-21", kind: "update", title: "Guides moved into Updates", description: "The former Learn area redirects visitors to the guides in Updates.", href: "/updates/#guides", audience: "maintenance" },
  { date: "2026-07-18", kind: "release", title: "JUNO NOCTURNES and Lite released", description: "A 96-preset JUN-6 V bank and free Lite edition join the catalog.", href: "/sounds/juno-nocturnes-jun-6-v-presets", releaseNote: "/posts/juno-nocturnes-release-2026-07-18.html" },
  { date: "2026-07-15", kind: "fix", title: "SEO, performance, and Pages delivery repaired", description: "Metadata, routes, image checks, and deployment reporting were repaired.", href: "/", audience: "maintenance" },
  { date: "2026-07-15", kind: "update", title: "Music page focused on Olaru", description: "The Music page features Olaru, with retired Rethyn releases removed.", href: "/music/", audience: "maintenance" },
  { date: "2026-06-18", kind: "new", title: "Wave Mutator Lite beta announced", description: "Prepare WAV files locally with the new browser-based cleanup tool.", href: "/tools/" },
  { date: "2026-06-18", kind: "update", title: "Cloudflare Web Analytics enabled", description: "Site-wide traffic measurement was added with updated privacy information.", href: "/privacy/", audience: "maintenance" },
  { date: "2026-06-16", kind: "new", title: "Kreativ Sample Prep added", description: "A local sample-preparation utility joins the browser tools.", href: "/tools/kreativ-sample-prep/", audience: "maintenance" },
  { date: "2026-06-13", kind: "release", title: "OPERATORS Lite free pack released", description: "Try the atmospheric FM8 palette with a free starter bank.", href: "/sounds/operators-lite-fm8-presets" },
  { date: "2026-05-16", kind: "update", title: "Sound catalog and product pages rebuilt", description: "New catalog and product layouts provide clearer browsing and purchase links.", href: "/sounds/", audience: "maintenance" },
  { date: "2026-05-14", kind: "release", title: "OPERATORS for FM8 released", description: "The FM8 bank brings atmospheric motion and digital textures to the catalog.", href: "/sounds/operators-fm8-presets", releaseNote: "/posts/operators-fm8-release-2026-05-14.html" },
  { date: "2026-05-06", kind: "new", title: "Preset Mutator introduced", description: "Audio Alchemy becomes a local Vital tool with Scratch, Preset, and Audio modes.", href: "/tools/preset-mutator/", releaseNote: "/posts/preset-mutator-direction-2026-05-06.html" },
  { date: "2026-04-30", kind: "release", title: "BLACK ARCOLOGY and Lite released", description: "Explore industrial Pigments sounds in full and free Lite editions.", href: "/sounds/black-arcology-pigments-presets", releaseNote: "/posts/black-arcology-release-2026-04-30.html" },
  { date: "2026-04-28", kind: "update", title: "Website rebuilt with Astro and GitHub Pages", description: "Astro and GitHub Pages now handle the static site and publishing workflow.", href: "/", audience: "maintenance" },
  { date: "2026-04-08", kind: "new", title: "First browser preset workflow launched", description: "The Audio Alchemy prototype starts the local preset-generation workflow.", href: "/tools/preset-mutator/", audience: "maintenance" }
];

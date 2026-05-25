export type MusicProductLink = {
  label: string;
  href: string;
};

export type MusicPlatformLink = {
  label: string;
  href: string;
  primary?: boolean;
};

export type MusicRelease = {
  title: string;
  type: "Album" | "Single";
  href: string;
  image: string;
  imageAlt: string;
  summary: string;
  releaseDate?: string;
  mood?: string[];
  madeWith?: MusicProductLink[];
  platformLinks?: MusicPlatformLink[];
  featured?: boolean;
  meta?: string[];
  linkLabel: string;
};

export type MusicArtist = {
  slug: string;
  name: string;
  intro: string;
  platformLabel: string;
  platformHref: string;
  shellClass?: string;
  gridClass?: string;
  releases: MusicRelease[];
};

const madeWith = {
  blackArcology: {
    label: "Black Arcology",
    href: "/sounds/black-arcology-pigments-presets",
  },
  bioforms: {
    label: "Bioforms",
    href: "/sounds/bioforms-synplant-2-presets",
  },
  enigma: {
    label: "Enigma 2",
    href: "/sounds/enigma-2-cinematic-atmospheres",
  },
  neolith: {
    label: "Neolith",
    href: "/sounds/neolith-softube-models-presets",
  },
  noize: {
    label: "Noize 2",
    href: "/sounds/noize-2-noise-textures",
  },
  presetMutator: {
    label: "Preset Mutator",
    href: "/sounds/preset-mutator",
  },
  space: {
    label: "Space 2",
    href: "/sounds/space-2-atmospheres-textures",
  },
  tectonic: {
    label: "Tectonic 2",
    href: "/sounds/tectonic-2-dark-subs-textures",
  },
  velvetRuins: {
    label: "Velvet Ruins",
    href: "/sounds/velvet-ruins-vital-presets",
  },
  zephyr: {
    label: "Zephyr",
    href: "/sounds/zephyr-animoog-z-presets",
  },
} satisfies Record<string, MusicProductLink>;

export const musicArtists: MusicArtist[] = [
  {
    slug: "olaru",
    name: "Olaru",
    intro:
      "Ambient pieces, studies, and melodic sketches published on Bandcamp, shaped heavily with Kreativ Sound textures, samples, and presets.",
    platformLabel: "Visit Bandcamp",
    platformHref: "https://olaru.bandcamp.com/",
    releases: [
      {
        title: "Memories",
        type: "Album",
        href: "https://olaru.bandcamp.com/album/memories",
        image: "/assets/music/olaru-memories.jpg",
        imageAlt: "Memories album cover",
        summary: "Sketchbook ambience and melodic memory fragments.",
        mood: ["ambient", "melodic", "sketchbook"],
        madeWith: [madeWith.bioforms, madeWith.zephyr, madeWith.space],
        platformLinks: [
          {
            label: "Bandcamp",
            href: "https://olaru.bandcamp.com/album/memories",
            primary: true,
          },
        ],
        linkLabel: "Open on Bandcamp",
      },
      {
        title: "Trees",
        type: "Album",
        href: "https://olaru.bandcamp.com/album/trees",
        image: "/assets/music/olaru-trees.jpg",
        imageAlt: "Trees album cover",
        summary: "Organic studies with texture, distance, and color.",
        mood: ["organic", "ambient", "textural"],
        madeWith: [madeWith.bioforms, madeWith.space],
        platformLinks: [
          {
            label: "Bandcamp",
            href: "https://olaru.bandcamp.com/album/trees",
            primary: true,
          },
        ],
        linkLabel: "Open on Bandcamp",
      },
      {
        title: "Vision No Return",
        type: "Album",
        href: "https://olaru.bandcamp.com/album/vision-no-return",
        image: "/assets/music/olaru-vision-no-return.jpg",
        imageAlt: "Vision No Return album cover",
        summary: "Melancholic motion and hazier cinematic drift.",
        mood: ["melancholic", "cinematic", "hazy"],
        madeWith: [madeWith.enigma, madeWith.neolith, madeWith.space],
        platformLinks: [
          {
            label: "Bandcamp",
            href: "https://olaru.bandcamp.com/album/vision-no-return",
            primary: true,
          },
        ],
        linkLabel: "Open on Bandcamp",
      },
      {
        title: "Nightfall",
        type: "Album",
        href: "https://olaru.bandcamp.com/album/nightfall",
        image: "/assets/music/olaru-nightfall.jpg",
        imageAlt: "Nightfall album cover",
        summary: "Low-light ambience and restrained melodic cues.",
        mood: ["low-light", "restrained", "cinematic"],
        madeWith: [madeWith.enigma, madeWith.neolith],
        platformLinks: [
          {
            label: "Bandcamp",
            href: "https://olaru.bandcamp.com/album/nightfall",
            primary: true,
          },
        ],
        linkLabel: "Open on Bandcamp",
      },
      {
        title: "Selected Ghosts",
        type: "Album",
        href: "https://olaru.bandcamp.com/album/selected-ghosts",
        image: "/assets/music/olaru-selected-ghosts.jpg",
        imageAlt: "Selected Ghosts album cover",
        summary: "Atmospheric fragments and shadowed piano distance.",
        mood: ["shadowed", "piano", "fragments"],
        madeWith: [madeWith.velvetRuins, madeWith.enigma],
        platformLinks: [
          {
            label: "Bandcamp",
            href: "https://olaru.bandcamp.com/album/selected-ghosts",
            primary: true,
          },
        ],
        linkLabel: "Open on Bandcamp",
      },
      {
        title: "Ambitones",
        type: "Album",
        href: "https://olaru.bandcamp.com/album/ambitones",
        image: "/assets/music/olaru-ambitones.jpg",
        imageAlt: "Ambitones album cover",
        summary: "Minimal tonal studies with spatial restraint.",
        mood: ["minimal", "tonal", "spatial"],
        madeWith: [madeWith.zephyr, madeWith.space],
        platformLinks: [
          {
            label: "Bandcamp",
            href: "https://olaru.bandcamp.com/album/ambitones",
            primary: true,
          },
        ],
        linkLabel: "Open on Bandcamp",
      },
    ],
  },
  {
    slug: "rethyn",
    name: "Rethyn",
    intro:
      "Electronic sketches and signal-driven pieces under the Rethyn moniker, also built with strong use of Kreativ Sound sounds and presets.",
    platformLabel: "Open Spotify",
    platformHref: "https://open.spotify.com/artist/7iwBaUeCQYimysZAoKh42X",
    shellClass: "music-artist-shell-alt",
    gridClass: "music-grid-single",
    releases: [
      {
        title: "Holo Signal",
        type: "Single",
        href: "https://music.amazon.com/artists/B0GV4RM888/rethyn",
        image: "/assets/music/rethyn-holo-signal.jpg",
        imageAlt: "Holo Signal cover",
        summary: "Signal-shaped electronic sketches built from the same darker Kreativ Sound palette.",
        releaseDate: "2026-03-27",
        mood: ["signal-driven", "dark electronic", "industrial"],
        madeWith: [madeWith.blackArcology, madeWith.noize, madeWith.tectonic, madeWith.presetMutator],
        platformLinks: [
          {
            label: "Spotify",
            href: "https://open.spotify.com/artist/7iwBaUeCQYimysZAoKh42X",
            primary: true,
          },
          {
            label: "Amazon Music",
            href: "https://music.amazon.com/artists/B0GV4RM888/rethyn",
          },
        ],
        featured: true,
        meta: ["March 27, 2026", "2 tracks"],
        linkLabel: "Open artist page",
      },
    ],
  },
];

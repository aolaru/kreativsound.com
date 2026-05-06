export type MusicRelease = {
  title: string;
  type: "Album" | "Single";
  href: string;
  image: string;
  imageAlt: string;
  summary: string;
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
        image: "https://f4.bcbits.com/img/a1549831212_2.jpg",
        imageAlt: "Memories album cover",
        summary: "Sketchbook ambience and melodic memory fragments.",
        linkLabel: "Open on Bandcamp",
      },
      {
        title: "Trees",
        type: "Album",
        href: "https://olaru.bandcamp.com/album/trees",
        image: "https://f4.bcbits.com/img/a0092871322_2.jpg",
        imageAlt: "Trees album cover",
        summary: "Organic studies with texture, distance, and color.",
        linkLabel: "Open on Bandcamp",
      },
      {
        title: "Vision No Return",
        type: "Album",
        href: "https://olaru.bandcamp.com/album/vision-no-return",
        image: "https://f4.bcbits.com/img/a1511504117_2.jpg",
        imageAlt: "Vision No Return album cover",
        summary: "Melancholic motion and hazier cinematic drift.",
        linkLabel: "Open on Bandcamp",
      },
      {
        title: "Nightfall",
        type: "Album",
        href: "https://olaru.bandcamp.com/album/nightfall",
        image: "https://f4.bcbits.com/img/a1183385430_2.jpg",
        imageAlt: "Nightfall album cover",
        summary: "Low-light ambience and restrained melodic cues.",
        linkLabel: "Open on Bandcamp",
      },
      {
        title: "Selected Ghosts",
        type: "Album",
        href: "https://olaru.bandcamp.com/album/selected-ghosts",
        image: "https://f4.bcbits.com/img/a1961746094_2.jpg",
        imageAlt: "Selected Ghosts album cover",
        summary: "Atmospheric fragments and shadowed piano distance.",
        linkLabel: "Open on Bandcamp",
      },
      {
        title: "Ambitones",
        type: "Album",
        href: "https://olaru.bandcamp.com/album/ambitones",
        image: "https://f4.bcbits.com/img/a2196578473_2.jpg",
        imageAlt: "Ambitones album cover",
        summary: "Minimal tonal studies with spatial restraint.",
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
        image:
          "https://m.media-amazon.com/images/I/31zy-G17D-L._SX354_SY354_BL0_QL100__UXNaN_FMjpg_QL85_.jpg",
        imageAlt: "Holo Signal cover",
        summary: "Signal-shaped electronic sketches built from the same darker Kreativ Sound palette.",
        meta: ["March 27, 2026", "2 tracks"],
        linkLabel: "Open artist page",
      },
    ],
  },
];

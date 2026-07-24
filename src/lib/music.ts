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
  bandcampAlbumId?: string;
  releaseDate?: string;
  mood?: string[];
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
        bandcampAlbumId: "3005188030",
        mood: ["ambient", "melodic", "sketchbook"],
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
        bandcampAlbumId: "3106922682",
        mood: ["organic", "ambient", "textural"],
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
        bandcampAlbumId: "1563336206",
        mood: ["melancholic", "cinematic", "hazy"],
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
        bandcampAlbumId: "4173187328",
        mood: ["low-light", "restrained", "cinematic"],
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
        bandcampAlbumId: "3726038612",
        mood: ["shadowed", "piano", "fragments"],
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
        bandcampAlbumId: "2314114483",
        mood: ["minimal", "tonal", "spatial"],
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
];

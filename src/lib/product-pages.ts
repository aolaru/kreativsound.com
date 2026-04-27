export type ProductPage = {
  slug: string;
  title: string;
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
  demoPlaceholder: string;
  specs: Array<{ label: string; value: string }>;
  panels: Array<{ title: string; body?: string; items?: string[] }>;
  related: Array<{ label: string; url: string }>;
};

export const productPages: ProductPage[] = [
  {
    slug: "bioforms",
    title: "BIOFORMS | Kreativ Sound",
    description: "BIOFORMS is a Synplant 2 preset pack focused on evolving motion, organic tone, and atmospheric movement.",
    canonical: "https://kreativsound.com/products/bioforms/",
    ogImage: "https://kreativsound.com/assets/thumbs/bioforms.jpg",
    ogImageAlt: "BIOFORMS product cover",
    image: "/assets/thumbs/bioforms.jpg",
    imageAlt: "BIOFORMS cover",
    kicker: "Flagship preset pack",
    lead: "Evolving presets for Synplant 2.",
    summary: "A preset collection built for organic motion, slow harmonic change, and atmospheric layers that feel alive without turning busy.",
    primaryUrl: "https://kreativ.gumroad.com/l/bioforms-synplant-2-presets?layout=profile",
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
  {
    slug: "neolith",
    title: "NEOLITH | Kreativ Sound",
    description: "NEOLITH is a preset pack for Softube Models built around analog-forward tone, cinematic tension, and textured synth weight.",
    canonical: "https://kreativsound.com/products/neolith/",
    ogImage: "https://kreativsound.com/assets/thumbs/neolith.jpg",
    ogImageAlt: "NEOLITH product cover",
    image: "/assets/thumbs/neolith.jpg",
    imageAlt: "NEOLITH cover",
    kicker: "Flagship preset pack",
    lead: "Presets for Softube Models.",
    summary: "An analog-forward preset set shaped for cinematic tension, heavy synth tone, and motion that feels deliberate rather than overdesigned.",
    primaryUrl: "https://kreativ.gumroad.com/l/neolith-softube-models-presets?layout=profile",
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
  {
    slug: "velvet-ruins",
    title: "VELVET RUINS | Kreativ Sound",
    description: "VELVET RUINS is a Vital preset pack focused on worn-down cinematic texture, dark melody, and spectral motion.",
    canonical: "https://kreativsound.com/products/velvet-ruins/",
    ogImage: "https://kreativsound.com/assets/thumbs/velvet-ruins.jpg",
    ogImageAlt: "VELVET RUINS product cover",
    image: "/assets/thumbs/velvet-ruins.jpg",
    imageAlt: "VELVET RUINS cover",
    kicker: "Flagship preset pack",
    lead: "Presets for Vital spectral synth.",
    summary: "A dark Vital preset set built for spectral movement, worn melodic tone, and cinematic atmosphere that feels aged without turning muddy.",
    primaryUrl: "https://kreativ.gumroad.com/l/velvet-ruins-vital-synth-presets?layout=profile",
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
  }
];

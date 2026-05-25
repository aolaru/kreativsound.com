# Kreativ Sound Website

Official static website for [kreativsound.com](https://kreativsound.com).

## Stack

- Astro (`src/`, `dist/`)
- Shared CSS (`style.css`)
- Lightweight client scripts (`public/site.js`, `public/share.js`)
- Static assets (`public/assets/`, SVG files)
- Browser app sources (`apps/`)

## Local Preview

Use Astro for local development:

```bash
npm install
npm run dev
```

Then open:

```text
http://127.0.0.1:4321/
```

For a production-style local check:

```bash
npm run build
npm run preview
```

## Preset Mutator Browser App

The Preset Mutator source lives under:

- `apps/preset-mutator/public`

The predev/prebuild sync copies that source into the deploy path:

- `public/preset-mutator`

```text
http://127.0.0.1:4321/preset-mutator/
```

Notes:

- Edit `apps/preset-mutator/public/` first. Do not edit generated files under `public/preset-mutator/`.
- `public/apps/audio-alchemy/ui/` is a legacy redirect to Audio to Preset.
- `public/apps/presetmutator/` is retired and only kept as a redirect path.
- `public/apps/preset-mutator/ui/` is generated as a legacy redirect to `/preset-mutator/`.
- Run `npm run check:preset-mutator` for app-specific QA.

## Editing Product Catalog

Product data is maintained in:

- `src/lib/products.ts`
- `src/lib/product-pages.ts`
- `src/lib/product-content.ts`

Catalog cards, featured product presentation, and product detail content all flow from those files.

## Editing News, Learn, and Posts

Post content now lives in:

- `src/content/posts/`

`News`, `Learn`, and post routes are generated from the Astro content collection.

When a new release goes live, add a matching `News` post in the same pass so the release timeline stays current.

## Editing Music

Music artist and release data lives in:

- `src/lib/music.ts`

The `Music` page renders from that structured source. When you add a new public release:

1. add the release entry in `src/lib/music.ts`
2. add or update the matching `News` post in `src/content/posts/`

That keeps `Music` and `News` aligned instead of drifting apart.

## Thumbnails

Optimized local thumbnails are stored in:

- `public/assets/thumbs/`

Using local files keeps page loads faster and avoids external image latency.

Generate a new square thumbnail from a source image with:

```bash
bash scripts/generate-thumbnail.sh path/to/source-image.png public/assets/thumbs/product-name.jpg
```

## Deploy / Publish

This repository is connected to:

- `git@github.com:aolaru/kreativsound.com.git`

Standard publish flow:

```bash
git add .
git commit -m "Describe changes"
git push
```

GitHub Pages should use `GitHub Actions`. This repository includes a workflow that builds Astro and deploys `dist/` on pushes to `main`.

## Pre-Release Checks

- Run the release checklist: `docs/release-checklist.md`
- Run the standard local check before committing:

```bash
npm run check
```

- Run the heavier release gate before a larger publish:

```bash
npm run release:check
```

- Individual checks are still available when you only need one layer:

```bash
npm run check:products
npm run check:preset-mutator
npm run check:links
python3 scripts/smoke-site.py
```

- Refresh sitemap freshness metadata explicitly when needed:

```bash
npm run sitemap
```

## Analytics

The site uses Cloudflare Web Analytics via the Cloudflare beacon script.

This provides traffic analytics at the page/site level through the Cloudflare dashboard.

## Monitoring

See `docs/monitoring.md` for uptime and analytics monitoring setup.

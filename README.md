# Kreativ Sound Website

Official static website for [kreativsound.com](https://kreativsound.com).

## Stack

- HTML (`index.html`, `404.html`)
- CSS (`style.css`)
- Vanilla JavaScript (`products.js`, `main.js`)
- Static assets (`assets/`, SVG files)

## Local Preview

Open `index.html` directly in your browser.

This project is configured to work from `file://` (no build step required).

## Editing Product Cards

Product data is maintained in:

- `products.js`

Each product includes title, category, URL, thumbnail path, and metadata shown on the card.

## Thumbnails

Optimized local thumbnails are stored in:

- `assets/thumbs/`

Using local files keeps page loads faster and avoids external image latency.

Generate a new square thumbnail from a source image with:

```bash
bash scripts/generate-thumbnail.sh path/to/source-image.png assets/thumbs/product-name.jpg
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

If GitHub Pages (or another deployment target) is connected to `main`, pushes publish updates automatically.

## Pre-Release Checks

- Run the release checklist: `docs/release-checklist.md`
- Run Lighthouse routine:

```bash
bash scripts/lighthouse-check.sh
```

- Run full release gate (thumbnails + Lighthouse + thresholds):

```bash
bash scripts/release-gate.sh
```

- CI runs the same release gate on pushes and pull requests to `main` via `.github/workflows/release-gate.yml`.

## Analytics

The site uses Plausible Analytics (`analytics.js` + hosted Plausible script).

Key tracked events:

- `featured_product_click`
- `product_card_click`
- `hero_explore_click`
- `hero_patreon_click`
- `theme_toggle`
- `404_view`
- `outbound_click`

## Monitoring

See `docs/monitoring.md` for uptime and analytics monitoring setup.

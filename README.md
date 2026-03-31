# Kreativ Sound Website

Official static website for [kreativsound.com](https://kreativsound.com).

## Stack

- HTML (`index.html`, `404.html`)
- CSS (`style.css`)
- Vanilla JavaScript (`products.js`, `main.js`)
- Static assets (`assets/`, SVG files)

## Local Preview

Serve the site from the project root with a local HTTP server.

Example:

```bash
python3 -m http.server 4173
```

Then open:

```text
http://127.0.0.1:4173/
```

`file://` preview is no longer reliable because the site uses root-relative links and trailing-slash routes such as `/news/` and `/learn/`.

## PresetMutator Local Webapp

`PresetMutator` now lives inside this repo under:

- `apps/presetmutator`

Start it from the repo root with:

```bash
bash run-presetmutator.sh
```

Stable local URL:

```text
http://127.0.0.1:4185/
```

Notes:

- this avoids the main site preview port (`4173`)
- it is local-only by default (`127.0.0.1`)
- it is not linked anywhere on the public website

You can override the bind settings if needed:

```bash
PRESETMUTATOR_HOST=127.0.0.1 PRESETMUTATOR_PORT=4185 bash run-presetmutator.sh
```

## Build Generated Pages

Shared secondary pages, post pages, redirects, and `sitemap.xml` are generated from:

- `scripts/build-site.ps1`

Regenerate them with:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/build-site.ps1
```

## Editing Product Cards

Product data is maintained in:

- `products.js`

Each product includes title, category, URL, thumbnail path, and metadata shown on the card.

## Editing News, Learn, and Posts

Post metadata and page copy for generated sections are maintained in:

- `scripts/build-site.ps1`

After editing that file, run:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/build-site.ps1
```

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
 - Run product asset validation:

```bash
python3 scripts/check-product-assets.py
```

- Run rendered smoke checks:

```bash
python3 scripts/smoke-site.py
```

- Run Audio Alchemy smoke checks:

```bash
python3 scripts/smoke-audio-alchemy.py
```

- Run full release gate (sitemap + assets + thumbnails + smoke + Lighthouse + thresholds):

```bash
bash scripts/release-gate.sh
```

- Refresh sitemap freshness metadata explicitly when needed:

```bash
python3 scripts/update-sitemap-lastmod.py
```

## Analytics

The site uses Cloudflare Web Analytics via the Cloudflare beacon script.

This provides traffic analytics at the page/site level through the Cloudflare dashboard.

## Monitoring

See `docs/monitoring.md` for uptime and analytics monitoring setup.

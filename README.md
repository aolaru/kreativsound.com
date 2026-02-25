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

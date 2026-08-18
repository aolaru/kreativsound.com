#!/usr/bin/env bash
set -euo pipefail

echo "[1/13] Building site..."
PUBLIC_DISABLE_ANALYTICS=true npm run build

echo "[2/13] Checking sitemap freshness..."
npm run sitemap:check

echo "[3/13] Checking product data..."
npm run check:products

echo "[4/13] Checking product assets..."
python3 scripts/check-product-assets.py

echo "[5/13] Checking thumbnail quality..."
npm run check:thumbnails

echo "[6/13] Checking Wave Mutator..."
npm run check:wave-mutator

echo "[7/13] Checking search index..."
npm run check:search

echo "[8/13] Checking internal links..."
npm run check:links

echo "[9/13] Checking page metadata..."
npm run check:metadata

echo "[10/13] Running rendered smoke checks..."
python3 scripts/smoke-site.py

echo "[11/13] Running Preset Mutator smoke checks..."
npm run smoke:preset-mutator

echo "[12/13] Running Lighthouse..."
bash scripts/lighthouse-check.sh

echo "[13/13] Verifying Lighthouse thresholds..."
python3 scripts/check-lighthouse-thresholds.py

echo "Release gate passed."

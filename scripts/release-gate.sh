#!/usr/bin/env bash
set -euo pipefail

echo "[1/12] Building site..."
PUBLIC_DISABLE_ANALYTICS=true npm run build

echo "[2/12] Checking sitemap freshness..."
npm run sitemap:check

echo "[3/12] Checking product data..."
npm run check:products

echo "[4/12] Checking product assets..."
python3 scripts/check-product-assets.py

echo "[5/12] Checking thumbnail quality..."
npm run check:thumbnails

echo "[6/12] Checking Wave Mutator..."
npm run check:wave-mutator

echo "[7/12] Checking search index..."
npm run check:search

echo "[8/12] Checking internal links..."
npm run check:links

echo "[9/12] Running rendered smoke checks..."
python3 scripts/smoke-site.py

echo "[10/12] Running Preset Mutator smoke checks..."
npm run smoke:preset-mutator

echo "[11/12] Running Lighthouse..."
bash scripts/lighthouse-check.sh

echo "[12/12] Verifying Lighthouse thresholds..."
python3 scripts/check-lighthouse-thresholds.py

echo "Release gate passed."

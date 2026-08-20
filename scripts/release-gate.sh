#!/usr/bin/env bash
set -euo pipefail

echo "[1/15] Building site..."
npm run build

echo "[2/15] Checking sitemap freshness..."
npm run sitemap:check

echo "[3/15] Checking product data..."
npm run check:products

echo "[4/15] Checking Preset Mutator..."
npm run check:preset-mutator

echo "[5/15] Checking product assets..."
python3 scripts/check-product-assets.py

echo "[6/15] Checking thumbnail quality..."
npm run check:thumbnails

echo "[7/15] Checking Wave Mutator..."
npm run check:wave-mutator

echo "[8/15] Checking search index..."
npm run check:search

echo "[9/15] Checking internal links..."
npm run check:links

echo "[10/15] Checking page metadata..."
npm run check:metadata

echo "[11/15] Running rendered smoke checks..."
python3 scripts/smoke-site.py

echo "[12/15] Running Preset Mutator smoke checks..."
npm run smoke:preset-mutator

echo "[13/15] Running Lighthouse..."
bash scripts/lighthouse-check.sh

echo "[14/15] Verifying Lighthouse thresholds..."
python3 scripts/check-lighthouse-thresholds.py

echo "[15/15] Release gate passed."

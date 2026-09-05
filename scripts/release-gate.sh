#!/usr/bin/env bash
set -euo pipefail

echo "[1/16] Building site..."
npm run build

echo "[2/16] Checking sitemap freshness..."
npm run sitemap:check

echo "[3/16] Checking product data..."
npm run check:products

echo "[4/16] Checking Preset Mutator..."
npm run check:preset-mutator

echo "[5/16] Checking product assets..."
python3 scripts/check-product-assets.py

echo "[6/16] Checking thumbnail quality..."
npm run check:thumbnails

echo "[7/16] Checking Wave Mutator Lite..."
npm run check:wave-mutator

echo "[8/16] Checking tool release consistency..."
npm run check:tool-releases

echo "[9/16] Checking search index..."
npm run check:search

echo "[10/16] Checking internal links..."
npm run check:links

echo "[11/16] Checking page metadata..."
npm run check:metadata

echo "[12/16] Running rendered smoke checks..."
python3 scripts/smoke-site.py

echo "[13/16] Running Preset Mutator smoke checks..."
npm run smoke:preset-mutator

echo "[14/16] Running Lighthouse..."
bash scripts/lighthouse-check.sh

echo "[15/16] Verifying Lighthouse thresholds..."
python3 scripts/check-lighthouse-thresholds.py

echo "[16/16] Release gate passed."

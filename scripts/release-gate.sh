#!/usr/bin/env bash
set -euo pipefail

echo "[1/8] Building site..."
PUBLIC_DISABLE_ANALYTICS=true npm run build

echo "[2/8] Checking sitemap freshness..."
npm run sitemap:check

echo "[3/8] Checking product data..."
npm run check:products

echo "[4/8] Checking product assets..."
python3 scripts/check-product-assets.py

echo "[5/8] Checking thumbnail quality..."
bash scripts/check-thumbnails.sh

echo "[6/8] Running rendered smoke checks..."
python3 scripts/smoke-site.py

echo "[7/8] Running Lighthouse..."
bash scripts/lighthouse-check.sh

echo "[8/8] Verifying Lighthouse thresholds..."
python3 scripts/check-lighthouse-thresholds.py

echo "Release gate passed."

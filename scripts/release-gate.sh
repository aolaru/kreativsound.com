#!/usr/bin/env bash
set -euo pipefail

echo "[1/9] Building site..."
PUBLIC_DISABLE_ANALYTICS=true npm run build

echo "[2/9] Checking sitemap freshness..."
npm run sitemap:check

echo "[3/9] Checking product data..."
npm run check:products

echo "[4/9] Checking product assets..."
python3 scripts/check-product-assets.py

echo "[5/9] Checking thumbnail quality..."
bash scripts/check-thumbnails.sh

echo "[6/9] Checking internal links..."
npm run check:links

echo "[7/9] Running rendered smoke checks..."
python3 scripts/smoke-site.py

echo "[8/9] Running Lighthouse..."
bash scripts/lighthouse-check.sh

echo "[9/9] Verifying Lighthouse thresholds..."
python3 scripts/check-lighthouse-thresholds.py

echo "Release gate passed."

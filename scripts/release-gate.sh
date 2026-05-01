#!/usr/bin/env bash
set -euo pipefail

echo "[1/6] Checking sitemap freshness..."
if ! npm run sitemap:check; then
  echo "Warning: sitemap.xml is stale."
fi

echo "[2/6] Checking product assets..."
python3 scripts/check-product-assets.py

echo "[3/6] Checking thumbnail quality..."
bash scripts/check-thumbnails.sh

echo "[4/6] Running rendered smoke checks..."
python3 scripts/smoke-site.py

echo "[5/6] Running Lighthouse..."
bash scripts/lighthouse-check.sh

echo "[6/6] Verifying Lighthouse thresholds..."
python3 scripts/check-lighthouse-thresholds.py

echo "Release gate passed."

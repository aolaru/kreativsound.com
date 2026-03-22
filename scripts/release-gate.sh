#!/usr/bin/env bash
set -euo pipefail

echo "[1/4] Checking sitemap freshness..."
python3 scripts/update-sitemap-lastmod.py --check

echo "[2/4] Checking thumbnail quality..."
bash scripts/check-thumbnails.sh

echo "[3/4] Running Lighthouse..."
bash scripts/lighthouse-check.sh

echo "[4/4] Verifying Lighthouse thresholds..."
python3 scripts/check-lighthouse-thresholds.py

echo "Release gate passed."

#!/usr/bin/env bash
set -euo pipefail

echo "[1/3] Checking thumbnail quality..."
bash scripts/check-thumbnails.sh

echo "[2/3] Running Lighthouse..."
bash scripts/lighthouse-check.sh

echo "[3/3] Verifying Lighthouse thresholds..."
python3 scripts/check-lighthouse-thresholds.py

echo "Release gate passed."

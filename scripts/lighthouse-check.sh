#!/usr/bin/env bash
set -euo pipefail

PORT="${1:-4173}"
URL="http://127.0.0.1:${PORT}/"
REPORT_DIR="reports/lighthouse"
LOG_FILE="/tmp/kreativsound-http.log"

if ! command -v python3 >/dev/null 2>&1; then
  echo "python3 is required to run a local server."
  exit 1
fi

if ! command -v npx >/dev/null 2>&1; then
  echo "npx is required to run Lighthouse."
  exit 1
fi

mkdir -p "${REPORT_DIR}"
python3 -m http.server "${PORT}" --bind 127.0.0.1 >"${LOG_FILE}" 2>&1 &
SERVER_PID=$!

cleanup() {
  kill "${SERVER_PID}" >/dev/null 2>&1 || true
}
trap cleanup EXIT

sleep 2

npx -y lighthouse "${URL}" \
  --quiet \
  --chrome-flags="--headless=new" \
  --only-categories=performance,accessibility,best-practices,seo \
  --output=json \
  --output=html \
  --output-path="${REPORT_DIR}/latest"

echo "Lighthouse reports created:"
echo "- ${REPORT_DIR}/latest.report.html"
echo "- ${REPORT_DIR}/latest.report.json"

#!/usr/bin/env bash
set -euo pipefail

PORT="${1:-4173}"
URL="http://127.0.0.1:${PORT}/"
REPORT_DIR="reports/lighthouse"
LOG_FILE="/tmp/kreativsound-http.log"
DIST_DIR="dist"

if ! command -v python3 >/dev/null 2>&1; then
  echo "python3 is required to run a local server."
  exit 1
fi

if ! command -v npx >/dev/null 2>&1; then
  echo "npx is required to run Lighthouse."
  exit 1
fi

mkdir -p "${REPORT_DIR}"
if [ ! -d "${DIST_DIR}" ]; then
  echo "dist/ is required. Run npm run build first."
  exit 1
fi

python3 -m http.server "${PORT}" --bind 127.0.0.1 --directory "${DIST_DIR}" >"${LOG_FILE}" 2>&1 &
SERVER_PID=$!

cleanup() {
  kill "${SERVER_PID}" >/dev/null 2>&1 || true
}
trap cleanup EXIT

for _ in $(seq 1 20); do
  if curl --fail --silent --output /dev/null "${URL}"; then
    break
  fi
  sleep 0.1
done

if ! curl --fail --silent --output /dev/null "${URL}"; then
  echo "Local server did not become ready."
  exit 1
fi

npx --yes --prefer-offline lighthouse "${URL}" \
  --quiet \
  --no-enable-error-reporting \
  --chrome-flags="--headless=new" \
  --only-categories=performance,accessibility,best-practices,seo \
  --output=json \
  --output=html \
  --output-path="${REPORT_DIR}/latest"

echo "Lighthouse reports created:"
echo "- ${REPORT_DIR}/latest.report.html"
echo "- ${REPORT_DIR}/latest.report.json"

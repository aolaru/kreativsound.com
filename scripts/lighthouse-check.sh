#!/usr/bin/env bash
set -euo pipefail

PORT="${1:-4173}"
BASE_URL="http://127.0.0.1:${PORT}"
REPORT_DIR="reports/lighthouse"
LOG_FILE="/tmp/kreativsound-http.log"
DIST_DIR="dist"
ROUTES=("/" "/sounds/" "/plugins/")
REPORT_NAMES=("home" "sounds" "plugins")

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
  if curl --fail --silent --output /dev/null "${BASE_URL}/"; then
    break
  fi
  sleep 0.1
done

if ! curl --fail --silent --output /dev/null "${BASE_URL}/"; then
  echo "Local server did not become ready."
  exit 1
fi

for index in "${!ROUTES[@]}"; do
  route="${ROUTES[$index]}"
  report_name="${REPORT_NAMES[$index]}"

  npx --yes --prefer-offline lighthouse "${BASE_URL}${route}" \
    --quiet \
    --no-enable-error-reporting \
    --chrome-flags="--headless=new" \
    --only-categories=performance,accessibility,best-practices,seo \
    --output=json \
    --output=html \
    --output-path="${REPORT_DIR}/${report_name}"
done

echo "Lighthouse reports created:"
for report_name in "${REPORT_NAMES[@]}"; do
  echo "- ${REPORT_DIR}/${report_name}.report.html"
  echo "- ${REPORT_DIR}/${report_name}.report.json"
done

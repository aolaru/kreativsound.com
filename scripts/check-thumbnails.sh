#!/usr/bin/env bash
set -euo pipefail

THUMB_DIR="assets/thumbs"
MAX_BYTES="${1:-250000}"
MIN_EDGE="${2:-128}"
STATUS=0

if ! command -v sips >/dev/null 2>&1; then
  echo "sips is required."
  exit 1
fi

for image in "${THUMB_DIR}"/*.jpg; do
  [ -e "${image}" ] || continue
  width="$(sips -g pixelWidth "${image}" | awk '/pixelWidth/ {print $2}')"
  height="$(sips -g pixelHeight "${image}" | awk '/pixelHeight/ {print $2}')"
  size="$(wc -c < "${image}" | tr -d ' ')"

  if [ "${width}" -lt "${MIN_EDGE}" ] || [ "${height}" -lt "${MIN_EDGE}" ]; then
    echo "Invalid dimensions: ${image} (${width}x${height}, minimum ${MIN_EDGE}px per edge)"
    STATUS=1
  fi

  if [ "${size}" -gt "${MAX_BYTES}" ]; then
    echo "File too large: ${image} (${size} bytes, max ${MAX_BYTES})"
    STATUS=1
  fi
done

if [ "${STATUS}" -eq 0 ]; then
  echo "All thumbnails passed."
fi

exit "${STATUS}"

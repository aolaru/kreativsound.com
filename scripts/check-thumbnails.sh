#!/usr/bin/env bash
set -euo pipefail

THUMB_DIR="public/assets/thumbs"
MAX_BYTES="${1:-250000}"
MIN_EDGE="${2:-128}"
STATUS=0

get_dimensions() {
  local image="$1"
  if [ "$(uname -s)" = "Darwin" ] && command -v sips >/dev/null 2>&1; then
    local width height
    width="$(sips -g pixelWidth "${image}" | awk '/pixelWidth/ {print $2}')"
    height="$(sips -g pixelHeight "${image}" | awk '/pixelHeight/ {print $2}')"
    echo "${width} ${height}"
    return 0
  fi
  if command -v identify >/dev/null 2>&1; then
    identify -format "%w %h" "${image}"
    return 0
  fi
  if command -v magick >/dev/null 2>&1; then
    magick identify -format "%w %h" "${image}"
    return 0
  fi
  echo "Missing image dimension tool: install sips (macOS) or identify (ImageMagick)." >&2
  return 1
}

for image in "${THUMB_DIR}"/*.{jpg,jpeg,png,webp}; do
  [ -e "${image}" ] || continue
  if ! dimensions="$(get_dimensions "${image}")"; then
    echo "Unable to inspect thumbnail: ${image}" >&2
    exit 1
  fi
  read -r width height <<< "${dimensions}"
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

#!/usr/bin/env bash
set -euo pipefail

if [ "$#" -lt 2 ] || [ "$#" -gt 3 ]; then
  echo "Usage: bash scripts/generate-thumbnail.sh <source-image> <output-jpg> [size]"
  exit 1
fi

SOURCE_IMAGE="$1"
OUTPUT_IMAGE="$2"
SIZE="${3:-128}"
TMP_DIR="$(mktemp -d)"
SQUARE_IMAGE="${TMP_DIR}/square.png"

cleanup() {
  rm -rf "${TMP_DIR}"
}

trap cleanup EXIT

if ! command -v sips >/dev/null 2>&1; then
  echo "sips is required to generate thumbnails."
  exit 1
fi

if [ ! -f "${SOURCE_IMAGE}" ]; then
  echo "Source image not found: ${SOURCE_IMAGE}"
  exit 1
fi

sips -c 1024 1024 "${SOURCE_IMAGE}" --out "${SQUARE_IMAGE}" >/dev/null
sips -Z "${SIZE}" -s format jpeg "${SQUARE_IMAGE}" --out "${OUTPUT_IMAGE}" >/dev/null

echo "Created thumbnail: ${OUTPUT_IMAGE}"

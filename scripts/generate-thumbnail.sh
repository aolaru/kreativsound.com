#!/usr/bin/env bash
set -euo pipefail

if [ "$#" -lt 2 ] || [ "$#" -gt 3 ]; then
  echo "Usage: bash scripts/generate-thumbnail.sh <source-image> <output-jpg> [size]"
  exit 1
fi

SOURCE_IMAGE="$1"
OUTPUT_IMAGE="$2"
SIZE="${3:-256}"

if [ ! -f "${SOURCE_IMAGE}" ]; then
  echo "Source image not found: ${SOURCE_IMAGE}"
  exit 1
fi

python3 - "${SOURCE_IMAGE}" "${OUTPUT_IMAGE}" "${SIZE}" <<'PY'
import sys
from pathlib import Path

from PIL import Image

source_path = Path(sys.argv[1])
output_path = Path(sys.argv[2])
size = int(sys.argv[3])

image = Image.open(source_path).convert("RGB")
width, height = image.size

# Gumroad covers often place the artwork inside a centered dark frame.
# Detect the visible art, expand slightly, then crop to a square around it.
threshold = 18
padding_ratio = 0.07

xs = []
ys = []
for y in range(height):
    for x in range(width):
        r, g, b = image.getpixel((x, y))
        if max(r, g, b) > threshold:
            xs.append(x)
            ys.append(y)

if xs and ys:
    left = min(xs)
    top = min(ys)
    right = max(xs) + 1
    bottom = max(ys) + 1
else:
    left, top, right, bottom = 0, 0, width, height

padding = int(min(width, height) * padding_ratio)
left = max(0, left - padding)
top = max(0, top - padding)
right = min(width, right + padding)
bottom = min(height, bottom + padding)

crop_width = right - left
crop_height = bottom - top
side = min(max(crop_width, crop_height), width, height)

center_x = (left + right) / 2
center_y = (top + bottom) / 2

square_left = max(0, min(width - side, int(round(center_x - side / 2))))
square_top = max(0, min(height - side, int(round(center_y - side / 2))))
square_right = square_left + side
square_bottom = square_top + side

cropped = image.crop((square_left, square_top, square_right, square_bottom))
resized = cropped.resize((size, size), Image.Resampling.LANCZOS)
resized.save(output_path, format="JPEG", quality=86, optimize=True)
PY

echo "Created thumbnail: ${OUTPUT_IMAGE}"

#!/usr/bin/env node
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const THUMB_DIR = path.join(process.cwd(), "public/assets/thumbs");
const MAX_BYTES = Number.parseInt(process.argv[2] ?? "250000", 10);
const MIN_EDGE = Number.parseInt(process.argv[3] ?? "128", 10);
const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp"]);

if (!Number.isFinite(MAX_BYTES) || MAX_BYTES <= 0) {
  console.error("Invalid max byte limit.");
  process.exit(1);
}

if (!Number.isFinite(MIN_EDGE) || MIN_EDGE <= 0) {
  console.error("Invalid minimum edge size.");
  process.exit(1);
}

function readUInt24LE(buffer, offset) {
  return buffer[offset] | (buffer[offset + 1] << 8) | (buffer[offset + 2] << 16);
}

function parsePng(buffer) {
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  if (buffer.length < 24 || !buffer.subarray(0, 8).equals(signature)) {
    return null;
  }

  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
  };
}

function parseJpeg(buffer) {
  if (buffer.length < 4 || buffer[0] !== 0xff || buffer[1] !== 0xd8) {
    return null;
  }

  let offset = 2;
  const startOfFrameMarkers = new Set([
    0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf,
  ]);

  while (offset + 4 <= buffer.length) {
    while (offset < buffer.length && buffer[offset] === 0xff) {
      offset += 1;
    }

    const marker = buffer[offset];
    offset += 1;

    if (marker === 0xda || marker === 0xd9) {
      break;
    }

    if (marker >= 0xd0 && marker <= 0xd7) {
      continue;
    }

    if (offset + 2 > buffer.length) {
      break;
    }

    const segmentLength = buffer.readUInt16BE(offset);
    if (segmentLength < 2 || offset + segmentLength > buffer.length) {
      break;
    }

    if (startOfFrameMarkers.has(marker)) {
      if (segmentLength < 7) {
        break;
      }

      return {
        height: buffer.readUInt16BE(offset + 3),
        width: buffer.readUInt16BE(offset + 5),
      };
    }

    offset += segmentLength;
  }

  throw new Error("Unable to read JPEG dimensions.");
}

function parseWebp(buffer) {
  if (
    buffer.length < 30 ||
    buffer.toString("ascii", 0, 4) !== "RIFF" ||
    buffer.toString("ascii", 8, 12) !== "WEBP"
  ) {
    return null;
  }

  const chunkType = buffer.toString("ascii", 12, 16);

  if (chunkType === "VP8X") {
    return {
      width: readUInt24LE(buffer, 24) + 1,
      height: readUInt24LE(buffer, 27) + 1,
    };
  }

  if (chunkType === "VP8 ") {
    const chunkStart = 20;
    if (
      buffer.length < chunkStart + 10 ||
      buffer[chunkStart + 3] !== 0x9d ||
      buffer[chunkStart + 4] !== 0x01 ||
      buffer[chunkStart + 5] !== 0x2a
    ) {
      throw new Error("Unable to read VP8 WebP dimensions.");
    }

    return {
      width: buffer.readUInt16LE(chunkStart + 6) & 0x3fff,
      height: buffer.readUInt16LE(chunkStart + 8) & 0x3fff,
    };
  }

  if (chunkType === "VP8L") {
    const chunkStart = 20;
    if (buffer.length < chunkStart + 5 || buffer[chunkStart] !== 0x2f) {
      throw new Error("Unable to read VP8L WebP dimensions.");
    }

    const bits = buffer.readUInt32LE(chunkStart + 1);
    return {
      width: (bits & 0x3fff) + 1,
      height: ((bits >> 14) & 0x3fff) + 1,
    };
  }

  throw new Error(`Unsupported WebP chunk type: ${chunkType}`);
}

function getDimensions(buffer) {
  return parsePng(buffer) ?? parseJpeg(buffer) ?? parseWebp(buffer);
}

let status = 0;
const entries = await readdir(THUMB_DIR, { withFileTypes: true });

for (const entry of entries) {
  if (!entry.isFile() || !IMAGE_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
    continue;
  }

  const imagePath = path.join(THUMB_DIR, entry.name);
  const image = await readFile(imagePath);

  try {
    const dimensions = getDimensions(image);
    if (!dimensions) {
      throw new Error("Unsupported image format.");
    }

    if (dimensions.width < MIN_EDGE || dimensions.height < MIN_EDGE) {
      console.log(
        `Invalid dimensions: ${imagePath} (${dimensions.width}x${dimensions.height}, minimum ${MIN_EDGE}px per edge)`,
      );
      status = 1;
    }

    if (image.length > MAX_BYTES) {
      console.log(`File too large: ${imagePath} (${image.length} bytes, max ${MAX_BYTES})`);
      status = 1;
    }
  } catch (error) {
    console.error(`Unable to inspect thumbnail: ${imagePath}`);
    console.error(error instanceof Error ? error.message : error);
    status = 1;
  }
}

if (status === 0) {
  console.log("All thumbnails passed.");
}

process.exit(status);

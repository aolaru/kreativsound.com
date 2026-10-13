"use strict";

// Read container metadata before Web Audio can resample it to the device rate.
function readSourceAudioMetadata(arrayBuffer) {
  const view = new DataView(arrayBuffer);
  const tag = (offset, length = 4) => offset + length <= view.byteLength
    ? String.fromCharCode(...new Uint8Array(arrayBuffer, offset, length)) : "";
  const valid = (sampleRate, channels, bitDepth = null) => (
    Number.isInteger(sampleRate) && sampleRate > 0 && channels > 0
      ? { sampleRate, channels, bitDepth } : { sampleRate: null, channels: null, bitDepth: null }
  );
  const unknown = valid(0, 0);

  const riff = tag(0);
  if ((riff === "RIFF" || riff === "RIFX") && tag(8) === "WAVE") {
    const littleEndian = riff === "RIFF";
    for (let offset = 12; offset + 8 <= view.byteLength;) {
      const size = view.getUint32(offset + 4, littleEndian);
      if (size > view.byteLength - offset - 8) return unknown;
      if (tag(offset) === "fmt " && size >= 16) {
        return valid(view.getUint32(offset + 12, littleEndian),
          view.getUint16(offset + 10, littleEndian), view.getUint16(offset + 22, littleEndian));
      }
      offset += 8 + size + (size % 2);
    }
    return unknown;
  }

  if (tag(0) === "FORM" && ["AIFF", "AIFC"].includes(tag(8))) {
    for (let offset = 12; offset + 8 <= view.byteLength;) {
      const size = view.getUint32(offset + 4);
      if (size > view.byteLength - offset - 8) return unknown;
      if (tag(offset) === "COMM" && size >= 18) {
        // AIFF stores the rate as an 80-bit extended floating-point value.
        const exponent = view.getUint16(offset + 16);
        const mantissa = view.getUint32(offset + 18) * 2 ** 32 + view.getUint32(offset + 22);
        const rate = exponent & 0x8000 ? 0 : mantissa * 2 ** ((exponent & 0x7fff) - 16383 - 63);
        return valid(rate, view.getUint16(offset + 8), view.getUint16(offset + 14));
      }
      offset += 8 + size + (size % 2);
    }
    return unknown;
  }

  if (tag(0) === "fLaC" && view.byteLength >= 42 && (view.getUint8(4) & 0x7f) === 0) {
    const length = (view.getUint8(5) << 16) | (view.getUint8(6) << 8) | view.getUint8(7);
    if (length !== 34) return unknown;
    const packed = view.getUint32(18);
    return valid(packed >>> 12, ((packed >>> 9) & 7) + 1, ((packed >>> 4) & 31) + 1);
  }

  let start = 0;
  if (tag(0, 3) === "ID3" && view.byteLength >= 10) {
    const size = [6, 7, 8, 9].reduce((value, offset) => value * 128 + (view.getUint8(offset) & 0x7f), 0);
    start = 10 + size + (view.getUint8(3) === 4 && (view.getUint8(5) & 0x10) ? 10 : 0);
  } else if (view.byteLength < 2 || view.getUint8(0) !== 0xff || (view.getUint8(1) & 0xe0) !== 0xe0) {
    return unknown;
  }
  // MPEG audio frame headers carry rate and channel mode, but no PCM bit depth.
  for (let offset = start; offset + 4 <= Math.min(view.byteLength, start + 65536); offset += 1) {
    const header = view.getUint32(offset);
    if ((header >>> 21) !== 0x7ff) continue;
    const version = (header >>> 19) & 3;
    const layer = (header >>> 17) & 3;
    const bitrate = (header >>> 12) & 15;
    const rateIndex = (header >>> 10) & 3;
    if (version === 1 || layer === 0 || bitrate === 0 || bitrate === 15 || rateIndex === 3) continue;
    const rate = [44100, 48000, 32000][rateIndex] / (version === 3 ? 1 : version === 2 ? 2 : 4);
    return valid(rate, ((header >>> 6) & 3) === 3 ? 1 : 2);
  }
  return unknown;
}

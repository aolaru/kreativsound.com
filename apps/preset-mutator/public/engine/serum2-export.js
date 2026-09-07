import {
  buildGeneratedSerum2Document,
  buildSerum2Container,
  parseSerum2Container,
} from "./serum2-format.js";
import { sanitizeFileName } from "./common.js";

let codecPromise;

async function loadCodecs() {
  if (!codecPromise) {
    codecPromise = (async () => {
      if (!globalThis.CBOR?.encode || !globalThis.CBOR?.decode || !globalThis.SparkMD5?.ArrayBuffer) {
        throw new Error("Serum 2 export support did not initialize. Refresh the page and try again.");
      }
      const { Zstd } = await import("/preset-mutator/vendor/zstd.js");
      const zstd = await Zstd.load();
      const encoder = new globalThis.CBOR.Encoder({ useRecords: false, variableMapSize: true });
      return {
        encode: (value) => encoder.encode(value),
        decode: globalThis.CBOR.decode,
        compress: (bytes, level) => zstd.compress(bytes, level),
        decompress: (bytes) => zstd.decompress(bytes),
        md5: (bytes) => globalThis.SparkMD5.ArrayBuffer.hash(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength)),
      };
    })();
  }
  return codecPromise;
}

export async function parseSerum2Preset(input) {
  return parseSerum2Container(input, await loadCodecs());
}

export async function createSerum2PresetBlob(seedBytes, preset) {
  const codecs = await loadCodecs();
  const seedDocument = parseSerum2Container(seedBytes, codecs);
  const document = buildGeneratedSerum2Document(seedDocument, preset);
  const bytes = buildSerum2Container(document, codecs);
  return {
    fileName: `${sanitizeFileName(preset.name)}.SerumPreset`,
    blob: new Blob([bytes], { type: "application/octet-stream" }),
  };
}

export async function createSerum2VariantBlob(variant) {
  const codecs = await loadCodecs();
  const bytes = buildSerum2Container({ metadata: variant.metadata, data: variant.data }, codecs);
  return {
    fileName: variant.downloadName,
    blob: new Blob([bytes], { type: "application/octet-stream" }),
  };
}

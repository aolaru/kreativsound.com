export const FAMILY_LABELS = {
  pad: "Pad / Atmosphere",
  pluck: "Pluck / Keys",
  bass: "Bass",
  texture: "Drone / Texture",
};

export function clamp(value, min = 0, max = 1) {
  return Math.min(max, Math.max(min, Number(value)));
}

export function lerp(min, max, amount) {
  return min + (max - min) * amount;
}

export function cloneJson(value) {
  return JSON.parse(JSON.stringify(value));
}

export function formatHz(value) {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(2)} kHz`;
  }
  return `${Math.round(value)} Hz`;
}

export function familyLabel(family) {
  return FAMILY_LABELS[family] || family;
}

export function noteName(frequency) {
  if (!frequency || !Number.isFinite(frequency)) {
    return "Unknown";
  }

  const midi = Math.round(69 + 12 * Math.log2(frequency / 440));
  const names = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  return `${names[((midi % 12) + 12) % 12]}${Math.floor(midi / 12) - 1}`;
}

export function sanitizeFileName(value, fallback = "Preset Mutator Vital") {
  return String(value || "").replace(/[<>:"/\\|?*\u0000-\u001f]/g, "").trim() || fallback;
}

export function slugifyFilename(value, fallback = "preset-mutator-variant") {
  return sanitizeFileName(value, fallback);
}

export function titleCase(value) {
  return String(value || "")
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 5)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function variantSeed(index) {
  const x = Math.sin((index + 1) * 97.13) * 43758.5453;
  return x - Math.floor(x);
}

export function vary(base, amount, index, shift = 0, min = 0, max = 1) {
  const seed = variantSeed(index + shift);
  return clamp(Number(base) + (seed * 2 - 1) * amount, min, max);
}

export function hashString(input) {
  let hash = 0;
  for (let index = 0; index < input.length; index += 1) {
    hash = (hash * 31 + input.charCodeAt(index)) >>> 0;
  }
  return hash || 1;
}

export function createRng(seed) {
  let value = seed >>> 0;
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 4294967296;
  };
}

export function countBucket(count) {
  if (count <= 8) {
    return "small";
  }
  if (count <= 24) {
    return "medium";
  }
  return "large";
}

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

export function createGenerationSeed() {
  const values = new Uint32Array(1);
  if (globalThis.crypto?.getRandomValues) {
    globalThis.crypto.getRandomValues(values);
    return values[0];
  }

  return (Date.now() ^ Math.floor(Math.random() * 0xffffffff)) >>> 0;
}

export function variantSeed(index, generationSeed = 0) {
  const runOffset = hashString(String(generationSeed)) % 100000;
  const x = Math.sin((index + 1) * 97.13 + runOffset * 0.017) * 43758.5453;
  return x - Math.floor(x);
}

export function vary(base, amount, index, shift = 0, min = 0, max = 1, generationSeed = 0) {
  const seed = variantSeed(index + shift, generationSeed);
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

const DIVERSITY_PARAMETERS = [
  ["filter_1_cutoff", 100],
  ["filter_1_resonance", 1],
  ["osc_1_level", 1],
  ["osc_2_level", 1],
  ["osc_3_level", 1],
  ["noise_level", 1],
  ["reverb_dry_wet", 1],
  ["delay_dry_wet", 1],
  ["delay_feedback", 1],
  ["distortion_mix", 1],
  ["macro_control_1", 1],
  ["macro_control_2", 1],
  ["macro_control_3", 1],
  ["macro_control_4", 1],
  ["lfo_1_frequency", 8],
];

export function presetParameterDistance(left, right) {
  if (left.topology !== right.topology) {
    return 1;
  }

  const leftMap = left.parameterMap || left.data?.settings || {};
  const rightMap = right.parameterMap || right.data?.settings || {};
  const total = DIVERSITY_PARAMETERS.reduce((sum, [key, scale]) => {
    return sum + Math.abs(Number(leftMap[key] || 0) - Number(rightMap[key] || 0)) / scale;
  }, 0);
  return total / DIVERSITY_PARAMETERS.length;
}

function nearestDistance(candidate, selected) {
  return selected.reduce((minimum, existing) => Math.min(minimum, presetParameterDistance(existing, candidate)), 1);
}

export function buildDiversePack(count, createCandidate, minimumDistance = 0.01) {
  const selected = [];

  for (let index = 0; index < count; index += 1) {
    let bestCandidate = createCandidate(index, 0);
    let bestDistance = nearestDistance(bestCandidate, selected);
    let bestAttempt = 0;

    for (let attempt = 1; attempt <= 12 && bestDistance < minimumDistance; attempt += 1) {
      const candidate = createCandidate(index, attempt);
      const distance = nearestDistance(candidate, selected);
      if (distance > bestDistance) {
        bestCandidate = candidate;
        bestDistance = distance;
        bestAttempt = attempt;
      }
    }

    selected.push({ ...bestCandidate, diversityRetries: bestAttempt, diversityDistance: bestDistance });
  }

  return selected;
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

export function ensureJsZip() {
  if (window.JSZip) {
    return Promise.resolve(window.JSZip);
  }

  return new Promise((resolve, reject) => {
    const existing = document.querySelector("script[data-jszip-loader]");
    if (existing) {
      existing.addEventListener("load", () => resolve(window.JSZip), { once: true });
      existing.addEventListener("error", () => reject(new Error("ZIP export is not available right now.")), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js";
    script.async = true;
    script.dataset.jszipLoader = "true";
    script.addEventListener("load", () => resolve(window.JSZip), { once: true });
    script.addEventListener("error", () => reject(new Error("ZIP export is not available right now.")), { once: true });
    document.head.appendChild(script);
  });
}

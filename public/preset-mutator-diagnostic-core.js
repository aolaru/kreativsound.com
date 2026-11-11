export const DIAGNOSTIC_SCHEMA_VERSION = 1;
export const ISSUE_TYPES = {
  modulation: "Too much modulation",
  pitch: "Wrong pitch",
  harshness: "Too noisy or harsh",
  resemblance: "Does not resemble source",
  loading: "Will not load in synth",
  export: "Generation or download failed",
  other: "Other",
};

const NUMERIC_FIELDS = [
  "mutationAmount", "brightness", "body", "attack", "sustain", "movement", "noise", "width", "wetness", "wash", "drive", "pitchHz",
  "amount", "tone", "motion", "space", "dirt", "texture", "brightnessBias", "movementBias", "attackBias", "dirtBias", "widthBias",
  "pitchConfidence", "centroidHz", "rms", "peak", "zeroCrossRate", "onsetRatio", "sustainRatio", "flatness", "stereoWidth", "duration", "sampleRate", "channels",
];

function pickNumbers(source = {}) {
  return Object.fromEntries(NUMERIC_FIELDS.filter((key) => typeof source[key] === "number" && Number.isFinite(source[key])).map((key) => [key, source[key]]));
}
function oneOf(value, choices, fallback = null) {
  return choices.includes(value) ? value : fallback;
}

export function sanitizeGenerationContext(input = {}) {
  const seed = input.seed ?? input.generationSeed;
  const variation = input.variationOptions || input.variation || {};
  const profile = pickNumbers(input.profile);
  for (const [key, values] of Object.entries({ family: ["pad", "pluck", "bass", "texture"], mood: ["dark", "warm", "clean", "broken"], register: ["low", "mid", "high"] })) {
    if (values.includes(input.profile?.[key])) profile[key] = input.profile[key];
  }
  return {
    synth: oneOf(input.synth, ["vital", "serum2", "pigments"]),
    generationSeed: Number.isSafeInteger(seed) ? seed : null,
    profile,
    controls: pickNumbers(input.controls),
    audioAnalysis: pickNumbers(input.analysis || input.audioAnalysis),
    variation: {
      direction: oneOf(variation.direction, ["stay-close", "explore", "reimagine"]),
      locks: Object.fromEntries(["oscillators", "envelopes", "filters", "effects"].map((key) => [key, variation.locks?.[key] === true])),
    },
  };
}

export function makeDiagnosticReport({ edition, mode, version, context, resultIndex = null, resultCount = 0, errors = [], environment = {} }, feedback = {}) {
  return {
    schemaVersion: DIAGNOSTIC_SCHEMA_VERSION,
    createdAt: new Date().toISOString(),
    application: {
      name: "Preset Mutator",
      edition: oneOf(edition, ["lite", "pro"]),
      version: /^\d+\.\d+\.\d+$/.test(version || "") ? version : "unknown",
      mode: oneOf(mode, ["scratch", "mutate", "audio"]),
    },
    generation: sanitizeGenerationContext(context),
    selectedResultIndex: Number.isInteger(resultIndex) && resultIndex >= 0 && resultIndex < 32 ? resultIndex : null,
    resultCount: Number.isInteger(resultCount) ? Math.max(0, Math.min(32, resultCount)) : 0,
    environment: {
      browser: oneOf(environment.browser, ["Chrome", "Edge", "Firefox", "Safari", "Other"], "Other"),
      system: oneOf(environment.system, ["macOS", "Windows", "Linux", "iOS", "Android", "Other"], "Other"),
    },
    errors: errors.slice(-5).filter((item) => ["generation", "export", "source-import"].includes(item.stage)).map((item) => ({ stage: item.stage, code: "operation-failed" })),
    feedback: {
      issue: Object.hasOwn(ISSUE_TYPES, feedback.issue) ? feedback.issue : null,
      comment: String(feedback.comment || "").slice(0, 2000),
    },
    privacy: {
      automaticallyUploaded: false,
      sourceFilesIncluded: false,
      generatedFilesIncluded: false,
      excludedFromTechnicalReport: ["license keys", "purchase details", "original filenames", "custom intent text", "raw error messages and stacks"],
    },
    attachments: [],
  };
}

export function diagnosticAttachmentName(kind, fileName) {
  const extension = String(fileName || "").split(".").at(-1).toLowerCase();
  const safeExtension = ["vital", "serumpreset", "pgtx", "wav", "mp3", "aif", "aiff", "m4a", "aac", "ogg", "flac"].includes(extension) ? extension : "bin";
  return `${kind === "source" ? "source" : "generated"}.${safeExtension}`;
}

export async function buildDiagnosticBundle(report, attachments, JSZip) {
  const zip = new JSZip();
  const manifest = structuredClone(report);
  const chosen = attachments.filter((item) => item?.blob && ["source", "generated"].includes(item.kind));
  const total = chosen.reduce((size, item) => size + item.blob.size, 0);
  if (total > 25 * 1024 * 1024) throw new Error("Selected files exceed the 25 MB diagnostic limit. Download the report without attachments instead.");
  manifest.attachments = chosen.map((item) => ({ kind: item.kind, file: diagnosticAttachmentName(item.kind, item.fileName), bytes: item.blob.size }));
  manifest.privacy.sourceFilesIncluded = chosen.some((item) => item.kind === "source");
  manifest.privacy.generatedFilesIncluded = chosen.some((item) => item.kind === "generated");
  if (chosen.length) manifest.privacy.attachmentWarning = "Optional files are unredacted and can contain filenames, custom text, author details, embedded samples, and other metadata.";
  zip.file("diagnostic.json", JSON.stringify(manifest, null, 2));
  zip.file("README.txt", [
    "Preset Mutator diagnostic bundle",
    "This ZIP was created locally. It has not been uploaded or emailed automatically.",
    "Review diagnostic.json and any optional attachments before sharing.",
    "To request help, email info@kreativsound.com and attach this ZIP yourself.",
    "The report records the generation settings, not the current positions of controls changed afterward.",
    "Original filenames and custom intent text are omitted from the report. Optional attached files are unredacted.",
    "Scratch/Audio profiles and seeds can help reconstruct generation, but cannot establish resemblance without source audio.",
    "Imported-preset mutation may require the source and generated files for diagnosis; filenames also influence its random seed.",
    "No diagnostic history is saved to browser storage. This report covers this page session only.",
    "This is a technical report, not permission to reuse uploaded sounds in products or training.",
  ].join("\n\n"));
  for (const item of chosen) zip.file(diagnosticAttachmentName(item.kind, item.fileName), new Uint8Array(await item.blob.arrayBuffer()));
  return { bytes: await zip.generateAsync({ type: "uint8array", compression: "STORE" }), manifest };
}

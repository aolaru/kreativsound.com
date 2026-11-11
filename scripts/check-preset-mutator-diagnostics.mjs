import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import { makeDiagnosticReport, sanitizeGenerationContext, buildDiagnosticBundle, diagnosticAttachmentName } from "../public/preset-mutator-diagnostic-core.js";
import { readZipEntries } from "../apps/preset-mutator/public/engine/pigments-format.js";

const root = new URL("../", import.meta.url);
const read = (path) => fs.readFileSync(new URL(path, root), "utf8");
const zipModule = { exports: {} };
vm.runInNewContext(read("public/vendor/jszip.min.js"), { module: zipModule, exports: zipModule.exports, Uint8Array, ArrayBuffer, Buffer, setImmediate, setTimeout, clearTimeout, Promise });
const JSZip = zipModule.exports;
const privateMarker = "PRIVATE_DATA_MUST_NOT_LEAK";
const raw = {
  synth: "pigments", seed: 938479,
  profile: { family: "pad", register: "low", brightness: 0.23456789, movement: 0.4, pitchHz: 146.82, intent: privateMarker, license: privateMarker },
  analysis: { centroidHz: 901.4, rms: 0.2, sourceName: privateMarker, waveform: [privateMarker] },
  controls: { amount: 0.5, author: privateMarker },
  variationOptions: { direction: "reimagine", locks: { oscillators: true, effects: false, token: privateMarker } },
  sourceFile: { name: privateMarker }, license: privateMarker, email: privateMarker,
};
const sanitized = sanitizeGenerationContext(raw);
assert.deepEqual(sanitizeGenerationContext(sanitized), sanitized, "Repeated sanitization must retain reproduction settings");
assert.equal(sanitized.generationSeed, 938479);
assert.equal(sanitized.audioAnalysis.centroidHz, 901.4);
assert.equal(sanitized.variation.direction, "reimagine");
assert.equal(sanitized.variation.locks.oscillators, true);
raw.profile.brightness = 0.9;
assert.equal(sanitized.profile.brightness, 0.23456789, "Generation snapshots cannot follow later input changes");

const report = makeDiagnosticReport({ edition: "pro", mode: "audio", version: "0.6.0", context: sanitized, resultIndex: 3, resultCount: 32,
  errors: [{ stage: "export", message: privateMarker, stack: privateMarker }, { stage: "license", message: privateMarker }],
  environment: { browser: "Chrome", system: "macOS", userAgent: privateMarker } }, { issue: "resemblance", comment: "The output is too modulated." });
assert(!JSON.stringify(report).includes(privateMarker));
assert.equal(report.errors.length, 1);
assert.equal(report.feedback.issue, "resemblance");
assert.equal(report.generation.profile.brightness, 0.23456789);
assert.equal(report.generation.audioAnalysis.centroidHz, 901.4);
assert.equal(report.generation.generationSeed, 938479);
assert.deepEqual(report.attachments, []);
assert.equal(report.privacy.automaticallyUploaded, false);

const decoder = new TextDecoder();
async function unpack(bundle) {
  const entries = await readZipEntries(bundle.bytes);
  return new Map(entries.map((entry) => [entry.name, decoder.decode(entry.data)]));
}
const defaultBundle = await buildDiagnosticBundle(report, [], JSZip);
const defaultFiles = await unpack(defaultBundle);
assert.deepEqual([...defaultFiles.keys()], ["diagnostic.json", "README.txt"]);
assert.equal(JSON.parse(defaultFiles.get("diagnostic.json")).privacy.sourceFilesIncluded, false);
assert(![...defaultFiles.values()].join("").includes(privateMarker));
assert.deepEqual(report.attachments, [], "Building an attachment bundle must not mutate the original report");

const attached = await buildDiagnosticBundle(report, [
  { kind: "source", fileName: "private-project-user@example.com.wav", blob: new Blob(["SOURCE_CONTENT"]) },
  { kind: "generated", fileName: "private-preset-title.pgtx", blob: new Blob(["OUTPUT_CONTENT"]) },
], JSZip);
const files = await unpack(attached);
assert.deepEqual([...files.keys()], ["diagnostic.json", "README.txt", "source.wav", "generated.pgtx"]);
assert.equal(files.get("source.wav"), "SOURCE_CONTENT");
assert.equal(files.get("generated.pgtx"), "OUTPUT_CONTENT");
assert(!files.get("diagnostic.json").includes("user@example.com"));
assert.equal(attached.manifest.privacy.sourceFilesIncluded, true);
assert.equal(attached.manifest.privacy.generatedFilesIncluded, true);
assert(attached.manifest.privacy.attachmentWarning.includes("unredacted"));
assert.equal(diagnosticAttachmentName("source", "../../private-name.exe"), "source.bin");
assert.equal(diagnosticAttachmentName("generated", "Customer.SerumPreset"), "generated.serumpreset");
await assert.rejects(buildDiagnosticBundle(report, [{ kind: "source", fileName: "large.wav", blob: new Blob([new Uint8Array(26 * 1024 * 1024)]) }], JSZip), /25 MB/);

const ui = read("public/preset-mutator-diagnostics.js");
assert(!/\b(fetch|XMLHttpRequest|sendBeacon|localStorage|sessionStorage)\b/.test(ui), "Diagnostics must not transmit reports or persist session history");
assert(ui.includes("generated.checked = false; source.checked = false;"));
assert(ui.includes('textContent = JSON.stringify'), "Preview user comments as text, not HTML");
assert(ui.includes('new WeakMap()'), "Keep separate snapshots for earlier result sets");
assert(ui.includes("stored.buildPreset(target)"), "Attachments must follow the displayed synth target");
assert(ui.includes("sourceFile: null") || ui.includes("sourceFile = null"));
for (const edition of ["preset-mutator", "preset-mutator-pro"]) {
  for (const mode of ["", "audio/", "mutate/"]) {
    const app = read(`apps/${edition}/public/${mode}app.js`);
    assert(app.includes('from "/preset-mutator-diagnostics.js"'));
    assert(app.includes("diagnostics.capture("), `${edition}/${mode}: capture actual generation context`);
    assert(app.includes("diagnostics.bindResult("), `${edition}/${mode}: report action on each result`);
    assert(app.includes('diagnostics.recordError("export")'));
  }
  const worker = read(`apps/${edition}/public/service-worker.js`);
  for (const asset of ["/preset-mutator-diagnostics.js", "/preset-mutator-diagnostic-core.js", "/preset-mutator-diagnostics.css", "/vendor/jszip.min.js"]) assert(worker.includes(`"${asset}"`));
}
console.log("Diagnostic checks passed: privacy allowlists, immutable settings, real ZIP contents, opt-in files, size limits, all six paths, and offline assets.");

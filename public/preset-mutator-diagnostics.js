import { ISSUE_TYPES, makeDiagnosticReport, sanitizeGenerationContext, buildDiagnosticBundle, diagnosticAttachmentName } from "./preset-mutator-diagnostic-core.js";

let zipLoader;
function loadZipLibrary() {
  if (window.JSZip) return Promise.resolve(window.JSZip);
  if (zipLoader) return zipLoader;
  zipLoader = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "/vendor/jszip.min.js";
    script.onload = () => window.JSZip ? resolve(window.JSZip) : reject(new Error("The diagnostic ZIP library did not load."));
    script.onerror = () => { script.remove(); zipLoader = null; reject(new Error("Could not load the diagnostic ZIP library. Try again when this page is available offline or online.")); };
    document.head.appendChild(script);
  });
  return zipLoader;
}

function browserEnvironment() {
  const agent = navigator.userAgent;
  return {
    browser: /Edg\//.test(agent) ? "Edge" : /Firefox\//.test(agent) ? "Firefox" : /Chrome\//.test(agent) ? "Chrome" : /Safari\//.test(agent) ? "Safari" : "Other",
    system: /Android/.test(agent) ? "Android" : /iPhone|iPad/.test(agent) ? "iOS" : /Macintosh/.test(agent) ? "macOS" : /Windows/.test(agent) ? "Windows" : /Linux/.test(agent) ? "Linux" : "Other",
  };
}

export function createPresetDiagnostics({ edition, mode, getContext = () => ({}) }) {
  const snapshots = new WeakMap();
  let latest = null;
  const errors = [];
  const version = document.querySelector(".app-footer")?.textContent.match(/\bv(\d+\.\d+\.\d+)\b/i)?.[1] || "unknown";
  const css = document.createElement("link");
  css.rel = "stylesheet";
  css.href = "/preset-mutator-diagnostics.css";
  document.head.appendChild(css);

  const dialog = document.createElement("dialog");
  dialog.className = "preset-diagnostic-dialog";
  dialog.setAttribute("aria-labelledby", "diagnostic-title");
  dialog.innerHTML = `
    <header><h2 id="diagnostic-title">Diagnostic report</h2><button type="button" class="diagnostic-icon" data-close title="Close" aria-label="Close diagnostic report"><i class="fa-solid fa-xmark" aria-hidden="true"></i></button></header>
    <p class="diagnostic-context"></p>
    <p class="diagnostic-notice">Created on this device. Nothing is uploaded or sent automatically.</p>
    <label for="diagnostic-issue">What went wrong?</label>
    <select id="diagnostic-issue"><option value="">Select an issue (optional)</option>${Object.entries(ISSUE_TYPES).map(([key, label]) => `<option value="${key}">${label}</option>`).join("")}</select>
    <label for="diagnostic-comment">Comment (optional)</label>
    <textarea id="diagnostic-comment" rows="3" maxlength="2000" placeholder="What did you expect, and what happened? Do not include license keys or private account details."></textarea>
    <fieldset><legend>Optional files</legend>
      <label class="diagnostic-check"><input type="checkbox" data-generated> Include selected generated preset</label>
      <label class="diagnostic-check"><input type="checkbox" data-source> Include original source file</label>
      <p>Attached files are unredacted and may contain names, embedded samples, entire preset banks, or private metadata. Include only material you are allowed to share. Maximum combined size: 25 MB.</p>
    </fieldset>
    <details open><summary>Review bundle contents</summary><ul class="diagnostic-files"></ul><pre class="diagnostic-preview" tabindex="0" aria-label="Diagnostic report preview"></pre></details>
    <p class="diagnostic-status" role="status" aria-live="polite"></p>
    <div class="diagnostic-actions"><button type="button" class="diagnostic-download"><i class="fa-solid fa-download" aria-hidden="true"></i> Download diagnostic ZIP</button><a class="diagnostic-email" href="mailto:info@kreativsound.com?subject=Preset%20Mutator%20diagnostic%20report">Email support</a></div>
    <p class="diagnostic-email-note">After downloading, attach the ZIP to an email to info@kreativsound.com. The Email support link opens your mail app without attaching or sending files. <a href="/privacy/" target="_blank" rel="noopener noreferrer">Privacy details</a>.</p>`;
  document.body.appendChild(dialog);
  const issue = dialog.querySelector("#diagnostic-issue");
  const comment = dialog.querySelector("#diagnostic-comment");
  const generated = dialog.querySelector("[data-generated]");
  const source = dialog.querySelector("[data-source]");
  const status = dialog.querySelector(".diagnostic-status");
  const download = dialog.querySelector(".diagnostic-download");
  let active;
  let opener;
  let busy = false;

  function report() {
    const value = makeDiagnosticReport({ edition, mode, version, context: active?.context || getContext(), resultIndex: active?.resultIndex, resultCount: active?.resultCount, environment: browserEnvironment(), errors }, { issue: issue.value, comment: comment.value });
    value.attachments = [
      ...(generated.checked && active?.buildPreset ? [{ kind: "generated", file: `generated.${active.context.synth === "serum2" ? "serumpreset" : active.context.synth === "pigments" ? "pgtx" : "vital"}` }] : []),
      ...(source.checked && active?.sourceFile ? [{ kind: "source", file: diagnosticAttachmentName("source", active.sourceFile.name), bytes: active.sourceFile.size }] : []),
    ];
    value.privacy.sourceFilesIncluded = value.attachments.some((item) => item.kind === "source");
    value.privacy.generatedFilesIncluded = value.attachments.some((item) => item.kind === "generated");
    if (value.attachments.length) value.privacy.attachmentWarning = "Optional files are unredacted.";
    return value;
  }
  function preview() {
    const value = report();
    dialog.querySelector(".diagnostic-preview").textContent = JSON.stringify(value, null, 2);
    const files = dialog.querySelector(".diagnostic-files");
    files.replaceChildren();
    for (const name of ["diagnostic.json", "README.txt", ...value.attachments.map((item) => item.file)]) {
      const item = document.createElement("li"); item.textContent = name; files.appendChild(item);
    }
  }
  function open(snapshot, button) {
    active = snapshot;
    opener = button;
    issue.value = ""; comment.value = ""; generated.checked = false; source.checked = false;
    generated.disabled = !snapshot?.buildPreset;
    source.disabled = !snapshot?.sourceFile;
    status.textContent = "";
    download.disabled = false;
    dialog.querySelector(".diagnostic-context").textContent = `${edition === "pro" ? "Pro" : "Lite / Free"} v${version} / ${mode} / ${snapshot?.context?.synth || getContext().synth || "no synth selected"}${Number.isInteger(snapshot?.resultIndex) ? ` / Result ${snapshot.resultIndex + 1}` : snapshot ? " / Latest generation" : " / No generation yet"}`;
    preview();
    dialog.showModal();
    issue.focus();
  }
  dialog.querySelector("[data-close]").addEventListener("click", () => { if (!busy) dialog.close(); });
  dialog.addEventListener("cancel", (event) => { if (busy) event.preventDefault(); });
  dialog.addEventListener("close", () => { active = null; opener?.focus(); });
  for (const input of [issue, comment, generated, source]) input.addEventListener("input", preview);
  download.addEventListener("click", async () => {
    if (busy) return;
    busy = true;
    download.disabled = true;
    for (const input of [issue, comment, generated, source]) input.disabled = true;
    const selectedReport = report();
    const includeGenerated = generated.checked;
    const includeSource = source.checked;
    const snapshot = active;
    status.textContent = "Preparing local diagnostic ZIP...";
    try {
      const attachments = [];
      if (includeGenerated && snapshot?.buildPreset) {
        const payload = await snapshot.buildPreset();
        attachments.push({ kind: "generated", blob: payload.blob, fileName: payload.fileName });
      }
      if (includeSource && snapshot?.sourceFile) attachments.push({ kind: "source", blob: snapshot.sourceFile, fileName: snapshot.sourceFile.name });
      const { bytes, manifest } = await buildDiagnosticBundle(selectedReport, attachments, await loadZipLibrary());
      dialog.querySelector(".diagnostic-preview").textContent = JSON.stringify(manifest, null, 2);
      const url = URL.createObjectURL(new Blob([bytes], { type: "application/zip" }));
      const link = document.createElement("a");
      link.href = url; link.download = `preset-mutator-${edition}-${mode}-diagnostic.zip`;
      document.body.appendChild(link); link.click(); link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 30000);
      status.textContent = "Diagnostic ZIP downloaded. Nothing has been sent. You can attach it to an email to support.";
    } catch {
      status.textContent = "Could not create the ZIP. Try again without optional files, or contact info@kreativsound.com.";
    } finally {
      busy = false;
      download.disabled = false;
      issue.disabled = false; comment.disabled = false;
      generated.disabled = !active?.buildPreset; source.disabled = !active?.sourceFile;
    }
  });

  const footer = document.querySelector(".app-footer");
  const button = document.createElement("button");
  button.type = "button"; button.className = "preset-diagnostic-button";
  button.innerHTML = '<i class="fa-solid fa-file-arrow-down" aria-hidden="true"></i> Diagnostic bundle';
  button.addEventListener("click", () => open(latest, button));
  footer?.appendChild(button);
  return {
    beginGeneration(context, { sourceFile = null } = {}) {
      latest = { context: sanitizeGenerationContext(context), resultCount: 0, sourceFile };
    },
    capture(presets, context, { sourceFile = null, buildPreset } = {}) {
      const safeContext = sanitizeGenerationContext(context);
      // Keep only safe technical settings and explicit file references in memory.
      // Source data, names, license state, and intent strings never enter the report.
      latest = { context: safeContext, resultCount: presets.length, sourceFile };
      presets.forEach((preset, resultIndex) => snapshots.set(preset, { ...latest, resultIndex, buildPreset: buildPreset ? (synth = safeContext.synth) => buildPreset(preset, synth) : null }));
    },
    bindResult(card, preset, { synth } = {}) {
      const stored = snapshots.get(preset);
      if (!stored) return;
      const target = ["vital", "serum2", "pigments"].includes(synth) ? synth : stored.context.synth;
      const snapshot = { ...stored, context: { ...stored.context, synth: target }, buildPreset: stored.buildPreset ? () => stored.buildPreset(target) : null };
      const action = document.createElement("button");
      action.type = "button"; action.className = "preset-diagnostic-button";
      action.innerHTML = '<i class="fa-regular fa-flag" aria-hidden="true"></i> Report a bad result';
      action.addEventListener("click", () => open(snapshot, action));
      (card.querySelector(".preset-actions") || card).appendChild(action);
    },
    clear() { latest = null; errors.length = 0; },
    recordError(stage) { errors.push({ stage }); if (errors.length > 5) errors.shift(); },
  };
}

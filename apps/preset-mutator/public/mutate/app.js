import { PresetMutatorKnob } from "../preset-mutator-knob.js";
import {
  buildPresetMutateStrategy,
  generatePresetVariants as createPresetVariants,
  presetSummary as summarizeVitalPreset,
} from "../engine/preset-mutate-engine.js";
import { playPresetPreview } from "../engine/audio-preview.js";

const state = {
  sourcePreset: null,
  sourceFile: null,
  generatedVariants: [],
  resultSets: [],
  activeSetIndex: -1,
  variationSeed: 0,
  isGenerating: false,
  lastGenerationMode: "standard",
};

const elements = {
  fileInput: document.querySelector("#file-input"),
  uploadMessage: document.querySelector("#upload-message"),
  presetDropZone: document.querySelector("#preset-drop-zone"),
  presetName: document.querySelector("#preset-name"),
  presetAuthor: document.querySelector("#preset-author"),
  presetSample: document.querySelector("#preset-sample"),
  presetModulations: document.querySelector("#preset-modulations"),
  presetWavetables: document.querySelector("#preset-wavetables"),
  presetFile: document.querySelector("#preset-file"),
  mutationKnob: document.querySelector("#mutation-knob"),
  amountRange: document.querySelector("#amount-range"),
  brightnessRange: document.querySelector("#brightness-range"),
  brightnessValue: document.querySelector("#brightness-value"),
  motionRange: document.querySelector("#motion-range"),
  motionValue: document.querySelector("#motion-value"),
  attackRange: document.querySelector("#attack-range"),
  attackValue: document.querySelector("#attack-value"),
  widthRange: document.querySelector("#width-range"),
  widthValue: document.querySelector("#width-value"),
  dirtRange: document.querySelector("#dirt-range"),
  dirtValue: document.querySelector("#dirt-value"),
  generateButton: document.querySelector("#generate-button"),
  buttonLabel: document.querySelector(".button-label"),
  status: document.querySelector("#status"),
  sourceMetrics: document.querySelector("#source-metrics"),
  strategyMetrics: document.querySelector("#strategy-metrics"),
  presetList: document.querySelector("#preset-list"),
  tryExampleButton: document.querySelector("#try-example-preset"),
  resultSetToolbar: document.querySelector("#result-set-toolbar"),
  resultSetLabel: document.querySelector("#result-set-label"),
  newSetButton: document.querySelector("#new-set-button"),
  previousSetButton: document.querySelector("#previous-set-button"),
  latestSetButton: document.querySelector("#latest-set-button"),
};

const ANALYTICS_MODE = "preset";

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register(new URL("../service-worker.js", import.meta.url).href).catch(() => {
      // Installability should fail quietly rather than affecting the app UI.
    });
  });
}

function analyticsEvent(name, params = {}) {
  if (typeof window.gtag !== "function") {
    return;
  }

  window.gtag("event", `preset_mutator_${name}`, {
    app_mode: ANALYTICS_MODE,
    ...params,
  });
}

function signedBucket(value, negativeLabel, positiveLabel) {
  const number = Number(value);
  if (number <= -34) {
    return negativeLabel;
  }
  if (number >= 34) {
    return positiveLabel;
  }
  return "neutral";
}

function amountBucket(value) {
  const number = Number(value);
  if (number <= 30) {
    return "subtle";
  }
  if (number >= 70) {
    return "extreme";
  }
  return "medium";
}

function countBucket(count) {
  if (count <= 8) {
    return "small";
  }
  if (count <= 24) {
    return "medium";
  }
  return "large";
}

function currentAnalyticsSelection() {
  return {
    mutation_amount: Number(elements.amountRange.value),
    mutation_bucket: amountBucket(elements.amountRange.value),
    brightness_bucket: signedBucket(elements.brightnessRange.value, "darker", "brighter"),
    motion_bucket: signedBucket(elements.motionRange.value, "steadier", "more_motion"),
    attack_bucket: signedBucket(elements.attackRange.value, "softer", "harder"),
    width_bucket: signedBucket(elements.widthRange.value, "narrower", "wider"),
    dirt_bucket: signedBucket(elements.dirtRange.value, "cleaner", "dirtier"),
    source_wavetables_bucket: countBucket(state.sourcePreset?.summary?.wavetableCount || 0),
    source_modulations_bucket: countBucket(state.sourcePreset?.summary?.modulationCount || 0),
    safe_parameter_bucket: countBucket(state.sourcePreset?.summary?.scalarKeys?.length || 0),
  };
}

function toPercent(value) {
  const normalized = Number(value);
  return `${normalized > 0 ? "+" : ""}${normalized}%`;
}

function amountLabel(value) {
  const numeric = Number(value);
  if (numeric < 28) {
    return "Subtle";
  }
  if (numeric < 62) {
    return "Medium";
  }
  return "Extreme";
}

function currentActionLabel() {
  return "Generate 3 Variants";
}

function updateControlLabels() {
  elements.brightnessValue.textContent = toPercent(elements.brightnessRange.value);
  elements.motionValue.textContent = toPercent(elements.motionRange.value);
  elements.attackValue.textContent = toPercent(elements.attackRange.value);
  elements.widthValue.textContent = toPercent(elements.widthRange.value);
  elements.dirtValue.textContent = toPercent(elements.dirtRange.value);
}

function setUploadMessage(message = "") {
  if (!message) {
    elements.uploadMessage.hidden = true;
    elements.uploadMessage.textContent = "";
    return;
  }

  elements.uploadMessage.hidden = false;
  elements.uploadMessage.textContent = message;
}

function renderSourceMetrics() {
  if (!state.sourcePreset) {
    elements.sourceMetrics.innerHTML = `<p class="empty-state">Load a preset to inspect its current Vital structure.</p>`;
    return;
  }

  const summary = state.sourcePreset.summary;
  const metrics = [
    ["Author", summary.author],
    ["Sample", summary.sampleName],
    ["Wavetables", String(summary.wavetableCount)],
    ["Modulations", String(summary.modulationCount)],
    ["Safe Params", String(summary.scalarKeys.length)],
    ["Macros", String(summary.macroCount)],
  ];

  elements.sourceMetrics.innerHTML = metrics
    .map(
      ([label, value]) => `
        <div class="metric">
          <span class="metric-label">${label}</span>
          <strong>${value}</strong>
        </div>
      `,
    )
    .join("");
}

function renderStrategyMetrics() {
  if (!state.sourcePreset) {
    elements.strategyMetrics.innerHTML = `<p class="empty-state">Controls will summarize here once a preset is loaded.</p>`;
    return;
  }

  const metrics = [
    ["Amount", amountLabel(elements.amountRange.value)],
    ["Tone", toPercent(elements.brightnessRange.value)],
    ["Motion", toPercent(elements.motionRange.value)],
    ["Attack", toPercent(elements.attackRange.value)],
    ["Space", toPercent(elements.widthRange.value)],
    ["Dirt", toPercent(elements.dirtRange.value)],
  ];

  elements.strategyMetrics.innerHTML = metrics
    .map(
      ([label, value]) => `
        <div class="metric">
          <span class="metric-label">${label}</span>
          <strong>${value}</strong>
        </div>
      `,
    )
    .join("");
}

function summarizeVariantFocus(variant) {
  const changed = variant.changedParameters.join(" ");
  const focus = [];

  if (/(cutoff|resonance|transpose|tune|keytrack|pre_)/.test(changed)) {
    focus.push("tone");
  }
  if (/(attack|decay|release|wave_frame|feedback|mod_depth|frame_spread)/.test(changed)) {
    focus.push("motion");
  }
  if (/(distortion|drive)/.test(changed)) {
    focus.push("grit");
  }
  if (/(stereo|spread|mix|reverb|delay|chorus|dry_wet|size)/.test(changed)) {
    focus.push("space");
  }

  const summary = focus.length ? focus.join(", ") : "core voicing";
  return `Focus: ${summary} with a ${variant.role.label.toLowerCase()} mutation spread.`;
}

function updateSourceUi() {
  if (!state.sourcePreset) {
    elements.presetDropZone.classList.remove("has-preset");
    elements.presetName.textContent = "No preset loaded";
    elements.presetAuthor.textContent = "-";
    elements.presetSample.textContent = "-";
    elements.presetModulations.textContent = "-";
    elements.presetWavetables.textContent = "-";
    elements.presetFile.textContent = "No file loaded";
    elements.generateButton.disabled = true;
    renderSourceMetrics();
    renderStrategyMetrics();
    return;
  }

  const summary = state.sourcePreset.summary;
  elements.presetDropZone.classList.add("has-preset");
  elements.presetName.textContent = summary.name;
  elements.presetAuthor.textContent = summary.author;
  elements.presetSample.textContent = summary.sampleName;
  elements.presetModulations.textContent = String(summary.modulationCount);
  elements.presetWavetables.textContent = String(summary.wavetableCount);
  elements.presetFile.textContent = state.sourceFile.name;
  elements.generateButton.disabled = state.isGenerating ? true : false;
  renderSourceMetrics();
  renderStrategyMetrics();
}

function buildStrategyWeights() {
  return buildPresetMutateStrategy({
    tone: elements.brightnessRange.value,
    motion: elements.motionRange.value,
    attack: elements.attackRange.value,
    space: elements.widthRange.value,
    dirt: elements.dirtRange.value,
    amount: elements.amountRange.value,
  });
}

function generateVariants() {
  return createPresetVariants({
    sourcePreset: state.sourcePreset,
    strategy: buildStrategyWeights(),
    variationSeed: state.variationSeed,
    controls: {
      amount: elements.amountRange.value,
      tone: elements.brightnessRange.value,
      motion: elements.motionRange.value,
      attack: elements.attackRange.value,
      space: elements.widthRange.value,
      dirt: elements.dirtRange.value,
    },
  });
}

function downloadVariant(variant) {
  const blob = new Blob([JSON.stringify(variant.data)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = variant.downloadName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
  analyticsEvent("download_preset", {
    generation_mode: state.lastGenerationMode,
    preset_role: variant.role.label,
    preset_group: variant.groupKey,
    changed_parameters_bucket: countBucket(variant.changedParameters.length),
    ...currentAnalyticsSelection(),
  });
}

async function previewVariant(variant) {
  try {
    elements.status.textContent = `Playing a direction preview of ${variant.name}...`;
    await playPresetPreview({ data: variant.data });
    analyticsEvent("preview_preset", {
      generation_mode: state.lastGenerationMode,
      preset_role: variant.role.label,
      preset_group: variant.groupKey,
      changed_parameters_bucket: countBucket(variant.changedParameters.length),
      ...currentAnalyticsSelection(),
    });
  } catch (error) {
    elements.status.textContent = error.message || "Could not play this browser preview.";
  }
}

function renderVariants() {
  if (!state.generatedVariants.length) {
    elements.presetList.innerHTML = `<p class="empty-state">Choose one <strong>.vital</strong> preset, then click <strong>${currentActionLabel()}</strong> to create new playable mutations.</p>`;
    return;
  }

  elements.presetList.innerHTML = "";
  const groups = new Map();
  for (const variant of state.generatedVariants) {
    const key = variant.groupKey || "free";
    if (!groups.has(key)) {
      groups.set(key, {
        label: variant.groupLabel,
        description: variant.groupDescription,
        variants: [],
      });
    }
    groups.get(key).variants.push(variant);
  }

  for (const [key, group] of groups.entries()) {
    const section = document.createElement("section");
    section.className = "preset-group";
    const shouldStartOpen = true;
    const listId = `preset-group-${key}`;

    section.innerHTML = `
      <button class="preset-group-head" type="button" aria-expanded="${shouldStartOpen}" aria-controls="${listId}">
        <div>
          <h3>${group.label} <span class="preset-group-count">${group.variants.length}</span></h3>
          <p>${group.description}</p>
        </div>
        <span class="preset-group-toggle-label">${shouldStartOpen ? "Hide variants" : "Show variants"}</span>
      </button>
      <div class="preset-group-list${shouldStartOpen ? "" : " hidden"}" id="${listId}"></div>
    `;

    const list = section.querySelector(".preset-group-list");
    for (const variant of group.variants) {
      const card = document.createElement("article");
      card.className = "preset-card";
      card.innerHTML = `
        <div class="preset-card-header">
          <div>
            <span class="preset-role">${variant.role.label}</span>
            <h3>${variant.name}</h3>
            <p class="preset-subline">${variant.description}</p>
          </div>
        </div>
        <p class="preset-quality">${summarizeVariantFocus(variant)} Mutation Amount controls how far this variant moves from the source preset.</p>
        <div class="preset-metrics">
          <div>
            <span class="metric-label">Changes</span>
            <strong>${variant.changedParameters.length}</strong>
          </div>
          <div>
            <span class="metric-label">Direction</span>
            <strong>${variant.groupLabel}</strong>
          </div>
          <div>
            <span class="metric-label">Format</span>
            <strong>Vital</strong>
          </div>
          <div>
            <span class="metric-label">Best use</span>
            <strong>${bestUseForVariant(variant)}</strong>
          </div>
        </div>
        <div>
          <span class="metric-label">Key changed parameters</span>
          <div class="chip-list">
            ${variant.changedParameters.slice(0, 8).map((item) => `<span class="chip">${item.replace(/_/g, " ")}</span>`).join("")}
          </div>
        </div>
        <div class="preset-actions">
          <button class="preview-button" type="button">
            <span aria-hidden="true">Play</span>
            <span>Hear Direction Preview</span>
          </button>
          <button class="download-button" type="button">
            <span class="download-badge">VITAL</span>
            <span>Download .vital</span>
          </button>
        </div>
      `;
      card.querySelector(".preview-button").addEventListener("click", () => previewVariant(variant));
      card.querySelector(".download-button").addEventListener("click", () => downloadVariant(variant));
      list.appendChild(card);
    }

    const toggle = section.querySelector(".preset-group-head");
    const toggleLabel = section.querySelector(".preset-group-toggle-label");
    toggle.addEventListener("click", () => {
      const expanded = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!expanded));
      list.classList.toggle("hidden", expanded);
      toggleLabel.textContent = expanded ? "Show variants" : "Hide variants";
    });

    elements.presetList.appendChild(section);
  }
}

function renderResultSetToolbar() {
  const hasSets = state.resultSets.length > 0;
  elements.resultSetToolbar.hidden = !hasSets;
  if (!hasSets) {
    return;
  }

  const current = state.activeSetIndex + 1;
  const total = state.resultSets.length;
  const isLatest = state.activeSetIndex === total - 1;
  elements.resultSetLabel.textContent = `Set ${current} of ${total} for this preset`;
  elements.previousSetButton.disabled = state.activeSetIndex <= 0;
  elements.latestSetButton.hidden = isLatest;
}

function clearResultSets() {
  state.resultSets = [];
  state.activeSetIndex = -1;
  state.variationSeed = 0;
  renderResultSetToolbar();
}

function storeResultSet(variants) {
  state.resultSets.push({ seed: state.variationSeed, variants });
  if (state.resultSets.length > 3) {
    state.resultSets.shift();
  }
  state.activeSetIndex = state.resultSets.length - 1;
  state.generatedVariants = variants;
  renderResultSetToolbar();
}

function showResultSet(index) {
  if (index < 0 || index >= state.resultSets.length) {
    return;
  }
  state.activeSetIndex = index;
  state.generatedVariants = state.resultSets[index].variants;
  renderVariants();
  renderResultSetToolbar();
  elements.status.textContent = `Showing set ${index + 1} of ${state.resultSets.length}.`;
}

function bestUseForVariant(variant) {
  if (variant.groupKey === "closest") {
    return "Safer alternates";
  }
  if (variant.groupKey === "darker") {
    return "Darker cue layers";
  }
  if (variant.groupKey === "brighter") {
    return "Clearer lead parts";
  }
  if (variant.groupKey === "wider") {
    return "Wide layers";
  }
  if (variant.groupKey === "dirtier") {
    return "Edge and grit";
  }
  return "Exploration";
}

async function loadPreset(file) {
  if (!file) {
    return;
  }

  if (!file.name.toLowerCase().endsWith(".vital")) {
    state.sourcePreset = null;
    state.sourceFile = null;
    state.generatedVariants = [];
    clearResultSets();
    setUploadMessage("Unsupported file type. Please use a valid .vital preset.");
    updateSourceUi();
    renderVariants();
    return;
  }

  try {
    const text = await file.text();
    const data = JSON.parse(text);
    if (!data || typeof data !== "object" || typeof data.settings !== "object" || Array.isArray(data.settings)) {
      throw new Error("Vital preset is missing a valid settings object.");
    }

    const summary = summarizeVitalPreset(data);
    if (!summary.scalarKeys.length) {
      throw new Error("No safe Vital parameters were found in this preset.");
    }

    state.sourcePreset = { data, summary, fileName: file.name };
    state.sourceFile = file;
    state.generatedVariants = [];
    clearResultSets();
    state.lastGenerationMode = "standard";
    setUploadMessage("");
    updateSourceUi();
    renderVariants();
    analyticsEvent("source_loaded", {
      source_type: "vital_preset",
      source_wavetables_bucket: countBucket(summary.wavetableCount),
      source_modulations_bucket: countBucket(summary.modulationCount),
      safe_parameter_bucket: countBucket(summary.scalarKeys.length),
      macro_count: summary.macroCount,
    });
    elements.status.textContent = `Loaded ${summary.name}. Generate 3 variants when ready.`;
  } catch (error) {
    state.sourcePreset = null;
    state.sourceFile = null;
    state.generatedVariants = [];
    clearResultSets();
    setUploadMessage(error.message || "Unsupported or unreadable preset file.");
    updateSourceUi();
    renderVariants();
  }
}

function setGenerationLoadingState(isLoading) {
  state.isGenerating = isLoading;
  elements.generateButton.disabled = isLoading || !state.sourcePreset;
  elements.generateButton.classList.toggle("is-loading", isLoading);
  elements.buttonLabel.textContent = isLoading ? "Generating..." : "Generate 3 Variants";
}

async function handleGenerate() {
  if (!state.sourcePreset || state.isGenerating) {
    return;
  }

  setGenerationLoadingState(true);
  elements.status.textContent = "Mutating the source preset into 3 variants...";

  try {
    await new Promise((resolve) => window.setTimeout(resolve, 520));
    state.variationSeed += 1;
    const variants = generateVariants();
    storeResultSet(variants);
    state.lastGenerationMode = "standard";
    renderVariants();
    elements.status.textContent = "3 variants ready. Download the one that feels closest.";
    analyticsEvent("generate", {
      preset_count: variants.length,
      variation_set: state.variationSeed,
      ...currentAnalyticsSelection(),
    });
  } finally {
    setGenerationLoadingState(false);
  }
}

async function loadExamplePreset() {
  try {
    elements.status.textContent = "Loading an included Vital example...";
    const response = await fetch(new URL("../assets/seeds/vital/raw/KS%20Dread%20Lantern.vital", import.meta.url));
    if (!response.ok) {
      throw new Error("Could not load the included Vital example.");
    }
    const file = new File([await response.blob()], "KS Dread Lantern.vital", { type: "application/json" });
    await loadPreset(file);
    analyticsEvent("example_loaded", { source_type: "vital_preset" });
  } catch (error) {
    elements.status.textContent = error.message || "Could not load the included Vital example.";
  }
}

function bindDropZone() {
  const zone = elements.presetDropZone;
  const prevent = (event) => {
    event.preventDefault();
    event.stopPropagation();
  };

  ["dragenter", "dragover"].forEach((eventName) => {
    zone.addEventListener(eventName, (event) => {
      prevent(event);
      zone.classList.add("is-drop-active");
    });
  });

  ["dragleave", "drop"].forEach((eventName) => {
    zone.addEventListener(eventName, (event) => {
      prevent(event);
      zone.classList.remove("is-drop-active");
    });
  });

  zone.addEventListener("drop", (event) => {
    const [file] = event.dataTransfer?.files || [];
    if (file) {
      loadPreset(file);
    }
  });
}

elements.fileInput.addEventListener("change", (event) => {
  const [file] = event.target.files || [];
  if (file) {
    loadPreset(file);
  }
});

elements.amountRange.addEventListener("input", () => {
  updateControlLabels();
  renderStrategyMetrics();
});
elements.brightnessRange.addEventListener("input", () => {
  updateControlLabels();
  renderStrategyMetrics();
});
elements.motionRange.addEventListener("input", () => {
  updateControlLabels();
  renderStrategyMetrics();
});
elements.attackRange.addEventListener("input", () => {
  updateControlLabels();
  renderStrategyMetrics();
});
elements.widthRange.addEventListener("input", () => {
  updateControlLabels();
  renderStrategyMetrics();
});
elements.dirtRange.addEventListener("input", () => {
  updateControlLabels();
  renderStrategyMetrics();
});
elements.generateButton.addEventListener("click", handleGenerate);
elements.newSetButton.addEventListener("click", handleGenerate);
elements.previousSetButton.addEventListener("click", () => showResultSet(state.activeSetIndex - 1));
elements.latestSetButton.addEventListener("click", () => showResultSet(state.resultSets.length - 1));
elements.tryExampleButton.addEventListener("click", loadExamplePreset);
document.querySelectorAll("[data-pro-upsell]").forEach((link) => {
  link.addEventListener("click", () => {
    analyticsEvent("pro_upsell_click", { source: link.dataset.proUpsell });
  });
});

new PresetMutatorKnob(elements.mutationKnob, {
  value: Number(elements.amountRange.value),
  min: 0,
  max: 100,
  onChange(value) {
    elements.amountRange.value = String(value);
    updateControlLabels();
    renderStrategyMetrics();
  },
});

updateControlLabels();
updateSourceUi();
renderVariants();
renderResultSetToolbar();
bindDropZone();

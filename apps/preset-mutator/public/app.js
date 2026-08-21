import { PresetMutatorKnob } from "./preset-mutator-knob.js";
import { familyLabel, noteName } from "./engine/common.js";
import {
  buildScratchFreePack,
  buildScratchProfile,
  SCRATCH_FREE_VARIANT_LIMIT,
} from "./engine/scratch-engine.js";
import { createVitalPresetBlob, SEED_BY_FAMILY } from "./engine/vital-export.js";

const state = {
  presets: [],
  resultSets: [],
  activeSetIndex: -1,
  variationSeed: 0,
  seedCache: new Map(),
  isGenerating: false,
  lastGenerationMode: "standard",
};

const elements = {
  familySelect: document.querySelector("#family-select"),
  moodSelect: document.querySelector("#mood-select"),
  registerSelect: document.querySelector("#register-select"),
  intentText: document.querySelector("#intent-text"),
  brightnessRange: document.querySelector("#brightness-range"),
  motionRange: document.querySelector("#motion-range"),
  attackRange: document.querySelector("#attack-range"),
  widthRange: document.querySelector("#width-range"),
  textureRange: document.querySelector("#texture-range"),
  mutationKnob: document.querySelector("#mutation-knob"),
  mutationAmount: document.querySelector("#mutation-amount"),
  brightnessValue: document.querySelector("#brightness-value"),
  motionValue: document.querySelector("#motion-value"),
  attackValue: document.querySelector("#attack-value"),
  widthValue: document.querySelector("#width-value"),
  textureValue: document.querySelector("#texture-value"),
  generateButton: document.querySelector("#generate-button"),
  status: document.querySelector("#status"),
  profileMetrics: document.querySelector("#profile-metrics"),
  presetList: document.querySelector("#preset-list"),
  presetsPanel: document.querySelector("#presets-panel"),
  resultSetToolbar: document.querySelector("#result-set-toolbar"),
  resultSetLabel: document.querySelector("#result-set-label"),
  newSetButton: document.querySelector("#new-set-button"),
  previousSetButton: document.querySelector("#previous-set-button"),
  latestSetButton: document.querySelector("#latest-set-button"),
};

const FREE_VARIANT_LIMIT = SCRATCH_FREE_VARIANT_LIMIT;
const ANALYTICS_MODE = "scratch";

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register(new URL("./service-worker.js", import.meta.url).href).catch(() => {
      // Installability should fail quietly rather than affecting the app UI.
    });
  });
}

function updateStatus(message) {
  elements.status.textContent = message;
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

function mutationBucket(value) {
  const number = Number(value);
  if (number <= 30) {
    return "subtle";
  }
  if (number >= 70) {
    return "extreme";
  }
  return "medium";
}

function intentLengthBucket(value) {
  const length = value.trim().length;
  if (length === 0) {
    return "none";
  }
  if (length <= 40) {
    return "short";
  }
  if (length <= 100) {
    return "medium";
  }
  return "long";
}

function currentAnalyticsSelection() {
  return {
    sound_type: elements.familySelect.value,
    mood: elements.moodSelect.value,
    register: elements.registerSelect.value,
    intent_used: elements.intentText.value.trim().length > 0,
    intent_length: intentLengthBucket(elements.intentText.value),
    mutation_amount: Number(elements.mutationAmount.value),
    mutation_bucket: mutationBucket(elements.mutationAmount.value),
    brightness_bucket: signedBucket(elements.brightnessRange.value, "darker", "brighter"),
    motion_bucket: signedBucket(elements.motionRange.value, "steadier", "more_motion"),
    attack_bucket: signedBucket(elements.attackRange.value, "softer", "harder"),
    width_bucket: signedBucket(elements.widthRange.value, "narrower", "wider"),
    dirt_bucket: signedBucket(elements.textureRange.value, "cleaner", "dirtier"),
  };
}

function updateControlLabels() {
  elements.brightnessValue.textContent = `${elements.brightnessRange.value}%`;
  elements.motionValue.textContent = `${elements.motionRange.value}%`;
  elements.attackValue.textContent = `${elements.attackRange.value}%`;
  elements.widthValue.textContent = `${elements.widthRange.value}%`;
  elements.textureValue.textContent = `${elements.textureRange.value}%`;
}

function currentProfile() {
  return buildScratchProfile({
    family: elements.familySelect.value,
    mood: elements.moodSelect.value,
    register: elements.registerSelect.value,
    intent: elements.intentText.value,
    mutationAmount: elements.mutationAmount.value,
    brightness: elements.brightnessRange.value,
    motion: elements.motionRange.value,
    attack: elements.attackRange.value,
    width: elements.widthRange.value,
    texture: elements.textureRange.value,
  });
}

function renderProfile(profile) {
  if (!elements.profileMetrics) {
    return;
  }

  const rows = [
    ["Type", familyLabel(profile.family)],
    ["Mood", elements.moodSelect.options[elements.moodSelect.selectedIndex].text],
    ["Register", noteName(profile.pitchHz)],
    ["Mutation", `${Math.round(profile.mutationAmount * 100)}%`],
    ["Brightness", `${Math.round(profile.brightness * 100)}%`],
    ["Motion", `${Math.round(profile.movement * 100)}%`],
    ["Attack", `${Math.round(profile.attack * 100)}%`],
    ["Width", `${Math.round(profile.width * 100)}%`],
    ["Texture", `${Math.round(profile.noise * 100)}%`],
  ];
  elements.profileMetrics.innerHTML = rows.map(([label, value]) => `
    <div class="metric">
      <span class="metric-label">${label}</span>
      <strong class="metric-value">${value}</strong>
    </div>
  `).join("");
}

function renderPresets(presets) {
  elements.presetList.innerHTML = "";
  elements.presetsPanel.classList.toggle("has-results", presets.length > 0);
  elements.presetsPanel.classList.toggle("is-pack", presets.length > FREE_VARIANT_LIMIT);
  if (!presets.length) {
    elements.presetList.innerHTML = `<p class="empty-state">Click <strong>Generate 3 Variants</strong> to create from-scratch Vital starting points.</p>`;
    return;
  }

  for (const preset of presets) {
    const card = document.createElement("article");
    card.className = "preset-card";
    card.innerHTML = `
      <div class="preset-head">
        <div>
          <p class="preset-role">${preset.roleLabel}</p>
          <p class="preset-family">${preset.family}</p>
          <h3 class="preset-name">${preset.name}</h3>
        </div>
      </div>
      <p class="preset-summary">${preset.summary}</p>
      <div class="preset-quality-score">
        <span><strong>Direction</strong> ${preset.roleLabel}</span>
        <span><strong>Best use</strong> ${bestUseForPreset(preset)}</span>
      </div>
      <p class="preset-quality">Built from the selected intent profile, then biased toward ${preset.roleLabel.toLowerCase()} behavior.</p>
      <div class="param-list">${preset.parameters.map(([label, value]) => `<div class="param-row"><span>${label}</span><span>${value}</span></div>`).join("")}</div>
      <div class="preset-actions">
        <button class="download-button" type="button">
          <span class="download-badge" aria-hidden="true">VITAL</span>
          <span>Download .vital</span>
        </button>
      </div>
    `;
    card.querySelector(".download-button").addEventListener("click", () => downloadPreset(preset));
    elements.presetList.appendChild(card);
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
  elements.resultSetLabel.textContent = `Set ${current} of ${total} in this browser session`;
  elements.previousSetButton.disabled = state.activeSetIndex <= 0;
  elements.latestSetButton.hidden = isLatest;
}

function storeResultSet(presets) {
  state.resultSets.push({ seed: state.variationSeed, presets });
  if (state.resultSets.length > 3) {
    state.resultSets.shift();
  }
  state.activeSetIndex = state.resultSets.length - 1;
  state.presets = presets;
  renderResultSetToolbar();
}

function showResultSet(index) {
  if (index < 0 || index >= state.resultSets.length) {
    return;
  }
  state.activeSetIndex = index;
  state.presets = state.resultSets[index].presets;
  renderPresets(state.presets);
  renderResultSetToolbar();
  updateStatus(`Showing set ${index + 1} of ${state.resultSets.length}.`);
}

function bestUseForPreset(preset) {
  if (preset.familyKey === "bass") {
    return "Low-end starts and bass sketches";
  }
  if (preset.familyKey === "pluck") {
    return "Keys, pulses, and melodic hooks";
  }
  if (preset.familyKey === "texture") {
    return "Drones, FX beds, and transitions";
  }
  return "Pads, cues, and atmospheric layers";
}

function seedUrlForFamily(family) {
  const seedName = SEED_BY_FAMILY[family] || SEED_BY_FAMILY.texture;
  return new URL(`./assets/seeds/vital/raw/${encodeURIComponent(seedName)}`, import.meta.url);
}

async function loadSeedPreset(family) {
  const seedName = SEED_BY_FAMILY[family] || SEED_BY_FAMILY.texture;
  if (state.seedCache.has(seedName)) {
    return structuredClone(state.seedCache.get(seedName));
  }

  const response = await fetch(seedUrlForFamily(family));
  if (!response.ok) {
    throw new Error(`Could not load Vital seed preset: ${seedName}`);
  }

  const preset = await response.json();
  state.seedCache.set(seedName, preset);
  return structuredClone(preset);
}

async function buildVitalPresetBlob(preset) {
  const seed = await loadSeedPreset(preset.familyKey);
  return createVitalPresetBlob(seed, preset);
}

async function downloadPreset(preset) {
  try {
    updateStatus(`Preparing ${preset.name} for download...`);
    const { fileName, blob } = await buildVitalPresetBlob(preset);
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
    updateStatus(`${preset.name} is ready.`);
    analyticsEvent("download_preset", {
      generation_mode: state.lastGenerationMode,
      preset_role: preset.roleLabel,
      sound_type: preset.familyKey,
      ...currentAnalyticsSelection(),
    });
  } catch (error) {
    updateStatus(error.message || "Could not download preset.");
  }
}

function setLoading(isLoading) {
  state.isGenerating = isLoading;
  elements.generateButton.disabled = isLoading;
  elements.generateButton.classList.toggle("is-loading", isLoading);
}

function generate() {
  setLoading(true);
  state.lastGenerationMode = "standard";
  updateStatus("Building 3 variants...");
  window.setTimeout(() => {
    const profile = currentProfile();
    state.variationSeed += 1;
    const presets = buildScratchFreePack(profile, state.variationSeed);
    storeResultSet(presets);
    renderPresets(presets);
    updateStatus("3 variants ready.");
    analyticsEvent("generate", {
      preset_count: presets.length,
      variation_set: state.variationSeed,
      ...currentAnalyticsSelection(),
    });
    setLoading(false);
  }, 300);
}

function refreshProfile() {
  updateControlLabels();
  renderProfile(currentProfile());
  syncIntentKeywords();
}

function syncIntentKeywords() {
  const value = elements.intentText.value.toLowerCase();
  document.querySelectorAll("[data-intent-keyword]").forEach((button) => {
    const keyword = button.dataset.intentKeyword;
    button.setAttribute("aria-pressed", String(new RegExp(`\\b${keyword}\\b`, "i").test(value)));
  });
}

function toggleIntentKeyword(keyword) {
  const expression = new RegExp(`\\b${keyword}\\b`, "ig");
  const current = elements.intentText.value.trim();
  const next = expression.test(current)
    ? current.replace(expression, "").replace(/\s{2,}/g, " ").trim()
    : `${current}${current ? " " : ""}${keyword}`;
  elements.intentText.value = next;
  refreshProfile();
}

new PresetMutatorKnob(elements.mutationKnob, {
  value: Number(elements.mutationAmount.value),
  min: 0,
  max: 100,
  onChange(value) {
    elements.mutationAmount.value = String(value);
    refreshProfile();
  },
});

for (const element of [
  elements.familySelect,
  elements.moodSelect,
  elements.registerSelect,
  elements.intentText,
  elements.brightnessRange,
  elements.motionRange,
  elements.attackRange,
  elements.widthRange,
  elements.textureRange,
]) {
  element.addEventListener("input", refreshProfile);
  element.addEventListener("change", refreshProfile);
}

elements.generateButton.addEventListener("click", generate);
elements.newSetButton.addEventListener("click", generate);
elements.previousSetButton.addEventListener("click", () => showResultSet(state.activeSetIndex - 1));
elements.latestSetButton.addEventListener("click", () => showResultSet(state.resultSets.length - 1));
document.querySelectorAll("[data-intent-keyword]").forEach((button) => {
  button.addEventListener("click", () => toggleIntentKeyword(button.dataset.intentKeyword));
});
document.querySelectorAll("[data-pro-upsell]").forEach((link) => {
  link.addEventListener("click", () => {
    analyticsEvent("pro_upsell_click", { source: link.dataset.proUpsell });
  });
});

refreshProfile();
renderPresets([]);
renderResultSetToolbar();

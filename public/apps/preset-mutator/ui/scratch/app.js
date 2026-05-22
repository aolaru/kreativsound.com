import { PresetMutatorKnob } from "../preset-mutator-knob.js";
import { familyLabel, noteName, sanitizeFileName } from "../engine/common.js";
import {
  buildScratchFreePack,
  buildScratchProfile,
  buildScratchProPack,
  SCRATCH_FREE_VARIANT_LIMIT,
  SCRATCH_PRO_PACK_COUNT,
} from "../engine/scratch-engine.js";
import { scoreGeneratedPreset } from "../engine/quality.js";
import { createVitalPresetBlob, SEED_BY_FAMILY } from "../engine/vital-export.js";

const state = {
  presets: [],
  seedCache: new Map(),
  proUnlocked: false,
  isGenerating: false,
  lastGenerationMode: "free",
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
  generatePack: document.querySelector("#generate-pack"),
  downloadPack: document.querySelector("#download-pack"),
  status: document.querySelector("#status"),
  profileMetrics: document.querySelector("#profile-metrics"),
  presetList: document.querySelector("#preset-list"),
  presetsPanel: document.querySelector("#presets-panel"),
  paidFeaturePanel: document.querySelector("#paid-feature-panel"),
  paidFeatureActions: document.querySelector("#paid-feature-actions"),
  paidFeatureToggle: document.querySelector("#paid-feature-toggle"),
  paidFeatureUnlock: document.querySelector("#paid-feature-unlock"),
  paidFeatureKey: document.querySelector("#paid-feature-key"),
  paidFeatureUnlockButton: document.querySelector("#paid-feature-unlock-button"),
  paidFeatureUnlockNote: document.querySelector("#paid-feature-unlock-note"),
  paidFeaturePreview: document.querySelector("#paid-feature-preview"),
};

const FREE_VARIANT_LIMIT = SCRATCH_FREE_VARIANT_LIMIT;
const PRO_PACK_COUNT = SCRATCH_PRO_PACK_COUNT;
const UNLOCK_STORAGE_KEY = "kreativ-sound-tools-unlocked";
const LEGACY_UNLOCK_STORAGE_KEY = "preset-mutator-pro-preview-unlocked";
const PRO_PURCHASE_CODE = "AA-PRO-32-DGTW9930";
const ANALYTICS_MODE = "scratch";

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("../service-worker.js").catch(() => {
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
    elements.presetList.innerHTML = `<p class="empty-state">Click <strong>Generate 3 Free Variants</strong> to create from-scratch Vital starting points.</p>`;
    return;
  }

  for (const preset of presets) {
    const quality = scoreGeneratedPreset(preset);
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
        <span><strong>${quality.score}%</strong> quality</span>
        <span><strong>Best use</strong> ${bestUseForPreset(preset)}</span>
      </div>
      <p class="preset-quality">Quality notes: ${quality.notes.join("; ")}. Built from the selected intent profile, then biased toward ${preset.roleLabel.toLowerCase()} behavior.</p>
      <div class="param-list">${preset.parameters.map(([label, value]) => `<div class="param-row"><span>${label}</span><span>${value}</span></div>`).join("")}</div>
      <div class="preset-actions">
        <button class="download-button" type="button">
          <span class="download-badge" aria-hidden="true">VITAL</span>
          <span>Download Preset</span>
        </button>
      </div>
    `;
    card.querySelector(".download-button").addEventListener("click", () => downloadPreset(preset));
    elements.presetList.appendChild(card);
  }
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

function qualityBucket(score) {
  if (score >= 90) {
    return "strong";
  }
  if (score >= 80) {
    return "balanced";
  }
  return "usable";
}

function averageQualityScore(presets) {
  if (!presets.length) {
    return 0;
  }
  const total = presets.reduce((sum, preset) => sum + scoreGeneratedPreset(preset).score, 0);
  return Math.round(total / presets.length);
}

function seedUrlForFamily(family) {
  const seedName = SEED_BY_FAMILY[family] || SEED_BY_FAMILY.texture;
  return new URL(`../../assets/seeds/vital/raw/${encodeURIComponent(seedName)}`, window.location.href);
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
    const quality = scoreGeneratedPreset(preset);
    analyticsEvent("download_preset", {
      generation_mode: state.lastGenerationMode,
      preset_role: preset.roleLabel,
      sound_type: preset.familyKey,
      quality_score: quality.score,
      quality_bucket: qualityBucket(quality.score),
      ...currentAnalyticsSelection(),
    });
  } catch (error) {
    updateStatus(error.message || "Could not download preset.");
  }
}

async function downloadPack() {
  if (state.presets.length !== PRO_PACK_COUNT || state.lastGenerationMode !== "pro" || !window.JSZip) {
    return;
  }

  try {
    updateStatus("Preparing the 32-pack ZIP...");
    const zip = new window.JSZip();
    const folderName = sanitizeFileName(elements.intentText.value.trim() || `scratch-${elements.familySelect.value}-${elements.moodSelect.value}`);
    const folder = zip.folder(folderName);
    for (const preset of state.presets) {
      const { fileName, blob } = await buildVitalPresetBlob(preset);
      folder.file(fileName, blob);
    }
    const zipBlob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(zipBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${folderName}-32-pack.zip`;
    link.click();
    URL.revokeObjectURL(url);
    updateStatus("32-pack ZIP ready.");
    const qualityScore = averageQualityScore(state.presets);
    analyticsEvent("download_pack", {
      generation_mode: "pro",
      preset_count: state.presets.length,
      avg_quality_score: qualityScore,
      avg_quality_bucket: qualityBucket(qualityScore),
      ...currentAnalyticsSelection(),
    });
  } catch (error) {
    updateStatus(error.message || "Could not build the 32-pack ZIP.");
  }
}

function setLoading(isLoading) {
  state.isGenerating = isLoading;
  elements.generateButton.disabled = isLoading;
  elements.generateButton.classList.toggle("is-loading", isLoading);
  if (elements.generatePack) {
    elements.generatePack.disabled = isLoading || !state.proUnlocked;
    elements.generatePack.classList.toggle("is-loading", isLoading);
  }
}

function generate(mode = "free") {
  setLoading(true);
  state.lastGenerationMode = mode;
  updateStatus(mode === "pro" ? "Building 32 Pro variants..." : "Building 3 free variants...");
  window.setTimeout(() => {
    const profile = currentProfile();
    state.presets = mode === "pro" ? buildScratchProPack(profile) : buildScratchFreePack(profile);
    renderPresets(state.presets);
    elements.downloadPack.disabled = mode !== "pro";
    const qualityScore = averageQualityScore(state.presets);
    updateStatus(mode === "pro" ? "32 Pro variants ready." : "3 free variants ready.");
    analyticsEvent(mode === "pro" ? "generate_pro" : "generate_free", {
      preset_count: state.presets.length,
      avg_quality_score: qualityScore,
      avg_quality_bucket: qualityBucket(qualityScore),
      ...currentAnalyticsSelection(),
    });
    setLoading(false);
  }, 300);
}

function renderUnlockState() {
  elements.paidFeaturePanel.classList.toggle("is-unlocked", state.proUnlocked);
  elements.paidFeatureActions.hidden = state.proUnlocked;
  elements.paidFeatureUnlock.hidden = true;
  elements.paidFeaturePreview.hidden = !state.proUnlocked;
  elements.paidFeatureToggle?.setAttribute("aria-expanded", "false");
  if (elements.generatePack) {
    elements.generatePack.disabled = !state.proUnlocked || state.isGenerating;
  }
}

function toggleUnlock() {
  const isOpen = !elements.paidFeatureUnlock.hidden;
  elements.paidFeatureUnlock.hidden = isOpen;
  elements.paidFeatureToggle.setAttribute("aria-expanded", String(!isOpen));
  if (isOpen) {
    analyticsEvent("unlock_panel_close");
  } else {
    analyticsEvent("unlock_panel_open");
  }
  if (!isOpen) {
    elements.paidFeatureKey.focus();
  }
}

function unlockPro() {
  const code = elements.paidFeatureKey.value.trim();
  if (!code) {
    elements.paidFeatureUnlockNote.textContent = "Enter your purchase code to unlock this browser.";
    analyticsEvent("unlock_attempt", { result: "empty" });
    return;
  }
  if (code !== PRO_PURCHASE_CODE) {
    elements.paidFeatureUnlockNote.textContent = "Invalid purchase code. Check the code and try again.";
    analyticsEvent("unlock_attempt", { result: "invalid" });
    return;
  }
  state.proUnlocked = true;
  window.localStorage.setItem(UNLOCK_STORAGE_KEY, "1");
  renderUnlockState();
  updateStatus("Preset Mutator Pro is active in this browser.");
  analyticsEvent("unlock_attempt", { result: "success" });
}

function refreshProfile() {
  updateControlLabels();
  renderProfile(currentProfile());
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

elements.generateButton.addEventListener("click", () => generate("free"));
elements.generatePack?.addEventListener("click", () => generate("pro"));
elements.downloadPack?.addEventListener("click", downloadPack);
elements.paidFeatureToggle?.addEventListener("click", toggleUnlock);
elements.paidFeatureUnlockButton?.addEventListener("click", unlockPro);
elements.paidFeatureActions?.addEventListener("click", (event) => {
  const link = event.target.closest("a");
  if (!link) {
    return;
  }
  analyticsEvent("pro_cta_click", {
    checkout: link.href.includes("paypal.com") ? "paypal" : "gumroad",
  });
});

state.proUnlocked = window.localStorage.getItem(UNLOCK_STORAGE_KEY) === "1" || window.localStorage.getItem(LEGACY_UNLOCK_STORAGE_KEY) === "1";
refreshProfile();
renderPresets([]);
renderUnlockState();

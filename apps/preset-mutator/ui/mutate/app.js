const FREE_VARIANT_ROLES = [
  { key: "closest", label: "Closest", multiplier: 0.7, nameSuffix: "Closest" },
  { key: "bolder", label: "Bolder", multiplier: 1.0, nameSuffix: "Bolder" },
  { key: "wilder", label: "Wilder", multiplier: 1.35, nameSuffix: "Wilder" },
];

function createPackRole(group, index, config = {}) {
  return {
    key: `${group.key}-${index + 1}`,
    label: `${group.label} ${index + 1}`,
    nameSuffix: `${group.label} ${index + 1}`,
    multiplier: config.multiplier ?? 1,
    toneBias: config.toneBias ?? group.toneBias ?? 0,
    motionBias: config.motionBias ?? group.motionBias ?? 0,
    dirtBias: config.dirtBias ?? group.dirtBias ?? 0,
    spaceBias: config.spaceBias ?? group.spaceBias ?? 0,
    groupKey: group.key,
    groupLabel: group.label,
    groupDescription: group.description,
  };
}

const PACK_GROUPS = [
  { key: "closest", label: "Closest", description: "Tighter mutations that stay nearest to the source preset.", toneBias: 0, motionBias: 0, dirtBias: 0, spaceBias: 0 },
  { key: "darker", label: "Darker", description: "Lower, moodier filter and voicing shifts with darker weight.", toneBias: -0.8, motionBias: -0.1, dirtBias: 0.1, spaceBias: -0.1 },
  { key: "brighter", label: "Brighter", description: "Lifted tone, more upper harmonics, and more open cutoff moves.", toneBias: 0.8, motionBias: 0.1, dirtBias: -0.1, spaceBias: 0.05 },
  { key: "more-motion", label: "More Motion", description: "Heavier movement and evolving modulation for more animation.", toneBias: 0, motionBias: 0.85, dirtBias: 0.05, spaceBias: 0.15 },
  { key: "steadier", label: "Steadier", description: "Calmer timing and more restrained modulation movement.", toneBias: -0.05, motionBias: -0.8, dirtBias: -0.05, spaceBias: -0.05 },
  { key: "cleaner", label: "Cleaner", description: "Smoother, tidier variants with less drive and roughness.", toneBias: 0.1, motionBias: -0.05, dirtBias: -0.85, spaceBias: 0.05 },
  { key: "dirtier", label: "Dirtier", description: "More edge, drive, and grit pushed into the mutation spread.", toneBias: -0.05, motionBias: 0.05, dirtBias: 0.9, spaceBias: 0.05 },
  { key: "wider", label: "Wider", description: "Broader stereo and space-biased variants for a larger spread.", toneBias: 0.1, motionBias: 0.2, dirtBias: 0, spaceBias: 0.9 },
];

const PRO_PACK_ROLES = [
  createPackRole(PACK_GROUPS[0], 0, { multiplier: 0.8 }),
  createPackRole(PACK_GROUPS[0], 1, { multiplier: 0.92, motionBias: -0.05 }),
  createPackRole(PACK_GROUPS[0], 2, { multiplier: 1.02, toneBias: 0.08 }),
  createPackRole(PACK_GROUPS[0], 3, { multiplier: 1.08, dirtBias: 0.06 }),
  createPackRole(PACK_GROUPS[1], 0, { multiplier: 0.95 }),
  createPackRole(PACK_GROUPS[1], 1, { multiplier: 1.04, motionBias: -0.18 }),
  createPackRole(PACK_GROUPS[1], 2, { multiplier: 1.08, dirtBias: 0.18 }),
  createPackRole(PACK_GROUPS[1], 3, { multiplier: 1.12, spaceBias: -0.16 }),
  createPackRole(PACK_GROUPS[2], 0, { multiplier: 0.95 }),
  createPackRole(PACK_GROUPS[2], 1, { multiplier: 1.04, motionBias: 0.18 }),
  createPackRole(PACK_GROUPS[2], 2, { multiplier: 1.08, dirtBias: -0.15 }),
  createPackRole(PACK_GROUPS[2], 3, { multiplier: 1.12, spaceBias: 0.16 }),
  createPackRole(PACK_GROUPS[3], 0, { multiplier: 1.02 }),
  createPackRole(PACK_GROUPS[3], 1, { multiplier: 1.08, toneBias: 0.1 }),
  createPackRole(PACK_GROUPS[3], 2, { multiplier: 1.14, dirtBias: 0.1 }),
  createPackRole(PACK_GROUPS[3], 3, { multiplier: 1.22, spaceBias: 0.22 }),
  createPackRole(PACK_GROUPS[4], 0, { multiplier: 0.9 }),
  createPackRole(PACK_GROUPS[4], 1, { multiplier: 0.98, toneBias: -0.12 }),
  createPackRole(PACK_GROUPS[4], 2, { multiplier: 1.02, dirtBias: -0.08 }),
  createPackRole(PACK_GROUPS[4], 3, { multiplier: 1.08, spaceBias: -0.14 }),
  createPackRole(PACK_GROUPS[5], 0, { multiplier: 0.94 }),
  createPackRole(PACK_GROUPS[5], 1, { multiplier: 1.0, toneBias: 0.12 }),
  createPackRole(PACK_GROUPS[5], 2, { multiplier: 1.05, motionBias: -0.16 }),
  createPackRole(PACK_GROUPS[5], 3, { multiplier: 1.1, spaceBias: 0.14 }),
  createPackRole(PACK_GROUPS[6], 0, { multiplier: 1.0 }),
  createPackRole(PACK_GROUPS[6], 1, { multiplier: 1.08, toneBias: -0.1 }),
  createPackRole(PACK_GROUPS[6], 2, { multiplier: 1.14, motionBias: 0.16 }),
  createPackRole(PACK_GROUPS[6], 3, { multiplier: 1.24, spaceBias: 0.12 }),
  createPackRole(PACK_GROUPS[7], 0, { multiplier: 1.0 }),
  createPackRole(PACK_GROUPS[7], 1, { multiplier: 1.08, toneBias: 0.12 }),
  createPackRole(PACK_GROUPS[7], 2, { multiplier: 1.14, motionBias: 0.18 }),
  createPackRole(PACK_GROUPS[7], 3, { multiplier: 1.22, dirtBias: 0.08 }),
];

const SAFE_PARAMETER_BOUNDS = {
  level: { low: 0, high: 1, integral: false, zone: "tone" },
  pan: { low: -1, high: 1, integral: false, zone: "space" },
  transpose: { low: -24, high: 24, integral: true, zone: "tone" },
  tune: { low: -1, high: 1, integral: false, zone: "tone" },
  frame_spread: { low: 0, high: 1, integral: false, zone: "motion" },
  stereo_spread: { low: 0, high: 1, integral: false, zone: "space" },
  unison_blend: { low: 0, high: 1, integral: false, zone: "space" },
  unison_detune: { low: 0, high: 1, integral: false, zone: "space" },
  wave_frame: { low: 0, high: 1, integral: false, zone: "motion" },
  spectral_morph_amount: { low: 0, high: 1, integral: false, zone: "motion" },
  distortion_amount: { low: 0, high: 1, integral: false, zone: "dirt" },
  cutoff: { low: 0, high: 100, integral: false, zone: "tone" },
  resonance: { low: 0, high: 1, integral: false, zone: "tone" },
  drive: { low: 0, high: 4, integral: false, zone: "dirt" },
  keytrack: { low: 0, high: 1, integral: false, zone: "tone" },
  mix: { low: 0, high: 1, integral: false, zone: "space" },
  attack: { low: 0, high: 1, integral: false, zone: "motion" },
  decay: { low: 0, high: 1, integral: false, zone: "motion" },
  sustain: { low: 0, high: 1, integral: false, zone: "tone" },
  release: { low: 0, high: 1, integral: false, zone: "motion" },
  dry_wet: { low: 0, high: 1, integral: false, zone: "space" },
  feedback: { low: 0, high: 0.95, integral: false, zone: "motion" },
  mod_depth: { low: 0, high: 1, integral: false, zone: "motion" },
  spread: { low: 0, high: 1, integral: false, zone: "space" },
  decay_time: { low: 0, high: 1, integral: false, zone: "space" },
  size: { low: 0, high: 1, integral: false, zone: "space" },
  pre_high_cutoff: { low: 0, high: 100, integral: false, zone: "tone" },
  pre_low_cutoff: { low: 0, high: 100, integral: false, zone: "tone" },
  filter_cutoff: { low: 0, high: 100, integral: false, zone: "tone" },
};

const SAFE_PARAMETER_PREFIXES = [
  "osc_1_",
  "osc_2_",
  "filter_1_",
  "filter_2_",
  "env_1_",
  "env_2_",
  "chorus_",
  "delay_",
  "reverb_",
];

const state = {
  sourcePreset: null,
  sourceFile: null,
  generatedVariants: [],
  isGenerating: false,
  suiteUnlocked: false,
  lastGenerationMode: "free",
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
  amountRange: document.querySelector("#amount-range"),
  amountValue: document.querySelector("#amount-value"),
  brightnessRange: document.querySelector("#brightness-range"),
  brightnessValue: document.querySelector("#brightness-value"),
  motionRange: document.querySelector("#motion-range"),
  motionValue: document.querySelector("#motion-value"),
  dirtRange: document.querySelector("#dirt-range"),
  dirtValue: document.querySelector("#dirt-value"),
  generateButton: document.querySelector("#generate-button"),
  buttonLabel: document.querySelector(".button-label"),
  status: document.querySelector("#status"),
  suitePanel: document.querySelector("#suite-panel"),
  suiteActions: document.querySelector("#suite-actions"),
  suiteToggle: document.querySelector("#suite-toggle"),
  suiteUnlock: document.querySelector("#suite-unlock"),
  suiteKey: document.querySelector("#suite-key"),
  suiteUnlockButton: document.querySelector("#suite-unlock-button"),
  suiteUnlockNote: document.querySelector("#suite-unlock-note"),
  suiteActive: document.querySelector("#suite-active"),
  generatePack: document.querySelector("#generate-pack"),
  downloadPack: document.querySelector("#download-pack"),
  sourceMetrics: document.querySelector("#source-metrics"),
  strategyMetrics: document.querySelector("#strategy-metrics"),
  presetList: document.querySelector("#preset-list"),
};

const SUITE_UNLOCK_STORAGE_KEY = "kreativ-sound-tools-unlocked";
const SUITE_PURCHASE_CODE = "AA-PRO-32-DGTW9930";
const PRO_PACK_COUNT = PRO_PACK_ROLES.length;

function clamp(value, low, high) {
  return Math.max(low, Math.min(high, value));
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
  return "Wild";
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function hashString(input) {
  let hash = 0;
  for (let index = 0; index < input.length; index += 1) {
    hash = (hash * 31 + input.charCodeAt(index)) >>> 0;
  }
  return hash || 1;
}

function createRng(seed) {
  let value = seed >>> 0;
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 4294967296;
  };
}

function safeScalarParameterKeys(settings) {
  return Object.keys(settings)
    .filter((key) => {
      const value = settings[key];
      if (typeof value !== "number") {
        return false;
      }
      if (!SAFE_PARAMETER_PREFIXES.some((prefix) => key.startsWith(prefix))) {
        return false;
      }
      if (/_on$|_style$|_model$|_destination$|_filter_input$|_midi_track$|_sync$|_tempo$|_voices$/.test(key)) {
        return false;
      }
      if (/_attack_power$|_decay_power$|_release_power$|_delay$|_hold$/.test(key)) {
        return false;
      }
      if (key.includes("formant_") || key.endsWith("blend_transpose")) {
        return false;
      }
      return Object.keys(SAFE_PARAMETER_BOUNDS).some((suffix) => key.endsWith(suffix));
    })
    .sort();
}

function parameterConfigForKey(key) {
  for (const [suffix, config] of Object.entries(SAFE_PARAMETER_BOUNDS)) {
    if (key.endsWith(suffix)) {
      return config;
    }
  }
  return null;
}

function presetSummary(data) {
  const settings = data.settings || {};
  const sample = settings.sample;
  const wavetables = settings.wavetables;
  const modulations = settings.modulations;
  const scalarKeys = safeScalarParameterKeys(settings);

  return {
    name: data.preset_name || data.preset_style || "Untitled Preset",
    author: data.author || "Unknown author",
    sampleName: sample && typeof sample === "object" ? sample.name || "None" : "None",
    wavetableCount: Array.isArray(wavetables) ? wavetables.length : 0,
    modulationCount: Array.isArray(modulations)
      ? modulations.filter((item) => typeof item === "object" && item && Object.values(item).some((value) => ![0, 0.0, "", false, null].includes(value))).length
      : 0,
    scalarKeys,
    macroCount: ["macro1", "macro2", "macro3", "macro4"].filter((key) => data[key]).length,
  };
}

function currentActionLabel() {
  return state.lastGenerationMode === "pro" ? "Generate 32-Preset Pack" : "Generate 3 Free Variations";
}

function updateControlLabels() {
  elements.amountValue.textContent = amountLabel(elements.amountRange.value);
  elements.brightnessValue.textContent = toPercent(elements.brightnessRange.value);
  elements.motionValue.textContent = toPercent(elements.motionRange.value);
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

function slugifyFilename(value) {
  return value.replace(/[<>:"/\\|?*\u0000-\u001F]/g, "").trim() || "preset-mutator-variant";
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
    if (elements.generatePack) {
      elements.generatePack.disabled = true;
    }
    if (elements.downloadPack) {
      elements.downloadPack.disabled = true;
    }
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
  if (elements.generatePack) {
    elements.generatePack.disabled = !state.suiteUnlocked || state.isGenerating;
  }
  if (elements.downloadPack) {
    elements.downloadPack.disabled = state.isGenerating || state.lastGenerationMode !== "pro" || state.generatedVariants.length !== PRO_PACK_COUNT;
  }
  renderSourceMetrics();
  renderStrategyMetrics();
}

function buildStrategyWeights() {
  return {
    tone: Number(elements.brightnessRange.value) / 100,
    motion: Number(elements.motionRange.value) / 100,
    dirt: Number(elements.dirtRange.value) / 100,
    amount: Number(elements.amountRange.value) / 100,
  };
}

function mutateValue(key, value, config, rng, strategy, intensity, role) {
  const span = config.high - config.low;
  const baseScale = span * strategy.amount * 0.17 * intensity;
  const randomOffset = (rng() * 2 - 1) * baseScale;

  let directedOffset = 0;
  if (config.zone === "tone") {
    directedOffset = span * strategy.tone * 0.12 * intensity;
  } else if (config.zone === "motion") {
    directedOffset = span * strategy.motion * 0.12 * intensity;
  } else if (config.zone === "dirt") {
    directedOffset = span * strategy.dirt * 0.14 * intensity;
  } else if (config.zone === "space") {
    directedOffset = span * ((strategy.motion * 0.35) + (strategy.tone * 0.15)) * 0.08 * intensity;
  }

  let roleOffset = 0;
  if (role) {
    if (config.zone === "tone") {
      roleOffset = span * role.toneBias * 0.08 * intensity;
    } else if (config.zone === "motion") {
      roleOffset = span * role.motionBias * 0.08 * intensity;
    } else if (config.zone === "dirt") {
      roleOffset = span * role.dirtBias * 0.1 * intensity;
    } else if (config.zone === "space") {
      roleOffset = span * role.spaceBias * 0.08 * intensity;
    }
  }

  const mutated = clamp(Number(value) + randomOffset + directedOffset + roleOffset, config.low, config.high);
  return config.integral ? Math.round(mutated) : mutated;
}

function chooseParameterPool(keys, strategy) {
  const scored = keys.map((key) => {
    const config = parameterConfigForKey(key);
    let score = 1;
    if (config?.zone === "tone") {
      score += Math.abs(strategy.tone) * 1.5;
    }
    if (config?.zone === "motion") {
      score += Math.abs(strategy.motion) * 1.5;
    }
    if (config?.zone === "dirt") {
      score += Math.abs(strategy.dirt) * 1.8;
    }
    if (config?.zone === "space") {
      score += Math.abs(strategy.motion) * 0.5;
    }
    return { key, score };
  });

  return scored.sort((left, right) => right.score - left.score);
}

function buildVariantDescription(role, strategy, mode) {
  const descriptors = [];
  if (strategy.tone < -0.2) {
    descriptors.push("darker");
  } else if (strategy.tone > 0.2) {
    descriptors.push("brighter");
  }

  if (strategy.motion < -0.2) {
    descriptors.push("steadier");
  } else if (strategy.motion > 0.2) {
    descriptors.push("more animated");
  }

  if (strategy.dirt > 0.25) {
    descriptors.push("grittier");
  } else if (strategy.dirt < -0.25) {
    descriptors.push("cleaner");
  }

  if (!descriptors.length) {
    descriptors.push("balanced");
  }

  if (mode === "pro" && role.groupLabel) {
    return `${role.groupLabel} mutation leaning ${descriptors.join(", ")} with a broader pack spread.`;
  }

  return `${role.label} variation leaning ${descriptors.join(", ")}.`;
}

function generateVariants(mode = "free") {
  const source = state.sourcePreset;
  const strategy = buildStrategyWeights();
  const pool = chooseParameterPool(source.summary.scalarKeys, strategy);
  const roles = mode === "pro" ? PRO_PACK_ROLES : FREE_VARIANT_ROLES;

  return roles.map((role, index) => {
    const rng = createRng(hashString(`${mode}:${source.fileName}:${role.key}:${elements.amountRange.value}:${elements.brightnessRange.value}:${elements.motionRange.value}:${elements.dirtRange.value}`));
    const data = clone(source.data);
    const settings = data.settings;
    const baseChanges = mode === "pro" ? 10 : 8;
    const changeCount = clamp(Math.round(baseChanges + strategy.amount * (mode === "pro" ? 18 : 16) + (index % 4) * 2), 6, mode === "pro" ? 24 : 22);
    const candidateKeys = pool.slice(0, Math.max(changeCount * 2, 12));
    const chosen = [];

    while (chosen.length < Math.min(changeCount, candidateKeys.length)) {
      const item = candidateKeys[Math.floor(rng() * candidateKeys.length)];
      if (!item || chosen.includes(item.key)) {
        continue;
      }
      chosen.push(item.key);
    }

    const changedParameters = [];
    for (const key of chosen) {
      const config = parameterConfigForKey(key);
      if (!config) {
        continue;
      }
      const nextValue = mutateValue(key, settings[key], config, rng, strategy, role.multiplier, role);
      if (Number(nextValue) !== Number(settings[key])) {
        settings[key] = nextValue;
        changedParameters.push(key);
      }
    }

    const baseName = source.summary.name.replace(/\s+\/\s+(Closest|Bolder|Wilder|.+\s\d+)$/i, "").trim();
    data.preset_name = `${baseName} / ${role.nameSuffix}`;
    data.comments = buildVariantDescription(role, strategy, mode);

    return {
      role,
      groupKey: role.groupKey || "free",
      groupLabel: role.groupLabel || "Free Variants",
      groupDescription: role.groupDescription || "Three starter mutations generated from the loaded preset.",
      name: data.preset_name,
      description: data.comments,
      changedParameters,
      data,
      downloadName: `${slugifyFilename(data.preset_name)}.vital`,
    };
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
}

async function downloadVariantPack() {
  if (!state.generatedVariants.length || !window.JSZip) {
    return;
  }

  const zip = new window.JSZip();
  for (const variant of state.generatedVariants) {
    zip.file(variant.downloadName, JSON.stringify(variant.data, null, 2));
  }

  const blob = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  const sourceName = state.sourcePreset?.summary?.name || "Preset Mutator Pack";
  anchor.href = url;
  anchor.download = `${slugifyFilename(sourceName)} - 32 Preset Pack.zip`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
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
    const shouldStartOpen = state.lastGenerationMode !== "pro" || key === "closest";
    const listId = `preset-group-${key}`;

    section.innerHTML = `
      <button class="preset-group-head" type="button" aria-expanded="${shouldStartOpen}" aria-controls="${listId}">
        <div>
          <h3>${group.label} <span class="preset-group-count">${group.variants.length}</span></h3>
          <p>${group.description}</p>
        </div>
        <span class="preset-group-toggle-label">${shouldStartOpen ? "Hide presets" : "Show presets"}</span>
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
        <p class="preset-quality">${summarizeVariantFocus(variant)}</p>
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
        </div>
        <div>
          <span class="metric-label">Key changed parameters</span>
          <div class="chip-list">
            ${variant.changedParameters.slice(0, 8).map((item) => `<span class="chip">${item.replace(/_/g, " ")}</span>`).join("")}
          </div>
        </div>
        <button class="download-button" type="button">
          <span class="download-badge">VITAL</span>
          <span>Download .vital</span>
        </button>
      `;
      card.querySelector(".download-button").addEventListener("click", () => downloadVariant(variant));
      list.appendChild(card);
    }

    const toggle = section.querySelector(".preset-group-head");
    const toggleLabel = section.querySelector(".preset-group-toggle-label");
    toggle.addEventListener("click", () => {
      const expanded = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!expanded));
      list.classList.toggle("hidden", expanded);
      toggleLabel.textContent = expanded ? "Show presets" : "Hide presets";
    });

    elements.presetList.appendChild(section);
  }
}

async function loadPreset(file) {
  if (!file) {
    return;
  }

  if (!file.name.toLowerCase().endsWith(".vital")) {
    state.sourcePreset = null;
    state.sourceFile = null;
    state.generatedVariants = [];
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

    const summary = presetSummary(data);
    if (!summary.scalarKeys.length) {
      throw new Error("No safe Vital parameters were found in this preset.");
    }

    state.sourcePreset = { data, summary, fileName: file.name };
    state.sourceFile = file;
    state.generatedVariants = [];
    state.lastGenerationMode = "free";
    setUploadMessage("");
    updateSourceUi();
    renderVariants();
    elements.status.textContent = state.suiteUnlocked
      ? `Loaded ${summary.name}. Generate 3 free variants or build the 32-preset pack.`
      : `Loaded ${summary.name}. Generate 3 new preset directions when ready.`;
  } catch (error) {
    state.sourcePreset = null;
    state.sourceFile = null;
    state.generatedVariants = [];
    setUploadMessage(error.message || "Unsupported or unreadable preset file.");
    updateSourceUi();
    renderVariants();
  }
}

function setGenerationLoadingState(isLoading, mode) {
  state.isGenerating = isLoading;
  elements.generateButton.disabled = isLoading || !state.sourcePreset;
  elements.generateButton.classList.toggle("is-loading", isLoading && mode === "free");
  elements.buttonLabel.textContent = isLoading && mode === "free" ? "Generating..." : "Generate 3 Free Variations";
  if (elements.generatePack) {
    elements.generatePack.disabled = isLoading || !state.sourcePreset || !state.suiteUnlocked;
    elements.generatePack.classList.toggle("is-loading", isLoading && mode === "pro");
  }
  if (elements.downloadPack) {
    elements.downloadPack.disabled = isLoading || state.lastGenerationMode !== "pro" || state.generatedVariants.length !== PRO_PACK_COUNT;
  }
}

async function handleGenerate(mode = "free") {
  if (!state.sourcePreset || state.isGenerating) {
    return;
  }
  if (mode === "pro" && !state.suiteUnlocked) {
    return;
  }

  setGenerationLoadingState(true, mode);
  elements.status.textContent = mode === "pro"
    ? "Building a 32-preset mutation pack from the loaded source preset..."
    : "Mutating the source preset into 3 new directions...";

  try {
    await new Promise((resolve) => window.setTimeout(resolve, 520));
    state.generatedVariants = generateVariants(mode);
    state.lastGenerationMode = mode;
    renderVariants();
    elements.status.textContent = mode === "pro"
      ? "32-preset mutation pack ready. Expand each group and download individual presets or the full ZIP."
      : "3 preset variations generated. Download the one that feels closest.";
  } finally {
    setGenerationLoadingState(false, mode);
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

function renderSuiteState() {
  elements.suitePanel.classList.toggle("is-unlocked", state.suiteUnlocked);
  elements.suiteActions.hidden = state.suiteUnlocked;
  elements.suiteUnlock.hidden = true;
  elements.suiteActive.hidden = !state.suiteUnlocked;
  elements.suiteToggle?.setAttribute("aria-expanded", "false");
  if (elements.generatePack) {
    elements.generatePack.disabled = !state.suiteUnlocked || !state.sourcePreset || state.isGenerating;
  }
  if (elements.downloadPack) {
    elements.downloadPack.disabled = state.isGenerating || state.lastGenerationMode !== "pro" || state.generatedVariants.length !== PRO_PACK_COUNT;
  }
}

function toggleSuiteUnlock() {
  if (state.suiteUnlocked) {
    return;
  }
  const isOpen = !elements.suiteUnlock.hidden;
  elements.suiteUnlock.hidden = isOpen;
  elements.suiteToggle.setAttribute("aria-expanded", String(!isOpen));
  if (!isOpen) {
    elements.suiteKey.focus();
  }
}

function handleSuiteUnlock() {
  const key = elements.suiteKey.value.trim();
  if (!key) {
    elements.suiteUnlockNote.textContent = "Enter your purchase code to unlock this browser.";
    return;
  }
  if (key !== SUITE_PURCHASE_CODE) {
    elements.suiteUnlockNote.textContent = "Invalid purchase code. Check the code and try again.";
    return;
  }

  state.suiteUnlocked = true;
  window.localStorage.setItem(SUITE_UNLOCK_STORAGE_KEY, "1");
  renderSuiteState();
  elements.status.textContent = state.sourcePreset
    ? "Preset Mutator Pro is active in this browser. Generate the 32-preset pack when ready."
    : "Preset Mutator Pro is active in this browser.";
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
elements.dirtRange.addEventListener("input", () => {
  updateControlLabels();
  renderStrategyMetrics();
});
elements.generateButton.addEventListener("click", () => handleGenerate("free"));
elements.generatePack?.addEventListener("click", () => handleGenerate("pro"));
elements.downloadPack?.addEventListener("click", downloadVariantPack);
elements.suiteToggle?.addEventListener("click", toggleSuiteUnlock);
elements.suiteUnlockButton?.addEventListener("click", handleSuiteUnlock);

updateControlLabels();
updateSourceUi();
renderVariants();
bindDropZone();
state.suiteUnlocked = window.localStorage.getItem(SUITE_UNLOCK_STORAGE_KEY) === "1";
renderSuiteState();

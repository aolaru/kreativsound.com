const VARIANT_ROLES = [
  { key: "closest", label: "Closest", multiplier: 0.7, nameSuffix: "Closest" },
  { key: "bolder", label: "Bolder", multiplier: 1.0, nameSuffix: "Bolder" },
  { key: "wilder", label: "Wilder", multiplier: 1.35, nameSuffix: "Wilder" },
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
  sourceMetrics: document.querySelector("#source-metrics"),
  strategyMetrics: document.querySelector("#strategy-metrics"),
  presetList: document.querySelector("#preset-list"),
};

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
  elements.generateButton.disabled = false;
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

function mutateValue(key, value, config, rng, strategy, intensity) {
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

  const mutated = clamp(Number(value) + randomOffset + directedOffset, config.low, config.high);
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

function buildVariantDescription(role, strategy) {
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

  return `${role.label} variation leaning ${descriptors.join(", ")}.`;
}

function generateVariants() {
  const source = state.sourcePreset;
  const strategy = buildStrategyWeights();
  const pool = chooseParameterPool(source.summary.scalarKeys, strategy);

  return VARIANT_ROLES.map((role, index) => {
    const rng = createRng(hashString(`${source.fileName}:${role.key}:${elements.amountRange.value}:${elements.brightnessRange.value}:${elements.motionRange.value}:${elements.dirtRange.value}`));
    const data = clone(source.data);
    const settings = data.settings;
    const changeCount = clamp(Math.round(8 + strategy.amount * 16 + (index * 2)), 6, 22);
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
      const nextValue = mutateValue(key, settings[key], config, rng, strategy, role.multiplier);
      if (Number(nextValue) !== Number(settings[key])) {
        settings[key] = nextValue;
        changedParameters.push(key);
      }
    }

    const baseName = source.summary.name.replace(/\s+\/\s+(Closest|Bolder|Wilder)$/i, "").trim();
    data.preset_name = `${baseName} / ${role.nameSuffix}`;
    data.comments = buildVariantDescription(role, strategy);

    return {
      role,
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

function renderVariants() {
  if (!state.generatedVariants.length) {
    elements.presetList.innerHTML = `<p class="empty-state">Choose one <strong>.vital</strong> preset, then click <strong>Generate Variations</strong> to create 3 playable mutations.</p>`;
    return;
  }

  elements.presetList.innerHTML = "";
  for (const variant of state.generatedVariants) {
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
          <strong>${variant.role.label}</strong>
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
    elements.presetList.appendChild(card);
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
    setUploadMessage("");
    updateSourceUi();
    renderVariants();
    elements.status.textContent = `Loaded ${summary.name}. Generate 3 new preset directions when ready.`;
  } catch (error) {
    state.sourcePreset = null;
    state.sourceFile = null;
    state.generatedVariants = [];
    setUploadMessage(error.message || "Unsupported or unreadable preset file.");
    updateSourceUi();
    renderVariants();
  }
}

async function handleGenerate() {
  if (!state.sourcePreset || state.isGenerating) {
    return;
  }

  state.isGenerating = true;
  elements.generateButton.disabled = true;
  elements.generateButton.classList.add("is-loading");
  elements.buttonLabel.textContent = "Generating...";
  elements.status.textContent = "Mutating the source preset into 3 new directions...";

  try {
    await new Promise((resolve) => window.setTimeout(resolve, 520));
    state.generatedVariants = generateVariants();
    renderVariants();
    elements.status.textContent = "3 preset variations generated. Download the one that feels closest.";
  } finally {
    state.isGenerating = false;
    elements.generateButton.disabled = !state.sourcePreset;
    elements.generateButton.classList.remove("is-loading");
    elements.buttonLabel.textContent = "Generate Variations";
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
elements.dirtRange.addEventListener("input", () => {
  updateControlLabels();
  renderStrategyMetrics();
});
elements.generateButton.addEventListener("click", handleGenerate);

updateControlLabels();
updateSourceUi();
renderVariants();
bindDropZone();

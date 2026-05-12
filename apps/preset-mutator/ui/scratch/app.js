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
  brightnessValue: document.querySelector("#brightness-value"),
  motionValue: document.querySelector("#motion-value"),
  attackValue: document.querySelector("#attack-value"),
  widthValue: document.querySelector("#width-value"),
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

const SEED_BY_FAMILY = {
  pad: "KS Frozen Hollow.vital",
  pluck: "KS Dread Lantern.vital",
  bass: "KS Iron Wake.vital",
  texture: "KS Shadow Archive.vital",
};

const FREE_VARIANT_LIMIT = 3;
const PRO_PACK_COUNT = 32;
const UNLOCK_STORAGE_KEY = "kreativ-sound-tools-unlocked";
const LEGACY_UNLOCK_STORAGE_KEY = "preset-mutator-pro-preview-unlocked";
const PRO_PURCHASE_CODE = "AA-PRO-32-DGTW9930";

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("../service-worker.js").catch(() => {
      // Installability should fail quietly rather than affecting the app UI.
    });
  });
}

const MOOD_PROFILE = {
  dark: { brightness: 0.32, body: 0.68, movement: 0.44, noise: 0.34, width: 0.48, sustain: 0.64, wetness: 0.32, drive: 0.18 },
  warm: { brightness: 0.5, body: 0.72, movement: 0.36, noise: 0.18, width: 0.42, sustain: 0.58, wetness: 0.24, drive: 0.08 },
  clean: { brightness: 0.62, body: 0.54, movement: 0.32, noise: 0.08, width: 0.5, sustain: 0.46, wetness: 0.18, drive: 0.02 },
  broken: { brightness: 0.43, body: 0.48, movement: 0.7, noise: 0.62, width: 0.62, sustain: 0.52, wetness: 0.34, drive: 0.32 },
};

const FAMILY_PROFILE = {
  pad: { attack: 0.28, sustain: 0.74, movement: 0.5, width: 0.64, pitchHz: 220 },
  pluck: { attack: 0.82, sustain: 0.24, movement: 0.34, width: 0.38, pitchHz: 440 },
  bass: { attack: 0.72, sustain: 0.42, movement: 0.28, width: 0.22, pitchHz: 82 },
  texture: { attack: 0.2, sustain: 0.82, movement: 0.68, width: 0.7, pitchHz: 146 },
};

const REGISTER_PITCH = {
  low: { pad: 146, pluck: 220, bass: 55, texture: 98 },
  mid: { pad: 220, pluck: 440, bass: 82, texture: 146 },
  high: { pad: 392, pluck: 660, bass: 110, texture: 262 },
};

const PRO_RECIPES = [
  { role: "Closest", brightness: 0, movement: -0.03, width: 0, noise: 0, spread: 0.04 },
  { role: "Darker", brightness: -0.18, body: 0.08, noise: 0.03, spread: 0.05 },
  { role: "Brighter", brightness: 0.18, width: 0.04, wetness: 0.04, spread: 0.05 },
  { role: "More Motion", movement: 0.2, width: 0.08, wetness: 0.06, spread: 0.06 },
  { role: "Steadier", movement: -0.18, width: -0.04, wetness: -0.04, spread: 0.05 },
  { role: "Wider", width: 0.2, sustain: 0.05, wetness: 0.06, spread: 0.05 },
  { role: "Tighter", width: -0.16, sustain: -0.08, wetness: -0.08, spread: 0.05 },
  { role: "Textured", noise: 0.18, movement: 0.1, drive: 0.08, spread: 0.06 },
];

function clamp(value, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

function lerp(min, max, amount) {
  return min + (max - min) * amount;
}

function percentRangeValue(input) {
  return Number(input.value) / 100;
}

function updateStatus(message) {
  elements.status.textContent = message;
}

function sanitizeFileName(value) {
  return value.replace(/[<>:"/\\|?*\u0000-\u001f]/g, "").trim() || "Preset Mutator Vital";
}

function titleCase(value) {
  return value
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 5)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function updateControlLabels() {
  elements.brightnessValue.textContent = `${elements.brightnessRange.value}%`;
  elements.motionValue.textContent = `${elements.motionRange.value}%`;
  elements.attackValue.textContent = `${elements.attackRange.value}%`;
  elements.widthValue.textContent = `${elements.widthRange.value}%`;
}

function variantSeed(index) {
  const x = Math.sin((index + 1) * 97.13) * 43758.5453;
  return x - Math.floor(x);
}

function vary(base, amount, index, shift = 0) {
  const seed = variantSeed(index + shift);
  return clamp(base + (seed * 2 - 1) * amount);
}

function currentProfile() {
  const family = elements.familySelect.value;
  const mood = elements.moodSelect.value;
  const register = elements.registerSelect.value;
  const moodBase = MOOD_PROFILE[mood];
  const familyBase = FAMILY_PROFILE[family];
  const intent = elements.intentText.value.trim();
  const intentLower = intent.toLowerCase();
  const textBrightness = /\b(bright|glass|clear|shimmer|open|air)\b/.test(intentLower) ? 0.08 : /\b(dark|deep|noir|shadow|black)\b/.test(intentLower) ? -0.08 : 0;
  const textMotion = /\b(evolving|moving|pulsing|motion|animated)\b/.test(intentLower) ? 0.1 : /\b(static|still|steady|simple)\b/.test(intentLower) ? -0.08 : 0;
  const textNoise = /\b(broken|industrial|dirty|noise|fractured|grit)\b/.test(intentLower) ? 0.12 : 0;

  return {
    family,
    mood,
    register,
    intent,
    brightness: clamp(moodBase.brightness + percentRangeValue(elements.brightnessRange) * 0.26 + textBrightness),
    body: clamp(moodBase.body),
    attack: clamp(familyBase.attack + percentRangeValue(elements.attackRange) * 0.24),
    sustain: clamp((moodBase.sustain + familyBase.sustain) / 2),
    movement: clamp((moodBase.movement + familyBase.movement) / 2 + percentRangeValue(elements.motionRange) * 0.28 + textMotion),
    noise: clamp(moodBase.noise + textNoise),
    width: clamp((moodBase.width + familyBase.width) / 2 + percentRangeValue(elements.widthRange) * 0.28),
    wetness: clamp(moodBase.wetness),
    drive: clamp(moodBase.drive),
    pitchHz: REGISTER_PITCH[register][family],
  };
}

function noteName(frequency) {
  const midi = Math.round(69 + 12 * Math.log2(frequency / 440));
  const names = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  return `${names[((midi % 12) + 12) % 12]}${Math.floor(midi / 12) - 1}`;
}

function familyLabel(family) {
  return {
    pad: "Pad / Atmosphere",
    pluck: "Pluck / Keys",
    bass: "Bass",
    texture: "Drone / Texture",
  }[family];
}

function mapProfileToVital(profile, index, roleLabel, spread = 1) {
  const brightness = vary(profile.brightness, 0.08 * spread, index, 1);
  const body = vary(profile.body, 0.07 * spread, index, 2);
  const attack = vary(profile.attack, 0.08 * spread, index, 3);
  const sustain = vary(profile.sustain, 0.08 * spread, index, 4);
  const movement = vary(profile.movement, 0.11 * spread, index, 5);
  const noise = vary(profile.noise, 0.08 * spread, index, 6);
  const width = vary(profile.width, 0.09 * spread, index, 7);
  const wetness = vary(profile.wetness, 0.06 * spread, index, 8);
  const drive = vary(profile.drive, 0.05 * spread, index, 9);
  const family = profile.family;
  const voices = family === "bass" ? Math.round(lerp(1, 3, width)) : Math.round(lerp(2, 8, width));
  const detune = family === "bass" ? lerp(0.02, 0.1, width) : lerp(0.05, 0.28, width);
  const filterCutoff = family === "bass" ? lerp(120, 2200, brightness) : lerp(320, 14000, brightness);
  const resonance = lerp(0.08, 0.45, 1 - body);
  const envAttack = family === "pluck" ? lerp(0.001, 0.08, 1 - attack) : lerp(0.01, 2.4, 1 - attack);
  const envDecay = family === "pluck" ? lerp(0.08, 1.4, sustain) : lerp(0.3, 3.4, sustain);
  const envSustain = family === "pluck" ? lerp(0.05, 0.6, sustain) : lerp(0.35, 0.96, sustain);
  const envRelease = family === "pluck" ? lerp(0.08, 1.8, sustain) : lerp(0.6, 6.5, sustain);
  const chorusMix = clamp((family === "bass" ? lerp(0.02, 0.18, width) : lerp(0.1, 0.58, width)) + wetness * 0.14);
  const reverbMix = clamp((family === "pluck" ? lerp(0.08, 0.28, sustain) : lerp(0.12, 0.62, sustain)) + wetness * 0.18);
  const delayMix = clamp(0.02 + wetness * 0.12 + movement * 0.05);
  const distortion = clamp(lerp(0, 0.56, noise * 0.65 + brightness * 0.35) + drive * 0.18);
  const noiseLevel = lerp(0, 0.34, noise);
  const cutoffNormalized = clamp((filterCutoff - 120) / (14000 - 120));
  const presetName = buildPresetName(profile, { brightness, movement, noise, width }, index);

  return {
    name: presetName,
    roleLabel,
    family: familyLabel(family),
    familyKey: family,
    summary: buildPresetSummary({ family, brightness, movement, width, sustain, attack, register: noteName(profile.pitchHz) }),
    parameterMap: {
      osc_1_level: family === "bass" ? lerp(0.78, 0.98, body) : lerp(0.48, 0.86, body),
      osc_2_level: family === "bass" ? lerp(0.18, 0.42, brightness) : lerp(0.24, 0.72, brightness),
      osc_1_unison_voices: voices,
      osc_2_unison_voices: Math.max(1, voices - (family === "bass" ? 1 : 0)),
      osc_1_unison_detune: detune,
      osc_2_unison_detune: clamp(detune * 1.14, 0.02, 0.35),
      osc_1_stereo_spread: width,
      osc_2_stereo_spread: clamp(width * 0.92, 0, 1),
      filter_1_cutoff: lerp(18, 92, cutoffNormalized),
      filter_1_resonance: resonance,
      filter_1_drive: lerp(0.2, 3.2, body * 0.5 + noise * 0.5),
      filter_1_keytrack: family === "bass" ? 0.75 : lerp(0.12, 0.52, brightness),
      filter_1_mix: 1,
      env_1_attack: clamp(envAttack / 2.5, 0.001, 1),
      env_1_decay: clamp(envDecay / 3.4, 0.02, 1),
      env_1_sustain: envSustain,
      env_1_release: clamp(envRelease / 6.5, 0.03, 1),
      chorus_dry_wet: chorusMix,
      chorus_mod_depth: clamp(0.12 + width * 0.6, 0, 1),
      chorus_feedback: clamp(0.08 + movement * 0.4, 0, 0.95),
      reverb_dry_wet: reverbMix,
      reverb_size: clamp(0.3 + sustain * 0.6, 0, 1),
      reverb_decay_time: clamp(0.22 + sustain * 0.72, 0, 1),
      delay_dry_wet: delayMix,
      delay_feedback: clamp(0.16 + movement * 0.28, 0, 0.95),
      delay_filter_cutoff: clamp(36 + brightness * 44 + drive * 6, 0, 127),
      distortion_mix: distortion,
      distortion_drive: lerp(0.1, 4, clamp(distortion + drive * 0.18)),
      filter_fx_cutoff: lerp(26, 86, brightness) - drive * 8,
      filter_fx_resonance: clamp(0.08 + noise * 0.26 + drive * 0.12, 0, 1),
      sample_on: 0,
      noise_on: noiseLevel > 0.03 ? 1 : 0,
      noise_level: noiseLevel,
    },
    parameters: [
      ["Filter Cutoff", filterCutoff >= 1000 ? `${(filterCutoff / 1000).toFixed(2)} kHz` : `${Math.round(filterCutoff)} Hz`],
      ["Env Attack", `${envAttack.toFixed(2)} s`],
      ["Env Release", `${envRelease.toFixed(2)} s`],
      ["Reverb Mix", `${Math.round(reverbMix * 100)}%`],
    ],
  };
}

function buildPresetName(profile, shaped, index) {
  const intentName = titleCase(profile.intent);
  if (intentName) {
    return `${intentName} ${index + 1}`;
  }

  const tone = shaped.brightness < 0.42 ? "Shadow" : shaped.brightness > 0.6 ? "Lumen" : "Signal";
  const body = profile.family === "bass" ? "Current" : profile.family === "pluck" ? "Key" : profile.family === "texture" ? "Drift" : "Bloom";
  return `${tone} ${body} ${index + 1}`;
}

function buildPresetSummary({ family, brightness, movement, width, sustain, attack, register }) {
  const tone = brightness > 0.58 ? "brighter" : brightness < 0.42 ? "darker" : "balanced";
  const motion = movement > 0.5 ? "animated" : movement < 0.3 ? "steady" : "lightly moving";
  const space = width > 0.55 ? "wide" : width < 0.3 ? "tight" : "centered";
  const tail = sustain > 0.58 ? "longer tail" : sustain < 0.32 ? "shorter tail" : "controlled tail";
  const onset = attack > 0.62 ? "harder attack" : attack < 0.36 ? "softer attack" : "balanced attack";

  if (family === "bass") {
    return `${tone.charAt(0).toUpperCase() + tone.slice(1)} bass around ${register} with ${onset} and ${space} weight.`;
  }
  if (family === "pluck") {
    return `${tone.charAt(0).toUpperCase() + tone.slice(1)} pluck around ${register} with ${motion} movement and a ${tail}.`;
  }
  if (family === "texture") {
    return `${tone.charAt(0).toUpperCase() + tone.slice(1)} texture around ${register} with ${motion} detail and ${space} space.`;
  }
  return `${tone.charAt(0).toUpperCase() + tone.slice(1)} pad around ${register} with ${motion} movement and a ${tail}.`;
}

function shapeProfile(base, recipe, index) {
  return {
    ...base,
    brightness: vary(clamp(base.brightness + (recipe.brightness ?? 0)), recipe.spread ?? 0.06, index, 11),
    body: vary(clamp(base.body + (recipe.body ?? 0)), recipe.spread ?? 0.06, index, 12),
    attack: vary(clamp(base.attack + (recipe.attack ?? 0)), recipe.spread ?? 0.06, index, 13),
    sustain: vary(clamp(base.sustain + (recipe.sustain ?? 0)), recipe.spread ?? 0.06, index, 14),
    movement: vary(clamp(base.movement + (recipe.movement ?? 0)), recipe.spread ?? 0.06, index, 15),
    noise: vary(clamp(base.noise + (recipe.noise ?? 0)), recipe.spread ?? 0.06, index, 16),
    width: vary(clamp(base.width + (recipe.width ?? 0)), recipe.spread ?? 0.06, index, 17),
    wetness: vary(clamp(base.wetness + (recipe.wetness ?? 0)), recipe.spread ?? 0.06, index, 18),
    drive: vary(clamp(base.drive + (recipe.drive ?? 0)), recipe.spread ?? 0.06, index, 19),
  };
}

function buildFreePack(profile) {
  return [
    { role: "Closest", spread: 0.04 },
    { role: "Darker", brightness: -0.16, body: 0.06, spread: 0.05 },
    { role: "More Motion", movement: 0.18, width: 0.06, wetness: 0.04, spread: 0.05 },
  ].map((recipe, index) => mapProfileToVital(shapeProfile(profile, recipe, index), index, recipe.role, 0.9));
}

function buildProPack(profile) {
  return Array.from({ length: PRO_PACK_COUNT }, (_, index) => {
    const recipe = PRO_RECIPES[index % PRO_RECIPES.length];
    return mapProfileToVital(shapeProfile(profile, recipe, index), index, recipe.role, 1.15);
  });
}

function renderProfile(profile) {
  const rows = [
    ["Type", familyLabel(profile.family)],
    ["Mood", elements.moodSelect.options[elements.moodSelect.selectedIndex].text],
    ["Register", noteName(profile.pitchHz)],
    ["Brightness", `${Math.round(profile.brightness * 100)}%`],
    ["Motion", `${Math.round(profile.movement * 100)}%`],
    ["Width", `${Math.round(profile.width * 100)}%`],
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
    elements.presetList.innerHTML = `<p class="empty-state">Click <strong>Generate 3 Free Presets</strong> to create from-scratch Vital starting points.</p>`;
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
      <div class="preset-confidence">
        <span><strong>${confidenceForPreset(preset)}</strong> confidence</span>
        <span><strong>Best use</strong> ${bestUseForPreset(preset)}</span>
      </div>
      <p class="preset-quality">Why this result: built from the selected intent profile, then biased toward ${preset.roleLabel.toLowerCase()} behavior.</p>
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

function confidenceForPreset(preset) {
  let score = 83;
  if (preset.roleLabel === "Closest") {
    score += 8;
  } else if (preset.roleLabel === "Darker" || preset.roleLabel === "Brighter") {
    score += 5;
  } else if (preset.roleLabel === "More Motion") {
    score += 3;
  }
  if (preset.parameterMap.filter_1_cutoff >= 18 && preset.parameterMap.filter_1_cutoff <= 92) {
    score += 2;
  }
  if (preset.parameterMap.env_1_release >= 0.06 && preset.parameterMap.env_1_release <= 0.9) {
    score += 2;
  }
  return `${Math.min(95, score)}%`;
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

function applyParameterMapToPreset(data, preset) {
  const rendered = structuredClone(data);
  const settings = rendered.settings;

  for (const [key, value] of Object.entries(preset.parameterMap)) {
    settings[key] = value;
  }

  settings.osc_1_on = 1;
  settings.osc_2_on = 1;
  settings.filter_1_on = 1;
  settings.chorus_on = settings.chorus_dry_wet > 0.01 ? 1 : 0;
  settings.reverb_on = settings.reverb_dry_wet > 0.01 ? 1 : 0;
  settings.distortion_on = settings.distortion_mix > 0.01 ? 1 : 0;
  settings.osc_1_unison_voices = Math.round(clamp(settings.osc_1_unison_voices, 1, 8));
  settings.osc_2_unison_voices = Math.round(clamp(settings.osc_2_unison_voices, 1, 8));
  settings.preset_name = preset.name;
  rendered.author = "Preset Mutator";
  rendered.comments = preset.summary;
  rendered.preset_style = preset.familyKey.charAt(0).toUpperCase() + preset.familyKey.slice(1);
  rendered.macro1 = "Tone";
  rendered.macro2 = "Motion";
  rendered.macro3 = "Space";
  rendered.macro4 = "Drive";
  return rendered;
}

async function buildVitalPresetBlob(preset) {
  const seed = await loadSeedPreset(preset.familyKey);
  const rendered = applyParameterMapToPreset(seed, preset);
  return {
    fileName: `${sanitizeFileName(preset.name)}.vital`,
    blob: new Blob([JSON.stringify(rendered)], { type: "application/json;charset=utf-8" }),
  };
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
  updateStatus(mode === "pro" ? "Building 32 from-scratch Vital presets..." : "Building 3 from-scratch Vital presets...");
  window.setTimeout(() => {
    const profile = currentProfile();
    state.presets = mode === "pro" ? buildProPack(profile) : buildFreePack(profile);
    renderPresets(state.presets);
    elements.downloadPack.disabled = mode !== "pro";
    updateStatus(mode === "pro" ? "32 from-scratch Vital presets ready." : "3 from-scratch Vital presets ready.");
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
  if (!isOpen) {
    elements.paidFeatureKey.focus();
  }
}

function unlockPro() {
  const code = elements.paidFeatureKey.value.trim();
  if (!code) {
    elements.paidFeatureUnlockNote.textContent = "Enter your purchase code to unlock this browser.";
    return;
  }
  if (code !== PRO_PURCHASE_CODE) {
    elements.paidFeatureUnlockNote.textContent = "Invalid purchase code. Check the code and try again.";
    return;
  }
  state.proUnlocked = true;
  window.localStorage.setItem(UNLOCK_STORAGE_KEY, "1");
  renderUnlockState();
  updateStatus("Preset Mutator Pro is active in this browser.");
}

function refreshProfile() {
  updateControlLabels();
  renderProfile(currentProfile());
}

for (const element of [
  elements.familySelect,
  elements.moodSelect,
  elements.registerSelect,
  elements.intentText,
  elements.brightnessRange,
  elements.motionRange,
  elements.attackRange,
  elements.widthRange,
]) {
  element.addEventListener("input", refreshProfile);
  element.addEventListener("change", refreshProfile);
}

elements.generateButton.addEventListener("click", () => generate("free"));
elements.generatePack?.addEventListener("click", () => generate("pro"));
elements.downloadPack?.addEventListener("click", downloadPack);
elements.paidFeatureToggle?.addEventListener("click", toggleUnlock);
elements.paidFeatureUnlockButton?.addEventListener("click", unlockPro);

state.proUnlocked = window.localStorage.getItem(UNLOCK_STORAGE_KEY) === "1" || window.localStorage.getItem(LEGACY_UNLOCK_STORAGE_KEY) === "1";
refreshProfile();
renderPresets([]);
renderUnlockState();

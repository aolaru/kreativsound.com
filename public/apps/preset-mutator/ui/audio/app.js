import { PresetMutatorKnob } from "../preset-mutator-knob.js";
import { clamp, familyLabel, formatHz, sanitizeFileName } from "../engine/common.js";
import { AUDIO_PRO_PACK_COUNT, buildAudioFreePack, buildAudioProfile as createAudioProfile, buildAudioProPack } from "../engine/audio-engine.js";
import { scoreGeneratedPreset } from "../engine/quality.js";
import { createVitalPresetBlob, SEED_BY_FAMILY } from "../engine/vital-export.js";

const state = {
  audioContext: null,
  originalBuffer: null,
  currentSource: null,
  isPlaying: false,
  playbackStartedAt: 0,
  playbackOffset: 0,
  playbackAnimationFrame: 0,
  analysis: null,
  profile: null,
  presets: [],
  isGenerating: false,
  proPreviewUnlocked: false,
  sourceName: "",
  seedCache: new Map(),
  lastGenerationMode: "free",
};

const elements = {
  fileInput: document.querySelector("#file-input"),
  fileName: document.querySelector("#file-name"),
  fileDuration: document.querySelector("#file-duration"),
  fileSampleRate: document.querySelector("#file-sample-rate"),
  fileChannels: document.querySelector("#file-channels"),
  waveform: document.querySelector("#waveform"),
  waveformPanel: document.querySelector("#waveform-drop-zone"),
  waveformDropCta: document.querySelector("#waveform-drop-cta"),
  waveformEmptyNote: document.querySelector("#waveform-empty-note"),
  uploadMessage: document.querySelector("#upload-message"),
  status: document.querySelector("#status"),
  inputMode: document.querySelector("#input-mode"),
  mutationKnob: document.querySelector("#mutation-knob"),
  mutationAmount: document.querySelector("#mutation-amount"),
  brightnessBias: document.querySelector("#brightness-bias"),
  movementBias: document.querySelector("#movement-bias"),
  attackBias: document.querySelector("#attack-bias"),
  dirtBias: document.querySelector("#dirt-bias"),
  widthBias: document.querySelector("#width-bias"),
  brightnessBiasValue: document.querySelector("#brightness-bias-value"),
  movementBiasValue: document.querySelector("#movement-bias-value"),
  attackBiasValue: document.querySelector("#attack-bias-value"),
  dirtBiasValue: document.querySelector("#dirt-bias-value"),
  widthBiasValue: document.querySelector("#width-bias-value"),
  playToggle: document.querySelector("#play-toggle"),
  playbackTime: document.querySelector("#playback-time"),
  analyzeGenerate: document.querySelector("#analyze-generate"),
  analyzeGenerateLabel: document.querySelector("#analyze-generate .button-label"),
  analysisMetrics: document.querySelector("#analysis-metrics"),
  profileMetrics: document.querySelector("#profile-metrics"),
  analysisShell: document.querySelector("#analysis-shell"),
  analysisToggle: document.querySelector("#analysis-toggle"),
  analysisContent: document.querySelector("#analysis-content"),
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
  generatePack: document.querySelector("#generate-pack"),
  downloadPack: document.querySelector("#download-pack"),
  selfTestNote: document.querySelector("#self-test-note"),
};

const FREE_VARIANT_LIMIT = 3;
const PRO_PACK_COUNT = AUDIO_PRO_PACK_COUNT;
const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
const SELF_TEST_ENABLED = new URLSearchParams(window.location.search).get("self_test") === "1";
const GENERATE_DELAY_MS = 500;
const SUITE_UNLOCK_STORAGE_KEY = "kreativ-sound-tools-unlocked";
const LEGACY_AUDIO_ALCHEMY_STORAGE_KEY = "preset-mutator-pro-preview-unlocked";
const PRO_PURCHASE_CODE = "AA-PRO-32-DGTW9930";
const SUPPORTED_AUDIO_EXTENSIONS = [".wav", ".mp3", ".aiff", ".aif", ".m4a", ".aac", ".ogg", ".flac"];
const ANALYTICS_MODE = "audio";

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("../service-worker.js").catch(() => {
      // Installability should fail quietly rather than affecting the app UI.
    });
  });
}

function createAudioContext() {
  if (!state.audioContext) {
    state.audioContext = new AudioContext();
  }
  return state.audioContext;
}

async function ensureAudioContextRunning() {
  const context = createAudioContext();
  if (context.state === "suspended") {
    await context.resume();
  }
  return context;
}

function formatPercent(value) {
  return `${Math.round(value * 100)}%`;
}

function formatFileSize(bytes) {
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
  return `${Math.round(bytes / 1024)} KB`;
}

function formatTime(seconds) {
  const safeSeconds = Math.max(0, seconds || 0);
  const minutes = Math.floor(safeSeconds / 60);
  const secs = Math.floor(safeSeconds % 60);
  return `${minutes}:${String(secs).padStart(2, "0")}`;
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

function durationBucket(seconds) {
  if (seconds <= 2) {
    return "short";
  }
  if (seconds <= 8) {
    return "medium";
  }
  return "long";
}

function sizeBucket(bytes) {
  if (bytes < 1024 * 1024) {
    return "under_1mb";
  }
  if (bytes < 5 * 1024 * 1024) {
    return "1mb_to_5mb";
  }
  return "5mb_to_10mb";
}

function currentAnalyticsSelection() {
  return {
    input_mode: elements.inputMode?.value || "auto",
    mutation_amount: Number(elements.mutationAmount.value),
    mutation_bucket: mutationBucket(elements.mutationAmount.value),
    brightness_bucket: signedBucket(elements.brightnessBias.value, "darker", "brighter"),
    movement_bucket: signedBucket(elements.movementBias.value, "steadier", "more_motion"),
    attack_bucket: signedBucket(elements.attackBias.value, "softer", "harder"),
    dirt_bucket: signedBucket(elements.dirtBias.value, "cleaner", "dirtier"),
    width_bucket: signedBucket(elements.widthBias.value, "narrower", "wider"),
  };
}

function showUploadMessage(message) {
  elements.uploadMessage.textContent = message;
  elements.uploadMessage.hidden = !message;
}

function resetLoadedState() {
  stopPlayback(true);
  setReady(false);
  state.originalBuffer = null;
  state.analysis = null;
  state.profile = null;
  state.presets = [];
  state.lastGenerationMode = "free";
  state.sourceName = "";
  elements.fileName.textContent = "No file loaded";
  elements.fileDuration.textContent = "0.0s";
  elements.fileSampleRate.textContent = "-";
  elements.fileChannels.textContent = "-";
  renderMetricGrid(elements.analysisMetrics, []);
  renderMetricGrid(elements.profileMetrics, []);
  setAnalysisVisible(false);
  renderPresets([]);
  elements.waveform.getContext("2d").clearRect(0, 0, elements.waveform.width, elements.waveform.height);
  elements.waveformPanel.classList.remove("has-waveform");
  elements.waveformDropCta.hidden = false;
  elements.waveformEmptyNote.hidden = false;
  updatePlaybackUI();
  showUploadMessage("");
}

function createSyntheticBuffer() {
  const context = createAudioContext();
  const sampleRate = 44100;
  const durationSeconds = 2.4;
  const frameCount = Math.floor(sampleRate * durationSeconds);
  const buffer = context.createBuffer(1, frameCount, sampleRate);
  const channel = buffer.getChannelData(0);

  for (let i = 0; i < frameCount; i += 1) {
    const t = i / sampleRate;
    const envelope = Math.exp(-t * 1.9);
    const body = Math.sin(2 * Math.PI * 220 * t) * 0.55;
    const air = Math.sin(2 * Math.PI * 660 * t) * 0.18;
    const movement = Math.sin(2 * Math.PI * 0.6 * t) * 0.12;
    channel[i] = (body + air + movement) * envelope;
  }

  return buffer;
}

function updateControlLabels() {
  elements.brightnessBiasValue.textContent = `${elements.brightnessBias.value}%`;
  elements.movementBiasValue.textContent = `${elements.movementBias.value}%`;
  elements.attackBiasValue.textContent = `${elements.attackBias.value}%`;
  elements.dirtBiasValue.textContent = `${elements.dirtBias.value}%`;
  elements.widthBiasValue.textContent = `${elements.widthBias.value}%`;
}

function setReady(enabled) {
  elements.playToggle.disabled = !enabled;
  elements.analyzeGenerate.disabled = !enabled || state.isGenerating;
  if (elements.generatePack) {
    elements.generatePack.disabled = !enabled || state.isGenerating || !state.proPreviewUnlocked;
  }
  if (elements.downloadPack) {
    elements.downloadPack.disabled = state.isGenerating || state.lastGenerationMode !== "pro" || state.presets.length !== PRO_PACK_COUNT;
  }
}

function setGenerateLoadingState(isLoading) {
  state.isGenerating = isLoading;
  elements.analyzeGenerate.classList.toggle("is-loading", isLoading);
  elements.analyzeGenerateLabel.textContent = isLoading ? "Analyzing audio..." : "Generate 3 Free Variants";
  if (elements.generatePack) {
    elements.generatePack.disabled = !state.originalBuffer || isLoading || !state.proPreviewUnlocked;
  }
  if (elements.downloadPack) {
    elements.downloadPack.disabled = isLoading || state.lastGenerationMode !== "pro" || state.presets.length !== PRO_PACK_COUNT;
  }
  setReady(Boolean(state.originalBuffer));
}

function updatePlaybackUI() {
  const duration = state.originalBuffer?.duration || 0;
  const currentTime = state.isPlaying
    ? Math.min(duration, createAudioContext().currentTime - state.playbackStartedAt)
    : state.playbackOffset;
  elements.playToggle.textContent = state.isPlaying ? "Stop" : "Play Source";
  elements.playbackTime.textContent = `${formatTime(currentTime)} / ${formatTime(duration)}`;
}

function cancelPlaybackFrame() {
  if (state.playbackAnimationFrame) {
    window.cancelAnimationFrame(state.playbackAnimationFrame);
    state.playbackAnimationFrame = 0;
  }
}

function stopPlayback(resetToStart = false) {
  cancelPlaybackFrame();
  if (state.currentSource) {
    state.currentSource.onended = null;
    state.currentSource.stop();
    state.currentSource.disconnect();
    state.currentSource = null;
  }
  state.isPlaying = false;
  state.playbackOffset = resetToStart ? 0 : state.playbackOffset;
  if (state.originalBuffer) {
    renderWaveform(state.originalBuffer, state.originalBuffer.duration ? state.playbackOffset / state.originalBuffer.duration : 0);
  }
  updatePlaybackUI();
}

function tickPlayback() {
  if (!state.isPlaying || !state.originalBuffer) {
    cancelPlaybackFrame();
    return;
  }

  const elapsed = Math.min(state.originalBuffer.duration, createAudioContext().currentTime - state.playbackStartedAt);
  const ratio = state.originalBuffer.duration > 0 ? elapsed / state.originalBuffer.duration : 0;
  renderWaveform(state.originalBuffer, ratio);
  updatePlaybackUI();

  if (elapsed >= state.originalBuffer.duration) {
    stopPlayback(true);
    return;
  }

  state.playbackAnimationFrame = window.requestAnimationFrame(tickPlayback);
}

async function playBuffer(buffer, offset = 0) {
  const context = await ensureAudioContextRunning();
  stopPlayback(false);
  const source = context.createBufferSource();
  source.buffer = buffer;
  source.connect(context.destination);
  state.playbackOffset = Math.max(0, Math.min(buffer.duration, offset));
  state.playbackStartedAt = context.currentTime - state.playbackOffset;
  state.isPlaying = true;
  source.start(0, state.playbackOffset);
  source.onended = () => {
    if (state.currentSource === source) {
      state.currentSource.disconnect();
      state.currentSource = null;
      state.isPlaying = false;
      state.playbackOffset = 0;
      cancelPlaybackFrame();
      renderWaveform(buffer, 0);
      updatePlaybackUI();
    }
  };
  state.currentSource = source;
  tickPlayback();
}

function downmix(buffer) {
  const mono = new Float32Array(buffer.length);
  for (let channel = 0; channel < buffer.numberOfChannels; channel += 1) {
    const data = buffer.getChannelData(channel);
    for (let i = 0; i < buffer.length; i += 1) {
      mono[i] += data[i] / buffer.numberOfChannels;
    }
  }
  return mono;
}

function drawWaveform(buffer, playheadRatio = null) {
  const canvas = elements.waveform;
  const context = canvas.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;
  const data = downmix(buffer);
  const step = Math.ceil(data.length / width);
  const amp = height * 0.42;

  context.clearRect(0, 0, width, height);
  context.fillStyle = "#091318";
  context.fillRect(0, 0, width, height);

  context.strokeStyle = "rgba(128,216,201,0.15)";
  context.beginPath();
  context.moveTo(0, height / 2);
  context.lineTo(width, height / 2);
  context.stroke();

  context.beginPath();
  context.strokeStyle = "#c7ff68";
  context.lineWidth = 2;

  for (let i = 0; i < width; i += 1) {
    let min = 1;
    let max = -1;
    for (let j = 0; j < step; j += 1) {
      const sample = data[i * step + j];
      if (sample === undefined) {
        break;
      }
      if (sample < min) min = sample;
      if (sample > max) max = sample;
    }
    context.moveTo(i, height / 2 + min * amp);
    context.lineTo(i, height / 2 + max * amp);
  }

  context.stroke();

  if (playheadRatio !== null) {
    const x = Math.max(0, Math.min(width, playheadRatio * width));
    context.strokeStyle = "rgba(255, 244, 244, 0.92)";
    context.lineWidth = 2;
    context.beginPath();
    context.moveTo(x, 0);
    context.lineTo(x, height);
    context.stroke();
  }

  elements.waveformPanel.classList.add("has-waveform");
  elements.waveformDropCta.hidden = true;
  elements.waveformEmptyNote.hidden = true;
  updatePlaybackUI();
}

function analyzeAudio(buffer) {
  const mono = downmix(buffer);
  const length = mono.length;
  const sampleRate = buffer.sampleRate;
  const absData = new Float32Array(length);

  let sumSquares = 0;
  let zeroCrossings = 0;
  let peak = 0;
  for (let i = 0; i < length; i += 1) {
    const sample = mono[i];
    const abs = Math.abs(sample);
    absData[i] = abs;
    sumSquares += sample * sample;
    if (abs > peak) {
      peak = abs;
    }
    if (i > 0 && ((mono[i - 1] >= 0 && sample < 0) || (mono[i - 1] < 0 && sample >= 0))) {
      zeroCrossings += 1;
    }
  }

  const rms = Math.sqrt(sumSquares / length);
  const zeroCrossRate = zeroCrossings / length;

  const frameCount = 64;
  const frameSize = Math.max(128, Math.floor(length / frameCount));
  const envelope = [];
  const centroidFrames = [];
  const flatnessFrames = [];

  let attackFrame = 0;
  let maxEnvelope = 0;

  for (let frameIndex = 0; frameIndex < frameCount; frameIndex += 1) {
    const start = frameIndex * frameSize;
    if (start >= length) {
      break;
    }
    const end = Math.min(length, start + frameSize);

    let frameEnergy = 0;
    for (let i = start; i < end; i += 1) {
      frameEnergy += absData[i];
    }
    const avg = frameEnergy / (end - start);
    envelope.push(avg);
    if (avg > maxEnvelope) {
      maxEnvelope = avg;
      attackFrame = envelope.length - 1;
    }

    const spectral = frameSpectrum(mono, start, end, sampleRate);
    centroidFrames.push(spectral.centroidHz);
    flatnessFrames.push(spectral.flatness);
  }

  const onsetRatio = envelope.length > 1 ? attackFrame / Math.max(1, envelope.length - 1) : 0;
  const tail = envelope.slice(Math.floor(envelope.length * 0.65));
  const sustainEnergy = tail.length ? tail.reduce((sum, value) => sum + value, 0) / tail.length : 0;
  const sustainRatio = maxEnvelope > 0 ? sustainEnergy / maxEnvelope : 0;

  const envelopeMean = envelope.reduce((sum, value) => sum + value, 0) / Math.max(1, envelope.length);
  const envelopeDeviation = envelope.reduce((sum, value) => sum + Math.abs(value - envelopeMean), 0) / Math.max(1, envelope.length);
  const movement = envelopeMean > 0 ? envelopeDeviation / envelopeMean : 0;

  const avgCentroid = centroidFrames.reduce((sum, value) => sum + value, 0) / Math.max(1, centroidFrames.length);
  const avgFlatness = flatnessFrames.reduce((sum, value) => sum + value, 0) / Math.max(1, flatnessFrames.length);

  const pitchHz = estimatePitch(mono, sampleRate);
  const stereoWidth = estimateStereoWidth(buffer);

  return {
    rms,
    peak,
    zeroCrossRate,
    onsetRatio,
    sustainRatio,
    movement,
    centroidHz: avgCentroid,
    flatness: avgFlatness,
    stereoWidth,
    pitchHz,
    duration: buffer.duration,
  };
}

function frameSpectrum(data, start, end, sampleRate) {
  const size = Math.min(1024, end - start);
  if (size < 32) {
    return { centroidHz: 0, flatness: 0 };
  }

  let magnitudeSum = 0;
  let weightedSum = 0;
  let geometricLogSum = 0;
  let bins = 0;

  for (let bin = 1; bin < size / 2; bin += 1) {
    let real = 0;
    let imag = 0;
    for (let n = 0; n < size; n += 1) {
      const sample = data[start + n] * (0.5 - 0.5 * Math.cos((2 * Math.PI * n) / (size - 1)));
      const phase = (2 * Math.PI * bin * n) / size;
      real += sample * Math.cos(phase);
      imag -= sample * Math.sin(phase);
    }
    const magnitude = Math.sqrt(real * real + imag * imag) + 1e-12;
    const frequency = (bin * sampleRate) / size;
    magnitudeSum += magnitude;
    weightedSum += magnitude * frequency;
    geometricLogSum += Math.log(magnitude);
    bins += 1;
  }

  if (magnitudeSum === 0 || bins === 0) {
    return { centroidHz: 0, flatness: 0 };
  }

  const centroidHz = weightedSum / magnitudeSum;
  const arithmeticMean = magnitudeSum / bins;
  const geometricMean = Math.exp(geometricLogSum / bins);
  const flatness = arithmeticMean > 0 ? geometricMean / arithmeticMean : 0;
  return { centroidHz, flatness };
}

function estimatePitch(data, sampleRate) {
  const size = Math.min(4096, data.length);
  if (size < 256) {
    return 0;
  }

  let bestOffset = -1;
  let bestCorrelation = 0;
  const minOffset = Math.floor(sampleRate / 1200);
  const maxOffset = Math.floor(sampleRate / 40);

  for (let offset = minOffset; offset <= maxOffset; offset += 1) {
    let correlation = 0;
    for (let i = 0; i < size - offset; i += 1) {
      correlation += data[i] * data[i + offset];
    }
    if (correlation > bestCorrelation) {
      bestCorrelation = correlation;
      bestOffset = offset;
    }
  }

  if (bestOffset <= 0) {
    return 0;
  }
  return sampleRate / bestOffset;
}

function estimateStereoWidth(buffer) {
  if (buffer.numberOfChannels < 2) {
    return 0;
  }
  const left = buffer.getChannelData(0);
  const right = buffer.getChannelData(1);
  const size = Math.min(left.length, 120000);

  let sumDiff = 0;
  let sumTotal = 0;
  for (let i = 0; i < size; i += 1) {
    sumDiff += Math.abs(left[i] - right[i]);
    sumTotal += Math.abs(left[i]) + Math.abs(right[i]);
  }
  return sumTotal > 0 ? clamp(sumDiff / sumTotal) : 0;
}

function buildProfile(analysis) {
  return createAudioProfile(analysis, {
    inputMode: elements.inputMode.value,
    brightnessBias: elements.brightnessBias.value,
    movementBias: elements.movementBias.value,
    attackBias: elements.attackBias.value,
    dirtBias: elements.dirtBias.value,
    widthBias: elements.widthBias.value,
    mutationAmount: elements.mutationAmount.value,
  });
}

function buildFreePack(profile) {
  return buildAudioFreePack(profile);
}

function buildProPack(profile) {
  return buildAudioProPack(profile);
}

function variantRole(index, preset) {
  if (preset.roleLabel) {
    return preset.roleLabel;
  }
  const roles = ["Closest", "Darker", "More Motion"];
  return roles[index] || "Variant";
}

function buildPresetReason(preset, role) {
  const reasons = [];

  if (role === "Closest") {
    reasons.push("stays nearest to the measured source profile");
  } else if (role === "Darker") {
    reasons.push("pulls the mapping toward a lower filter ceiling");
  } else if (role === "Brighter") {
    reasons.push("opens the tone and upper presence a bit more");
  } else {
    reasons.push("leans harder into movement and modulation");
  }

  if (preset.familyKey === "pad") {
    reasons.push("longer envelope times keep the bloom playable");
  } else if (preset.familyKey === "pluck") {
    reasons.push("faster envelope timing preserves transient bite");
  } else if (preset.familyKey === "bass") {
    reasons.push("tighter keytracking and drive keep the low-end focused");
  } else {
    reasons.push("noise and width keep the texture more atmospheric");
  }

  return `${reasons[0]}; ${reasons[1]}.`;
}

function bestUseForPreset(preset) {
  if (preset.familyKey === "bass") {
    return "Bass foundations and low tension";
  }
  if (preset.familyKey === "pluck") {
    return "Hooks, accents, and melodic pulses";
  }
  if (preset.familyKey === "texture") {
    return "Atmospheres, transitions, and beds";
  }
  return "Pads, intros, and cinematic support";
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
  const total = presets.reduce((sum, preset) => sum + scoreGeneratedPreset(preset, preset.roleLabel).score, 0);
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

function renderMetricGrid(target, items) {
  target.innerHTML = "";
  for (const [label, value] of items) {
    const node = document.createElement("div");
    node.className = "metric";
    node.innerHTML = `
      <span class="metric-label">${label}</span>
      <strong class="metric-value">${value}</strong>
    `;
    target.appendChild(node);
  }
}

function renderPresets(presets) {
  elements.presetList.innerHTML = "";
  elements.presetsPanel.classList.toggle("has-results", presets.length > 0);
  elements.presetsPanel.classList.toggle("is-pack", presets.length > FREE_VARIANT_LIMIT);
  if (!presets.length) {
    elements.presetList.innerHTML = `<p class="empty-state">No presets generated yet.</p>`;
    return;
  }

  if (presets.length > FREE_VARIANT_LIMIT) {
    const groups = new Map();
    for (const preset of presets) {
      const role = variantRole(presets.indexOf(preset), preset);
      if (!groups.has(role)) {
        groups.set(role, []);
      }
      groups.get(role).push(preset);
    }

    for (const [role, groupedPresets] of groups.entries()) {
      const section = document.createElement("section");
      section.className = "preset-group";
      const shouldStartOpen = role === "Closest";
      section.innerHTML = `
        <button class="preset-group-head" type="button" aria-expanded="${shouldStartOpen}" aria-controls="">
          <div>
            <h3>${role} <span class="preset-group-count">${groupedPresets.length}</span></h3>
            <p>${describePackGroup(role)}</p>
          </div>
          <span class="preset-group-toggle-label">${shouldStartOpen ? "Hide presets" : "Show presets"}</span>
        </button>
      `;

      const list = document.createElement("div");
      list.className = "preset-group-list";
      list.hidden = !shouldStartOpen;
      const listId = `preset-group-${role.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
      list.id = listId;
      section.querySelector(".preset-group-head").setAttribute("aria-controls", listId);

      for (const preset of groupedPresets) {
        list.appendChild(buildPresetCard(preset, role, presets.length));
      }

      const toggle = section.querySelector(".preset-group-head");
      const toggleLabel = section.querySelector(".preset-group-toggle-label");
      toggle.addEventListener("click", () => {
        const isOpen = toggle.getAttribute("aria-expanded") === "true";
        toggle.setAttribute("aria-expanded", String(!isOpen));
        toggleLabel.textContent = isOpen ? "Show presets" : "Hide presets";
        list.hidden = isOpen;
      });

      section.appendChild(list);
      elements.presetList.appendChild(section);
    }
    return;
  }

  for (const preset of presets) {
    const role = variantRole(presets.indexOf(preset), preset);
    elements.presetList.appendChild(buildPresetCard(preset, role, presets.length));
  }
}

function buildPresetCard(preset, role, totalCount) {
    const card = document.createElement("article");
    card.className = "preset-card";
    const maxRows = totalCount > FREE_VARIANT_LIMIT ? 4 : 4;
    const tags = totalCount > FREE_VARIANT_LIMIT ? [] : buildPresetTags(preset, role);
    const quality = scoreGeneratedPreset(preset, role);
    const visibleParameters = totalCount > FREE_VARIANT_LIMIT ? preset.parameters : selectFreeCardParameters(preset.parameters);
    const paramRows = visibleParameters
      .slice(0, maxRows)
      .map(([label, value]) => `<div class="param-row"><span>${label}</span><span>${value}</span></div>`)
      .join("");
    card.innerHTML = `
      <div class="preset-head">
        <div>
          <p class="preset-role">${role}</p>
          <p class="preset-family">${preset.family}</p>
          <h3 class="preset-name">${preset.name}</h3>
        </div>
      </div>
      <p class="preset-summary">${preset.summary}</p>
      ${tags.length ? `<div class="preset-tags">${tags.map((tag) => `<span class="preset-tag">${tag}</span>`).join("")}</div>` : ""}
      <div class="preset-quality-score">
        <span><strong>${quality.score}%</strong> quality</span>
        <span><strong>Best use</strong> ${bestUseForPreset(preset)}</span>
      </div>
      <p class="preset-quality">Quality notes: ${quality.notes.join("; ")}. Why this result: ${buildPresetReason(preset, role)}</p>
      <div class="param-list">${paramRows}</div>
      <div class="preset-actions">
        <button class="download-button" type="button">
          <span class="download-badge" aria-hidden="true">VITAL</span>
          <span>Download Preset</span>
        </button>
      </div>
    `;
    const button = card.querySelector(".download-button");
    button.addEventListener("click", () => downloadPreset(preset));
    return card;
  }

function buildPresetTags(preset, role) {
  const tags = [role.toLowerCase()];

  if (preset.parameterMap.filter_1_cutoff >= 62) {
    tags.push("brighter");
  } else if (preset.parameterMap.filter_1_cutoff <= 42) {
    tags.push("darker");
  }

  if (preset.parameterMap.chorus_dry_wet >= 0.34 || preset.parameterMap.osc_1_stereo_spread >= 0.55) {
    tags.push("wider");
  }

  if (preset.parameterMap.env_1_release >= 0.42) {
    tags.push("longer tail");
  } else if (preset.parameterMap.env_1_release <= 0.2) {
    tags.push("tighter tail");
  }

  if (preset.parameterMap.distortion_mix >= 0.24 || preset.parameterMap.noise_level >= 0.14) {
    tags.push("grittier");
  } else if (preset.parameterMap.distortion_mix <= 0.1 && preset.parameterMap.noise_level <= 0.06) {
    tags.push("cleaner");
  }

  return tags.slice(0, 3);
}

function selectFreeCardParameters(parameters) {
  const preferredLabels = ["Filter Cutoff", "Env Attack", "Env Release", "Reverb Mix"];
  return preferredLabels
    .map((label) => parameters.find(([currentLabel]) => currentLabel === label))
    .filter(Boolean);
}

function describePackGroup(role) {
  const descriptions = {
    Closest: "Nearest to the measured source profile, with restrained drift.",
    Darker: "Lower ceiling, heavier body, and more muted upper tone.",
    Brighter: "More open upper presence and clearer harmonic lift.",
    Steadier: "Calmer modulation with tighter movement and less drift.",
    "More Motion": "More animated modulation and a livelier movement profile.",
    Wider: "Broader stereo image and more spacious width.",
    Tighter: "More centered, drier, and more controlled variants.",
    Textured: "Noisier, more grainy directions with extra atmosphere.",
  };
  return descriptions[role] || "Alternative directions shaped from the same source profile.";
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
    const quality = scoreGeneratedPreset(preset, preset.roleLabel);
    analyticsEvent("download_preset", {
      generation_mode: state.lastGenerationMode,
      preset_role: preset.roleLabel,
      detected_family: preset.familyKey,
      quality_score: quality.score,
      quality_bucket: qualityBucket(quality.score),
      ...currentAnalyticsSelection(),
    });
  } catch (error) {
    updateStatus(error.message || "Could not download preset.");
  }
}

async function downloadPresetPack() {
  if (state.presets.length !== PRO_PACK_COUNT || state.lastGenerationMode !== "pro") {
    return;
  }

  if (!window.JSZip) {
    updateStatus("ZIP export is not available right now.");
    return;
  }

  try {
    updateStatus("Preparing the 32-pack ZIP...");
    const zip = new window.JSZip();
    const folderName = sanitizeFileName(state.sourceName || "preset-mutator-pack");
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
      detected_family: state.profile?.family || "unknown",
      avg_quality_score: qualityScore,
      avg_quality_bucket: qualityBucket(qualityScore),
      ...currentAnalyticsSelection(),
    });
  } catch (error) {
    updateStatus(error.message || "Could not build the 32-pack ZIP.");
  }
}

async function handleFileChange(event) {
  const [file] = event.target.files;
  if (!file) {
    return;
  }

  await loadAudioFile(file, true);
}

async function loadAudioFile(file, resetInput = false) {
  if (!file) {
    return;
  }

  try {
    const lowerName = file.name.toLowerCase();
    const isAudioFile =
      file.type.startsWith("audio/") ||
      SUPPORTED_AUDIO_EXTENSIONS.some((extension) => lowerName.endsWith(extension));
    if (!isAudioFile) {
      if (resetInput) {
        elements.fileInput.value = "";
      }
      resetLoadedState();
      const message = "Unsupported file type. Please use a supported audio file under 10 MB.";
      showUploadMessage(message);
      updateStatus(message);
      return;
    }

    if (file.size > MAX_UPLOAD_BYTES) {
      if (resetInput) {
        elements.fileInput.value = "";
      }
      resetLoadedState();
      const message = `File too large. Please use an audio file smaller than ${formatFileSize(MAX_UPLOAD_BYTES)}.`;
      showUploadMessage(message);
      updateStatus(message);
      return;
    }

    showUploadMessage("");
    updateStatus("Decoding audio locally...");
    const context = createAudioContext();
    const arrayBuffer = await file.arrayBuffer();
    state.originalBuffer = await context.decodeAudioData(arrayBuffer.slice(0));
    state.analysis = null;
    state.profile = null;
    state.presets = [];
    state.lastGenerationMode = "free";
    state.sourceName = file.name.replace(/\.[^.]+$/, "");

    elements.fileName.textContent = file.name;
    elements.fileDuration.textContent = `${state.originalBuffer.duration.toFixed(1)}s`;
    elements.fileSampleRate.textContent = `${state.originalBuffer.sampleRate} Hz`;
    elements.fileChannels.textContent = String(state.originalBuffer.numberOfChannels);

    drawWaveform(state.originalBuffer);
    renderMetricGrid(elements.analysisMetrics, []);
    renderMetricGrid(elements.profileMetrics, []);
    renderPresets([]);
    setReady(true);

    updateStatus("Source ready. Generate 3 free variants or unlock the 32-pack.");
    analyticsEvent("source_loaded", {
      source_type: "audio",
      duration_bucket: durationBucket(state.originalBuffer.duration),
      file_size_bucket: sizeBucket(file.size),
      channels: state.originalBuffer.numberOfChannels,
      sample_rate_bucket: state.originalBuffer.sampleRate >= 48000 ? "48k_or_higher" : "under_48k",
    });
  } catch (error) {
    resetLoadedState();
    const message = "Unsupported or unreadable audio file. Please use a supported audio file under 10 MB.";
    showUploadMessage(message);
    updateStatus(message);
  }
}

function setDropZoneActive(active) {
  elements.waveformPanel.classList.toggle("is-drop-active", active);
}

function handleDropZoneDrag(event) {
  event.preventDefault();
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = "copy";
  }
  setDropZoneActive(true);
}

function handleDropZoneLeave(event) {
  if (!elements.waveformPanel.contains(event.relatedTarget)) {
    setDropZoneActive(false);
  }
}

function handleWaveformSeek(event) {
  if (!state.originalBuffer) {
    return;
  }
  const rect = elements.waveform.getBoundingClientRect();
  if (!rect.width) {
    return;
  }
  const ratio = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
  const offset = ratio * state.originalBuffer.duration;
  playBuffer(state.originalBuffer, offset)
    .then(() => {
      updateStatus(`Playing source audio from ${formatTime(offset)}.`);
    })
    .catch(() => {
      updateStatus("Could not start audio playback.");
    });
}

function handlePlayToggle() {
  if (!state.originalBuffer) {
    return;
  }
  if (state.isPlaying) {
    stopPlayback(true);
    updateStatus("Playback stopped.");
    return;
  }
  playBuffer(state.originalBuffer, state.playbackOffset)
    .then(() => {
      updateStatus(`Playing source audio from ${formatTime(state.playbackOffset)}.`);
    })
    .catch(() => {
      updateStatus("Could not start audio playback.");
    });
}

async function handleDropZoneDrop(event) {
  event.preventDefault();
  setDropZoneActive(false);
  const [file] = event.dataTransfer?.files || [];
  if (!file) {
    return;
  }
  elements.fileInput.value = "";
  await loadAudioFile(file, false);
}

function loadSyntheticSource() {
  state.originalBuffer = createSyntheticBuffer();
  state.analysis = null;
  state.profile = null;
  state.presets = [];
  state.lastGenerationMode = "free";
  state.sourceName = "self-test-source";

  elements.fileName.textContent = "self-test-source.wav";
  elements.fileDuration.textContent = `${state.originalBuffer.duration.toFixed(1)}s`;
  elements.fileSampleRate.textContent = `${state.originalBuffer.sampleRate} Hz`;
  elements.fileChannels.textContent = String(state.originalBuffer.numberOfChannels);
  elements.selfTestNote.hidden = false;

  drawWaveform(state.originalBuffer);
  renderMetricGrid(elements.analysisMetrics, []);
  renderMetricGrid(elements.profileMetrics, []);
  renderPresets([]);
  setReady(true);
  updateStatus("Self-test source ready. Generating presets...");
  generatePresets();
}

function generatePresets() {
  if (!state.originalBuffer) {
    return;
  }

  updateStatus("Shaping 3 guided Vital variants...");
  state.analysis = analyzeAudio(state.originalBuffer);
  state.profile = buildProfile(state.analysis);
  state.lastGenerationMode = "free";
  state.presets = buildFreePack(state.profile);

  renderMetricGrid(elements.analysisMetrics, [
    ["Pitch Center", state.analysis.pitchHz ? `${Math.round(state.analysis.pitchHz)} Hz` : "Unclear"],
    ["Spectral Centroid", formatHz(state.analysis.centroidHz)],
    ["RMS", state.analysis.rms.toFixed(3)],
    ["Peak", state.analysis.peak.toFixed(3)],
    ["Zero Cross Rate", state.analysis.zeroCrossRate.toFixed(3)],
    ["Onset Position", formatPercent(state.analysis.onsetRatio)],
    ["Sustain Ratio", formatPercent(state.analysis.sustainRatio)],
    ["Stereo Width", formatPercent(state.analysis.stereoWidth)],
  ]);

  renderMetricGrid(elements.profileMetrics, [
    ["Detected Family", familyLabel(state.profile.family)],
    ["Mutation", formatPercent(state.profile.mutationAmount)],
    ["Brightness", formatPercent(state.profile.brightness)],
    ["Body", formatPercent(state.profile.body)],
    ["Attack", formatPercent(state.profile.attack)],
    ["Sustain", formatPercent(state.profile.sustain)],
    ["Movement", formatPercent(state.profile.movement)],
    ["Noise", formatPercent(state.profile.noise)],
    ["Width", formatPercent(state.profile.width)],
  ]);

  renderPresets(state.presets);
  const qualityScore = averageQualityScore(state.presets);
  updateStatus("3 free variants ready. Download the ones that feel closest to your track.");
  analyticsEvent("generate_free", {
    preset_count: state.presets.length,
    detected_family: state.profile.family,
    duration_bucket: durationBucket(state.originalBuffer.duration),
    avg_quality_score: qualityScore,
    avg_quality_bucket: qualityBucket(qualityScore),
    ...currentAnalyticsSelection(),
  });
  setReady(Boolean(state.originalBuffer));
}

function generatePresetPack() {
  if (!state.originalBuffer || !state.proPreviewUnlocked) {
    return;
  }

  updateStatus("Shaping 32 Pro variants...");
  state.analysis = analyzeAudio(state.originalBuffer);
  state.profile = buildProfile(state.analysis);
  state.lastGenerationMode = "pro";
  state.presets = buildProPack(state.profile);

  renderMetricGrid(elements.analysisMetrics, [
    ["Pitch Center", state.analysis.pitchHz ? `${Math.round(state.analysis.pitchHz)} Hz` : "Unclear"],
    ["Spectral Centroid", formatHz(state.analysis.centroidHz)],
    ["RMS", state.analysis.rms.toFixed(3)],
    ["Peak", state.analysis.peak.toFixed(3)],
    ["Zero Cross Rate", state.analysis.zeroCrossRate.toFixed(3)],
    ["Onset Position", formatPercent(state.analysis.onsetRatio)],
    ["Sustain Ratio", formatPercent(state.analysis.sustainRatio)],
    ["Stereo Width", formatPercent(state.analysis.stereoWidth)],
  ]);

  renderMetricGrid(elements.profileMetrics, [
    ["Detected Family", familyLabel(state.profile.family)],
    ["Mutation", formatPercent(state.profile.mutationAmount)],
    ["Brightness", formatPercent(state.profile.brightness)],
    ["Body", formatPercent(state.profile.body)],
    ["Attack", formatPercent(state.profile.attack)],
    ["Sustain", formatPercent(state.profile.sustain)],
    ["Movement", formatPercent(state.profile.movement)],
    ["Noise", formatPercent(state.profile.noise)],
    ["Width", formatPercent(state.profile.width)],
  ]);

  renderPresets(state.presets);
  const qualityScore = averageQualityScore(state.presets);
  updateStatus("32 Pro variants ready.");
  analyticsEvent("generate_pro", {
    preset_count: state.presets.length,
    detected_family: state.profile.family,
    duration_bucket: durationBucket(state.originalBuffer.duration),
    avg_quality_score: qualityScore,
    avg_quality_bucket: qualityBucket(qualityScore),
    ...currentAnalyticsSelection(),
  });
  setReady(Boolean(state.originalBuffer));
}

async function handleGeneratePresets() {
  if (!state.originalBuffer || state.isGenerating) {
    return;
  }

  setGenerateLoadingState(true);
  updateStatus("Generating 3 free variants...");

  await new Promise((resolve) => {
    window.setTimeout(resolve, GENERATE_DELAY_MS);
  });

  try {
    generatePresets();
  } finally {
    setGenerateLoadingState(false);
  }
}

async function handleGeneratePresetPack() {
  if (!state.originalBuffer || state.isGenerating || !state.proPreviewUnlocked) {
    return;
  }

  setGenerateLoadingState(true);
  updateStatus("Generating 32 Pro variants...");

  await new Promise((resolve) => {
    window.setTimeout(resolve, GENERATE_DELAY_MS);
  });

  try {
    generatePresetPack();
  } finally {
    setGenerateLoadingState(false);
  }
}

function renderPaidFeatureState() {
  const unlocked = state.proPreviewUnlocked;
  elements.paidFeaturePanel.classList.toggle("is-unlocked", unlocked);
  elements.paidFeatureActions.hidden = unlocked;
  elements.paidFeatureUnlock.hidden = true;
  elements.paidFeaturePreview.hidden = !unlocked;
  elements.paidFeatureToggle.setAttribute("aria-expanded", "false");
}

function setAnalysisVisible(visible) {
  elements.analysisContent.hidden = !visible;
  elements.analysisToggle.setAttribute("aria-expanded", String(visible));
  elements.analysisToggle.textContent = visible ? "Hide analysis" : "Show analysis";
  elements.analysisShell.classList.toggle("is-open", visible);
}

function toggleAnalysisVisibility() {
  setAnalysisVisible(elements.analysisContent.hidden);
}

function togglePaidFeatureUnlock() {
  if (state.proPreviewUnlocked) {
    return;
  }
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

function handlePaidFeatureUnlock() {
  const key = elements.paidFeatureKey.value.trim();
  if (!key) {
    elements.paidFeatureUnlockNote.textContent = "Enter your purchase code to unlock this browser.";
    analyticsEvent("unlock_attempt", { result: "empty" });
    return;
  }
  if (key !== PRO_PURCHASE_CODE) {
    elements.paidFeatureUnlockNote.textContent = "Invalid purchase code. Check the code and try again.";
    analyticsEvent("unlock_attempt", { result: "invalid" });
    return;
  }

  state.proPreviewUnlocked = true;
  window.localStorage.setItem(SUITE_UNLOCK_STORAGE_KEY, "1");
  renderPaidFeatureState();
  updateStatus("Preset Mutator Pro is active in this browser.");
  setReady(Boolean(state.originalBuffer));
  analyticsEvent("unlock_attempt", { result: "success" });
}

elements.fileInput.addEventListener("change", handleFileChange);
elements.waveformPanel.addEventListener("dragenter", handleDropZoneDrag);
elements.waveformPanel.addEventListener("dragover", handleDropZoneDrag);
elements.waveformPanel.addEventListener("dragleave", handleDropZoneLeave);
elements.waveformPanel.addEventListener("drop", handleDropZoneDrop);
elements.waveform.addEventListener("click", handleWaveformSeek);
elements.playToggle.addEventListener("click", handlePlayToggle);
elements.analyzeGenerate.addEventListener("click", handleGeneratePresets);
elements.analysisToggle.addEventListener("click", toggleAnalysisVisibility);
elements.paidFeatureToggle.addEventListener("click", togglePaidFeatureUnlock);
elements.paidFeatureUnlockButton.addEventListener("click", handlePaidFeatureUnlock);
  elements.generatePack?.addEventListener("click", handleGeneratePresetPack);
  elements.downloadPack?.addEventListener("click", downloadPresetPack);
elements.paidFeatureActions?.addEventListener("click", (event) => {
  const link = event.target.closest("a");
  if (!link) {
    return;
  }
  analyticsEvent("pro_cta_click", {
    checkout: link.href.includes("paypal.com") ? "paypal" : "gumroad",
  });
});

new PresetMutatorKnob(elements.mutationKnob, {
  value: Number(elements.mutationAmount.value),
  min: 0,
  max: 100,
  onChange(value) {
    elements.mutationAmount.value = String(value);
    updateControlLabels();
  },
});

for (const control of [
  elements.brightnessBias,
  elements.movementBias,
  elements.attackBias,
  elements.dirtBias,
  elements.widthBias,
]) {
  control.addEventListener("input", updateControlLabels);
}

updateControlLabels();
state.proPreviewUnlocked =
  window.localStorage.getItem(SUITE_UNLOCK_STORAGE_KEY) === "1" ||
  window.localStorage.getItem(LEGACY_AUDIO_ALCHEMY_STORAGE_KEY) === "1";
if (state.proPreviewUnlocked) {
  window.localStorage.setItem(SUITE_UNLOCK_STORAGE_KEY, "1");
}
renderPaidFeatureState();
setAnalysisVisible(false);
updatePlaybackUI();
setReady(false);
if (SELF_TEST_ENABLED) {
  loadSyntheticSource();
}

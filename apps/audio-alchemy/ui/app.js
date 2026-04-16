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
  brightnessBias: document.querySelector("#brightness-bias"),
  movementBias: document.querySelector("#movement-bias"),
  attackBias: document.querySelector("#attack-bias"),
  brightnessBiasValue: document.querySelector("#brightness-bias-value"),
  movementBiasValue: document.querySelector("#movement-bias-value"),
  attackBiasValue: document.querySelector("#attack-bias-value"),
  proControlPanel: document.querySelector("#pro-control-panel"),
  dirtBias: document.querySelector("#dirt-bias"),
  widthBias: document.querySelector("#width-bias"),
  lengthBias: document.querySelector("#length-bias"),
  wildBias: document.querySelector("#wild-bias"),
  wetBias: document.querySelector("#wet-bias"),
  washBias: document.querySelector("#wash-bias"),
  driveBias: document.querySelector("#drive-bias"),
  dirtBiasValue: document.querySelector("#dirt-bias-value"),
  widthBiasValue: document.querySelector("#width-bias-value"),
  lengthBiasValue: document.querySelector("#length-bias-value"),
  wildBiasValue: document.querySelector("#wild-bias-value"),
  wetBiasValue: document.querySelector("#wet-bias-value"),
  washBiasValue: document.querySelector("#wash-bias-value"),
  driveBiasValue: document.querySelector("#drive-bias-value"),
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

const SEED_BY_FAMILY = {
  pad: "KS Frozen Hollow.vital",
  pluck: "KS Dread Lantern.vital",
  bass: "KS Iron Wake.vital",
  texture: "KS Shadow Archive.vital",
};

const FREE_VARIANT_LIMIT = 3;
const PRO_PACK_COUNT = 32;
const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
const SELF_TEST_ENABLED = new URLSearchParams(window.location.search).get("self_test") === "1";
const GENERATE_DELAY_MS = 500;
const PRO_PREVIEW_STORAGE_KEY = "audio-alchemy-pro-preview-unlocked";
const PRO_PURCHASE_CODE = "AA-PRO-32-DGTW9930";
const SUPPORTED_AUDIO_EXTENSIONS = [".wav", ".mp3", ".aiff", ".aif", ".m4a", ".aac", ".ogg", ".flac"];

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js").catch(() => {
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

function clamp(value, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

function lerp(min, max, amount) {
  return min + (max - min) * amount;
}

function formatPercent(value) {
  return `${Math.round(value * 100)}%`;
}

function formatHz(value) {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(2)} kHz`;
  }
  return `${Math.round(value)} Hz`;
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

function sanitizeFileName(value) {
  const cleaned = value.replace(/[<>:"/\\|?*\u0000-\u001f]/g, "").trim();
  return cleaned || "Audio Alchemy Vital";
}

function updateControlLabels() {
  elements.brightnessBiasValue.textContent = `${elements.brightnessBias.value}%`;
  elements.movementBiasValue.textContent = `${elements.movementBias.value}%`;
  elements.attackBiasValue.textContent = `${elements.attackBias.value}%`;
  elements.dirtBiasValue.textContent = `${elements.dirtBias.value}%`;
  elements.widthBiasValue.textContent = `${elements.widthBias.value}%`;
  elements.lengthBiasValue.textContent = `${elements.lengthBias.value}%`;
  elements.wildBiasValue.textContent = `${elements.wildBias.value}%`;
  elements.wetBiasValue.textContent = `${elements.wetBias.value}%`;
  elements.washBiasValue.textContent = `${elements.washBias.value}%`;
  elements.driveBiasValue.textContent = `${elements.driveBias.value}%`;
}

function setProControlsEnabled(enabled) {
  elements.proControlPanel.classList.toggle("is-locked", !enabled);
  for (const control of [
    elements.dirtBias,
    elements.widthBias,
    elements.lengthBias,
    elements.wildBias,
    elements.wetBias,
    elements.washBias,
    elements.driveBias,
  ]) {
    control.disabled = !enabled;
  }
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
  elements.analyzeGenerateLabel.textContent = isLoading ? "Analyzing audio..." : "Generate 3 Free Presets";
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

function determineFamily(analysis) {
  const requestedMode = elements.inputMode.value;
  if (requestedMode !== "auto") {
    return requestedMode;
  }

  if (analysis.pitchHz > 0 && analysis.pitchHz < 160 && analysis.centroidHz < 1800) {
    return "bass";
  }
  if (analysis.onsetRatio < 0.18 && analysis.sustainRatio < 0.32) {
    return "pluck";
  }
  if (analysis.sustainRatio > 0.68 && analysis.movement < 0.24) {
    return "pad";
  }
  return "texture";
}

function buildProfile(analysis) {
  const brightnessBias = Number(elements.brightnessBias.value) / 100;
  const movementBias = Number(elements.movementBias.value) / 100;
  const attackBias = Number(elements.attackBias.value) / 100;
  const family = determineFamily(analysis);

  const brightness = clamp(analysis.centroidHz / 6000 + brightnessBias * 0.35);
  const body = clamp(1 - analysis.centroidHz / 9000 + (analysis.pitchHz > 0 && analysis.pitchHz < 220 ? 0.12 : 0));
  const attack = clamp(1 - analysis.onsetRatio + attackBias * 0.3);
  const sustain = clamp(analysis.sustainRatio);
  const movement = clamp(analysis.movement * 1.4 + movementBias * 0.35);
  const noise = clamp(analysis.flatness * 1.8 + analysis.zeroCrossRate * 8);
  const width = clamp(analysis.stereoWidth * 1.2);

  return {
    family,
    brightness,
    body,
    attack,
    sustain,
    movement,
    noise,
    width,
    pitchHz: analysis.pitchHz,
  };
}

function variantSeed(index) {
  const x = Math.sin((index + 1) * 97.13) * 43758.5453;
  return x - Math.floor(x);
}

function vary(base, amount, index, shift = 0) {
  const seed = variantSeed(index + shift);
  return clamp(base + (seed * 2 - 1) * amount);
}

function mapProfileToVital(profile, index, options = {}) {
  const amountScale = options.amountScale ?? 1;
  const roleLabel = options.roleLabel ?? null;
  const family = profile.family;
  const brightness = vary(profile.brightness, 0.08 * amountScale, index, 1);
  const body = vary(profile.body, 0.08 * amountScale, index, 2);
  const attack = vary(profile.attack, 0.1 * amountScale, index, 3);
  const sustain = vary(profile.sustain, 0.08 * amountScale, index, 4);
  const movement = vary(profile.movement, 0.12 * amountScale, index, 5);
  const noise = vary(profile.noise, 0.08 * amountScale, index, 6);
  const width = vary(profile.width, 0.1 * amountScale, index, 7);

  const oscMode = chooseOscillator(family, brightness, noise);
  const voices = family === "bass" ? Math.round(lerp(1, 3, width)) : Math.round(lerp(2, 8, width));
  const detune = family === "bass" ? lerp(0.02, 0.1, width) : lerp(0.05, 0.28, width);
  const filterCutoff = family === "bass"
    ? lerp(120, 2200, brightness)
    : lerp(320, 14000, brightness);
  const resonance = lerp(0.08, 0.45, 1 - body);
  const envAttack = family === "pluck"
    ? lerp(0.001, 0.08, 1 - attack)
    : lerp(0.01, 2.4, 1 - attack);
  const envDecay = family === "pluck"
    ? lerp(0.08, 1.4, sustain)
    : lerp(0.3, 3.4, sustain);
  const envSustain = family === "pluck"
    ? lerp(0.05, 0.6, sustain)
    : lerp(0.35, 0.96, sustain);
  const envRelease = family === "pluck"
    ? lerp(0.08, 1.8, sustain)
    : lerp(0.6, 6.5, sustain);
  const lfoRate = family === "texture" ? lerp(0.05, 1.8, movement) : lerp(0.08, 6.2, movement);
  const lfoDepth = lerp(0.04, 0.68, movement);
  const chorusMix = clamp((family === "bass" ? lerp(0.02, 0.18, width) : lerp(0.1, 0.58, width)) + (profile.wetness ?? 0) * 0.16);
  const reverbMix = clamp((family === "pluck" ? lerp(0.08, 0.28, sustain) : lerp(0.12, 0.62, sustain)) + (profile.wetness ?? 0) * 0.22 + (profile.wash ?? 0) * 0.18);
  const delayMix = clamp(0.02 + Math.max(0, (profile.wetness ?? 0)) * 0.12 + Math.max(0, (profile.wash ?? 0)) * 0.08);
  const distortion = clamp(lerp(0.0, 0.56, noise * 0.65 + brightness * 0.35) + (profile.drive ?? 0) * 0.16);
  const noiseLevel = lerp(0.0, 0.34, noise);
  const cutoffNormalized = clamp((filterCutoff - 120) / (14000 - 120));

  const register = profile.pitchHz > 0 ? noteName(profile.pitchHz) : "Unknown";
  const name = buildVariantName({
    family,
    index,
    brightness,
    body,
    movement,
    noise,
    width,
    attack,
    sustain,
    pitchHz: profile.pitchHz,
  });
  const summary = buildPresetSummary({
    family,
    brightness,
    movement,
    width,
    sustain,
    attack,
    register,
  });

  return {
    name,
    roleLabel,
    family: familyLabel(family),
    familyKey: family,
    summary,
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
      filter_1_mix: 1.0,
      env_1_attack: clamp(envAttack / 2.5, 0.001, 1),
      env_1_decay: clamp(envDecay / 3.4, 0.02, 1),
      env_1_sustain: envSustain,
      env_1_release: clamp(envRelease / 6.5, 0.03, 1),
      chorus_dry_wet: chorusMix,
      chorus_mod_depth: clamp(0.12 + width * 0.6, 0, 1),
      chorus_feedback: clamp(0.08 + movement * 0.4, 0, 0.95),
      reverb_dry_wet: reverbMix,
      reverb_size: clamp(0.3 + sustain * 0.6 + (profile.wash ?? 0) * 0.16, 0, 1),
      reverb_decay_time: clamp(0.22 + sustain * 0.72 + (profile.wash ?? 0) * 0.2, 0, 1),
      delay_dry_wet: delayMix,
      delay_feedback: clamp(0.16 + movement * 0.28 + Math.max(0, (profile.wash ?? 0)) * 0.16, 0, 0.95),
      delay_filter_cutoff: clamp(36 + brightness * 44 + (profile.drive ?? 0) * 6, 0, 127),
      distortion_mix: distortion,
      distortion_drive: lerp(0.1, 4.0, clamp(distortion + Math.max(0, (profile.drive ?? 0)) * 0.18)),
      filter_fx_cutoff: lerp(26, 86, brightness) - (profile.drive ?? 0) * 8,
      filter_fx_resonance: clamp(0.08 + noise * 0.26 + Math.max(0, (profile.drive ?? 0)) * 0.12, 0, 1),
      sample_on: 0,
      noise_on: noiseLevel > 0.03 ? 1 : 0,
      noise_level: noiseLevel,
    },
    parameters: [
      ["Oscillator", oscMode],
      ["Unison Voices", String(voices)],
      ["Detune", `${detune.toFixed(2)}`],
      ["Filter Cutoff", formatHz(filterCutoff)],
      ["Resonance", `${Math.round(resonance * 100)}%`],
      ["Env Attack", `${envAttack.toFixed(2)} s`],
      ["Env Decay", `${envDecay.toFixed(2)} s`],
      ["Env Sustain", `${Math.round(envSustain * 100)}%`],
      ["Env Release", `${envRelease.toFixed(2)} s`],
      ["LFO Rate", `${lfoRate.toFixed(2)} Hz`],
      ["LFO Depth", `${Math.round(lfoDepth * 100)}%`],
      ["Chorus Mix", `${Math.round(chorusMix * 100)}%`],
      ["Reverb Mix", `${Math.round(reverbMix * 100)}%`],
      ["Delay Mix", `${Math.round(delayMix * 100)}%`],
      ["Distortion", `${Math.round(distortion * 100)}%`],
      ["Noise Level", `${Math.round(noiseLevel * 100)}%`],
    ],
  };
}

function shapeProfile(baseProfile, recipe, index) {
  const dirtBias = Number(elements.dirtBias.value) / 100;
  const widthBias = Number(elements.widthBias.value) / 100;
  const lengthBias = Number(elements.lengthBias.value) / 100;
  const wildBias = Number(elements.wildBias.value) / 100;
  const wetBias = Number(elements.wetBias.value) / 100;
  const washBias = Number(elements.washBias.value) / 100;
  const driveBias = Number(elements.driveBias.value) / 100;
  const spreadBoost = Math.max(0, wildBias) * 0.06;

  return {
    ...baseProfile,
    family: recipe.family || baseProfile.family,
    brightness: vary(clamp(baseProfile.brightness + (recipe.brightness ?? 0)), (recipe.spread ?? 0.07) + spreadBoost, index, 21),
    body: vary(clamp(baseProfile.body + (recipe.body ?? 0)), (recipe.spread ?? 0.06) + spreadBoost, index, 22),
    attack: vary(clamp(baseProfile.attack + (recipe.attack ?? 0) - lengthBias * 0.12), (recipe.spread ?? 0.08) + spreadBoost, index, 23),
    sustain: vary(clamp(baseProfile.sustain + (recipe.sustain ?? 0) + lengthBias * 0.14), (recipe.spread ?? 0.07) + spreadBoost, index, 24),
    movement: vary(clamp(baseProfile.movement + (recipe.movement ?? 0) + wildBias * 0.08), (recipe.spread ?? 0.09) + spreadBoost, index, 25),
    noise: vary(clamp(baseProfile.noise + (recipe.noise ?? 0) + dirtBias * 0.18), (recipe.spread ?? 0.07) + spreadBoost, index, 26),
    width: vary(clamp(baseProfile.width + (recipe.width ?? 0) + widthBias * 0.18), (recipe.spread ?? 0.08) + spreadBoost, index, 27),
    wetness: vary(clamp((baseProfile.wetness ?? 0.18) + wetBias * 0.22 + (recipe.wetness ?? 0)), (recipe.spread ?? 0.05) + spreadBoost, index, 28),
    wash: vary(clamp((baseProfile.wash ?? 0.12) + washBias * 0.22 + (recipe.wash ?? 0)), (recipe.spread ?? 0.05) + spreadBoost, index, 29),
    drive: vary(clamp((baseProfile.drive ?? 0.08) + driveBias * 0.22 + (recipe.drive ?? 0)), (recipe.spread ?? 0.05) + spreadBoost, index, 30),
  };
}

function buildFreePack(profile) {
  const recipes = [
    { role: "Closest", brightness: -0.01, movement: -0.02, spread: 0.035, amountScale: 0.82 },
    { role: "Darker", brightness: -0.15, body: 0.06, movement: -0.03, spread: 0.04, amountScale: 0.9 },
    { role: "Brighter", brightness: 0.14, width: 0.05, movement: 0.04, spread: 0.045, amountScale: 0.94 },
  ];

  return recipes.map((recipe, index) => {
    const shaped = shapeProfile(profile, recipe, index);
    return mapProfileToVital(shaped, index, {
      amountScale: recipe.amountScale,
      roleLabel: recipe.role,
    });
  });
}

function buildProPack(profile) {
  const recipes = [
    { role: "Closest", brightness: -0.02, movement: -0.02, spread: 0.04, amountScale: 0.85 },
    { role: "Closest", brightness: 0.03, width: 0.04, spread: 0.04, amountScale: 0.85 },
    { role: "Darker", brightness: -0.16, body: 0.08, spread: 0.05, amountScale: 1.0 },
    { role: "Darker", brightness: -0.12, sustain: 0.06, noise: 0.03, drive: 0.03, spread: 0.05, amountScale: 1.0 },
    { role: "Brighter", brightness: 0.16, body: -0.04, wetness: 0.04, spread: 0.05, amountScale: 1.0 },
    { role: "Brighter", brightness: 0.12, width: 0.08, movement: 0.04, wetness: 0.06, spread: 0.05, amountScale: 1.0 },
    { role: "Steadier", movement: -0.18, sustain: 0.05, wash: -0.05, spread: 0.05, amountScale: 0.95 },
    { role: "Steadier", movement: -0.12, width: -0.06, body: 0.05, wetness: -0.04, spread: 0.05, amountScale: 0.95 },
    { role: "More Motion", movement: 0.2, width: 0.08, wetness: 0.03, spread: 0.06, amountScale: 1.05 },
    { role: "More Motion", movement: 0.16, brightness: 0.05, noise: 0.04, drive: 0.04, spread: 0.06, amountScale: 1.05 },
    { role: "Wider", width: 0.18, sustain: 0.04, wetness: 0.04, spread: 0.05, amountScale: 1.0 },
    { role: "Wider", width: 0.14, movement: 0.06, brightness: 0.04, wash: 0.05, spread: 0.05, amountScale: 1.0 },
    { role: "Tighter", width: -0.14, body: 0.08, wetness: -0.06, wash: -0.05, spread: 0.05, amountScale: 0.95 },
    { role: "Tighter", width: -0.1, movement: -0.06, attack: 0.05, drive: 0.03, spread: 0.05, amountScale: 0.95 },
    { role: "Textured", noise: 0.18, movement: 0.08, wash: 0.05, spread: 0.06, amountScale: 1.05 },
    { role: "Textured", noise: 0.14, brightness: -0.04, width: 0.04, drive: 0.05, spread: 0.06, amountScale: 1.05 },
  ];

  return Array.from({ length: PRO_PACK_COUNT }, (_, index) => {
    const recipe = recipes[index % recipes.length];
    const shaped = shapeProfile(profile, recipe, index);
    return mapProfileToVital(shaped, index, {
      amountScale: Math.max(0.82, (recipe.amountScale ?? 1) + Number(elements.wildBias.value) / 100 * 0.28),
      roleLabel: recipe.role,
    });
  });
}

function chooseOscillator(family, brightness, noise) {
  if (family === "bass") {
    return brightness < 0.35 ? "Basic Shapes / Sine-Saw" : "Basic Shapes / Saw";
  }
  if (family === "pluck") {
    return brightness > 0.55 ? "Bright Digital / Glassy" : "Basic Shapes / Triangle-Saw";
  }
  if (family === "texture") {
    return noise > 0.42 ? "Spectral Texture / Noisy WT" : "Complex Warp / Hollow";
  }
  return brightness > 0.6 ? "Smooth Harmonics / Wide WT" : "Basic Shapes / Triangle";
}

function buildVariantName(profile) {
  const adjectivePools = {
    pad: {
      dark: ["Velvet", "Nocturne", "Shadow", "Ash", "Dusk"],
      bright: ["Lumen", "Glass", "Silver", "Halo", "Prism"],
      neutral: ["Soft", "Quiet", "Pale", "Still", "Cold"],
    },
    pluck: {
      dark: ["Ember", "Smoked", "Copper", "Rust", "Cinder"],
      bright: ["Quartz", "Bright", "Crystal", "Neon", "Lucent"],
      neutral: ["Tight", "Clean", "Fine", "Wire", "Sharp"],
    },
    bass: {
      dark: ["Black", "Coal", "Deep", "Iron", "Stone"],
      bright: ["Chrome", "Steel", "Volt", "Signal", "Acid"],
      neutral: ["Low", "Sub", "Core", "Heavy", "Dense"],
    },
    texture: {
      dark: ["Dust", "Ghost", "Ruin", "Static", "Ash"],
      bright: ["Mist", "Signal", "Frost", "Glint", "Solar"],
      neutral: ["Thin", "Granite", "Hollow", "Drift", "Shiver"],
    },
  };

  const nounPools = {
    pad: ["Veil", "Bloom", "Meridian", "Archive", "Drift", "Canopy", "Haze", "Chamber"],
    pluck: ["Click", "Strike", "Tone", "Needle", "Petal", "Spark", "Key", "Pulse"],
    bass: ["Engine", "Vault", "Furnace", "Axis", "Pressure", "Coil", "Current", "Pulse"],
    texture: ["Fabric", "Horizon", "Moss", "Choir", "Canopy", "Bloom", "Field", "Static"],
  };

  const brightnessKey = profile.brightness > 0.58 ? "bright" : profile.brightness < 0.4 ? "dark" : "neutral";
  const adjectiveSource = adjectivePools[profile.family][brightnessKey];
  const nounSource = nounPools[profile.family];
  const moodOffset = profile.movement > 0.45 ? 2 : 0;
  const toneOffset = profile.noise > 0.38 ? 3 : profile.body > 0.62 ? 1 : 0;
  const registerOffset = profile.pitchHz > 0 ? Math.abs(Math.round(profile.pitchHz)) : 0;
  const adjectiveIndex = (profile.index + moodOffset + toneOffset + registerOffset) % adjectiveSource.length;
  const nounIndex = (profile.index * 2 + toneOffset + Math.round(profile.width * 10)) % nounSource.length;

  const adjective = adjectiveSource[adjectiveIndex];
  const noun = nounSource[nounIndex];
  return `${adjective} ${noun}`;
}

function variantRole(index, preset) {
  if (preset.roleLabel) {
    return preset.roleLabel;
  }
  const roles = ["Closest", preset.parameterMap.filter_1_cutoff < 50 ? "Darker" : "More Motion", "Brighter"];
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

function familyLabel(family) {
  const labels = {
    pad: "Pad / Atmosphere",
    pluck: "Pluck / Keys",
    bass: "Bass",
    texture: "Drone / Texture",
  };
  return labels[family] || family;
}

function noteName(frequency) {
  if (!frequency || !Number.isFinite(frequency)) {
    return "Unknown";
  }
  const midi = Math.round(69 + 12 * Math.log2(frequency / 440));
  const noteNames = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  const octave = Math.floor(midi / 12) - 1;
  const note = noteNames[((midi % 12) + 12) % 12];
  return `${note}${octave}`;
}

function seedUrlForFamily(family) {
  const seedName = SEED_BY_FAMILY[family] || SEED_BY_FAMILY.texture;
  return new URL(`../assets/seeds/vital/raw/${encodeURIComponent(seedName)}`, window.location.href);
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
    if (key.startsWith("_")) {
      continue;
    }
    if (typeof value === "boolean") {
      settings[key] = value ? 1.0 : 0.0;
      continue;
    }
    if (typeof value === "number") {
      settings[key] = value;
    }
  }

  settings.osc_1_on = 1.0;
  settings.osc_2_on = 1.0;
  settings.filter_1_on = 1.0;
  settings.chorus_on = settings.chorus_dry_wet > 0.01 ? 1.0 : 0.0;
  settings.reverb_on = settings.reverb_dry_wet > 0.01 ? 1.0 : 0.0;
  settings.distortion_on = settings.distortion_mix > 0.01 ? 1.0 : 0.0;
  settings.osc_1_unison_voices = Math.round(clamp(settings.osc_1_unison_voices, 1, 8));
  settings.osc_2_unison_voices = Math.round(clamp(settings.osc_2_unison_voices, 1, 8));
  settings.preset_name = preset.name;

  rendered.author = "Audio Alchemy";
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
  const fileName = `${sanitizeFileName(preset.name)}.vital`;
  const body = JSON.stringify(rendered);
  return {
    fileName,
    blob: new Blob([body], { type: "application/json;charset=utf-8" }),
  };
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
      <p class="preset-quality">Why this result: ${buildPresetReason(preset, role)}</p>
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

function buildPresetSummary({ family, brightness, movement, width, sustain, attack, register }) {
  const tone = brightness > 0.58 ? "brighter" : brightness < 0.42 ? "darker" : "balanced";
  const motion = movement > 0.5 ? "more animated" : movement < 0.3 ? "steadier" : "lightly moving";
  const space = width > 0.55 ? "with a wider image" : width < 0.3 ? "with a tighter image" : "with a centered image";
  const tail = sustain > 0.58 ? "longer tail" : sustain < 0.32 ? "shorter tail" : "controlled tail";
  const onset = attack > 0.62 ? "softer attack" : attack < 0.36 ? "harder attack" : "balanced attack";

  if (family === "bass") {
    return `${tone.charAt(0).toUpperCase() + tone.slice(1)} bass with ${onset}, ${space}, and a ${tail}.`;
  }
  if (family === "pluck") {
    return `${tone.charAt(0).toUpperCase() + tone.slice(1)} pluck with ${onset}, ${motion}, and a ${tail}.`;
  }
  if (family === "texture") {
    return `${tone.charAt(0).toUpperCase() + tone.slice(1)} texture around ${register}, ${motion}, and ${space}.`;
  }
  return `${tone.charAt(0).toUpperCase() + tone.slice(1)} pad around ${register} with ${onset}, ${motion}, and a ${tail}.`;
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
    const folderName = sanitizeFileName(state.sourceName || "audio-alchemy-pack");
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

    updateStatus("Source ready. Generate 3 free presets or unlock the 32-pack.");
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

  updateStatus("Shaping 3 guided Vital preset directions...");
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
    ["Brightness", formatPercent(state.profile.brightness)],
    ["Body", formatPercent(state.profile.body)],
    ["Attack", formatPercent(state.profile.attack)],
    ["Sustain", formatPercent(state.profile.sustain)],
    ["Movement", formatPercent(state.profile.movement)],
    ["Noise", formatPercent(state.profile.noise)],
    ["Width", formatPercent(state.profile.width)],
  ]);

  renderPresets(state.presets);
  updateStatus("3 guided Vital presets ready. Download the ones that feel closest to your track.");
  setReady(Boolean(state.originalBuffer));
}

function generatePresetPack() {
  if (!state.originalBuffer || !state.proPreviewUnlocked) {
    return;
  }

  updateStatus("Shaping a 32-preset Vital pack...");
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
    ["Brightness", formatPercent(state.profile.brightness)],
    ["Body", formatPercent(state.profile.body)],
    ["Attack", formatPercent(state.profile.attack)],
    ["Sustain", formatPercent(state.profile.sustain)],
    ["Movement", formatPercent(state.profile.movement)],
    ["Noise", formatPercent(state.profile.noise)],
    ["Width", formatPercent(state.profile.width)],
  ]);

  renderPresets(state.presets);
  updateStatus("32-preset Vital pack ready.");
  setReady(Boolean(state.originalBuffer));
}

async function handleGeneratePresets() {
  if (!state.originalBuffer || state.isGenerating) {
    return;
  }

  setGenerateLoadingState(true);
  updateStatus("Generating 3 guided Vital presets...");

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
  updateStatus("Generating a 32-preset Vital pack...");

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
  setProControlsEnabled(unlocked);
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
  if (!isOpen) {
    elements.paidFeatureKey.focus();
  }
}

function handlePaidFeatureUnlock() {
  const key = elements.paidFeatureKey.value.trim();
  if (!key) {
    elements.paidFeatureUnlockNote.textContent = "Enter your purchase code to unlock this browser.";
    return;
  }
  if (key !== PRO_PURCHASE_CODE) {
    elements.paidFeatureUnlockNote.textContent = "Invalid purchase code. Check the code and try again.";
    return;
  }

  state.proPreviewUnlocked = true;
  window.localStorage.setItem(PRO_PREVIEW_STORAGE_KEY, "1");
  renderPaidFeatureState();
  updateStatus("Audio Alchemy Pro is active in this browser.");
  setReady(Boolean(state.originalBuffer));
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

for (const control of [
  elements.brightnessBias,
  elements.movementBias,
  elements.attackBias,
  elements.dirtBias,
  elements.widthBias,
  elements.lengthBias,
  elements.wildBias,
  elements.wetBias,
  elements.washBias,
  elements.driveBias,
]) {
  control.addEventListener("input", updateControlLabels);
}

updateControlLabels();
state.proPreviewUnlocked = window.localStorage.getItem(PRO_PREVIEW_STORAGE_KEY) === "1";
renderPaidFeatureState();
setAnalysisVisible(false);
updatePlaybackUI();
setReady(false);
if (SELF_TEST_ENABLED) {
  loadSyntheticSource();
}

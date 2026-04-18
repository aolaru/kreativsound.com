const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
const GENERATE_DELAY_MS = 520;
const FREE_VARIANT_ROLES = [
  { key: "shard-drift", label: "Shard Drift", tag: "Closest", amount: 0.85 },
  { key: "glass-loop", label: "Glass Loop", tag: "Bolder", amount: 1.05 },
  { key: "crushed-bloom", label: "Crushed Bloom", tag: "Wilder", amount: 1.3 },
];

function createPackRole(group, index, overrides = {}) {
  return {
    key: `${group.key}-${index + 1}`,
    label: `${group.label} ${index + 1}`,
    tag: group.label,
    amount: overrides.amount ?? group.amount ?? 1,
    brokenBias: overrides.brokenBias ?? group.brokenBias ?? 0,
    wetBias: overrides.wetBias ?? group.wetBias ?? 0,
    washBias: overrides.washBias ?? group.washBias ?? 0,
    engine: overrides.engine ?? group.engine ?? "glass-loop",
    description: group.description,
    bestUse: group.bestUse,
    groupKey: group.key,
    groupLabel: group.label,
  };
}

const PACK_GROUPS = [
  { key: "safer-cuts", label: "Safer Cuts", description: "Tighter, more usable fracture passes that stay closer to the source.", bestUse: "Controlled layers, supportive transitions, and safer rhythmic edits.", amount: 0.82, brokenBias: -0.75, wetBias: -0.2, washBias: -0.2, engine: "glass-loop" },
  { key: "looped", label: "Looped", description: "More repeat behavior and pattern-oriented loop fragments.", bestUse: "Rhythmic beds, pulsing transitions, and looping accents.", amount: 1.02, brokenBias: -0.05, wetBias: 0.08, washBias: -0.1, engine: "glass-loop" },
  { key: "washed", label: "Washed", description: "Longer tails, softer blur, and more bloom in the fracture result.", bestUse: "Atmospheric tails, smeared pads, and ambient support layers.", amount: 1.0, brokenBias: 0.05, wetBias: 0.45, washBias: 0.9, engine: "crushed-bloom" },
  { key: "grittier", label: "Grittier", description: "Harder texture, more drive, and rougher broken edges.", bestUse: "Dirty impacts, harsher textures, and degraded one-shots.", amount: 1.08, brokenBias: 0.25, wetBias: -0.1, washBias: -0.05, engine: "crushed-bloom" },
  { key: "wider", label: "Wider", description: "Broader stereo image and more spread in the output motion.", bestUse: "Wide layers, transitions, and stereo texture support.", amount: 1.02, brokenBias: 0.08, wetBias: 0.22, washBias: 0.18, engine: "glass-loop" },
  { key: "more-broken", label: "More Broken", description: "Harder timing disruption and more obviously fragmented structure.", bestUse: "Aggressive glitch moments and more shattered fracture passes.", amount: 1.22, brokenBias: 0.95, wetBias: 0.05, washBias: 0.1, engine: "crushed-bloom" },
  { key: "reverse-drift", label: "Reverse Drift", description: "Reverse ghosts and offset drifts with more trailing fragments.", bestUse: "Reverse fills, broken intros, and drifting accents.", amount: 1.08, brokenBias: 0.2, wetBias: 0.18, washBias: 0.35, engine: "shard-drift" },
  { key: "tighter", label: "Tighter", description: "Shorter, drier fracture passes with less tail and more snap.", bestUse: "Percussive edits, shorter transitions, and focused cut layers.", amount: 0.92, brokenBias: -0.12, wetBias: -0.45, washBias: -0.85, engine: "glass-loop" },
];

const PRO_VARIANT_ROLES = [
  createPackRole(PACK_GROUPS[0], 0, { amount: 0.78 }),
  createPackRole(PACK_GROUPS[0], 1, { amount: 0.84, wetBias: -0.28 }),
  createPackRole(PACK_GROUPS[0], 2, { amount: 0.88, brokenBias: -0.62 }),
  createPackRole(PACK_GROUPS[0], 3, { amount: 0.92, washBias: -0.28 }),
  createPackRole(PACK_GROUPS[1], 0, { amount: 0.96 }),
  createPackRole(PACK_GROUPS[1], 1, { amount: 1.02, wetBias: 0.12 }),
  createPackRole(PACK_GROUPS[1], 2, { amount: 1.06, brokenBias: 0.08 }),
  createPackRole(PACK_GROUPS[1], 3, { amount: 1.1, washBias: -0.16 }),
  createPackRole(PACK_GROUPS[2], 0, { amount: 0.96 }),
  createPackRole(PACK_GROUPS[2], 1, { amount: 1.02, wetBias: 0.56 }),
  createPackRole(PACK_GROUPS[2], 2, { amount: 1.08, washBias: 1 }),
  createPackRole(PACK_GROUPS[2], 3, { amount: 1.12, brokenBias: 0.14 }),
  createPackRole(PACK_GROUPS[3], 0, { amount: 1.0 }),
  createPackRole(PACK_GROUPS[3], 1, { amount: 1.08, brokenBias: 0.34 }),
  createPackRole(PACK_GROUPS[3], 2, { amount: 1.14, wetBias: -0.18 }),
  createPackRole(PACK_GROUPS[3], 3, { amount: 1.2, washBias: -0.12 }),
  createPackRole(PACK_GROUPS[4], 0, { amount: 0.98 }),
  createPackRole(PACK_GROUPS[4], 1, { amount: 1.04, wetBias: 0.28 }),
  createPackRole(PACK_GROUPS[4], 2, { amount: 1.12, brokenBias: 0.18 }),
  createPackRole(PACK_GROUPS[4], 3, { amount: 1.16, washBias: 0.22 }),
  createPackRole(PACK_GROUPS[5], 0, { amount: 1.14 }),
  createPackRole(PACK_GROUPS[5], 1, { amount: 1.2, wetBias: -0.08 }),
  createPackRole(PACK_GROUPS[5], 2, { amount: 1.28, brokenBias: 1 }),
  createPackRole(PACK_GROUPS[5], 3, { amount: 1.34, washBias: 0.08 }),
  createPackRole(PACK_GROUPS[6], 0, { amount: 1.0 }),
  createPackRole(PACK_GROUPS[6], 1, { amount: 1.06, wetBias: 0.24 }),
  createPackRole(PACK_GROUPS[6], 2, { amount: 1.14, washBias: 0.4 }),
  createPackRole(PACK_GROUPS[6], 3, { amount: 1.18, brokenBias: 0.28 }),
  createPackRole(PACK_GROUPS[7], 0, { amount: 0.86 }),
  createPackRole(PACK_GROUPS[7], 1, { amount: 0.92, wetBias: -0.52 }),
  createPackRole(PACK_GROUPS[7], 2, { amount: 0.98, washBias: -1 }),
  createPackRole(PACK_GROUPS[7], 3, { amount: 1.02, brokenBias: -0.22 }),
];

const state = {
  audioContext: null,
  sourceBuffer: null,
  currentSource: null,
  sourceName: "",
  analysis: null,
  variants: [],
  isGenerating: false,
  suiteUnlocked: false,
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
  fractureRange: document.querySelector("#fracture-range"),
  fractureValue: document.querySelector("#fracture-value"),
  spaceRange: document.querySelector("#space-range"),
  spaceValue: document.querySelector("#space-value"),
  textureRange: document.querySelector("#texture-range"),
  textureValue: document.querySelector("#texture-value"),
  proControlPanel: document.querySelector("#pro-control-panel"),
  brokenRange: document.querySelector("#broken-range"),
  brokenValue: document.querySelector("#broken-value"),
  wetRange: document.querySelector("#wet-range"),
  wetValue: document.querySelector("#wet-value"),
  washRange: document.querySelector("#wash-range"),
  washValue: document.querySelector("#wash-value"),
  playOriginal: document.querySelector("#play-original"),
  stopPlayback: document.querySelector("#stop-playback"),
  generateButton: document.querySelector("#generate-button"),
  generateButtonLabel: document.querySelector("#generate-button .button-label"),
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
  analysisMetrics: document.querySelector("#analysis-metrics"),
  profileMetrics: document.querySelector("#profile-metrics"),
  variantList: document.querySelector("#variant-list"),
};

const SUITE_UNLOCK_STORAGE_KEY = "kreativ-sound-tools-unlocked";
const SUITE_PURCHASE_CODE = "AA-PRO-32-DGTW9930";
const PRO_VARIANT_COUNT = PRO_VARIANT_ROLES.length;

function createAudioContext() {
  if (!state.audioContext) {
    state.audioContext = new AudioContext();
  }
  return state.audioContext;
}

function clamp(value, min = -1, max = 1) {
  return Math.min(max, Math.max(min, value));
}

function lerp(min, max, amount) {
  return min + (max - min) * amount;
}

function updateStatus(message) {
  elements.status.textContent = message;
}

function showUploadMessage(message = "") {
  elements.uploadMessage.hidden = !message;
  elements.uploadMessage.textContent = message;
}

function updateControlLabels() {
  elements.fractureValue.textContent = `${elements.fractureRange.value}%`;
  elements.spaceValue.textContent = `${Number(elements.spaceRange.value) > 0 ? "+" : ""}${elements.spaceRange.value}%`;
  elements.textureValue.textContent = `${Number(elements.textureRange.value) > 0 ? "+" : ""}${elements.textureRange.value}%`;
  elements.brokenValue.textContent = `${Number(elements.brokenRange.value) > 0 ? "+" : ""}${elements.brokenRange.value}%`;
  elements.wetValue.textContent = `${Number(elements.wetRange.value) > 0 ? "+" : ""}${elements.wetRange.value}%`;
  elements.washValue.textContent = `${Number(elements.washRange.value) > 0 ? "+" : ""}${elements.washRange.value}%`;
}

function setProControlsEnabled(enabled) {
  elements.proControlPanel.classList.toggle("is-locked", !enabled);
  elements.brokenRange.disabled = !enabled;
  elements.wetRange.disabled = !enabled;
  elements.washRange.disabled = !enabled;
}

function setReady(ready) {
  elements.playOriginal.disabled = !ready;
  elements.stopPlayback.disabled = !ready;
  elements.generateButton.disabled = !ready || state.isGenerating;
  if (elements.generatePack) {
    elements.generatePack.disabled = !ready || state.isGenerating || !state.suiteUnlocked;
  }
  if (elements.downloadPack) {
    elements.downloadPack.disabled = state.isGenerating || state.lastGenerationMode !== "pro" || state.variants.length !== PRO_VARIANT_COUNT;
  }
}

function setGenerateLoadingState(isLoading, mode = "free") {
  state.isGenerating = isLoading;
  elements.generateButton.classList.toggle("is-loading", isLoading && mode === "free");
  elements.generateButtonLabel.textContent = isLoading && mode === "free" ? "Fracturing audio..." : "Generate 3 Free Variations";
  if (elements.generatePack) {
    elements.generatePack.classList.toggle("is-loading", isLoading && mode === "pro");
    elements.generatePack.disabled = !state.sourceBuffer || isLoading || !state.suiteUnlocked;
  }
  if (elements.downloadPack) {
    elements.downloadPack.disabled = isLoading || state.lastGenerationMode !== "pro" || state.variants.length !== PRO_VARIANT_COUNT;
  }
  setReady(Boolean(state.sourceBuffer));
}

function stopPlayback() {
  if (!state.currentSource) {
    return;
  }
  state.currentSource.stop();
  state.currentSource.disconnect();
  state.currentSource = null;
}

function playBuffer(buffer) {
  const context = createAudioContext();
  stopPlayback();
  const source = context.createBufferSource();
  source.buffer = buffer;
  source.connect(context.destination);
  source.start();
  source.onended = () => {
    if (state.currentSource === source) {
      state.currentSource.disconnect();
      state.currentSource = null;
    }
  };
  state.currentSource = source;
}

function downmix(buffer) {
  const mono = new Float32Array(buffer.length);
  for (let channel = 0; channel < buffer.numberOfChannels; channel += 1) {
    const data = buffer.getChannelData(channel);
    for (let index = 0; index < buffer.length; index += 1) {
      mono[index] += data[index] / buffer.numberOfChannels;
    }
  }
  return mono;
}

function drawWaveform(buffer) {
  const canvas = elements.waveform;
  const context = canvas.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;
  const data = downmix(buffer);
  const step = Math.ceil(data.length / width);
  const amp = height * 0.42;

  context.clearRect(0, 0, width, height);
  context.fillStyle = "#f2dfdf";
  context.fillRect(0, 0, width, height);
  context.strokeStyle = "rgba(153,0,0,0.12)";
  context.beginPath();
  context.moveTo(0, height / 2);
  context.lineTo(width, height / 2);
  context.stroke();

  context.beginPath();
  context.strokeStyle = "#990000";
  context.lineWidth = 2;

  for (let x = 0; x < width; x += 1) {
    let min = 1;
    let max = -1;
    for (let offset = 0; offset < step; offset += 1) {
      const sample = data[(x * step) + offset];
      if (sample === undefined) {
        break;
      }
      if (sample < min) min = sample;
      if (sample > max) max = sample;
    }
    context.moveTo(x, height / 2 + min * amp);
    context.lineTo(x, height / 2 + max * amp);
  }

  context.stroke();
  elements.waveformPanel.classList.add("has-waveform");
  elements.waveformDropCta.hidden = true;
  elements.waveformEmptyNote.hidden = true;
}

function resetLoadedState() {
  stopPlayback();
  state.sourceBuffer = null;
  state.sourceName = "";
  state.analysis = null;
  state.variants = [];
  state.lastGenerationMode = "free";
  elements.fileName.textContent = "No file loaded";
  elements.fileDuration.textContent = "0.0s";
  elements.fileSampleRate.textContent = "-";
  elements.fileChannels.textContent = "-";
  elements.waveform.getContext("2d").clearRect(0, 0, elements.waveform.width, elements.waveform.height);
  elements.waveformPanel.classList.remove("has-waveform");
  elements.waveformDropCta.hidden = false;
  elements.waveformEmptyNote.hidden = false;
  renderMetricGrid(elements.analysisMetrics, []);
  renderMetricGrid(elements.profileMetrics, []);
  renderVariants([]);
  showUploadMessage("");
  setReady(false);
}

function formatHz(value) {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(2)} kHz`;
  }
  return `${Math.round(value)} Hz`;
}

function formatPercent(value) {
  return `${Math.round(value * 100)}%`;
}

function formatSeconds(value) {
  return `${value.toFixed(1)}s`;
}

function estimateCentroid(data, sampleRate) {
  const frameSize = Math.min(2048, data.length);
  let weighted = 0;
  let total = 0;
  for (let bin = 1; bin < frameSize / 2; bin += 1) {
    let real = 0;
    let imag = 0;
    for (let n = 0; n < frameSize; n += 1) {
      const angle = (2 * Math.PI * bin * n) / frameSize;
      real += data[n] * Math.cos(angle);
      imag -= data[n] * Math.sin(angle);
    }
    const magnitude = Math.sqrt(real * real + imag * imag);
    const hz = (bin * sampleRate) / frameSize;
    weighted += hz * magnitude;
    total += magnitude;
  }
  return total > 0 ? weighted / total : 0;
}

function analyzeAudio(buffer) {
  const mono = downmix(buffer);
  let sumSquares = 0;
  let peak = 0;
  let zeroCrossings = 0;

  for (let i = 0; i < mono.length; i += 1) {
    const value = mono[i];
    const abs = Math.abs(value);
    sumSquares += value * value;
    if (abs > peak) {
      peak = abs;
    }
    if (i > 0 && ((mono[i - 1] >= 0 && value < 0) || (mono[i - 1] < 0 && value >= 0))) {
      zeroCrossings += 1;
    }
  }

  let stereoWidth = 0;
  if (buffer.numberOfChannels > 1) {
    const left = buffer.getChannelData(0);
    const right = buffer.getChannelData(1);
    let diff = 0;
    let total = 0;
    for (let i = 0; i < buffer.length; i += 1) {
      diff += Math.abs(left[i] - right[i]);
      total += Math.abs(left[i]) + Math.abs(right[i]);
    }
    stereoWidth = total > 0 ? diff / total : 0;
  }

  const centroidHz = estimateCentroid(mono, buffer.sampleRate);
  const duration = buffer.duration;
  const rms = Math.sqrt(sumSquares / mono.length);
  const density = clamp((zeroCrossings / mono.length) * 20, 0, 1);

  return {
    duration,
    sampleRate: buffer.sampleRate,
    channels: buffer.numberOfChannels,
    peak,
    rms,
    centroidHz,
    density,
    stereoWidth,
  };
}

function renderMetricGrid(target, items) {
  if (!items.length) {
    target.innerHTML = `<p class="empty-state">Load a source file to populate this section.</p>`;
    return;
  }

  target.innerHTML = items
    .map(
      ({ label, value }) => `
        <div class="metric">
          <span class="metric-label">${label}</span>
          <strong>${value}</strong>
        </div>
      `,
    )
    .join("");
}

function renderAnalysis() {
  if (!state.analysis) {
    renderMetricGrid(elements.analysisMetrics, []);
    renderMetricGrid(elements.profileMetrics, []);
    return;
  }

  renderMetricGrid(elements.analysisMetrics, [
    { label: "Duration", value: formatSeconds(state.analysis.duration) },
    { label: "Peak", value: formatPercent(state.analysis.peak) },
    { label: "RMS", value: formatPercent(state.analysis.rms) },
    { label: "Centroid", value: formatHz(state.analysis.centroidHz) },
    { label: "Density", value: formatPercent(state.analysis.density) },
    { label: "Stereo Width", value: formatPercent(state.analysis.stereoWidth) },
  ]);

  renderMetricGrid(elements.profileMetrics, [
    { label: "Fracture", value: `${elements.fractureRange.value}%` },
    { label: "Space", value: `${elements.spaceRange.value}%` },
    { label: "Texture", value: `${elements.textureRange.value}%` },
    { label: "Output", value: state.suiteUnlocked ? "3 Free / 32 Pro" : "3 Variations" },
  ]);
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

function createEmptyChannels(channelCount, length) {
  return Array.from({ length: channelCount }, () => new Float32Array(length));
}

function copySliceWithFade(source, output, sourceStart, length, outputStart, reverse = false) {
  for (let i = 0; i < length; i += 1) {
    const sourceIndex = reverse ? sourceStart + (length - 1 - i) : sourceStart + i;
    if (sourceIndex < 0 || sourceIndex >= source.length || outputStart + i >= output.length) {
      continue;
    }
    const edge = Math.min(i / 32, (length - i) / 32, 1);
    output[outputStart + i] += source[sourceIndex] * edge;
  }
}

function applyBitCrush(value, steps) {
  if (steps <= 1) {
    return value;
  }
  return Math.round(value * steps) / steps;
}

function smoothSample(value, previous, amount) {
  return (previous * amount) + (value * (1 - amount));
}

function normalizeChannels(channels) {
  let peak = 0;
  for (const channel of channels) {
    for (let i = 0; i < channel.length; i += 1) {
      peak = Math.max(peak, Math.abs(channel[i]));
    }
  }

  if (peak === 0) {
    return;
  }

  const targetPeak = peak > 0.95 ? 0.94 : peak < 0.48 ? 0.78 : peak < 0.7 ? 0.86 : peak;
  const scale = targetPeak / peak;
  for (const channel of channels) {
    for (let i = 0; i < channel.length; i += 1) {
      channel[i] *= scale;
    }
  }
}

function applyEdgeFade(channels, fadeSamples) {
  if (fadeSamples <= 0) {
    return;
  }

  for (const channel of channels) {
    const maxFade = Math.min(fadeSamples, Math.floor(channel.length / 2));
    for (let i = 0; i < maxFade; i += 1) {
      const gain = i / maxFade;
      const tailIndex = channel.length - 1 - i;
      channel[i] *= gain;
      channel[tailIndex] *= gain;
    }
  }
}

function sourceConsistencyFactor(analysis) {
  if (!analysis) {
    return 1;
  }

  const shortness = analysis.duration <= 6 ? 1 : analysis.duration <= 10 ? 0.88 : 0.74;
  const densityPenalty = analysis.density > 0.52 ? 0.84 : analysis.density > 0.36 ? 0.92 : 1;
  return clamp(shortness * densityPenalty, 0.68, 1);
}

function sourceFitMessage(analysis) {
  if (!analysis) {
    return "";
  }
  if (analysis.duration > 10) {
    return "Longer sources can smear the fracture result. Short one-shots and textures usually land better.";
  }
  if (analysis.density > 0.52) {
    return "Dense material detected. Expect rougher fractures than with simpler one-shots or drones.";
  }
  return "";
}

function renderVariantBuffer(sourceBuffer, role, controls) {
  const channels = createEmptyChannels(sourceBuffer.numberOfChannels, sourceBuffer.length);
  const engine = role.engine || role.key;
  const consistency = sourceConsistencyFactor(state.analysis);
  const proBroken = role.brokenBias ? role.brokenBias * 0.35 : 0;
  const proWet = role.wetBias ? role.wetBias * 0.35 : 0;
  const proWash = role.washBias ? role.washBias * 0.35 : 0;
  const brokenControl = clamp(controls.broken + proBroken, -1, 1);
  const wetControl = clamp(controls.wet + proWet, -1, 1);
  const washControl = clamp(controls.wash + proWash, -1, 1);
  const fracturedConsistency = consistency * lerp(1.08, 0.82, Math.max(0, brokenControl));
  const restrainedAmount = clamp(controls.fracture * role.amount * fracturedConsistency, 0, 1.6);
  const sliceMs = engine === "shard-drift"
    ? lerp(44, 170, restrainedAmount)
    : engine === "glass-loop"
      ? lerp(70, 240, restrainedAmount)
      : lerp(18, 90, restrainedAmount);
  const maximumSlice = Math.max(256, Math.floor(sourceBuffer.length * 0.16));
  const sliceLength = clamp(Math.floor((sliceMs / 1000) * sourceBuffer.sampleRate), 128, maximumSlice);
  const delaySamples = Math.max(1, Math.floor(sourceBuffer.sampleRate * lerp(0.05, 0.34, Math.max(0, controls.space + wetControl * 0.45))));
  const bitDepthSteps = Math.round(lerp(1024, 18, Math.max(0, controls.texture + brokenControl * 0.2)));
  const jitterDepth = Math.floor(
    sliceLength
    * (
      engine === "shard-drift"
        ? lerp(0.08, 0.52, clamp(restrainedAmount + Math.max(0, brokenControl) * 0.12, 0, 1))
        : engine === "glass-loop"
          ? lerp(0.02, 0.24, clamp(restrainedAmount + Math.max(0, brokenControl) * 0.08, 0, 1))
          : lerp(0.12, 0.66, clamp(restrainedAmount + Math.max(0, brokenControl) * 0.16, 0, 1))
    ),
  );
  const rng = createRng(hashString(`${state.sourceName}:${role.key}:${elements.fractureRange.value}:${elements.spaceRange.value}:${elements.textureRange.value}:${elements.brokenRange.value}:${elements.wetRange.value}:${elements.washRange.value}`));

  for (let channel = 0; channel < sourceBuffer.numberOfChannels; channel += 1) {
    const source = sourceBuffer.getChannelData(channel);
    const output = channels[channel];

    for (let start = 0; start < source.length; start += sliceLength) {
      const remaining = Math.min(sliceLength, source.length - start);
      const jitter = Math.floor((rng() * 2 - 1) * jitterDepth);
      const sourceStart = clamp(start + jitter, 0, Math.max(0, source.length - remaining));
      const shouldReverse =
        engine === "shard-drift"
          ? rng() < lerp(0.16, 0.48, clamp(restrainedAmount + Math.max(0, brokenControl) * 0.12, 0, 1))
          : engine === "glass-loop"
            ? rng() < lerp(0.04, 0.16, clamp(restrainedAmount + Math.max(0, brokenControl) * 0.08, 0, 1))
            : rng() < lerp(0.2, 0.58, clamp(restrainedAmount + Math.max(0, brokenControl) * 0.16, 0, 1));

      let outputStart = start;
      if (engine === "glass-loop") {
        outputStart = clamp(start + Math.floor((rng() * 2 - 1) * sliceLength * 0.14), 0, Math.max(0, output.length - remaining));
      }

      if (engine === "crushed-bloom") {
        outputStart = clamp(start - Math.floor(sliceLength * lerp(0.08, 0.34, restrainedAmount)), 0, Math.max(0, output.length - remaining));
      }

      copySliceWithFade(source, output, sourceStart, remaining, outputStart, shouldReverse);

      if (engine === "glass-loop" && rng() < lerp(0.58, 0.8, consistency)) {
        const repeatStart = clamp(outputStart + Math.floor(sliceLength * lerp(0.22, 0.62, restrainedAmount)), 0, Math.max(0, output.length - remaining));
        copySliceWithFade(source, output, sourceStart, remaining, repeatStart, false);
      }

      if (engine === "shard-drift" && rng() < lerp(0.22, 0.34, consistency)) {
        const ghostStart = clamp(outputStart + Math.floor(sliceLength * lerp(0.12, 0.38, Math.max(0, controls.space))), 0, Math.max(0, output.length - remaining));
        copySliceWithFade(source, output, sourceStart, remaining, ghostStart, true);
      }
    }

    let previous = 0;
    const dryBlend =
      engine === "shard-drift"
        ? lerp(0.18, 0.3, fracturedConsistency)
        : engine === "glass-loop"
          ? lerp(0.26, 0.38, fracturedConsistency)
          : lerp(0.12, 0.2, fracturedConsistency);
    const wetLevel = clamp(Math.max(0, wetControl), 0, 1);
    const washLevel = clamp(Math.max(0, washControl), 0, 1);
    const dryLevel = clamp(Math.max(0, -wetControl), 0, 1);

    for (let i = 0; i < output.length; i += 1) {
      let sample = output[i];
      const dry = source[i] * lerp(dryBlend, dryBlend * 1.35, dryLevel);

      if (engine === "crushed-bloom") {
        sample = applyBitCrush(sample, bitDepthSteps);
        if (i > delaySamples) {
          sample += output[i - delaySamples] * lerp(0.14, 0.34 + wetLevel * 0.14, Math.max(0, controls.space) * fracturedConsistency);
        }
        sample = smoothSample(sample, previous, lerp(0.12, 0.3 + washLevel * 0.18, restrainedAmount));
      } else if (engine === "glass-loop") {
        if (i > delaySamples) {
          sample += output[i - delaySamples] * lerp(0.1, 0.24 + wetLevel * 0.12, Math.max(0, controls.space));
        }
        if (rng() < lerp(0.02, 0.1 + Math.max(0, brokenControl) * 0.08, restrainedAmount) && i > sliceLength) {
          sample += output[i - sliceLength] * lerp(0.08, 0.16 + washLevel * 0.06, restrainedAmount);
        }
      } else {
        if (i > delaySamples) {
          sample += output[i - delaySamples] * lerp(0.06, 0.18 + wetLevel * 0.08, Math.max(0, controls.space));
        }
        sample = smoothSample(sample, previous, lerp(0.02, 0.12 + washLevel * 0.1, Math.max(0, controls.space)));
      }

      const grit = Math.max(0, controls.texture + Math.max(0, brokenControl) * 0.22);
      if (grit > 0 && engine !== "crushed-bloom") {
        sample = sample * (1 + grit * 0.25);
        sample = Math.tanh(sample * (1 + grit * (engine === "glass-loop" ? 1.0 : 1.8)));
      } else if (controls.texture < 0 || brokenControl < 0) {
        const smoothing = Math.max(Math.abs(controls.texture), Math.abs(Math.min(0, brokenControl)));
        sample = smoothSample(sample, previous, lerp(0.08, 0.32, smoothing));
        sample *= lerp(1, 0.8, smoothing);
      }

      output[i] = clamp(sample + dry);
      previous = output[i];
    }
  }

  if (sourceBuffer.numberOfChannels === 2 && controls.space !== 0) {
    const left = channels[0];
    const right = channels[1];
    const wetLevel = clamp(Math.max(0, wetControl), 0, 1);
    const width = clamp(controls.space + wetLevel * 0.12, -1, 1);
    for (let i = 0; i < left.length; i += 1) {
      const mid = (left[i] + right[i]) * 0.5;
      const side = (left[i] - right[i]) * 0.5 * (1 + width * 0.6);
      left[i] = clamp(mid + side);
      right[i] = clamp(mid - side);
    }
  }

  const washLevel = clamp(Math.max(0, washControl), 0, 1);
  applyEdgeFade(channels, Math.floor(sourceBuffer.sampleRate * lerp(0.006, 0.028, washLevel)));
  normalizeChannels(channels);

  const context = createAudioContext();
  const buffer = context.createBuffer(sourceBuffer.numberOfChannels, sourceBuffer.length, sourceBuffer.sampleRate);
  channels.forEach((channelData, index) => buffer.copyToChannel(channelData, index));
  return { buffer, channels };
}

function currentControls() {
  return {
    fracture: Number(elements.fractureRange.value) / 100,
    space: Number(elements.spaceRange.value) / 100,
    texture: Number(elements.textureRange.value) / 100,
    broken: Number(elements.brokenRange.value) / 100,
    wet: Number(elements.wetRange.value) / 100,
    wash: Number(elements.washRange.value) / 100,
  };
}

function encodeWavFromChannels(channels, sampleRate) {
  const channelCount = channels.length;
  const length = channels[0].length;
  const bytesPerSample = 2;
  const blockAlign = channelCount * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = length * blockAlign;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  function writeString(offset, value) {
    for (let i = 0; i < value.length; i += 1) {
      view.setUint8(offset + i, value.charCodeAt(i));
    }
  }

  writeString(0, "RIFF");
  view.setUint32(4, 36 + dataSize, true);
  writeString(8, "WAVE");
  writeString(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, channelCount, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, 16, true);
  writeString(36, "data");
  view.setUint32(40, dataSize, true);

  let offset = 44;
  for (let i = 0; i < length; i += 1) {
    for (let channel = 0; channel < channelCount; channel += 1) {
      const sample = clamp(channels[channel][i]);
      const int16 = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
      view.setInt16(offset, int16, true);
      offset += 2;
    }
  }

  return new Blob([buffer], { type: "audio/wav" });
}

async function downloadVariantPack() {
  if (!state.variants.length || !window.JSZip) {
    return;
  }

  const zip = new window.JSZip();
  for (const variant of state.variants) {
    zip.file(variant.downloadName, encodeWavFromChannels(variant.channels, variant.buffer.sampleRate));
  }

  const blob = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${state.sourceName.replace(/\.[^.]+$/, "") || "wave-fracture"}-32-pack.zip`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function renderVariants(variants) {
  state.variants = variants;
  const panel = document.querySelector("#results-panel");
  panel.classList.toggle("has-results", variants.length > 0);
  if (!variants.length) {
    elements.variantList.innerHTML = `<p class="empty-state">Choose a source audio file, then click <strong>${state.lastGenerationMode === "pro" ? "Generate 32 Audio Variations" : "Generate 3 Free Variations"}</strong> to create fractured audio exports.</p>`;
    return;
  }

  elements.variantList.innerHTML = "";
  const groups = new Map();
  for (const variant of variants) {
    const key = variant.groupKey || "free";
    if (!groups.has(key)) {
      groups.set(key, {
        label: variant.groupLabel || "Free Variants",
        description: variant.groupDescription || "Three starter fracture passes from the loaded source.",
        variants: [],
      });
    }
    groups.get(key).variants.push(variant);
  }

  for (const [key, group] of groups.entries()) {
    if (state.lastGenerationMode === "pro") {
      const section = document.createElement("section");
      section.className = "preset-group";
      const shouldStartOpen = key === "safer-cuts";
      const listId = `variant-group-${key}`;
      section.innerHTML = `
        <button class="preset-group-head" type="button" aria-expanded="${shouldStartOpen}" aria-controls="${listId}">
          <div>
            <h3>${group.label} <span class="preset-group-count">${group.variants.length}</span></h3>
            <p>${group.description}</p>
          </div>
          <span class="preset-group-toggle-label">${shouldStartOpen ? "Hide renders" : "Show renders"}</span>
        </button>
        <div class="preset-group-list${shouldStartOpen ? "" : " hidden"}" id="${listId}"></div>
      `;

      const list = section.querySelector(".preset-group-list");
      for (const variant of group.variants) {
        list.appendChild(createVariantCard(variant));
      }

      const toggle = section.querySelector(".preset-group-head");
      const toggleLabel = section.querySelector(".preset-group-toggle-label");
      toggle.addEventListener("click", () => {
        const expanded = toggle.getAttribute("aria-expanded") === "true";
        toggle.setAttribute("aria-expanded", String(!expanded));
        list.classList.toggle("hidden", expanded);
        toggleLabel.textContent = expanded ? "Show renders" : "Hide renders";
      });

      elements.variantList.appendChild(section);
      continue;
    }

    for (const variant of group.variants) {
      elements.variantList.appendChild(createVariantCard(variant));
    }
  }
}

function createVariantCard(variant) {
  const card = document.createElement("article");
  card.className = "preset-card";
  card.innerHTML = `
    <div class="preset-card-header">
      <div>
        <span class="preset-role">${variant.role.tag}</span>
        <h3>${variant.role.label}</h3>
        <p class="preset-subline">${variant.description}</p>
      </div>
    </div>
    <p class="variant-quality">Best use: ${variant.bestUse}</p>
    <div class="preset-metrics">
      <div>
        <span class="metric-label">Length</span>
        <strong>${formatSeconds(variant.buffer.duration)}</strong>
      </div>
      <div>
        <span class="metric-label">Texture</span>
        <strong>${variant.textureLabel}</strong>
      </div>
      <div>
        <span class="metric-label">Format</span>
        <strong>WAV</strong>
      </div>
    </div>
    <div class="chip-list">
      ${variant.tags.map((tag) => `<span class="chip">${tag}</span>`).join("")}
    </div>
    <div class="variant-actions">
      <button class="variant-button" type="button" data-action="play">Play</button>
      <button class="download-button" type="button" data-action="download">
        <span class="download-badge">WAV</span>
        <span>Download</span>
      </button>
    </div>
  `;
  card.querySelector('[data-action="play"]').addEventListener("click", () => playBuffer(variant.buffer));
  card.querySelector('[data-action="download"]').addEventListener("click", () => {
    const blob = encodeWavFromChannels(variant.channels, variant.buffer.sampleRate);
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = variant.downloadName;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  });
  return card;
}

function buildVariantDescription(role, controls, mode = "free") {
  if (mode === "pro" && role.groupLabel) {
    return `${role.groupLabel} fracture pass shaped by the current break, wetness, and wash settings.`;
  }
  if (role.key === "shard-drift") {
    return `Offset reverse fragments with ${controls.space > 0.2 ? "wider tails" : "tighter image"} and ${controls.texture > 0.2 ? "more grit" : "controlled texture"}.`;
  }
  if (role.key === "glass-loop") {
    return `Looped slice repeats with ${controls.space > 0.2 ? "stereo spread" : "centered rhythm"} and ${controls.fracture > 0.5 ? "stronger pattern breaks" : "lighter timing shifts"}.`;
  }
  return `Short crushed shards with ${controls.texture > 0.2 ? "heavier degradation" : "softened bloom"} and ${controls.space > 0.2 ? "echo bloom" : "dry punch"}.`;
}

async function generateVariants(mode = "free") {
  if (!state.sourceBuffer) {
    return;
  }

  if (mode === "pro" && !state.suiteUnlocked) {
    return;
  }

  setGenerateLoadingState(true, mode);
  updateStatus(mode === "pro" ? "Rendering a 32-audio fracture pack from the source..." : "Fracturing the source into 3 guided audio directions...");
  await new Promise((resolve) => window.setTimeout(resolve, GENERATE_DELAY_MS));

  const controls = currentControls();
  const roles = mode === "pro" ? PRO_VARIANT_ROLES : FREE_VARIANT_ROLES;
  const variants = roles.map((role) => {
    const { buffer, channels } = renderVariantBuffer(state.sourceBuffer, role, controls);
    const tags = [
      role.groupLabel || role.label,
      role.key.includes("loop") || role.groupKey === "looped" ? "Loop slices" : role.key.includes("shard") || role.groupKey === "reverse-drift" ? "Reverse shards" : role.groupKey === "washed" ? "Washed tails" : role.groupKey === "more-broken" ? "Broken cuts" : role.key.includes("crushed") ? "Crushed smear" : "Fracture pass",
      controls.texture > 0.2 ? "Grit" : controls.texture < -0.2 ? "Smooth" : "Balanced",
      controls.space > 0.2 ? "Wide" : controls.space < -0.2 ? "Dry" : "Centered",
    ];
    return {
      role,
      groupKey: role.groupKey || "free",
      groupLabel: role.groupLabel || "Free Variants",
      groupDescription: role.description || "Three starter fracture passes from the loaded source.",
      buffer,
      channels,
      tags,
      bestUse: role.bestUse || (role.key === "shard-drift"
        ? "Atmospheric fills, reverse accents, and broken intros."
        : role.key === "glass-loop"
          ? "Rhythmic loops, repeating transitions, and pulsing beds."
          : "Impacts, crushed textures, and smeared one-shot layers."),
      textureLabel: controls.texture > 0.2 ? "Grittier" : controls.texture < -0.2 ? "Cleaner" : "Balanced",
      description: buildVariantDescription(role, controls, mode),
      downloadName: `${state.sourceName.replace(/\.[^.]+$/, "")}-${role.key}.wav`,
    };
  });

  state.lastGenerationMode = mode;
  renderVariants(variants);
  const sourceFit = sourceFitMessage(state.analysis);
  updateStatus(
    sourceFit
      ? `${mode === "pro" ? "32 fractured audio variations generated." : "3 fractured audio variations generated."} ${sourceFit}`
      : mode === "pro"
        ? "32 fractured audio variations generated. Expand a group, preview renders, or download the full ZIP."
        : "3 fractured audio variations generated. Preview or download the one that feels right.",
  );
  setGenerateLoadingState(false, mode);
}

async function loadAudioFile(file) {
  if (!file) {
    return;
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    resetLoadedState();
    showUploadMessage("File too large. Please use an audio file smaller than 10.0 MB.");
    return;
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const context = createAudioContext();
    const audioBuffer = await context.decodeAudioData(arrayBuffer.slice(0));

    state.sourceBuffer = audioBuffer;
    state.sourceName = file.name;
    state.analysis = analyzeAudio(audioBuffer);
    state.variants = [];

    elements.fileName.textContent = file.name;
    elements.fileDuration.textContent = formatSeconds(audioBuffer.duration);
    elements.fileSampleRate.textContent = `${audioBuffer.sampleRate} Hz`;
    elements.fileChannels.textContent = String(audioBuffer.numberOfChannels);

    drawWaveform(audioBuffer);
    renderAnalysis();
    renderVariants([]);
    showUploadMessage("");
    const sourceFit = sourceFitMessage(state.analysis);
    updateStatus(
      sourceFit
        ? `Source loaded. ${sourceFit}`
        : state.suiteUnlocked
          ? "Source loaded. Generate 3 free variations or build the 32-audio Pro pack."
          : "Source loaded. Adjust the controls, then generate 3 fractured variations.",
    );
    setReady(true);
  } catch (_error) {
    resetLoadedState();
    showUploadMessage("Unsupported or unreadable audio file. Please use a supported audio file under 10 MB.");
  }
}

function bindDropZone() {
  const prevent = (event) => {
    event.preventDefault();
    event.stopPropagation();
  };

  ["dragenter", "dragover"].forEach((eventName) => {
    elements.waveformPanel.addEventListener(eventName, (event) => {
      prevent(event);
      elements.waveformPanel.classList.add("is-drop-active");
    });
  });

  ["dragleave", "drop"].forEach((eventName) => {
    elements.waveformPanel.addEventListener(eventName, (event) => {
      prevent(event);
      elements.waveformPanel.classList.remove("is-drop-active");
    });
  });

  elements.waveformPanel.addEventListener("drop", (event) => {
    const [file] = event.dataTransfer?.files || [];
    if (file) {
      loadAudioFile(file);
    }
  });
}

function renderSuiteState() {
  elements.suitePanel.classList.toggle("is-unlocked", state.suiteUnlocked);
  elements.suiteActions.hidden = state.suiteUnlocked;
  elements.suiteUnlock.hidden = true;
  elements.suiteActive.hidden = !state.suiteUnlocked;
  elements.suiteToggle?.setAttribute("aria-expanded", "false");
  setProControlsEnabled(state.suiteUnlocked);
  if (elements.generatePack) {
    elements.generatePack.disabled = !state.suiteUnlocked || !state.sourceBuffer || state.isGenerating;
  }
  if (elements.downloadPack) {
    elements.downloadPack.disabled = state.isGenerating || state.lastGenerationMode !== "pro" || state.variants.length !== PRO_VARIANT_COUNT;
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
  updateStatus(state.sourceBuffer ? "Kreativ Sound Tools is active in this browser. Generate the 32-audio pack when ready." : "Kreativ Sound Tools is active in this browser.");
}

elements.fileInput.addEventListener("change", (event) => {
  const [file] = event.target.files || [];
  if (file) {
    loadAudioFile(file);
  }
});

elements.fractureRange.addEventListener("input", () => {
  updateControlLabels();
  renderAnalysis();
});
elements.spaceRange.addEventListener("input", () => {
  updateControlLabels();
  renderAnalysis();
});
elements.textureRange.addEventListener("input", () => {
  updateControlLabels();
  renderAnalysis();
});
elements.brokenRange.addEventListener("input", () => {
  updateControlLabels();
  renderAnalysis();
});
elements.wetRange.addEventListener("input", () => {
  updateControlLabels();
  renderAnalysis();
});
elements.washRange.addEventListener("input", () => {
  updateControlLabels();
  renderAnalysis();
});
elements.playOriginal.addEventListener("click", () => {
  if (state.sourceBuffer) {
    playBuffer(state.sourceBuffer);
  }
});
elements.stopPlayback.addEventListener("click", stopPlayback);
elements.generateButton.addEventListener("click", () => generateVariants("free"));
elements.generatePack?.addEventListener("click", () => generateVariants("pro"));
elements.downloadPack?.addEventListener("click", downloadVariantPack);
elements.suiteToggle?.addEventListener("click", toggleSuiteUnlock);
elements.suiteUnlockButton?.addEventListener("click", handleSuiteUnlock);

updateControlLabels();
resetLoadedState();
bindDropZone();
state.suiteUnlocked = window.localStorage.getItem(SUITE_UNLOCK_STORAGE_KEY) === "1";
renderSuiteState();

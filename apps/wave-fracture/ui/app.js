const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
const GENERATE_DELAY_MS = 520;
const VARIANT_ROLES = [
  { key: "shard-drift", label: "Shard Drift", tag: "Closest", amount: 0.85 },
  { key: "glass-loop", label: "Glass Loop", tag: "Bolder", amount: 1.05 },
  { key: "crushed-bloom", label: "Crushed Bloom", tag: "Wilder", amount: 1.3 },
];

const state = {
  audioContext: null,
  sourceBuffer: null,
  currentSource: null,
  sourceName: "",
  analysis: null,
  variants: [],
  isGenerating: false,
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
  playOriginal: document.querySelector("#play-original"),
  stopPlayback: document.querySelector("#stop-playback"),
  generateButton: document.querySelector("#generate-button"),
  generateButtonLabel: document.querySelector("#generate-button .button-label"),
  status: document.querySelector("#status"),
  analysisMetrics: document.querySelector("#analysis-metrics"),
  profileMetrics: document.querySelector("#profile-metrics"),
  variantList: document.querySelector("#variant-list"),
  emailCaptureForm: document.querySelector("#email-capture-form"),
  emailCaptureInput: document.querySelector("#email-capture-input"),
  emailCaptureNote: document.querySelector("#email-capture-note"),
};

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
}

function setReady(ready) {
  elements.playOriginal.disabled = !ready;
  elements.stopPlayback.disabled = !ready;
  elements.generateButton.disabled = !ready || state.isGenerating;
}

function setGenerateLoadingState(isLoading) {
  state.isGenerating = isLoading;
  elements.generateButton.classList.toggle("is-loading", isLoading);
  elements.generateButtonLabel.textContent = isLoading ? "Fracturing audio..." : "Generate Variations";
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
    { label: "Output", value: "3 Variations" },
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

function renderVariantBuffer(sourceBuffer, role, controls) {
  const channels = createEmptyChannels(sourceBuffer.numberOfChannels, sourceBuffer.length);
  const sliceMs = lerp(28, 220, controls.fracture * role.amount);
  const sliceLength = Math.max(128, Math.floor((sliceMs / 1000) * sourceBuffer.sampleRate));
  const delaySamples = Math.max(1, Math.floor(sourceBuffer.sampleRate * lerp(0.06, 0.28, Math.max(0, controls.space))));
  const bitDepthSteps = Math.round(lerp(1024, 24, Math.max(0, controls.texture)));
  const jitterDepth = Math.floor(sliceLength * lerp(0.04, 0.8, controls.fracture * role.amount));
  const rng = createRng(hashString(`${state.sourceName}:${role.key}:${elements.fractureRange.value}:${elements.spaceRange.value}:${elements.textureRange.value}`));

  for (let channel = 0; channel < sourceBuffer.numberOfChannels; channel += 1) {
    const source = sourceBuffer.getChannelData(channel);
    const output = channels[channel];

    for (let start = 0; start < source.length; start += sliceLength) {
      const remaining = Math.min(sliceLength, source.length - start);
      const jitter = Math.floor((rng() * 2 - 1) * jitterDepth);
      const sourceStart = clamp(start + jitter, 0, Math.max(0, source.length - remaining));
      const shouldReverse =
        role.key === "shard-drift"
          ? rng() < lerp(0.08, 0.32, controls.fracture)
          : role.key === "glass-loop"
            ? rng() < lerp(0.16, 0.44, controls.fracture)
            : rng() < lerp(0.1, 0.28, controls.fracture);

      let outputStart = start;
      if (role.key === "glass-loop") {
        outputStart = clamp(start + Math.floor((rng() * 2 - 1) * sliceLength * 0.25), 0, Math.max(0, output.length - remaining));
      }

      copySliceWithFade(source, output, sourceStart, remaining, outputStart, shouldReverse);

      if (role.key === "glass-loop" && rng() < 0.55) {
        const repeatStart = clamp(outputStart + Math.floor(sliceLength * 0.35), 0, Math.max(0, output.length - remaining));
        copySliceWithFade(source, output, sourceStart, remaining, repeatStart, false);
      }
    }

    for (let i = 0; i < output.length; i += 1) {
      let sample = output[i];

      if (role.key === "crushed-bloom") {
        sample = applyBitCrush(sample, bitDepthSteps);
        if (i > delaySamples) {
          sample += output[i - delaySamples] * lerp(0.08, 0.35, controls.space * role.amount);
        }
      } else if (role.key === "glass-loop") {
        if (i > delaySamples) {
          sample += output[i - delaySamples] * lerp(0.04, 0.22, Math.max(0, controls.space));
        }
      } else {
        if (i > delaySamples) {
          sample += output[i - delaySamples] * lerp(0.02, 0.12, Math.max(0, controls.space));
        }
      }

      const grit = Math.max(0, controls.texture);
      if (grit > 0 && role.key !== "crushed-bloom") {
        sample = sample * (1 + grit * 0.25);
        sample = Math.tanh(sample * (1 + grit * 1.6));
      } else if (controls.texture < 0) {
        sample *= lerp(1, 0.8, Math.abs(controls.texture));
      }

      output[i] = clamp(sample);
    }
  }

  if (sourceBuffer.numberOfChannels === 2 && controls.space !== 0) {
    const left = channels[0];
    const right = channels[1];
    const width = controls.space;
    for (let i = 0; i < left.length; i += 1) {
      const mid = (left[i] + right[i]) * 0.5;
      const side = (left[i] - right[i]) * 0.5 * (1 + width * 0.6);
      left[i] = clamp(mid + side);
      right[i] = clamp(mid - side);
    }
  }

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

function renderVariants(variants) {
  state.variants = variants;
  const panel = document.querySelector("#results-panel");
  panel.classList.toggle("has-results", variants.length > 0);
  if (!variants.length) {
    elements.variantList.innerHTML = `<p class="empty-state">Choose a source audio file, then click <strong>Generate Variations</strong> to create 3 fractured audio exports.</p>`;
    return;
  }

  elements.variantList.innerHTML = "";
  for (const variant of variants) {
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
      anchor.download = `${state.sourceName.replace(/\.[^.]+$/, "")}-${variant.role.key}.wav`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    });
    elements.variantList.appendChild(card);
  }
}

function buildVariantDescription(role, controls) {
  const descriptors = [];
  if (controls.fracture > 0.55) descriptors.push("heavier slice disruption");
  else descriptors.push("lighter slice movement");

  if (controls.texture > 0.2) descriptors.push("extra grit");
  if (controls.texture < -0.2) descriptors.push("smoother edges");
  if (controls.space > 0.2) descriptors.push("wider tail");
  if (controls.space < -0.2) descriptors.push("drier image");

  return `${role.label} with ${descriptors.join(", ")}.`;
}

async function generateVariants() {
  if (!state.sourceBuffer) {
    return;
  }

  setGenerateLoadingState(true);
  updateStatus("Fracturing the source into 3 new audio directions...");
  await new Promise((resolve) => window.setTimeout(resolve, GENERATE_DELAY_MS));

  const controls = currentControls();
  const variants = VARIANT_ROLES.map((role) => {
    const { buffer, channels } = renderVariantBuffer(state.sourceBuffer, role, controls);
    const tags = [
      role.label,
      controls.fracture > 0.55 ? "High fracture" : "Controlled fracture",
      controls.texture > 0.2 ? "Grit" : controls.texture < -0.2 ? "Smooth" : "Balanced",
      controls.space > 0.2 ? "Wide" : controls.space < -0.2 ? "Dry" : "Centered",
    ];
    return {
      role,
      buffer,
      channels,
      tags,
      textureLabel: controls.texture > 0.2 ? "Grittier" : controls.texture < -0.2 ? "Cleaner" : "Balanced",
      description: buildVariantDescription(role, controls),
    };
  });

  renderVariants(variants);
  updateStatus("3 fractured audio variations generated. Preview or download the one that feels right.");
  setGenerateLoadingState(false);
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
    updateStatus("Source loaded. Adjust the controls, then generate 3 fractured variations.");
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

function handleEmailCaptureSubmit() {
  elements.emailCaptureNote.textContent = "Submitting...";
  window.setTimeout(() => {
    elements.emailCaptureNote.textContent = "Check your inbox to confirm.";
    elements.emailCaptureInput.value = "";
  }, 400);
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
elements.playOriginal.addEventListener("click", () => {
  if (state.sourceBuffer) {
    playBuffer(state.sourceBuffer);
  }
});
elements.stopPlayback.addEventListener("click", stopPlayback);
elements.generateButton.addEventListener("click", generateVariants);
elements.emailCaptureForm.addEventListener("submit", handleEmailCaptureSubmit);

updateControlLabels();
resetLoadedState();
bindDropZone();

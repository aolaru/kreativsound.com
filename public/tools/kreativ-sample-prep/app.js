"use strict";

const state = {
  audioContext: null,
  files: [],
  selectedId: null,
  nextId: 1,
  previewMode: "original",
  playbackSource: null,
  playbackStartedAt: 0,
  playbackOffset: 0,
  isPlaying: false,
  animationFrame: null,
  trimDragHandle: null,
  suppressNextWaveformClick: false,
};

const elements = {
  fileInput: document.querySelector("#file-input"),
  dropZone: document.querySelector("#drop-zone"),
  waveformEmptyButton: document.querySelector("#waveform-empty-button"),
  fileList: document.querySelector("#file-list"),
  fileCount: document.querySelector("#file-count"),
  statusMessage: document.querySelector("#status-message"),
  waveform: document.querySelector("#waveform"),
  progressFill: document.querySelector("#progress-fill"),
  playPauseButton: document.querySelector("#play-pause-button"),
  stopButton: document.querySelector("#stop-button"),
  timeReadout: document.querySelector("#time-readout"),
  previewModeLabel: document.querySelector("#preview-mode-label"),
  metaName: document.querySelector("#meta-name"),
  metaDuration: document.querySelector("#meta-duration"),
  metaSampleRate: document.querySelector("#meta-sample-rate"),
  metaChannels: document.querySelector("#meta-channels"),
  metaPeak: document.querySelector("#meta-peak"),
  metaClipping: document.querySelector("#meta-clipping"),
  metaRms: document.querySelector("#meta-rms"),
  metaDcOffset: document.querySelector("#meta-dc-offset"),
  metaStereoBalance: document.querySelector("#meta-stereo-balance"),
  trimStartTime: document.querySelector("#trim-start-time"),
  trimEndTime: document.querySelector("#trim-end-time"),
  manualTrimReset: document.querySelector("#manual-trim-reset"),
  trimSilence: document.querySelector("#trim-silence"),
  trimThreshold: document.querySelector("#trim-threshold"),
  trimThresholdValue: document.querySelector("#trim-threshold-value"),
  fadeEnabled: document.querySelector("#fade-enabled"),
  fadeMs: document.querySelector("#fade-ms"),
  fadeMsValue: document.querySelector("#fade-ms-value"),
  normalizeEnabled: document.querySelector("#normalize-enabled"),
  targetPeak: document.querySelector("#target-peak"),
  targetPeakValue: document.querySelector("#target-peak-value"),
  detectClipping: document.querySelector("#detect-clipping"),
  applyButton: document.querySelector("#apply-button"),
  resetPreviewButton: document.querySelector("#reset-preview-button"),
  analysisWarnings: document.querySelector("#analysis-warnings"),
  reportTrimmed: document.querySelector("#report-trimmed"),
  reportFade: document.querySelector("#report-fade"),
  reportNormalize: document.querySelector("#report-normalize"),
  reportManualTrim: document.querySelector("#report-manual-trim"),
  reportOutputPeak: document.querySelector("#report-output-peak"),
  exportButton: document.querySelector("#export-button"),
  exportZipButton: document.querySelector("#export-zip-button"),
  namingTemplate: document.querySelector("#naming-template"),
  packName: document.querySelector("#pack-name"),
  bitDepth: document.querySelector("#bit-depth"),
  sampleRateMode: document.querySelector("#sample-rate-mode"),
  channelMode: document.querySelector("#channel-mode"),
};

function getAudioContext() {
  if (!state.audioContext) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    state.audioContext = new AudioContextClass();
  }
  return state.audioContext;
}

function setStatus(message, type = "neutral") {
  elements.statusMessage.textContent = message;
  elements.statusMessage.classList.toggle("is-error", type === "error");
  elements.statusMessage.classList.toggle("is-success", type === "success");
}

function formatDuration(seconds) {
  if (!Number.isFinite(seconds)) {
    return "0:00.000";
  }
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds - minutes * 60;
  return `${minutes}:${remainder.toFixed(3).padStart(6, "0")}`;
}

function formatDb(value) {
  if (!Number.isFinite(value)) {
    return "-inf dBFS";
  }
  return `${value.toFixed(1)} dBFS`;
}

function dbToGain(db) {
  return Math.pow(10, db / 20);
}

function gainToDb(gain) {
  if (gain <= 0) {
    return -Infinity;
  }
  return 20 * Math.log10(gain);
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function isLikelyWav(file) {
  const type = file.type.toLowerCase();
  return file.name.toLowerCase().endsWith(".wav") || type === "audio/wav" || type === "audio/wave" || type === "audio/x-wav";
}

function getSelectedFile() {
  return state.files.find((file) => file.id === state.selectedId) || null;
}

function getActiveBuffer(file = getSelectedFile()) {
  if (!file) {
    return null;
  }
  if (state.previewMode === "processed" && file.processedBuffer) {
    return file.processedBuffer;
  }
  return file.audioBuffer;
}

function getActiveAnalysis(file = getSelectedFile()) {
  if (!file) {
    return null;
  }
  if (state.previewMode === "processed" && file.processedAnalysis) {
    return file.processedAnalysis;
  }
  return file.originalAnalysis;
}

function getSettings() {
  const fadeValue = Number(elements.fadeMs.value);
  const targetPeakValue = Number(elements.targetPeak.value);
  const trimThresholdValue = Number(elements.trimThreshold.value);
  const fadeMs = clamp(Number.isFinite(fadeValue) ? fadeValue : 10, 0, 500);
  const targetPeakDb = clamp(Number.isFinite(targetPeakValue) ? targetPeakValue : -1, -24, 0);
  const trimThresholdDb = clamp(Number.isFinite(trimThresholdValue) ? trimThresholdValue : -60, -80, -20);
  return {
    trimSilence: elements.trimSilence.checked,
    trimThresholdDb,
    fadeEnabled: elements.fadeEnabled.checked,
    fadeMs,
    normalizeEnabled: elements.normalizeEnabled.checked,
    targetPeakDb,
    detectClipping: elements.detectClipping.checked,
  };
}

function getExportSettings() {
  return {
    bitDepth: elements.bitDepth.value,
    sampleRateMode: elements.sampleRateMode.value,
    channelMode: elements.channelMode.value,
    namingTemplate: elements.namingTemplate.value.trim() || "{name}_clean",
    packName: sanitizeFileBaseName(elements.packName.value || "kreativ-sample-prep-pack"),
  };
}

function updateControlLabels() {
  const settings = getSettings();
  elements.trimThresholdValue.textContent = `${settings.trimThresholdDb} dB`;
  elements.fadeMs.value = settings.fadeMs;
  elements.fadeMsValue.textContent = `${settings.fadeMs} ms`;
  elements.targetPeak.value = settings.targetPeakDb;
  elements.targetPeakValue.textContent = `${settings.targetPeakDb.toFixed(1).replace(".0", "")} dB`;
}

function clearProcessedPreview(reason = "") {
  const selected = getSelectedFile();
  if (!selected) {
    return;
  }
  selected.processedBuffer = null;
  selected.processedAnalysis = null;
  selected.processReport = null;
  selected.waveformCache.processed = null;
  state.previewMode = "original";
  stopPlayback();
  if (reason) {
    setStatus(reason);
  }
  updateUi();
}

async function decodeFile(file) {
  const audioContext = getAudioContext();
  const arrayBuffer = await file.arrayBuffer();
  return audioContext.decodeAudioData(arrayBuffer.slice(0));
}

async function loadFiles(fileList) {
  const files = Array.from(fileList);
  if (!files.length) {
    return;
  }

  const wavFiles = files.filter(isLikelyWav);
  const rejectedCount = files.length - wavFiles.length;

  if (!wavFiles.length) {
    setStatus("No WAV files found. This POC currently accepts WAV files only.", "error");
    return;
  }

  setStatus(`Decoding ${wavFiles.length} WAV ${wavFiles.length === 1 ? "file" : "files"} locally...`);

  let loadedCount = 0;
  for (const file of wavFiles) {
    try {
      const audioBuffer = await decodeFile(file);
      const sampleFile = {
        id: state.nextId,
        file,
        name: file.name,
        size: file.size,
        audioBuffer,
        originalAnalysis: analyzeBuffer(audioBuffer),
        processedBuffer: null,
        processedAnalysis: null,
        processReport: null,
        trimStartRatio: 0,
        trimEndRatio: 1,
        batchStatus: "ready",
        waveformCache: {
          original: null,
          processed: null,
        },
      };
      state.nextId += 1;
      state.files.push(sampleFile);
      loadedCount += 1;

      if (!state.selectedId) {
        selectFile(sampleFile.id);
      }
    } catch (error) {
      console.error(error);
      setStatus(`Could not decode "${file.name}". Try a standard PCM WAV file.`, "error");
    }
  }

  if (state.files.length && !state.selectedId) {
    selectFile(state.files[0].id);
  }

  const rejectedMessage = rejectedCount ? ` ${rejectedCount} non-WAV ${rejectedCount === 1 ? "file was" : "files were"} skipped.` : "";
  if (loadedCount) {
    setStatus(`Loaded ${loadedCount} WAV ${loadedCount === 1 ? "file" : "files"}.${rejectedMessage}`, "success");
  }

  elements.fileInput.value = "";
  updateUi();
}

function selectFile(id) {
  stopPlayback();
  state.selectedId = id;
  state.previewMode = "original";
  state.playbackOffset = 0;
  updateUi();
}

function renderFileList() {
  elements.fileList.innerHTML = "";

  if (!state.files.length) {
    const empty = document.createElement("li");
    empty.className = "empty-state";
    empty.textContent = "No files loaded yet.";
    elements.fileList.appendChild(empty);
    elements.fileCount.textContent = "0 files";
    return;
  }

  elements.fileCount.textContent = `${state.files.length} ${state.files.length === 1 ? "file" : "files"}`;

  for (const file of state.files) {
    const item = document.createElement("li");
    const button = document.createElement("button");
    button.type = "button";
    button.classList.toggle("is-selected", file.id === state.selectedId);
    button.addEventListener("click", () => selectFile(file.id));

    const title = document.createElement("span");
    title.className = "file-title";
    title.textContent = file.name;

    const meta = document.createElement("span");
    meta.className = "file-meta";
    const statusLabel = file.batchStatus === "processed" ? "processed" : file.batchStatus;
    meta.textContent = `${formatDuration(file.audioBuffer.duration)} | ${file.audioBuffer.sampleRate.toLocaleString()} Hz | ${statusLabel}`;

    button.append(title, meta);
    item.appendChild(button);
    elements.fileList.appendChild(item);
  }
}

function analyzeBuffer(buffer) {
  let peak = 0;
  let clippedSamples = 0;
  let firstClipTime = null;
  let sumSquares = 0;
  let sampleTotal = 0;
  let dcSum = 0;
  const channelRms = [];

  for (let channel = 0; channel < buffer.numberOfChannels; channel += 1) {
    const data = buffer.getChannelData(channel);
    let channelSumSquares = 0;
    for (let index = 0; index < data.length; index += 1) {
      const sample = data[index];
      const value = Math.abs(sample);
      const square = sample * sample;
      if (value > peak) {
        peak = value;
      }
      if (value >= 0.999) {
        clippedSamples += 1;
        if (firstClipTime === null) {
          firstClipTime = index / buffer.sampleRate;
        }
      }
      channelSumSquares += square;
      sumSquares += square;
      dcSum += sample;
      sampleTotal += 1;
    }
    channelRms.push(Math.sqrt(channelSumSquares / Math.max(1, data.length)));
  }

  const rms = Math.sqrt(sumSquares / Math.max(1, sampleTotal));
  const dcOffset = dcSum / Math.max(1, sampleTotal);
  const silenceThreshold = dbToGain(-60);
  const trimBounds = findTrimBounds(buffer, silenceThreshold);
  const leadingSilenceSeconds = trimBounds.skipped ? buffer.duration : trimBounds.start / buffer.sampleRate;
  const trailingSilenceSeconds = trimBounds.skipped
    ? 0
    : (buffer.length - trimBounds.endExclusive) / buffer.sampleRate;
  const stereoBalanceDb = buffer.numberOfChannels >= 2
    ? gainToDb((channelRms[0] || 0.000001) / (channelRms[1] || 0.000001))
    : null;

  return {
    peak,
    peakDb: gainToDb(peak),
    rms,
    rmsDb: gainToDb(rms),
    dcOffset,
    stereoBalanceDb,
    leadingSilenceSeconds,
    trailingSilenceSeconds,
    clippedSamples,
    firstClipTime,
  };
}

function copyBufferRange(buffer, startSample, endSample) {
  const audioContext = getAudioContext();
  const start = clamp(Math.floor(startSample), 0, buffer.length);
  const end = clamp(Math.floor(endSample), start + 1, buffer.length);
  const length = Math.max(1, end - start);
  const output = audioContext.createBuffer(buffer.numberOfChannels, length, buffer.sampleRate);

  for (let channel = 0; channel < buffer.numberOfChannels; channel += 1) {
    const source = buffer.getChannelData(channel);
    const target = output.getChannelData(channel);
    target.set(source.subarray(start, end));
  }

  return output;
}

function sampleCrossesThreshold(buffer, sampleIndex, threshold) {
  for (let channel = 0; channel < buffer.numberOfChannels; channel += 1) {
    if (Math.abs(buffer.getChannelData(channel)[sampleIndex]) > threshold) {
      return true;
    }
  }
  return false;
}

function findTrimBounds(buffer, threshold) {
  let start = 0;
  let end = buffer.length - 1;

  while (start < buffer.length && !sampleCrossesThreshold(buffer, start, threshold)) {
    start += 1;
  }

  while (end > start && !sampleCrossesThreshold(buffer, end, threshold)) {
    end -= 1;
  }

  if (start >= buffer.length) {
    return {
      start: 0,
      endExclusive: buffer.length,
      skipped: true,
    };
  }

  return {
    start,
    endExclusive: end + 1,
    skipped: false,
  };
}

function applyFade(buffer, fadeMs) {
  const fadeSamples = Math.min(Math.round((fadeMs / 1000) * buffer.sampleRate), Math.floor(buffer.length / 2));
  if (fadeSamples < 2) {
    return 0;
  }

  for (let channel = 0; channel < buffer.numberOfChannels; channel += 1) {
    const data = buffer.getChannelData(channel);
    for (let index = 0; index < fadeSamples; index += 1) {
      const amount = index / (fadeSamples - 1);
      data[index] *= amount;
      data[data.length - 1 - index] *= amount;
    }
  }

  return fadeSamples;
}

function applyGain(buffer, gain) {
  for (let channel = 0; channel < buffer.numberOfChannels; channel += 1) {
    const data = buffer.getChannelData(channel);
    for (let index = 0; index < data.length; index += 1) {
      data[index] *= gain;
    }
  }
}

function getManualTrimRange(file) {
  if (!file) {
    return { startRatio: 0, endRatio: 1 };
  }
  return {
    startRatio: clamp(file.trimStartRatio ?? 0, 0, 0.999),
    endRatio: clamp(file.trimEndRatio ?? 1, 0.001, 1),
  };
}

function processAudioBuffer(inputBuffer, settings = getSettings(), trimRange = { startRatio: 0, endRatio: 1 }) {
  const startRatio = clamp(trimRange.startRatio ?? 0, 0, 0.999);
  const endRatio = clamp(trimRange.endRatio ?? 1, startRatio + 0.001, 1);
  const manualStartSample = Math.floor(startRatio * inputBuffer.length);
  const manualEndSample = Math.max(manualStartSample + 1, Math.ceil(endRatio * inputBuffer.length));
  let workingBuffer = copyBufferRange(inputBuffer, manualStartSample, manualEndSample);
  const report = {
    manualTrimmedSamples: inputBuffer.length - workingBuffer.length,
    trimmedSamples: 0,
    trimSkipped: false,
    fadeSamples: 0,
    normalizeGain: 1,
    outputPeakDb: null,
  };

  // Trim silence by scanning from each edge until any channel crosses the amplitude threshold.
  if (settings.trimSilence) {
    const threshold = dbToGain(settings.trimThresholdDb);
    const bounds = findTrimBounds(workingBuffer, threshold);
    report.trimSkipped = bounds.skipped;
    report.trimmedSamples = workingBuffer.length - (bounds.endExclusive - bounds.start);
    if (!bounds.skipped && report.trimmedSamples > 0) {
      workingBuffer = copyBufferRange(workingBuffer, bounds.start, bounds.endExclusive);
    }
  }

  // Apply a short linear fade after trimming so exported samples do not click at the boundaries.
  if (settings.fadeEnabled && settings.fadeMs > 0) {
    report.fadeSamples = applyFade(workingBuffer, settings.fadeMs);
  }

  // Peak normalization uses the highest absolute sample value across every channel.
  if (settings.normalizeEnabled) {
    const analysis = analyzeBuffer(workingBuffer);
    const targetPeak = dbToGain(settings.targetPeakDb);
    if (analysis.peak > 0) {
      report.normalizeGain = targetPeak / analysis.peak;
      applyGain(workingBuffer, report.normalizeGain);
    }
  }

  report.outputPeakDb = analyzeBuffer(workingBuffer).peakDb;
  return {
    buffer: workingBuffer,
    report,
    analysis: analyzeBuffer(workingBuffer),
  };
}

function buildWaveformPeaks(buffer, width) {
  const pointCount = Math.max(1, Math.floor(width));
  const samplesPerPoint = Math.max(1, Math.floor(buffer.length / pointCount));
  const peaks = new Array(pointCount);

  for (let point = 0; point < pointCount; point += 1) {
    const start = point * samplesPerPoint;
    const end = point === pointCount - 1 ? buffer.length : Math.min(buffer.length, start + samplesPerPoint);
    let min = 1;
    let max = -1;

    for (let channel = 0; channel < buffer.numberOfChannels; channel += 1) {
      const data = buffer.getChannelData(channel);
      for (let index = start; index < end; index += 1) {
        const sample = data[index];
        if (sample < min) {
          min = sample;
        }
        if (sample > max) {
          max = sample;
        }
      }
    }

    peaks[point] = {
      min: min === 1 ? 0 : min,
      max: max === -1 ? 0 : max,
    };
  }

  return {
    width: pointCount,
    peaks,
  };
}

function getWaveformPeaks(file, buffer, mode, width) {
  const cache = file.waveformCache[mode];
  const pointWidth = Math.max(1, Math.floor(width));
  if (cache && cache.width === pointWidth) {
    return cache.peaks;
  }

  const built = buildWaveformPeaks(buffer, pointWidth);
  file.waveformCache[mode] = built;
  return built.peaks;
}

function drawEmptyWaveform() {
  const canvas = elements.waveform;
  const dpr = window.devicePixelRatio || 1;
  const width = canvas.clientWidth || canvas.width;
  const height = canvas.clientHeight || canvas.height;
  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(height * dpr);

  const context = canvas.getContext("2d");
  context.setTransform(dpr, 0, 0, dpr, 0, 0);
  context.clearRect(0, 0, width, height);
  context.fillStyle = "#111624";
  context.fillRect(0, 0, width, height);
  context.strokeStyle = "rgba(255,255,255,0.08)";
  context.lineWidth = 1;

  for (let line = 0; line < 8; line += 1) {
    const x = (line / 7) * width;
    context.beginPath();
    context.moveTo(x, 0);
    context.lineTo(x, height);
    context.stroke();
  }

  context.strokeStyle = "rgba(255,255,255,0.16)";
  context.beginPath();
  context.moveTo(0, height / 2);
  context.lineTo(width, height / 2);
  context.stroke();
}

function drawWaveform() {
  const file = getSelectedFile();
  const buffer = getActiveBuffer(file);
  if (!file || !buffer) {
    drawEmptyWaveform();
    return;
  }

  const canvas = elements.waveform;
  const dpr = window.devicePixelRatio || 1;
  const width = canvas.clientWidth || canvas.width;
  const height = canvas.clientHeight || canvas.height;
  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(height * dpr);

  const context = canvas.getContext("2d");
  context.setTransform(dpr, 0, 0, dpr, 0, 0);
  context.clearRect(0, 0, width, height);

  const mode = state.previewMode === "processed" && file.processedBuffer ? "processed" : "original";
  const peaks = getWaveformPeaks(file, buffer, mode, width);
  const center = height / 2;
  const verticalScale = height * 0.43;

  context.fillStyle = "#111624";
  context.fillRect(0, 0, width, height);

  context.strokeStyle = "rgba(255,255,255,0.06)";
  context.lineWidth = 1;
  for (let line = 0; line < 8; line += 1) {
    const x = (line / 7) * width;
    context.beginPath();
    context.moveTo(x, 0);
    context.lineTo(x, height);
    context.stroke();
  }

  context.strokeStyle = "rgba(255,255,255,0.14)";
  context.beginPath();
  context.moveTo(0, center);
  context.lineTo(width, center);
  context.stroke();

  context.strokeStyle = state.previewMode === "processed" ? "#52f0aa" : "#4a4aff";
  context.lineWidth = 1.5;
  context.beginPath();

  for (let x = 0; x < peaks.length; x += 1) {
    const peak = peaks[x];
    const yTop = center - peak.max * verticalScale;
    const yBottom = center - peak.min * verticalScale;
    context.moveTo(x + 0.5, yTop);
    context.lineTo(x + 0.5, yBottom);
  }

  context.stroke();

  const trimRange = getManualTrimRange(file);
  const startX = trimRange.startRatio * width;
  const endX = trimRange.endRatio * width;
  context.fillStyle = "rgba(255, 51, 102, 0.18)";
  context.fillRect(0, 0, startX, height);
  context.fillRect(endX, 0, width - endX, height);
  context.fillStyle = "rgba(74, 74, 255, 0.12)";
  context.fillRect(startX, 0, Math.max(0, endX - startX), height);
  context.strokeStyle = "#4a4aff";
  context.lineWidth = 3;
  context.beginPath();
  context.moveTo(startX, 0);
  context.lineTo(startX, height);
  context.moveTo(endX, 0);
  context.lineTo(endX, height);
  context.stroke();

  context.fillStyle = "#ffffff";
  context.fillRect(startX - 4, 10, 8, 34);
  context.fillRect(endX - 4, 10, 8, 34);

  const progress = buffer.duration > 0 ? getPlaybackPosition() / buffer.duration : 0;
  const progressX = clamp(progress, 0, 1) * width;
  context.fillStyle = "rgba(255, 51, 102, 0.16)";
  context.fillRect(0, 0, progressX, height);

  context.strokeStyle = "#ff3366";
  context.lineWidth = 2;
  context.beginPath();
  context.moveTo(progressX, 0);
  context.lineTo(progressX, height);
  context.stroke();
}

function getPlaybackPosition() {
  const buffer = getActiveBuffer();
  if (!buffer) {
    return 0;
  }
  if (!state.isPlaying) {
    return clamp(state.playbackOffset, 0, buffer.duration);
  }
  const elapsed = getAudioContext().currentTime - state.playbackStartedAt;
  return clamp(state.playbackOffset + elapsed, 0, buffer.duration);
}

function updateProgressUi() {
  const buffer = getActiveBuffer();
  const duration = buffer ? buffer.duration : 0;
  const position = getPlaybackPosition();
  const progress = duration > 0 ? (position / duration) * 100 : 0;

  elements.progressFill.style.width = `${clamp(progress, 0, 100)}%`;
  elements.timeReadout.textContent = `${formatDuration(position)} / ${formatDuration(duration)}`;
}

function startAnimationLoop() {
  cancelAnimationFrame(state.animationFrame);

  function tick() {
    updateProgressUi();
    drawWaveform();
    if (state.isPlaying) {
      state.animationFrame = requestAnimationFrame(tick);
    }
  }

  tick();
}

function stopPlayback() {
  if (state.playbackSource) {
    const source = state.playbackSource;
    state.playbackSource = null;
    source.onended = null;
    try {
      source.stop();
    } catch {
      // Source may already have ended.
    }
  }

  state.isPlaying = false;
  state.playbackOffset = 0;
  cancelAnimationFrame(state.animationFrame);
  updateTransportButtons();
  updateProgressUi();
  drawWaveform();
}

function pausePlayback() {
  if (!state.isPlaying) {
    return;
  }

  const position = getPlaybackPosition();
  if (state.playbackSource) {
    const source = state.playbackSource;
    state.playbackSource = null;
    source.onended = null;
    try {
      source.stop();
    } catch {
      // Source may already have ended.
    }
  }

  state.playbackOffset = position;
  state.isPlaying = false;
  cancelAnimationFrame(state.animationFrame);
  updateTransportButtons();
  updateProgressUi();
  drawWaveform();
}

async function playFrom(offset) {
  const buffer = getActiveBuffer();
  if (!buffer) {
    return;
  }

  const audioContext = getAudioContext();
  await audioContext.resume();

  if (state.playbackSource) {
    const oldSource = state.playbackSource;
    state.playbackSource = null;
    oldSource.onended = null;
    try {
      oldSource.stop();
    } catch {
      // Source may already have ended.
    }
  }

  const source = audioContext.createBufferSource();
  const safeOffset = offset >= buffer.duration ? 0 : clamp(offset, 0, buffer.duration);
  source.buffer = buffer;
  source.connect(audioContext.destination);
  source.onended = () => {
    if (state.playbackSource !== source) {
      return;
    }
    state.playbackSource = null;
    state.isPlaying = false;
    state.playbackOffset = 0;
    updateTransportButtons();
    updateProgressUi();
    drawWaveform();
  };

  state.playbackSource = source;
  state.playbackOffset = safeOffset;
  state.playbackStartedAt = audioContext.currentTime;
  state.isPlaying = true;
  source.start(0, safeOffset);
  updateTransportButtons();
  startAnimationLoop();
}

function updateTransportButtons() {
  const hasBuffer = Boolean(getActiveBuffer());
  elements.playPauseButton.disabled = !hasBuffer;
  elements.stopButton.disabled = !hasBuffer;
  elements.playPauseButton.textContent = state.isPlaying ? "Pause" : "Play";
}

function seekToRatio(ratio) {
  const buffer = getActiveBuffer();
  if (!buffer) {
    return;
  }

  const nextOffset = clamp(ratio, 0, 1) * buffer.duration;
  if (state.isPlaying) {
    playFrom(nextOffset);
  } else {
    state.playbackOffset = nextOffset;
    updateProgressUi();
    drawWaveform();
  }
}

function renderMeta() {
  const file = getSelectedFile();
  const buffer = getActiveBuffer(file);
  const analysis = getActiveAnalysis(file);

  if (!file || !buffer || !analysis) {
    elements.metaName.textContent = "No file selected";
    elements.metaDuration.textContent = "-";
    elements.metaSampleRate.textContent = "-";
    elements.metaChannels.textContent = "-";
    elements.metaPeak.textContent = "-";
    elements.metaClipping.textContent = "-";
    elements.metaRms.textContent = "-";
    elements.metaDcOffset.textContent = "-";
    elements.metaStereoBalance.textContent = "-";
    elements.trimStartTime.textContent = "0:00.000";
    elements.trimEndTime.textContent = "0:00.000";
    return;
  }

  const trimRange = getManualTrimRange(file);
  elements.metaName.textContent = file.name;
  elements.metaDuration.textContent = formatDuration(buffer.duration);
  elements.metaSampleRate.textContent = `${buffer.sampleRate.toLocaleString()} Hz`;
  elements.metaChannels.textContent = `${buffer.numberOfChannels}`;
  elements.metaPeak.textContent = formatDb(analysis.peakDb);
  elements.metaClipping.textContent = analysis.clippedSamples ? `${analysis.clippedSamples.toLocaleString()} samples` : "None";
  elements.metaRms.textContent = formatDb(analysis.rmsDb);
  elements.metaDcOffset.textContent = `${analysis.dcOffset.toFixed(4)}`;
  elements.metaStereoBalance.textContent = analysis.stereoBalanceDb === null ? "Mono" : `${analysis.stereoBalanceDb.toFixed(1)} dB L/R`;
  elements.trimStartTime.textContent = formatDuration(trimRange.startRatio * file.audioBuffer.duration);
  elements.trimEndTime.textContent = formatDuration(trimRange.endRatio * file.audioBuffer.duration);
}

function renderWarnings() {
  const file = getSelectedFile();
  const analysis = getActiveAnalysis(file);
  const settings = getSettings();
  elements.analysisWarnings.innerHTML = "";

  if (!file || !analysis) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = "Load a WAV file to see clipping and processing notes.";
    elements.analysisWarnings.appendChild(empty);
    renderReport(null);
    return;
  }

  const notes = [];

  if (settings.detectClipping) {
    if (analysis.clippedSamples > 0) {
      notes.push({
        type: "danger",
        text: `${state.previewMode === "processed" ? "Processed preview" : "Original file"} has ${analysis.clippedSamples.toLocaleString()} samples at or above 0.999 amplitude. First detected near ${formatDuration(analysis.firstClipTime)}.`,
      });
    } else {
      notes.push({
        type: "good",
        text: `${state.previewMode === "processed" ? "Processed preview" : "Original file"} has no clipping at the 0.999 threshold.`,
      });
    }
  } else {
    notes.push({
      type: "note",
      text: "Clipping detection is turned off.",
    });
  }

  if (analysis.rmsDb < -36) {
    notes.push({
      type: "note",
      text: `This file is very quiet overall (${formatDb(analysis.rmsDb)} RMS). Normalization will raise the peak, but ambience may still feel low in a pack preview.`,
    });
  }

  if (Math.abs(analysis.dcOffset) > 0.01) {
    notes.push({
      type: "note",
      text: `DC offset is ${analysis.dcOffset.toFixed(4)}. Consider a future high-pass/DC removal pass for this file.`,
    });
  }

  if (analysis.stereoBalanceDb !== null && Math.abs(analysis.stereoBalanceDb) > 6) {
    notes.push({
      type: "note",
      text: `Stereo balance is ${analysis.stereoBalanceDb.toFixed(1)} dB L/R, so one side is much louder than the other.`,
    });
  }

  if (state.previewMode !== "processed" && (analysis.leadingSilenceSeconds > 0.08 || analysis.trailingSilenceSeconds > 0.08)) {
    notes.push({
      type: "note",
      text: `Detected about ${formatDuration(analysis.leadingSilenceSeconds)} leading and ${formatDuration(analysis.trailingSilenceSeconds)} trailing silence at -60 dB.`,
    });
  }

  if (file.processReport && state.previewMode === "processed") {
    if (file.processReport.trimSkipped) {
      notes.push({
        type: "note",
        text: "Trim silence found no content above the selected threshold, so trimming was skipped.",
      });
    } else if (file.processReport.trimmedSamples > 0) {
      notes.push({
        type: "good",
        text: `Trim removed ${formatDuration(file.processReport.trimmedSamples / file.audioBuffer.sampleRate)} of leading/trailing low-level audio.`,
      });
    }
  }

  if (state.previewMode !== "processed" && file.processedBuffer) {
    notes.push({
      type: "note",
      text: "A processed preview exists. Use Apply processing preview again after changing settings, or export to render the latest settings.",
    });
  }

  for (const note of notes) {
    const item = document.createElement("p");
    item.className = `warning-item is-${note.type}`;
    item.textContent = note.text;
    elements.analysisWarnings.appendChild(item);
  }

  renderReport(state.previewMode === "processed" ? file.processReport : null);
}

function renderReport(report) {
  if (!report) {
    elements.reportTrimmed.textContent = "-";
    elements.reportFade.textContent = "-";
    elements.reportNormalize.textContent = "-";
    elements.reportManualTrim.textContent = "-";
    elements.reportOutputPeak.textContent = "-";
    return;
  }

  elements.reportTrimmed.textContent = report.trimSkipped
    ? "Skipped"
    : formatDuration(report.trimmedSamples / getActiveBuffer().sampleRate);
  elements.reportFade.textContent = report.fadeSamples ? `${report.fadeSamples.toLocaleString()} samples` : "Off";
  elements.reportNormalize.textContent = `${gainToDb(report.normalizeGain).toFixed(1)} dB`;
  elements.reportManualTrim.textContent = formatDuration(report.manualTrimmedSamples / getSelectedFile().audioBuffer.sampleRate);
  elements.reportOutputPeak.textContent = formatDb(report.outputPeakDb);
}

function updateUi() {
  const selected = getSelectedFile();
  const activeBuffer = getActiveBuffer(selected);

  renderFileList();
  renderMeta();
  renderWarnings();
  updateControlLabels();
  updateTransportButtons();
  updateProgressUi();
  drawWaveform();

  elements.waveformEmptyButton.classList.toggle("is-hidden", Boolean(selected));
  elements.applyButton.disabled = !selected;
  elements.resetPreviewButton.disabled = !selected || state.previewMode !== "processed";
  elements.manualTrimReset.disabled = !selected || ((selected.trimStartRatio ?? 0) === 0 && (selected.trimEndRatio ?? 1) === 1);
  elements.exportButton.disabled = !selected;
  elements.exportZipButton.disabled = !state.files.length;
  elements.previewModeLabel.textContent = state.previewMode === "processed" && activeBuffer ? "Processed preview" : "Original";
}

function applyProcessingPreview() {
  const file = getSelectedFile();
  if (!file) {
    return;
  }

  try {
    stopPlayback();
    const result = processAudioBuffer(file.audioBuffer, getSettings(), getManualTrimRange(file));
    file.processedBuffer = result.buffer;
    file.processedAnalysis = result.analysis;
    file.processReport = result.report;
    file.batchStatus = "processed";
    file.waveformCache.processed = null;
    state.previewMode = "processed";
    state.playbackOffset = 0;
    setStatus("Processing preview updated. Export will use these cleanup settings.", "success");
    updateUi();
  } catch (error) {
    console.error(error);
    setStatus("Processing failed. Try a shorter WAV file or less aggressive settings.", "error");
  }
}

function resetPreview() {
  const file = getSelectedFile();
  if (!file) {
    return;
  }
  stopPlayback();
  state.previewMode = "original";
  state.playbackOffset = 0;
  setStatus("Showing the original decoded audio. Export still uses current cleanup settings.");
  updateUi();
}

function sanitizeFileBaseName(name) {
  return (name || "sample")
    .replace(/\.[^.]+$/, "")
    .trim()
    .replace(/[^\w.-]+/g, "_")
    .replace(/^_+|_+$/g, "") || "sample";
}

function makeExportFileName(originalName, index = 1, exportSettings = getExportSettings()) {
  const baseName = sanitizeFileBaseName(originalName);
  const paddedIndex = String(index).padStart(3, "0");
  const templated = exportSettings.namingTemplate
    .replaceAll("{name}", baseName)
    .replaceAll("{index}", paddedIndex)
    .replaceAll("{i}", String(index));
  return `${sanitizeFileBaseName(templated)}.wav`;
}

function writeAscii(view, offset, string) {
  for (let index = 0; index < string.length; index += 1) {
    view.setUint8(offset + index, string.charCodeAt(index));
  }
}

function convertChannelMode(buffer, channelMode) {
  if (channelMode !== "mono" || buffer.numberOfChannels === 1) {
    return buffer;
  }

  const audioContext = getAudioContext();
  const output = audioContext.createBuffer(1, buffer.length, buffer.sampleRate);
  const target = output.getChannelData(0);

  for (let channel = 0; channel < buffer.numberOfChannels; channel += 1) {
    const data = buffer.getChannelData(channel);
    for (let index = 0; index < buffer.length; index += 1) {
      target[index] += data[index] / buffer.numberOfChannels;
    }
  }

  return output;
}

async function resampleBuffer(buffer, sampleRateMode) {
  if (sampleRateMode === "original") {
    return buffer;
  }

  const targetSampleRate = Number(sampleRateMode);
  if (!Number.isFinite(targetSampleRate) || targetSampleRate === buffer.sampleRate) {
    return buffer;
  }

  const length = Math.max(1, Math.round(buffer.duration * targetSampleRate));
  const OfflineContext = window.OfflineAudioContext || window.webkitOfflineAudioContext;
  if (!OfflineContext) {
    setStatus("This browser cannot resample audio offline. Exporting at the original sample rate.", "error");
    return buffer;
  }

  const offlineContext = new OfflineContext(buffer.numberOfChannels, length, targetSampleRate);
  const source = offlineContext.createBufferSource();
  source.buffer = buffer;
  source.connect(offlineContext.destination);
  source.start(0);
  return offlineContext.startRendering();
}

async function prepareExportBuffer(buffer, exportSettings = getExportSettings()) {
  const channelConverted = convertChannelMode(buffer, exportSettings.channelMode);
  return resampleBuffer(channelConverted, exportSettings.sampleRateMode);
}

function encodeWav(buffer, options = {}) {
  const bitDepth = options.bitDepth || "16";
  const isFloat = bitDepth === "32f";
  const channelCount = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const bytesPerSample = bitDepth === "24" ? 3 : 4;
  const pcmBytesPerSample = bitDepth === "16" ? 2 : bytesPerSample;
  const actualBytesPerSample = isFloat ? 4 : pcmBytesPerSample;
  const blockAlign = channelCount * actualBytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = buffer.length * blockAlign;
  const arrayBuffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(arrayBuffer);

  writeAscii(view, 0, "RIFF");
  view.setUint32(4, 36 + dataSize, true);
  writeAscii(view, 8, "WAVE");
  writeAscii(view, 12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, isFloat ? 3 : 1, true);
  view.setUint16(22, channelCount, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, isFloat ? 32 : Number(bitDepth), true);
  writeAscii(view, 36, "data");
  view.setUint32(40, dataSize, true);

  let offset = 44;
  const channels = Array.from({ length: channelCount }, (_, channel) => buffer.getChannelData(channel));
  for (let sampleIndex = 0; sampleIndex < buffer.length; sampleIndex += 1) {
    for (let channel = 0; channel < channelCount; channel += 1) {
      const sample = clamp(channels[channel][sampleIndex], -1, 1);
      if (isFloat) {
        view.setFloat32(offset, sample, true);
        offset += 4;
      } else if (bitDepth === "24") {
        const intSample = Math.round(sample < 0 ? sample * 0x800000 : sample * 0x7fffff);
        view.setUint8(offset, intSample & 0xff);
        view.setUint8(offset + 1, (intSample >> 8) & 0xff);
        view.setUint8(offset + 2, (intSample >> 16) & 0xff);
        offset += 3;
      } else {
        const intSample = Math.round(sample < 0 ? sample * 0x8000 : sample * 0x7fff);
        view.setInt16(offset, intSample, true);
        offset += 2;
      }
    }
  }

  return new Blob([arrayBuffer], { type: "audio/wav" });
}

const CRC32_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let index = 0; index < 256; index += 1) {
    let value = index;
    for (let bit = 0; bit < 8; bit += 1) {
      value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
    }
    table[index] = value >>> 0;
  }
  return table;
})();

function crc32(bytes) {
  let value = 0xffffffff;
  for (let index = 0; index < bytes.length; index += 1) {
    value = CRC32_TABLE[(value ^ bytes[index]) & 0xff] ^ (value >>> 8);
  }
  return (value ^ 0xffffffff) >>> 0;
}

function writeUint16(view, offset, value) {
  view.setUint16(offset, value, true);
}

function writeUint32(view, offset, value) {
  view.setUint32(offset, value >>> 0, true);
}

function dosDateTime(date = new Date()) {
  const year = Math.max(1980, date.getFullYear());
  const dosTime = (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2);
  const dosDate = ((year - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate();
  return { dosDate, dosTime };
}

function concatUint8Arrays(parts) {
  const totalLength = parts.reduce((sum, part) => sum + part.length, 0);
  const output = new Uint8Array(totalLength);
  let offset = 0;
  for (const part of parts) {
    output.set(part, offset);
    offset += part.length;
  }
  return output;
}

async function createZip(files) {
  const encoder = new TextEncoder();
  const now = dosDateTime();
  const localParts = [];
  const centralParts = [];
  let localOffset = 0;

  for (const file of files) {
    const nameBytes = encoder.encode(file.name);
    const dataBytes = new Uint8Array(await file.blob.arrayBuffer());
    const checksum = crc32(dataBytes);
    const localHeader = new Uint8Array(30 + nameBytes.length);
    const localView = new DataView(localHeader.buffer);
    writeUint32(localView, 0, 0x04034b50);
    writeUint16(localView, 4, 20);
    writeUint16(localView, 6, 0x0800);
    writeUint16(localView, 8, 0);
    writeUint16(localView, 10, now.dosTime);
    writeUint16(localView, 12, now.dosDate);
    writeUint32(localView, 14, checksum);
    writeUint32(localView, 18, dataBytes.length);
    writeUint32(localView, 22, dataBytes.length);
    writeUint16(localView, 26, nameBytes.length);
    writeUint16(localView, 28, 0);
    localHeader.set(nameBytes, 30);

    const centralHeader = new Uint8Array(46 + nameBytes.length);
    const centralView = new DataView(centralHeader.buffer);
    writeUint32(centralView, 0, 0x02014b50);
    writeUint16(centralView, 4, 20);
    writeUint16(centralView, 6, 20);
    writeUint16(centralView, 8, 0x0800);
    writeUint16(centralView, 10, 0);
    writeUint16(centralView, 12, now.dosTime);
    writeUint16(centralView, 14, now.dosDate);
    writeUint32(centralView, 16, checksum);
    writeUint32(centralView, 20, dataBytes.length);
    writeUint32(centralView, 24, dataBytes.length);
    writeUint16(centralView, 28, nameBytes.length);
    writeUint16(centralView, 30, 0);
    writeUint16(centralView, 32, 0);
    writeUint16(centralView, 34, 0);
    writeUint16(centralView, 36, 0);
    writeUint32(centralView, 38, 0);
    writeUint32(centralView, 42, localOffset);
    centralHeader.set(nameBytes, 46);

    localParts.push(localHeader, dataBytes);
    centralParts.push(centralHeader);
    localOffset += localHeader.length + dataBytes.length;
  }

  const centralDirectory = concatUint8Arrays(centralParts);
  const endRecord = new Uint8Array(22);
  const endView = new DataView(endRecord.buffer);
  writeUint32(endView, 0, 0x06054b50);
  writeUint16(endView, 4, 0);
  writeUint16(endView, 6, 0);
  writeUint16(endView, 8, files.length);
  writeUint16(endView, 10, files.length);
  writeUint32(endView, 12, centralDirectory.length);
  writeUint32(endView, 16, localOffset);
  writeUint16(endView, 20, 0);

  return new Blob([...localParts, centralDirectory, endRecord], { type: "application/zip" });
}

function uniqueFileName(name, usedNames) {
  if (!usedNames.has(name)) {
    usedNames.add(name);
    return name;
  }

  const base = name.replace(/\.wav$/i, "");
  let index = 2;
  let candidate = `${base}_${index}.wav`;
  while (usedNames.has(candidate)) {
    index += 1;
    candidate = `${base}_${index}.wav`;
  }
  usedNames.add(candidate);
  return candidate;
}

async function exportSelectedFile() {
  const file = getSelectedFile();
  if (!file) {
    return;
  }

  try {
    stopPlayback();
    const exportSettings = getExportSettings();
    const result = processAudioBuffer(file.audioBuffer, getSettings(), getManualTrimRange(file));
    const exportBuffer = await prepareExportBuffer(result.buffer, exportSettings);
    file.processedBuffer = result.buffer;
    file.processedAnalysis = result.analysis;
    file.processReport = result.report;
    file.batchStatus = "processed";
    file.waveformCache.processed = null;
    state.previewMode = "processed";

    const blob = encodeWav(exportBuffer, exportSettings);
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = makeExportFileName(file.name, 1, exportSettings);
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1200);

    setStatus(`Exported ${anchor.download}.`, "success");
    updateUi();
  } catch (error) {
    console.error(error);
    setStatus("Export failed. Try a shorter WAV file or reload the page and try again.", "error");
    updateUi();
  }
}

async function exportAllAsZip() {
  if (!state.files.length) {
    return;
  }

  const exportSettings = getExportSettings();
  const usedNames = new Set();
  const zipEntries = [];

  try {
    stopPlayback();
    elements.exportZipButton.disabled = true;
    elements.exportButton.disabled = true;

    for (let index = 0; index < state.files.length; index += 1) {
      const file = state.files[index];
      try {
        file.batchStatus = "processing";
        renderFileList();
        setStatus(`Batch processing ${index + 1} of ${state.files.length}: ${file.name}`);
        const result = processAudioBuffer(file.audioBuffer, getSettings(), getManualTrimRange(file));
        const exportBuffer = await prepareExportBuffer(result.buffer, exportSettings);
        const blob = encodeWav(exportBuffer, exportSettings);
        const fileName = uniqueFileName(makeExportFileName(file.name, index + 1, exportSettings), usedNames);

        file.processedBuffer = result.buffer;
        file.processedAnalysis = result.analysis;
        file.processReport = result.report;
        file.batchStatus = result.analysis.clippedSamples ? "warning" : "processed";
        zipEntries.push({ name: fileName, blob });
      } catch (error) {
        console.error(error);
        file.batchStatus = "failed";
      }
    }

    if (!zipEntries.length) {
      setStatus("Batch export failed. No files could be processed.", "error");
      updateUi();
      return;
    }

    const zipBlob = await createZip(zipEntries);
    const url = URL.createObjectURL(zipBlob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${exportSettings.packName}.zip`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1200);
    setStatus(`Exported ${zipEntries.length} cleaned WAV ${zipEntries.length === 1 ? "file" : "files"} as ${anchor.download}.`, "success");
    updateUi();
  } catch (error) {
    console.error(error);
    setStatus("ZIP export failed. Try fewer or shorter WAV files.", "error");
    updateUi();
  }
}

function createSelfTestAudioBuffer() {
  const sampleRate = 44100;
  const durationSeconds = 0.8;
  const length = Math.floor(sampleRate * durationSeconds);
  const audioContext = getAudioContext();
  const buffer = audioContext.createBuffer(1, length, sampleRate);
  const data = buffer.getChannelData(0);

  for (let index = 0; index < length; index += 1) {
    const time = index / sampleRate;
    const hasTone = time > 0.12 && time < 0.62;
    data[index] = hasTone ? Math.sin(2 * Math.PI * 220 * time) * 0.5 : 0;
  }

  return buffer;
}

async function runSelfTestFixture() {
  try {
    const sourceBuffer = createSelfTestAudioBuffer();
    const wavBlob = encodeWav(sourceBuffer);
    const file = new File([wavBlob], "self-test messy.wav", { type: "audio/wav" });
    await loadFiles([file]);
    setStatus("Self-test WAV loaded through the local decode path.", "success");
  } catch (error) {
    console.error(error);
    setStatus("Self-test fixture failed to load.", "error");
  }
}

function waveformRatioFromEvent(event) {
  const rect = elements.waveform.getBoundingClientRect();
  return clamp((event.clientX - rect.left) / rect.width, 0, 1);
}

function trimHandleFromEvent(event) {
  const file = getSelectedFile();
  if (!file) {
    return null;
  }

  const rect = elements.waveform.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const trimRange = getManualTrimRange(file);
  const startX = trimRange.startRatio * rect.width;
  const endX = trimRange.endRatio * rect.width;
  const hitSize = 14;

  if (Math.abs(x - startX) <= hitSize) {
    return "start";
  }
  if (Math.abs(x - endX) <= hitSize) {
    return "end";
  }
  return null;
}

function clearProcessedForManualEdit() {
  const file = getSelectedFile();
  if (!file) {
    return;
  }
  file.processedBuffer = null;
  file.processedAnalysis = null;
  file.processReport = null;
  file.waveformCache.processed = null;
  file.batchStatus = "ready";
  state.previewMode = "original";
}

function updateManualTrim(handle, ratio) {
  const file = getSelectedFile();
  if (!file) {
    return;
  }

  const minGap = Math.max(1 / file.audioBuffer.length, 0.002);
  clearProcessedForManualEdit();

  if (handle === "start") {
    file.trimStartRatio = clamp(ratio, 0, file.trimEndRatio - minGap);
  } else {
    file.trimEndRatio = clamp(ratio, file.trimStartRatio + minGap, 1);
  }

  state.playbackOffset = 0;
  updateUi();
}

function resetManualTrim() {
  const file = getSelectedFile();
  if (!file) {
    return;
  }
  stopPlayback();
  clearProcessedForManualEdit();
  file.trimStartRatio = 0;
  file.trimEndRatio = 1;
  setStatus("Manual trim reset for the selected file.");
  updateUi();
}

function handleWaveformPointerDown(event) {
  const handle = trimHandleFromEvent(event);
  if (!handle) {
    return;
  }

  event.preventDefault();
  stopPlayback();
  state.trimDragHandle = handle;
  state.suppressNextWaveformClick = true;
  elements.waveform.setPointerCapture?.(event.pointerId);
  updateManualTrim(handle, waveformRatioFromEvent(event));
}

function handleWaveformPointerMove(event) {
  if (!state.trimDragHandle) {
    return;
  }
  event.preventDefault();
  updateManualTrim(state.trimDragHandle, waveformRatioFromEvent(event));
}

function handleWaveformPointerUp(event) {
  if (!state.trimDragHandle) {
    return;
  }
  event.preventDefault();
  elements.waveform.releasePointerCapture?.(event.pointerId);
  state.trimDragHandle = null;
  setStatus("Manual trim updated. Apply processing preview to audition the result.");
}

function handleWaveformClick(event) {
  if (state.suppressNextWaveformClick) {
    state.suppressNextWaveformClick = false;
    return;
  }
  const rect = elements.waveform.getBoundingClientRect();
  const ratio = (event.clientX - rect.left) / rect.width;
  seekToRatio(ratio);
}

function bindEvents() {
  elements.fileInput.addEventListener("change", (event) => loadFiles(event.target.files));
  elements.waveformEmptyButton.addEventListener("click", () => elements.fileInput.click());

  elements.dropZone.addEventListener("click", (event) => {
    if (event.target !== elements.fileInput && !event.target.closest?.(".file-button")) {
      elements.fileInput.click();
    }
  });

  elements.dropZone.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      elements.fileInput.click();
    }
  });

  ["dragenter", "dragover"].forEach((eventName) => {
    elements.dropZone.addEventListener(eventName, (event) => {
      event.preventDefault();
      elements.dropZone.classList.add("is-dragging");
    });
  });

  ["dragleave", "drop"].forEach((eventName) => {
    elements.dropZone.addEventListener(eventName, (event) => {
      event.preventDefault();
      elements.dropZone.classList.remove("is-dragging");
    });
  });

  elements.dropZone.addEventListener("drop", (event) => {
    loadFiles(event.dataTransfer.files);
  });

  elements.playPauseButton.addEventListener("click", () => {
    if (state.isPlaying) {
      pausePlayback();
      return;
    }
    playFrom(state.playbackOffset).catch((error) => {
      console.error(error);
      setStatus("Playback could not start. Check your browser audio permissions and try again.", "error");
      updateTransportButtons();
    });
  });

  elements.stopButton.addEventListener("click", stopPlayback);
  elements.waveform.addEventListener("click", handleWaveformClick);
  elements.waveform.addEventListener("pointerdown", handleWaveformPointerDown);
  elements.waveform.addEventListener("pointermove", handleWaveformPointerMove);
  elements.waveform.addEventListener("pointerup", handleWaveformPointerUp);
  elements.waveform.addEventListener("pointercancel", handleWaveformPointerUp);
  elements.applyButton.addEventListener("click", applyProcessingPreview);
  elements.resetPreviewButton.addEventListener("click", resetPreview);
  elements.manualTrimReset.addEventListener("click", resetManualTrim);
  elements.exportButton.addEventListener("click", exportSelectedFile);
  elements.exportZipButton.addEventListener("click", exportAllAsZip);

  [
    elements.trimSilence,
    elements.trimThreshold,
    elements.fadeEnabled,
    elements.fadeMs,
    elements.normalizeEnabled,
    elements.targetPeak,
  ].forEach((control) => {
    control.addEventListener("input", () => {
      updateControlLabels();
      clearProcessedPreview("Processing settings changed. Apply processing preview again to audition them.");
    });
  });

  elements.detectClipping.addEventListener("input", updateUi);
  window.addEventListener("resize", drawWaveform);
}

bindEvents();
updateUi();

if (new URLSearchParams(window.location.search).get("self_test") === "1") {
  runSelfTestFixture();
}

window.kreativSamplePrep = {
  analyzeBuffer,
  processAudioBuffer,
  encodeWav,
  makeExportFileName,
  dbToGain,
};

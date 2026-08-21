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
  exportMode: null,
  processingMode: null,
  cleanupPreset: "standard",
  batchProgress: {
    label: "Export queue idle",
    detail: "0%",
    percent: 0,
  },
  montageOutput: null,
  cancelRequested: false,
  queueLimitNotice: "",
  waveformZoom: 1,
  waveformViewStart: 0,
  undoStack: [],
  redoStack: [],
  pendingHistory: null,
  queueDragId: null,
};

const elements = {
  fileInput: document.querySelector("#file-input"),
  workflowTabs: document.querySelectorAll(".workflow-tab"),
  strengthPresets: document.querySelectorAll(".strength-preset"),
  dropZone: document.querySelector("#drop-zone"),
  waveformEmptyButton: document.querySelector("#waveform-empty-button"),
  fileList: document.querySelector("#file-list"),
  fileCount: document.querySelector("#file-count"),
  clearQueueButton: document.querySelector("#clear-queue-button"),
  statusMessage: document.querySelector("#status-message"),
  waveform: document.querySelector("#waveform"),
  waveformZoomOut: document.querySelector("#waveform-zoom-out"),
  waveformZoomIn: document.querySelector("#waveform-zoom-in"),
  waveformZoomFit: document.querySelector("#waveform-zoom-fit"),
  waveformZoomValue: document.querySelector("#waveform-zoom-value"),
  undoButton: document.querySelector("#undo-button"),
  redoButton: document.querySelector("#redo-button"),
  progressFill: document.querySelector("#progress-fill"),
  playPauseButton: document.querySelector("#play-pause-button"),
  stopButton: document.querySelector("#stop-button"),
  timeReadout: document.querySelector("#time-readout"),
  previewModeLabel: document.querySelector("#preview-mode-label"),
  previewOriginalButton: document.querySelector("#preview-original-button"),
  previewProcessedButton: document.querySelector("#preview-processed-button"),
  previewStateText: document.querySelector("#preview-state-text"),
  metaName: document.querySelector("#meta-name"),
  metaDuration: document.querySelector("#meta-duration"),
  metaSampleRate: document.querySelector("#meta-sample-rate"),
  metaChannels: document.querySelector("#meta-channels"),
  metaPeak: document.querySelector("#meta-peak"),
  metaClipping: document.querySelector("#meta-clipping"),
  metaRms: document.querySelector("#meta-rms"),
  metaDcOffset: document.querySelector("#meta-dc-offset"),
  metaStereoBalance: document.querySelector("#meta-stereo-balance"),
  metaLeadingSilence: document.querySelector("#meta-leading-silence"),
  metaTrailingSilence: document.querySelector("#meta-trailing-silence"),
  trimStartTime: document.querySelector("#trim-start-time"),
  trimEndTime: document.querySelector("#trim-end-time"),
  manualTrimReset: document.querySelector("#manual-trim-reset"),
  snapZeroCrossings: document.querySelector("#snap-zero-crossings"),
  trimSilence: document.querySelector("#trim-silence"),
  trimThreshold: document.querySelector("#trim-threshold"),
  trimThresholdValue: document.querySelector("#trim-threshold-value"),
  trimMinSilence: document.querySelector("#trim-min-silence"),
  trimPadding: document.querySelector("#trim-padding"),
  fadeEnabled: document.querySelector("#fade-enabled"),
  fadeMs: document.querySelector("#fade-ms"),
  fadeMsValue: document.querySelector("#fade-ms-value"),
  normalizeEnabled: document.querySelector("#normalize-enabled"),
  targetPeak: document.querySelector("#target-peak"),
  targetPeakValue: document.querySelector("#target-peak-value"),
  detectClipping: document.querySelector("#detect-clipping"),
  applyButton: document.querySelector("#apply-button"),
  resetPreviewButton: document.querySelector("#reset-preview-button"),
  saveFileOverrideButton: document.querySelector("#save-file-override-button"),
  resetFileOverrideButton: document.querySelector("#reset-file-override-button"),
  applySuggestionButton: document.querySelector("#apply-suggestion-button"),
  cleanupSuggestionText: document.querySelector("#cleanup-suggestion-text"),
  exportSettingsButton: document.querySelector("#export-settings-button"),
  importSettingsButton: document.querySelector("#import-settings-button"),
  settingsFileInput: document.querySelector("#settings-file-input"),
  analysisWarnings: document.querySelector("#analysis-warnings"),
  reportTrimmed: document.querySelector("#report-trimmed"),
  reportFade: document.querySelector("#report-fade"),
  reportNormalize: document.querySelector("#report-normalize"),
  reportManualTrim: document.querySelector("#report-manual-trim"),
  reportOutputPeak: document.querySelector("#report-output-peak"),
  metaTruePeak: document.querySelector("#meta-true-peak"),
  exportButton: document.querySelector("#export-button"),
  exportZipButton: document.querySelector("#export-zip-button"),
  exportMp3Button: document.querySelector("#export-mp3-button"),
  exportManifestButton: document.querySelector("#export-manifest-button"),
  cancelExportButton: document.querySelector("#cancel-export-button"),
  namingTemplate: document.querySelector("#naming-template"),
  packName: document.querySelector("#pack-name"),
  bitDepth: document.querySelector("#bit-depth"),
  sampleRateMode: document.querySelector("#sample-rate-mode"),
  channelMode: document.querySelector("#channel-mode"),
  exportScope: document.querySelector("#export-scope"),
  montageSeconds: document.querySelector("#montage-seconds"),
  montageGap: document.querySelector("#montage-gap"),
  batchProgressLabel: document.querySelector("#batch-progress-label"),
  batchProgressDetail: document.querySelector("#batch-progress-detail"),
  batchProgressFill: document.querySelector("#batch-progress-fill"),
  cleanedOutputCount: document.querySelector("#cleaned-output-count"),
  cleanedOutputGrid: document.querySelector("#cleaned-output-grid"),
  preflightSummary: document.querySelector("#preflight-summary"),
  preflightWarnings: document.querySelector("#preflight-warnings"),
  preflightBody: document.querySelector("#preflight-body"),
};

const MAX_QUEUE_FILES = 120;
const MAX_INPUT_BYTES = 1024 * 1024 * 1024;
const MAX_DECODED_BYTES = 1536 * 1024 * 1024;
const DEFAULT_TRIM_WINDOW_MS = 10;
const HISTORY_LIMIT = 40;
const SUPPORTED_AUDIO_FORMATS = {
  wav: { label: "WAV", extensions: [".wav"], types: ["audio/wav", "audio/wave", "audio/x-wav"] },
  aiff: { label: "AIFF", extensions: [".aif", ".aiff"], types: ["audio/aiff", "audio/x-aiff"] },
  flac: { label: "FLAC", extensions: [".flac"], types: ["audio/flac"] },
  mp3: { label: "MP3", extensions: [".mp3"], types: ["audio/mpeg", "audio/mp3"] },
};

const CLEANUP_PRESETS = {
  gentle: {
    label: "Gentle",
    trimSilence: true,
    trimThresholdDb: -70,
    trimMinSilenceMs: 90,
    trimPaddingMs: 32,
    fadeEnabled: true,
    fadeMs: 8,
    normalizeEnabled: true,
    targetPeakDb: -3,
  },
  standard: {
    label: "Standard",
    trimSilence: true,
    trimThresholdDb: -60,
    trimMinSilenceMs: 60,
    trimPaddingMs: 20,
    fadeEnabled: true,
    fadeMs: 10,
    normalizeEnabled: true,
    targetPeakDb: -1,
  },
  tight: {
    label: "Tight",
    trimSilence: true,
    trimThresholdDb: -54,
    trimMinSilenceMs: 40,
    trimPaddingMs: 12,
    fadeEnabled: true,
    fadeMs: 12,
    normalizeEnabled: true,
    targetPeakDb: -1,
  },
  pack: {
    label: "Pack-ready",
    trimSilence: true,
    trimThresholdDb: -48,
    trimMinSilenceMs: 35,
    trimPaddingMs: 8,
    fadeEnabled: true,
    fadeMs: 15,
    normalizeEnabled: true,
    targetPeakDb: -1,
  },
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

function setBatchProgress(label, percent = 0, detail = "") {
  state.batchProgress = {
    label,
    percent: clamp(percent, 0, 100),
    detail: detail || `${Math.round(clamp(percent, 0, 100))}%`,
  };
  renderBatchProgress();
}

function renderBatchProgress() {
  elements.batchProgressLabel.textContent = state.batchProgress.label;
  elements.batchProgressDetail.textContent = state.batchProgress.detail;
  elements.batchProgressFill.style.width = `${state.batchProgress.percent}%`;
}

function setExportMode(mode) {
  state.exportMode = mode;
  updateUi();
}

function setProcessingMode(mode) {
  state.processingMode = mode;
  updateUi();
}

function isExportBusy() {
  return Boolean(state.exportMode || state.processingMode);
}

function waitForPaint() {
  return new Promise((resolve) => {
    window.requestAnimationFrame(() => resolve());
  });
}

function setButtonLoading(button, label, isLoading = false) {
  const labelElement = button.querySelector(".button-label");
  if (labelElement) {
    labelElement.textContent = label;
  } else {
    button.textContent = label;
  }
  button.classList.toggle("is-loading", isLoading);
  button.setAttribute("aria-busy", String(isLoading));
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

function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return "0 B";
  }
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / (1024 ** index)).toFixed(index ? 1 : 0)} ${units[index]}`;
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

function getSupportedAudioFormat(file) {
  const fileName = file.name.toLowerCase();
  const type = file.type.toLowerCase();
  return Object.entries(SUPPORTED_AUDIO_FORMATS).find(([, format]) => {
    return format.extensions.some((extension) => fileName.endsWith(extension)) || format.types.includes(type);
  })?.[0] || null;
}

function getAudioFormatLabel(file) {
  const format = getSupportedAudioFormat(file);
  return format ? SUPPORTED_AUDIO_FORMATS[format].label : "Audio";
}

function isLikelySupportedAudio(file) {
  return Boolean(getSupportedAudioFormat(file));
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
  const trimMinSilenceValue = Number(elements.trimMinSilence.value);
  const trimPaddingValue = Number(elements.trimPadding.value);
  const fadeMs = clamp(Number.isFinite(fadeValue) ? fadeValue : 10, 0, 500);
  const targetPeakDb = clamp(Number.isFinite(targetPeakValue) ? targetPeakValue : -1, -24, 0);
  const trimThresholdDb = clamp(Number.isFinite(trimThresholdValue) ? trimThresholdValue : -60, -80, -20);
  return {
    trimSilence: elements.trimSilence.checked,
    trimThresholdDb,
    trimMinSilenceMs: clamp(Number.isFinite(trimMinSilenceValue) ? trimMinSilenceValue : 60, 10, 1000),
    trimPaddingMs: clamp(Number.isFinite(trimPaddingValue) ? trimPaddingValue : 20, 0, 500),
    fadeEnabled: elements.fadeEnabled.checked,
    fadeMs,
    normalizeEnabled: elements.normalizeEnabled.checked,
    targetPeakDb,
    detectClipping: elements.detectClipping.checked,
  };
}

function applySettingsToControls(settings) {
  elements.trimSilence.checked = Boolean(settings.trimSilence);
  elements.trimThreshold.value = clamp(Number(settings.trimThresholdDb), -80, -20);
  elements.trimMinSilence.value = clamp(Number(settings.trimMinSilenceMs), 10, 1000);
  elements.trimPadding.value = clamp(Number(settings.trimPaddingMs), 0, 500);
  elements.fadeEnabled.checked = Boolean(settings.fadeEnabled);
  elements.fadeMs.value = clamp(Number(settings.fadeMs), 0, 500);
  elements.normalizeEnabled.checked = Boolean(settings.normalizeEnabled);
  elements.targetPeak.value = clamp(Number(settings.targetPeakDb), -24, 0);
  elements.detectClipping.checked = Boolean(settings.detectClipping);
  updateControlLabels();
  syncCleanupPresetUi();
}

function captureWorkspaceState() {
  return {
    settings: getSettings(),
    selectedId: state.selectedId,
    files: state.files.map((file) => ({
      id: file.id,
      trimStartRatio: file.trimStartRatio ?? 0,
      trimEndRatio: file.trimEndRatio ?? 1,
      exportSelected: file.exportSelected !== false,
      settingsOverride: file.settingsOverride ? { ...file.settingsOverride } : null,
    })),
  };
}

function workspaceStatesMatch(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function pushWorkspaceHistory(snapshot, label) {
  if (workspaceStatesMatch(snapshot, captureWorkspaceState())) {
    return;
  }
  state.undoStack.push({ label, snapshot });
  if (state.undoStack.length > HISTORY_LIMIT) {
    state.undoStack.shift();
  }
  state.redoStack = [];
}

function beginWorkspaceEdit(label) {
  if (isExportBusy() || state.pendingHistory) {
    return;
  }
  state.pendingHistory = { label, snapshot: captureWorkspaceState() };
}

function commitWorkspaceEdit() {
  const pending = state.pendingHistory;
  state.pendingHistory = null;
  if (!pending) {
    return;
  }
  pushWorkspaceHistory(pending.snapshot, pending.label);
}

function invalidateProcessedPreviews() {
  stopPlayback();
  for (const file of state.files) {
    file.processedBuffer = null;
    file.processedAnalysis = null;
    file.processReport = null;
    file.waveformCache.processed = null;
    file.batchStatus = "ready";
  }
  state.previewMode = "original";
  state.montageOutput = null;
}

function restoreWorkspaceState(snapshot) {
  applySettingsToControls(snapshot.settings);
  const currentFiles = [...state.files];
  const savedFiles = new Map(snapshot.files.map((file) => [file.id, file]));
  state.files = snapshot.files
    .map((savedFile) => {
      const current = currentFiles.find((file) => file.id === savedFile.id);
      if (!current) {
        return null;
      }
      current.trimStartRatio = savedFile.trimStartRatio;
      current.trimEndRatio = savedFile.trimEndRatio;
      current.exportSelected = savedFile.exportSelected;
      current.settingsOverride = savedFile.settingsOverride ? { ...savedFile.settingsOverride } : null;
      return current;
    })
    .filter(Boolean);
  // Keep files added after a history entry, but do not lose their decoded local audio.
  for (const file of currentFiles.filter((file) => !savedFiles.has(file.id))) {
    state.files.push(file);
  }
  state.selectedId = state.files.some((file) => file.id === snapshot.selectedId)
    ? snapshot.selectedId
    : state.files[0]?.id || null;
  invalidateProcessedPreviews();
}

function undoWorkspaceEdit() {
  if (isExportBusy() || !state.undoStack.length) {
    return;
  }
  const entry = state.undoStack.pop();
  state.redoStack.push({ label: entry.label, snapshot: captureWorkspaceState() });
  restoreWorkspaceState(entry.snapshot);
  setStatus(`Undid ${entry.label}.`);
  updateUi();
}

function redoWorkspaceEdit() {
  if (isExportBusy() || !state.redoStack.length) {
    return;
  }
  const entry = state.redoStack.pop();
  state.undoStack.push({ label: entry.label, snapshot: captureWorkspaceState() });
  restoreWorkspaceState(entry.snapshot);
  setStatus(`Redid ${entry.label}.`);
  updateUi();
}

function getSettingsForFile(file) {
  return file?.settingsOverride ? { ...file.settingsOverride } : getSettings();
}

function getExportSettings() {
  return {
    bitDepth: elements.bitDepth.value,
    sampleRateMode: elements.sampleRateMode.value,
    channelMode: elements.channelMode.value,
    namingTemplate: elements.namingTemplate.value.trim() || "{name}_clean",
    packName: sanitizeFileBaseName(elements.packName.value || "wave-mutator-pack"),
  };
}

function getMontageSettings() {
  const clipSeconds = Number(elements.montageSeconds.value);
  const gapSeconds = Number(elements.montageGap.value);
  return {
    clipSeconds: clamp(Number.isFinite(clipSeconds) ? clipSeconds : 4, 1, 12),
    gapSeconds: clamp(Number.isFinite(gapSeconds) ? gapSeconds : 0.4, 0, 3),
    sampleRate: 44100,
    channels: 2,
  };
}

function updateControlLabels() {
  const settings = getSettings();
  elements.trimThresholdValue.textContent = `${settings.trimThresholdDb} dB`;
  elements.trimMinSilence.value = settings.trimMinSilenceMs;
  elements.trimPadding.value = settings.trimPaddingMs;
  elements.fadeMs.value = settings.fadeMs;
  elements.fadeMsValue.textContent = `${settings.fadeMs} ms`;
  elements.targetPeak.value = settings.targetPeakDb;
  elements.targetPeakValue.textContent = `${settings.targetPeakDb.toFixed(1).replace(".0", "")} dB`;
  const montageSettings = getMontageSettings();
  elements.montageSeconds.value = montageSettings.clipSeconds;
  elements.montageGap.value = montageSettings.gapSeconds;
}

function settingsMatchPreset(settings, preset) {
  return settings.trimSilence === preset.trimSilence
    && settings.trimThresholdDb === preset.trimThresholdDb
    && settings.trimMinSilenceMs === preset.trimMinSilenceMs
    && settings.trimPaddingMs === preset.trimPaddingMs
    && settings.fadeEnabled === preset.fadeEnabled
    && settings.fadeMs === preset.fadeMs
    && settings.normalizeEnabled === preset.normalizeEnabled
    && settings.targetPeakDb === preset.targetPeakDb;
}

function getMatchingCleanupPreset(settings = getSettings()) {
  return Object.entries(CLEANUP_PRESETS).find(([, preset]) => settingsMatchPreset(settings, preset))?.[0] || "custom";
}

function syncCleanupPresetUi() {
  const matchingPreset = getMatchingCleanupPreset();
  state.cleanupPreset = matchingPreset;
  elements.strengthPresets.forEach((button) => {
    const isActive = button.dataset.preset === matchingPreset;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
}

function applyCleanupPreset(presetName) {
  const preset = CLEANUP_PRESETS[presetName];
  if (!preset) {
    return;
  }

  const historySnapshot = captureWorkspaceState();
  elements.trimSilence.checked = preset.trimSilence;
  elements.trimThreshold.value = preset.trimThresholdDb;
  elements.trimMinSilence.value = preset.trimMinSilenceMs;
  elements.trimPadding.value = preset.trimPaddingMs;
  elements.fadeEnabled.checked = preset.fadeEnabled;
  elements.fadeMs.value = preset.fadeMs;
  elements.normalizeEnabled.checked = preset.normalizeEnabled;
  elements.targetPeak.value = preset.targetPeakDb;
  state.cleanupPreset = presetName;
  updateControlLabels();
  syncCleanupPresetUi();

  const selected = getSelectedFile();
  if (selected) {
    clearProcessedPreview(`Cleanup Strength set to ${preset.label}. Apply processing preview to audition it.`);
    pushWorkspaceHistory(historySnapshot, "cleanup preset");
    updateUi();
    return;
  }

  setStatus(`Cleanup Strength set to ${preset.label}. Load an audio file to audition it.`);
  pushWorkspaceHistory(historySnapshot, "cleanup preset");
  updateUi();
}

function getCleanupSuggestion(file = getSelectedFile()) {
  if (!file?.originalAnalysis) {
    return null;
  }
  const analysis = file.originalAnalysis;
  const edgeSilence = analysis.leadingSilenceSeconds + analysis.trailingSilenceSeconds;
  if (analysis.clippedSamples > 0) {
    return {
      preset: "gentle",
      text: "Gentle is recommended: clipping is present, so preserve the source while cleaning its edges.",
    };
  }
  if (edgeSilence > 0.35) {
    return {
      preset: "tight",
      text: "Tight is recommended: this file has noticeable silence at its edges.",
    };
  }
  if (analysis.rmsDb < -36) {
    return {
      preset: "standard",
      text: "Standard is recommended: normalization can improve its peak level while retaining a safe tail.",
    };
  }
  return {
    preset: "standard",
    text: "Standard is recommended as a balanced local cleanup starting point.",
  };
}

function renderCleanupSuggestion() {
  const suggestion = getCleanupSuggestion();
  elements.applySuggestionButton.disabled = !suggestion || isExportBusy();
  elements.cleanupSuggestionText.textContent = suggestion?.text || "Load an audio file to get a local suggestion.";
  elements.applySuggestionButton.textContent = suggestion ? `Use ${CLEANUP_PRESETS[suggestion.preset].label}` : "Use suggestion";
}

function applyCleanupSuggestion() {
  const suggestion = getCleanupSuggestion();
  if (!suggestion) {
    return;
  }
  applyCleanupPreset(suggestion.preset);
}

function scrollToWorkflowTarget(targetSelector) {
  const target = document.querySelector(targetSelector);
  if (!target) {
    return;
  }

  elements.workflowTabs.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.scrollTarget === targetSelector);
  });
  target.scrollIntoView({ behavior: "smooth", block: "start" });
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
  selected.batchStatus = "ready";
  state.montageOutput = null;
  state.previewMode = "original";
  stopPlayback();
  if (reason) {
    setStatus(reason);
  }
  updateUi();
}

function clearGlobalProcessedPreviews(reason = "") {
  let cleared = 0;
  for (const file of state.files) {
    if (file.settingsOverride || !file.processedBuffer) {
      continue;
    }
    file.processedBuffer = null;
    file.processedAnalysis = null;
    file.processReport = null;
    file.waveformCache.processed = null;
    file.batchStatus = "ready";
    cleared += 1;
  }
  state.montageOutput = null;
  state.previewMode = "original";
  stopPlayback();
  if (reason) {
    setStatus(cleared ? `${reason} ${cleared} preview${cleared === 1 ? " was" : "s were"} marked stale.` : reason);
  }
  updateUi();
}

async function decodeFile(file) {
  const audioContext = getAudioContext();
  const arrayBuffer = await file.arrayBuffer();
  return audioContext.decodeAudioData(arrayBuffer.slice(0));
}

function getQueueInputBytes() {
  return state.files.reduce((total, file) => total + file.size, 0);
}

function getQueueDecodedBytes() {
  return state.files.reduce((total, file) => total + (file.audioBuffer.length * file.audioBuffer.numberOfChannels * 4), 0);
}

function canAddFile(file, queuedCount = state.files.length, queuedBytes = getQueueInputBytes()) {
  if (queuedCount >= MAX_QUEUE_FILES) {
    return `Queue limit reached: ${MAX_QUEUE_FILES} audio files maximum.`;
  }
  if (queuedBytes + file.size > MAX_INPUT_BYTES) {
    return `Queue limit reached: input files are capped at ${formatBytes(MAX_INPUT_BYTES)}.`;
  }
  return "";
}

async function loadFiles(fileList) {
  const files = Array.from(fileList);
  if (!files.length) {
    return;
  }

  const audioFiles = files.filter(isLikelySupportedAudio);
  const rejectedCount = files.length - audioFiles.length;

  if (!audioFiles.length) {
    setStatus("No supported audio files found. Choose WAV, AIFF, FLAC, or MP3 files.", "error");
    return;
  }

  const acceptedFiles = [];
  let limitMessage = "";
  let queuedCount = state.files.length;
  let queuedBytes = getQueueInputBytes();
  for (const file of audioFiles) {
    const reason = canAddFile(file, queuedCount, queuedBytes);
    if (reason) {
      limitMessage = reason;
      break;
    }
    acceptedFiles.push(file);
    queuedCount += 1;
    queuedBytes += file.size;
  }

  if (!acceptedFiles.length) {
    setStatus(limitMessage || "The selected files could not be added to the queue.", "error");
    return;
  }

  setStatus(`Decoding ${acceptedFiles.length} audio ${acceptedFiles.length === 1 ? "file" : "files"} locally...`);
  state.montageOutput = null;
  state.queueLimitNotice = "";

  let loadedCount = 0;
  for (const file of acceptedFiles) {
    try {
      const audioBuffer = await decodeFile(file);
      const sampleFile = {
        id: state.nextId,
        file,
        name: file.name,
        format: getAudioFormatLabel(file),
        size: file.size,
        audioBuffer,
        originalAnalysis: analyzeBuffer(audioBuffer),
        processedBuffer: null,
        processedAnalysis: null,
        processReport: null,
        trimStartRatio: 0,
        trimEndRatio: 1,
        exportSelected: true,
        settingsOverride: null,
        batchStatus: "ready",
        waveformCache: {
          original: null,
          processed: null,
        },
      };
      state.nextId += 1;
      state.files.push(sampleFile);
      if (getQueueDecodedBytes() > MAX_DECODED_BYTES) {
        state.files.pop();
        state.queueLimitNotice = `Queue stopped at ${formatBytes(MAX_DECODED_BYTES)} decoded audio to protect browser memory.`;
        break;
      }
      loadedCount += 1;

      if (!state.selectedId) {
        selectFile(sampleFile.id);
      }
    } catch (error) {
      console.error(error);
      setStatus(`Could not decode "${file.name}". Browser audio support varies by format; try WAV or AIFF for the most reliable import.`, "error");
    }
  }

  if (state.files.length && !state.selectedId) {
    selectFile(state.files[0].id);
  }

  const rejectedMessage = rejectedCount ? ` ${rejectedCount} unsupported ${rejectedCount === 1 ? "file was" : "files were"} skipped.` : "";
  if (loadedCount) {
    const limitSuffix = limitMessage || state.queueLimitNotice ? ` ${limitMessage || state.queueLimitNotice}` : "";
    const lossyCount = state.files.filter((sampleFile) => sampleFile.format === "MP3").length;
    const lossySuffix = lossyCount ? ` ${lossyCount} MP3 ${lossyCount === 1 ? "source is" : "sources are"} lossy and will export as WAV.` : "";
    setStatus(`Loaded ${loadedCount} audio ${loadedCount === 1 ? "file" : "files"}.${rejectedMessage}${lossySuffix}${limitSuffix}`, "success");
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
    item.draggable = !isExportBusy();
    item.classList.toggle("is-dragging", state.queueDragId === file.id);
    item.dataset.fileId = String(file.id);
    item.title = "Drag to change the queue order.";
    item.addEventListener("dragstart", (event) => {
      if (isExportBusy()) {
        event.preventDefault();
        return;
      }
      beginWorkspaceEdit("queue order");
      state.queueDragId = file.id;
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", String(file.id));
      item.classList.add("is-dragging");
    });
    item.addEventListener("dragover", (event) => {
      if (state.queueDragId && state.queueDragId !== file.id) {
        event.preventDefault();
        item.classList.add("is-drag-over");
      }
    });
    item.addEventListener("dragleave", () => item.classList.remove("is-drag-over"));
    item.addEventListener("drop", (event) => {
      event.preventDefault();
      item.classList.remove("is-drag-over");
      reorderQueue(state.queueDragId, file.id);
    });
    item.addEventListener("dragend", () => {
      state.queueDragId = null;
      commitWorkspaceEdit();
      updateUi();
    });
    const button = document.createElement("button");
    button.type = "button";
    button.classList.toggle("is-selected", file.id === state.selectedId);
    button.addEventListener("click", () => selectFile(file.id));

    const main = document.createElement("span");
    main.className = "file-main";

    const title = document.createElement("span");
    title.className = "file-title";
    title.textContent = file.name;

    const meta = document.createElement("span");
    meta.className = "file-meta";
    meta.textContent = `${file.format || "Audio"} | ${formatDuration(file.audioBuffer.duration)} | ${file.audioBuffer.sampleRate.toLocaleString()} Hz | ${file.audioBuffer.numberOfChannels} ${file.audioBuffer.numberOfChannels === 1 ? "channel" : "channels"}`;

    const badges = document.createElement("span");
    badges.className = "file-badges";
    for (const badge of getFileBadges(file)) {
      const itemBadge = document.createElement("span");
      itemBadge.className = `file-badge is-${badge.type}`;
      itemBadge.textContent = badge.label;
      badges.appendChild(itemBadge);
    }

    main.append(title, meta);
    button.append(main, badges);

    const queueActions = document.createElement("div");
    queueActions.className = "file-queue-actions";

    const includeLabel = document.createElement("label");
    includeLabel.className = "file-include-toggle";
    const include = document.createElement("input");
    include.type = "checkbox";
    include.checked = file.exportSelected !== false;
    include.setAttribute("aria-label", `Include ${file.name} in batch export`);
    include.addEventListener("change", () => {
      beginWorkspaceEdit("export selection");
      file.exportSelected = include.checked;
      commitWorkspaceEdit();
      updateUi();
    });
    includeLabel.append(include, document.createTextNode("Export"));

    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.className = "file-remove-button";
    removeButton.textContent = "Remove";
    removeButton.disabled = isExportBusy();
    removeButton.addEventListener("click", () => removeFile(file.id));
    queueActions.append(includeLabel, removeButton);

    item.append(button, queueActions);
    elements.fileList.appendChild(item);
  }
}

function reorderQueue(sourceId, targetId) {
  if (isExportBusy() || !sourceId || sourceId === targetId) {
    return;
  }
  const sourceIndex = state.files.findIndex((file) => file.id === sourceId);
  const targetIndex = state.files.findIndex((file) => file.id === targetId);
  if (sourceIndex < 0 || targetIndex < 0) {
    return;
  }
  const [movedFile] = state.files.splice(sourceIndex, 1);
  const insertionIndex = sourceIndex < targetIndex ? targetIndex - 1 : targetIndex;
  state.files.splice(insertionIndex, 0, movedFile);
  state.montageOutput = null;
  setStatus(`Moved ${movedFile.name} in the export queue.`);
}

function removeFile(id) {
  if (isExportBusy()) {
    return;
  }
  const index = state.files.findIndex((file) => file.id === id);
  if (index < 0) {
    return;
  }
  const [removed] = state.files.splice(index, 1);
  if (state.selectedId === id) {
    state.selectedId = state.files[0]?.id || null;
    state.previewMode = "original";
    state.playbackOffset = 0;
  }
  state.montageOutput = null;
  setStatus(`Removed ${removed.name} from the queue.`);
  updateUi();
}

function clearQueue() {
  if (isExportBusy() || !state.files.length) {
    return;
  }
  stopPlayback();
  state.files = [];
  state.selectedId = null;
  state.previewMode = "original";
  state.montageOutput = null;
  state.queueLimitNotice = "";
  setBatchProgress("Export queue cleared", 0, "Ready");
  setStatus("Queue cleared. No audio files were uploaded or changed.");
  updateUi();
}

function getFileBadges(file) {
  const status = file.batchStatus || "ready";
  const statusMap = {
    ready: { label: "Ready", type: "neutral" },
    preview: { label: "Preview", type: "good" },
    processed: { label: "Cleaned", type: "good" },
    processing: { label: "Working", type: "busy" },
    montage: { label: "Montage", type: "busy" },
    warning: { label: "Review", type: "warning" },
    failed: { label: "Failed", type: "danger" },
  };
  const badges = [statusMap[status] || statusMap.ready];

  if (file.exportSelected === false) {
    badges.unshift({ label: "Excluded", type: "neutral" });
  }

  if (file.originalAnalysis?.clippedSamples > 0) {
    badges.push({ label: "Clipping", type: "danger" });
  }

  if ((file.trimStartRatio ?? 0) > 0 || (file.trimEndRatio ?? 1) < 1) {
    badges.push({ label: "Manual trim", type: "warning" });
  }

  if (file.settingsOverride) {
    badges.push({ label: "Custom", type: "good" });
  }

  if (file.processedAnalysis?.clippedSamples > 0) {
    badges.push({ label: "After clips", type: "warning" });
  }

  return badges;
}

function getCleanedOutputFiles() {
  return state.files.filter((file) => {
    return file.processedBuffer
      || file.batchStatus === "processing"
      || file.batchStatus === "montage"
      || file.batchStatus === "failed";
  });
}

function getOutputStatus(file) {
  if (file.batchStatus === "processing" || file.batchStatus === "montage") {
    return { label: "Working", type: "busy" };
  }
  if (file.batchStatus === "failed") {
    return { label: "Failed", type: "danger" };
  }
  if (file.processedAnalysis?.clippedSamples > 0 || file.batchStatus === "warning") {
    return { label: "Review", type: "warning" };
  }
  if (file.batchStatus === "preview") {
    return { label: "Preview ready", type: "good" };
  }
  return { label: "Cleaned", type: "good" };
}

function appendOutputMetric(list, label, value) {
  const item = document.createElement("div");
  const term = document.createElement("dt");
  const description = document.createElement("dd");
  term.textContent = label;
  description.textContent = value;
  item.append(term, description);
  list.appendChild(item);
}

function formatTrimRemoved(report, file) {
  if (!report) {
    return "-";
  }
  if (report.trimSkipped) {
    return "Skipped";
  }
  const totalSamples = report.trimmedSamples + report.manualTrimmedSamples;
  return totalSamples > 0 ? formatDuration(totalSamples / file.audioBuffer.sampleRate) : "None";
}

function selectOutputFile(id, preferProcessed = false) {
  stopPlayback();
  state.selectedId = id;
  const file = getSelectedFile();
  state.previewMode = preferProcessed && file?.processedBuffer ? "processed" : "original";
  state.playbackOffset = 0;
  updateUi();
}

function renderCleanedOutputCard(file) {
  const exportSettings = getExportSettings();
  const fileIndex = state.files.indexOf(file) + 1;
  const status = getOutputStatus(file);
  const busy = isExportBusy();
  const article = document.createElement("article");
  article.className = `cleaned-output-card is-${status.type}`;
  article.classList.toggle("is-selected", file.id === state.selectedId);

  const header = document.createElement("div");
  header.className = "cleaned-output-card-head";
  const titleBlock = document.createElement("div");
  const title = document.createElement("h4");
  title.textContent = makeExportFileName(file.name, fileIndex, exportSettings);
  const source = document.createElement("p");
  source.textContent = file.name;
  titleBlock.append(title, source);

  const badge = document.createElement("span");
  badge.className = `file-badge is-${status.type}`;
  badge.textContent = status.label;
  header.append(titleBlock, badge);

  const metrics = document.createElement("dl");
  metrics.className = "cleaned-output-metrics";
  appendOutputMetric(metrics, "Duration", file.processedBuffer ? formatDuration(file.processedBuffer.duration) : "-");
  appendOutputMetric(metrics, "Peak", file.processedAnalysis ? formatDb(file.processedAnalysis.peakDb) : "-");
  appendOutputMetric(metrics, "Trim removed", formatTrimRemoved(file.processReport, file));
  appendOutputMetric(metrics, "Clipping", file.processedAnalysis?.clippedSamples ? `${file.processedAnalysis.clippedSamples.toLocaleString()} samples` : "None");

  const actions = document.createElement("div");
  actions.className = "cleaned-output-actions";

  const previewButton = document.createElement("button");
  previewButton.type = "button";
  previewButton.textContent = "Preview After";
  previewButton.disabled = busy || !file.processedBuffer;
  previewButton.addEventListener("click", () => selectOutputFile(file.id, true));

  const selectButton = document.createElement("button");
  selectButton.type = "button";
  selectButton.textContent = "Select";
  selectButton.disabled = busy;
  selectButton.addEventListener("click", () => selectOutputFile(file.id, Boolean(file.processedBuffer)));

  const exportButton = document.createElement("button");
  exportButton.type = "button";
  exportButton.textContent = file.batchStatus === "failed" ? "Retry WAV" : "Export WAV";
  exportButton.disabled = busy;
  exportButton.addEventListener("click", () => {
    selectOutputFile(file.id, Boolean(file.processedBuffer));
    exportSelectedFile();
  });

  actions.append(previewButton, selectButton, exportButton);
  article.append(header, metrics, actions);
  return article;
}

function renderMontageOutputCard() {
  const output = state.montageOutput;
  if (!output) {
    return null;
  }

  const article = document.createElement("article");
  article.className = "cleaned-output-card is-montage";

  const header = document.createElement("div");
  header.className = "cleaned-output-card-head";
  const titleBlock = document.createElement("div");
  const title = document.createElement("h4");
  title.textContent = output.fileName;
  const source = document.createElement("p");
  source.textContent = `Preview montage from ${output.fileCount} ${output.fileCount === 1 ? "file" : "files"}`;
  titleBlock.append(title, source);

  const badge = document.createElement("span");
  badge.className = "file-badge is-good";
  badge.textContent = "MP3 montage";
  header.append(titleBlock, badge);

  const metrics = document.createElement("dl");
  metrics.className = "cleaned-output-metrics";
  appendOutputMetric(metrics, "Duration", formatDuration(output.duration));
  appendOutputMetric(metrics, "Format", "MP3");
  appendOutputMetric(metrics, "Clip length", `${output.clipSeconds}s`);
  appendOutputMetric(metrics, "Gap", `${output.gapSeconds}s`);

  article.append(header, metrics);
  return article;
}

function renderCleanedOutputs() {
  const fileOutputs = getCleanedOutputFiles();
  const montageCard = renderMontageOutputCard();
  const outputCount = fileOutputs.length + (montageCard ? 1 : 0);
  elements.cleanedOutputGrid.innerHTML = "";
  elements.cleanedOutputCount.textContent = outputCount
    ? `${outputCount} ${outputCount === 1 ? "card" : "cards"}`
    : "0 ready";

  if (!outputCount) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = "Apply a preview or export files to see cleaned output cards.";
    elements.cleanedOutputGrid.appendChild(empty);
    return;
  }

  for (const file of fileOutputs) {
    elements.cleanedOutputGrid.appendChild(renderCleanedOutputCard(file));
  }
  if (montageCard) {
    elements.cleanedOutputGrid.appendChild(montageCard);
  }
}

function getSelectedExportFiles() {
  if (elements.exportScope.value === "all") {
    return [...state.files];
  }
  return state.files.filter((file) => file.exportSelected !== false);
}

function getPreflightStatus(file) {
  const analysis = file.processedAnalysis || file.originalAnalysis;
  if (file.batchStatus === "failed") {
    return { label: "Failed", type: "danger" };
  }
  if (analysis.clippedSamples > 0 || analysis.truePeakEstimate >= 1) {
    return { label: "Review", type: "warning" };
  }
  if (Math.abs(analysis.dcOffset) > 0.01 || (analysis.stereoBalanceDb !== null && Math.abs(analysis.stereoBalanceDb) > 6)) {
    return { label: "Check", type: "note" };
  }
  return { label: "Ready", type: "good" };
}

function appendPreflightCell(row, text, className = "") {
  const cell = document.createElement("td");
  cell.textContent = text;
  if (className) {
    cell.className = className;
  }
  row.appendChild(cell);
  return cell;
}

function renderPreflight() {
  elements.preflightBody.innerHTML = "";
  elements.preflightWarnings.innerHTML = "";
  const selectedFiles = getSelectedExportFiles();

  if (!state.files.length) {
    elements.preflightSummary.textContent = "Load audio files to check the pack.";
    const emptyRow = document.createElement("tr");
    const emptyCell = appendPreflightCell(emptyRow, "No files loaded yet.", "empty-state");
    emptyCell.colSpan = 7;
    elements.preflightBody.appendChild(emptyRow);
    return;
  }

  const reviewCount = selectedFiles.filter((file) => ["warning", "danger", "note"].includes(getPreflightStatus(file).type)).length;
  const decodedBytes = getQueueDecodedBytes();
  elements.preflightSummary.textContent = `${selectedFiles.length}/${state.files.length} selected | ${formatBytes(getQueueInputBytes())} input | ${formatBytes(decodedBytes)} decoded`;

  const warnings = [];
  if (!selectedFiles.length) {
    warnings.push("No files are selected for batch export.");
  }
  if (reviewCount) {
    warnings.push(`${reviewCount} selected ${reviewCount === 1 ? "file needs" : "files need"} review before release.`);
  }
  if (state.queueLimitNotice) {
    warnings.push(state.queueLimitNotice);
  }

  for (const message of warnings) {
    const note = document.createElement("p");
    note.className = "preflight-warning";
    note.textContent = message;
    elements.preflightWarnings.appendChild(note);
  }

  for (const file of state.files) {
    const analysis = file.processedAnalysis || file.originalAnalysis;
    const status = getPreflightStatus(file);
    const row = document.createElement("tr");
    row.classList.toggle("is-excluded", file.exportSelected === false && elements.exportScope.value !== "all");
    const includeCell = document.createElement("td");
    const include = document.createElement("input");
    include.type = "checkbox";
    include.checked = file.exportSelected !== false;
    include.setAttribute("aria-label", `Include ${file.name} in batch export`);
    include.addEventListener("change", () => {
      file.exportSelected = include.checked;
      updateUi();
    });
    includeCell.appendChild(include);
    row.appendChild(includeCell);
    appendPreflightCell(row, file.name, "preflight-file-name");
    appendPreflightCell(row, `${file.audioBuffer.sampleRate / 1000} kHz | ${file.audioBuffer.numberOfChannels === 1 ? "Mono" : "Stereo"}`);
    appendPreflightCell(row, formatDuration(file.audioBuffer.duration));
    appendPreflightCell(row, formatDb(analysis.peakDb));
    appendPreflightCell(row, formatDb(gainToDb(analysis.truePeakEstimate)));
    const statusCell = appendPreflightCell(row, status.label, `preflight-status is-${status.type}`);
    statusCell.title = file.settingsOverride ? "This file has saved custom cleanup settings." : "Uses the current global cleanup settings.";
    elements.preflightBody.appendChild(row);
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
  const trimBounds = findTrimBounds(buffer, {
    threshold: dbToGain(-60),
    minSilenceMs: 60,
    paddingMs: 20,
  });
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
    truePeakEstimate: estimateTruePeak(buffer),
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

function estimateTruePeak(buffer) {
  let peak = 0;
  for (let channel = 0; channel < buffer.numberOfChannels; channel += 1) {
    const data = buffer.getChannelData(channel);
    for (let index = 0; index < data.length; index += 1) {
      peak = Math.max(peak, Math.abs(data[index]));
      if (index < 1 || index >= data.length - 2) {
        continue;
      }

      // Four-times Catmull-Rom interpolation catches likely inter-sample overs.
      const a = data[index - 1];
      const b = data[index];
      const c = data[index + 1];
      const d = data[index + 2];
      for (let phase = 1; phase < 4; phase += 1) {
        const t = phase / 4;
        const value = 0.5 * ((2 * b)
          + (-a + c) * t
          + (2 * a - 5 * b + 4 * c - d) * t * t
          + (-a + 3 * b - 3 * c + d) * t * t * t);
        peak = Math.max(peak, Math.abs(value));
      }
    }
  }
  return peak;
}

function getWindowLevel(buffer, start, end) {
  let peak = 0;
  let sumSquares = 0;
  let samples = 0;
  for (let channel = 0; channel < buffer.numberOfChannels; channel += 1) {
    const data = buffer.getChannelData(channel);
    for (let index = start; index < end; index += 1) {
      const value = data[index];
      peak = Math.max(peak, Math.abs(value));
      sumSquares += value * value;
      samples += 1;
    }
  }
  return {
    peak,
    rms: Math.sqrt(sumSquares / Math.max(1, samples)),
  };
}

function findTrimBounds(buffer, options = {}) {
  const threshold = typeof options === "number" ? options : options.threshold;
  const quietThreshold = Number.isFinite(threshold) ? threshold : dbToGain(-60);
  const contentThreshold = quietThreshold * 1.414;
  const minSilenceMs = clamp(Number(options.minSilenceMs) || 60, 10, 1000);
  const paddingMs = clamp(Number(options.paddingMs) || 20, 0, 500);
  const windowSamples = Math.max(1, Math.round((DEFAULT_TRIM_WINDOW_MS / 1000) * buffer.sampleRate));
  const minSilentWindows = Math.max(1, Math.ceil(minSilenceMs / DEFAULT_TRIM_WINDOW_MS));
  const paddingSamples = Math.round((paddingMs / 1000) * buffer.sampleRate);
  const windows = [];

  for (let start = 0; start < buffer.length; start += windowSamples) {
    const endExclusive = Math.min(buffer.length, start + windowSamples);
    const level = getWindowLevel(buffer, start, endExclusive);
    windows.push({
      start,
      endExclusive,
      isQuiet: level.peak < quietThreshold && level.rms < quietThreshold,
      hasContent: level.peak >= contentThreshold || level.rms >= quietThreshold,
    });
  }

  const firstContent = windows.findIndex((window) => window.hasContent);
  if (firstContent < 0) {
    return { start: 0, endExclusive: buffer.length, skipped: true, quietWindows: windows.length };
  }

  let lastContent = -1;
  for (let index = windows.length - 1; index >= 0; index -= 1) {
    if (windows[index].hasContent) {
      lastContent = index;
      break;
    }
  }

  const leadingQuiet = windows.slice(0, firstContent).filter((window) => window.isQuiet).length;
  const trailingQuiet = windows.slice(lastContent + 1).filter((window) => window.isQuiet).length;
  const start = leadingQuiet >= minSilentWindows
    ? Math.max(0, windows[firstContent].start - paddingSamples)
    : 0;
  const endExclusive = trailingQuiet >= minSilentWindows
    ? Math.min(buffer.length, windows[lastContent].endExclusive + paddingSamples)
    : buffer.length;

  return {
    start,
    endExclusive: Math.max(start + 1, endExclusive),
    skipped: false,
    quietWindows: leadingQuiet + trailingQuiet,
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
      data[index] *= Math.sin(amount * Math.PI * 0.5);
      data[data.length - 1 - index] *= Math.cos(amount * Math.PI * 0.5);
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
    const bounds = findTrimBounds(workingBuffer, {
      threshold: dbToGain(settings.trimThresholdDb),
      minSilenceMs: settings.trimMinSilenceMs,
      paddingMs: settings.trimPaddingMs,
    });
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

  const outputAnalysis = analyzeBuffer(workingBuffer);
  report.outputPeakDb = outputAnalysis.peakDb;
  return {
    buffer: workingBuffer,
    report,
    analysis: outputAnalysis,
  };
}

function getWaveformView() {
  const zoom = clamp(state.waveformZoom, 1, 16);
  const viewLength = 1 / zoom;
  return {
    start: clamp(state.waveformViewStart, 0, 1 - viewLength),
    end: clamp(state.waveformViewStart, 0, 1 - viewLength) + viewLength,
    length: viewLength,
  };
}

function setWaveformZoom(nextZoom) {
  const file = getSelectedFile();
  const oldView = getWaveformView();
  const focus = file
    ? clamp((getPlaybackPosition() / Math.max(file.audioBuffer.duration, 0.001)) || (oldView.start + oldView.length / 2), 0, 1)
    : 0.5;
  state.waveformZoom = clamp(nextZoom, 1, 16);
  const nextLength = 1 / state.waveformZoom;
  state.waveformViewStart = clamp(focus - nextLength / 2, 0, 1 - nextLength);
  updateUi();
}

function buildWaveformPeaks(buffer, width, startRatio = 0, endRatio = 1) {
  const pointCount = Math.max(1, Math.floor(width));
  const sourceStart = clamp(Math.floor(startRatio * buffer.length), 0, buffer.length - 1);
  const sourceEnd = clamp(Math.ceil(endRatio * buffer.length), sourceStart + 1, buffer.length);
  const samplesPerPoint = Math.max(1, Math.floor((sourceEnd - sourceStart) / pointCount));
  const peaks = new Array(pointCount);

  for (let point = 0; point < pointCount; point += 1) {
    const start = sourceStart + point * samplesPerPoint;
    const end = point === pointCount - 1 ? sourceEnd : Math.min(sourceEnd, start + samplesPerPoint);
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

function getWaveformPeaks(file, buffer, mode, width, view) {
  if (state.waveformZoom > 1) {
    return buildWaveformPeaks(buffer, width, view.start, view.end).peaks;
  }
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
  const view = getWaveformView();
  const peaks = getWaveformPeaks(file, buffer, mode, width, view);
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
  const startX = ((trimRange.startRatio - view.start) / view.length) * width;
  const endX = ((trimRange.endRatio - view.start) / view.length) * width;
  context.fillStyle = "rgba(255, 51, 102, 0.18)";
  context.fillRect(0, 0, clamp(startX, 0, width), height);
  context.fillRect(clamp(endX, 0, width), 0, Math.max(0, width - endX), height);
  context.fillStyle = "rgba(74, 74, 255, 0.12)";
  context.fillRect(clamp(startX, 0, width), 0, Math.max(0, clamp(endX, 0, width) - clamp(startX, 0, width)), height);
  context.strokeStyle = "#4a4aff";
  context.lineWidth = 3;
  context.beginPath();
  if (startX >= 0 && startX <= width) {
    context.moveTo(startX, 0);
    context.lineTo(startX, height);
  }
  if (endX >= 0 && endX <= width) {
    context.moveTo(endX, 0);
    context.lineTo(endX, height);
  }
  context.stroke();

  context.fillStyle = "#ffffff";
  if (startX >= 0 && startX <= width) {
    context.fillRect(startX - 4, 10, 8, 34);
  }
  if (endX >= 0 && endX <= width) {
    context.fillRect(endX - 4, 10, 8, 34);
  }

  const progress = buffer.duration > 0 ? getPlaybackPosition() / buffer.duration : 0;
  const progressX = ((clamp(progress, 0, 1) - view.start) / view.length) * width;
  context.fillStyle = "rgba(255, 51, 102, 0.16)";
  context.fillRect(0, 0, clamp(progressX, 0, width), height);

  context.strokeStyle = "#ff3366";
  context.lineWidth = 2;
  context.beginPath();
  if (progressX >= 0 && progressX <= width) {
    context.moveTo(progressX, 0);
    context.lineTo(progressX, height);
  }
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
  const busy = isExportBusy();
  elements.playPauseButton.disabled = !hasBuffer || busy;
  elements.stopButton.disabled = !hasBuffer || busy;
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
    elements.metaLeadingSilence.textContent = "-";
    elements.metaTrailingSilence.textContent = "-";
    elements.metaTruePeak.textContent = "-";
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
  elements.metaLeadingSilence.textContent = formatDuration(analysis.leadingSilenceSeconds);
  elements.metaTrailingSilence.textContent = formatDuration(analysis.trailingSilenceSeconds);
  elements.metaTruePeak.textContent = formatDb(gainToDb(analysis.truePeakEstimate));
  elements.trimStartTime.textContent = formatDuration(trimRange.startRatio * file.audioBuffer.duration);
  elements.trimEndTime.textContent = formatDuration(trimRange.endRatio * file.audioBuffer.duration);
}

function renderWarnings() {
  const file = getSelectedFile();
  const analysis = getActiveAnalysis(file);
  const settings = getSettingsForFile(file);
  elements.analysisWarnings.innerHTML = "";

  if (!file || !analysis) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = "Load an audio file to see clipping and processing notes.";
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

  if (analysis.truePeakEstimate >= dbToGain(-0.1)) {
    notes.push({
      type: "note",
      text: `Estimated true peak is ${formatDb(gainToDb(analysis.truePeakEstimate))}. Leave extra headroom before resampling or lossy preview export.`,
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
  const busy = isExportBusy();
  const hasProcessedPreview = Boolean(selected?.processedBuffer);

  renderFileList();
  renderMeta();
  renderWarnings();
  renderCleanupSuggestion();
  renderCleanedOutputs();
  renderPreflight();
  updateControlLabels();
  renderBatchProgress();
  syncCleanupPresetUi();
  updateTransportButtons();
  updateProgressUi();
  drawWaveform();

  elements.waveformEmptyButton.classList.toggle("is-hidden", Boolean(selected));
  elements.applyButton.disabled = !selected || busy;
  elements.resetPreviewButton.disabled = !selected || state.previewMode !== "processed" || busy;
  elements.manualTrimReset.disabled = !selected || busy || ((selected.trimStartRatio ?? 0) === 0 && (selected.trimEndRatio ?? 1) === 1);
  elements.waveformZoomOut.disabled = state.waveformZoom <= 1 || busy;
  elements.waveformZoomIn.disabled = !selected || state.waveformZoom >= 16 || busy;
  elements.waveformZoomFit.disabled = state.waveformZoom <= 1 || busy;
  elements.waveformZoomValue.textContent = `${Math.round(state.waveformZoom * 100)}%`;
  elements.undoButton.disabled = !state.undoStack.length || busy;
  elements.redoButton.disabled = !state.redoStack.length || busy;
  elements.exportButton.disabled = !selected || busy;
  elements.exportZipButton.disabled = !getSelectedExportFiles().length || busy;
  elements.exportMp3Button.disabled = !getSelectedExportFiles().length || busy || !window.lamejs?.Mp3Encoder;
  elements.exportManifestButton.disabled = !state.files.length || busy;
  elements.cancelExportButton.disabled = !busy || !state.exportMode;
  elements.clearQueueButton.disabled = !state.files.length || busy;
  elements.saveFileOverrideButton.disabled = !selected || busy;
  elements.resetFileOverrideButton.disabled = !selected?.settingsOverride || busy;
  elements.exportSettingsButton.disabled = busy;
  elements.importSettingsButton.disabled = busy;
  setButtonLoading(
    elements.applyButton,
    state.processingMode === "preview" ? "Processing preview..." : "Apply processing preview",
    state.processingMode === "preview",
  );
  setButtonLoading(
    elements.exportButton,
    state.exportMode === "wav" ? "Exporting WAV..." : "Export selected WAV",
    state.exportMode === "wav",
  );
  setButtonLoading(
    elements.exportZipButton,
    state.exportMode === "zip" ? "Exporting ZIP..." : "Export queue as ZIP",
    state.exportMode === "zip",
  );
  setButtonLoading(
    elements.exportMp3Button,
    !window.lamejs?.Mp3Encoder ? "MP3 encoder unavailable" : state.exportMode === "mp3" ? "Encoding MP3..." : "Export MP3 montage",
    state.exportMode === "mp3",
  );
  elements.exportMp3Button.title = window.lamejs?.Mp3Encoder
    ? "Create an MP3 preview montage from the selected cleaned files."
    : "The bundled local MP3 encoder did not load. Reload the page and try again.";

  elements.previewOriginalButton.disabled = !selected;
  elements.previewProcessedButton.disabled = !selected || !hasProcessedPreview;
  elements.previewOriginalButton.classList.toggle("is-active", state.previewMode !== "processed");
  elements.previewProcessedButton.classList.toggle("is-active", state.previewMode === "processed" && hasProcessedPreview);
  elements.previewModeLabel.textContent = state.previewMode === "processed" && activeBuffer ? "After: processed" : "Before: original";
  elements.previewStateText.textContent = getPreviewStateText(selected, hasProcessedPreview);
}

function getPreviewStateText(file, hasProcessedPreview) {
  if (!file) {
    return "Load an audio file to compare the original and processed preview.";
  }
  if (state.previewMode === "processed" && hasProcessedPreview) {
    return "Previewing the processed result that will be used for export.";
  }
  if (hasProcessedPreview) {
    return "Previewing the original file. Switch to After to compare the cleaned preview.";
  }
  return "Previewing the original file. Apply processing preview to create the After version.";
}

function showPreviewMode(mode) {
  const file = getSelectedFile();
  if (!file) {
    return;
  }
  stopPlayback();
  state.previewMode = mode === "processed" && file.processedBuffer ? "processed" : "original";
  state.playbackOffset = 0;
  updateUi();
}

async function applyProcessingPreview() {
  const file = getSelectedFile();
  if (!file) {
    return;
  }

  try {
    stopPlayback();
    state.cancelRequested = false;
    setProcessingMode("preview");
    setStatus(`Processing preview locally: ${file.name}`);
    await waitForPaint();
    const result = processAudioBuffer(file.audioBuffer, getSettingsForFile(file), getManualTrimRange(file));
    file.processedBuffer = result.buffer;
    file.processedAnalysis = result.analysis;
    file.processReport = result.report;
    file.batchStatus = result.analysis.clippedSamples ? "warning" : "preview";
    file.waveformCache.processed = null;
    state.previewMode = "processed";
    state.playbackOffset = 0;
    setStatus("Processing preview updated. Export will use these cleanup settings.", "success");
  } catch (error) {
    console.error(error);
    setStatus("Processing failed. Try a shorter audio file or less aggressive settings.", "error");
  } finally {
    setProcessingMode(null);
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

function saveSettingsForSelectedFile() {
  const file = getSelectedFile();
  if (!file || isExportBusy()) {
    return;
  }
  const historySnapshot = captureWorkspaceState();
  file.settingsOverride = { ...getSettings() };
  pushWorkspaceHistory(historySnapshot, "file cleanup settings");
  clearProcessedPreview(`Saved custom cleanup settings for ${file.name}. Apply the preview to audition them.`);
}

function resetSettingsForSelectedFile() {
  const file = getSelectedFile();
  if (!file || isExportBusy()) {
    return;
  }
  const historySnapshot = captureWorkspaceState();
  file.settingsOverride = null;
  pushWorkspaceHistory(historySnapshot, "global cleanup settings");
  clearProcessedPreview(`Restored global cleanup settings for ${file.name}.`);
}

function exportCleanupSettings() {
  const payload = {
    tool: "Wave Mutator",
    version: "0.2.0",
    exportedAt: new Date().toISOString(),
    cleanup: getSettings(),
  };
  downloadBlob(
    new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" }),
    "wave-mutator-cleanup-settings.json",
  );
  setStatus("Downloaded local cleanup settings.", "success");
}

function isValidImportedSettings(value) {
  return value && typeof value === "object"
    && ["trimSilence", "fadeEnabled", "normalizeEnabled", "detectClipping"].every((key) => typeof value[key] === "boolean")
    && ["trimThresholdDb", "trimMinSilenceMs", "trimPaddingMs", "fadeMs", "targetPeakDb"].every((key) => Number.isFinite(Number(value[key])));
}

async function importCleanupSettings(file) {
  if (!file || isExportBusy()) {
    return;
  }
  try {
    const parsed = JSON.parse(await file.text());
    const settings = parsed.cleanup || parsed;
    if (!isValidImportedSettings(settings)) {
      throw new Error("The file does not contain a valid Wave Mutator cleanup configuration.");
    }
    const historySnapshot = captureWorkspaceState();
    applySettingsToControls(settings);
    invalidateProcessedPreviews();
    pushWorkspaceHistory(historySnapshot, "imported cleanup settings");
    setStatus("Imported cleanup settings locally. Processed previews were marked stale.", "success");
    updateUi();
  } catch (error) {
    console.error(error);
    setStatus("Could not import cleanup settings. Choose a valid Wave Mutator JSON settings file.", "error");
  } finally {
    elements.settingsFileInput.value = "";
  }
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
    if (state.cancelRequested) {
      throw new Error("Batch cancelled.");
    }
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

function downloadBlob(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1200);
}

function createManifestText(files, exportSettings = getExportSettings()) {
  const reviewFiles = files.filter((file) => getPreflightStatus(file).type !== "good");
  const clippedFiles = files.filter((file) => (file.processedAnalysis || file.originalAnalysis).clippedSamples > 0);
  const totalDuration = files.reduce((total, file) => total + (file.processedBuffer || file.audioBuffer).duration, 0);
  const rows = files.map((file, index) => {
    const outputBuffer = file.processedBuffer || file.audioBuffer;
    const analysis = file.processedAnalysis || file.originalAnalysis;
    const settings = getSettingsForFile(file);
    const report = file.processReport;
    const status = getPreflightStatus(file);
    return [
      `${index + 1}. ${makeExportFileName(file.name, index + 1, exportSettings)}`,
      `   Source: ${file.name} (${file.format || "Audio"})`,
      `   Source duration: ${formatDuration(file.audioBuffer.duration)} | Output duration: ${formatDuration(outputBuffer.duration)}`,
      `   Source format: ${file.audioBuffer.sampleRate} Hz | ${file.audioBuffer.numberOfChannels} channel(s)`,
      `   Export target: ${exportSettings.bitDepth === "32f" ? "32-bit float" : `${exportSettings.bitDepth}-bit PCM`} | ${exportSettings.sampleRateMode === "original" ? "original sample rate" : `${Number(exportSettings.sampleRateMode) / 1000} kHz`} | ${exportSettings.channelMode === "mono" ? "mono sum" : "original channels"}`,
      `   Peak: ${formatDb(analysis.peakDb)} | Estimated true peak: ${formatDb(gainToDb(analysis.truePeakEstimate))} | Clipping: ${analysis.clippedSamples ? `${analysis.clippedSamples.toLocaleString()} samples` : "none"}`,
      `   Cleanup: Trim ${settings.trimSilence ? `${settings.trimThresholdDb} dB, ${settings.trimMinSilenceMs} ms minimum, ${settings.trimPaddingMs} ms padding` : "off"} | Fade ${settings.fadeEnabled ? `${settings.fadeMs} ms` : "off"} | Normalize ${settings.normalizeEnabled ? `${settings.targetPeakDb} dBFS` : "off"}`,
      `   Edits: Manual trim ${report?.manualTrimmedSamples ? formatDuration(report.manualTrimmedSamples / file.audioBuffer.sampleRate) : "none"} | Auto trim ${report?.trimSkipped ? "skipped" : report?.trimmedSamples ? formatDuration(report.trimmedSamples / file.audioBuffer.sampleRate) : report ? "none" : "not previewed"} | Settings ${file.settingsOverride ? "custom" : "global"}`,
      `   QA: ${status.label}${file.exportSelected === false ? " | Excluded from selected export scope" : ""}`,
    ].join("\n");
  });
  return [
    "Wave Mutator free pack report",
    `Created locally: ${new Date().toISOString()}`,
    `Pack: ${exportSettings.packName}`,
    `Files: ${files.length} | Combined cleaned duration: ${formatDuration(totalDuration)} | Review items: ${reviewFiles.length} | Files with clipping: ${clippedFiles.length}`,
    `Naming: ${exportSettings.namingTemplate}`,
    "All measurements and cleanup are local browser analysis. Estimated true peak is a guide, not certified true-peak metering.",
    "",
    ...rows,
    "",
    "All audio was processed locally in Wave Mutator. No files were uploaded.",
  ].join("\n");
}

function exportManifest() {
  const files = getSelectedExportFiles();
  if (!files.length) {
    setStatus("Select at least one file before downloading a manifest.", "error");
    return;
  }
  const settings = getExportSettings();
  downloadBlob(new Blob([createManifestText(files, settings)], { type: "text/plain;charset=utf-8" }), `${settings.packName}_manifest.txt`);
  setStatus(`Downloaded a local manifest for ${files.length} ${files.length === 1 ? "file" : "files"}.`, "success");
}

function cancelBatch() {
  if (!state.exportMode) {
    return;
  }
  state.cancelRequested = true;
  setStatus("Cancelling batch after the current audio operation finishes.");
  setBatchProgress("Cancelling batch", state.batchProgress.percent, "Stopping");
  updateUi();
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

function makeMontageFileName(exportSettings = getExportSettings()) {
  return `${sanitizeFileBaseName(exportSettings.packName || "wave-mutator-pack")}_preview_montage.mp3`;
}

function readBufferSample(buffer, channel, sampleIndex) {
  if (buffer.numberOfChannels === 1) {
    return buffer.getChannelData(0)[sampleIndex] || 0;
  }
  const sourceChannel = Math.min(channel, buffer.numberOfChannels - 1);
  return buffer.getChannelData(sourceChannel)[sampleIndex] || 0;
}

function copyClipToMontage(sourceBuffer, outputBuffer, outputStartSample, clipSamples) {
  const fadeSamples = Math.min(Math.round(outputBuffer.sampleRate * 0.025), Math.floor(clipSamples / 3));

  for (let channel = 0; channel < outputBuffer.numberOfChannels; channel += 1) {
    const target = outputBuffer.getChannelData(channel);
    for (let index = 0; index < clipSamples; index += 1) {
      let gain = 1;
      if (fadeSamples > 1 && index < fadeSamples) {
        gain = index / fadeSamples;
      } else if (fadeSamples > 1 && index >= clipSamples - fadeSamples) {
        gain = (clipSamples - index - 1) / fadeSamples;
      }
      target[outputStartSample + index] = readBufferSample(sourceBuffer, channel, index) * clamp(gain, 0, 1);
    }
  }
}

async function buildPreviewMontageBuffer(onProgress) {
  const montageSettings = getMontageSettings();
  const clips = [];
  const montageFiles = getSelectedExportFiles();

  for (let index = 0; index < montageFiles.length; index += 1) {
    if (state.cancelRequested) {
      throw new Error("Batch cancelled.");
    }
    const file = montageFiles[index];
    const percent = montageFiles.length ? (index / montageFiles.length) * 62 : 0;
    try {
      file.batchStatus = "montage";
      renderFileList();
      onProgress?.(`Preparing montage clip ${index + 1} of ${montageFiles.length}: ${file.name}`, percent, `${index}/${montageFiles.length}`);

      const result = processAudioBuffer(file.audioBuffer, getSettingsForFile(file), getManualTrimRange(file));
      const resampled = await resampleBuffer(result.buffer, String(montageSettings.sampleRate));
      const clipSamples = Math.min(resampled.length, Math.round(montageSettings.clipSeconds * montageSettings.sampleRate));
      if (clipSamples <= 0) {
        file.batchStatus = "failed";
        continue;
      }

      file.processedBuffer = result.buffer;
      file.processedAnalysis = result.analysis;
      file.processReport = result.report;
      file.batchStatus = result.analysis.clippedSamples ? "warning" : "processed";
      file.waveformCache.processed = null;
      clips.push({ buffer: resampled, clipSamples });
      await waitForPaint();
    } catch (error) {
      console.error(error);
      file.batchStatus = "failed";
    }
  }

  if (!clips.length) {
    throw new Error("No montage clips could be prepared.");
  }

  const gapSamples = Math.round(montageSettings.gapSeconds * montageSettings.sampleRate);
  const totalSamples = clips.reduce((sum, clip, index) => {
    return sum + clip.clipSamples + (index < clips.length - 1 ? gapSamples : 0);
  }, 0);
  const output = getAudioContext().createBuffer(montageSettings.channels, totalSamples, montageSettings.sampleRate);
  let offset = 0;

  onProgress?.(`Assembling ${clips.length} montage ${clips.length === 1 ? "clip" : "clips"}`, 66, "Assembling");
  for (const clip of clips) {
    copyClipToMontage(clip.buffer, output, offset, clip.clipSamples);
    offset += clip.clipSamples + gapSamples;
  }

  return output;
}

async function encodeBufferAsMp3(buffer, onProgress) {
  if (!window.lamejs?.Mp3Encoder) {
    throw new Error("The bundled MP3 encoder is unavailable.");
  }

  const channelCount = buffer.numberOfChannels > 1 ? 2 : 1;
  const encoder = new window.lamejs.Mp3Encoder(channelCount, buffer.sampleRate, 192);
  const blockSize = 1152;
  const totalBlocks = Math.ceil(buffer.length / blockSize);
  const chunks = [];
  const left = buffer.getChannelData(0);
  const right = channelCount === 2 ? buffer.getChannelData(1) : null;

  for (let start = 0, block = 0; start < buffer.length; start += blockSize, block += 1) {
    if (state.cancelRequested) {
      throw new Error("Batch cancelled.");
    }
    const end = Math.min(buffer.length, start + blockSize);
    const leftPcm = new Int16Array(end - start);
    const rightPcm = channelCount === 2 ? new Int16Array(end - start) : null;
    for (let index = start, target = 0; index < end; index += 1, target += 1) {
      leftPcm[target] = Math.round(clamp(left[index], -1, 1) * 32767);
      if (rightPcm) {
        rightPcm[target] = Math.round(clamp(right[index], -1, 1) * 32767);
      }
    }
    const encoded = channelCount === 2
      ? encoder.encodeBuffer(leftPcm, rightPcm)
      : encoder.encodeBuffer(leftPcm);
    if (encoded.length) {
      chunks.push(new Uint8Array(encoded));
    }

    if (block % 24 === 0 || block === totalBlocks - 1) {
      const percent = 70 + ((block + 1) / Math.max(1, totalBlocks)) * 28;
      onProgress?.("Encoding MP3 montage locally", percent, `${block + 1}/${totalBlocks} blocks`);
      await waitForPaint();
    }
  }

  const flush = encoder.flush();
  if (flush.length) {
    chunks.push(new Uint8Array(flush));
  }
  return new Blob(chunks, { type: "audio/mpeg" });
}

async function exportMp3Montage() {
  const montageFiles = getSelectedExportFiles();
  if (!montageFiles.length || !window.lamejs?.Mp3Encoder) {
    setStatus("MP3 montage export is unavailable because no files are selected or the local encoder did not load.", "error");
    return;
  }

  try {
    stopPlayback();
    state.cancelRequested = false;
    setExportMode("mp3");
    setBatchProgress("Starting MP3 montage export", 0, `0/${montageFiles.length}`);
    const progress = (label, percent, detail) => {
      setBatchProgress(label, percent, detail);
      setStatus(label);
    };

    const montageBuffer = await buildPreviewMontageBuffer(progress);
    state.previewMode = "processed";
    updateUi();

    const mp3Blob = await encodeBufferAsMp3(montageBuffer, progress);
    const exportSettings = getExportSettings();
    const montageSettings = getMontageSettings();
    const fileName = makeMontageFileName(exportSettings);
    downloadBlob(mp3Blob, fileName);

    setBatchProgress(`Exported ${fileName}`, 100, "Done");
    state.montageOutput = {
      fileName,
      fileCount: montageFiles.length,
      duration: montageBuffer.duration,
      clipSeconds: montageSettings.clipSeconds,
      gapSeconds: montageSettings.gapSeconds,
    };
    setStatus(`Exported MP3 preview montage as ${fileName}.`, "success");
  } catch (error) {
    console.error(error);
    const cancelled = state.cancelRequested || error.message === "Batch cancelled.";
    setBatchProgress(cancelled ? "MP3 montage cancelled" : "MP3 montage export failed", 0, cancelled ? "Cancelled" : "Failed");
    setStatus(cancelled ? "MP3 montage export cancelled. Original files are unchanged." : "MP3 montage export failed. Try a shorter queue or reload the page.", cancelled ? "neutral" : "error");
  } finally {
    state.cancelRequested = false;
    setExportMode(null);
    updateUi();
  }
}

async function exportSelectedFile() {
  const file = getSelectedFile();
  if (!file) {
    return;
  }

  try {
    stopPlayback();
    setExportMode("wav");
    setBatchProgress(`Rendering selected WAV: ${file.name}`, 15, "Preparing");
    const exportSettings = getExportSettings();
    const result = processAudioBuffer(file.audioBuffer, getSettingsForFile(file), getManualTrimRange(file));
    setBatchProgress(`Encoding selected WAV: ${file.name}`, 65, "Encoding");
    const exportBuffer = await prepareExportBuffer(result.buffer, exportSettings);
    file.processedBuffer = result.buffer;
    file.processedAnalysis = result.analysis;
    file.processReport = result.report;
    file.batchStatus = result.analysis.clippedSamples ? "warning" : "processed";
    file.waveformCache.processed = null;
    state.previewMode = "processed";

    const blob = encodeWav(exportBuffer, exportSettings);
    const fileName = makeExportFileName(file.name, 1, exportSettings);
    downloadBlob(blob, fileName);

    setBatchProgress(`Exported ${fileName}`, 100, "Done");
    setStatus(`Exported ${fileName}.`, "success");
    setExportMode(null);
    updateUi();
  } catch (error) {
    console.error(error);
    setExportMode(null);
    setStatus("Export failed. Try a shorter WAV file or reload the page and try again.", "error");
    setBatchProgress("Selected WAV export failed", 0, "Failed");
    updateUi();
  }
}

async function exportAllAsZip() {
  const queueFiles = getSelectedExportFiles();
  if (!queueFiles.length) {
    setStatus("Select at least one file before exporting a ZIP.", "error");
    return;
  }

  const exportSettings = getExportSettings();
  const usedNames = new Set();
  const zipEntries = [];

  try {
    stopPlayback();
    state.cancelRequested = false;
    setExportMode("zip");
    setBatchProgress("Starting ZIP export", 0, `0/${queueFiles.length}`);

    for (let index = 0; index < queueFiles.length; index += 1) {
      if (state.cancelRequested) {
        throw new Error("Batch cancelled.");
      }
      const file = queueFiles[index];
      try {
        file.batchStatus = "processing";
        updateUi();
        const percent = (index / queueFiles.length) * 90;
        setStatus(`Batch processing ${index + 1} of ${queueFiles.length}: ${file.name}`);
        setBatchProgress(`Cleaning ${index + 1} of ${queueFiles.length}: ${file.name}`, percent, `${index}/${queueFiles.length}`);
        await waitForPaint();
        const result = processAudioBuffer(file.audioBuffer, getSettingsForFile(file), getManualTrimRange(file));
        const exportBuffer = await prepareExportBuffer(result.buffer, exportSettings);
        const blob = encodeWav(exportBuffer, exportSettings);
        const fileName = uniqueFileName(makeExportFileName(file.name, index + 1, exportSettings), usedNames);

        file.processedBuffer = result.buffer;
        file.processedAnalysis = result.analysis;
        file.processReport = result.report;
        file.batchStatus = result.analysis.clippedSamples ? "warning" : "processed";
        zipEntries.push({ name: fileName, blob });
      } catch (error) {
        if (state.cancelRequested || error.message === "Batch cancelled.") {
          throw error;
        }
        console.error(error);
        file.batchStatus = "failed";
      }
    }

    if (!zipEntries.length) {
      setExportMode(null);
      setBatchProgress("ZIP export failed", 0, "Failed");
      setStatus("Batch export failed. No files could be processed.", "error");
      updateUi();
      return;
    }

    const manifestBlob = new Blob([createManifestText(queueFiles, exportSettings)], { type: "text/plain;charset=utf-8" });
    zipEntries.push({ name: `${exportSettings.packName}_manifest.txt`, blob: manifestBlob });
    setBatchProgress(`Building ZIP with ${zipEntries.length - 1} WAV files and manifest`, 94, "Zipping");
    const zipBlob = await createZip(zipEntries);
    const zipName = `${exportSettings.packName}.zip`;
    downloadBlob(zipBlob, zipName);
    setBatchProgress(`Exported ${zipName}`, 100, "Done");
    setStatus(`Exported ${zipEntries.length - 1} cleaned WAV ${zipEntries.length - 1 === 1 ? "file" : "files"} and a manifest as ${zipName}.`, "success");
  } catch (error) {
    console.error(error);
    const cancelled = state.cancelRequested || error.message === "Batch cancelled.";
    setBatchProgress(cancelled ? "ZIP export cancelled" : "ZIP export failed", 0, cancelled ? "Cancelled" : "Failed");
    setStatus(cancelled ? "ZIP export cancelled. Processed previews remain available; original files are unchanged." : "ZIP export failed. Try fewer or shorter WAV files.", cancelled ? "neutral" : "error");
  } finally {
    state.cancelRequested = false;
    setExportMode(null);
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
  const view = getWaveformView();
  const localRatio = clamp((event.clientX - rect.left) / rect.width, 0, 1);
  return view.start + localRatio * view.length;
}

function trimHandleFromEvent(event) {
  const file = getSelectedFile();
  if (!file) {
    return null;
  }

  const rect = elements.waveform.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const trimRange = getManualTrimRange(file);
  const view = getWaveformView();
  const startX = ((trimRange.startRatio - view.start) / view.length) * rect.width;
  const endX = ((trimRange.endRatio - view.start) / view.length) * rect.width;
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

function snapRatioToZeroCrossing(file, ratio) {
  if (!elements.snapZeroCrossings.checked) {
    return ratio;
  }
  const data = file.audioBuffer.getChannelData(0);
  const target = clamp(Math.round(ratio * (data.length - 1)), 0, data.length - 1);
  const searchRadius = Math.max(1, Math.round(file.audioBuffer.sampleRate * 0.012));
  let nearest = target;
  let nearestDistance = Infinity;

  for (let distance = 0; distance <= searchRadius; distance += 1) {
    for (const index of [target - distance, target + distance]) {
      if (index < 1 || index >= data.length) {
        continue;
      }
      const crossedZero = (data[index - 1] <= 0 && data[index] >= 0) || (data[index - 1] >= 0 && data[index] <= 0);
      if (crossedZero && distance < nearestDistance) {
        nearest = index;
        nearestDistance = distance;
      }
    }
    if (nearestDistance !== Infinity) {
      break;
    }
  }

  return nearest / Math.max(1, data.length - 1);
}

function updateManualTrim(handle, ratio) {
  const file = getSelectedFile();
  if (!file) {
    return;
  }

  const minGap = Math.max(1 / file.audioBuffer.length, 0.002);
  clearProcessedForManualEdit();

  const snappedRatio = snapRatioToZeroCrossing(file, ratio);
  if (handle === "start") {
    file.trimStartRatio = clamp(snappedRatio, 0, file.trimEndRatio - minGap);
  } else {
    file.trimEndRatio = clamp(snappedRatio, file.trimStartRatio + minGap, 1);
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
  const historySnapshot = captureWorkspaceState();
  clearProcessedForManualEdit();
  file.trimStartRatio = 0;
  file.trimEndRatio = 1;
  pushWorkspaceHistory(historySnapshot, "manual trim reset");
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
  beginWorkspaceEdit("manual trim");
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
  commitWorkspaceEdit();
  setStatus("Manual trim updated. Apply processing preview to audition the result.");
  updateUi();
}

function handleWaveformClick(event) {
  if (state.suppressNextWaveformClick) {
    state.suppressNextWaveformClick = false;
    return;
  }
  seekToRatio(waveformRatioFromEvent(event));
}

function handleKeyboardShortcut(event) {
  const target = event.target;
  const isFormControl = target instanceof HTMLInputElement
    || target instanceof HTMLSelectElement
    || target instanceof HTMLTextAreaElement
    || target?.isContentEditable;
  if (isFormControl || isExportBusy()) {
    return;
  }

  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "z") {
    event.preventDefault();
    if (event.shiftKey) {
      redoWorkspaceEdit();
    } else {
      undoWorkspaceEdit();
    }
    return;
  }

  if (event.code === "Space") {
    event.preventDefault();
    if (state.isPlaying) {
      pausePlayback();
    } else {
      playFrom(state.playbackOffset).catch((error) => {
        console.error(error);
        setStatus("Playback could not start. Check your browser audio permissions and try again.", "error");
      });
    }
    return;
  }

  if (event.key.toLowerCase() === "s") {
    event.preventDefault();
    stopPlayback();
    return;
  }

  if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
    const buffer = getActiveBuffer();
    if (!buffer) {
      return;
    }
    event.preventDefault();
    const seconds = event.shiftKey ? 5 : 1;
    const direction = event.key === "ArrowLeft" ? -1 : 1;
    seekToRatio((getPlaybackPosition() + direction * seconds) / buffer.duration);
  }
}

function bindEvents() {
  elements.workflowTabs.forEach((button) => {
    button.addEventListener("click", () => scrollToWorkflowTarget(button.dataset.scrollTarget));
  });

  elements.strengthPresets.forEach((button) => {
    button.setAttribute("aria-pressed", String(button.classList.contains("is-active")));
    button.addEventListener("click", () => applyCleanupPreset(button.dataset.preset));
  });

  elements.fileInput.addEventListener("change", (event) => loadFiles(event.target.files));
  elements.waveformEmptyButton.addEventListener("click", () => elements.fileInput.click());
  elements.waveformZoomOut.addEventListener("click", () => setWaveformZoom(state.waveformZoom / 2));
  elements.waveformZoomIn.addEventListener("click", () => setWaveformZoom(state.waveformZoom * 2));
  elements.waveformZoomFit.addEventListener("click", () => setWaveformZoom(1));
  elements.undoButton.addEventListener("click", undoWorkspaceEdit);
  elements.redoButton.addEventListener("click", redoWorkspaceEdit);

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
  elements.saveFileOverrideButton.addEventListener("click", saveSettingsForSelectedFile);
  elements.resetFileOverrideButton.addEventListener("click", resetSettingsForSelectedFile);
  elements.applySuggestionButton.addEventListener("click", applyCleanupSuggestion);
  elements.exportSettingsButton.addEventListener("click", exportCleanupSettings);
  elements.importSettingsButton.addEventListener("click", () => elements.settingsFileInput.click());
  elements.settingsFileInput.addEventListener("change", (event) => importCleanupSettings(event.target.files[0]));
  elements.previewOriginalButton.addEventListener("click", () => showPreviewMode("original"));
  elements.previewProcessedButton.addEventListener("click", () => showPreviewMode("processed"));
  elements.manualTrimReset.addEventListener("click", resetManualTrim);
  elements.exportButton.addEventListener("click", exportSelectedFile);
  elements.exportZipButton.addEventListener("click", exportAllAsZip);
  elements.exportMp3Button.addEventListener("click", exportMp3Montage);
  elements.exportManifestButton.addEventListener("click", exportManifest);
  elements.cancelExportButton.addEventListener("click", cancelBatch);
  elements.clearQueueButton.addEventListener("click", clearQueue);

  [
    elements.trimSilence,
    elements.trimThreshold,
    elements.trimMinSilence,
    elements.trimPadding,
    elements.fadeEnabled,
    elements.fadeMs,
    elements.normalizeEnabled,
    elements.targetPeak,
    elements.detectClipping,
    elements.montageSeconds,
    elements.montageGap,
  ].forEach((control) => {
    control.addEventListener("pointerdown", () => beginWorkspaceEdit("cleanup settings"));
    control.addEventListener("focus", () => beginWorkspaceEdit("cleanup settings"));
    control.addEventListener("keydown", () => beginWorkspaceEdit("cleanup settings"));
    control.addEventListener("input", () => {
      updateControlLabels();
      if (control === elements.montageSeconds || control === elements.montageGap) {
        state.montageOutput = null;
        setBatchProgress("Montage settings updated", 0, "Ready");
        updateUi();
        return;
      }
      syncCleanupPresetUi();
      state.montageOutput = null;
      if (getSelectedFile()) {
        clearGlobalProcessedPreviews("Global processing settings changed.");
      } else {
        setStatus("Processing settings updated. Load an audio file to audition them.");
        updateUi();
      }
    });
    control.addEventListener("change", () => {
      commitWorkspaceEdit();
      updateUi();
    });
    control.addEventListener("blur", () => {
      if (state.pendingHistory) {
        commitWorkspaceEdit();
        updateUi();
      }
    });
  });

  [
    elements.namingTemplate,
    elements.packName,
    elements.bitDepth,
    elements.sampleRateMode,
    elements.channelMode,
    elements.exportScope,
  ].forEach((control) => {
    control.addEventListener("input", updateUi);
  });

  window.addEventListener("keydown", handleKeyboardShortcut);
  window.addEventListener("resize", drawWaveform);
}

bindEvents();
updateUi();

if (new URLSearchParams(window.location.search).get("self_test") === "1") {
  runSelfTestFixture();
}

window.waveMutator = {
  analyzeBuffer,
  processAudioBuffer,
  encodeWav,
  makeExportFileName,
  buildPreviewMontageBuffer,
  dbToGain,
};

window.kreativSamplePrep = window.waveMutator;

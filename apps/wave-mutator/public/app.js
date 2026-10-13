"use strict";

const state = {
  audioContext: null,
  files: [],
  selectedId: null,
  nextId: 1,
  previewMode: "original",
  workspaceView: "clean",
  playbackSource: null,
  playbackStartedAt: 0,
  playbackOffset: 0,
  playbackEnd: null,
  isPlaying: false,
  animationFrame: null,
  selectionDragHandle: null,
  waveformPointerStartRatio: null,
  waveformPointerStartX: null,
  waveformSelectionDragging: false,
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
  waveformZoomSelection: document.querySelector("#waveform-zoom-selection"),
  waveformZoomValue: document.querySelector("#waveform-zoom-value"),
  undoButton: document.querySelector("#undo-button"),
  redoButton: document.querySelector("#redo-button"),
  progressFill: document.querySelector("#progress-fill"),
  playPauseButton: document.querySelector("#play-pause-button"),
  stopButton: document.querySelector("#stop-button"),
  timeReadout: document.querySelector("#time-readout"),
  previewModeLabel: document.querySelector("#preview-mode-label"),
  previewWorkspaceLabel: document.querySelector("#preview-workspace-label"),
  previewOriginalButton: document.querySelector("#preview-original-button"),
  previewEditedButton: document.querySelector("#preview-edited-button"),
  previewProcessedButton: document.querySelector("#preview-processed-button"),
  quickCleanViewButton: document.querySelector("#quick-clean-view-button"),
  editorViewButton: document.querySelector("#editor-view-button"),
  returnToCleanButton: document.querySelector("#return-to-clean-button"),
  editorOnly: document.querySelectorAll("[data-editor-only]"),
  cleanOnly: document.querySelectorAll("[data-clean-only]"),
  editorPreviewNotice: document.querySelector("#editor-preview-notice"),
  editorPreviewNoticeText: document.querySelector("#editor-preview-notice-text"),
  resumeEditingButton: document.querySelector("#resume-editing-button"),
  previewStateText: document.querySelector("#preview-state-text"),
  metaName: document.querySelector("#meta-name"),
  metaDuration: document.querySelector("#meta-duration"),
  metaSampleRate: document.querySelector("#meta-sample-rate"),
  metaChannels: document.querySelector("#meta-channels"),
  metaSourceFormat: document.querySelector("#meta-source-format"),
  metaOutputFormat: document.querySelector("#meta-output-format"),
  metaPeak: document.querySelector("#meta-peak"),
  metaClipping: document.querySelector("#meta-clipping"),
  metaRms: document.querySelector("#meta-rms"),
  metaDcOffset: document.querySelector("#meta-dc-offset"),
  metaStereoBalance: document.querySelector("#meta-stereo-balance"),
  metaLeadingSilence: document.querySelector("#meta-leading-silence"),
  metaTrailingSilence: document.querySelector("#meta-trailing-silence"),
  selectionClearButton: document.querySelector("#selection-clear-button"),
  snapZeroCrossings: document.querySelector("#snap-zero-crossings"),
  selectionStartInput: document.querySelector("#selection-start-input"),
  selectionEndInput: document.querySelector("#selection-end-input"),
  selectionDuration: document.querySelector("#selection-duration"),
  playSelectionButton: document.querySelector("#play-selection-button"),
  editTrimButton: document.querySelector("#edit-trim-button"),
  editDeleteButton: document.querySelector("#edit-delete-button"),
  editSilenceButton: document.querySelector("#edit-silence-button"),
  editFadeInButton: document.querySelector("#edit-fade-in-button"),
  editFadeOutButton: document.querySelector("#edit-fade-out-button"),
  editGainInput: document.querySelector("#edit-gain-input"),
  editGainButton: document.querySelector("#edit-gain-button"),
  editHistoryList: document.querySelector("#edit-history-list"),
  clearEditsButton: document.querySelector("#clear-edits-button"),
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
  reportSelectionEdits: document.querySelector("#report-selection-edits"),
  reportOutputPeak: document.querySelector("#report-output-peak"),
  metaTruePeak: document.querySelector("#meta-true-peak"),
  exportButton: document.querySelector("#export-button"),
  exportZipButton: document.querySelector("#export-zip-button"),
  exportMp3Button: document.querySelector("#export-mp3-button"),
  exportManifestButton: document.querySelector("#export-manifest-button"),
  cancelExportButton: document.querySelector("#cancel-export-button"),
  deliveryProfileButtons: document.querySelectorAll("[data-delivery-profile]"),
  deliveryProfileSummary: document.querySelector("#delivery-profile-summary"),
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
const APP_VERSION = "0.2.4";
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

const DELIVERY_PROFILES = {
  "sample-pack": {
    label: "Sample Pack One-Shots",
    cleanup: {
      trimSilence: true,
      trimThresholdDb: -60,
      trimMinSilenceMs: 60,
      trimPaddingMs: 20,
      fadeEnabled: true,
      fadeMs: 10,
      normalizeEnabled: true,
      targetPeakDb: -1,
      detectClipping: true,
    },
    export: {
      bitDepth: "24",
      sampleRateMode: "original",
      channelMode: "original",
      namingTemplate: "{name}_clean",
      packName: "wave-mutator-free-one-shots",
    },
    montage: { clipSeconds: 3, gapSeconds: 0.35 },
    summary: "24-bit WAV at the original sample rate, preserved channels, -1 dB peak, and concise one-shot previews.",
  },
  "music-pack": {
    label: "Music Pack",
    cleanup: {
      trimSilence: true,
      trimThresholdDb: -60,
      trimMinSilenceMs: 60,
      trimPaddingMs: 20,
      fadeEnabled: true,
      fadeMs: 10,
      normalizeEnabled: true,
      targetPeakDb: -1,
      detectClipping: true,
    },
    export: {
      bitDepth: "16",
      sampleRateMode: "44100",
      channelMode: "original",
      namingTemplate: "{name}_music",
      packName: "wave-mutator-free-music",
    },
    montage: { clipSeconds: 5, gapSeconds: 0.5 },
    summary: "16-bit, 44.1 kHz WAV delivery with longer preview clips for music-focused sound packs.",
  },
  "game-sfx": {
    label: "Video / Game SFX",
    cleanup: {
      trimSilence: true,
      trimThresholdDb: -54,
      trimMinSilenceMs: 40,
      trimPaddingMs: 12,
      fadeEnabled: true,
      fadeMs: 12,
      normalizeEnabled: true,
      targetPeakDb: -1,
      detectClipping: true,
    },
    export: {
      bitDepth: "24",
      sampleRateMode: "48000",
      channelMode: "original",
      namingTemplate: "{name}_sfx",
      packName: "wave-mutator-free-game-sfx",
    },
    montage: { clipSeconds: 3, gapSeconds: 0.3 },
    summary: "Tighter cleanup with 24-bit, 48 kHz WAV output for video and game-audio workflows.",
  },
  "store-preview": {
    label: "Store Preview",
    cleanup: {
      trimSilence: true,
      trimThresholdDb: -60,
      trimMinSilenceMs: 60,
      trimPaddingMs: 20,
      fadeEnabled: true,
      fadeMs: 10,
      normalizeEnabled: true,
      targetPeakDb: -1,
      detectClipping: true,
    },
    export: {
      bitDepth: "16",
      sampleRateMode: "44100",
      channelMode: "original",
      namingTemplate: "{name}_preview",
      packName: "wave-mutator-free-store-preview",
    },
    montage: { clipSeconds: 4, gapSeconds: 0.5 },
    summary: "16-bit, 44.1 kHz WAV settings with paced clips for local store-preview montage export.",
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
  if (state.previewMode === "cleaned" && file.processedBuffer) {
    return file.processedBuffer;
  }
  return state.previewMode === "edited" ? getEditedBuffer(file) : file.audioBuffer;
}

function getActiveAnalysis(file = getSelectedFile()) {
  if (!file) {
    return null;
  }
  if (state.previewMode === "cleaned" && file.processedAnalysis) {
    return file.processedAnalysis;
  }
  return state.previewMode === "edited" ? getEditedAnalysis(file) : file.originalAnalysis;
}

function canEditAudio() {
  return Boolean(getSelectedFile() && state.workspaceView === "editor"
    && state.previewMode === "edited" && !isExportBusy());
}

function getUncleanedPreviewMode(file = getSelectedFile()) {
  return state.workspaceView === "editor" || file?.editOperations?.length ? "edited" : "original";
}

function setWorkspaceView(view) {
  if (isExportBusy()) return;
  state.workspaceView = view === "editor" ? "editor" : "clean";
  state.waveformPointerStartRatio = null;
  state.selectionDragHandle = null;
  state.waveformSelectionDragging = false;
  state.suppressNextWaveformClick = false;
  const file = getSelectedFile();
  if (file) {
    showPreviewMode(state.workspaceView === "editor" ? "edited"
      : file.processedBuffer ? "cleaned" : getUncleanedPreviewMode(file));
  } else {
    updateUi();
  }
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
    exportSettings: getRawExportSettings(),
    montageSettings: getMontageSettings(),
    selectedId: state.selectedId,
    files: state.files.map((file) => ({
      id: file.id,
      exportSelected: file.exportSelected !== false,
      settingsOverride: file.settingsOverride ? { ...file.settingsOverride } : null,
      editOperations: (file.editOperations || []).map((operation) => ({ ...operation })),
      selectionStartRatio: file.selectionStartRatio ?? 0,
      selectionEndRatio: file.selectionEndRatio ?? 1,
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
  if (state.previewMode === "cleaned") state.previewMode = getUncleanedPreviewMode();
  state.montageOutput = null;
}

function restoreWorkspaceState(snapshot) {
  applySettingsToControls(snapshot.settings);
  applyExportSettingsToControls(snapshot.exportSettings, snapshot.montageSettings);
  const currentFiles = [...state.files];
  const savedFiles = new Map(snapshot.files.map((file) => [file.id, file]));
  state.files = snapshot.files
    .map((savedFile) => {
      const current = currentFiles.find((file) => file.id === savedFile.id);
      if (!current) {
        return null;
      }
      current.exportSelected = savedFile.exportSelected;
      current.settingsOverride = savedFile.settingsOverride ? { ...savedFile.settingsOverride } : null;
      current.editOperations = (savedFile.editOperations || []).map((operation) => ({ ...operation }));
      current.selectionStartRatio = savedFile.selectionStartRatio ?? 0;
      current.selectionEndRatio = savedFile.selectionEndRatio ?? 1;
      invalidateEditCache(current);
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

function getRawExportSettings() {
  return {
    bitDepth: elements.bitDepth.value,
    sampleRateMode: elements.sampleRateMode.value,
    channelMode: elements.channelMode.value,
    namingTemplate: elements.namingTemplate.value.trim() || "{name}_clean",
    packName: sanitizeFileBaseName(elements.packName.value || "wave-mutator-free-pack"),
  };
}

function exportSettingsMatchProfile(exportSettings, profileExport) {
  return exportSettings.bitDepth === profileExport.bitDepth
    && exportSettings.sampleRateMode === profileExport.sampleRateMode
    && exportSettings.channelMode === profileExport.channelMode
    && exportSettings.namingTemplate === profileExport.namingTemplate
    && exportSettings.packName === profileExport.packName;
}

function montageSettingsMatchProfile(montageSettings, profileMontage) {
  return montageSettings.clipSeconds === profileMontage.clipSeconds
    && montageSettings.gapSeconds === profileMontage.gapSeconds;
}

function getMatchingDeliveryProfile() {
  const cleanupSettings = getSettings();
  const exportSettings = getRawExportSettings();
  const montageSettings = getMontageSettings();
  return Object.entries(DELIVERY_PROFILES).find(([, profile]) => {
    return settingsMatchPreset(cleanupSettings, profile.cleanup)
      && cleanupSettings.detectClipping === profile.cleanup.detectClipping
      && exportSettingsMatchProfile(exportSettings, profile.export)
      && montageSettingsMatchProfile(montageSettings, profile.montage);
  })?.[0] || "custom";
}

function getExportSettings() {
  const exportSettings = getRawExportSettings();
  const profileId = getMatchingDeliveryProfile();
  return {
    ...exportSettings,
    deliveryProfileId: profileId,
    deliveryProfileLabel: DELIVERY_PROFILES[profileId]?.label || "Custom",
  };
}

function applyExportSettingsToControls(exportSettings, montageSettings) {
  if (exportSettings) {
    elements.bitDepth.value = exportSettings.bitDepth;
    elements.sampleRateMode.value = exportSettings.sampleRateMode;
    elements.channelMode.value = exportSettings.channelMode;
    elements.namingTemplate.value = exportSettings.namingTemplate;
    elements.packName.value = exportSettings.packName;
  }
  if (montageSettings) {
    elements.montageSeconds.value = montageSettings.clipSeconds;
    elements.montageGap.value = montageSettings.gapSeconds;
  }
  updateControlLabels();
}

function renderDeliveryProfile() {
  const profileId = getMatchingDeliveryProfile();
  const profile = DELIVERY_PROFILES[profileId];
  elements.deliveryProfileButtons.forEach((button) => {
    const isActive = button.dataset.deliveryProfile === profileId;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
    button.disabled = isExportBusy();
  });
  elements.deliveryProfileSummary.textContent = profile
    ? `${profile.label}: ${profile.summary}`
    : "Custom settings are active. Choose a target to restore release-ready defaults.";
}

function applyDeliveryProfile(profileId) {
  const profile = DELIVERY_PROFILES[profileId];
  if (!profile || isExportBusy()) {
    return;
  }
  const historySnapshot = captureWorkspaceState();
  applySettingsToControls(profile.cleanup);
  applyExportSettingsToControls(profile.export, profile.montage);
  invalidateProcessedPreviews();
  setStatus(`${profile.label} delivery profile applied.`);
  pushWorkspaceHistory(historySnapshot, "delivery profile");
  updateUi();
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
    button.disabled = isExportBusy();
  });
}

function applyCleanupPreset(presetName) {
  const preset = CLEANUP_PRESETS[presetName];
  if (!preset || isExportBusy()) {
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
    clearGlobalProcessedPreviews(`Cleanup Strength set to ${preset.label}. Preview the clean result to audition it.`);
    pushWorkspaceHistory(historySnapshot, "cleanup preset");
    updateUi();
    return;
  }

  setStatus(`Cleanup Strength set to ${preset.label}. Load an audio file to audition it.`);
  pushWorkspaceHistory(historySnapshot, "cleanup preset");
  updateUi();
}

function getCleanupSuggestion(file = getSelectedFile()) {
  if (!file) {
    return null;
  }
  const analysis = getEditedAnalysis(file);
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
  if (state.previewMode === "cleaned") state.previewMode = getUncleanedPreviewMode();
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
  if (state.previewMode === "cleaned" && !getSelectedFile()?.processedBuffer) {
    state.previewMode = getUncleanedPreviewMode();
  }
  stopPlayback();
  if (reason) {
    setStatus(cleared ? `${reason} ${cleared} preview${cleared === 1 ? " was" : "s were"} marked stale.` : reason);
  }
  updateUi();
}

async function decodeFile(file) {
  const arrayBuffer = await file.arrayBuffer();
  const sourceMetadata = readSourceAudioMetadata(arrayBuffer);
  // Decode at the file's rate, independently of the playback device's rate.
  const decoder = sourceMetadata.sampleRate
    ? new OfflineAudioContext(1, 1, sourceMetadata.sampleRate)
    : getAudioContext();
  const audioBuffer = await decoder.decodeAudioData(arrayBuffer);
  if (sourceMetadata.sampleRate && audioBuffer.sampleRate !== sourceMetadata.sampleRate) {
    throw new Error("The browser could not preserve this file's source sample rate.");
  }
  return { audioBuffer, sourceMetadata };
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
  if (isExportBusy()) return;
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
      const { audioBuffer, sourceMetadata } = await decodeFile(file);
      const sampleFile = {
        id: state.nextId,
        file,
        name: file.name,
        format: getAudioFormatLabel(file),
        size: file.size,
        audioBuffer,
        sourceMetadata,
        originalAnalysis: analyzeBuffer(audioBuffer),
        processedBuffer: null,
        processedAnalysis: null,
        processReport: null,
        exportSelected: true,
        settingsOverride: null,
        batchStatus: "ready",
        waveformCache: {
          original: null,
          edited: null,
          processed: null,
        },
        editOperations: [],
        editedBuffer: null,
        editedAnalysis: null,
        selectionStartRatio: 0,
        selectionEndRatio: 1,
        nextEditId: 1,
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
  if (isExportBusy()) return;
  stopPlayback();
  state.selectedId = id;
  state.previewMode = state.workspaceView === "editor" ? "edited" : "original";
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
    button.disabled = isExportBusy();
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
    state.previewMode = state.workspaceView === "editor" ? "edited" : "original";
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

  if (getEditedAnalysis(file)?.clippedSamples > 0) {
    badges.push({ label: "Clipping", type: "danger" });
  }

  if (file.editOperations?.length) {
    badges.push({ label: `${file.editOperations.length} edit${file.editOperations.length === 1 ? "" : "s"}`, type: "good" });
  }

  if (file.settingsOverride) {
    badges.push({ label: "Custom", type: "good" });
  }

  if (file.processedAnalysis?.clippedSamples > 0) {
    badges.push({ label: "Cleaned clips", type: "warning" });
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
  state.previewMode = preferProcessed && file?.processedBuffer ? "cleaned" : getUncleanedPreviewMode(file);
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
  appendOutputMetric(metrics, "WAV format", file.processedBuffer
    ? `${file.processedBuffer.sampleRate.toLocaleString()} Hz / ${file.processedBuffer.numberOfChannels} ch` : "Not rendered");
  appendOutputMetric(metrics, "Trim removed", formatTrimRemoved(file.processReport, file));
  appendOutputMetric(metrics, "Clipping", file.processedAnalysis?.clippedSamples ? `${file.processedAnalysis.clippedSamples.toLocaleString()} samples` : "None");

  const actions = document.createElement("div");
  actions.className = "cleaned-output-actions";

  const previewButton = document.createElement("button");
  previewButton.type = "button";
  previewButton.textContent = "Preview Cleaned";
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
  const analysis = file.processedAnalysis || getEditedAnalysis(file);
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
    const analysis = file.processedAnalysis || getEditedAnalysis(file);
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
    const displayBuffer = file.processedBuffer || getEditedBuffer(file);
    appendPreflightCell(row, `${file.processedBuffer ? "Output" : "Decoded"}: ${displayBuffer.sampleRate / 1000} kHz | ${displayBuffer.numberOfChannels} ch`);
    appendPreflightCell(row, formatDuration(displayBuffer.duration));
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

function cloneAudioBuffer(buffer) {
  return copyBufferRange(buffer, 0, buffer.length);
}

function copyBufferWithoutRange(buffer, startSample, endSample) {
  const audioContext = getAudioContext();
  const start = clamp(Math.floor(startSample), 0, buffer.length);
  const end = clamp(Math.ceil(endSample), start, buffer.length);
  const outputLength = Math.max(1, buffer.length - (end - start));
  const output = audioContext.createBuffer(buffer.numberOfChannels, outputLength, buffer.sampleRate);

  for (let channel = 0; channel < buffer.numberOfChannels; channel += 1) {
    const source = buffer.getChannelData(channel);
    const target = output.getChannelData(channel);
    target.set(source.subarray(0, start));
    if (start < outputLength) {
      target.set(source.subarray(end), start);
    }
  }

  return output;
}

function applyEditOperations(sourceBuffer, operations = []) {
  let workingBuffer = sourceBuffer;

  for (const operation of operations) {
    const start = clamp(Math.floor(operation.startSample), 0, Math.max(0, workingBuffer.length - 1));
    const end = clamp(Math.ceil(operation.endSample), start + 1, workingBuffer.length);

    if (operation.type === "trim") {
      workingBuffer = copyBufferRange(workingBuffer, start, end);
      continue;
    }

    if (operation.type === "delete") {
      if (end - start < workingBuffer.length) {
        workingBuffer = copyBufferWithoutRange(workingBuffer, start, end);
      }
      continue;
    }

    const nextBuffer = cloneAudioBuffer(workingBuffer);
    for (let channel = 0; channel < nextBuffer.numberOfChannels; channel += 1) {
      const data = nextBuffer.getChannelData(channel);
      const selectionLength = Math.max(1, end - start);
      for (let index = start; index < end; index += 1) {
        const progress = selectionLength > 1 ? (index - start) / (selectionLength - 1) : 0;
        if (operation.type === "silence") {
          data[index] = 0;
        } else if (operation.type === "fade-in") {
          data[index] *= Math.sin(progress * Math.PI * 0.5);
        } else if (operation.type === "fade-out") {
          data[index] *= Math.sin((1 - progress) * Math.PI * 0.5);
        } else if (operation.type === "gain") {
          data[index] *= dbToGain(operation.gainDb);
        }
      }
    }
    workingBuffer = nextBuffer;
  }

  return workingBuffer;
}

function invalidateEditCache(file) {
  if (!file) return;
  file.editedBuffer = null;
  file.editedAnalysis = null;
  file.waveformCache.edited = null;
  file.processedBuffer = null;
  file.processedAnalysis = null;
  file.processReport = null;
  file.waveformCache.processed = null;
  file.batchStatus = "ready";
  state.previewMode = getUncleanedPreviewMode();
  state.montageOutput = null;
}

function getEditedBuffer(file) {
  if (!file) return null;
  if (!file.editOperations?.length) return file.audioBuffer;
  if (!file.editedBuffer) {
    file.editedBuffer = applyEditOperations(file.audioBuffer, file.editOperations);
  }
  return file.editedBuffer;
}

function getEditedAnalysis(file) {
  if (!file) return null;
  if (!file.editOperations?.length) return file.originalAnalysis;
  if (!file.editedAnalysis) {
    file.editedAnalysis = analyzeBuffer(getEditedBuffer(file));
  }
  return file.editedAnalysis;
}

function getSelection(file = getSelectedFile(), buffer = getEditedBuffer(file)) {
  if (!file || !buffer) {
    return { startRatio: 0, endRatio: 0, startSample: 0, endSample: 0, duration: 0 };
  }
  const startRatio = clamp(Math.min(file.selectionStartRatio ?? 0, file.selectionEndRatio ?? 0), 0, 1);
  const endRatio = clamp(Math.max(file.selectionStartRatio ?? 0, file.selectionEndRatio ?? 0), 0, 1);
  const startSample = clamp(Math.round(startRatio * buffer.length), 0, buffer.length);
  const endSample = clamp(Math.round(endRatio * buffer.length), startSample, buffer.length);
  return {
    startRatio,
    endRatio,
    startSample,
    endSample,
    duration: (endSample - startSample) / buffer.sampleRate,
  };
}

function setSelectionRatios(startRatio, endRatio, options = {}) {
  const file = getSelectedFile();
  const buffer = getEditedBuffer(file);
  if (!file || !buffer || !canEditAudio()) return;

  let start = clamp(startRatio, 0, 1);
  let end = clamp(endRatio, 0, 1);
  if (options.snap) {
    start = snapRatioToZeroCrossing(file, start);
    end = snapRatioToZeroCrossing(file, end);
  }
  file.selectionStartRatio = Math.min(start, end);
  file.selectionEndRatio = Math.max(start, end);
  updateUi();
}

function getNextEditId(file) {
  return Math.max(0, ...(file.editOperations || []).map((operation) => operation.id || 0)) + 1;
}

function describeEditOperation(operation, sampleRate) {
  const start = operation.startSample / sampleRate;
  const end = operation.endSample / sampleRate;
  const range = `${formatDuration(start)} - ${formatDuration(end)}`;
  const gainDb = Number(operation.gainDb) || 0;
  const labels = {
    trim: "Trim to selection",
    delete: "Delete selection",
    silence: "Silence selection",
    "fade-in": "Fade in",
    "fade-out": "Fade out",
    gain: `Gain ${gainDb >= 0 ? "+" : ""}${gainDb.toFixed(1)} dB`,
  };
  return { label: labels[operation.type] || operation.type, range };
}

function applySelectionEdit(type) {
  const file = getSelectedFile();
  const buffer = getEditedBuffer(file);
  if (!file || !buffer || !canEditAudio()) return;
  const selection = getSelection(file, buffer);
  if (selection.endSample <= selection.startSample) {
    setStatus("Drag across the waveform to select audio first.", "error");
    return;
  }
  if (type === "delete" && selection.endSample - selection.startSample >= buffer.length) {
    setStatus("Delete cannot remove the entire file. Use Trim to selection for a shorter range.", "error");
    return;
  }

  const historySnapshot = captureWorkspaceState();
  const operation = {
    id: getNextEditId(file),
    type,
    startSample: selection.startSample,
    endSample: selection.endSample,
  };
  if (type === "gain") {
    operation.gainDb = clamp(Number(elements.editGainInput.value) || 0, -24, 24);
  }
  file.editOperations.push(operation);
  invalidateEditCache(file);

  const editedBuffer = getEditedBuffer(file);
  if (type === "trim") {
    file.selectionStartRatio = 0;
    file.selectionEndRatio = 1;
  } else if (type === "delete") {
    const caret = clamp(selection.startSample / editedBuffer.length, 0, 1);
    file.selectionStartRatio = caret;
    file.selectionEndRatio = caret;
  } else {
    file.selectionStartRatio = clamp(selection.startSample / editedBuffer.length, 0, 1);
    file.selectionEndRatio = clamp(selection.endSample / editedBuffer.length, 0, 1);
  }

  stopPlayback();
  pushWorkspaceHistory(historySnapshot, describeEditOperation(operation, buffer.sampleRate).label);
  setStatus(`${describeEditOperation(operation, buffer.sampleRate).label} applied non-destructively.`);
  updateUi();
}

function removeEditOperation(operationId) {
  const file = getSelectedFile();
  if (!file || isExportBusy()) return;
  const operation = file.editOperations.find((item) => item.id === operationId);
  if (!operation) return;
  const historySnapshot = captureWorkspaceState();
  file.editOperations = file.editOperations.filter((item) => item.id !== operationId);
  invalidateEditCache(file);
  file.selectionStartRatio = 0;
  file.selectionEndRatio = 1;
  stopPlayback();
  pushWorkspaceHistory(historySnapshot, "remove edit");
  setStatus("Edit removed. Later operations were replayed against the original audio.");
  updateUi();
}

function clearAudioEdits() {
  const file = getSelectedFile();
  if (!file?.editOperations?.length || isExportBusy()) return;
  const historySnapshot = captureWorkspaceState();
  file.editOperations = [];
  invalidateEditCache(file);
  file.selectionStartRatio = 0;
  file.selectionEndRatio = 1;
  stopPlayback();
  pushWorkspaceHistory(historySnapshot, "clear audio edits");
  setStatus("All selection edits cleared. The decoded source is unchanged.");
  updateUi();
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
  const paddingMs = clamp(Number.isFinite(options.paddingMs) ? options.paddingMs : 20, 0, 500);
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
      data[data.length - 1 - index] *= Math.sin(amount * Math.PI * 0.5);
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

  // Sine ramps reach zero at both edges and unity towards the interior.
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
  const buffer = getActiveBuffer(file);
  const oldView = getWaveformView();
  const focus = buffer
    ? clamp((getPlaybackPosition() / Math.max(buffer.duration, 0.001)) || (oldView.start + oldView.length / 2), 0, 1)
    : 0.5;
  state.waveformZoom = clamp(nextZoom, 1, 16);
  const nextLength = 1 / state.waveformZoom;
  state.waveformViewStart = clamp(focus - nextLength / 2, 0, 1 - nextLength);
  updateUi();
}

function zoomToSelection() {
  const file = getSelectedFile();
  const selection = getSelection(file);
  if (!file || selection.endRatio <= selection.startRatio || !canEditAudio()) return;
  state.waveformZoom = clamp(1 / Math.max(selection.endRatio - selection.startRatio, 1 / 16), 1, 16);
  const viewLength = 1 / state.waveformZoom;
  state.waveformViewStart = clamp(
    (selection.startRatio + selection.endRatio) / 2 - viewLength / 2,
    0,
    1 - viewLength,
  );
  updateUi();
}

function buildWaveformPeaks(buffer, width, startRatio = 0, endRatio = 1, channelIndex = null) {
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

    const firstChannel = channelIndex === null ? 0 : clamp(channelIndex, 0, buffer.numberOfChannels - 1);
    const lastChannel = channelIndex === null ? buffer.numberOfChannels : firstChannel + 1;
    for (let channel = firstChannel; channel < lastChannel; channel += 1) {
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

function getWaveformPeaks(file, buffer, mode, width, view, channel) {
  if (state.waveformZoom > 1) {
    return buildWaveformPeaks(buffer, width, view.start, view.end, channel).peaks;
  }
  const cache = file.waveformCache[mode];
  const pointWidth = Math.max(1, Math.floor(width));
  if (cache && cache.width === pointWidth && cache.channelPeaks?.length === buffer.numberOfChannels) {
    return cache.channelPeaks[channel];
  }

  const channelPeaks = Array.from({ length: buffer.numberOfChannels }, (_, channelIndex) => (
    buildWaveformPeaks(buffer, pointWidth, 0, 1, channelIndex).peaks
  ));
  file.waveformCache[mode] = { width: pointWidth, channelPeaks };
  return channelPeaks[channel];
}

function formatRulerTime(seconds, visibleDuration) {
  if (visibleDuration < 0.1) return `${(seconds * 1000).toFixed(1)} ms`;
  if (visibleDuration < 2) return `${seconds.toFixed(2)} s`;
  if (visibleDuration < 10) return `${seconds.toFixed(1)} s`;
  return formatDuration(seconds).slice(0, -2);
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

  const mode = state.previewMode === "cleaned" ? "processed" : state.previewMode;
  const view = getWaveformView();
  const rulerHeight = 28;
  const laneAreaHeight = Math.max(1, height - rulerHeight);
  const laneHeight = laneAreaHeight / buffer.numberOfChannels;

  context.fillStyle = "#111624";
  context.fillRect(0, 0, width, height);

  context.fillStyle = "#0d121e";
  context.fillRect(0, 0, width, rulerHeight);
  context.strokeStyle = "rgba(255,255,255,0.08)";
  context.lineWidth = 1;
  const tickCount = width < 600 ? 5 : 9;
  for (let line = 0; line < tickCount; line += 1) {
    const ratio = line / (tickCount - 1);
    const x = ratio * width;
    context.beginPath();
    context.moveTo(x, rulerHeight);
    context.lineTo(x, height);
    context.stroke();
    context.fillStyle = "rgba(255,255,255,0.64)";
    context.font = "11px system-ui, sans-serif";
    context.textAlign = line === 0 ? "left" : line === tickCount - 1 ? "right" : "center";
    const seconds = (view.start + ratio * view.length) * buffer.duration;
    context.fillText(formatRulerTime(seconds, view.length * buffer.duration), x, 18);
  }

  for (let channel = 0; channel < buffer.numberOfChannels; channel += 1) {
    const peaks = getWaveformPeaks(file, buffer, mode, width, view, channel);
    const laneTop = rulerHeight + channel * laneHeight;
    const center = laneTop + laneHeight / 2;
    const verticalScale = laneHeight * 0.42;
    context.strokeStyle = "rgba(255,255,255,0.14)";
    context.beginPath();
    context.moveTo(0, center);
    context.lineTo(width, center);
    context.stroke();
    context.strokeStyle = mode === "processed" ? "#52f0aa" : channel % 2 ? "#8181ff" : "#4a4aff";
    context.lineWidth = 1.4;
    context.beginPath();
    for (let x = 0; x < peaks.length; x += 1) {
      const peak = peaks[x];
      const top = center - peak.max * verticalScale;
      const bottom = center - peak.min * verticalScale;
      context.moveTo(x + 0.5, top - (Math.abs(bottom - top) < 1 ? 0.5 : 0));
      context.lineTo(x + 0.5, bottom + (Math.abs(bottom - top) < 1 ? 0.5 : 0));
    }
    context.stroke();
    context.fillStyle = "rgba(255,255,255,0.66)";
    context.font = "600 11px system-ui, sans-serif";
    context.textAlign = "left";
    const channelLabel = buffer.numberOfChannels === 2 ? (channel === 0 ? "L" : "R") : `CH ${channel + 1}`;
    context.fillText(channelLabel, 9, laneTop + 18);
    if (channel > 0) {
      context.strokeStyle = "rgba(255,255,255,0.1)";
      context.beginPath();
      context.moveTo(0, laneTop);
      context.lineTo(width, laneTop);
      context.stroke();
    }
  }

  if (canEditAudio()) {
    const selection = getSelection(file, buffer);
    const startX = ((selection.startRatio - view.start) / view.length) * width;
    const endX = ((selection.endRatio - view.start) / view.length) * width;
    const visibleStart = clamp(startX, 0, width);
    const visibleEnd = clamp(endX, 0, width);
    context.fillStyle = "rgba(74, 74, 255, 0.2)";
    context.fillRect(visibleStart, rulerHeight, Math.max(0, visibleEnd - visibleStart), laneAreaHeight);
    context.strokeStyle = "#ffffff";
    context.lineWidth = 2;
    context.beginPath();
    if (startX >= 0 && startX <= width) {
      context.moveTo(startX, rulerHeight);
      context.lineTo(startX, height);
    }
    if (endX >= 0 && endX <= width) {
      context.moveTo(endX, rulerHeight);
      context.lineTo(endX, height);
    }
    context.stroke();
    if (startX >= 0 && startX <= width) {
      context.fillRect(startX - 4, rulerHeight + 4, 8, 24);
    }
    if (endX >= 0 && endX <= width) {
      context.fillRect(endX - 4, rulerHeight + 4, 8, 24);
    }
  }

  const progress = buffer.duration > 0 ? getPlaybackPosition() / buffer.duration : 0;
  const progressX = ((clamp(progress, 0, 1) - view.start) / view.length) * width;
  context.strokeStyle = "#ff3366";
  context.lineWidth = 2;
  context.beginPath();
  if (progressX >= 0 && progressX <= width) {
    context.moveTo(progressX, rulerHeight);
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
  return clamp(state.playbackOffset + elapsed, 0, state.playbackEnd ?? buffer.duration);
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
  state.playbackEnd = null;
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

async function playFrom(offset, endTime = null) {
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
  const safeEnd = endTime === null ? buffer.duration : clamp(endTime, safeOffset, buffer.duration);
  source.buffer = buffer;
  source.connect(audioContext.destination);
  source.onended = () => {
    if (state.playbackSource !== source) {
      return;
    }
    state.playbackSource = null;
    state.isPlaying = false;
    state.playbackOffset = 0;
    state.playbackEnd = null;
    updateTransportButtons();
    updateProgressUi();
    drawWaveform();
  };

  state.playbackSource = source;
  state.playbackOffset = safeOffset;
  state.playbackEnd = endTime === null ? null : safeEnd;
  state.playbackStartedAt = audioContext.currentTime;
  state.isPlaying = true;
  source.start(0, safeOffset, Math.max(0.001, safeEnd - safeOffset));
  updateTransportButtons();
  startAnimationLoop();
}

async function playSelection() {
  const file = getSelectedFile();
  const buffer = getEditedBuffer(file);
  const selection = getSelection(file, buffer);
  if (!file || !buffer || selection.endSample <= selection.startSample || !canEditAudio()) {
    setStatus("Select a waveform range to play it.", "error");
    return;
  }
  await playFrom(selection.startSample / buffer.sampleRate, selection.endSample / buffer.sampleRate);
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
    elements.metaSourceFormat.textContent = "-";
    elements.metaOutputFormat.textContent = "Not rendered";
    elements.metaPeak.textContent = "-";
    elements.metaClipping.textContent = "-";
    elements.metaRms.textContent = "-";
    elements.metaDcOffset.textContent = "-";
    elements.metaStereoBalance.textContent = "-";
    elements.metaLeadingSilence.textContent = "-";
    elements.metaTrailingSilence.textContent = "-";
    elements.metaTruePeak.textContent = "-";
    return;
  }

  elements.metaName.textContent = file.name;
  elements.metaDuration.textContent = formatDuration(buffer.duration);
  elements.metaSampleRate.textContent = `${buffer.sampleRate.toLocaleString()} Hz`;
  elements.metaChannels.textContent = `${buffer.numberOfChannels}`;
  const source = file.sourceMetadata;
  elements.metaSourceFormat.textContent = source?.sampleRate
    ? `${source.sampleRate.toLocaleString()} Hz / ${source.channels} ch${source.bitDepth ? ` / ${source.bitDepth}-bit` : ""}`
    : `Unverified; decoded at ${file.audioBuffer.sampleRate.toLocaleString()} Hz`;
  elements.metaOutputFormat.textContent = file.processedBuffer
    ? `${file.processedBuffer.sampleRate.toLocaleString()} Hz / ${file.processedBuffer.numberOfChannels} ch / ${elements.bitDepth.value === "32f" ? "32-bit float" : `${elements.bitDepth.value}-bit PCM`}`
    : "Not rendered";
  elements.metaPeak.textContent = formatDb(analysis.peakDb);
  elements.metaClipping.textContent = analysis.clippedSamples ? `${analysis.clippedSamples.toLocaleString()} samples` : "None";
  elements.metaRms.textContent = formatDb(analysis.rmsDb);
  elements.metaDcOffset.textContent = `${analysis.dcOffset.toFixed(4)}`;
  elements.metaStereoBalance.textContent = analysis.stereoBalanceDb === null ? "Mono" : `${analysis.stereoBalanceDb.toFixed(1)} dB L/R`;
  elements.metaLeadingSilence.textContent = formatDuration(analysis.leadingSilenceSeconds);
  elements.metaTrailingSilence.textContent = formatDuration(analysis.trailingSilenceSeconds);
  elements.metaTruePeak.textContent = formatDb(gainToDb(analysis.truePeakEstimate));
}

function renderSelectionEditor() {
  const file = getSelectedFile();
  const buffer = getEditedBuffer(file);
  const selection = getSelection(file, buffer);
  const busy = isExportBusy();
  const canEdit = canEditAudio();
  elements.editorPreviewNotice.hidden = !file || state.previewMode === "edited";
  elements.editorPreviewNoticeText.textContent = `${getPreviewLabel()} is read-only.`;
  elements.resumeEditingButton.disabled = busy;
  const hasSelection = selection.endSample > selection.startSample;
  const fullSelection = Boolean(buffer && selection.startSample === 0 && selection.endSample === buffer.length);

  elements.selectionStartInput.max = buffer?.duration || 0;
  elements.selectionEndInput.max = buffer?.duration || 0;
  if (document.activeElement !== elements.selectionStartInput) {
    elements.selectionStartInput.value = buffer ? (selection.startSample / buffer.sampleRate).toFixed(3) : "0.000";
  }
  if (document.activeElement !== elements.selectionEndInput) {
    elements.selectionEndInput.value = buffer ? (selection.endSample / buffer.sampleRate).toFixed(3) : "0.000";
  }
  elements.selectionDuration.textContent = formatDuration(selection.duration);
  elements.selectionStartInput.disabled = !canEdit;
  elements.selectionEndInput.disabled = !canEdit;
  elements.editGainInput.disabled = !canEdit;
  elements.playSelectionButton.disabled = !canEdit || !hasSelection;
  elements.selectionClearButton.disabled = !canEdit || !hasSelection;
  elements.waveformZoomSelection.disabled = !canEdit || !hasSelection || fullSelection;
  [elements.editTrimButton, elements.editSilenceButton, elements.editFadeInButton,
    elements.editFadeOutButton, elements.editGainButton].forEach((button) => {
    button.disabled = !canEdit || !hasSelection;
  });
  elements.editDeleteButton.disabled = !canEdit || !hasSelection || fullSelection;
}

function renderEditHistory() {
  const file = getSelectedFile();
  const operations = file?.editOperations || [];
  elements.editHistoryList.innerHTML = "";
  elements.clearEditsButton.disabled = !operations.length || isExportBusy();

  if (!operations.length) {
    const empty = document.createElement("li");
    empty.className = "empty-state";
    empty.textContent = file ? "No audio edits applied. The decoded source is untouched." : "Load a file to start editing.";
    elements.editHistoryList.appendChild(empty);
    return;
  }

  operations.forEach((operation, index) => {
    const description = describeEditOperation(operation, file.audioBuffer.sampleRate);
    const item = document.createElement("li");
    item.className = "edit-history-item";
    const number = document.createElement("span");
    number.className = "edit-history-number";
    number.textContent = String(index + 1);
    const copy = document.createElement("span");
    copy.className = "edit-history-copy";
    const label = document.createElement("strong");
    label.textContent = description.label;
    const range = document.createElement("span");
    range.textContent = description.range;
    copy.append(label, range);
    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "edit-history-remove";
    remove.textContent = "Remove";
    remove.disabled = isExportBusy();
    remove.setAttribute("aria-label", `Remove ${description.label}`);
    remove.addEventListener("click", () => removeEditOperation(operation.id));
    item.append(number, copy, remove);
    elements.editHistoryList.appendChild(item);
  });
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

  if (!file.sourceMetadata?.sampleRate) {
    notes.push({ type: "note", text: `Source sample rate could not be verified. Preserve original will use the decoded rate (${file.audioBuffer.sampleRate.toLocaleString()} Hz).` });
  }

  if (settings.detectClipping) {
    if (analysis.clippedSamples > 0) {
      notes.push({
        type: "danger",
        text: `${getPreviewLabel()} has ${analysis.clippedSamples.toLocaleString()} samples at or above 0.999 amplitude. First detected near ${formatDuration(analysis.firstClipTime)}.`,
      });
    } else {
      notes.push({
        type: "good",
        text: `${getPreviewLabel()} has no clipping at the 0.999 threshold.`,
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

  if (state.previewMode !== "cleaned" && (analysis.leadingSilenceSeconds > 0.08 || analysis.trailingSilenceSeconds > 0.08)) {
    notes.push({
      type: "note",
      text: `Detected about ${formatDuration(analysis.leadingSilenceSeconds)} leading and ${formatDuration(analysis.trailingSilenceSeconds)} trailing silence at -60 dB.`,
    });
  }

  if (file.processReport && state.previewMode === "cleaned") {
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

  if (state.previewMode !== "cleaned" && file.processedBuffer) {
    notes.push({
      type: "note",
      text: "A Cleaned preview is available for comparison.",
    });
  }

  for (const note of notes) {
    const item = document.createElement("p");
    item.className = `warning-item is-${note.type}`;
    item.textContent = note.text;
    elements.analysisWarnings.appendChild(item);
  }

  renderReport(state.previewMode === "cleaned" ? file.processReport : null);
}

function renderReport(report) {
  if (!report) {
    elements.reportTrimmed.textContent = "-";
    elements.reportFade.textContent = "-";
    elements.reportNormalize.textContent = "-";
    elements.reportSelectionEdits.textContent = "-";
    elements.reportOutputPeak.textContent = "-";
    return;
  }

  elements.reportTrimmed.textContent = report.trimSkipped
    ? "Skipped"
    : formatDuration(report.trimmedSamples / getSelectedFile().audioBuffer.sampleRate);
  elements.reportFade.textContent = report.fadeSamples ? `${report.fadeSamples.toLocaleString()} samples` : "Off";
  elements.reportNormalize.textContent = `${gainToDb(report.normalizeGain).toFixed(1)} dB`;
  elements.reportSelectionEdits.textContent = report.selectionEditCount
    ? `${report.selectionEditCount} applied`
    : "None";
  elements.reportOutputPeak.textContent = formatDb(report.outputPeakDb);
}

function updateUi() {
  const selected = getSelectedFile();
  if (!selected) state.previewMode = "original";
  if (state.previewMode === "cleaned" && !selected?.processedBuffer) {
    state.previewMode = getUncleanedPreviewMode(selected);
  }
  const busy = isExportBusy();
  const hasProcessedPreview = Boolean(selected?.processedBuffer);
  const isEditor = state.workspaceView === "editor";

  elements.editorOnly.forEach((element) => { element.hidden = !isEditor; });
  elements.cleanOnly.forEach((element) => { element.hidden = isEditor; });
  [elements.quickCleanViewButton, elements.editorViewButton, elements.returnToCleanButton].forEach((button) => {
    button.disabled = busy;
  });
  elements.quickCleanViewButton.classList.toggle("is-active", !isEditor);
  elements.editorViewButton.classList.toggle("is-active", isEditor);
  elements.quickCleanViewButton.setAttribute("aria-pressed", String(!isEditor));
  elements.editorViewButton.setAttribute("aria-pressed", String(isEditor));
  elements.previewWorkspaceLabel.textContent = isEditor ? "Editor" : "Step 3";

  [elements.fileInput, elements.trimSilence, elements.trimThreshold, elements.trimMinSilence,
    elements.trimPadding, elements.fadeEnabled, elements.fadeMs, elements.normalizeEnabled,
    elements.targetPeak, elements.detectClipping, elements.bitDepth, elements.sampleRateMode,
    elements.channelMode, elements.namingTemplate, elements.packName, elements.exportScope,
    elements.montageSeconds, elements.montageGap, elements.snapZeroCrossings].forEach((control) => {
    control.disabled = busy;
  });

  document.body.classList.toggle("has-files", state.files.length > 0);
  document.body.classList.toggle("has-processed-preview", hasProcessedPreview);
  document.body.dataset.previewMode = state.previewMode;
  document.body.dataset.workspaceView = state.workspaceView;
  elements.snapZeroCrossings.disabled = !canEditAudio();

  renderFileList();
  renderMeta();
  renderSelectionEditor();
  renderEditHistory();
  renderWarnings();
  renderCleanupSuggestion();
  renderCleanedOutputs();
  renderPreflight();
  updateControlLabels();
  renderDeliveryProfile();
  renderBatchProgress();
  syncCleanupPresetUi();
  updateTransportButtons();
  updateProgressUi();
  drawWaveform();

  elements.waveformEmptyButton.classList.toggle("is-hidden", Boolean(selected));
  elements.applyButton.disabled = !selected || busy;
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
  elements.deliveryProfileButtons.forEach((button) => {
    button.disabled = busy;
  });
  setButtonLoading(
    elements.applyButton,
    state.processingMode === "preview" ? "Processing preview..." : "Preview clean result",
    state.processingMode === "preview",
  );
  setButtonLoading(
    elements.exportButton,
    state.exportMode === "wav" ? "Exporting WAV..." : "Download cleaned WAV",
    state.exportMode === "wav",
  );
  setButtonLoading(
    elements.exportZipButton,
    state.exportMode === "zip" ? "Exporting ZIP..." : "Download clean ZIP",
    state.exportMode === "zip",
  );
  setButtonLoading(
    elements.exportMp3Button,
    !window.lamejs?.Mp3Encoder ? "MP3 encoder unavailable" : state.exportMode === "mp3" ? "Encoding MP3..." : "Create MP3 store preview",
    state.exportMode === "mp3",
  );
  elements.exportMp3Button.title = window.lamejs?.Mp3Encoder
    ? "Create an MP3 preview montage from the selected cleaned files."
    : "The bundled local MP3 encoder did not load. Reload the page and try again.";

  elements.previewOriginalButton.disabled = !selected || busy;
  elements.previewEditedButton.disabled = !selected || busy;
  elements.previewProcessedButton.disabled = !selected || !hasProcessedPreview || busy;
  elements.previewProcessedButton.title = hasProcessedPreview
    ? "Cleanup and final WAV delivery settings."
    : "Run Quick Clean to create this preview.";
  [[elements.previewOriginalButton, "original"], [elements.previewEditedButton, "edited"],
    [elements.previewProcessedButton, "cleaned"]].forEach(([button, mode]) => {
    button.classList.toggle("is-active", state.previewMode === mode);
    button.setAttribute("aria-pressed", String(state.previewMode === mode));
  });
  elements.previewModeLabel.textContent = getPreviewLabel();
  elements.previewStateText.textContent = getPreviewStateText(selected, hasProcessedPreview);
}

function getPreviewLabel(mode = state.previewMode) {
  return { original: "Original", edited: "Edited", cleaned: "Cleaned" }[mode] || "Original";
}

function getPreviewStateText(file, hasProcessedPreview) {
  if (!file) {
    return "No audio selected.";
  }
  if (state.previewMode === "cleaned" && hasProcessedPreview) {
    return "Cleanup applied. Matches WAV delivery.";
  }
  if (state.previewMode === "edited") {
    const count = file.editOperations?.length || 0;
    return count ? `${count} manual ${count === 1 ? "edit" : "edits"}. Cleanup not applied.`
      : "No manual edits. Matches Original.";
  }
  return "Untouched source audio.";
}

function showPreviewMode(mode) {
  const file = getSelectedFile();
  if (!file || isExportBusy()) {
    return;
  }
  stopPlayback();
  state.previewMode = mode === "cleaned" && file.processedBuffer ? "cleaned"
    : mode === "edited" ? "edited" : "original";
  state.playbackOffset = 0;
  state.waveformZoom = 1;
  state.waveformViewStart = 0;
  updateUi();
}

async function applyProcessingPreview() {
  const file = getSelectedFile();
  if (!file || isExportBusy()) {
    return;
  }

  try {
    stopPlayback();
    state.cancelRequested = false;
    setProcessingMode("preview");
    setStatus(`Processing preview locally: ${file.name}`);
    await waitForPaint();
    const result = await renderDeliveryAudio(file);
    file.processedBuffer = result.buffer;
    file.processedAnalysis = result.analysis;
    file.processReport = result.report;
    file.batchStatus = result.analysis.clippedSamples ? "warning" : "preview";
    file.waveformCache.processed = null;
    state.previewMode = "cleaned";
    state.playbackOffset = 0;
    setStatus("Processing preview updated. Export will use these cleanup settings.", "success");
  } catch (error) {
    console.error(error);
    setStatus("Processing failed. Try a shorter audio file or less aggressive settings.", "error");
  } finally {
    setProcessingMode(null);
  }
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
    tool: "Wave Mutator Free",
    version: APP_VERSION,
    exportedAt: new Date().toISOString(),
    cleanup: getSettings(),
    deliveryProfile: getMatchingDeliveryProfile(),
    export: getRawExportSettings(),
    montage: getMontageSettings(),
  };
  downloadBlob(
    new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" }),
    "wave-mutator-free-cleanup-settings.json",
  );
  setStatus("Downloaded local cleanup settings.", "success");
}

function isValidImportedSettings(value) {
  return value && typeof value === "object"
    && ["trimSilence", "fadeEnabled", "normalizeEnabled", "detectClipping"].every((key) => typeof value[key] === "boolean")
    && ["trimThresholdDb", "trimMinSilenceMs", "trimPaddingMs", "fadeMs", "targetPeakDb"].every((key) => Number.isFinite(Number(value[key])));
}

function isValidImportedExportSettings(value) {
  return value && typeof value === "object"
    && ["16", "24", "32f"].includes(value.bitDepth)
    && ["original", "44100", "48000"].includes(value.sampleRateMode)
    && ["original", "mono"].includes(value.channelMode)
    && typeof value.namingTemplate === "string"
    && typeof value.packName === "string";
}

function isValidImportedMontageSettings(value) {
  return value && typeof value === "object"
    && Number.isFinite(Number(value.clipSeconds))
    && Number.isFinite(Number(value.gapSeconds));
}

async function importCleanupSettings(file) {
  if (!file || isExportBusy()) {
    return;
  }
  try {
    const parsed = JSON.parse(await file.text());
    const settings = parsed.cleanup || parsed;
    if (!isValidImportedSettings(settings)) {
      throw new Error("The file does not contain a valid Wave Mutator Free cleanup configuration.");
    }
    if (parsed.export && !isValidImportedExportSettings(parsed.export)) {
      throw new Error("The file does not contain valid Wave Mutator Free export settings.");
    }
    if (parsed.montage && !isValidImportedMontageSettings(parsed.montage)) {
      throw new Error("The file does not contain valid Wave Mutator Free montage settings.");
    }
    const historySnapshot = captureWorkspaceState();
    applySettingsToControls(settings);
    if (parsed.export || parsed.montage) {
      applyExportSettingsToControls(parsed.export || getRawExportSettings(), parsed.montage || getMontageSettings());
    }
    invalidateProcessedPreviews();
    pushWorkspaceHistory(historySnapshot, "imported cleanup settings");
    setStatus("Imported cleanup settings locally. Processed previews were marked stale.", "success");
    updateUi();
  } catch (error) {
    console.error(error);
    setStatus("Could not import cleanup settings. Choose a valid Wave Mutator Free JSON settings file.", "error");
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
    throw new Error("This browser cannot render the requested sample rate.");
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

async function renderDeliveryAudio(file, exportSettings = getExportSettings()) {
  const result = processAudioBuffer(getEditedBuffer(file), getSettingsForFile(file), { startRatio: 0, endRatio: 1 });
  const buffer = await prepareExportBuffer(result.buffer, exportSettings);
  // Preview the same quantized samples written by encodeWav, including PCM clipping.
  // Processing already created a private copy; the original PCM stays untouched.
  for (let channel = 0; channel < buffer.numberOfChannels; channel += 1) {
    const data = buffer.getChannelData(channel);
    for (let index = 0; index < data.length; index += 1) {
      data[index] = quantizeWavSample(data[index], exportSettings.bitDepth);
    }
  }
  const analysis = analyzeBuffer(buffer);
  return {
    buffer,
    analysis,
    report: {
      ...result.report,
      outputPeakDb: analysis.peakDb,
      selectionEditCount: file.editOperations?.length || 0,
    },
  };
}

function quantizeWavSample(value, bitDepth = "16") {
  if (bitDepth === "32f") {
    return value;
  }
  const sample = clamp(value, -1, 1);
  const negativeScale = bitDepth === "24" ? 0x800000 : 0x8000;
  return clamp(Math.round(sample * negativeScale), -negativeScale, negativeScale - 1) / negativeScale;
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
      const sample = quantizeWavSample(channels[channel][sampleIndex], bitDepth);
      if (isFloat) {
        view.setFloat32(offset, sample, true);
        offset += 4;
      } else if (bitDepth === "24") {
        const intSample = Math.round(sample * 0x800000);
        view.setUint8(offset, intSample & 0xff);
        view.setUint8(offset + 1, (intSample >> 8) & 0xff);
        view.setUint8(offset + 2, (intSample >> 16) & 0xff);
        offset += 3;
      } else {
        const intSample = Math.round(sample * 0x8000);
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
  const clippedFiles = files.filter((file) => (file.processedAnalysis || getEditedAnalysis(file)).clippedSamples > 0);
  const totalDuration = files.reduce((total, file) => total + (file.processedBuffer || getEditedBuffer(file)).duration, 0);
  const rows = files.map((file, index) => {
    const outputBuffer = file.processedBuffer || getEditedBuffer(file);
    const analysis = file.processedAnalysis || getEditedAnalysis(file);
    const settings = getSettingsForFile(file);
    const report = file.processReport;
    const status = getPreflightStatus(file);
    return [
      `${index + 1}. ${makeExportFileName(file.name, index + 1, exportSettings)}`,
      `   Source: ${file.name} (${file.format || "Audio"})`,
      `   Source duration: ${formatDuration(file.audioBuffer.duration)} | Output duration: ${formatDuration(outputBuffer.duration)}`,
      `   Source format: ${file.sourceMetadata?.sampleRate ? `${file.sourceMetadata.sampleRate} Hz | ${file.sourceMetadata.channels} channel(s)` : "unverified"}`,
      `   Decoded format: ${file.audioBuffer.sampleRate} Hz | ${file.audioBuffer.numberOfChannels} channel(s)`,
      `   Rendered WAV: ${file.processedBuffer ? `${file.processedBuffer.sampleRate} Hz | ${file.processedBuffer.numberOfChannels} channel(s)` : "not rendered"}`,
      `   Export target: ${exportSettings.bitDepth === "32f" ? "32-bit float" : `${exportSettings.bitDepth}-bit PCM`} | ${exportSettings.sampleRateMode === "original" ? "original sample rate" : `${Number(exportSettings.sampleRateMode) / 1000} kHz`} | ${exportSettings.channelMode === "mono" ? "mono sum" : "original channels"}`,
      `   Peak: ${formatDb(analysis.peakDb)} | Estimated true peak: ${formatDb(gainToDb(analysis.truePeakEstimate))} | Clipping: ${analysis.clippedSamples ? `${analysis.clippedSamples.toLocaleString()} samples` : "none"}`,
      `   Cleanup: Trim ${settings.trimSilence ? `${settings.trimThresholdDb} dB, ${settings.trimMinSilenceMs} ms minimum, ${settings.trimPaddingMs} ms padding` : "off"} | Fade ${settings.fadeEnabled ? `${settings.fadeMs} ms` : "off"} | Normalize ${settings.normalizeEnabled ? `${settings.targetPeakDb} dBFS` : "off"}`,
      `   Edits: Selection operations ${file.editOperations?.length || 0} | Auto trim ${report?.trimSkipped ? "skipped" : report?.trimmedSamples ? formatDuration(report.trimmedSamples / file.audioBuffer.sampleRate) : report ? "none" : "not previewed"} | Settings ${file.settingsOverride ? "custom" : "global"}`,
      `   QA: ${status.label}${file.exportSelected === false ? " | Excluded from selected export scope" : ""}`,
    ].join("\n");
  });
  return [
    "Wave Mutator Free free pack report",
    `Created locally: ${new Date().toISOString()}`,
    `Pack: ${exportSettings.packName}`,
    `Delivery profile: ${exportSettings.deliveryProfileLabel}`,
    `Files: ${files.length} | Combined cleaned duration: ${formatDuration(totalDuration)} | Review items: ${reviewFiles.length} | Files with clipping: ${clippedFiles.length}`,
    `Naming: ${exportSettings.namingTemplate}`,
    "All measurements and cleanup are local browser analysis. Estimated true peak is a guide, not certified true-peak metering.",
    "",
    ...rows,
    "",
    "All audio was processed locally in Wave Mutator Free. No files were uploaded.",
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
  return `${sanitizeFileBaseName(exportSettings.packName || "wave-mutator-free-pack")}_preview_montage.mp3`;
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

      const result = await renderDeliveryAudio(file);
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
    state.previewMode = "cleaned";
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
  if (!file || isExportBusy()) {
    return;
  }

  try {
    stopPlayback();
    setExportMode("wav");
    setBatchProgress(`Rendering selected WAV: ${file.name}`, 15, "Preparing");
    const exportSettings = getExportSettings();
    const result = await renderDeliveryAudio(file, exportSettings);
    setBatchProgress(`Encoding selected WAV: ${file.name}`, 65, "Encoding");
    const exportBuffer = result.buffer;
    file.processedBuffer = result.buffer;
    file.processedAnalysis = result.analysis;
    file.processReport = result.report;
    file.batchStatus = result.analysis.clippedSamples ? "warning" : "processed";
    file.waveformCache.processed = null;
    state.previewMode = "cleaned";

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
        const result = await renderDeliveryAudio(file, exportSettings);
        const exportBuffer = result.buffer;
        const blob = encodeWav(exportBuffer, exportSettings);
        const fileName = uniqueFileName(makeExportFileName(file.name, index + 1, exportSettings), usedNames);

        file.processedBuffer = result.buffer;
        file.processedAnalysis = result.analysis;
        file.processReport = result.report;
        file.waveformCache.processed = null;
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

function selectionHandleFromEvent(event) {
  const file = getSelectedFile();
  if (!file || !canEditAudio()) {
    return null;
  }

  const rect = elements.waveform.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const selection = getSelection(file);
  const view = getWaveformView();
  const startX = ((selection.startRatio - view.start) / view.length) * rect.width;
  const endX = ((selection.endRatio - view.start) / view.length) * rect.width;
  const hitSize = 14;

  if (Math.abs(x - startX) <= hitSize) {
    return "start";
  }
  if (Math.abs(x - endX) <= hitSize) {
    return "end";
  }
  return null;
}

// Kept as a compatibility alias for the browser self-tests and older embeds.
function trimHandleFromEvent(event) {
  return selectionHandleFromEvent(event);
}

function snapRatioToZeroCrossing(file, ratio) {
  if (!elements.snapZeroCrossings.checked) {
    return ratio;
  }
  const buffer = getEditedBuffer(file);
  const data = buffer.getChannelData(0);
  const target = clamp(Math.round(ratio * (data.length - 1)), 0, data.length - 1);
  const searchRadius = Math.max(1, Math.round(buffer.sampleRate * 0.012));
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

function updateSelectionHandle(handle, ratio) {
  const file = getSelectedFile();
  const buffer = getEditedBuffer(file);
  if (!file) {
    return;
  }

  const snappedRatio = snapRatioToZeroCrossing(file, ratio);
  if (handle === "start") {
    file.selectionStartRatio = clamp(snappedRatio, 0, 1);
  } else {
    file.selectionEndRatio = clamp(snappedRatio, 0, 1);
  }
  if (file.selectionStartRatio > file.selectionEndRatio) {
    [file.selectionStartRatio, file.selectionEndRatio] = [file.selectionEndRatio, file.selectionStartRatio];
    state.selectionDragHandle = handle === "start" ? "end" : "start";
  }
  state.playbackOffset = clamp(file.selectionStartRatio, 0, 1) * buffer.duration;
  updateUi();
}

function clearWaveformSelection() {
  const file = getSelectedFile();
  const buffer = getEditedBuffer(file);
  if (!file || !canEditAudio()) {
    return;
  }
  const caret = buffer?.duration ? clamp(state.playbackOffset / buffer.duration, 0, 1) : 0;
  stopPlayback();
  file.selectionStartRatio = caret;
  file.selectionEndRatio = caret;
  setStatus("Selection cleared.");
  updateUi();
}

function updateSelectionFromTimeInputs() {
  const file = getSelectedFile();
  const buffer = getEditedBuffer(file);
  if (!file || !buffer || !canEditAudio()) return;
  const startSeconds = clamp(Number(elements.selectionStartInput.value) || 0, 0, buffer.duration);
  const endSeconds = clamp(Number(elements.selectionEndInput.value) || 0, 0, buffer.duration);
  setSelectionRatios(startSeconds / buffer.duration, endSeconds / buffer.duration);
}

function handleWaveformPointerDown(event) {
  const file = getSelectedFile();
  if (!file || !canEditAudio()) {
    return;
  }

  event.preventDefault();
  stopPlayback();
  state.selectionDragHandle = selectionHandleFromEvent(event);
  state.waveformPointerStartRatio = waveformRatioFromEvent(event);
  state.waveformPointerStartX = event.clientX;
  state.waveformSelectionDragging = Boolean(state.selectionDragHandle);
  elements.waveform.setPointerCapture?.(event.pointerId);
  if (state.selectionDragHandle) {
    updateSelectionHandle(state.selectionDragHandle, state.waveformPointerStartRatio);
  }
}

function handleWaveformPointerMove(event) {
  if (state.waveformPointerStartRatio === null) {
    return;
  }
  event.preventDefault();
  if (!state.waveformSelectionDragging && Math.abs(event.clientX - state.waveformPointerStartX) >= 4) {
    state.waveformSelectionDragging = true;
    state.selectionDragHandle = "end";
    const file = getSelectedFile();
    file.selectionStartRatio = snapRatioToZeroCrossing(file, state.waveformPointerStartRatio);
    file.selectionEndRatio = file.selectionStartRatio;
  }
  if (state.waveformSelectionDragging) {
    updateSelectionHandle(state.selectionDragHandle, waveformRatioFromEvent(event));
  }
}

function handleWaveformPointerUp(event) {
  if (state.waveformPointerStartRatio === null) {
    return;
  }
  event.preventDefault();
  elements.waveform.releasePointerCapture?.(event.pointerId);
  const dragged = state.waveformSelectionDragging;
  const clickRatio = state.waveformPointerStartRatio;
  state.selectionDragHandle = null;
  state.waveformPointerStartRatio = null;
  state.waveformPointerStartX = null;
  state.waveformSelectionDragging = false;
  if (dragged) {
    state.suppressNextWaveformClick = true;
    const selection = getSelection();
    setStatus(`Selected ${formatDuration(selection.duration)} for editing.`);
    updateUi();
  } else {
    seekToRatio(clickRatio);
    state.suppressNextWaveformClick = true;
  }
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

  elements.deliveryProfileButtons.forEach((button) => {
    button.setAttribute("aria-pressed", "false");
    button.addEventListener("click", () => applyDeliveryProfile(button.dataset.deliveryProfile));
  });

  elements.fileInput.addEventListener("change", (event) => loadFiles(event.target.files));
  elements.waveformEmptyButton.addEventListener("click", () => elements.fileInput.click());
  elements.waveformZoomOut.addEventListener("click", () => setWaveformZoom(state.waveformZoom / 2));
  elements.waveformZoomIn.addEventListener("click", () => setWaveformZoom(state.waveformZoom * 2));
  elements.waveformZoomFit.addEventListener("click", () => setWaveformZoom(1));
  elements.waveformZoomSelection.addEventListener("click", zoomToSelection);
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
  elements.playSelectionButton.addEventListener("click", () => {
    playSelection().catch((error) => {
      console.error(error);
      setStatus("Selection playback could not start.", "error");
    });
  });
  elements.waveform.addEventListener("click", handleWaveformClick);
  elements.waveform.addEventListener("pointerdown", handleWaveformPointerDown);
  elements.waveform.addEventListener("pointermove", handleWaveformPointerMove);
  elements.waveform.addEventListener("pointerup", handleWaveformPointerUp);
  elements.waveform.addEventListener("pointercancel", handleWaveformPointerUp);
  elements.applyButton.addEventListener("click", applyProcessingPreview);
  elements.saveFileOverrideButton.addEventListener("click", saveSettingsForSelectedFile);
  elements.resetFileOverrideButton.addEventListener("click", resetSettingsForSelectedFile);
  elements.applySuggestionButton.addEventListener("click", applyCleanupSuggestion);
  elements.exportSettingsButton.addEventListener("click", exportCleanupSettings);
  elements.importSettingsButton.addEventListener("click", () => elements.settingsFileInput.click());
  elements.settingsFileInput.addEventListener("change", (event) => importCleanupSettings(event.target.files[0]));
  elements.previewOriginalButton.addEventListener("click", () => showPreviewMode("original"));
  elements.previewEditedButton.addEventListener("click", () => showPreviewMode("edited"));
  elements.previewProcessedButton.addEventListener("click", () => showPreviewMode("cleaned"));
  elements.quickCleanViewButton.addEventListener("click", () => setWorkspaceView("clean"));
  elements.editorViewButton.addEventListener("click", () => setWorkspaceView("editor"));
  elements.returnToCleanButton.addEventListener("click", () => {
    setWorkspaceView("clean");
    elements.applyButton.scrollIntoView({ behavior: "smooth", block: "center" });
    elements.applyButton.focus({ preventScroll: true });
  });
  elements.resumeEditingButton.addEventListener("click", () => showPreviewMode("edited"));
  elements.selectionClearButton.addEventListener("click", clearWaveformSelection);
  elements.selectionStartInput.addEventListener("change", updateSelectionFromTimeInputs);
  elements.selectionEndInput.addEventListener("change", updateSelectionFromTimeInputs);
  elements.editTrimButton.addEventListener("click", () => applySelectionEdit("trim"));
  elements.editDeleteButton.addEventListener("click", () => applySelectionEdit("delete"));
  elements.editSilenceButton.addEventListener("click", () => applySelectionEdit("silence"));
  elements.editFadeInButton.addEventListener("click", () => applySelectionEdit("fade-in"));
  elements.editFadeOutButton.addEventListener("click", () => applySelectionEdit("fade-out"));
  elements.editGainButton.addEventListener("click", () => applySelectionEdit("gain"));
  elements.clearEditsButton.addEventListener("click", clearAudioEdits);
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
    control.addEventListener("input", () => {
      if ([elements.bitDepth, elements.sampleRateMode, elements.channelMode].includes(control)) {
        invalidateProcessedPreviews();
        setStatus("WAV delivery settings changed. Preview the clean result again.");
      }
      updateUi();
    });
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

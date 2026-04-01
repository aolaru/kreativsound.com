const state = {
  audioContext: null,
  originalBuffer: null,
  currentSource: null,
  analysis: null,
  profile: null,
  presets: [],
  isGenerating: false,
  sourceName: "",
  seedCache: new Map(),
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
  brightnessBiasValue: document.querySelector("#brightness-bias-value"),
  movementBiasValue: document.querySelector("#movement-bias-value"),
  playOriginal: document.querySelector("#play-original"),
  stopPlayback: document.querySelector("#stop-playback"),
  analyzeGenerate: document.querySelector("#analyze-generate"),
  analyzeGenerateLabel: document.querySelector("#analyze-generate .button-label"),
  analysisMetrics: document.querySelector("#analysis-metrics"),
  profileMetrics: document.querySelector("#profile-metrics"),
  presetList: document.querySelector("#preset-list"),
  presetsPanel: document.querySelector("#presets-panel"),
  selfTestNote: document.querySelector("#self-test-note"),
};

const SEED_BY_FAMILY = {
  pad: "KS Frozen Hollow.vital",
  pluck: "KS Dread Lantern.vital",
  bass: "KS Iron Wake.vital",
  texture: "KS Shadow Archive.vital",
};

const FREE_VARIANT_LIMIT = 3;
const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
const SELF_TEST_ENABLED = new URLSearchParams(window.location.search).get("self_test") === "1";
const GENERATE_DELAY_MS = 500;
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

function updateStatus(message) {
  elements.status.textContent = message;
}

function showUploadMessage(message) {
  elements.uploadMessage.textContent = message;
  elements.uploadMessage.hidden = !message;
}

function resetLoadedState() {
  setReady(false);
  state.originalBuffer = null;
  state.analysis = null;
  state.profile = null;
  state.presets = [];
  state.sourceName = "";
  elements.fileName.textContent = "No file loaded";
  elements.fileDuration.textContent = "0.0s";
  elements.fileSampleRate.textContent = "-";
  elements.fileChannels.textContent = "-";
  renderMetricGrid(elements.analysisMetrics, []);
  renderMetricGrid(elements.profileMetrics, []);
  renderPresets([]);
  elements.waveform.getContext("2d").clearRect(0, 0, elements.waveform.width, elements.waveform.height);
  elements.waveformPanel.classList.remove("has-waveform");
  elements.waveformDropCta.hidden = false;
  elements.waveformEmptyNote.hidden = false;
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
}

function setReady(enabled) {
  elements.playOriginal.disabled = !enabled;
  elements.stopPlayback.disabled = !enabled;
  elements.analyzeGenerate.disabled = !enabled || state.isGenerating;
}

function setGenerateLoadingState(isLoading) {
  state.isGenerating = isLoading;
  elements.analyzeGenerate.classList.toggle("is-loading", isLoading);
  elements.analyzeGenerateLabel.textContent = isLoading ? "Analyzing audio..." : "Generate Presets";
  setReady(Boolean(state.originalBuffer));
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
    for (let i = 0; i < buffer.length; i += 1) {
      mono[i] += data[i] / buffer.numberOfChannels;
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
  elements.waveformPanel.classList.add("has-waveform");
  elements.waveformDropCta.hidden = true;
  elements.waveformEmptyNote.hidden = true;
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
  const family = determineFamily(analysis);

  const brightness = clamp(analysis.centroidHz / 6000 + brightnessBias * 0.35);
  const body = clamp(1 - analysis.centroidHz / 9000 + (analysis.pitchHz > 0 && analysis.pitchHz < 220 ? 0.12 : 0));
  const attack = clamp(1 - analysis.onsetRatio);
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

function mapProfileToVital(profile, index) {
  const family = profile.family;
  const brightness = vary(profile.brightness, 0.08, index, 1);
  const body = vary(profile.body, 0.08, index, 2);
  const attack = vary(profile.attack, 0.1, index, 3);
  const sustain = vary(profile.sustain, 0.08, index, 4);
  const movement = vary(profile.movement, 0.12, index, 5);
  const noise = vary(profile.noise, 0.08, index, 6);
  const width = vary(profile.width, 0.1, index, 7);

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
  const chorusMix = family === "bass" ? lerp(0.02, 0.18, width) : lerp(0.1, 0.58, width);
  const reverbMix = family === "pluck" ? lerp(0.08, 0.28, sustain) : lerp(0.12, 0.62, sustain);
  const distortion = lerp(0.0, 0.56, noise * 0.65 + brightness * 0.35);
  const noiseLevel = lerp(0.0, 0.34, noise);
  const cutoffNormalized = clamp((filterCutoff - 120) / (14000 - 120));

  const register = profile.pitchHz > 0 ? noteName(profile.pitchHz) : "Unknown";
  const name = buildVariantName(family, index);
  const summary = `${familyLabel(family)} leaning ${brightness > 0.58 ? "bright" : "dark"}, ${movement > 0.44 ? "moving" : "steady"}, centered around ${register}.`;

  return {
    name,
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
      reverb_size: clamp(0.3 + sustain * 0.6, 0, 1),
      reverb_decay_time: clamp(0.22 + sustain * 0.72, 0, 1),
      distortion_mix: distortion,
      distortion_drive: lerp(0.1, 4.0, distortion),
      filter_fx_cutoff: lerp(26, 86, brightness),
      filter_fx_resonance: clamp(0.08 + noise * 0.26, 0, 1),
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
      ["Distortion", `${Math.round(distortion * 100)}%`],
      ["Noise Level", `${Math.round(noiseLevel * 100)}%`],
    ],
  };
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

function buildVariantName(family, index) {
  const lexicon = {
    pad: ["Lumen Veil", "Glass Haze", "Soft Meridian", "Night Bloom", "Cold Archive", "Halo Drift", "Pale Tension", "Mist Chamber"],
    pluck: ["Quartz Flicker", "Needle Bloom", "Tight Ember", "Silver Click", "Velvet Strike", "Lacquer Tone", "Wire Petal", "Prism Key"],
    bass: ["Low Furnace", "Iron Pulse", "Sub Vault", "Black Coil", "Stone Current", "Pressure Bloom", "Deep Axis", "Ash Engine"],
    texture: ["Dust Choir", "Static Canopy", "Ghost Fabric", "Granite Air", "Hiss Bloom", "Ruin Current", "Thin Horizon", "Signal Moss"],
  };
  return lexicon[family][index % lexicon[family].length];
}

function variantRole(index, preset) {
  const roles = ["Closest", preset.parameterMap.filter_1_cutoff < 50 ? "Darker" : "More Motion", "Brighter"];
  return roles[index] || "Variant";
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

  if (!presets.length) {
    elements.presetList.innerHTML = `<p class="empty-state">No presets generated yet.</p>`;
    return;
  }

  for (const preset of presets) {
    const card = document.createElement("article");
    card.className = "preset-card";
    const role = variantRole(presets.indexOf(preset), preset);
    const paramRows = preset.parameters
      .slice(0, 6)
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
    elements.presetList.appendChild(card);
  }
}

async function downloadPreset(preset) {
  try {
    updateStatus(`Rendering ${preset.name} in the browser...`);
    const { fileName, blob } = await buildVitalPresetBlob(preset);
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
    updateStatus(`Downloaded ${fileName}.`);
  } catch (error) {
    updateStatus(error.message || "Could not download preset.");
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

    updateStatus("File loaded. Analyze it to generate Vital variants.");
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
  updateStatus("Self-test source loaded. Generating presets...");
  generatePresets();
}

function generatePresets() {
  if (!state.originalBuffer) {
    return;
  }

  updateStatus("Analyzing source and mapping it to Vital parameters...");
  state.analysis = analyzeAudio(state.originalBuffer);
  state.profile = buildProfile(state.analysis);
  const count = FREE_VARIANT_LIMIT;
  state.presets = Array.from({ length: count }, (_, index) => mapProfileToVital(state.profile, index));

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
  updateStatus(`Generated ${state.presets.length} Vital variants from the uploaded sound. Free demo is limited to ${FREE_VARIANT_LIMIT}.`);
}

async function handleGeneratePresets() {
  if (!state.originalBuffer || state.isGenerating) {
    return;
  }

  setGenerateLoadingState(true);
  updateStatus("Analyzing audio locally...");

  await new Promise((resolve) => {
    window.setTimeout(resolve, GENERATE_DELAY_MS);
  });

  try {
    generatePresets();
  } finally {
    setGenerateLoadingState(false);
  }
}

elements.fileInput.addEventListener("change", handleFileChange);
elements.waveformPanel.addEventListener("dragenter", handleDropZoneDrag);
elements.waveformPanel.addEventListener("dragover", handleDropZoneDrag);
elements.waveformPanel.addEventListener("dragleave", handleDropZoneLeave);
elements.waveformPanel.addEventListener("drop", handleDropZoneDrop);
elements.playOriginal.addEventListener("click", () => {
  if (!state.originalBuffer) {
    return;
  }
  playBuffer(state.originalBuffer);
  updateStatus("Playing source audio.");
});
elements.stopPlayback.addEventListener("click", () => {
  stopPlayback();
  updateStatus("Playback stopped.");
});
elements.analyzeGenerate.addEventListener("click", handleGeneratePresets);

for (const control of [elements.brightnessBias, elements.movementBias]) {
  control.addEventListener("input", updateControlLabels);
}

updateControlLabels();
setReady(false);

if (SELF_TEST_ENABLED) {
  loadSyntheticSource();
}

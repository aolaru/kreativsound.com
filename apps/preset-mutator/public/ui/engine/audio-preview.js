let activePreview = null;

function clamp(value, low = 0, high = 1) {
  return Math.max(low, Math.min(high, Number(value) || 0));
}

function settingsFor(source) {
  return source?.parameterMap || source?.settings || source?.data?.settings || {};
}

function familyFrequency(source) {
  if (source?.familyKey === "bass") {
    return 82;
  }
  if (source?.familyKey === "pluck") {
    return 220;
  }
  if (source?.familyKey === "texture") {
    return 146;
  }
  return 196;
}

function cutoffFrequency(value) {
  const normalized = clamp(Number(value || 52) / 100, 0, 1);
  return 180 + normalized * normalized * 9200;
}

function stopActivePreview() {
  if (!activePreview) {
    return;
  }

  for (const node of activePreview.nodes) {
    try {
      if (typeof node.stop === "function") {
        node.stop();
      }
    } catch (error) {
      // The oscillator may already be stopped.
    }
    try {
      node.disconnect();
    } catch (error) {
      // The node may already be disconnected.
    }
  }
  activePreview.context?.close?.().catch(() => {});
  activePreview = null;
}

export async function playPresetPreview(source) {
  stopActivePreview();

  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) {
    throw new Error("Audio preview is not supported in this browser.");
  }

  const context = new AudioContextClass();
  if (context.state === "suspended") {
    await context.resume();
  }

  const settings = settingsFor(source);
  const now = context.currentTime;
  const duration = source?.familyKey === "pluck" ? 1.8 : 2.6;
  const attack = 0.015 + clamp(settings.env_1_attack, 0, 1) * 0.65;
  const release = 0.12 + clamp(settings.env_1_release, 0, 1) * 1.2;
  const sustain = clamp(settings.env_1_sustain ?? 0.55, 0.1, 0.95);
  const baseFrequency = familyFrequency(source);
  const detune = clamp(settings.osc_1_unison_detune, 0, 1) * 18;
  const width = clamp(settings.osc_1_stereo_spread ?? settings.chorus_dry_wet ?? 0.4, 0, 1);
  const noiseLevel = clamp(settings.noise_level, 0, 0.35);
  const filterFrequency = cutoffFrequency(settings.filter_1_cutoff ?? settings.filter_fx_cutoff ?? 52);

  const output = context.createGain();
  output.gain.setValueAtTime(0.0001, now);
  output.gain.exponentialRampToValueAtTime(0.22, now + attack);
  output.gain.setTargetAtTime(0.22 * sustain, now + attack, 0.24);
  output.gain.exponentialRampToValueAtTime(0.0001, now + duration + release);

  const filter = context.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(filterFrequency, now);
  filter.Q.setValueAtTime(0.55 + clamp(settings.filter_1_resonance, 0, 1) * 8, now);

  const pan = context.createStereoPanner();
  pan.pan.setValueAtTime((width - 0.5) * 0.35, now);

  const oscA = context.createOscillator();
  oscA.type = source?.familyKey === "bass" ? "sawtooth" : "triangle";
  oscA.frequency.setValueAtTime(baseFrequency, now);
  oscA.detune.setValueAtTime(-detune, now);

  const oscB = context.createOscillator();
  oscB.type = source?.familyKey === "texture" ? "sine" : "sawtooth";
  oscB.frequency.setValueAtTime(baseFrequency * 1.005, now);
  oscB.detune.setValueAtTime(detune, now);

  const gainA = context.createGain();
  const gainB = context.createGain();
  gainA.gain.setValueAtTime(0.5 * clamp(settings.osc_1_level ?? 0.72, 0.05, 1), now);
  gainB.gain.setValueAtTime(0.34 * clamp(settings.osc_2_level ?? 0.45, 0.02, 1), now);

  const nodes = [oscA, oscB, output, filter, pan, gainA, gainB];
  oscA.connect(gainA).connect(filter);
  oscB.connect(gainB).connect(filter);

  if (noiseLevel > 0.02) {
    const noise = context.createBufferSource();
    const buffer = context.createBuffer(1, context.sampleRate * duration, context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let index = 0; index < data.length; index += 1) {
      data[index] = (Math.random() * 2 - 1) * noiseLevel;
    }
    const noiseGain = context.createGain();
    noiseGain.gain.setValueAtTime(noiseLevel * 0.45, now);
    noise.buffer = buffer;
    noise.connect(noiseGain).connect(filter);
    noise.start(now);
    noise.stop(now + duration);
    nodes.push(noise, noiseGain);
  }

  filter.connect(pan).connect(output).connect(context.destination);
  oscA.start(now);
  oscB.start(now);
  oscA.stop(now + duration + release);
  oscB.stop(now + duration + release);
  const previewSession = { nodes, context };
  activePreview = previewSession;

  window.setTimeout(() => {
    if (activePreview === previewSession) {
      stopActivePreview();
    }
    context.close().catch(() => {});
  }, Math.ceil((duration + release + 0.2) * 1000));
}

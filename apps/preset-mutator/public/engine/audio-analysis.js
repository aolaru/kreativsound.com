import { clamp } from "./common.js";

export function downmix(buffer) {
  const mono = new Float32Array(buffer.length);
  let strongest = null;
  let strongestEnergy = 0;
  for (let channel = 0; channel < buffer.numberOfChannels; channel += 1) {
    const data = buffer.getChannelData(channel);
    let energy = 0;
    for (let i = 0; i < buffer.length; i += 1) {
      mono[i] += data[i] / buffer.numberOfChannels;
      energy += data[i] * data[i];
    }
    if (energy > strongestEnergy) {
      strongest = data;
      strongestEnergy = energy;
    }
  }
  // A side-heavy stereo signal can disappear in the arithmetic mono sum.
  const monoEnergy = mono.reduce((sum, value) => sum + value * value, 0);
  return strongest && monoEnergy < strongestEnergy * 0.05 ? strongest.slice() : mono;
}

function spectrum(data, start, end, sampleRate) {
  const size = Math.min(1024, end - start);
  let magnitudeSum = 0;
  let weightedSum = 0;
  let geometricLogSum = 0;
  let bins = 0;
  for (let bin = 1; bin < size / 2; bin += 1) {
    let real = 0;
    let imaginary = 0;
    for (let n = 0; n < size; n += 1) {
      const sample = data[start + n] * (0.5 - 0.5 * Math.cos(2 * Math.PI * n / (size - 1)));
      const phase = 2 * Math.PI * bin * n / size;
      real += sample * Math.cos(phase);
      imaginary -= sample * Math.sin(phase);
    }
    const magnitude = Math.hypot(real, imaginary);
    magnitudeSum += magnitude;
    weightedSum += magnitude * bin * sampleRate / size;
    geometricLogSum += Math.log(Math.max(1e-12, magnitude));
    bins += 1;
  }
  if (magnitudeSum < 1e-9 || !bins) return { centroidHz: 0, flatness: 0 };
  return {
    centroidHz: weightedSum / magnitudeSum,
    flatness: clamp(Math.exp(geometricLogSum / bins) / (magnitudeSum / bins)),
  };
}

function estimatePitch(data, sampleRate) {
  const size = Math.min(8192, data.length);
  if (size < 256) return { pitchHz: 0, pitchConfidence: 0 };
  let bestStart = 0;
  let bestEnergy = 0;
  for (let frame = 0; frame <= 16; frame += 1) {
    const start = Math.floor((data.length - size) * frame / 16);
    let energy = 0;
    for (let i = start; i < start + size; i += 1) energy += data[i] * data[i];
    if (energy > bestEnergy) { bestEnergy = energy; bestStart = start; }
  }
  const window = data.slice(bestStart, bestStart + size);
  const mean = window.reduce((sum, value) => sum + value, 0) / size;
  for (let i = 0; i < size; i += 1) window[i] -= mean;
  const minimumLag = Math.max(2, Math.floor(sampleRate / 1200));
  const maximumLag = Math.min(size / 2, Math.ceil(sampleRate / 40));
  const correlations = new Float64Array(maximumLag + 2);
  for (let lag = minimumLag - 1; lag <= maximumLag + 1; lag += 1) {
    let cross = 0, left = 0, right = 0;
    for (let i = 0; i < size - lag; i += 1) {
      cross += window[i] * window[i + lag];
      left += window[i] * window[i];
      right += window[i + lag] * window[i + lag];
    }
    correlations[lag] = cross / Math.max(1e-12, Math.sqrt(left * right));
  }
  for (let lag = minimumLag; lag <= maximumLag; lag += 1) {
    const confidence = correlations[lag];
    if (confidence < 0.85 || confidence < correlations[lag - 1] || confidence < correlations[lag + 1]) continue;
    const denominator = correlations[lag - 1] - 2 * confidence + correlations[lag + 1];
    const correction = denominator ? 0.5 * (correlations[lag - 1] - correlations[lag + 1]) / denominator : 0;
    return { pitchHz: sampleRate / (lag + clamp(correction, -0.5, 0.5)), pitchConfidence: confidence };
  }
  return { pitchHz: 0, pitchConfidence: 0 };
}

function stereoWidth(buffer) {
  if (buffer.numberOfChannels < 2) return 0;
  const left = buffer.getChannelData(0), right = buffer.getChannelData(1);
  let difference = 0, total = 0;
  for (let i = 0; i < buffer.length; i += 1) {
    difference += Math.abs(left[i] - right[i]);
    total += Math.abs(left[i]) + Math.abs(right[i]);
  }
  return total ? clamp(difference / total) : 0;
}

export function analyzeAudio(buffer) {
  const mono = downmix(buffer);
  if (!mono.length) throw new Error("This audio file has no samples.");
  let energy = 0, peak = 0, crossings = 0;
  for (let i = 0; i < mono.length; i += 1) {
    const sample = mono[i];
    if (!Number.isFinite(sample)) throw new Error("This audio file contains invalid samples.");
    energy += sample * sample;
    peak = Math.max(peak, Math.abs(sample));
    if (i && (mono[i - 1] < 0) !== (sample < 0)) crossings += 1;
  }
  const rms = Math.sqrt(energy / mono.length);
  if (rms < 1e-5 || peak < 1e-4) throw new Error("This file is silent or too quiet to analyze. Choose a sound with audible content.");

  const threshold = Math.max(1e-5, peak * 0.005);
  let first = 0, last = mono.length - 1;
  while (first < last && Math.abs(mono[first]) < threshold) first += 1;
  while (last > first && Math.abs(mono[last]) < threshold) last -= 1;
  const active = mono.subarray(first, last + 1);
  const envelope = [], spectra = [];
  const frameSize = Math.max(32, Math.ceil(active.length / 64));
  for (let start = 0; start < active.length; start += frameSize) {
    const end = Math.min(active.length, start + frameSize);
    let sum = 0;
    for (let i = start; i < end; i += 1) sum += Math.abs(active[i]);
    const amplitude = sum / (end - start);
    envelope.push(amplitude);
    if (amplitude > rms * 0.02) spectra.push(spectrum(active, start, end, buffer.sampleRate));
  }
  const maximum = Math.max(...envelope);
  const attackFrame = envelope.indexOf(maximum);
  const tail = envelope.slice(Math.floor(envelope.length * 0.65));
  const mean = envelope.reduce((sum, value) => sum + value, 0) / envelope.length;
  const average = key => spectra.reduce((sum, frame) => sum + frame[key], 0) / Math.max(1, spectra.length);
  return {
    rms, peak,
    zeroCrossRate: crossings / active.length,
    onsetRatio: attackFrame / Math.max(1, envelope.length - 1),
    sustainRatio: tail.reduce((sum, value) => sum + value, 0) / Math.max(1, tail.length) / maximum,
    movement: envelope.reduce((sum, value) => sum + Math.abs(value - mean), 0) / envelope.length / mean,
    centroidHz: average("centroidHz"),
    flatness: average("flatness"),
    stereoWidth: stereoWidth(buffer),
    ...estimatePitch(active, buffer.sampleRate),
    duration: active.length / buffer.sampleRate,
  };
}

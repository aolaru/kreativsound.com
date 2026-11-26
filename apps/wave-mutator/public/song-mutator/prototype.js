"use strict";

// A local, deterministic effects prototype. No network requests or model inference.
const ui = Object.fromEntries(["file", "source", "intensity", "intensity-value", "render", "cancel", "status", "original", "mutated", "play", "stop", "seek", "time", "export"].map(name => [name.replace(/-([a-z])/g, (_, c) => c.toUpperCase()), document.getElementById(`song-${name}`)]));
const styleButtons = [...document.querySelectorAll("[data-style]")];
const song = { source: null, fileName: "", result: null, style: "dreamlike", renderedStyle: "", renderedIntensity: 0, context: null, voices: [], playing: false, offset: 0, startedAt: 0, mode: "original", busy: false, cancelled: false, loadId: 0, frame: 0 };
const MAX_DURATION = 600;
const MAX_FILE_BYTES = 250 * 1024 * 1024;

function status(message, kind = "neutral") { ui.status.textContent = message; ui.status.dataset.type = kind; }
function duration(value) { const s = Math.floor(Math.max(0, value)); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`; }
function position() { return song.playing ? Math.min(song.source.duration, song.offset + song.context.currentTime - song.startedAt) : song.offset; }
function sync() {
  const loaded = !!song.source;
  ui.file.disabled = song.busy;
  ui.render.disabled = !loaded || song.busy;
  ui.cancel.hidden = !song.busy;
  styleButtons.forEach(button => { button.disabled = song.busy; button.setAttribute("aria-pressed", String(button.dataset.style === song.style)); });
  ui.intensity.disabled = song.busy;
  ui.intensityValue.textContent = `${ui.intensity.value}%`;
  ui.original.disabled = !loaded || song.busy;
  ui.mutated.disabled = !song.result || song.busy;
  ui.original.setAttribute("aria-pressed", String(song.mode === "original"));
  ui.mutated.setAttribute("aria-pressed", String(song.mode === "mutated"));
  ui.play.disabled = !loaded || song.busy;
  ui.play.textContent = song.playing ? "Pause" : "Play";
  ui.stop.disabled = !loaded || song.busy;
  ui.seek.disabled = !loaded || song.busy;
  ui.export.disabled = !song.result || song.busy;
  const at = loaded ? position() : 0;
  ui.seek.value = loaded ? Math.round(at / song.source.duration * 1000) : 0;
  ui.time.textContent = `${duration(at)} / ${duration(loaded ? song.source.duration : 0)}`;
}
function stop(reset = true) {
  const at = position();
  song.playing = false;
  for (const voice of song.voices) { try { voice.source.stop(); } catch (_) {} voice.source.disconnect(); voice.gain.disconnect(); }
  song.voices = [];
  cancelAnimationFrame(song.frame);
  song.offset = reset ? 0 : at;
  sync();
}
function tick() { if (!song.playing) return; if (position() >= song.source.duration) { stop(); return; } sync(); song.frame = requestAnimationFrame(tick); }
async function play() {
  if (!song.source || song.busy) return;
  if (song.playing) { stop(false); return; }
  const ctx = song.context || (song.context = new AudioContext());
  await ctx.resume();
  if (!song.source || song.busy || song.playing) return;
  if (song.offset >= song.source.duration) song.offset = 0;
  song.voices = [song.source, song.result].map((buffer, index) => {
    if (!buffer) return null;
    const source = ctx.createBufferSource(), gain = ctx.createGain();
    source.buffer = buffer; gain.gain.value = song.mode === (index ? "mutated" : "original") ? 1 : 0;
    source.connect(gain).connect(ctx.destination);
    source.start(0, song.offset);
    return { source, gain };
  }).filter(Boolean);
  song.startedAt = ctx.currentTime; song.playing = true; sync(); tick();
}
function compare(mode) {
  if (mode === "mutated" && !song.result) return;
  song.mode = mode;
  if (song.playing && song.voices.length === 2) {
    const now = song.context.currentTime;
    song.voices.forEach((voice, i) => { voice.gain.gain.cancelScheduledValues(now); voice.gain.gain.setValueAtTime(voice.gain.gain.value, now); voice.gain.gain.linearRampToValueAtTime(mode === (i ? "mutated" : "original") ? 1 : 0, now + .025); });
  }
  sync();
}
function invalidate() { if (!song.result) return; stop(false); song.result = null; song.mode = "original"; status("Settings changed. Render again to hear and export the new variation."); sync(); }

async function loadFile(file) {
  const id = ++song.loadId;
  stop(); song.source = null; song.result = null; song.mode = "original"; sync();
  if (!file) return;
  if (!/\.wav$/i.test(file.name) || file.size > MAX_FILE_BYTES) { status("Choose a WAV file smaller than 250 MiB.", "error"); return; }
  status("Reading and decoding WAV locally…");
  try {
    const data = await file.arrayBuffer();
    const meta = readSourceAudioMetadata(data);
    if (meta.channels !== 2 || !meta.sampleRate) throw new Error("Choose a valid stereo WAV.");
    // Container size provides a conservative early bound before decoding uncompressed PCM.
    if (meta.bitDepth && file.size / (meta.sampleRate * meta.channels * meta.bitDepth / 8) > MAX_DURATION + 2) throw new Error("This prototype supports tracks up to 10 minutes.");
    const decoder = new OfflineAudioContext(1, 1, meta.sampleRate);
    const decoded = await decoder.decodeAudioData(data);
    if (id !== song.loadId) return;
    if (decoded.numberOfChannels !== 2 || decoded.sampleRate !== meta.sampleRate) throw new Error("Could not decode this WAV as stereo at its original sample rate.");
    if (decoded.duration > MAX_DURATION) throw new Error("This prototype supports tracks up to 10 minutes.");
    song.source = decoded; song.fileName = file.name; song.offset = 0;
    ui.source.textContent = `${file.name} · ${duration(decoded.duration)} · stereo · ${decoded.sampleRate.toLocaleString()} Hz`;
    status("Ready. Choose a style and render a variation.", "success");
  } catch (error) { if (id === song.loadId) { ui.source.textContent = "No WAV loaded."; status(error.message || "Could not decode this WAV.", "error"); } }
  sync();
}

function impulse(ctx, seconds, decay, seed) {
  const length = Math.max(1, Math.floor(ctx.sampleRate * seconds));
  const buffer = ctx.createBuffer(2, length, ctx.sampleRate);
  let x = seed >>> 0;
  for (let channel = 0; channel < 2; channel++) {
    const data = buffer.getChannelData(channel);
    for (let i = 0; i < length; i++) { x = (Math.imul(x, 1664525) + 1013904223) >>> 0; data[i] = (x / 2147483648 - 1) * Math.pow(1 - i / length, decay); }
  }
  return buffer;
}
function distortionCurve(amount) {
  const curve = new Float32Array(4096), drive = 1 + amount * 20, normal = Math.tanh(drive);
  for (let i = 0; i < curve.length; i++) { const x = i * 2 / (curve.length - 1) - 1; curve[i] = Math.tanh(x * drive) / normal; }
  return curve;
}
async function renderSong(sourceBuffer, style, intensity) {
  const t = Math.max(0, Math.min(1, intensity / 100));
  const ctx = new OfflineAudioContext(2, sourceBuffer.length, sourceBuffer.sampleRate);
  const source = ctx.createBufferSource(); source.buffer = sourceBuffer;
  const dry = ctx.createGain(); dry.gain.value = 1 - t * (style === "ambient" ? .5 : style === "trashed" ? .8 : .36);
  source.connect(dry).connect(ctx.destination);
  if (t > 0) {
    const wet = ctx.createGain(); wet.gain.setValueAtTime(t * (style === "trashed" ? .9 : .65), 0);
    // Fade only the effect bus at the boundary; the original-length dry song remains intact.
    const fade = Math.min(.08, sourceBuffer.duration / 2);
    wet.gain.setValueAtTime(wet.gain.value, Math.max(0, sourceBuffer.duration - fade));
    wet.gain.linearRampToValueAtTime(0, sourceBuffer.duration);
    wet.connect(ctx.destination);
    const filter = ctx.createBiquadFilter(); filter.type = style === "ghostly" ? "bandpass" : "lowpass";
    filter.frequency.value = style === "ambient" ? 2700 - t * 1100 : style === "ghostly" ? 1400 : style === "trashed" ? 7000 - t * 3000 : 6500 - t * 2400;
    filter.Q.value = style === "ghostly" ? .65 : .35;
    source.connect(filter);
    let output = filter;
    if (style === "trashed") {
      const shaper = ctx.createWaveShaper(); shaper.curve = distortionCurve(t); shaper.oversample = "2x"; output.connect(shaper); output = shaper;
    }
    const directWet = ctx.createGain(); directWet.gain.value = style === "ambient" ? .18 : style === "trashed" ? .85 : .3;
    output.connect(directWet).connect(wet);
    const delay = ctx.createDelay(2), feedback = ctx.createGain(), delayGain = ctx.createGain();
    delay.delayTime.value = style === "ambient" ? .47 : style === "ghostly" ? .31 : style === "trashed" ? .12 : .27;
    feedback.gain.value = (style === "ambient" ? .44 : style === "trashed" ? .18 : .32) * t;
    delayGain.gain.value = style === "trashed" ? .25 : .55;
    output.connect(delay); delay.connect(feedback).connect(delay); delay.connect(delayGain).connect(wet);
    if (style === "dreamlike" || style === "ghostly") {
      const lfo = ctx.createOscillator(), depth = ctx.createGain();
      lfo.frequency.value = style === "ghostly" ? .43 : .17; depth.gain.value = (style === "ghostly" ? .012 : .006) * t;
      lfo.connect(depth).connect(delay.delayTime); lfo.start();
    }
    if (style !== "trashed") {
      const convolver = ctx.createConvolver();
      convolver.buffer = impulse(ctx, style === "ambient" ? 3.2 : style === "ghostly" ? 2.3 : 1.8, style === "ambient" ? 2 : 3, 1942);
      const reverbGain = ctx.createGain(); reverbGain.gain.value = style === "ambient" ? .9 : .65;
      output.connect(convolver).connect(reverbGain).connect(wet);
    }
  }
  source.start();
  const rendered = await ctx.startRendering();
  let peak = 0;
  for (let ch = 0; ch < 2; ch++) { const data = rendered.getChannelData(ch); for (let i = 0; i < data.length; i++) peak = Math.max(peak, Math.abs(data[i])); }
  const gain = peak > .98 ? .98 / peak : 1;
  for (let ch = 0; ch < 2; ch++) { const data = rendered.getChannelData(ch); for (let i = 0; i < data.length; i++) data[i] = Math.max(-8388608, Math.min(8388607, Math.round(data[i] * gain * 8388608))) / 8388608; }
  return { buffer: rendered, gain };
}
function encodeSongWav(buffer) {
  const bytes = buffer.length * 6, data = new ArrayBuffer(44 + bytes), view = new DataView(data);
  const ascii = (offset, text) => { for (let i = 0; i < text.length; i++) view.setUint8(offset + i, text.charCodeAt(i)); };
  ascii(0, "RIFF"); view.setUint32(4, bytes + 36, true); ascii(8, "WAVE"); ascii(12, "fmt "); view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, 2, true); view.setUint32(24, buffer.sampleRate, true); view.setUint32(28, buffer.sampleRate * 6, true); view.setUint16(32, 6, true); view.setUint16(34, 24, true); ascii(36, "data"); view.setUint32(40, bytes, true);
  let offset = 44; const left = buffer.getChannelData(0), right = buffer.getChannelData(1);
  for (let i = 0; i < buffer.length; i++) {
    let v = Math.max(-8388608, Math.min(8388607, Math.round(left[i] * 8388608)));
    view.setUint8(offset++, v & 255); view.setUint8(offset++, (v >> 8) & 255); view.setUint8(offset++, (v >> 16) & 255);
    v = Math.max(-8388608, Math.min(8388607, Math.round(right[i] * 8388608)));
    view.setUint8(offset++, v & 255); view.setUint8(offset++, (v >> 8) & 255); view.setUint8(offset++, (v >> 16) & 255);
  }
  return new Blob([data], { type: "audio/wav" });
}
async function render() {
  if (!song.source || song.busy) return;
  stop(false); song.busy = true; song.cancelled = false; ui.cancel.disabled = false; const source = song.source, style = song.style, intensity = Number(ui.intensity.value); sync();
  status("Rendering the full song locally. This can take a moment…");
  await new Promise(resolve => setTimeout(resolve, 30));
  try {
    if (song.cancelled) return;
    const result = await renderSong(source, style, intensity);
    if (song.cancelled) return;
    song.result = result.buffer; song.renderedStyle = style; song.renderedIntensity = intensity; song.mode = "mutated";
    status(`Variation ready.${result.gain < 1 ? ` Peak protection reduced output by ${(20 * Math.log10(result.gain)).toFixed(1)} dB.` : ""} Preview matches the 24-bit WAV.`, "success");
  } catch (error) { console.error(error); status("Render failed. Try a shorter WAV or a browser with more available memory.", "error"); }
  finally { if (song.cancelled) status("Render cancelled. Any previous variation is still available."); song.busy = false; sync(); }
}
ui.file.addEventListener("change", () => { const file = ui.file.files[0]; ui.file.value = ""; loadFile(file); });
styleButtons.forEach(button => button.addEventListener("click", () => { song.style = button.dataset.style; invalidate(); sync(); }));
ui.intensity.addEventListener("input", () => { invalidate(); sync(); });
ui.render.addEventListener("click", render);
ui.cancel.addEventListener("click", () => { song.cancelled = true; ui.cancel.disabled = true; status("Cancelling; waiting for the browser to finish the current audio render…"); });
ui.original.addEventListener("click", () => compare("original")); ui.mutated.addEventListener("click", () => compare("mutated"));
ui.play.addEventListener("click", () => play().catch(error => { console.error(error); status("Playback could not start. Check browser audio permissions.", "error"); }));
ui.stop.addEventListener("click", () => stop());
ui.seek.addEventListener("input", () => { const wasPlaying = song.playing; if (wasPlaying) stop(false); song.offset = Number(ui.seek.value) / 1000 * song.source.duration; sync(); if (wasPlaying) play().catch(console.error); });
ui.export.addEventListener("click", () => {
  if (!song.result) return;
  try { const url = URL.createObjectURL(encodeSongWav(song.result)); const link = document.createElement("a"); link.href = url; link.download = `${song.fileName.replace(/\.wav$/i, "")}_${song.renderedStyle}_${song.renderedIntensity}.wav`; link.click(); setTimeout(() => URL.revokeObjectURL(url), 60000); }
  catch (error) { console.error(error); status("WAV export failed. Try a shorter track.", "error"); }
});
sync();

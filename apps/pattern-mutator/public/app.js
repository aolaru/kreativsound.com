"use strict";

const PPQ = 480;
const STEPS_PER_BAR = 16;
const SNAP_TICKS = PPQ / 4;
const MIN_DURATION = SNAP_TICKS;
const ROOTS = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const SCALES = {
  minor: [0, 2, 3, 5, 7, 8, 10],
  dorian: [0, 2, 3, 5, 7, 9, 10],
  major: [0, 2, 4, 5, 7, 9, 11],
  mixolydian: [0, 2, 4, 5, 7, 9, 10],
  phrygian: [0, 1, 3, 5, 7, 8, 10],
  pentatonic: [0, 3, 5, 7, 10],
};
const ROLE_LABELS = { melody: "Melody", bass: "Bassline", chords: "Chords", arp: "Arpeggio" };

const elements = {
  root: document.querySelector("#root-note"), scale: document.querySelector("#scale"), role: document.querySelector("#role"), bars: document.querySelector("#bars"),
  complexity: document.querySelector("#complexity"), variation: document.querySelector("#variation"), tempo: document.querySelector("#tempo"),
  complexityValue: document.querySelector("#complexity-value"), variationValue: document.querySelector("#variation-value"), tempoValue: document.querySelector("#tempo-value"),
  generate: document.querySelector("#generate"), surprise: document.querySelector("#surprise"), mutate: document.querySelector("#mutate"), audition: document.querySelector("#audition"), stop: document.querySelector("#stop"), download: document.querySelector("#download"),
  pianoRoll: document.querySelector("#piano-roll"), title: document.querySelector("#pattern-title"), meta: document.querySelector("#pattern-meta"), status: document.querySelector("#status"), lockButtons: document.querySelectorAll(".lock-button"),
  noteVelocity: document.querySelector("#note-velocity"), noteVelocityValue: document.querySelector("#note-velocity-value"), deleteNote: document.querySelector("#delete-note"),
};

const state = {
  pattern: [], audio: null, activeNodes: [], nextNoteId: 1, selectedId: null, edit: null,
  view: { minPitch: 48, pitchSpan: 12, visibleTicks: PPQ * 16 }, locks: { rhythm: false, notes: false, expression: false },
};

ROOTS.forEach((root, index) => {
  const option = document.createElement("option");
  option.value = String(index); option.textContent = root;
  if (root === "D") option.selected = true;
  elements.root.append(option);
});

function randomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function chance(value) { return Math.random() < value; }
function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }
function setting(name) { return name === "root" || name === "bars" ? Number(elements[name].value) : elements[name].value; }
function currentSettings() { return { root: Number(elements.root.value), scale: elements.scale.value, role: elements.role.value, bars: Number(elements.bars.value), complexity: Number(elements.complexity.value), variation: Number(elements.variation.value), tempo: Number(elements.tempo.value) }; }
function scalePitch(root, scale, degree, octave) {
  const intervals = SCALES[scale];
  const wrapped = ((degree % intervals.length) + intervals.length) % intervals.length;
  const octaveShift = Math.floor(degree / intervals.length);
  return clamp(12 * (octave + octaveShift + 1) + root + intervals[wrapped], 24, 108);
}

function sortPattern() { state.pattern.sort((a, b) => a.start - b.start || a.pitch - b.pitch || a.id - b.id); }
function tagNotes(notes) { return notes.map((note) => ({ ...note, id: state.nextNoteId++ })); }
function noteById(id = state.selectedId) { return state.pattern.find((note) => note.id === id); }
function visibleTicks() { return Math.min(currentSettings().bars, 4) * 4 * PPQ; }
function snap(value) { return Math.round(value / SNAP_TICKS) * SNAP_TICKS; }

function scaleSafePitch(target) {
  const { root, scale } = currentSettings();
  const allowed = SCALES[scale];
  let bestPitch = 24;
  let bestDistance = Infinity;
  for (let pitch = 24; pitch <= 108; pitch++) {
    const interval = ((pitch - root) % 12 + 12) % 12;
    if (!allowed.includes(interval)) continue;
    const distance = Math.abs(pitch - target);
    if (distance < bestDistance) { bestPitch = pitch; bestDistance = distance; }
  }
  return bestPitch;
}

function updateEditorControls() {
  const note = noteById();
  elements.noteVelocity.disabled = !note;
  elements.deleteNote.disabled = !note;
  elements.noteVelocity.value = String(note?.velocity ?? 92);
  elements.noteVelocityValue.value = note ? String(note.velocity) : "—";
}

function refreshAfterEdit(message) {
  sortPattern();
  renderPattern();
  describePattern("Edited manually");
  setStatus(message, true);
}

function makeRhythm(role, bars, complexity, variation) {
  const totalSteps = bars * STEPS_PER_BAR;
  const steps = [];
  const density = complexity / 100;
  for (let index = 0; index < totalSteps; index++) {
    const stepInBar = index % STEPS_PER_BAR;
    let hit = false;
    if (role === "chords") hit = stepInBar === 0 || (density > .6 && stepInBar === 8 && chance(.48));
    if (role === "bass") hit = stepInBar % (density > .62 ? 2 : 4) === 0 || (stepInBar % 4 === 2 && chance(density * .38));
    if (role === "arp") hit = stepInBar % (density > .44 ? 2 : 4) === 0 || (density > .8 && stepInBar % 2 === 1 && chance(.5));
    if (role === "melody") hit = (stepInBar % 4 === 0 && chance(.78)) || chance(.055 + density * .17);
    if (hit && chance(.08 + variation * .0015) && stepInBar !== 0) continue;
    if (hit) steps.push(index);
  }
  return steps.length ? steps : [0];
}

function chordDegreesForBar(bar, scaleLength) {
  const progressions = [[0, 5, 3, 6], [0, 3, 5, 4], [0, 6, 5, 3], [0, 2, 5, 4]];
  return progressions[randomInt(0, progressions.length - 1)][bar % 4] % scaleLength;
}

function createPattern(settings) {
  const { root, scale, role, bars, complexity, variation } = settings;
  const notes = [];
  const rhythm = makeRhythm(role, bars, complexity, variation);
  const scaleLength = SCALES[scale].length;
  let melodyDegree = randomInt(0, Math.min(3, scaleLength - 1));
  for (const step of rhythm) {
    const bar = Math.floor(step / STEPS_PER_BAR);
    const tick = step * (PPQ / 4);
    const nextStep = rhythm[rhythm.indexOf(step) + 1] ?? (bars * STEPS_PER_BAR);
    const space = Math.max(PPQ / 4, (nextStep - step) * (PPQ / 4));
    const velocity = clamp(randomInt(68, 95) + Math.round(complexity * .13) + (step % 4 === 0 ? 9 : 0), 45, 118);
    let duration = Math.min(space * (.58 + Math.random() * .27), PPQ * 1.9);
    if (role === "chords") {
      const degree = chordDegreesForBar(bar, scaleLength);
      duration = Math.min(space * .88, PPQ * 1.85);
      [0, 2, 4].forEach((offset, voice) => notes.push({ start: tick, duration, pitch: scalePitch(root, scale, degree + offset, 3 + (voice === 2 && chance(.28) ? 1 : 0)), velocity: clamp(velocity - voice * 5, 40, 112), chord: true }));
      continue;
    }
    let degree;
    let octave;
    if (role === "bass") {
      degree = step % STEPS_PER_BAR === 0 ? chordDegreesForBar(bar, scaleLength) : chordDegreesForBar(bar, scaleLength) + (chance(.34 + variation / 300) ? randomInt(-1, 2) : 0);
      octave = 1;
      duration = Math.min(space * (.64 + Math.random() * .2), PPQ * .95);
    } else if (role === "arp") {
      const chordRoot = chordDegreesForBar(bar, scaleLength);
      degree = chordRoot + [0, 2, 4, 2, 0, 4][step % 6] + (chance(variation / 230) ? randomInt(-1, 1) : 0);
      octave = 3 + (step % 8 > 5 ? 1 : 0);
      duration = Math.min(space * .7, PPQ * .46);
    } else {
      melodyDegree += randomInt(-1, 1) + (chance(variation / 160) ? randomInt(-2, 2) : 0);
      melodyDegree = clamp(melodyDegree, -1, scaleLength + 4);
      degree = melodyDegree;
      octave = 3;
      duration = Math.min(space * (.5 + Math.random() * .33), PPQ * 1.3);
    }
    notes.push({ start: tick, duration: Math.round(duration), pitch: scalePitch(root, scale, degree, octave), velocity, chord: false });
  }
  return notes.sort((a, b) => a.start - b.start || a.pitch - b.pitch);
}

function combineMutation(candidate) {
  const previous = state.pattern;
  if (!previous.length) return candidate;
  return candidate.map((note, index) => {
    const source = previous[index % previous.length];
    return {
      ...note,
      start: state.locks.rhythm ? source.start : note.start,
      duration: state.locks.rhythm || state.locks.expression ? source.duration : note.duration,
      pitch: state.locks.notes ? source.pitch : note.pitch,
      velocity: state.locks.expression ? source.velocity : note.velocity,
      chord: state.locks.notes ? source.chord : note.chord,
    };
  }).sort((a, b) => a.start - b.start || a.pitch - b.pitch);
}

function updateRangeLabels() {
  elements.complexityValue.value = `${elements.complexity.value}%`;
  elements.variationValue.value = `${elements.variation.value}%`;
  elements.tempoValue.value = `${elements.tempo.value} BPM`;
}

function renderPattern() {
  const settings = currentSettings();
  elements.pianoRoll.replaceChildren();
  elements.pianoRoll.classList.remove("empty");
  const totalTicks = settings.bars * 4 * PPQ;
  const visibleStart = 0;
  const visibleTicks = Math.min(totalTicks, 4 * 4 * PPQ);
  const visible = state.pattern.filter((note) => note.start < visibleTicks);
  state.view.visibleTicks = visibleTicks;
  if (!visible.length) {
    elements.pianoRoll.classList.add("empty");
    elements.pianoRoll.innerHTML = '<div class="empty-pattern">The selected locks left no visible notes. Generate a fresh pattern.</div>';
    updateEditorControls();
    return;
  }
  const minPitch = Math.min(...visible.map((note) => note.pitch));
  const maxPitch = Math.max(...visible.map((note) => note.pitch));
  const pitchSpan = Math.max(8, maxPitch - minPitch + 3);
  state.view.minPitch = minPitch;
  state.view.pitchSpan = pitchSpan;
  visible.forEach((note) => {
    const item = document.createElement("div");
    item.className = `note${note.chord ? " chord" : ""}${note.id === state.selectedId ? " is-selected" : ""}`;
    item.dataset.noteId = String(note.id);
    const left = (note.start - visibleStart) / visibleTicks * 100;
    const width = Math.max(.7, Math.min(100 - left, note.duration / visibleTicks * 100));
    const bottom = clamp((note.pitch - minPitch + 1) / pitchSpan * 100, 2, 91);
    item.style.left = `${left}%`; item.style.width = `${width}%`; item.style.bottom = `${bottom}%`; item.style.opacity = String(.62 + note.velocity / 310);
    item.title = `${ROOTS[note.pitch % 12]}${Math.floor(note.pitch / 12) - 1} · velocity ${note.velocity}`;
    item.setAttribute("aria-label", `${item.title}. Drag to move; drag the right edge to resize.`);
    elements.pianoRoll.append(item);
  });
  updateEditorControls();
}

function describePattern(action) {
  const s = currentSettings();
  const role = ROLE_LABELS[s.role];
  const scaleName = elements.scale.options[elements.scale.selectedIndex].text;
  elements.title.textContent = `${role} pattern — ${ROOTS[s.root]} ${scaleName}`;
  elements.meta.textContent = `${s.bars} ${s.bars === 1 ? "bar" : "bars"} · ${state.pattern.length} MIDI notes · ${s.tempo} BPM · ${action}`;
}

function generate(action = "Generated") {
  state.pattern = tagNotes(createPattern(currentSettings()));
  state.selectedId = null;
  renderPattern(); describePattern(action);
  [elements.mutate, elements.audition, elements.download].forEach((button) => { button.disabled = false; });
  setStatus(`${action}. Lock a dimension, then mutate what remains.`, true);
}

function mutate() {
  const locks = Object.entries(state.locks).filter(([, locked]) => locked).map(([name]) => name);
  state.pattern = tagNotes(combineMutation(createPattern(currentSettings())));
  state.selectedId = null;
  renderPattern(); describePattern(locks.length ? `Mutated with ${locks.join(", ")} locked` : "Mutated freely");
  setStatus(locks.length ? `Mutated unlocked parts; ${locks.join(" and ")} stayed in place.` : "Fresh mutation created. Lock something to keep it on the next pass.", true);
}

function setStatus(message, success = false) { elements.status.textContent = message; elements.status.classList.toggle("success", success); }

function midiBytes() {
  const events = [];
  state.pattern.forEach((note) => {
    events.push({ time: Math.round(note.start), data: [0x90, note.pitch, note.velocity] });
    events.push({ time: Math.round(note.start + note.duration), data: [0x80, note.pitch, 0] });
  });
  events.sort((a, b) => a.time - b.time || a.data[0] - b.data[0]);
  const track = [];
  let lastTime = 0;
  events.forEach((event) => { track.push(...variableLength(event.time - lastTime), ...event.data); lastTime = event.time; });
  track.push(0, 0xff, 0x2f, 0);
  const header = [0x4d, 0x54, 0x68, 0x64, 0, 0, 0, 6, 0, 0, 0, 1, PPQ >> 8, PPQ & 0xff];
  const trackLength = track.length;
  return new Uint8Array([...header, 0x4d, 0x54, 0x72, 0x6b, (trackLength >>> 24) & 0xff, (trackLength >>> 16) & 0xff, (trackLength >>> 8) & 0xff, trackLength & 0xff, ...track]);
}

function variableLength(value) {
  let buffer = value & 0x7f; const bytes = [];
  while ((value >>= 7)) { buffer <<= 8; buffer |= (value & 0x7f) | 0x80; }
  while (true) { bytes.push(buffer & 0xff); if (buffer & 0x80) buffer >>= 8; else break; }
  return bytes;
}

function downloadMidi() {
  const s = currentSettings();
  const file = new Blob([midiBytes()], { type: "audio/midi" });
  const url = URL.createObjectURL(file); const link = document.createElement("a");
  const safeScale = elements.scale.options[elements.scale.selectedIndex].text.toLowerCase().replaceAll(" ", "-");
  link.href = url; link.download = `pattern-mutator-${ROLE_LABELS[s.role].toLowerCase()}-${ROOTS[s.root].toLowerCase()}-${safeScale}-${s.bars}bars.mid`;
  link.click(); URL.revokeObjectURL(url);
  setStatus("MIDI file downloaded. Drag it into your DAW and make it yours.", true);
}

function stopAudition() {
  state.activeNodes.forEach(({ oscillator, gain }) => { try { oscillator.stop(); gain.disconnect(); } catch {} });
  state.activeNodes = []; elements.stop.disabled = true;
}

function audition() {
  stopAudition();
  state.audio ||= new AudioContext();
  const context = state.audio; const s = currentSettings();
  const secondsPerTick = 60 / s.tempo / PPQ;
  const limitTicks = Math.min(s.bars, 8) * 4 * PPQ;
  const startAt = context.currentTime + .05;
  state.pattern.filter((note) => note.start < limitTicks).forEach((note) => {
    const oscillator = context.createOscillator(); const gain = context.createGain();
    oscillator.type = note.chord ? "triangle" : s.role === "bass" ? "sawtooth" : "sine";
    oscillator.frequency.value = 440 * Math.pow(2, (note.pitch - 69) / 12);
    const begins = startAt + note.start * secondsPerTick; const ends = begins + Math.max(.05, note.duration * secondsPerTick);
    gain.gain.setValueAtTime(.0001, begins); gain.gain.exponentialRampToValueAtTime(.055 * (note.velocity / 100), begins + .012); gain.gain.exponentialRampToValueAtTime(.0001, ends);
    oscillator.connect(gain).connect(context.destination); oscillator.start(begins); oscillator.stop(ends + .02); state.activeNodes.push({ oscillator, gain });
  });
  elements.stop.disabled = false;
  const auditionBars = Math.min(s.bars, 8);
  setStatus(`Auditioning ${auditionBars} ${auditionBars === 1 ? "bar" : "bars"}${s.bars > 8 ? " of the full pattern" : ""}.`);
  window.setTimeout(stopAudition, Math.min(60_000, limitTicks * secondsPerTick * 1000 + 220));
}

function surprise() {
  elements.root.value = String(randomInt(0, 11));
  elements.scale.value = ["minor", "dorian", "mixolydian", "phrygian", "pentatonic"][randomInt(0, 4)];
  elements.role.value = ["melody", "bass", "chords", "arp"][randomInt(0, 3)];
  elements.bars.value = ["2", "4", "4", "8", "8", "16"][randomInt(0, 5)];
  elements.complexity.value = String(randomInt(32, 82)); elements.variation.value = String(randomInt(24, 78)); elements.tempo.value = String(randomInt(86, 144));
  updateRangeLabels(); generate("Surprise pattern generated");
}

function pointerPosition(event) {
  const rect = elements.pianoRoll.getBoundingClientRect();
  const x = clamp(event.clientX - rect.left, 0, rect.width);
  const y = clamp(event.clientY - rect.top, 0, rect.height);
  const rawTick = x / rect.width * state.view.visibleTicks;
  const rawPitch = state.view.minPitch + (1 - y / rect.height) * state.view.pitchSpan;
  return { x, y, tick: clamp(snap(rawTick), 0, Math.max(0, state.view.visibleTicks - SNAP_TICKS)), pitch: scaleSafePitch(Math.round(rawPitch)) };
}

function selectNote(id) {
  state.selectedId = id;
  document.querySelectorAll(".note").forEach((item) => item.classList.toggle("is-selected", Number(item.dataset.noteId) === id));
  updateEditorControls();
}

function deleteSelectedNote() {
  const note = noteById();
  if (!note) return;
  state.pattern = state.pattern.filter((item) => item.id !== note.id);
  state.selectedId = null;
  refreshAfterEdit("Selected note deleted.");
}

function handlePianoPointerDown(event) {
  if (!state.pattern.length) return;
  const noteElement = event.target.closest(".note");
  const position = pointerPosition(event);
  elements.pianoRoll.focus({ preventScroll: true });

  if (noteElement) {
    const note = noteById(Number(noteElement.dataset.noteId));
    if (!note) return;
    selectNote(note.id);
    const noteRect = noteElement.getBoundingClientRect();
    state.edit = {
      type: event.clientX >= noteRect.right - Math.min(14, noteRect.width * .35) ? "resize" : "move",
      id: note.id, startX: event.clientX, startY: event.clientY, original: { ...note }, moved: false,
    };
    noteElement.setPointerCapture?.(event.pointerId);
    event.preventDefault();
    return;
  }

  if (event.target !== elements.pianoRoll) return;
  state.edit = { type: "add", startX: event.clientX, startY: event.clientY, position, moved: false };
  elements.pianoRoll.setPointerCapture?.(event.pointerId);
}

function handlePianoPointerMove(event) {
  if (!state.edit) return;
  if (Math.abs(event.clientX - state.edit.startX) > 4 || Math.abs(event.clientY - state.edit.startY) > 4) state.edit.moved = true;
}

function handlePianoPointerUp(event) {
  const edit = state.edit;
  if (!edit) return;
  state.edit = null;
  if (edit.type === "add") {
    if (edit.moved) return;
    const position = pointerPosition(event);
    const note = { id: state.nextNoteId++, start: position.tick, duration: SNAP_TICKS * 2, pitch: position.pitch, velocity: 92, chord: false };
    state.pattern.push(note);
    state.selectedId = note.id;
    refreshAfterEdit("Added a scale-safe MIDI note.");
    return;
  }
  if (!edit.moved) return;
  const note = noteById(edit.id);
  if (!note) return;
  const rect = elements.pianoRoll.getBoundingClientRect();
  const tickDelta = snap((event.clientX - edit.startX) / rect.width * state.view.visibleTicks);
  if (edit.type === "resize") {
    note.duration = clamp(snap(edit.original.duration + tickDelta), MIN_DURATION, Math.max(MIN_DURATION, state.view.visibleTicks - note.start));
    refreshAfterEdit("Resized selected note.");
    return;
  }
  const pitchDelta = Math.round(-(event.clientY - edit.startY) / rect.height * state.view.pitchSpan);
  note.start = clamp(edit.original.start + tickDelta, 0, Math.max(0, state.view.visibleTicks - MIN_DURATION));
  note.pitch = scaleSafePitch(edit.original.pitch + pitchDelta);
  refreshAfterEdit("Moved selected note.");
}

[elements.complexity, elements.variation, elements.tempo].forEach((input) => input.addEventListener("input", updateRangeLabels));
elements.generate.addEventListener("click", () => generate());
elements.surprise.addEventListener("click", surprise);
elements.mutate.addEventListener("click", mutate);
elements.download.addEventListener("click", downloadMidi);
elements.audition.addEventListener("click", audition);
elements.stop.addEventListener("click", () => { stopAudition(); setStatus("Audition stopped."); });
elements.noteVelocity.addEventListener("input", () => {
  const note = noteById();
  if (!note) return;
  note.velocity = Number(elements.noteVelocity.value);
  elements.noteVelocityValue.value = String(note.velocity);
  const rendered = document.querySelector(`.note[data-note-id="${note.id}"]`);
  if (rendered) rendered.style.opacity = String(.62 + note.velocity / 310);
});
elements.noteVelocity.addEventListener("change", () => {
  if (!noteById()) return;
  refreshAfterEdit("Updated selected note velocity.");
});
elements.deleteNote.addEventListener("click", deleteSelectedNote);
elements.pianoRoll.addEventListener("pointerdown", handlePianoPointerDown);
elements.pianoRoll.addEventListener("pointermove", handlePianoPointerMove);
elements.pianoRoll.addEventListener("pointerup", handlePianoPointerUp);
elements.pianoRoll.addEventListener("pointercancel", () => { state.edit = null; });
window.addEventListener("keydown", (event) => {
  if ((event.key !== "Backspace" && event.key !== "Delete") || !noteById()) return;
  if (["INPUT", "SELECT", "TEXTAREA"].includes(document.activeElement?.tagName)) return;
  event.preventDefault();
  deleteSelectedNote();
});
elements.lockButtons.forEach((button) => button.addEventListener("click", () => {
  const key = button.dataset.lock; state.locks[key] = !state.locks[key]; button.setAttribute("aria-pressed", String(state.locks[key]));
  setStatus(`${key[0].toUpperCase()}${key.slice(1)} ${state.locks[key] ? "locked" : "unlocked"}.`);
}));
updateRangeLabels();

import {
  PPQ, BAR_TICKS, SNAP_TICKS, ROOTS,
  clamp, randomInt, pitchLabel, nearestScalePitch, createHarmony, createPattern, mutatePattern,
  regeneratePatternBar, performanceNotes, pitchViewport, buildMidi,
} from "./engine.js?v=0.5.0";
import { DRAFT_KEY, parseDraft } from "./draft.js?v=0.5.0";

const ROLE_LABELS = { melody: "Melody", bass: "Bassline", chords: "Chords", arp: "Arpeggio" };
const GROOVE_LABELS = { straight: "Straight", syncopated: "Syncopated", "half-time": "Half-time", driving: "Driving", sparse: "Sparse" };
const REGISTER_LABELS = { low: "Low", mid: "Mid", high: "High" };
const STYLE_STARTERS = {
  "cinematic-pulse": { label: "Cinematic pulse", root: 2, scale: "minor", role: "arp", bars: 4, groove: "syncopated", register: "mid", complexity: 64, variation: 42, tempo: 112 },
  "warm-chords": { label: "Warm chords", root: 0, scale: "major", role: "chords", bars: 4, groove: "straight", register: "mid", complexity: 46, variation: 26, tempo: 96 },
  "dark-bass": { label: "Dark bass", root: 2, scale: "phrygian", role: "bass", bars: 4, groove: "half-time", register: "low", complexity: 58, variation: 34, tempo: 118 },
  "broken-motion": { label: "Broken motion", root: 8, scale: "minor", role: "melody", bars: 4, groove: "sparse", register: "mid", complexity: 72, variation: 76, tempo: 126 },
  "glass-arp": { label: "Glass arp", root: 9, scale: "dorian", role: "arp", bars: 4, groove: "driving", register: "high", complexity: 68, variation: 52, tempo: 128 },
};

const elements = Object.fromEntries(Object.entries({
  root: "root-note", scale: "scale", role: "role", bars: "bars", groove: "groove", register: "register",
  complexity: "complexity", variation: "variation", tempo: "tempo",
  complexityValue: "complexity-value", variationValue: "variation-value", tempoValue: "tempo-value",
  generate: "generate", surprise: "surprise", mutate: "mutate", audition: "audition", stop: "stop", download: "download",
  pianoRoll: "piano-roll", pitchLabels: "pitch-labels", ruler: "bar-ruler", title: "pattern-title", meta: "pattern-meta", status: "status",
  noteVelocity: "note-velocity", noteVelocityValue: "note-velocity-value", deleteNote: "delete-note",
  undo: "undo", redo: "redo", resetPattern: "reset-pattern", auditionSound: "audition-sound", loopAudition: "loop-audition",
  regenerateBar: "regenerate-bar", regenerateBarButton: "regenerate-bar-button",
  viewPage: "view-page", visibleBars: "visible-bars", previousPage: "previous-page", nextPage: "next-page",
  viewSummary: "view-summary", followPlayback: "follow-playback", selectedNote: "selected-note",
  mutationAmount: "mutation-amount", mutationValue: "mutation-value", draftStatus: "draft-status",
}).map(([name, id]) => [name, document.getElementById(id)]));
elements.lockButtons = document.querySelectorAll("[data-lock]");
elements.styleButtons = document.querySelectorAll("[data-style]");

const state = {
  pattern: [], settings: null, harmony: null, audio: null, activeNodes: [], nextNoteId: 1, selectedId: null,
  edit: null, history: [], future: [], playheadTimer: null, auditionTimer: null, playback: null,
  velocityHistoryPushed: false, viewPage: 0,
  view: { minPitch: 48, pitchSpan: 12, start: 0, visibleTicks: BAR_TICKS * 4 },
  locks: { rhythm: false, notes: false, expression: false },
  draftTimer: null, draftUnavailable: false,
};

ROOTS.forEach((root, index) => {
  const option = new Option(root, String(index));
  option.selected = root === "D";
  elements.root.append(option);
});
if (window.matchMedia("(max-width: 720px)").matches) elements.visibleBars.value = "2";

function currentSettings() {
  return {
    root: Number(elements.root.value), scale: elements.scale.value, role: elements.role.value,
    bars: Number(elements.bars.value), groove: elements.groove.value, register: elements.register.value,
    complexity: Number(elements.complexity.value), variation: Number(elements.variation.value), tempo: Number(elements.tempo.value),
  };
}
function patternSettings() { return state.settings || currentSettings(); }
function totalTicks() { return patternSettings().bars * BAR_TICKS; }
function snap(value) { return Math.round(value / SNAP_TICKS) * SNAP_TICKS; }
function tagNotes(notes) { return notes.map((note) => ({ ...note, id: note.id ?? state.nextNoteId++ })); }
function noteById(id = state.selectedId) { return state.pattern.find((note) => note.id === id); }
function sortPattern() { state.pattern.sort((a, b) => a.start - b.start || a.pitch - b.pitch || a.id - b.id); }
function setStatus(message, success = false) {
  elements.status.textContent = message;
  elements.status.classList.toggle("success", success);
  scheduleDraft();
}
function updateRangeLabels() {
  elements.complexityValue.value = elements.complexity.value + "%";
  elements.variationValue.value = elements.variation.value + "%";
  elements.tempoValue.value = elements.tempo.value + " BPM";
  elements.mutationValue.value = elements.mutationAmount.value + "%";
}

function snapshotPattern() {
  return {
    pattern: state.pattern.map((note) => ({ ...note })), settings: state.settings && { ...state.settings },
    harmony: state.harmony && structuredClone(state.harmony),
    nextNoteId: state.nextNoteId, selectedId: state.selectedId, viewPage: state.viewPage,
  };
}
function restoreSnapshot(snapshot) {
  state.pattern = snapshot.pattern.map((note) => ({ ...note }));
  state.settings = snapshot.settings && { ...snapshot.settings };
  state.harmony = snapshot.harmony && structuredClone(snapshot.harmony);
  state.nextNoteId = snapshot.nextNoteId;
  state.selectedId = snapshot.selectedId;
  state.viewPage = snapshot.viewPage;
  if (state.settings) {
    Object.entries(state.settings).forEach(([name, value]) => { elements[name].value = String(value); });
    updateRangeLabels();
  }
}
function rememberPattern() {
  stopAudition();
  if (state.edit) cancelEdit();
  state.history.push(snapshotPattern());
  if (state.history.length > 50) state.history.shift();
  state.future = [];
}
function updateEditorControls() {
  const note = noteById();
  elements.noteVelocity.disabled = !note;
  elements.deleteNote.disabled = !note;
  elements.noteVelocity.value = String(note?.velocity ?? 92);
  elements.noteVelocityValue.value = note ? String(note.velocity) : "—";
  elements.selectedNote.textContent = note
    ? pitchLabel(note.pitch) + " · bar " + (Math.floor(note.start / BAR_TICKS) + 1) + " · " + (note.duration / PPQ).toFixed(2) + " beats"
    : "Click to add · drag to move · drag the right edge to resize";
}
function updatePatternControls() {
  const hasPattern = state.pattern.length > 0;
  const allLocked = Object.values(state.locks).every(Boolean);
  [elements.audition, elements.download, elements.followPlayback].forEach((control) => { control.disabled = !hasPattern; });
  elements.regenerateBar.disabled = !state.settings;
  elements.resetPattern.disabled = !state.settings;
  elements.mutate.disabled = !hasPattern || allLocked;
  elements.regenerateBarButton.disabled = !state.settings || allLocked;
  elements.undo.disabled = state.history.length === 0;
  elements.redo.disabled = state.future.length === 0;
}
function updateBarOptions() {
  const previous = Number(elements.regenerateBar.value) || 1;
  elements.regenerateBar.replaceChildren();
  for (let bar = 1; bar <= patternSettings().bars; bar++) elements.regenerateBar.append(new Option("Bar " + bar, String(bar)));
  elements.regenerateBar.value = String(Math.min(previous, patternSettings().bars));
}
function describePattern(action = "") {
  if (!state.settings) {
    elements.title.textContent = "Nothing generated yet";
    elements.meta.textContent = "Choose a direction, then generate.";
    return;
  }
  const s = state.settings;
  const scaleName = { minor: "Natural minor", pentatonic: "Minor pentatonic" }[s.scale] || s.scale[0].toUpperCase() + s.scale.slice(1);
  elements.title.textContent = ROLE_LABELS[s.role] + " — " + ROOTS[s.root] + " " + scaleName;
  elements.meta.textContent = s.bars + (s.bars === 1 ? " bar · " : " bars · ") + REGISTER_LABELS[s.register] + " · " + GROOVE_LABELS[s.groove]
    + " · " + state.pattern.length + " notes · " + s.tempo + " BPM" + (action ? " · " + action : "");
}
function refreshAfterEdit(message) {
  const normalized = performanceNotes(state.pattern, patternSettings());
  const adjusted = normalized.some((note) => state.pattern.find((item) => item.id === note.id)?.duration !== note.duration);
  state.pattern = normalized;
  if (adjusted) message += " Overlapping repeated notes now retrigger cleanly.";
  sortPattern();
  renderPattern();
  describePattern("Edited");
  setStatus(message, true);
}

function updateViewOptions() {
  const bars = patternSettings().bars;
  const pageBars = Math.min(Number(elements.visibleBars.value), bars);
  const pages = Math.ceil(bars / pageBars);
  state.viewPage = clamp(state.viewPage, 0, pages - 1);
  elements.viewPage.replaceChildren();
  for (let page = 0; page < pages; page++) {
    const first = page * pageBars + 1;
    const last = Math.min(bars, first + pageBars - 1);
    elements.viewPage.append(new Option(first === last ? "Bar " + first : "Bars " + first + "–" + last, String(page)));
  }
  elements.viewPage.value = String(state.viewPage);
  elements.previousPage.disabled = state.viewPage === 0;
  elements.nextPage.disabled = state.viewPage === pages - 1;
  elements.viewPage.disabled = !state.settings;
  elements.viewSummary.textContent = "of " + bars + (bars === 1 ? " bar" : " bars");
  state.view.start = state.viewPage * pageBars * BAR_TICKS;
  state.view.visibleTicks = Math.min(pageBars * BAR_TICKS, totalTicks() - state.view.start);
}

function positionNote(item, note) {
  const { start, visibleTicks, minPitch, pitchSpan } = state.view;
  const left = (note.start - start) / visibleTicks * 100;
  const right = (note.start + note.duration - start) / visibleTicks * 100;
  item.style.left = Math.max(0, left) + "%";
  item.style.width = Math.max(.3, Math.min(100, right) - Math.max(0, left)) + "%";
  item.style.bottom = ((note.pitch - minPitch) / pitchSpan * 100) + "%";
  item.style.height = (100 / pitchSpan) + "%";
  item.style.opacity = String(.62 + note.velocity / 310);
  item.title = pitchLabel(note.pitch) + " · velocity " + note.velocity;
  item.setAttribute("aria-label", item.title + ". Drag to move; drag the right edge to resize.");
}

function renderPattern() {
  updateViewOptions();
  elements.pianoRoll.replaceChildren();
  elements.pitchLabels.replaceChildren();
  elements.ruler.replaceChildren();
  const { start, visibleTicks } = state.view;
  // One stable pitch axis for the entire clip, including during note movement.
  if (!state.edit) {
    Object.assign(state.view, pitchViewport(state.pattern, patternSettings(), state.view));
  }
  elements.pianoRoll.style.setProperty("--pitch-rows", state.view.pitchSpan);
  elements.pianoRoll.style.setProperty("--steps", visibleTicks / SNAP_TICKS);
  const height = clamp(state.view.pitchSpan * 16, 192, 352);
  elements.pianoRoll.style.height = height + "px";
  elements.pitchLabels.style.height = height + "px";
  for (let row = state.view.pitchSpan - 1; row >= 0; row--) {
    const pitch = state.view.minPitch + row;
    const label = document.createElement("span");
    label.textContent = pitchLabel(pitch);
    label.className = ROOTS[pitch % 12].includes("#") ? "black-key" : "";
    elements.pitchLabels.append(label);
  }
  const visibleBars = visibleTicks / BAR_TICKS;
  for (let bar = 0; bar < visibleBars; bar++) {
    const label = document.createElement("span");
    label.textContent = "Bar " + (start / BAR_TICKS + bar + 1);
    label.style.left = (bar / visibleBars * 100) + "%";
    elements.ruler.append(label);
    const line = document.createElement("div");
    line.className = "roll-bar-line";
    line.style.left = label.style.left;
    elements.pianoRoll.append(line);
  }
  elements.pianoRoll.classList.toggle("empty", !state.settings);
  if (!state.settings) {
    const placeholder = document.createElement("div");
    placeholder.className = "empty-pattern";
    placeholder.textContent = "Generate an idea to start editing.";
    elements.pianoRoll.append(placeholder);
  }
  const visible = state.pattern.filter((note) => note.start < start + visibleTicks && note.start + note.duration > start);
  visible.forEach((note) => {
    const item = document.createElement("div");
    item.className = "note" + (note.chord ? " chord" : "") + (note.id === state.selectedId ? " is-selected" : "");
    item.dataset.noteId = String(note.id);
    positionNote(item, note);
    elements.pianoRoll.append(item);
  });
  const playhead = document.createElement("div");
  playhead.className = "playhead";
  playhead.hidden = true;
  elements.pianoRoll.append(playhead);
  updateEditorControls();
  updatePatternControls();
  updateBarOptions();
  updatePlayhead();
  scheduleDraft();
}

function changePage(page) {
  state.viewPage = page;
  renderPattern();
}
function undo() {
  const previous = state.history.pop();
  if (!previous) return;
  stopAudition();
  if (state.edit) cancelEdit();
  state.future.push(snapshotPattern());
  restoreSnapshot(previous);
  renderPattern(); describePattern("Undo");
  setStatus("Undid the last pattern change.", true);
}
function redo() {
  const next = state.future.pop();
  if (!next) return;
  stopAudition();
  if (state.edit) cancelEdit();
  state.history.push(snapshotPattern());
  restoreSnapshot(next);
  renderPattern(); describePattern("Redo");
  setStatus("Redid the pattern change.", true);
}
function resetPattern() {
  if (!state.settings) return;
  rememberPattern();
  state.pattern = []; state.settings = null; state.harmony = null; state.selectedId = null; state.viewPage = 0;
  renderPattern(); describePattern();
  setStatus("Pattern reset. Undo restores it.", true);
}

function generate(action = "Generated") {
  rememberPattern();
  state.settings = currentSettings();
  state.harmony = createHarmony(state.settings);
  state.pattern = tagNotes(createPattern(state.settings, state.harmony));
  state.selectedId = null; state.viewPage = 0;
  renderPattern(); describePattern(action);
  setStatus(action + ". Lock a dimension, then mutate what remains.", true);
}
function mutate() {
  if (!state.pattern.length || Object.values(state.locks).every(Boolean)) return;
  const amount = Number(elements.mutationAmount.value);
  if (!amount) { setStatus("Mutation amount is 0%. Your current pattern is unchanged."); return; }
  const candidate = mutatePattern(state.pattern, patternSettings(), state.locks, amount, { harmony: state.harmony });
  if (JSON.stringify(candidate) === JSON.stringify(state.pattern)) {
    setStatus("No notes changed on this pass. Try again or increase Mutation amount.");
    return;
  }
  rememberPattern();
  state.pattern = candidate;
  state.selectedId = null;
  refreshAfterEdit("Developed the current idea at " + amount + "%; locked dimensions are preserved.");
}
function regenerateBar() {
  if (!state.settings || Object.values(state.locks).every(Boolean)) return;
  const bar = Number(elements.regenerateBar.value) - 1;
  const candidate = regeneratePatternBar(state.pattern, patternSettings(), state.harmony, bar, state.locks);
  if (JSON.stringify(candidate) === JSON.stringify(state.pattern)) {
    setStatus("This bar could not change with the current locks and neighboring notes.");
    return;
  }
  rememberPattern();
  state.pattern = tagNotes(candidate);
  state.selectedId = null;
  const pageBars = Math.min(Number(elements.visibleBars.value), state.settings.bars);
  state.viewPage = Math.floor(bar / pageBars);
  refreshAfterEdit("Refreshed bar " + (bar + 1) + " within its original harmony; every other bar is unchanged.");
}
function downloadMidi() {
  const s = patternSettings();
  const url = URL.createObjectURL(new Blob([buildMidi(state.pattern, s)], { type: "audio/midi" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "pattern-mutator-" + s.role + "-" + ROOTS[s.root].toLowerCase().replace("#", "-sharp") + "-" + s.scale + "-" + s.bars + "bars.mid";
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  setStatus("MIDI downloaded with " + s.tempo + " BPM, 4/4, and the full " + s.bars + "-bar length.", true);
}

function stopAudition() {
  state.playback = null;
  state.activeNodes.forEach(({ oscillator, gain }) => { try { oscillator.stop(); } catch {} gain.disconnect(); });
  state.activeNodes = [];
  window.clearInterval(state.playheadTimer); window.clearTimeout(state.auditionTimer);
  state.playheadTimer = null; state.auditionTimer = null;
  const playhead = elements.pianoRoll.querySelector(".playhead");
  if (playhead) playhead.hidden = true;
  elements.stop.disabled = true;
}
function updatePlayhead() {
  if (!state.playback || state.edit) return;
  const playback = state.playback;
  const tick = Math.max(0, (state.audio.currentTime - playback.startAt) / playback.secondsPerTick);
  if (tick > playback.totalTicks) return;
  const pageBars = Math.min(Number(elements.visibleBars.value), patternSettings().bars);
  const page = Math.min(Math.ceil(patternSettings().bars / pageBars) - 1, Math.floor(tick / (pageBars * BAR_TICKS)));
  if (elements.followPlayback.checked && page !== state.viewPage) {
    state.viewPage = page;
    renderPattern();
    return;
  }
  const head = elements.pianoRoll.querySelector(".playhead");
  const progress = (tick - state.view.start) / state.view.visibleTicks;
  if (head) {
    head.hidden = progress < 0 || progress > 1;
    head.style.left = (progress * 100) + "%";
  }
}
function auditionPass(startAt = state.audio.currentTime + .05) {
  const context = state.audio, s = patternSettings(), secondsPerTick = 60 / s.tempo / PPQ;
  const voice = {
    soft: { type: "sine", attack: .04, level: .06, release: .15 },
    pluck: { type: "triangle", attack: .008, level: .075, release: .06 },
    bass: { type: "sawtooth", attack: .012, level: .045, release: .08 },
    pad: { type: "triangle", attack: .12, level: .05, release: .28 },
  }[elements.auditionSound.value];
  state.playback = { startAt, secondsPerTick, totalTicks: totalTicks() };
  performanceNotes(state.pattern, s).forEach((note) => {
    const oscillator = context.createOscillator(), gain = context.createGain();
    oscillator.type = note.chord && elements.auditionSound.value === "soft" ? "triangle" : voice.type;
    oscillator.frequency.value = 440 * Math.pow(2, (note.pitch - 69) / 12);
    const begins = startAt + note.start * secondsPerTick;
    const ends = startAt + Math.min(totalTicks(), note.start + note.duration) * secondsPerTick;
    const attackEnd = Math.min(begins + voice.attack, begins + (ends - begins) * .35);
    const releaseStart = Math.max(attackEnd, ends - voice.release);
    gain.gain.setValueAtTime(.0001, begins);
    gain.gain.exponentialRampToValueAtTime(voice.level * (note.velocity / 100), attackEnd);
    gain.gain.setValueAtTime(voice.level * (note.velocity / 100), releaseStart);
    gain.gain.exponentialRampToValueAtTime(.0001, ends);
    oscillator.connect(gain).connect(context.destination);
    const node = { oscillator, gain };
    state.activeNodes.push(node);
    oscillator.onended = () => {
      gain.disconnect();
      state.activeNodes = state.activeNodes.filter((item) => item !== node);
    };
    oscillator.start(begins); oscillator.stop(ends + .01);
  });
  const endAt = startAt + totalTicks() * secondsPerTick;
  const delay = Math.max(0, (endAt - context.currentTime) * 1000);
  state.auditionTimer = window.setTimeout(() => {
    if (!state.playback) return;
    if (elements.loopAudition.checked && state.pattern.length) auditionPass(endAt);
    else state.auditionTimer = window.setTimeout(stopAudition, 40);
  }, Math.max(0, delay - 30));
  updatePlayhead();
}
async function audition() {
  stopAudition();
  try {
    state.audio ||= new AudioContext();
    await state.audio.resume();
    auditionPass();
    state.playheadTimer = window.setInterval(updatePlayhead, 30);
    elements.stop.disabled = false;
    setStatus("Playing all " + patternSettings().bars + " bars" + (elements.loopAudition.checked ? " on loop." : "."));
  } catch {
    stopAudition();
    setStatus("Playback could not start. Try Play again.");
  }
}

function surprise() {
  elements.root.value = String(randomInt(0, 11));
  elements.scale.value = ["minor", "dorian", "major", "mixolydian", "phrygian", "pentatonic"][randomInt(0, 5)];
  elements.role.value = ["melody", "bass", "chords", "arp"][randomInt(0, 3)];
  elements.bars.value = ["2", "4", "4", "8", "8", "16"][randomInt(0, 5)];
  elements.groove.value = ["straight", "syncopated", "half-time", "driving", "sparse"][randomInt(0, 4)];
  elements.register.value = ["low", "mid", "mid", "high"][randomInt(0, 3)];
  elements.complexity.value = String(randomInt(32, 82)); elements.variation.value = String(randomInt(24, 78));
  elements.tempo.value = String(randomInt(86, 144));
  updateRangeLabels(); generate("Surprise pattern");
}
function applyStyleStarter(name) {
  const starter = STYLE_STARTERS[name];
  if (!starter) return;
  Object.entries(starter).forEach(([key, value]) => { if (elements[key] && key !== "label") elements[key].value = String(value); });
  updateRangeLabels(); generate(starter.label);
}

function pointerPosition(event) {
  const rect = elements.pianoRoll.getBoundingClientRect();
  const x = clamp(event.clientX - rect.left, 0, rect.width);
  const y = clamp(event.clientY - rect.top, 0, rect.height);
  const tick = state.view.start + snap(x / rect.width * state.view.visibleTicks);
  const pitch = state.view.minPitch + Math.min(state.view.pitchSpan - 1, Math.floor((1 - y / rect.height) * state.view.pitchSpan));
  return {
    tick: clamp(tick, state.view.start, Math.min(totalTicks(), state.view.start + state.view.visibleTicks) - SNAP_TICKS),
    pitch: nearestScalePitch(pitch, patternSettings()),
  };
}
function selectNote(id) {
  state.selectedId = id;
  state.velocityHistoryPushed = false;
  elements.pianoRoll.querySelectorAll(".note").forEach((item) => item.classList.toggle("is-selected", Number(item.dataset.noteId) === id));
  updateEditorControls();
  scheduleDraft();
}
function deleteSelectedNote() {
  const note = noteById();
  if (!note) return;
  rememberPattern();
  state.pattern = state.pattern.filter((item) => item.id !== note.id);
  state.selectedId = null;
  refreshAfterEdit("Selected note deleted.");
}
function cancelEdit() {
  if (state.edit?.original && noteById(state.edit.id)) {
    Object.assign(noteById(state.edit.id), state.edit.original);
  }
  state.edit = null;
  renderPattern();
}
function handlePianoPointerDown(event) {
  if (!state.settings || event.button !== 0) return;
  const noteElement = event.target.closest(".note");
  elements.pianoRoll.focus({ preventScroll: true });
  stopAudition();
  if (noteElement) {
    const note = noteById(Number(noteElement.dataset.noteId));
    if (!note) return;
    selectNote(note.id);
    const rect = noteElement.getBoundingClientRect();
    state.edit = {
      type: event.clientX >= rect.right - Math.min(12, rect.width * .35) ? "resize" : "move",
      id: note.id, startX: event.clientX, startY: event.clientY, original: { ...note }, snapshot: snapshotPattern(),
    };
  } else {
    state.edit = { type: "add", startX: event.clientX, startY: event.clientY };
  }
  elements.pianoRoll.setPointerCapture(event.pointerId);
  event.preventDefault();
}
function handlePianoPointerMove(event) {
  const edit = state.edit;
  if (!edit) return;
  if (Math.abs(event.clientX - edit.startX) > 4 || Math.abs(event.clientY - edit.startY) > 4) edit.moved = true;
  if (!edit.moved || edit.type === "add") return;
  const note = noteById(edit.id);
  const rect = elements.pianoRoll.getBoundingClientRect();
  const tickDelta = snap((event.clientX - edit.startX) / rect.width * state.view.visibleTicks);
  if (edit.type === "resize") {
    note.duration = clamp(snap(edit.original.duration + tickDelta), SNAP_TICKS, totalTicks() - note.start);
  } else {
    note.start = clamp(edit.original.start + tickDelta, 0, totalTicks() - note.duration);
    const pitchDelta = Math.round(-(event.clientY - edit.startY) / rect.height * state.view.pitchSpan);
    note.pitch = nearestScalePitch(edit.original.pitch + pitchDelta, patternSettings());
  }
  const item = elements.pianoRoll.querySelector('.note[data-note-id="' + note.id + '"]');
  if (item) positionNote(item, note);
  updateEditorControls();
}
function handlePianoPointerUp(event) {
  const edit = state.edit;
  if (!edit) return;
  if (edit.type !== "add") handlePianoPointerMove(event);
  state.edit = null;
  if (edit.type === "add") {
    if (edit.moved) return;
    const position = pointerPosition(event);
    if (state.pattern.some((note) => note.start === position.tick && note.pitch === position.pitch)) {
      setStatus("A note already starts here at this pitch. Select it to edit it."); return;
    }
    rememberPattern();
    const note = { id: state.nextNoteId++, start: position.tick, duration: Math.min(SNAP_TICKS * 2, totalTicks() - position.tick), pitch: position.pitch, velocity: 92, chord: false };
    state.pattern.push(note); state.selectedId = note.id;
    refreshAfterEdit("Added a scale-safe note.");
    return;
  }
  const note = noteById(edit.id);
  if (state.pattern.some((other) => other.id !== note.id && other.start === note.start && other.pitch === note.pitch)) {
    Object.assign(note, edit.original);
    renderPattern();
    setStatus("That pitch already has a note at this time. The move was cancelled.");
    return;
  }
  if (note.start === edit.original.start && note.pitch === edit.original.pitch && note.duration === edit.original.duration) return;
  state.history.push(edit.snapshot);
  if (state.history.length > 50) state.history.shift();
  state.future = [];
  refreshAfterEdit(edit.type === "resize" ? "Resized selected note." : "Moved selected note.");
}

[elements.complexity, elements.variation, elements.tempo, elements.mutationAmount].forEach((input) => input.addEventListener("input", () => { updateRangeLabels(); scheduleDraft(); }));
elements.tempo.addEventListener("change", () => {
  if (!state.settings || state.settings.tempo === Number(elements.tempo.value)) return;
  rememberPattern();
  state.settings.tempo = Number(elements.tempo.value);
  describePattern();
  updatePatternControls();
});
[elements.root, elements.scale, elements.role, elements.bars, elements.groove, elements.register].forEach((input) => input.addEventListener("change", () => {
  if (state.settings) setStatus("Direction updated for Generate Pattern. Mutation and bar refresh keep your current clip’s musical settings.");
  else renderPattern();
  scheduleDraft();
}));
elements.generate.addEventListener("click", () => generate());
elements.surprise.addEventListener("click", surprise);
elements.mutate.addEventListener("click", mutate);
elements.regenerateBarButton.addEventListener("click", regenerateBar);
elements.download.addEventListener("click", downloadMidi);
elements.audition.addEventListener("click", audition);
elements.stop.addEventListener("click", () => { stopAudition(); setStatus("Playback stopped."); });
elements.undo.addEventListener("click", undo); elements.redo.addEventListener("click", redo);
elements.resetPattern.addEventListener("click", resetPattern);
elements.styleButtons.forEach((button) => button.addEventListener("click", () => applyStyleStarter(button.dataset.style)));
elements.visibleBars.addEventListener("change", () => { state.viewPage = 0; renderPattern(); });
elements.viewPage.addEventListener("change", () => changePage(Number(elements.viewPage.value)));
elements.previousPage.addEventListener("click", () => changePage(state.viewPage - 1));
elements.nextPage.addEventListener("click", () => changePage(state.viewPage + 1));
elements.noteVelocity.addEventListener("input", () => {
  const note = noteById();
  if (!note) return;
  if (!state.velocityHistoryPushed) { rememberPattern(); state.velocityHistoryPushed = true; }
  note.velocity = Number(elements.noteVelocity.value);
  elements.noteVelocityValue.value = String(note.velocity);
  const item = elements.pianoRoll.querySelector('.note[data-note-id="' + note.id + '"]');
  if (item) positionNote(item, note);
});
elements.noteVelocity.addEventListener("change", () => {
  if (noteById()) refreshAfterEdit("Updated note velocity.");
  state.velocityHistoryPushed = false;
});
elements.deleteNote.addEventListener("click", deleteSelectedNote);
elements.pianoRoll.addEventListener("pointerdown", handlePianoPointerDown);
elements.pianoRoll.addEventListener("pointermove", handlePianoPointerMove);
elements.pianoRoll.addEventListener("pointerup", handlePianoPointerUp);
elements.pianoRoll.addEventListener("pointercancel", cancelEdit);
window.addEventListener("keydown", (event) => {
  if (["INPUT", "SELECT", "TEXTAREA"].includes(document.activeElement?.tagName)) return;
  if (event.key === "Escape" && state.edit) { cancelEdit(); return; }
  if (document.activeElement !== elements.pianoRoll) return;
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "z") {
    event.preventDefault(); if (event.shiftKey) redo(); else undo();
  } else if (event.key === "Backspace" || event.key === "Delete") {
    event.preventDefault(); deleteSelectedNote();
  }
});
elements.lockButtons.forEach((button) => button.addEventListener("click", () => {
  const key = button.dataset.lock;
  state.locks[key] = !state.locks[key];
  button.setAttribute("aria-pressed", String(state.locks[key]));
  updatePatternControls();
  setStatus(Object.values(state.locks).every(Boolean)
    ? "All dimensions locked. Unlock one to make a variation."
    : key[0].toUpperCase() + key.slice(1) + (state.locks[key] ? " locked." : " unlocked."));
}));
[elements.auditionSound, elements.loopAudition, elements.followPlayback].forEach((input) => input.addEventListener("change", scheduleDraft));

function scheduleDraft() {
  window.clearTimeout(state.draftTimer);
  state.draftTimer = window.setTimeout(saveDraft, 150);
}
function saveDraft() {
  window.clearTimeout(state.draftTimer);
  if (state.draftUnavailable || state.edit) return;
  if (!state.settings && !state.history.length && !state.future.length) return;
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify({
      version: 1, current: snapshotPattern(), history: state.history, future: state.future,
      controls: currentSettings(), locks: state.locks, mutationAmount: Number(elements.mutationAmount.value),
      view: { visibleBars: Number(elements.visibleBars.value), follow: elements.followPlayback.checked, minPitch: state.view.minPitch, pitchSpan: state.view.pitchSpan },
      audio: { sound: elements.auditionSound.value, loop: elements.loopAudition.checked },
    }));
    elements.draftStatus.textContent = "Current draft saved in this browser.";
  } catch {
    state.draftUnavailable = true;
    elements.draftStatus.textContent = "Draft recovery is unavailable here. Download MIDI to keep your work.";
  }
}
function restoreDraft() {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return;
    const draft = parseDraft(raw);
    if (!draft) {
      elements.draftStatus.textContent = "The saved draft could not be restored. Generate a new pattern to start again.";
      return;
    }
    restoreSnapshot(draft.current);
    state.history = draft.history;
    state.future = draft.future;
    state.locks = draft.locks;
    Object.entries(draft.controls).forEach(([name, value]) => { elements[name].value = String(value); });
    elements.mutationAmount.value = String(draft.mutationAmount);
    elements.visibleBars.value = String(draft.view.visibleBars);
    elements.followPlayback.checked = draft.view.follow;
    Object.assign(state.view, { minPitch: draft.view.minPitch, pitchSpan: draft.view.pitchSpan });
    elements.auditionSound.value = draft.audio.sound;
    elements.loopAudition.checked = draft.audio.loop;
    elements.lockButtons.forEach((button) => button.setAttribute("aria-pressed", String(state.locks[button.dataset.lock])));
    elements.draftStatus.textContent = "Recovered your last draft and undo history.";
    describePattern("Recovered draft");
  } catch {
    state.draftUnavailable = true;
    elements.draftStatus.textContent = "Draft recovery is unavailable here. Download MIDI to keep your work.";
  }
}
window.addEventListener("pagehide", () => {
  if (state.edit) cancelEdit();
  saveDraft();
  stopAudition();
});
document.addEventListener("visibilitychange", () => { if (document.hidden) saveDraft(); });
restoreDraft();
updateRangeLabels();
renderPattern();

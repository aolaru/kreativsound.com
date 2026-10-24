import assert from "node:assert/strict";
import { createPattern, createHarmony, mutatePattern, regeneratePatternBar, performanceNotes, pitchViewport, buildMidi, SCALES, REGISTER_RANGES, BAR_TICKS, PPQ } from "../apps/pattern-mutator/public/engine.js";

import { parseDraft } from "../apps/pattern-mutator/public/draft.js";

const base = { root: 2, scale: "minor", role: "melody", bars: 4, groove: "straight", register: "mid", complexity: 52, variation: 38, tempo: 122 };
let generatedCount = 0;
for (let root = 0; root < 12; root++) for (const scale of Object.keys(SCALES)) {
  for (const register of Object.keys(REGISTER_RANGES)) for (const role of ["melody", "bass", "chords", "arp"]) {
    for (const bars of [1, 2, 4, 8, 16, 32]) {
      const settings = { ...base, root, scale, register, role, bars };
      const notes = createPattern(settings);
      const label = JSON.stringify(settings);
      assert(notes.length > 0, label);
      for (const note of notes) {
        assert(SCALES[scale].includes(((note.pitch - root) % 12 + 12) % 12), "Out-of-scale pitch: " + label);
        assert(note.pitch >= REGISTER_RANGES[register][0] && note.pitch <= REGISTER_RANGES[register][1], label);
        assert(note.start >= 0 && note.start < bars * BAR_TICKS, label);
        assert(note.duration > 0 && note.start + note.duration <= bars * BAR_TICKS, label);
        assert(Number.isInteger(note.velocity) && note.velocity > 0 && note.velocity <= 127, label);
      }
      generatedCount++;
    }
  }
}
console.log("PASS " + generatedCount + " patterns across every key, scale, register, role, and supported length");

const seeded = (seed, task) => {
  const original = Math.random;
  let value = seed;
  Math.random = () => { value = (1664525 * value + 1013904223) >>> 0; return value / 4294967296; };
  try { return task(); } finally { Math.random = original; }
};

function assertNoCollisions(notes) {
  notes.forEach((note, i) => notes.slice(i + 1).forEach((other) => {
    assert(!(note.pitch === other.pitch && note.start < other.start + other.duration && other.start < note.start + note.duration), "Same-pitch notes collided");
  }));
}
for (let seed = 1; seed <= 200; seed++) {
  const role = ["melody", "bass", "chords", "arp"][seed % 4];
  const settings = { ...base, role };
  const harmony = seeded(seed, () => createHarmony(settings));
  const previous = seeded(seed, () => createPattern(settings, harmony)).map((note, index) => ({ ...note, id: index + 1 }));
  const original = structuredClone(previous);
  for (let mask = 0; mask <= 7; mask++) {
    const locks = { rhythm: Boolean(mask & 1), notes: Boolean(mask & 2), expression: Boolean(mask & 4) };
    for (const amount of [0, 10, 38, 100]) {
      const result = seeded(seed + 500, () => mutatePattern(previous, settings, locks, amount, { harmony }));
      assert.equal(result.length, previous.length, "Mutation changed the original note count");
      assert.equal(new Set(result.map((n) => n.id)).size, previous.length);
      result.forEach((note) => {
        const source = previous.find((n) => n.id === note.id);
        if (locks.rhythm) assert.equal(note.start, source.start);
        if (locks.notes) { assert.equal(note.pitch, source.pitch); assert.equal(note.chord, source.chord); }
        if (locks.expression) { assert.equal(note.duration, source.duration); assert.equal(note.velocity, source.velocity); }
        assert(note.start >= 0 && note.start + note.duration <= settings.bars * BAR_TICKS);
        assert(SCALES[settings.scale].includes(((note.pitch - settings.root) % 12 + 12) % 12));
      });
      if (amount === 0 || mask === 7) assert.deepEqual(result, previous);
      assertNoCollisions(result);
      assert.equal(readMidi(buildMidi(result, settings)).filter((e) => e.status === 144).length, result.length, "Export changed the mutated note count");
      const ordered = [...result].sort((a, b) => a.start - b.start || a.pitch - b.pitch || a.id - b.id);
      assert.deepEqual(performanceNotes(result, settings), ordered, "Playback/export normalization changed a mutation");
    }
  }
  assert.deepEqual(previous, original, "Mutation changed the source in place");
}
console.log("PASS Source-based mutation, zero amount, all lock combinations, collision avoidance, and export fidelity across 6,400 seeded cases");

// Independent MIDI reader: validate the exported bytes, not internal events.
function readMidi(bytes) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  assert.equal(new TextDecoder().decode(bytes.slice(0, 4)), "MThd");
  assert.equal(view.getUint16(8), 0);
  assert.equal(view.getUint16(10), 1);
  assert.equal(view.getUint16(12), PPQ);
  assert.equal(new TextDecoder().decode(bytes.slice(14, 18)), "MTrk");
  assert.equal(view.getUint32(18), bytes.length - 22);
  let cursor = 22, tick = 0;
  const events = [];
  const readVar = () => {
    let value = 0, byte;
    do { byte = bytes[cursor++]; value = value * 128 + (byte & 127); } while (byte & 128);
    return value;
  };
  while (cursor < bytes.length) {
    tick += readVar();
    const status = bytes[cursor++];
    if (status === 255) {
      const type = bytes[cursor++], length = readVar();
      events.push({ tick, type, data: [...bytes.slice(cursor, cursor + length)] });
      cursor += length;
    } else {
      assert(status === 128 || status === 144);
      events.push({ tick, status, pitch: bytes[cursor++], velocity: bytes[cursor++] });
    }
  }
  return events;
}
for (const bars of [1, 2, 4, 8, 16, 32]) for (const tempo of [70, 122, 160]) {
  const events = readMidi(buildMidi(createPattern({ ...base, bars }), { bars, tempo }));
  const tempoEvent = events.find((event) => event.type === 81);
  assert.equal(tempoEvent.tick, 0);
  assert.equal(tempoEvent.data[0] * 65536 + tempoEvent.data[1] * 256 + tempoEvent.data[2], Math.round(60000000 / tempo));
  assert.deepEqual(events.find((event) => event.type === 88).data, [4, 2, 24, 8]);
  assert.equal(events.at(-1).type, 47);
  assert.equal(events.at(-1).tick, bars * BAR_TICKS, "MIDI lost the trailing rest or bar boundary");
  const active = new Set();
  for (const event of events) {
    if (event.status === 144) { assert(!active.has(event.pitch), "Overlapping same-pitch MIDI notes"); active.add(event.pitch); }
    if (event.status === 128) { assert(active.has(event.pitch), "Unmatched MIDI note-off"); active.delete(event.pitch); }
  }
  assert.equal(active.size, 0, "Stuck MIDI note");
}
const edgeEvents = readMidi(buildMidi([
  { start: 0, duration: 960, pitch: 60, velocity: 90 },
  { start: 480, duration: 960, pitch: 60, velocity: 80 },
  { start: 1440, duration: 960, pitch: 60, velocity: 100 },
], { bars: 1, tempo: 122 }));
assert.deepEqual(edgeEvents.filter((event) => event.status).map(({ tick, status }) => [tick, status]), [[0, 144], [480, 128], [480, 144], [1440, 128], [1440, 144], [1920, 128]]);
assert.equal(readMidi(buildMidi([], { bars: 32, tempo: 70 })).at(-1).tick, 32 * BAR_TICKS);
console.log("PASS MIDI tempo, 4/4 signature, full clip boundaries, note-off ordering, and overlap handling");

const chords = createPattern({ ...base, role: "chords", groove: "driving", complexity: 100 });
for (let bar = 0; bar < 4; bar++) {
  const groups = new Map();
  for (const note of chords.filter((note) => Math.floor(note.start / BAR_TICKS) === bar)) {
    groups.set(note.start, [...(groups.get(note.start) || []), note.pitch]);
  }
  assert.equal(new Set([...groups.values()].map((pitches) => JSON.stringify(pitches))).size, 1, "Chord root changed within a bar");
}
const melody = createPattern({ ...base, bars: 8, variation: 0 });
const barNotes = (bar) => melody.filter((note) => Math.floor(note.start / BAR_TICKS) === bar)
  .map((note) => ({ start: note.start % BAR_TICKS, pitch: note.pitch }));
assert.deepEqual(barNotes(0), barNotes(4), "Repeated motif was lost");
console.log("PASS Consistent chord voicings and repeated melodic phrases");

for (const role of ["melody", "bass", "chords", "arp"]) {
  const settings = { ...base, role };
  const harmony = seeded(1, () => createHarmony(settings));
  const source = seeded(200, () => createPattern(settings, harmony)).map((note, i) => ({ ...note, id: i + 1 }));
  for (let seed = 1; seed <= 30; seed++) for (let mask = 0; mask <= 7; mask++) {
    const locks = { rhythm: Boolean(mask & 1), notes: Boolean(mask & 2), expression: Boolean(mask & 4) };
    const result = seeded(seed * 1000, () => regeneratePatternBar(source, settings, harmony, 1, locks));
    const outside = (notes) => notes.filter((n) => n.start < BAR_TICKS || n.start >= 2 * BAR_TICKS);
    assert.deepEqual(outside(result), outside(source), "Bar refresh altered another bar");
    const refreshed = result.filter((n) => n.start >= BAR_TICKS && n.start < 2 * BAR_TICKS);
    if (role === "chords" && !mask) {
      assert(refreshed.length > 0);
      assert(refreshed.every((note) => harmony.voicings[1].includes(note.pitch)), "Bar refresh changed its harmonic voicing");
    }
    if (mask) for (const note of refreshed) {
      const original = source.find((n) => n.id === note.id);
      assert(original, "Bar refresh lost a locked note identity");
      if (locks.rhythm) assert.equal(note.start, original.start);
      if (locks.notes) assert.equal(note.pitch, original.pitch);
      if (locks.expression) { assert.equal(note.velocity, original.velocity); assert.equal(note.duration, original.duration); }
    }
    assertNoCollisions(result);
  }
}
console.log("PASS Bar refresh retains harmony, every neighboring bar, and all locks");

for (const register of Object.keys(REGISTER_RANGES)) {
  const settings = { ...base, register };
  const fresh = pitchViewport([], settings);
  const [low, high] = REGISTER_RANGES[register];
  assert(fresh.minPitch >= low && fresh.minPitch + fresh.pitchSpan - 1 <= high);
  const afterDelete = pitchViewport([], settings, fresh);
  assert.deepEqual(afterDelete, fresh, "Deleting all notes reset the pitch viewport");
}
const highEmpty = pitchViewport([], { ...base, register: "high" }, { minPitch: 48, pitchSpan: 12 });
assert(highEmpty.minPitch >= 58 && highEmpty.pitchSpan >= 12);
console.log("PASS Empty editor viewport remains inside the active register");

const harmony = createHarmony(base);
const pattern = createPattern(base, harmony).map((note, i) => ({ ...note, id: i + 1 }));
const snapshot = { pattern, settings: base, harmony, nextNoteId: pattern.length + 1, selectedId: null, viewPage: 0 };
const draft = { version: 1, current: snapshot, history: [{ ...snapshot, pattern: [], settings: null, harmony: null }], future: [],
  controls: base, locks: { rhythm: false, notes: true, expression: false }, mutationAmount: 38,
  view: { visibleBars: 4, follow: true, minPitch: 48, pitchSpan: 12 }, audio: { sound: "pad", loop: true } };
assert.deepEqual(parseDraft(JSON.stringify(draft)), draft, "Draft round trip lost notes, harmony, or history");
for (const invalid of ["{", "null", JSON.stringify({ ...draft, version: 99 }),
  JSON.stringify({ ...draft, current: { ...snapshot, pattern: [{ ...pattern[0], duration: Infinity }] } }),
  JSON.stringify({ ...draft, current: { ...snapshot, nextNoteId: 1 } }),
  JSON.stringify({ ...draft, controls: { ...base, scale: "__proto__" } }),
  JSON.stringify({ ...draft, history: Array(51).fill(snapshot) })]) assert.equal(parseDraft(invalid), null);
console.log("PASS Versioned draft recovery and malformed/corrupt draft rejection");

import assert from "node:assert/strict";
import { createPattern, combineMutation, buildMidi, SCALES, REGISTER_RANGES, BAR_TICKS, PPQ } from "../apps/pattern-mutator/public/engine.js";

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

for (let iteration = 0; iteration < 30; iteration++) {
  const previous = createPattern(base).map((note, id) => ({ ...note, id }));
  const candidate = createPattern({ ...base, role: iteration % 2 ? "chords" : "arp", complexity: iteration % 2 ? 0 : 100 });
  for (let mask = 1; mask <= 7; mask++) {
    const locks = { rhythm: Boolean(mask & 1), notes: Boolean(mask & 2), expression: Boolean(mask & 4) };
    const result = combineMutation(previous, candidate, locks, base.bars * BAR_TICKS);
    assert.equal(result.length, previous.length, "Locked mutation changed note count");
    assert.equal(new Set(result.map((n) => n.id)).size, previous.length);
    result.forEach((note, index) => {
      const source = previous[index];
      if (locks.rhythm) assert.equal(note.start, source.start);
      if (locks.notes) { assert.equal(note.pitch, source.pitch); assert.equal(note.chord, source.chord); }
      if (locks.expression) { assert.equal(note.duration, source.duration); assert.equal(note.velocity, source.velocity); }
      assert(note.start >= 0 && note.start + note.duration <= base.bars * BAR_TICKS);
    });
    if (mask === 7) assert.deepEqual(result, previous);
    assert.deepEqual(combineMutation([], candidate, locks, base.bars * BAR_TICKS), []);
  }
}
console.log("PASS All seven lock combinations preserve their exact original values and identities");

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
assert.deepEqual(edgeEvents.filter((event) => event.status).map(({ tick, status }) => [tick, status]), [[0, 144], [1440, 128], [1440, 144], [1920, 128]]);
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

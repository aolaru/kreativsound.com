export const PPQ = 480;
export const BAR_TICKS = PPQ * 4;
export const STEPS_PER_BAR = 16;
export const SNAP_TICKS = PPQ / 4;
export const ROOTS = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
export const SCALES = {
  minor: [0, 2, 3, 5, 7, 8, 10], dorian: [0, 2, 3, 5, 7, 9, 10],
  major: [0, 2, 4, 5, 7, 9, 11], mixolydian: [0, 2, 4, 5, 7, 9, 10],
  phrygian: [0, 1, 3, 5, 7, 8, 10], pentatonic: [0, 3, 5, 7, 10],
};
export const REGISTER_RANGES = { low: [28, 60], mid: [42, 84], high: [58, 100] };
export function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }
export function randomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function chance(value) { return Math.random() < value; }
export function pitchLabel(pitch) { return `${ROOTS[pitch % 12]}${Math.floor(pitch / 12) - 1}`; }

export function nearestScalePitch(target, { root, scale, register }) {
  const [min, max] = REGISTER_RANGES[register];
  const allowed = SCALES[scale];
  let best = min, distance = Infinity;
  for (let pitch = min; pitch <= max; pitch++) {
    if (!allowed.includes(((pitch - root) % 12 + 12) % 12)) continue;
    if (Math.abs(pitch - target) < distance) { best = pitch; distance = Math.abs(pitch - target); }
  }
  return best;
}

function degreePitch(degree, octave, settings) {
  const intervals = SCALES[settings.scale];
  const index = ((degree % intervals.length) + intervals.length) % intervals.length;
  let pitch = 12 * (octave + Math.floor(degree / intervals.length) + 1) + settings.root + intervals[index];
  const [min, max] = REGISTER_RANGES[settings.register];
  // Move whole octaves at a register boundary to retain the scale and contour.
  while (pitch < min) pitch += 12;
  while (pitch > max) pitch -= 12;
  return nearestScalePitch(pitch, settings);
}

function rhythmMotif({ role, complexity, variation, groove }) {
  const steps = [], density = complexity / 100;
  for (let step = 0; step < STEPS_PER_BAR; step++) {
    let hit = step === 0;
    if (role === "chords") hit ||= density > .6 && step === 8;
    if (role === "bass") hit ||= step % (density > .62 ? 2 : 4) === 0 || (step % 4 === 2 && chance(density * .38));
    if (role === "arp") hit ||= step % (density > .44 ? 2 : 4) === 0 || (density > .8 && step % 2 === 1);
    if (role === "melody") hit ||= (step % 4 === 0 && chance(.78)) || chance(.055 + density * .17);
    if (groove === "driving") hit ||= step % (role === "chords" ? 4 : 2) === 0;
    if (groove === "syncopated" && [3, 6, 10, 14].includes(step)) hit ||= chance(.26 + density * .35);
    if (groove === "half-time" && step % 8 !== 0 && chance(.65)) hit = false;
    if (groove === "sparse" && step !== 0 && chance(.42 + (1 - density) * .32)) hit = false;
    if (hit && step !== 0 && chance(variation * .0015)) hit = false;
    if (hit) steps.push(step);
  }
  return steps.length ? steps : [0];
}

function chordVoicing(degree, octave, settings, previous) {
  const scaleLength = SCALES[settings.scale].length;
  const options = [0, 1, 2].map((inversion) => [0, 2, 4].map((offset, voice) =>
    degreePitch(degree + offset + (voice < inversion ? scaleLength : 0), octave, settings),
  ).sort((a, b) => a - b)).filter((pitches) => new Set(pitches).size === 3);
  options.sort((a, b) => previous
    ? a.reduce((sum, pitch, i) => sum + Math.abs(pitch - previous[i]), 0) - b.reduce((sum, pitch, i) => sum + Math.abs(pitch - previous[i]), 0)
    : a[0] - b[0]);
  return options[0];
}

export function createHarmony(settings) {
  const progression = [[0, 5, 3, 6], [0, 3, 5, 4], [0, 6, 5, 3], [0, 2, 5, 4]][randomInt(0, 3)];
  const roots = Array.from({ length: settings.bars }, (_, bar) => progression[bar % 4] % SCALES[settings.scale].length);
  const octave = 3 + (settings.register === "low" ? -1 : settings.register === "high" ? 1 : 0);
  const voicings = [];
  for (const root of roots) voicings.push(chordVoicing(root, octave, settings, voicings.at(-1)));
  return { roots, voicings };
}

export function createPattern(settings, harmony = createHarmony(settings)) {
  const { role, bars, register, variation, complexity } = settings;
  const totalTicks = bars * BAR_TICKS;
  const baseRhythm = rhythmMotif(settings);
  const melodyMotif = [0];
  for (let i = 1; i < 8; i++) melodyMotif.push(clamp(melodyMotif[i - 1] + randomInt(-1, 1), -2, 4));
  const octave = ({ bass: 2, melody: 3, chords: 3, arp: 3 }[role]) + (register === "low" ? -1 : register === "high" ? 1 : 0);
  const notes = [];
  for (let bar = 0; bar < bars; bar++) {
    const degreeRoot = harmony.roots[bar];
    const rhythm = [...baseRhythm];
    // Keep the motif recognizable; phrase endings introduce controlled changes.
    if (role !== "chords" && bar % 4 === 3 && chance(variation / 100)) {
      const fill = 14;
      if (!rhythm.includes(fill)) rhythm.push(fill);
    }
    rhythm.sort((a, b) => a - b);
    const voicing = role === "chords" ? harmony.voicings[bar] : null;
    rhythm.forEach((step, index) => {
      const start = bar * BAR_TICKS + step * SNAP_TICKS;
      const space = ((rhythm[index + 1] ?? STEPS_PER_BAR) - step) * SNAP_TICKS;
      const velocity = clamp(76 + Math.round(complexity * .13) + (step % 4 === 0 ? 9 : 0) + randomInt(-5, 5), 45, 118);
      let duration = Math.round(Math.min(space * .76, PPQ * (role === "chords" ? 3.8 : role === "bass" ? .95 : role === "arp" ? .46 : 1.3)));
      duration = clamp(duration, 30, totalTicks - start);
      if (voicing) {
        voicing.forEach((pitch, voice) => notes.push({ start, duration, pitch, velocity: velocity - voice * 5, chord: true }));
        return;
      }
      const accent = step % 4 === 0;
      let degree = degreeRoot;
      if (role === "bass") degree += accent ? 0 : [0, 4, 2, 0][index % 4];
      if (role === "arp") degree += [0, 2, 4, 2, 0, 4][index % 6];
      if (role === "melody") degree += melodyMotif[index % melodyMotif.length];
      if (!accent && bar % 4 >= 2 && chance(variation / 200)) degree += randomInt(-1, 1);
      if (role === "melody" && bar === bars - 1 && index === rhythm.length - 1) degree = 0;
      notes.push({ start, duration, pitch: degreePitch(degree, octave, settings), velocity, chord: false });
    });
  }
  return notes.sort((a, b) => a.start - b.start || a.pitch - b.pitch);
}

// One canonical performance is used by the editor, browser audio, and MIDI.
// Retrigger repeated pitches instead of silently merging their attacks.
export function performanceNotes(pattern, { bars }) {
  const totalTicks = bars * BAR_TICKS;
  const pitches = new Map();
  for (const source of pattern) {
    const start = clamp(Math.round(source.start), 0, totalTicks - 1);
    const note = { ...source, start, duration: clamp(Math.round(source.duration), 1, totalTicks - start) };
    const group = pitches.get(note.pitch) || [];
    group.push(note);
    pitches.set(note.pitch, group);
  }
  const result = [];
  for (const group of pitches.values()) {
    group.sort((a, b) => a.start - b.start);
    const unique = [];
    for (const note of group) {
      const previous = unique.at(-1);
      if (previous?.start === note.start) {
        previous.duration = Math.max(previous.duration, note.duration);
        previous.velocity = Math.max(previous.velocity, note.velocity);
      } else unique.push(note);
    }
    unique.forEach((note, index) => {
      if (unique[index + 1]) note.duration = Math.min(note.duration, unique[index + 1].start - note.start);
      result.push(note);
    });
  }
  return result.sort((a, b) => a.start - b.start || a.pitch - b.pitch || (a.id || 0) - (b.id || 0));
}

function overlaps(a, b) {
  return a.pitch === b.pitch && a.start < b.start + b.duration && b.start < a.start + a.duration;
}

export function mutatePattern(previous, settings, locks, amount, { obstacles = [], barIndex = null, harmony = null } = {}) {
  const result = previous.map((note) => ({ ...note }));
  const strength = clamp(amount, 0, 100) / 100;
  if (!strength || Object.values(locks).every(Boolean)) return result;
  const totalTicks = settings.bars * BAR_TICKS;
  const allStarts = [...new Set(previous.map((note) => note.start))].sort((a, b) => a - b);
  const fits = (note, ignored) => ![...result.filter((item) => !ignored.includes(item)), ...obstacles].some((other) => overlaps(note, other));

  // Move onset groups together, retaining their order and avoiding timing collapse.
  if (!locks.rhythm) allStarts.forEach((start, index) => {
    if (!chance(strength)) return;
    const group = result.filter((note) => note.start === start);
    const bar = barIndex ?? Math.floor(start / BAR_TICKS);
    const lower = Math.max(bar * BAR_TICKS, (allStarts[index - 1] ?? -1) + 1);
    const upper = Math.min((bar + 1) * BAR_TICKS - 1, (allStarts[index + 1] ?? totalTicks) - 1, ...group.map((note) => totalTicks - note.duration));
    const delta = randomInt(1, Math.max(1, Math.round(strength * 4))) * SNAP_TICKS * (chance(.5) ? -1 : 1);
    const next = start + delta;
    if (next < lower || next > upper) return;
    const proposed = group.map((note) => ({ ...note, start: next }));
    if (proposed.every((note) => fits(note, group))) group.forEach((note) => { note.start = next; });
  });

  for (const note of result) {
    if (!locks.notes && chance(strength)) {
      const [min, max] = REGISTER_RANGES[settings.register];
      let allowed = Array.from({ length: max - min + 1 }, (_, i) => min + i)
        .filter((pitch) => SCALES[settings.scale].includes(((pitch - settings.root) % 12 + 12) % 12));
      if (note.chord && harmony) {
        const voicing = harmony.voicings[Math.floor(note.start / BAR_TICKS)];
        allowed = allowed.filter((pitch) => voicing.some((tone) => tone % 12 === pitch % 12));
      }
      const closest = allowed.reduce((best, pitch, i) => Math.abs(pitch - note.pitch) < Math.abs(allowed[best] - note.pitch) ? i : best, 0);
      const distance = randomInt(1, Math.max(1, Math.round(strength * 2)));
      const pitch = allowed[clamp(closest + distance * (chance(.5) ? -1 : 1), 0, allowed.length - 1)];
      const proposal = { ...note, pitch };
      if (fits(proposal, [note])) note.pitch = pitch;
    }
    if (!locks.expression && chance(strength)) {
      const velocityChange = randomInt(1, Math.max(1, Math.round(strength * 20))) * (chance(.5) ? -1 : 1);
      note.velocity = clamp(note.velocity + velocityChange, 1, 127);
      const duration = clamp(Math.round(note.duration * (1 + (chance(.5) ? -1 : 1) * strength * .3)), 1, totalTicks - note.start);
      if (fits({ ...note, duration }, [note])) note.duration = duration;
    }
  }
  return result;
}

export function regeneratePatternBar(pattern, settings, harmony, barIndex, locks) {
  const start = barIndex * BAR_TICKS, end = start + BAR_TICKS;
  const original = pattern.filter((note) => note.start >= start && note.start < end);
  const outside = pattern.filter((note) => note.start < start || note.start >= end);
  if (Object.values(locks).every(Boolean)) return pattern.map((note) => ({ ...note }));
  const replacement = Object.values(locks).some(Boolean)
    ? mutatePattern(original, settings, locks, 100, { obstacles: outside, barIndex, harmony })
    : createPattern(settings, harmony).filter((note) => note.start >= start && note.start < end)
      .filter((note) => !outside.some((other) => overlaps(note, other)));
  return [...outside, ...replacement].sort((a, b) => a.start - b.start || a.pitch - b.pitch);
}

export function pitchViewport(pattern, settings, previous = null) {
  const [low, high] = REGISTER_RANGES[settings.register];
  if (!pattern.length && previous && previous.minPitch >= low && previous.minPitch + previous.pitchSpan - 1 <= high) {
    return { minPitch: previous.minPitch, pitchSpan: previous.pitchSpan };
  }
  const min = pattern.length ? Math.max(low, Math.min(...pattern.map((note) => note.pitch)) - 2) : low;
  const max = pattern.length ? Math.min(high, Math.max(...pattern.map((note) => note.pitch)) + 2) : low + 11;
  const pitchSpan = Math.min(high - low + 1, Math.max(12, max - min + 1));
  return { minPitch: Math.min(min, high - pitchSpan + 1), pitchSpan };
}

function variableLength(value) {
  const bytes = [value & 0x7f];
  while ((value = Math.floor(value / 128))) bytes.unshift((value & 0x7f) | 0x80);
  return bytes;
}

export function buildMidi(pattern, { bars, tempo }) {
  const totalTicks = bars * BAR_TICKS;
  const microseconds = Math.round(60000000 / tempo);
  const events = [
    { time: 0, order: 0, data: [0xff, 0x51, 3, microseconds >>> 16, (microseconds >>> 8) & 0xff, microseconds & 0xff] },
    { time: 0, order: 0, data: [0xff, 0x58, 4, 4, 2, 24, 8] },
  ];
  for (const note of performanceNotes(pattern, { bars })) {
    events.push({ time: note.start, order: 2, data: [0x90, note.pitch, note.velocity] });
    events.push({ time: note.start + note.duration, order: 1, data: [0x80, note.pitch, 0] });
  }
  events.sort((a, b) => a.time - b.time || a.order - b.order);
  const track = [];
  let lastTime = 0;
  for (const event of events) {
    track.push(...variableLength(event.time - lastTime), ...event.data);
    lastTime = event.time;
  }
  track.push(...variableLength(totalTicks - lastTime), 0xff, 0x2f, 0);
  const length = track.length;
  return new Uint8Array([0x4d, 0x54, 0x68, 0x64, 0, 0, 0, 6, 0, 0, 0, 1, PPQ >> 8, PPQ & 0xff,
    0x4d, 0x54, 0x72, 0x6b, length >>> 24, (length >>> 16) & 0xff, (length >>> 8) & 0xff, length & 0xff, ...track]);
}

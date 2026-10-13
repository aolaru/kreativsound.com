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

export function createPattern(settings) {
  const { role, bars, register, variation, complexity } = settings;
  const totalTicks = bars * BAR_TICKS;
  const scaleLength = SCALES[settings.scale].length;
  const progression = [[0, 5, 3, 6], [0, 3, 5, 4], [0, 6, 5, 3], [0, 2, 5, 4]][randomInt(0, 3)];
  const baseRhythm = rhythmMotif(settings);
  const melodyMotif = [0];
  for (let i = 1; i < 8; i++) melodyMotif.push(clamp(melodyMotif[i - 1] + randomInt(-1, 1), -2, 4));
  const octave = ({ bass: 2, melody: 3, chords: 3, arp: 3 }[role]) + (register === "low" ? -1 : register === "high" ? 1 : 0);
  const notes = [];
  let previousVoicing = null;
  for (let bar = 0; bar < bars; bar++) {
    const degreeRoot = progression[bar % 4] % scaleLength;
    const rhythm = [...baseRhythm];
    // Keep the motif recognizable; phrase endings introduce controlled changes.
    if (role !== "chords" && bar % 4 === 3 && chance(variation / 100)) {
      const fill = 14;
      if (!rhythm.includes(fill)) rhythm.push(fill);
    }
    rhythm.sort((a, b) => a - b);
    const voicing = role === "chords" ? chordVoicing(degreeRoot, octave, settings, previousVoicing) : null;
    if (voicing) previousVoicing = voicing;
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

export function combineMutation(previous, candidate, locks, totalTicks) {
  if (!Object.values(locks).some(Boolean)) return candidate;
  if (!previous.length) return [];
  if (Object.values(locks).every(Boolean)) return previous.map((note) => ({ ...note }));
  // A locked dimension owns one value per original note; never cycle or drop it.
  const sourceStarts = [...new Set(previous.map((note) => note.start))];
  const candidateStarts = [...new Set(candidate.map((note) => note.start))];
  return previous.map((source, index) => {
    const note = candidate[Math.floor(index * candidate.length / previous.length)] || source;
    const duration = locks.expression ? source.duration : note.duration;
    // A locked chord's voices move together when its rhythm is unlocked.
    const mappedStart = locks.notes && candidateStarts.length
      ? candidateStarts[Math.floor(sourceStarts.indexOf(source.start) * candidateStarts.length / sourceStarts.length)]
      : note.start;
    const start = locks.rhythm ? source.start : Math.min(mappedStart, totalTicks - duration);
    return {
      ...source,
      start,
      duration: locks.expression ? duration : Math.min(duration, totalTicks - start),
      pitch: locks.notes ? source.pitch : note.pitch,
      velocity: locks.expression ? source.velocity : note.velocity,
      chord: locks.notes ? source.chord : note.chord,
    };
  });
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
  // Merge overlapping instances of the same pitch, avoiding premature note-offs.
  const byPitch = new Map();
  for (const note of pattern) {
    const start = clamp(Math.round(note.start), 0, totalTicks - 1);
    const end = clamp(Math.round(note.start + note.duration), start + 1, totalTicks);
    const ranges = byPitch.get(note.pitch) || [];
    ranges.push({ start, end, velocity: note.velocity });
    byPitch.set(note.pitch, ranges);
  }
  for (const [pitch, ranges] of byPitch) {
    ranges.sort((a, b) => a.start - b.start);
    const merged = [];
    for (const range of ranges) {
      const last = merged.at(-1);
      if (last && range.start < last.end) last.end = Math.max(last.end, range.end);
      else merged.push({ ...range });
    }
    for (const { start, end, velocity } of merged) {
      events.push({ time: start, order: 2, data: [0x90, pitch, velocity] });
      events.push({ time: end, order: 1, data: [0x80, pitch, 0] });
    }
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

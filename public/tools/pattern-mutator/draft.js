import { BAR_TICKS, SCALES, REGISTER_RANGES, performanceNotes } from "./engine.js?v=0.5.0";

export const DRAFT_KEY = "pattern-mutator-free-draft-v1";
const bounded = (value, low, high) => Number.isInteger(value) && value >= low && value <= high;

function validSettings(s) {
  const keys = ["root", "scale", "register", "bars", "role", "groove", "complexity", "variation", "tempo"];
  return s && Object.keys(s).length === keys.length && Object.keys(s).every((key) => keys.includes(key))
    && bounded(s.root, 0, 11) && Object.hasOwn(SCALES, s.scale) && Object.hasOwn(REGISTER_RANGES, s.register)
    && [1, 2, 4, 8, 16, 32].includes(s.bars) && ["melody", "bass", "chords", "arp"].includes(s.role)
    && ["straight", "syncopated", "half-time", "driving", "sparse"].includes(s.groove)
    && bounded(s.complexity, 0, 100) && bounded(s.variation, 0, 100) && bounded(s.tempo, 70, 160);
}

function validSnapshot(s) {
  if (!s || !Array.isArray(s.pattern) || s.pattern.length > 4096 || !bounded(s.nextNoteId, 1, Number.MAX_SAFE_INTEGER)
    || !bounded(s.viewPage, 0, 31) || !(s.selectedId === null || bounded(s.selectedId, 1, s.nextNoteId - 1))) return false;
  if (s.settings === null) return s.pattern.length === 0 && s.harmony === null;
  if (!validSettings(s.settings)) return false;
  const [low, high] = REGISTER_RANGES[s.settings.register];
  if (!s.pattern.every((n) => bounded(n.id, 1, s.nextNoteId - 1) && bounded(n.pitch, low, high)
    && SCALES[s.settings.scale].includes(((n.pitch - s.settings.root) % 12 + 12) % 12)
    && bounded(n.start, 0, s.settings.bars * BAR_TICKS - 1) && bounded(n.duration, 1, s.settings.bars * BAR_TICKS - n.start)
    && bounded(n.velocity, 1, 127) && typeof n.chord === "boolean")) return false;
  if (new Set(s.pattern.map((n) => n.id)).size !== s.pattern.length) return false;
  if (JSON.stringify(performanceNotes(s.pattern, s.settings)) !== JSON.stringify(s.pattern)) return false;
  const h = s.harmony;
  return h && Array.isArray(h.roots) && h.roots.length === s.settings.bars
    && h.roots.every((root) => bounded(root, 0, SCALES[s.settings.scale].length - 1))
    && Array.isArray(h.voicings) && h.voicings.length === s.settings.bars
    && h.voicings.every((voices) => Array.isArray(voices) && voices.length === 3
      && voices.every((pitch) => bounded(pitch, low, high) && SCALES[s.settings.scale].includes(((pitch - s.settings.root) % 12 + 12) % 12)));
}

export function parseDraft(raw) {
  try {
    const draft = JSON.parse(raw);
    if (!draft || draft.version !== 1 || !validSnapshot(draft.current) || !validSettings(draft.controls)) return null;
    if (![draft.history, draft.future].every((stack) => Array.isArray(stack) && stack.length <= 50 && stack.every(validSnapshot))) return null;
    if (!draft.locks || !["rhythm", "notes", "expression"].every((key) => typeof draft.locks[key] === "boolean")) return null;
    if (!draft.view || ![1, 2, 4].includes(draft.view.visibleBars) || typeof draft.view.follow !== "boolean"
      || !bounded(draft.view.minPitch, 0, 127) || !bounded(draft.view.pitchSpan, 1, 128 - draft.view.minPitch)) return null;
    if (!draft.audio || !["soft", "pluck", "bass", "pad"].includes(draft.audio.sound) || typeof draft.audio.loop !== "boolean") return null;
    if (!bounded(draft.mutationAmount, 0, 100)) return null;
    return draft;
  } catch {
    return null;
  }
}

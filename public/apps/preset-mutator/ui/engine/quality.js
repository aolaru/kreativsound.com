import { clamp } from "./common.js";

function scoreLabel(score) {
  if (score >= 90) {
    return "Strong";
  }
  if (score >= 80) {
    return "Balanced";
  }
  return "Usable";
}

function finishReport(score, notes) {
  const roundedScore = Math.round(clamp(score, 60, 98));
  const uniqueNotes = [...new Set(notes.filter(Boolean))].slice(0, 2);
  return {
    score: roundedScore,
    label: scoreLabel(roundedScore),
    notes: uniqueNotes.length ? uniqueNotes : ["Keeps core Vital parameters inside a playable range"],
  };
}

function roleKey(value = "") {
  return String(value).toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

export function scoreGeneratedPreset(preset, roleOverride = "") {
  const map = preset?.parameterMap || {};
  const role = roleKey(roleOverride || preset?.roleLabel);
  const family = preset?.familyKey || "pad";
  const notes = [];
  let score = 78;

  if (map.filter_1_cutoff >= 18 && map.filter_1_cutoff <= 92) {
    score += 5;
    notes.push("Filter range stays playable");
  } else {
    score -= 8;
  }

  if (map.env_1_attack >= 0.001 && map.env_1_attack <= 0.86 && map.env_1_release >= 0.03 && map.env_1_release <= 0.94) {
    score += 5;
    notes.push("Envelope timing avoids extreme starts or tails");
  } else {
    score -= 7;
  }

  if ((map.distortion_mix ?? 0) <= 0.72 && (map.noise_level ?? 0) <= 0.38) {
    score += 4;
  } else {
    score -= 5;
    notes.push("Grit is intentionally pushed harder");
  }

  if (role.includes("closest")) {
    score += 7;
    notes.push("Closest variant keeps the source profile stable");
  } else if (role.includes("darker") && map.filter_1_cutoff <= 58) {
    score += 7;
    notes.push("Darker variant lowers the filter focus");
  } else if (role.includes("brighter") && map.filter_1_cutoff >= 44) {
    score += 7;
    notes.push("Brighter variant opens the filter focus");
  } else if (role.includes("motion") && ((map.chorus_feedback ?? 0) >= 0.22 || (map.delay_feedback ?? 0) >= 0.28)) {
    score += 7;
    notes.push("Motion variant increases modulation cues");
  } else if (role.includes("wider") && (map.osc_1_stereo_spread ?? 0) >= 0.48) {
    score += 6;
    notes.push("Wider variant spreads the stereo image");
  }

  if (family === "bass") {
    if ((map.osc_1_stereo_spread ?? 0) <= 0.42 && (map.reverb_dry_wet ?? 0) <= 0.4) {
      score += 6;
      notes.push("Low-end stays focused");
    } else {
      score -= 5;
    }
  } else if (family === "pluck") {
    if ((map.env_1_attack ?? 1) <= 0.36 && (map.env_1_release ?? 1) <= 0.62) {
      score += 6;
      notes.push("Pluck timing stays tight");
    } else {
      score -= 4;
    }
  } else if (family === "texture") {
    if ((map.noise_level ?? 0) >= 0.05 || (map.reverb_dry_wet ?? 0) >= 0.24) {
      score += 6;
      notes.push("Texture keeps atmospheric detail");
    }
  } else if ((map.env_1_release ?? 0) >= 0.2 && (map.reverb_dry_wet ?? 0) >= 0.16) {
    score += 6;
    notes.push("Pad shape keeps enough bloom");
  }

  return finishReport(score, notes);
}

function zoneForParameter(key) {
  if (/cutoff|resonance|keytrack|transpose|tune|sustain|level/.test(key)) {
    return "tone";
  }
  if (/wave_frame|frame_spread|spectral_morph|feedback|mod_depth|decay|release/.test(key)) {
    return "motion";
  }
  if (/attack/.test(key)) {
    return "attack";
  }
  if (/drive|distortion/.test(key)) {
    return "dirt";
  }
  if (/pan|stereo|spread|unison|mix|dry_wet|size/.test(key)) {
    return "space";
  }
  return "general";
}

export function scoreMutationVariant(variant) {
  const changed = variant?.changedParameters || [];
  const zones = new Set(changed.map(zoneForParameter));
  const role = roleKey(variant?.groupKey || variant?.role?.key || variant?.role?.label);
  const notes = [];
  let score = 76;

  if (changed.length >= 6 && changed.length <= 18) {
    score += 8;
    notes.push("Change count stays controlled");
  } else if (changed.length > 18 && changed.length <= 24) {
    score += 4;
    notes.push("Broader mutation for stronger contrast");
  } else {
    score -= 6;
  }

  if (zones.size >= 3) {
    score += 6;
    notes.push("Changes touch multiple synth zones");
  } else if (zones.size === 2) {
    score += 3;
  } else {
    score -= 4;
  }

  if (role.includes("closest") && changed.length <= 14) {
    score += 7;
    notes.push("Closest variant limits drift from the source");
  } else if ((role.includes("darker") || role.includes("brighter")) && zones.has("tone")) {
    score += 7;
    notes.push("Tone direction is reflected in changed parameters");
  } else if ((role.includes("motion") || role.includes("steadier")) && zones.has("motion")) {
    score += 7;
    notes.push("Motion direction is reflected in changed parameters");
  } else if ((role.includes("wider") || role.includes("tighter")) && zones.has("space")) {
    score += 7;
    notes.push("Space direction is reflected in changed parameters");
  } else if ((role.includes("dirtier") || role.includes("cleaner")) && zones.has("dirt")) {
    score += 7;
    notes.push("Grit direction is reflected in changed parameters");
  }

  return finishReport(score, notes);
}

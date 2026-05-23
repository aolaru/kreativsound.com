import { clamp, cloneJson, createRng, hashString, slugifyFilename } from "./common.js";

export const FREE_VARIANT_ROLES = [
  { key: "closest", label: "Closest", multiplier: 0.7, nameSuffix: "Closest" },
  { key: "darker", label: "Darker", multiplier: 1, nameSuffix: "Darker", toneBias: -0.75, motionBias: -0.08, dirtBias: 0.12, spaceBias: -0.08 },
  { key: "more-motion", label: "More Motion", multiplier: 1.18, nameSuffix: "More Motion", toneBias: 0.02, motionBias: 0.86, dirtBias: 0.05, spaceBias: 0.16 },
];

function createPackRole(group, index, config = {}) {
  return {
    key: `${group.key}-${index + 1}`,
    label: `${group.label} ${index + 1}`,
    nameSuffix: `${group.label} ${index + 1}`,
    multiplier: config.multiplier ?? 1,
    toneBias: config.toneBias ?? group.toneBias ?? 0,
    motionBias: config.motionBias ?? group.motionBias ?? 0,
    dirtBias: config.dirtBias ?? group.dirtBias ?? 0,
    spaceBias: config.spaceBias ?? group.spaceBias ?? 0,
    groupKey: group.key,
    groupLabel: group.label,
    groupDescription: group.description,
  };
}

export const PACK_GROUPS = [
  { key: "closest", label: "Closest", description: "Tighter mutations that stay nearest to the source preset.", toneBias: 0, motionBias: 0, dirtBias: 0, spaceBias: 0 },
  { key: "darker", label: "Darker", description: "Lower, moodier filter and voicing shifts with darker weight.", toneBias: -0.8, motionBias: -0.1, dirtBias: 0.1, spaceBias: -0.1 },
  { key: "brighter", label: "Brighter", description: "Lifted tone, more upper harmonics, and more open cutoff moves.", toneBias: 0.8, motionBias: 0.1, dirtBias: -0.1, spaceBias: 0.05 },
  { key: "more-motion", label: "More Motion", description: "Heavier movement and evolving modulation for more animation.", toneBias: 0, motionBias: 0.85, dirtBias: 0.05, spaceBias: 0.15 },
  { key: "steadier", label: "Steadier", description: "Calmer timing and more restrained modulation movement.", toneBias: -0.05, motionBias: -0.8, dirtBias: -0.05, spaceBias: -0.05 },
  { key: "cleaner", label: "Cleaner", description: "Smoother, tidier variants with less drive and roughness.", toneBias: 0.1, motionBias: -0.05, dirtBias: -0.85, spaceBias: 0.05 },
  { key: "dirtier", label: "Dirtier", description: "More edge, drive, and grit pushed into the mutation spread.", toneBias: -0.05, motionBias: 0.05, dirtBias: 0.9, spaceBias: 0.05 },
  { key: "wider", label: "Wider", description: "Broader stereo and space-biased variants for a larger spread.", toneBias: 0.1, motionBias: 0.2, dirtBias: 0, spaceBias: 0.9 },
];

export const PRO_PACK_ROLES = [
  createPackRole(PACK_GROUPS[0], 0, { multiplier: 0.8 }),
  createPackRole(PACK_GROUPS[0], 1, { multiplier: 0.92, motionBias: -0.05 }),
  createPackRole(PACK_GROUPS[0], 2, { multiplier: 1.02, toneBias: 0.08 }),
  createPackRole(PACK_GROUPS[0], 3, { multiplier: 1.08, dirtBias: 0.06 }),
  createPackRole(PACK_GROUPS[1], 0, { multiplier: 0.95 }),
  createPackRole(PACK_GROUPS[1], 1, { multiplier: 1.04, motionBias: -0.18 }),
  createPackRole(PACK_GROUPS[1], 2, { multiplier: 1.08, dirtBias: 0.18 }),
  createPackRole(PACK_GROUPS[1], 3, { multiplier: 1.12, spaceBias: -0.16 }),
  createPackRole(PACK_GROUPS[2], 0, { multiplier: 0.95 }),
  createPackRole(PACK_GROUPS[2], 1, { multiplier: 1.04, motionBias: 0.18 }),
  createPackRole(PACK_GROUPS[2], 2, { multiplier: 1.08, dirtBias: -0.15 }),
  createPackRole(PACK_GROUPS[2], 3, { multiplier: 1.12, spaceBias: 0.16 }),
  createPackRole(PACK_GROUPS[3], 0, { multiplier: 1.02 }),
  createPackRole(PACK_GROUPS[3], 1, { multiplier: 1.08, toneBias: 0.1 }),
  createPackRole(PACK_GROUPS[3], 2, { multiplier: 1.14, dirtBias: 0.1 }),
  createPackRole(PACK_GROUPS[3], 3, { multiplier: 1.22, spaceBias: 0.22 }),
  createPackRole(PACK_GROUPS[4], 0, { multiplier: 0.9 }),
  createPackRole(PACK_GROUPS[4], 1, { multiplier: 0.98, toneBias: -0.12 }),
  createPackRole(PACK_GROUPS[4], 2, { multiplier: 1.02, dirtBias: -0.08 }),
  createPackRole(PACK_GROUPS[4], 3, { multiplier: 1.08, spaceBias: -0.14 }),
  createPackRole(PACK_GROUPS[5], 0, { multiplier: 0.94 }),
  createPackRole(PACK_GROUPS[5], 1, { multiplier: 1, toneBias: 0.12 }),
  createPackRole(PACK_GROUPS[5], 2, { multiplier: 1.05, motionBias: -0.16 }),
  createPackRole(PACK_GROUPS[5], 3, { multiplier: 1.1, spaceBias: 0.14 }),
  createPackRole(PACK_GROUPS[6], 0, { multiplier: 1 }),
  createPackRole(PACK_GROUPS[6], 1, { multiplier: 1.08, toneBias: -0.1 }),
  createPackRole(PACK_GROUPS[6], 2, { multiplier: 1.14, motionBias: 0.16 }),
  createPackRole(PACK_GROUPS[6], 3, { multiplier: 1.24, spaceBias: 0.12 }),
  createPackRole(PACK_GROUPS[7], 0, { multiplier: 1 }),
  createPackRole(PACK_GROUPS[7], 1, { multiplier: 1.08, toneBias: 0.12 }),
  createPackRole(PACK_GROUPS[7], 2, { multiplier: 1.14, motionBias: 0.18 }),
  createPackRole(PACK_GROUPS[7], 3, { multiplier: 1.22, dirtBias: 0.08 }),
];

export const PRESET_MUTATE_PRO_PACK_COUNT = PRO_PACK_ROLES.length;

export const SAFE_PARAMETER_BOUNDS = {
  level: { low: 0, high: 1, integral: false, zone: "tone" },
  pan: { low: -1, high: 1, integral: false, zone: "space" },
  transpose: { low: -24, high: 24, integral: true, zone: "tone" },
  tune: { low: -1, high: 1, integral: false, zone: "tone" },
  frame_spread: { low: 0, high: 1, integral: false, zone: "motion" },
  stereo_spread: { low: 0, high: 1, integral: false, zone: "space" },
  unison_blend: { low: 0, high: 1, integral: false, zone: "space" },
  unison_detune: { low: 0, high: 1, integral: false, zone: "space" },
  wave_frame: { low: 0, high: 1, integral: false, zone: "motion" },
  spectral_morph_amount: { low: 0, high: 1, integral: false, zone: "motion" },
  distortion_amount: { low: 0, high: 1, integral: false, zone: "dirt" },
  cutoff: { low: 0, high: 100, integral: false, zone: "tone" },
  resonance: { low: 0, high: 1, integral: false, zone: "tone" },
  drive: { low: 0, high: 4, integral: false, zone: "dirt" },
  keytrack: { low: 0, high: 1, integral: false, zone: "tone" },
  mix: { low: 0, high: 1, integral: false, zone: "space" },
  attack: { low: 0, high: 1, integral: false, zone: "attack" },
  decay: { low: 0, high: 1, integral: false, zone: "motion" },
  sustain: { low: 0, high: 1, integral: false, zone: "tone" },
  release: { low: 0, high: 1, integral: false, zone: "motion" },
  dry_wet: { low: 0, high: 1, integral: false, zone: "space" },
  feedback: { low: 0, high: 0.95, integral: false, zone: "motion" },
  mod_depth: { low: 0, high: 1, integral: false, zone: "motion" },
  spread: { low: 0, high: 1, integral: false, zone: "space" },
  decay_time: { low: 0, high: 1, integral: false, zone: "space" },
  size: { low: 0, high: 1, integral: false, zone: "space" },
  pre_high_cutoff: { low: 0, high: 100, integral: false, zone: "tone" },
  pre_low_cutoff: { low: 0, high: 100, integral: false, zone: "tone" },
  filter_cutoff: { low: 0, high: 100, integral: false, zone: "tone" },
};

const SAFE_PARAMETER_PREFIXES = [
  "osc_1_",
  "osc_2_",
  "filter_1_",
  "filter_2_",
  "env_1_",
  "env_2_",
  "chorus_",
  "delay_",
  "reverb_",
];

export function safeScalarParameterKeys(settings) {
  return Object.keys(settings || {})
    .filter((key) => {
      const value = settings[key];
      if (typeof value !== "number" || !Number.isFinite(value)) {
        return false;
      }
      if (!SAFE_PARAMETER_PREFIXES.some((prefix) => key.startsWith(prefix))) {
        return false;
      }
      if (/_on$|_style$|_model$|_destination$|_filter_input$|_midi_track$|_sync$|_tempo$|_voices$/.test(key)) {
        return false;
      }
      if (/_attack_power$|_decay_power$|_release_power$|_delay$|_hold$/.test(key)) {
        return false;
      }
      if (key.includes("formant_") || key.endsWith("blend_transpose")) {
        return false;
      }
      return Boolean(parameterConfigForKey(key));
    })
    .sort();
}

export function parameterConfigForKey(key) {
  for (const [suffix, config] of Object.entries(SAFE_PARAMETER_BOUNDS)) {
    if (key.endsWith(suffix)) {
      return config;
    }
  }
  return null;
}

export function presetSummary(data) {
  const settings = data.settings || {};
  const sample = settings.sample;
  const wavetables = settings.wavetables;
  const modulations = settings.modulations;
  const scalarKeys = safeScalarParameterKeys(settings);

  return {
    name: data.preset_name || data.preset_style || "Untitled Preset",
    author: data.author || "Unknown author",
    sampleName: sample && typeof sample === "object" ? sample.name || "None" : "None",
    wavetableCount: Array.isArray(wavetables) ? wavetables.length : 0,
    modulationCount: Array.isArray(modulations)
      ? modulations.filter((item) => typeof item === "object" && item && Object.values(item).some((value) => ![0, 0, "", false, null].includes(value))).length
      : 0,
    scalarKeys,
    macroCount: ["macro1", "macro2", "macro3", "macro4"].filter((key) => data[key]).length,
  };
}

export function buildPresetMutateStrategy(input = {}) {
  return {
    tone: Number(input.tone ?? input.brightness ?? 0) / 100,
    motion: Number(input.motion ?? 0) / 100,
    attack: Number(input.attack ?? 0) / 100,
    space: Number(input.space ?? input.width ?? 0) / 100,
    dirt: Number(input.dirt ?? 0) / 100,
    amount: Number(input.amount ?? 50) / 100,
  };
}

function mutateValue(key, value, config, rng, strategy, intensity, role) {
  const span = config.high - config.low;
  const baseScale = span * strategy.amount * 0.17 * intensity;
  const randomOffset = (rng() * 2 - 1) * baseScale;

  let directedOffset = 0;
  if (config.zone === "tone") {
    directedOffset = span * strategy.tone * 0.12 * intensity;
  } else if (config.zone === "motion") {
    directedOffset = span * strategy.motion * 0.12 * intensity;
  } else if (config.zone === "attack") {
    directedOffset = span * strategy.attack * -0.12 * intensity;
  } else if (config.zone === "dirt") {
    directedOffset = span * strategy.dirt * 0.14 * intensity;
  } else if (config.zone === "space") {
    directedOffset = span * strategy.space * 0.1 * intensity;
  }

  let roleOffset = 0;
  if (role) {
    if (config.zone === "tone") {
      roleOffset = span * (role.toneBias ?? 0) * 0.08 * intensity;
    } else if (config.zone === "motion") {
      roleOffset = span * (role.motionBias ?? 0) * 0.08 * intensity;
    } else if (config.zone === "dirt") {
      roleOffset = span * (role.dirtBias ?? 0) * 0.1 * intensity;
    } else if (config.zone === "space") {
      roleOffset = span * (role.spaceBias ?? 0) * 0.08 * intensity;
    }
  }

  const mutated = clamp(Number(value) + randomOffset + directedOffset + roleOffset, config.low, config.high);
  return config.integral ? Math.round(mutated) : mutated;
}

function chooseParameterPool(keys, strategy) {
  const scored = keys.map((key) => {
    const config = parameterConfigForKey(key);
    let score = 1;
    if (config?.zone === "tone") {
      score += Math.abs(strategy.tone) * 1.5;
    }
    if (config?.zone === "motion") {
      score += Math.abs(strategy.motion) * 1.5;
    }
    if (config?.zone === "attack") {
      score += Math.abs(strategy.attack) * 1.5;
    }
    if (config?.zone === "dirt") {
      score += Math.abs(strategy.dirt) * 1.8;
    }
    if (config?.zone === "space") {
      score += Math.abs(strategy.space) * 1.5;
    }
    return { key, score };
  });

  return scored.sort((left, right) => right.score - left.score);
}

function buildVariantDescription(role, strategy, mode) {
  const descriptors = [];
  if (strategy.tone < -0.2) {
    descriptors.push("darker");
  } else if (strategy.tone > 0.2) {
    descriptors.push("brighter");
  }

  if (strategy.motion < -0.2) {
    descriptors.push("steadier");
  } else if (strategy.motion > 0.2) {
    descriptors.push("more animated");
  }

  if (strategy.attack < -0.2) {
    descriptors.push("softer attack");
  } else if (strategy.attack > 0.2) {
    descriptors.push("harder attack");
  }

  if (strategy.space < -0.2) {
    descriptors.push("narrower");
  } else if (strategy.space > 0.2) {
    descriptors.push("wider");
  }

  if (strategy.dirt > 0.25) {
    descriptors.push("grittier");
  } else if (strategy.dirt < -0.25) {
    descriptors.push("cleaner");
  }

  if (!descriptors.length) {
    descriptors.push("balanced");
  }

  if (mode === "pro" && role.groupLabel) {
    return `${role.groupLabel} mutation leaning ${descriptors.join(", ")} with a broader pack spread.`;
  }

  return `${role.label} variation leaning ${descriptors.join(", ")}.`;
}

function controlValue(controls, key, fallback) {
  return String(controls?.[key] ?? Math.round(fallback * 100));
}

export function generatePresetVariants({ sourcePreset, strategy, mode = "free", controls = {} }) {
  const source = sourcePreset;
  if (!source?.data?.settings) {
    return [];
  }

  const summary = source.summary || presetSummary(source.data);
  const scalarKeys = summary.scalarKeys || safeScalarParameterKeys(source.data.settings);
  const pool = chooseParameterPool(scalarKeys, strategy);
  const roles = mode === "pro" ? PRO_PACK_ROLES : FREE_VARIANT_ROLES;
  const amountValue = controlValue(controls, "amount", strategy.amount);
  const toneValue = controlValue(controls, "tone", strategy.tone);
  const motionValue = controlValue(controls, "motion", strategy.motion);
  const attackValue = controlValue(controls, "attack", strategy.attack);
  const spaceValue = controlValue(controls, "space", strategy.space);
  const dirtValue = controlValue(controls, "dirt", strategy.dirt);

  return roles.map((role, index) => {
    const rng = createRng(hashString(`${mode}:${source.fileName}:${role.key}:${amountValue}:${toneValue}:${motionValue}:${attackValue}:${spaceValue}:${dirtValue}`));
    const data = cloneJson(source.data);
    const settings = data.settings;
    const baseChanges = mode === "pro" ? 10 : 8;
    const changeCount = clamp(Math.round(baseChanges + strategy.amount * (mode === "pro" ? 18 : 16) + (index % 4) * 2), 6, mode === "pro" ? 24 : 22);
    const candidateKeys = pool.slice(0, Math.max(changeCount * 2, 12));
    const chosen = [];

    while (chosen.length < Math.min(changeCount, candidateKeys.length)) {
      const item = candidateKeys[Math.floor(rng() * candidateKeys.length)];
      if (!item || chosen.includes(item.key)) {
        continue;
      }
      chosen.push(item.key);
    }

    const changedParameters = [];
    for (const key of chosen) {
      const config = parameterConfigForKey(key);
      if (!config) {
        continue;
      }
      const nextValue = mutateValue(key, settings[key], config, rng, strategy, role.multiplier, role);
      if (Number(nextValue) !== Number(settings[key])) {
        settings[key] = nextValue;
        changedParameters.push(key);
      }
    }

    const baseName = summary.name.replace(/\s+\/\s+(Closest|Darker|More Motion|Bolder|Wilder|.+\s\d+)$/i, "").trim();
    data.preset_name = `${baseName} / ${role.nameSuffix}`;
    data.comments = buildVariantDescription(role, strategy, mode);

    return {
      role,
      groupKey: role.groupKey || "free",
      groupLabel: role.groupLabel || "Free Variants",
      groupDescription: role.groupDescription || "Three starter mutations generated from the loaded preset.",
      name: data.preset_name,
      description: data.comments,
      changedParameters,
      data,
      downloadName: `${slugifyFilename(data.preset_name)}.vital`,
    };
  });
}

from __future__ import annotations

from dataclasses import dataclass
import json
from pathlib import Path
import random
from typing import Any


JsonDict = dict[str, Any]


@dataclass(frozen=True)
class VitalSummary:
    file: str
    top_level_keys: list[str]
    settings_count: int
    complex_keys: list[str]
    sample_name: str | None
    wavetable_count: int
    modulation_count: int


@dataclass
class VitalPreset:
    path: Path | None
    data: JsonDict

    @property
    def settings(self) -> JsonDict:
        settings = self.data.get("settings")
        if not isinstance(settings, dict):
            raise ValueError("Vital preset is missing a valid 'settings' object")
        return settings

    def summary(self, file_name: str | None = None) -> VitalSummary:
        settings = self.settings
        sample = settings.get("sample")
        wavetables = settings.get("wavetables")
        modulations = settings.get("modulations")

        return VitalSummary(
            file=file_name or (self.path.name if self.path else "<memory>"),
            top_level_keys=sorted(self.data.keys()),
            settings_count=len(settings),
            complex_keys=sorted(k for k, v in settings.items() if isinstance(v, (dict, list))),
            sample_name=sample.get("name") if isinstance(sample, dict) else None,
            wavetable_count=len(wavetables) if isinstance(wavetables, list) else 0,
            modulation_count=sum(
                1
                for item in modulations
                if isinstance(item, dict) and any(v not in (0, 0.0, "", False, None) for v in item.values())
            )
            if isinstance(modulations, list)
            else 0,
        )

    def to_text(self) -> str:
        # Compact JSON preserves the general Vital file style better than pretty-printing.
        return json.dumps(self.data, separators=(",", ":"), ensure_ascii=False)

    def write(self, output_path: Path) -> None:
        output_path.parent.mkdir(parents=True, exist_ok=True)
        output_path.write_text(self.to_text())


@dataclass(frozen=True)
class VitalMutationConfig:
    amount: float = 0.18
    seed: int | None = None
    max_parameters: int = 18


@dataclass(frozen=True)
class VitalMutationResult:
    changed_parameters: list[str]
    output_path: Path


SAFE_PARAMETER_BOUNDS: dict[str, tuple[float, float, bool]] = {
    "level": (0.0, 1.0, False),
    "pan": (-1.0, 1.0, False),
    "transpose": (-24.0, 24.0, True),
    "tune": (-1.0, 1.0, False),
    "frame_spread": (0.0, 1.0, False),
    "stereo_spread": (0.0, 1.0, False),
    "unison_blend": (0.0, 1.0, False),
    "unison_detune": (0.0, 1.0, False),
    "wave_frame": (0.0, 1.0, False),
    "spectral_morph_amount": (0.0, 1.0, False),
    "distortion_amount": (0.0, 1.0, False),
    "cutoff": (0.0, 100.0, False),
    "resonance": (0.0, 1.0, False),
    "drive": (0.0, 4.0, False),
    "keytrack": (0.0, 1.0, False),
    "mix": (0.0, 1.0, False),
    "attack": (0.0, 1.0, False),
    "decay": (0.0, 1.0, False),
    "sustain": (0.0, 1.0, False),
    "release": (0.0, 1.0, False),
    "dry_wet": (0.0, 1.0, False),
    "feedback": (0.0, 0.95, False),
    "mod_depth": (0.0, 1.0, False),
    "spread": (0.0, 1.0, False),
    "decay_time": (0.0, 1.0, False),
    "size": (0.0, 1.0, False),
    "pre_high_cutoff": (0.0, 100.0, False),
    "pre_low_cutoff": (0.0, 100.0, False),
    "filter_cutoff": (0.0, 100.0, False),
}

SAFE_PARAMETER_PREFIXES = (
    "osc_1_",
    "osc_2_",
    "filter_1_",
    "filter_2_",
    "env_1_",
    "env_2_",
    "chorus_",
    "delay_",
    "reverb_",
)


def _clamp(value: float, low: float, high: float) -> float:
    return max(low, min(high, value))


def _safe_scalar_parameter_keys(settings: JsonDict) -> list[str]:
    keys: list[str] = []
    for key, value in settings.items():
        if not isinstance(value, (int, float)):
            continue
        if not key.startswith(SAFE_PARAMETER_PREFIXES):
            continue
        if key.endswith(("_on", "_style", "_model", "_destination", "_filter_input", "_midi_track", "_sync", "_tempo", "_voices")):
            continue
        if key.endswith(("_attack_power", "_decay_power", "_release_power", "_delay", "_hold")):
            continue
        if "formant_" in key:
            continue
        if key.endswith("blend_transpose"):
            continue

        for suffix in SAFE_PARAMETER_BOUNDS:
            if key.endswith(suffix):
                keys.append(key)
                break

    return sorted(keys)


def _mutate_scalar(value: float, low: float, high: float, amount: float, rng: random.Random, integral: bool) -> float:
    span = high - low
    delta = (rng.random() * 2.0 - 1.0) * span * amount
    mutated = _clamp(float(value) + delta, low, high)
    if integral:
        return float(round(mutated))
    return mutated


def mutate_vital_preset(input_path: Path, output_path: Path, config: VitalMutationConfig) -> VitalMutationResult:
    if config.max_parameters <= 0:
        raise ValueError("max_parameters must be > 0")
    if not 0.0 < config.amount <= 1.0:
        raise ValueError("amount must be between 0.0 and 1.0")

    preset = load_vital_preset(input_path)
    settings = preset.settings
    candidates = _safe_scalar_parameter_keys(settings)
    if not candidates:
        raise ValueError(f"No safe scalar Vital parameters found in {input_path}")

    rng = random.Random(config.seed)
    count = min(config.max_parameters, len(candidates))
    chosen = sorted(rng.sample(candidates, count))

    for key in chosen:
        value = settings[key]
        for suffix, (low, high, integral) in SAFE_PARAMETER_BOUNDS.items():
            if key.endswith(suffix):
                settings[key] = _mutate_scalar(float(value), low, high, config.amount, rng, integral)
                break

    preset.write(output_path)
    reparsed = load_vital_preset(output_path)
    if not isinstance(reparsed.data.get("settings"), dict):
        raise ValueError(f"Mutated preset did not preserve a valid settings object: {output_path}")

    return VitalMutationResult(changed_parameters=chosen, output_path=output_path)


def load_vital_preset(path: Path) -> VitalPreset:
    if not path.exists():
        raise FileNotFoundError(f"Vital preset not found: {path}")
    if not path.is_file():
        raise ValueError(f"Vital preset path is not a file: {path}")

    data = json.loads(path.read_text())
    if not isinstance(data, dict):
        raise ValueError(f"Vital preset root must be a JSON object: {path}")

    preset = VitalPreset(path=path, data=data)
    _ = preset.settings
    return preset


def roundtrip_vital_preset(input_path: Path, output_path: Path) -> str:
    preset = load_vital_preset(input_path)
    preset.write(output_path)
    reparsed = load_vital_preset(output_path)

    if preset.data != reparsed.data:
        raise ValueError(f"Round-trip changed the preset structure for {input_path}")

    return f"Round-tripped {input_path.name} to {output_path}"

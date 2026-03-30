from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
VITAL_RAW = ROOT / "assets" / "seeds" / "vital" / "raw"


def summarize_preset(path: Path) -> dict:
    data = json.loads(path.read_text())
    settings = data.get("settings", {})
    complex_keys = sorted(k for k, v in settings.items() if isinstance(v, (dict, list)))

    return {
        "file": path.name,
        "top_level_keys": sorted(data.keys()),
        "settings_count": len(settings),
        "complex_keys": complex_keys,
        "sample_name": settings.get("sample", {}).get("name") if isinstance(settings.get("sample"), dict) else None,
        "wavetable_count": len(settings.get("wavetables", [])) if isinstance(settings.get("wavetables"), list) else 0,
        "modulation_count": sum(
            1
            for item in settings.get("modulations", [])
            if isinstance(item, dict) and any(v not in (0, 0.0, "", False, None) for v in item.values())
        ),
    }


def main() -> int:
    presets = sorted(p for p in VITAL_RAW.glob("*.vital") if p.is_file())
    if not presets:
        print("No .vital presets found in", VITAL_RAW)
        return 1

    for preset in presets:
        summary = summarize_preset(preset)
        print(json.dumps(summary, indent=2))

    return 0


if __name__ == "__main__":
    raise SystemExit(main())

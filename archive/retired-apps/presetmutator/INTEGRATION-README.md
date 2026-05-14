# PresetMutator Integration Note

This file exists so the project can be moved into the main `Kreativ Sound` codebase without losing product context.

## What This Project Is

PresetMutator is a preset-generation tool intended to become a `Kreativ Sound` product feature.

Its purpose is not just technical preset mutation. The intended role is:

- a free limited web experience inside `Kreativ Sound`
- a possible upsell path into a paid local app with deeper controls
- a sound-design utility built around bundled seed presets

## Current Product Direction

The strongest current direction is:

- web-first experience under `Kreativ Sound`
- free generation with hard limits
- likely up to 3 generated presets in the web version
- possible user-uploaded source preset or bundled seed preset
- paid app later for deeper generation, more exports, more control
- no time-limited trial
- likely one-time payment if the paid app happens

## Current Technical Status

The first real synth support is `Vital`.

Current state:

- real `.vital` presets are bundled in `assets/seeds/vital/raw/`
- `.vital` files are confirmed JSON-based structured presets
- parser and round-trip serializer exist
- first safe semantic mutator exists
- local browser UI exists for seed browsing and generation

## Why Vital Is First

Vital is the reference adapter because:

- its preset format is transparent enough to inspect
- it is already testable with real presets in this repo
- it is the most advanced supported synth in implementation right now

## Important Files

- `README.md`
  high-level project direction
- `notes/v1-blueprint.md`
  v1 architecture and product blueprint
- `notes/vital-adapter.md`
  Vital adapter plan
- `notes/vital-fixture-findings.md`
  findings from the real bundled Vital presets
- `src/preset_mutator/vital.py`
  current Vital parser and mutation logic
- `src/preset_mutator/server.py`
  local UI server
- `ui/`
  current calibration interface

## How To Run It

Local UI:

```bash
python3 -m preset_mutator serve-ui
```

Then open:

```text
http://127.0.0.1:4173
```

## Recommended Placement Inside Kreativ Sound

When this project is moved, keep it isolated as its own app/module rather than mixing files into unrelated folders.

Suggested structure:

```text
apps/preset-mutator/
```

Move these folders together:

- `assets/`
- `notes/`
- `scripts/`
- `src/`
- `ui/`
- `pyproject.toml`
- `README.md`
- `INTEGRATION-README.md`

## What Must Not Be Lost

If the project is moved, preserve these decisions:

- `Vital` is the first implemented synth
- the engine is semantic-first, not blind corruption
- risky nested sections like modulation/sample/wavetables should remain protected
- the webapp route is currently more strategically promising than a standalone app
- the project makes most sense as a `Kreativ Sound` feature or funnel, not as a separate startup

## Next Likely Step

After migration into `Kreativ Sound`, the next meaningful product step is:

- integrate the current local UI into the website/app structure
- keep the mutation engine modular
- validate whether the free web experience is strong enough to support a paid upgrade path

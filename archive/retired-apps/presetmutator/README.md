# PRESETMUTATOR

Desktop app for generating new synth presets from bundled seed presets.

## Product Direction

The project is no longer centered on a raw CLI mutator.

The intended v1 product is:

- a desktop app with UI
- no requirement for the client to have the synth installed
- bundled original seed presets provided by you
- synth-specific generation engines
- hybrid mutation, biased toward semantic parameter mutation

## V1 Synths

- Serum
- Vital
- Pigments

## Core Idea

Each supported synth gets its own adapter that can:

1. load a preset file into an internal model
2. mutate known parameters using synth-aware rules
3. optionally mutate safe unknown regions in constrained ways
4. export a valid preset file

The app should generate presets from shipped seeds, not from live plugin access.

## Key Constraint

The tool must work even when none of the target VSTs are installed on the user's machine.

That means the app must handle preset parsing, mutation, validation, and export entirely on its own.

## Current Repo Role

This repository is now the workspace for:

- product architecture
- preset format research
- synth adapter design
- desktop app implementation

## Local UI

Run the current local calibration UI with:

```bash
python3 -m preset_mutator serve-ui
```

Then open:

```text
http://127.0.0.1:4173
```

The current UI is a local web app for Vital calibration and generation. It is the fastest bridge to the final desktop product while the synth adapters are still being built.

## Next Document

The current working specification lives in [notes/v1-blueprint.md](/Users/andreiolaru/Library/CloudStorage/Dropbox/Collections/Kreativ%20Sound%20Collection/Experimental/PRESETMUTATOR/notes/v1-blueprint.md).

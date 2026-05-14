# Vital Adapter Plan

## Why Vital First

Vital is the best reference synth for the first implementation because:

- preset files are more transparent than opaque binary-only formats
- the ecosystem uses explicit preset and bank files
- you can test generated output directly in the synth you own

## Verified or Strongly Supported Facts

### Preset File Types

- individual presets use `.vital`
- preset banks use `.vitalbank`

### Preset Bank Shape

The official Vital forum shows that a `.vitalbank` must contain a folder layout where presets live under a `Presets` folder inside the bank package.

Working assumption:

- `.vitalbank` is a packaged container format with expected internal folder structure
- for v1, we do not need to generate `.vitalbank` files first
- exporting individual `.vital` files is enough for the first adapter

### `.vital` Representation

There is strong evidence from the Vital ecosystem and tooling that `.vital` presets are JSON-based rather than legacy `.fxp` blobs.

Working implementation assumption:

- `.vital` should be parsed as structured text data
- the adapter should preserve unknown keys and formatting-insensitive data
- mutation should operate on parsed data, not raw bytes

## V1 Goal for Vital

Implement a full reference adapter that can:

1. load bundled `.vital` seed presets
2. parse them into an internal normalized parameter model
3. mutate known parameter groups semantically
4. preserve unknown fields untouched by default
5. export valid `.vital` files

## What Counts as Success

- a bundled seed preset loads in the app
- the app generates multiple distinct variants
- the exported `.vital` file imports into Vital successfully
- the result remains musically recognizable unless a high-intensity mode is selected

## Adapter Strategy

### Default Bias

Vital should be implemented as a semantic-first adapter.

Because the preset representation appears to be structured, structural mutation should be minimal and only used when we have identified safe numeric regions that are not yet normalized.

### Preferred Mutation Order

1. parse preset JSON
2. map known fields to normalized parameters
3. mutate known parameters using synth-aware rules
4. write back to the original preset structure
5. validate required fields and export

## Initial Parameter Groups for Vital

These are the first groups worth targeting semantically.

### Oscillators

- oscillator enable/state
- level
- pan
- transpose
- tune
- unison-related controls
- blend / detune-like spread values
- warp mode and amount

### Filter

- filter on/off
- filter type
- cutoff
- resonance
- drive
- key tracking
- mix or routing options where clearly represented

### Envelopes

- attack
- decay
- sustain
- release

### LFO Basics

- rate where directly stored as scalar value
- phase or sync-related toggles if clearly enumerable
- depth only when not tightly coupled to modulation routing

### FX Basics

- enabled state
- wet/dry or mix
- size / feedback / time parameters for common effects

## Risky Areas for Vital

These should be deferred or heavily constrained at first.

- modulation matrix entries
- macro assignments
- wavetable references
- sample/noise file references
- custom LFO shape payloads
- any path-like or external asset references

## Protected Areas for Vital

The adapter should preserve these until they are fully understood.

- synth version fields
- preset metadata keys required for import
- any internal identifiers
- unknown top-level keys
- asset-reference fields

## Recommended Internal Model Mapping

The normalized model for Vital should include:

- preset metadata
- known scalar parameters
- known enum parameters
- known boolean parameters
- unparsed/unknown fields copied forward losslessly

This adapter should favor lossless round-tripping over aggressive cleanup or reformatting.

## Export Rules

For v1, export only individual `.vital` files.

Rules:

- preserve original file structure as much as possible
- keep unknown keys unless explicitly dropped for a reason
- write deterministic output when using the same random seed
- optionally update preset name metadata if the format expects it

## Validation Checklist

Before considering a generated Vital preset valid, confirm:

- file parses as valid JSON or valid preset text structure
- required metadata keys still exist
- enum values remain legal
- numeric values stay within allowed ranges
- protected fields remain unchanged unless intentionally updated

## Implementation Milestones

### Milestone 1

- create a `VitalAdapter`
- load and parse `.vital`
- round-trip a preset without mutation

### Milestone 2

- normalize a first subset of known parameters
- generate semantic mutations for safe parameter groups
- export and manually test in Vital

### Milestone 3

- add mutation styles such as subtle, balanced, and wild
- attach a changed-parameter summary to the generated result
- begin adapter coverage tracking

## Research Tasks

1. Inspect several real `.vital` seed presets you provide.
2. Identify stable top-level keys and metadata fields.
3. Determine whether the stored values are already human-readable or need remapping.
4. Build the first parameter map from real examples, not assumptions.
5. Confirm the smallest set of fields required for a valid re-export.

## Immediate Next Step

The first fixture set is now present in the repo.

The next concrete step is:

- implement safe parse and round-trip export for `.vital`
- preserve `sample`, `wavetables`, `lfos`, and `modulations` losslessly
- begin semantic mutation only on flat scalar parameter groups

Reference the observed structure in [notes/vital-fixture-findings.md](/Users/andreiolaru/Library/CloudStorage/Dropbox/Collections/Kreativ%20Sound%20Collection/Experimental/PRESETMUTATOR/notes/vital-fixture-findings.md).

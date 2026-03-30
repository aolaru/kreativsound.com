# V1 Blueprint

## Product Summary

PRESETMUTATOR v1 is a desktop application that generates new presets for selected synths using bundled seed presets and synth-specific mutation engines.

The app must work without requiring the target synth plugins to be installed on the user's machine.

## V1 Scope

### Supported Synths

- Serum
- Vital
- Pigments

### Core User Flow

1. User opens the app.
2. User selects a synth.
3. User browses bundled seed presets for that synth.
4. User selects one or more seeds.
5. User sets generation controls such as intensity, variation type, and random seed.
6. App generates one or more new presets.
7. User previews metadata about the result.
8. User exports preset files to disk.

### Non-Goals for V1

- no requirement to host or run the synth plugin
- no DAW integration
- no real-time audio rendering from the target synth engine
- no cloud dependency
- no support for unsupported synths through generic random file mutation

## Product Principles

- exported presets must remain valid for the target synth whenever possible
- semantic mutation is preferred over blind structural mutation
- structural mutation is allowed only as a constrained fallback
- the app must be understandable to sound designers, not just technical users
- every supported synth must be testable by us end to end

## Mutation Model

### Semantic Mutation

Semantic mutation means mutating known preset parameters using synth-aware rules.

Examples:

- move filter cutoff within a legal range
- adjust envelope times with sensible curves
- vary oscillator blend, detune, or warp within allowed values
- switch discrete modes only among valid enum states

### Structural Mutation

Structural mutation means changing safe unknown data in the preset representation without relying on full semantic understanding.

Examples:

- mutate whitelisted payload sections
- perturb unknown numeric values inside already-identified parameter blocks

Structural mutation must never touch protected regions such as:

- file headers
- format/version identifiers
- preset IDs
- checksums
- block sizes
- external asset references unless explicitly handled

### Hybrid Strategy

The default generator is hybrid:

1. Parse preset into internal synth model.
2. Apply semantic mutation to known parameters.
3. Apply constrained structural mutation only in adapter-approved safe regions.
4. Validate output before export.

## Parameter Classes

Each synth adapter should classify parameters into four groups.

### Stable/Core

These are safe and musically meaningful to mutate often.

Examples:

- oscillator levels
- filter cutoff
- filter resonance
- envelope attack/decay/sustain/release
- effect wet/dry amounts

### Discrete

These are valid but should be mutated conservatively.

Examples:

- filter type
- oscillator mode
- voicing options
- effect mode selection

### Risky

These can break intent, compatibility, or preset usability if changed too aggressively.

Examples:

- modulation routing
- macro assignments
- matrix depths
- sample or wavetable references
- asset paths

### Protected

These must never be mutated unless explicitly understood and recomputed.

Examples:

- headers
- version fields
- checksums
- byte counts
- internal identifiers

## App Architecture

### Recommended Stack

- desktop shell: Tauri
- frontend UI: web UI inside Tauri
- core generation engine: Rust or TypeScript, to be decided after adapter research

Tauri is the preferred shell because it gives a desktop UI, local file access, asset packaging, and offline distribution without the constraints of a browser-only webapp.

### High-Level Modules

- `app-ui`
  User-facing desktop UI
- `core`
  Shared generation pipeline and common models
- `adapters`
  One synth adapter per supported synth
- `assets`
  Bundled seed presets and metadata
- `validation`
  Export checks and file integrity rules

## Internal Data Model

The app should normalize presets into an internal structure before mutation.

Suggested shape:

- synth ID
- preset ID
- preset display name
- source seed ID
- parameter map
- unknown structural regions
- adapter metadata
- generation metadata

### Parameter Entry

A normalized parameter entry should support:

- stable parameter key
- display label
- value type
- current value
- allowed range or enum values
- mutation class
- optional curve/weighting hints

## Synth Adapter Contract

Each synth adapter should implement the same interface.

### Required Responsibilities

- identify supported preset file types
- load bundled presets
- parse preset data
- map known parameters to normalized internal model
- expose unknown but safe structural regions if any
- mutate parameters using synth-specific rules
- validate mutated output
- export valid preset files

### Adapter Methods

Suggested methods:

- `loadPreset(input) -> ParsedPreset`
- `mutate(parsedPreset, generationConfig) -> MutatedPreset`
- `validate(mutatedPreset) -> ValidationResult`
- `export(mutatedPreset, outputPath) -> ExportResult`

## Asset Packaging

Bundled presets should be treated as first-class product assets.

### Per-Asset Metadata

Each bundled seed preset should include:

- synth ID
- seed ID
- display name
- source file name
- tags
- author
- license or internal usage note
- optional style descriptors

### Storage Requirements

- keep original preset files untouched
- store metadata separately from raw preset files
- support multiple seeds per synth
- support future preview assets such as waveform images or notes

## Generation Controls

The UI should expose a small, clear set of generation controls.

### Required Controls

- synth
- seed preset
- number of variants
- mutation intensity
- variation style
- random seed

### Suggested Variation Styles

- subtle
- balanced
- adventurous
- wild

These styles should map to different mutation policies rather than arbitrary randomness.

## Validation Rules

Before export, the app should validate:

- preset file structure is intact
- protected regions remain valid
- parameter values are within legal ranges
- required asset references are still valid or untouched
- adapter-specific integrity checks pass

If validation fails, the app should discard the candidate or fall back to a safer generation pass.

## UI Screens

### Main Screen

- synth selector
- bundled preset browser
- selected seed details
- generation controls
- generate button

### Results Screen

- generated variants list
- source seed reference
- mutation summary
- export actions

### Library/Admin Screen

- bundled asset inventory
- per-synth adapter status
- parser coverage notes

## Export Behavior

Export should:

- write to a user-chosen directory
- preserve the original seed preset
- generate deterministic names when requested
- include optional sidecar metadata for debugging or provenance

Suggested sidecar metadata:

- source seed ID
- synth ID
- generation seed
- mutation profile
- changed parameter summary

## Testing Strategy

### Required Testing

- parser round-trip tests per synth
- validation tests for protected regions
- mutation policy tests for parameter ranges
- export tests using real bundled seed presets

### Manual Testing

For every supported synth:

- import generated presets into the actual synth
- confirm the preset loads successfully
- confirm core parameters sound intentionally varied
- track any broken output patterns

## Research Tasks Before Implementation

1. Confirm exact preset file types for Serum, Vital, and Pigments.
2. Determine which fields are semantic, risky, or protected for each synth.
3. Measure how much semantic parameter coverage is realistic for v1.
4. Decide whether the core engine should be Rust-first or TypeScript-first.
5. Define the metadata schema for bundled seed presets.

## Deliverables for V1

- desktop app shell
- synth picker UI
- bundled preset library for Serum, Vital, and Pigments
- synth adapters for those three synths
- hybrid generation pipeline
- export flow for valid preset files
- internal validation and test coverage

## Open Questions

- Do we need preset tagging and search in v1, or simple browsing is enough?
- Do we want one output at a time or batch generation by default?
- Should the app show a detailed parameter diff to the user, or keep that as debug-only metadata?

## Reference Adapter Order

Implementation should start with Vital.

Reason:

- likely easier preset parsing
- lower reverse-engineering burden
- direct local validation is possible

After Vital is working, use the same adapter contract for Serum and Pigments.

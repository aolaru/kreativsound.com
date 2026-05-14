# Vital Fixture Findings

These notes are based on the first real `.vital` presets provided for the project.

## Fixture Set

- `KS Dark Observatory.vital`
- `KS Dread Lantern.vital`
- `KS Frozen Hollow.vital`
- `KS Funeral Lattice.vital`
- `KS Iron Wake.vital`
- `KS Shadow Archive.vital`

## Confirmed Format Facts

### File Shape

Each `.vital` preset inspected so far is valid JSON text.

That means the Vital adapter should be implemented as a structured parser and serializer, not as a binary mutator.

### Top-Level Schema

Each fixture currently has these top-level keys:

- `author`
- `comments`
- `macro1`
- `macro2`
- `macro3`
- `macro4`
- `preset_style`
- `settings`
- `synth_version`

Observed top-level key count in all inspected fixtures: `9`

### Settings Object

`settings` is the main preset payload.

Observed key count in one inspected fixture: `775`

Most settings are flat scalar fields keyed by descriptive names such as:

- `osc_1_level`
- `osc_2_transpose`
- `filter_1_cutoff`
- `env_1_attack`
- `chorus_dry_wet`
- `delay_feedback`
- `reverb_size`

This is strongly favorable for semantic mutation.

## Complex Sections Inside `settings`

Only a few sections are non-scalar:

- `lfos` as a list of `8`
- `modulations` as a list of `64`
- `sample` as a dictionary
- `wavetables` as a list of `3`

These are the main risky areas for v1.

## Safe V1 Mutation Targets

The fixtures confirm that we can begin with scalar settings in these families:

- oscillators: `osc_1_*`, `osc_2_*`
- filters: `filter_1_*`, `filter_2_*`
- envelopes: `env_*`
- basic FX:
  `chorus_*`, `delay_*`, `reverb_*`, `distortion_*`, `compressor_*`, `eq_*`

These should be the first semantic mutation groups in the Vital adapter.

## Risky Areas

The following sections should be preserved or only lightly touched in the first pass:

- `lfos`
- `modulations`
- `sample`
- `wavetables`

Reasons:

- they contain nested structures
- they may reference external or embedded assets
- they can materially affect preset validity or identity

## Important Embedded Asset Finding

The provided fixtures include embedded sample data and wavetable data.

Observed examples:

- `sample.name`: `River`, `Box Fan`, `Waves`
- wavetable entries with names such as `Brown Noise`, `Stabbed`, `Didg`, `Jaw Harp`

This means the adapter must preserve these sections losslessly during round-trip export.

## Modulation Finding

At least one fixture includes non-empty modulation routes such as:

- `lfo_1 -> osc_1_wave_frame`
- `random_1 -> osc_1_wave_frame`
- `random_2 -> osc_1_spectral_morph_amount`
- `macro_control_1 -> osc_1_spectral_morph_amount`
- `mod_wheel -> filter_1_cutoff`

This confirms that modulation exists in real presets and should not be mutated aggressively in v1.

## Practical Conclusion

Vital is the correct first synth for implementation.

The adapter plan should now be:

1. parse JSON reliably
2. preserve all unknown and nested sections exactly
3. support lossless round-trip export
4. add semantic mutation for flat scalar parameter families first

## Immediate Engineering Step

The next implementation step should be a `VitalAdapter` round-trip phase:

- load `.vital`
- parse JSON
- expose top-level metadata and settings
- write the same structure back to disk
- compare the re-serialized output structurally
- validate import in Vital manually

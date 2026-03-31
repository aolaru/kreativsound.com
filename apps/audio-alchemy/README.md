# AUDIO ALCHEMY

Browser-first prototype for generating downloadable synth presets from uploaded audio, starting with `Vital`.

## Product Direction

This app is no longer framed as a generic audio effects tool.

The v1 question is narrower:

- can a user upload a short audio file
- can the browser extract a usable sound profile
- can that profile drive believable synth preset directions
- can we generate multiple preset variants from one source

## Supported Input for V1

Support the kinds of audio that can plausibly map to a synth patch:

- short `WAV`, `AIFF`, or `MP3` files
- mono or stereo
- roughly `0.3s` to `12s`
- one dominant sound source

Best fits:

- pads
- plucks
- bass notes
- drones
- textures
- impacts
- synth one-shots

Poor fits for v1:

- full songs
- drum loops
- spoken word
- dense multi-instrument recordings

## Current Prototype Scope

The UI in `ui/` supports:

- local audio upload
- waveform preview
- playback of the source audio
- input mode selection:
  - auto detect
  - pad / atmosphere
  - pluck / keys
  - bass
  - drone / texture
- browser-side feature analysis
- normalized sound profile extraction
- generation of multiple preset variants
- download of real `.vital` files built from bundled seed presets for the first synth adapter

Everything now runs in the browser, including preset export.

## What The Prototype Actually Does

It analyzes the uploaded audio and estimates:

- brightness
- body
- attack
- sustain
- movement
- noisiness
- stereo width
- pitch center

Those values are mapped into first-pass synth parameters such as:

- oscillator mode
- unison voices
- detune
- filter cutoff
- filter resonance
- envelope times
- LFO rate and depth
- chorus, reverb, and distortion amounts

## Next Step After This Prototype

If the generated directions feel musically believable, the next layer should be:

1. define a real internal `sound profile` schema
2. stabilize the mapping rules for `Vital`
3. improve preset naming, macro assignment, and seed selection logic
4. reuse the same profile for future synth adapters as more synths are added

## Run

From the repo root:

```bash
python3 -m http.server 4174
```

Then open:

```text
http://127.0.0.1:4174/apps/audio-alchemy/ui/
```

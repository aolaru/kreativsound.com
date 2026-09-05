# Wave Mutator Lite

Wave Mutator Lite is a beta browser tool for preparing audio samples for sound-product releases.

Core idea: drop in messy audio files and export cleaner, product-ready samples without uploading audio anywhere.

## How To Run Locally

Open `index.html` directly in a modern browser, or serve the folder with a tiny local server:

```sh
cd apps/wave-mutator/public
python3 -m http.server 8080
```

Then open:

```text
http://localhost:8080/
```

Inside the Kreativ Sound site, the intended URL is:

```text
https://kreativsound.com/tools/wave-mutator/
```

The previous `/tools/kreativ-sample-prep/` path redirects to the Wave Mutator Lite URL.

The root `predev` and `prebuild` scripts copy this source folder into `public/tools/wave-mutator/`. Treat that public copy as generated output.

## Current Beta Features

- Drag and drop WAV, AIFF, FLAC, and MP3 source files when the browser can decode them.
- File picker upload for supported local audio files.
- Loaded file list with selectable active file.
- Web Audio API decoding in the browser.
- Canvas waveform preview with zoom controls.
- Draggable waveform start/end handles for manual trim selection, including optional zero-crossing snap.
- File metadata: name, duration, sample rate, channels, peak, and clipping count.
- Extra analysis: RMS, DC offset, stereo balance, silence notes, and an estimated true peak.
- Play, pause, stop, progress display, and waveform click-to-seek.
- Trim leading and trailing silence with windowed RMS/peak detection, a minimum silence hold, and tail-safety padding.
- Add short fade in/out, defaulting to 10 ms.
- Normalize peak level, defaulting to -1 dBFS.
- Detect clipping at or above 0.999 amplitude.
- Export the selected processed file as `original-name_clean.wav`.
- Export the selected queue as an uncompressed ZIP with a local processing manifest.
- Export an MP3 preview montage through a bundled local MP3 encoder; no browser recorder support is required.
- Naming templates with `{name}`, `{index}`, and `{i}` tokens.
- Export quality controls for 16-bit PCM, 24-bit PCM, 32-bit float, mono sum, and optional 44.1/48 kHz resampling.
- Built-in Delivery Profiles for Sample Pack One-Shots, Music Pack, Video / Game SFX, and Store Preview. Manual changes show as Custom settings.
- Pack-wide preflight table with export selection, format, peak, estimated true peak, and review states.
- Queue controls: include/exclude, remove, clear, cancel a running batch, and save custom cleanup settings per file.
- Drag-to-reorder queue for ZIP and preview-montage sequencing.
- One-click local cleanup suggestion based on clipping, edge silence, and level analysis.
- Undo/redo for cleanup settings, manual trim, per-file settings, queue selection, and reordering.
- Keyboard transport: Space play/pause, S stop, Left/Right seek one second, Shift+Left/Right seek five seconds.
- Export/import cleanup settings as local JSON files.
- Settings JSON includes delivery profile, export, and montage values for local reuse.
- Expanded free pack report with source format, output target, cleanup details, QA state, clipping, and duration summary.
- Guardrails for queue count, input size, and decoded-audio memory use.

## Current Beta Limits

- AIFF, FLAC, and MP3 decoding depends on browser support. WAV and AIFF are the most reliable source formats.
- Large packs are capped to keep processing stable in a single browser tab.
- No LUFS normalization yet.
- No spectral repair, denoise, or DAW-style editing.
- No AI tagging or product folder builder yet.

## Client-Side Privacy

All audio is decoded, analyzed, processed, and exported locally in the browser. The app has no backend and does not upload files to a server.

## Future Roadmap

- LUFS normalization
- High-quality true-peak metering and limiter options
- Worker-based PCM analysis for very large packs
- AI-assisted sample tagging
- Product folder builder
- Preset chains
- WordPress integration under `kreativsound.com/tools`

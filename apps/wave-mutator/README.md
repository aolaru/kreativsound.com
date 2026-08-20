# Wave Mutator

Wave Mutator is a beta browser tool for preparing audio samples for sound-product releases.

Core idea: drop in messy WAV files and export cleaner, product-ready samples without uploading audio anywhere.

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

The previous `/tools/kreativ-sample-prep/` path redirects to the new Wave Mutator URL.

The root `predev` and `prebuild` scripts copy this source folder into `public/tools/wave-mutator/`. Treat that public copy as generated output.

## Current Beta Features

- Drag and drop WAV files.
- File picker upload for WAV files.
- Loaded file list with selectable active file.
- Web Audio API decoding in the browser.
- Canvas waveform preview.
- Draggable waveform start/end handles for manual trim selection.
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
- Pack-wide preflight table with export selection, format, peak, estimated true peak, and review states.
- Queue controls: include/exclude, remove, clear, cancel a running batch, and save custom cleanup settings per file.
- Guardrails for queue count, input size, and decoded-audio memory use.

## Current Beta Limits

- WAV is the only input format.
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

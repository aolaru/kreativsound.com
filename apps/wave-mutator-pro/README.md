# Wave Mutator Pro

Wave Mutator Pro is a Pro beta browser tool for preparing audio samples for sound-product releases.

Core idea: drop in messy audio files and export cleaner, product-ready samples without uploading audio anywhere.

## How To Run Locally

Serve the folder with a tiny local server so the browser can load the ES-module license verifier:

```sh
cd apps/wave-mutator-pro/public
python3 -m http.server 8080
```

Then open:

```text
http://localhost:8080/
```

Inside the Kreativ Sound site, the intended URL is:

```text
https://kreativsound.com/tools/wave-mutator-pro/
```

This is an unlisted private-beta route. Do not add it to the Tools page, search index, sitemap, updates, or public navigation yet.

The root `predev` and `prebuild` scripts copy this source folder into `public/tools/wave-mutator-pro/`. Treat that public copy as generated output.

## Current Beta Features

- Drag and drop WAV, AIFF, FLAC, and MP3 source files when the browser can decode them.
- File picker upload for supported local audio files.
- Loaded file list with selectable active file.
- Web Audio API decoding in the browser.
- Canvas waveform editor with a time ruler, separate channel lanes, zoom controls, and zoom-to-selection.
- Drag selection with exact start/end fields, selection playback, and optional zero-crossing snap.
- Non-destructive Trim, Delete, Silence, Fade In, Fade Out, and Gain edits against the decoded source.
- Readable per-file edit history with individual removal plus workspace undo/redo.
- Pro volume-envelope mode with draggable keyframes, exact point time/gain values, and linear, smooth, or exponential curves.
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
- Undo/redo for audio edits, cleanup settings, per-file settings, queue selection, and reordering.
- Keyboard transport: Space play/pause, S stop, Left/Right seek one second, Shift+Left/Right seek five seconds.
- Export/import cleanup settings as local JSON files.
- Settings JSON includes delivery profile, export, and montage values for local reuse.
- Expanded Pro pack report with source format, output target, cleanup details, QA state, clipping, and duration summary.
- Guardrails for queue count, input size, and decoded-audio memory use.
- After playback renders the same channel conversion, sample rate, and PCM quantization as WAV/ZIP delivery. Changing WAV settings invalidates the preview.
- Source-container metadata is read before decoding, so supported source rates are preserved independently of the playback device. Unknown headers are explicitly labelled; their decoded rate is the fallback.
- Separate source and rendered WAV metadata; floating-point WAV exports preserve values above full scale.

## Audio Regression Tests

Run `npm run check:wave-mutator-pro` for the static checks. The browser audio suite requires Playwright and Chrome and runs against the synchronized public files:

```sh
npm run test:wave-mutator-pro
```

Set `PLAYWRIGHT_MODULE` to an absolute Playwright module path when using an external test installation. `WAVE_TEST_BROWSER` selects another installed Playwright Chromium channel.

The Pro suite checks the locked state, automatic restoration of a Preset Mutator Pro activation, non-destructive envelope PCM, delivery-render equality, envelope gestures, and desktop/mobile editor screenshots under `output/wave-mutator-pro-tests/`. The broader Free audio regression suite remains available through `npm run test:wave-mutator`.

## Current Beta Limits

- AIFF, FLAC, and MP3 decoding depends on browser support. WAV is the recommended interchange format; reading a container's metadata does not guarantee that the browser can decode it.
- After is a WAV delivery preview. MP3 montage encoding is lossy and can change peaks; the montage remains a separate preview product.
- Large packs are capped to keep processing stable in a single browser tab.
- No LUFS normalization yet.
- No spectral repair, denoise, or DAW-style editing.
- No AI tagging or product folder builder yet.

## Client-Side Privacy

All audio is decoded, analyzed, processed, and exported locally in the browser. The app has no backend and does not upload files to a server.

## Shared Pro License

Wave Mutator Pro deliberately uses the same `preset-mutator-pro-license` browser storage key, Gumroad product identifier, and signed-token public key as Preset Mutator Pro. A valid Preset Mutator Pro activation on the same site origin is restored automatically. The Pro route is marked `noindex, nofollow` and is not linked from public site content.

## Future Roadmap

- LUFS normalization
- High-quality true-peak metering and limiter options
- Worker-based PCM analysis for very large packs
- AI-assisted sample tagging
- Product folder builder
- Preset chains
- WordPress integration under `kreativsound.com/tools`

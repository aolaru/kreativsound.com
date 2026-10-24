# Wave Mutator Free

Wave Mutator Free is a free beta browser tool for preparing audio samples for sound-product releases.

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

The previous `/tools/kreativ-sample-prep/` path redirects to the Wave Mutator Free URL.

The root `predev` and `prebuild` scripts copy this source folder into `public/tools/wave-mutator/`. Treat that public copy as generated output.

## Current Beta Features

- Drag and drop WAV, AIFF, FLAC, and MP3 source files when the browser can decode them.
- File picker upload for supported local audio files.
- Quick Clean is the default workspace; a separate Waveform Editor view shares the same file queue.
- Original previews untouched source audio, Edited previews manual edits, and Cleaned previews cleanup plus final WAV delivery settings.
- Loaded file list with selectable active file.
- Web Audio API decoding in the browser.
- Canvas waveform editor with a time ruler, separate channel lanes, zoom controls, and zoom-to-selection.
- Drag selection with exact start/end fields, selection playback, and optional zero-crossing snap.
- Non-destructive Trim, Delete, Silence, Fade In, Fade Out, and Gain edits against the decoded source.
- Readable per-file edit history with individual removal plus workspace undo/redo.
- Removing a Trim or Delete also removes dependent later edits; the history button states this explicitly, and Undo restores the full chain.
- File metadata: name, duration, sample rate, channels, peak, and clipping count.
- Extra analysis: RMS, DC offset, stereo balance, silence notes, and an estimated true peak.
- Play, pause, stop, progress display, and waveform click-to-seek.
- Trim leading and trailing silence with windowed RMS/peak detection, a minimum silence hold, and tail-safety padding.
- Add short fade in/out, defaulting to 10 ms.
- Normalize peak level, defaulting to -1 dBFS.
- Detect clipping at or above 0.999 amplitude.
- Export the selected processed file as `original-name_clean.wav`.
- Export the selected queue as an uncompressed ZIP with a local processing manifest.
- Partial ZIP exports identify omitted files in the result and manifest. Retry failed WAVs creates a separate retry ZIP containing only missing files.
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
- Expanded free pack report with source format, output target, cleanup details, QA state, clipping, and duration summary.
- Guardrails for queue count, input size, and decoded-audio memory use.
- Imports run sequentially, respect the 120-file limit across overlapping drops, and can be cancelled. Clearing the queue also cancels pending imports.
- Removing the active file stops playback, including playback starts still waiting for browser audio permission.
- Delivery normalization runs after channel conversion and resampling, before PCM quantization, so the peak target applies to the final WAV format.
- Cleaned playback renders the same channel conversion, sample rate, and PCM quantization as WAV/ZIP delivery. Changing WAV settings invalidates the preview while preserving manual edits.
- Source-container metadata is read before decoding, so supported source rates are preserved independently of the playback device. Unknown headers are explicitly labelled; their decoded rate is the fallback.
- Separate source and rendered WAV metadata; floating-point WAV exports preserve values above full scale.

## Audio Regression Tests

Run `npm run check:wave-mutator` for the static checks. The browser audio suite requires Playwright and Chrome and runs against the source files directly:

```sh
node scripts/test-wave-mutator.mjs
```

Set `PLAYWRIGHT_MODULE` to an absolute Playwright module path when using an external test installation. `WAVE_TEST_BROWSER` selects another installed Playwright Chromium channel.

The suite checks selection edit PCM and history, fade direction and endpoints, zero trim padding, silence, transients, linked stereo normalization, non-destructive processing, mixed WAV source rates, source header parsing, MP3 decoding, and sample equality between After and WAV delivery. It also checks preview invalidation and captures desktop/mobile screenshots under `output/wave-mutator-audio-tests/`.

## Current Beta Limits

- AIFF, FLAC, and MP3 decoding depends on browser support. WAV is the recommended interchange format; reading a container's metadata does not guarantee that the browser can decode it.
- Cleaned is a WAV delivery preview. MP3 montage encoding is lossy and can change peaks; the montage remains a separate preview product.
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

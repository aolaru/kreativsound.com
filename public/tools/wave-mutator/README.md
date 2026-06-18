# Wave Mutator

Wave Mutator is a first proof-of-concept browser tool for preparing audio samples for sound-product releases.

Core idea: drop in messy WAV files and export cleaner, product-ready samples without uploading audio anywhere.

## How To Run Locally

Open `index.html` directly in a modern browser, or serve the folder with a tiny local server:

```sh
cd public/tools/wave-mutator
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

## Current POC Features

- Drag and drop WAV files.
- File picker upload for WAV files.
- Loaded file list with selectable active file.
- Web Audio API decoding in the browser.
- Canvas waveform preview.
- Draggable waveform start/end handles for manual trim selection.
- File metadata: name, duration, sample rate, channels, peak, and clipping count.
- Extra analysis: RMS, DC offset, stereo balance, and silence notes.
- Play, pause, stop, progress display, and waveform click-to-seek.
- Trim leading and trailing silence with a simple amplitude threshold.
- Add short fade in/out, defaulting to 10 ms.
- Normalize peak level, defaulting to -1 dBFS.
- Detect clipping at or above 0.999 amplitude.
- Export the selected processed file as `original-name_clean.wav`.
- Export all loaded files as an uncompressed ZIP, generated fully client-side.
- Naming templates with `{name}`, `{index}`, and `{i}` tokens.
- Export quality controls for 16-bit PCM, 24-bit PCM, 32-bit float, mono sum, and optional 44.1/48 kHz resampling.

## Client-Side Privacy

All audio is decoded, analyzed, processed, and exported locally in the browser. The app has no backend and does not upload files to a server.

## Future Roadmap

- MP3 preview export
- LUFS normalization
- AI-assisted sample tagging
- Product folder builder
- Gumroad/Bandcamp-ready preview montage
- Preset chains
- WordPress integration under `kreativsound.com/tools`

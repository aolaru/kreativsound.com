import { mkdir } from "node:fs/promises";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";

// Uses a real browser for decoding/resampling; no mock AudioBuffer or resampler.
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || "playwright");
const root = fileURLToPath(new URL("../", import.meta.url));
const browser = await chromium.launch({ channel: process.env.WAVE_TEST_BROWSER || "chrome", headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(pathToFileURL(path.join(root, "apps/wave-mutator/public/index.html")).href);
  await page.waitForFunction(() => Boolean(window.waveMutator));
  const results = await page.evaluate(async () => {
    const checks = [];
    const assert = (condition, message) => { if (!condition) throw new Error(message); };
    const near = (a, b, tolerance = 1e-6) => Math.abs(a - b) <= tolerance;
    const test = async (name, run) => {
      try { await run(); checks.push(name); }
      catch (error) { throw new Error(`${name}: ${error.message}`); }
    };
    state.audioContext = new AudioContext({ sampleRate: 48000 });
    const buffer = (channels = 1, length = 4800, rate = 48000) =>
      new AudioBuffer({ numberOfChannels: channels, length, sampleRate: rate });
    const settings = { ...getSettings(), trimSilence: false, fadeEnabled: false, normalizeEnabled: false };

    await test("Fade endpoints, direction, stereo symmetry, and short buffers", () => {
      const audio = buffer(2);
      for (let channel = 0; channel < 2; channel++) audio.getChannelData(channel).fill(0.5);
      const count = applyFade(audio, 10);
      for (let channel = 0; channel < 2; channel++) {
        const data = audio.getChannelData(channel);
        assert(data[0] === 0 && data.at(-1) === 0, "Both fade endpoints must be zero");
        assert(near(data[count - 1], 0.5) && near(data[data.length - count], 0.5), "Fades must meet unity inside");
        for (let i = 1; i < count; i++) {
          assert(data[i] >= data[i - 1], "Fade in must rise");
          assert(data[data.length - i - 1] >= data[data.length - i], "Fade out must fall towards the end");
        }
      }
      for (const length of [1, 2, 3, 4, 9, 20]) {
        const short = buffer(1, length);
        short.getChannelData(0).fill(0.5);
        applyFade(short, 500);
        assert(short.getChannelData(0).every(Number.isFinite), "Short fade must remain finite");
      }
    });

    await test("Zero padding, default padding, silence, and single-channel transients", () => {
      const audio = buffer(2, 24000);
      audio.getChannelData(1).fill(0.5, 4800, 19200);
      const options = { threshold: dbToGain(-60), minSilenceMs: 60, paddingMs: 0 };
      const bounds = findTrimBounds(audio, options);
      assert(bounds.start === 4800 && bounds.endExclusive === 19200, "Zero padding must stay zero");
      const padded = findTrimBounds(audio, { threshold: options.threshold });
      assert(padded.start === 3840 && padded.endExclusive === 20160, "Default padding is 20ms");
      const silent = processAudioBuffer(buffer(), { ...settings, trimSilence: true, normalizeEnabled: true });
      assert(silent.report.trimSkipped && silent.buffer.length === 4800, "All-silence trim must preserve the file");
      assert(silent.buffer.getChannelData(0).every((value) => value === 0), "Silent normalization must stay silent");
      const transient = buffer(2, 24000);
      transient.getChannelData(1)[10000] = 0.8;
      const trimmed = processAudioBuffer(transient, { ...settings, trimSilence: true, trimPaddingMs: 0 });
      assert(near(analyzeBuffer(trimmed.buffer).peak, 0.8), "Trim must retain a transient on either channel");
    });

    await test("Normalization, clipping detection, and original sample preservation", () => {
      const audio = buffer(2);
      audio.getChannelData(0).fill(0.25);
      audio.getChannelData(1).fill(-0.5);
      const original = audio.getChannelData(1).slice();
      const result = processAudioBuffer(audio, { ...settings, normalizeEnabled: true, targetPeakDb: -1 });
      assert(near(result.analysis.peak, dbToGain(-1)), "Peak must hit -1 dBFS");
      assert(near(result.buffer.getChannelData(0)[10] / result.buffer.getChannelData(1)[10], -0.5), "Stereo gain must remain linked");
      assert(original.every((value, i) => value === audio.getChannelData(1)[i]), "Processing must not mutate original PCM");
      const clips = buffer(1, 5);
      clips.getChannelData(0).set([0, 0.9991, -1, 1.2, 0.5]);
      assert(analyzeBuffer(clips).clippedSamples === 3, "Clipping threshold regression");
    });

    await test("Selection edits are deterministic and preserve decoded PCM", () => {
      const audio = buffer(2, 8, 8000);
      audio.getChannelData(0).set([0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8]);
      audio.getChannelData(1).set([-0.1, -0.2, -0.3, -0.4, -0.5, -0.6, -0.7, -0.8]);
      const originalLeft = audio.getChannelData(0).slice();
      const silenced = applyEditOperations(audio, [{ type: "silence", startSample: 2, endSample: 5 }]);
      assert(silenced.getChannelData(0).slice(2, 5).every((value) => value === 0), "Silence must zero every selected sample");
      assert(silenced.getChannelData(1).slice(2, 5).every((value) => value === 0), "Silence must affect every channel");
      const deleted = applyEditOperations(audio, [{ type: "delete", startSample: 2, endSample: 5 }]);
      assert(deleted.length === 5 && near(deleted.getChannelData(0)[2], 0.6), "Delete must close the selected range");
      const trimmed = applyEditOperations(audio, [{ type: "trim", startSample: 2, endSample: 6 }]);
      assert(trimmed.length === 4 && near(trimmed.getChannelData(0)[0], 0.3) && near(trimmed.getChannelData(0)[3], 0.6), "Trim must retain only the selection");
      const faded = applyEditOperations(audio, [{ type: "fade-in", startSample: 2, endSample: 6 }, { type: "fade-out", startSample: 2, endSample: 6 }]);
      assert(faded.getChannelData(0)[2] === 0 && faded.getChannelData(0)[5] === 0, "Selection fades must reach zero at their selected edges");
      const gained = applyEditOperations(audio, [{ type: "gain", startSample: 0, endSample: 2, gainDb: -6 }]);
      assert(near(gained.getChannelData(0)[1], 0.2 * dbToGain(-6)), "Gain must affect only the selected samples");
      assert(near(gained.getChannelData(0)[2], 0.3), "Gain must not affect samples outside the selection");
      assert(originalLeft.every((value, index) => value === audio.getChannelData(0)[index]), "Selection edits must not mutate decoded PCM");
    });

    await test("WAV source rates survive decoding on a 48kHz playback device", async () => {
      for (const rate of [22050, 44100, 48000, 96000]) {
        const source = buffer(2, rate / 10, rate);
        const wav = encodeWav(source, { bitDepth: "24" });
        const decoded = await decodeFile(new File([wav], "source.wav"));
        assert(decoded.audioBuffer.sampleRate === rate, `Source rate ${rate} was changed`);
        assert(decoded.sourceMetadata.sampleRate === rate && decoded.sourceMetadata.channels === 2, "Source header metadata is incorrect");
        assert(decoded.sourceMetadata.bitDepth === 24, "Source bit depth is incorrect");
      }
    });

    await test("AIFF, FLAC, MPEG metadata and malformed-header fallback", async () => {
      const aiff = new ArrayBuffer(58);
      const v = new DataView(aiff);
      writeAscii(v, 0, "FORM"); v.setUint32(4, 50); writeAscii(v, 8, "AIFF");
      writeAscii(v, 12, "COMM"); v.setUint32(16, 18); v.setUint16(20, 1);
      v.setUint32(22, 2); v.setUint16(26, 16);
      v.setUint16(28, 0x400e); v.setUint32(30, 0xac440000);
      writeAscii(v, 38, "SSND"); v.setUint32(42, 12);
      const aiffMeta = readSourceAudioMetadata(aiff);
      assert(aiffMeta.sampleRate === 44100 && aiffMeta.channels === 1 && aiffMeta.bitDepth === 16, "AIFF extended-rate metadata must be read correctly");
      const flac = new ArrayBuffer(42); const f = new DataView(flac);
      writeAscii(f, 0, "fLaC"); f.setUint8(7, 34);
      f.setUint32(18, (96000 << 12) | (1 << 9) | (23 << 4));
      const meta = readSourceAudioMetadata(flac);
      assert(meta.sampleRate === 96000 && meta.channels === 2 && meta.bitDepth === 24, "FLAC STREAMINFO parse failed");
      const encoder = new lamejs.Mp3Encoder(1, 44100, 128);
      const mp3 = new Blob([encoder.encodeBuffer(new Int16Array(4410)), encoder.flush()]);
      const mp3Decoded = await decodeFile(new File([mp3], "source.mp3"));
      assert(mp3Decoded.sourceMetadata.sampleRate === 44100 && mp3Decoded.audioBuffer.sampleRate === 44100, "MP3 source rate must be preserved");
      for (const length of [0, 1, 3, 8, 15]) assert(readSourceAudioMetadata(new ArrayBuffer(length)).sampleRate === null, "Short header must return unknown");
      const malformed = aiff.slice(0, 25);
      assert(readSourceAudioMetadata(malformed).sampleRate === null, "Truncated chunk must return unknown");
    });

    await test("Cleaned PCM exactly matches WAV payload for every delivery format", async () => {
      const audio = buffer(2, 4410, 44100);
      for (let i = 0; i < audio.length; i++) {
        audio.getChannelData(0)[i] = Math.sin(i * 0.13) * 0.5;
        audio.getChannelData(1)[i] = Math.cos(i * 0.17) * 0.25;
      }
      const file = { audioBuffer: audio, settingsOverride: settings, trimStartRatio: 0, trimEndRatio: 1 };
      for (const bitDepth of ["16", "24", "32f"]) {
        for (const sampleRateMode of ["original", "48000"]) {
          for (const channelMode of ["original", "mono"]) {
            const target = { ...getExportSettings(), bitDepth, sampleRateMode, channelMode };
            const preview = await renderDeliveryAudio(file, target);
            const rendered = await renderDeliveryAudio(file, target);
            assert(preview.buffer.sampleRate === (sampleRateMode === "original" ? 44100 : 48000), "Delivery rate mismatch");
            assert(preview.buffer.numberOfChannels === (channelMode === "mono" ? 1 : 2), "Delivery channel mismatch");
            const wav = new DataView(await encodeWav(rendered.buffer, target).arrayBuffer());
            assert(wav.getUint32(24, true) === preview.buffer.sampleRate && wav.getUint16(22, true) === preview.buffer.numberOfChannels, "WAV header mismatch");
            let offset = 44;
            for (let i = 0; i < preview.buffer.length; i++) {
              for (let ch = 0; ch < preview.buffer.numberOfChannels; ch++) {
                let value;
                if (bitDepth === "16") { value = wav.getInt16(offset, true) / 32768; offset += 2; }
                else if (bitDepth === "24") {
                  const packed = wav.getUint8(offset) | (wav.getUint8(offset + 1) << 8) | (wav.getUint8(offset + 2) << 16);
                  value = ((packed << 8) >> 8) / 8388608; offset += 3;
                } else { value = wav.getFloat32(offset, true); offset += 4; }
                assert(value === preview.buffer.getChannelData(ch)[i], `Preview differs from ${bitDepth}-bit WAV at ${i}`);
              }
            }
          }
        }
      }
      const loud = buffer(1, 2); loud.getChannelData(0).set([1.5, -1.5]);
      const float = new DataView(await encodeWav(loud, { bitDepth: "32f" }).arrayBuffer());
      assert(float.getFloat32(44, true) === 1.5 && float.getFloat32(48, true) === -1.5, "Float export must preserve headroom");
    });

    await test("Normalization targets final mono and resampled delivery PCM", async () => {
      const audio = buffer(2, 4410, 44100);
      for (let index = 0; index < audio.length; index++) {
        audio.getChannelData(0)[index] = Math.sin(index * 0.13) * 0.5;
      }
      const source = audio.getChannelData(0).slice();
      const file = { audioBuffer: audio, settingsOverride: { ...settings, normalizeEnabled: true, targetPeakDb: -1 } };
      for (const channelMode of ["mono", "original"]) {
        for (const sampleRateMode of ["original", "48000"]) {
          for (const bitDepth of ["16", "24", "32f"]) {
            const result = await renderDeliveryAudio(file, { ...getExportSettings(), channelMode, sampleRateMode, bitDepth });
            assert(near(result.analysis.peak, dbToGain(-1), 1 / 32768), "Final delivery peak must hit -1 dBFS after conversion");
            assert(result.analysis.clippedSamples === 0, "Normalization must leave the requested headroom");
            const unnormalized = await prepareExportBuffer(audio, { channelMode, sampleRateMode });
            assert(near(result.report.normalizeGain, dbToGain(-1) / analyzeBuffer(unnormalized).peak), "Report must describe final delivery normalization");
          }
        }
      }
      const cancelling = buffer(2);
      cancelling.getChannelData(0).fill(0.5);
      cancelling.getChannelData(1).fill(-0.5);
      const silentMono = await renderDeliveryAudio({ audioBuffer: cancelling, settingsOverride: file.settingsOverride }, {
        ...getExportSettings(), channelMode: "mono", sampleRateMode: "original", bitDepth: "32f",
      });
      assert(silentMono.buffer.getChannelData(0).every((value) => value === 0), "Silent mono cancellation must not create invalid gain or samples");
      assert(silentMono.report.normalizeGain === 1, "Silent output normalization must remain a no-op");
      assert(source.every((value, index) => value === audio.getChannelData(0)[index]), "Delivery normalization must preserve source PCM");
    });

    await test("Removing structural edits removes their dependents and supports undo", async () => {
      const audio = buffer(1, 288000);
      audio.getChannelData(0).fill(0.25);
      await loadFiles([new File([encodeWav(audio)], "history-chain.wav")]);
      setWorkspaceView("editor");
      const file = getSelectedFile();
      const original = file.audioBuffer.getChannelData(0).slice();
      for (const structuralType of ["trim", "delete"]) {
        setSelectionRatios(structuralType === "trim" ? 4 / 6 : 0, structuralType === "trim" ? 1 : 4 / 6);
        applySelectionEdit(structuralType);
        setSelectionRatios(0.25, 0.5);
        applySelectionEdit("silence");
        assert(elements.editHistoryList.querySelector("button").textContent === "Remove + 1 later", "Structural removal must disclose dependent edits");
        assert(getEditedBuffer(file).getChannelData(0)[36000] === 0, "Silence must affect the trimmed timeline");
        removeEditOperation(file.editOperations[0].id);
        assert(file.editOperations.length === 0 && getEditedBuffer(file) === file.audioBuffer, "Removing an earlier structural edit must not retarget later audio");
        undoWorkspaceEdit();
        assert(file.editOperations.length === 2 && getEditedBuffer(file).getChannelData(0)[36000] === 0, "Undo must restore the complete edit chain");
        redoWorkspaceEdit();
        assert(file.editOperations.length === 0, "Redo must remove the complete dependent chain");
      }
      setSelectionRatios(0, 1);
      applySelectionEdit("gain");
      setSelectionRatios(0.25, 0.5);
      applySelectionEdit("silence");
      removeEditOperation(file.editOperations[0].id);
      assert(file.editOperations.length === 1 && file.editOperations[0].type === "silence", "Removing gain must preserve later edits");
      assert(getEditedBuffer(file).getChannelData(0)[96000] === 0, "A later edit must keep its original position");
      assert(original.every((value, index) => value === file.audioBuffer.getChannelData(0)[index]), "History removal must preserve source PCM");
      clearQueue();
      setWorkspaceView("clean");
    });

    await test("Imports serialize capacity checks and clearing cannot resurrect cancelled files", async () => {
      clearQueue();
      const audio = buffer(1, 48);
      audio.getChannelData(0).fill(0.25);
      const wav = encodeWav(audio);
      const files = (prefix, count) => Array.from({ length: count }, (_, index) => new File([wav], `${prefix}-${index}.wav`));
      await Promise.all([loadFiles(files("first", 120)), loadFiles(files("second", 120))]);
      assert(state.files.length === 120, "Overlapping imports must enforce the 120-file queue cap");
      assert(!isExportBusy() && state.importRun === null, "Import state must return to idle");
      clearQueue();
      await loadFiles(files("existing", 1));
      const savedDecoder = decodeFile;
      let releaseOld;
      let releaseNew;
      let oldEntered;
      let newEntered;
      const oldGate = new Promise((resolve) => { releaseOld = resolve; });
      const newGate = new Promise((resolve) => { releaseNew = resolve; });
      const oldStarted = new Promise((resolve) => { oldEntered = resolve; });
      const newStarted = new Promise((resolve) => { newEntered = resolve; });
      try {
        decodeFile = async (file) => {
          if (file.name.startsWith("old")) { oldEntered(); await oldGate; }
          if (file.name.startsWith("new")) { newEntered(); await newGate; }
          return savedDecoder(file);
        };
        const oldLoading = loadFiles(files("old", 1));
        const queued = loadFiles(files("queued", 1));
        await oldStarted;
        assert(isExportBusy() && elements.exportButton.disabled && !elements.cancelImportButton.hidden, "Import must lock exports and expose cancellation");
        assert(!elements.clearQueueButton.disabled, "Clear must remain available during import");
        clearQueue();
        assert(state.files.length === 0 && !isExportBusy(), "Clear must cancel active and queued imports immediately");
        const newLoading = loadFiles(files("new", 1));
        await newStarted;
        releaseOld();
        await Promise.all([oldLoading, queued]);
        assert(state.files.length === 0 && isExportBusy(), "A stale decode must not publish files or unlock a newer import");
        releaseNew();
        await newLoading;
        assert(state.files.length === 1 && state.files[0].name === "new-0.wav", "Only the new import may publish audio");
        const cancelled = loadFiles(files("old-cancelled", 1));
        elements.cancelImportButton.click();
        await cancelled;
        assert(state.files.length === 1 && !isExportBusy(), "Cancel import must retain existing files without adding cancelled audio");
      } finally {
        releaseOld();
        releaseNew();
        decodeFile = savedDecoder;
        cancelImports(false);
      }
      await loadFiles([new File([wav], "valid.wav"), new File(["not audio"], "invalid.wav")]);
      assert(elements.statusMessage.classList.contains("is-warning") && elements.statusMessage.textContent.includes("1 failed: invalid.wav"), "Mixed decode results must not hide failed files");
      clearQueue();
    });

    await test("Original, Edited, and Cleaned use distinct audio and workspace states", async () => {
      const audio = buffer(2, 9600);
      audio.getChannelData(0).fill(0.5);
      audio.getChannelData(1).fill(-0.25);
      await loadFiles([new File([encodeWav(audio, { bitDepth: "24" })], "preview-states.wav")]);
      const file = getSelectedFile();
      assert(state.workspaceView === "clean" && state.previewMode === "original", "Quick Clean must start with Original");
      assert(document.querySelector(".wave-editor").hidden && !document.querySelector(".work-grid").hidden, "Quick Clean must hide manual editing");
      assert(elements.previewProcessedButton.disabled, "Cleaned must be unavailable before rendering");
      elements.editorViewButton.click();
      assert(state.workspaceView === "editor" && state.previewMode === "edited", "Opening Editor must select Edited");
      assert(!document.querySelector(".wave-editor").hidden && document.querySelector(".work-grid").hidden, "Editor must isolate editing controls");
      setSelectionRatios(0.25, 0.75);
      elements.editSilenceButton.click();
      const original = file.audioBuffer;
      const edited = getEditedBuffer(file);
      assert(edited.getChannelData(0)[4800] === 0 && original.getChannelData(0)[4800] === 0.5, "Manual edit must preserve Original");
      for (const [button, expected, mode] of [
        [elements.previewOriginalButton, original, "original"],
        [elements.previewEditedButton, edited, "edited"],
      ]) {
        button.click();
        assert(getActiveBuffer() === expected && state.previewMode === mode, "Preview selected the wrong PCM");
        assert(button.getAttribute("aria-pressed") === "true", "Preview state must be accessible");
        await playFrom(0);
        assert(state.playbackSource.buffer === expected, "Playback did not use the selected PCM");
        stopPlayback();
      }
      elements.previewOriginalButton.click();
      assert(getActiveAnalysis() === file.originalAnalysis && elements.editSilenceButton.disabled, "Original must show source analysis and be read-only");
      const editCount = file.editOperations.length;
      applySelectionEdit("gain");
      assert(file.editOperations.length === editCount, "Original must reject direct edits");
      elements.returnToCleanButton.click();
      assert(state.workspaceView === "clean" && state.previewMode === "edited", "Returning to cleanup must retain manual edits");
      file.settingsOverride = { ...settings, normalizeEnabled: true, targetPeakDb: -6 };
      elements.bitDepth.value = "24";
      await applyProcessingPreview();
      const cleaned = file.processedBuffer;
      assert(state.previewMode === "cleaned" && getActiveBuffer() === cleaned, "Cleanup must select Cleaned PCM");
      assert(cleaned.getChannelData(0)[4800] === 0 && near(cleaned.getChannelData(0)[0], dbToGain(-6), 1e-6), "Cleanup must process Edited audio");
      await playFrom(0);
      assert(state.playbackSource.buffer === cleaned, "Cleaned playback must use rendered delivery audio");
      stopPlayback();
      elements.previewOriginalButton.click();
      assert(getActiveBuffer() === original && getActiveBuffer().getChannelData(0)[4800] === 0.5, "Original must remain available after cleanup");
      const savedDownload = downloadBlob;
      let downloadedWav;
      downloadBlob = (blob) => { downloadedWav = blob; };
      try {
        await exportSelectedFile();
        const decoded = await state.audioContext.decodeAudioData(await downloadedWav.arrayBuffer());
        assert(decoded.getChannelData(0)[4800] === 0 && near(decoded.getChannelData(0)[0], dbToGain(-6), 1e-6), "Export from Original preview must still include edits and cleanup");
      } finally {
        downloadBlob = savedDownload;
      }
      elements.previewEditedButton.click();
      assert(getActiveBuffer() === edited && near(getActiveBuffer().getChannelData(0)[0], 0.5), "Edited must exclude automatic cleanup");
      elements.previewProcessedButton.click();
      assert(getActiveAnalysis() === file.processedAnalysis, "Cleaned must show delivery analysis");
      elements.bitDepth.value = "16";
      elements.bitDepth.dispatchEvent(new Event("input", { bubbles: true }));
      assert(!file.processedBuffer && state.previewMode === "edited" && elements.previewProcessedButton.disabled, "Invalidating Cleaned must retain Edited");
      assert(file.editOperations.length === editCount && getActiveBuffer() === edited, "Delivery settings must preserve manual edits");
      elements.editorViewButton.click();
      setSelectionRatios(0.25, 0.75);
      elements.editTrimButton.click();
      const shortened = getEditedBuffer(file);
      elements.previewOriginalButton.click();
      assert(getActiveBuffer().length === 9600, "Original must retain its duration after trim");
      elements.previewEditedButton.click();
      assert(getActiveBuffer() === shortened && shortened.length === 4800, "Edited must show the trimmed duration");
      showPreviewMode("original");
      drawWaveform();
      assert(file.waveformCache.original && file.waveformCache.edited, "Original and Edited must have separate waveform caches");
      setProcessingMode("preview");
      assert(elements.editorViewButton.disabled && elements.previewOriginalButton.disabled && elements.previewEditedButton.disabled, "Workspace and preview changes must lock during processing");
      setProcessingMode(null);
      clearQueue();
      setWorkspaceView("clean");
    });

    await test("UI invalidates delivery previews, including saved file overrides", async () => {
      const audio = buffer(2, 4410, 44100);
      audio.getChannelData(0).fill(0.4); audio.getChannelData(1).fill(-0.1);
      await loadFiles([new File([encodeWav(audio, { bitDepth: "24" })], "stereo.wav")]);
      const file = getSelectedFile(); file.settingsOverride = settings;
      setWorkspaceView("editor");
      const originalPcm = file.audioBuffer.getChannelData(0).slice();
      file.selectionStartRatio = 0.25;
      file.selectionEndRatio = 0.75;
      updateUi();
      elements.editSilenceButton.click();
      assert(file.editOperations.length === 1 && elements.editHistoryList.children.length === 1, "Applied edit must appear in readable history");
      assert(getEditedBuffer(file).getChannelData(0).slice(1103, 3307).every((value) => value === 0), "UI silence edit did not affect selection");
      assert(originalPcm.every((value, index) => value === file.audioBuffer.getChannelData(0)[index]), "UI edit changed decoded source");
      undoWorkspaceEdit();
      assert(file.editOperations.length === 0, "Undo must remove the selection edit");
      redoWorkspaceEdit();
      assert(file.editOperations.length === 1, "Redo must restore the selection edit");
      elements.editHistoryList.querySelector(".edit-history-remove").click();
      assert(file.editOperations.length === 0, "History remove must replay without the operation");
      elements.channelMode.value = "mono";
      elements.sampleRateMode.value = "48000";
      await applyProcessingPreview();
      assert(file.processedBuffer.numberOfChannels === 1 && file.processedBuffer.sampleRate === 48000, "After must use delivery settings");
      assert(elements.metaSourceFormat.textContent.includes("44,100") && elements.metaOutputFormat.textContent.includes("48,000"), "Source and delivery metadata must be distinct");
      elements.bitDepth.value = "16";
      elements.bitDepth.dispatchEvent(new Event("input", { bubbles: true }));
      assert(!file.processedBuffer && elements.previewProcessedButton.disabled, "Bit depth change must invalidate After");
      await applyProcessingPreview();
      applyDeliveryProfile("game-sfx");
      assert(!file.processedBuffer && file.settingsOverride, "Profile change must invalidate override preview without losing override");
      await applyProcessingPreview();
      setProcessingMode("preview");
      assert(elements.bitDepth.disabled && elements.channelMode.disabled && elements.fadeMs.disabled, "Render controls must lock while busy");
      assert(trimHandleFromEvent({}) === null, "Trim must be inactive during render");
      setProcessingMode(null);
      assert(trimHandleFromEvent({}) === null, "After must not expose source-coordinate trim handles");
    });

    await test("Actual WAV, ZIP, and montage export routes use the delivery renderer", async () => {
      const file = getSelectedFile();
      const expected = new Uint8Array(await encodeWav(file.processedBuffer, getExportSettings()).arrayBuffer());
      const downloads = [];
      const originalDownload = downloadBlob;
      downloadBlob = (blob, name) => downloads.push({ blob, name });
      try {
        await exportSelectedFile();
        assert(downloads.length === 1 && downloads[0].name.endsWith(".wav"), "WAV export did not complete");
        const actual = new Uint8Array(await downloads[0].blob.arrayBuffer());
        assert(actual.length === expected.length && actual.every((v, i) => v === expected[i]), "Downloaded WAV differs from After");
        await exportAllAsZip();
        assert(downloads.length === 2 && downloads[1].name.endsWith(".zip"), "ZIP export did not complete");
        const zip = await downloads[1].blob.arrayBuffer(); const header = new DataView(zip);
        assert(header.getUint32(0, true) === 0x04034b50 && header.getUint16(8, true) === 0, "Expected stored ZIP entry");
        const start = 30 + header.getUint16(26, true) + header.getUint16(28, true);
        const wav = new Uint8Array(zip, start, header.getUint32(18, true));
        assert(wav.length === expected.length && wav.every((v, i) => v === expected[i]), "ZIP WAV differs from After");
        await exportMp3Montage();
        assert(downloads.length === 3 && downloads[2].name.endsWith(".mp3") && downloads[2].blob.size > 0, "MP3 montage failed");
        assert(!isExportBusy(), "Export state must return to idle");
      } finally { downloadBlob = originalDownload; }
    });
    await test("ZIP failures are explicit, manifests are truthful, and retries isolate missing files", async () => {
      clearQueue();
      elements.namingTemplate.value = "{name}_clean";
      elements.packName.value = "zip-failure-test";
      const audio = buffer();
      audio.getChannelData(0).fill(0.25);
      await loadFiles([new File([encodeWav(audio)], "good.wav"), new File([encodeWav(audio)], "fails.wav")]);
      const failedFile = state.files[1];
      const savedRenderer = renderDeliveryAudio;
      const savedDownload = downloadBlob;
      const downloads = [];
      const retryIds = [];
      const readEntries = async (blob) => {
        const bytes = await blob.arrayBuffer();
        const view = new DataView(bytes);
        const entries = new Map();
        let offset = 0;
        while (offset + 30 <= view.byteLength && view.getUint32(offset, true) === 0x04034b50) {
          const size = view.getUint32(offset + 18, true);
          const nameLength = view.getUint16(offset + 26, true);
          const extraLength = view.getUint16(offset + 28, true);
          const name = new TextDecoder().decode(new Uint8Array(bytes, offset + 30, nameLength));
          const start = offset + 30 + nameLength + extraLength;
          entries.set(name, new Uint8Array(bytes, start, size));
          offset = start + size;
        }
        return entries;
      };
      try {
        downloadBlob = (blob, name) => downloads.push({ blob, name });
        renderDeliveryAudio = async (file, options) => {
          if (file.id === failedFile.id) throw new Error("Controlled render failure");
          return savedRenderer(file, options);
        };
        await exportAllAsZip();
        assert(downloads.length === 1 && state.zipResult.exportedCount === 1 && state.zipResult.failures.length === 1, "Partial ZIP must count failures");
        assert(elements.statusMessage.classList.contains("is-warning") && elements.zipResultSummary.textContent.includes("1 of 2"), "Partial ZIP must not report full success");
        assert(elements.zipResult.getBoundingClientRect().width >= elements.zipResult.parentElement.clientWidth - 2, "ZIP results must span the export grid rather than a single narrow column");
        assert(elements.zipFailedFiles.textContent.includes("fails.wav") && !elements.retryFailedZipButton.hidden, "Failed filenames and retry must be visible");
        assert(state.batchProgress.detail.includes("1 failed"), "Batch progress must disclose failure");
        const entries = await readEntries(downloads[0].blob);
        assert(entries.has("good_clean.wav") && !entries.has("fails_clean.wav"), "Partial ZIP contents must match actual success");
        const manifestName = [...entries.keys()].find((name) => name.endsWith("_manifest.txt"));
        const manifest = new TextDecoder().decode(entries.get(manifestName));
        assert(manifest.includes("1 of 2 WAVs exported; 1 failed") && manifest.includes("fails.wav: Controlled render failure"), "Manifest must identify omissions");
        renderDeliveryAudio = async (file, options) => {
          retryIds.push(file.id);
          return savedRenderer(file, options);
        };
        await retryFailedZipExport();
        assert(retryIds.length === 1 && retryIds[0] === failedFile.id, "Retry must render only missing files");
        assert(downloads[1].name.endsWith("_retry.zip") && state.zipResult.failures.length === 0, "Retry must produce a separate successful archive");
        assert(elements.retryFailedZipButton.hidden, "A successful retry must clear its failure controls");
        renderDeliveryAudio = async () => { throw new Error("All renders failed"); };
        await exportAllAsZip();
        assert(downloads.length === 2 && state.zipResult.exportedCount === 0 && state.zipResult.failures.length === 2, "Complete failure must not download an archive");
        assert(elements.zipResult.classList.contains("is-error") && elements.statusMessage.classList.contains("is-error"), "Complete failure must remain visible");
      } finally {
        renderDeliveryAudio = savedRenderer;
        downloadBlob = savedDownload;
        clearQueue();
      }
    });
    await test("Removing playing files stops audio and cancels delayed playback starts", async () => {
      clearQueue();
      const audio = buffer(1, 144000);
      audio.getChannelData(0).fill(0.15);
      const wav = encodeWav(audio);
      await loadFiles([new File([wav], "A.wav"), new File([wav], "B.wav")]);
      await playFrom(0);
      const playing = getSelectedFile();
      const other = state.files[1];
      const source = state.playbackSource;
      removeFile(other.id);
      assert(state.isPlaying && state.playbackSource === source, "Removing another file must not interrupt the current audio");
      removeFile(playing.id);
      assert(!state.isPlaying && state.playbackSource === null && elements.stopButton.disabled, "Removing the only playing file must stop its source");
      await loadFiles([new File([wav], "A.wav"), new File([wav], "B.wav")]);
      await playFrom(0);
      removeFile(getSelectedFile().id);
      assert(!state.isPlaying && state.playbackSource === null && elements.metaName.textContent === "B.wav", "Removing the active file must stop before selecting the next file");
      const savedResume = state.audioContext.resume;
      let release;
      const gate = new Promise((resolve) => { release = resolve; });
      try {
        state.audioContext.resume = async function () { await gate; return savedResume.call(this); };
        const pending = playFrom(0);
        removeFile(getSelectedFile().id);
        release();
        await pending;
        assert(state.files.length === 0 && !state.isPlaying && state.playbackSource === null, "A delayed playback request must not restart removed audio");
      } finally {
        release();
        state.audioContext.resume = savedResume;
        stopPlayback();
        clearQueue();
      }
    });
    return checks;
  });
  const output = path.join(root, "output/wave-mutator-audio-tests");
  await mkdir(output, { recursive: true });
  await page.evaluate(async () => {
    clearQueue();
    setWorkspaceView("clean");
    applyDeliveryProfile("sample-pack");
    await runSelfTestFixture();
    await applyProcessingPreview();
  });
  await page.locator('.preview-panel').screenshot({ path: path.join(output, "desktop-quick-clean.png") });
  await page.locator('.top-grid').screenshot({ path: path.join(output, "desktop-workspace.png") });
  await page.locator('#editor-view-button').click();
  await page.locator('#preview-original-button').click();
  const originalSelection = await page.evaluate(() => getSelection());
  await page.locator('#waveform').scrollIntoViewIfNeeded();
  const originalBox = await page.locator('#waveform').boundingBox();
  await page.mouse.move(originalBox.x + originalBox.width * 0.15, originalBox.y + originalBox.height * 0.6);
  await page.mouse.down();
  await page.mouse.move(originalBox.x + originalBox.width * 0.8, originalBox.y + originalBox.height * 0.6, { steps: 8 });
  await page.mouse.up();
  const originalAfterDrag = await page.evaluate(() => getSelection());
  if (originalAfterDrag.startRatio !== originalSelection.startRatio || originalAfterDrag.endRatio !== originalSelection.endRatio) {
    throw new Error("Original preview must not accept waveform selections");
  }
  await page.locator('#resume-editing-button').click();
  console.log("PASS Original is read-only and Edit audio returns to Edited");
  await page.evaluate(() => {
    const file = getSelectedFile();
    file.selectionStartRatio = 0.2;
    file.selectionEndRatio = 0.65;
    updateUi();
  });
  await page.locator('.preview-panel .section-head').scrollIntoViewIfNeeded();
  const waveformBox = await page.locator('#waveform').boundingBox();
  if (!waveformBox) throw new Error("Waveform was not visible for pointer selection test");
  await page.mouse.move(waveformBox.x + waveformBox.width * 0.15, waveformBox.y + waveformBox.height * 0.6);
  await page.mouse.down();
  await page.mouse.move(waveformBox.x + waveformBox.width * 0.8, waveformBox.y + waveformBox.height * 0.6, { steps: 8 });
  await page.mouse.up();
  const pointerSelection = await page.evaluate(() => getSelection());
  if (Math.abs(pointerSelection.startRatio - 0.15) > 0.02 || Math.abs(pointerSelection.endRatio - 0.8) > 0.02) {
    throw new Error("Pointer drag did not create the expected waveform selection");
  }
  console.log("PASS Pointer drag creates a waveform selection");
  await page.evaluate(() => {
    const file = getSelectedFile();
    file.selectionStartRatio = 0.2;
    file.selectionEndRatio = 0.65;
    updateUi();
  });
  await page.screenshot({ path: path.join(output, "desktop.png") });
  await page.locator('.wave-editor').screenshot({ path: path.join(output, "desktop-editor.png") });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator('.preview-panel .section-head').scrollIntoViewIfNeeded();
  await page.screenshot({ path: path.join(output, "mobile.png") });
  await page.locator('.wave-editor').screenshot({ path: path.join(output, "mobile-editor.png") });
  await page.locator('.preview-panel').screenshot({ path: path.join(output, "mobile-preview.png") });
  await page.locator('#quick-clean-view-button').click();
  await page.locator('.preview-panel').screenshot({ path: path.join(output, "mobile-quick-clean.png") });
  const layout = await page.evaluate(() => {
    const title = document.querySelector(".file-title").getBoundingClientRect();
    const badges = document.querySelector(".file-badges").getBoundingClientRect();
    return {
      overflow: document.documentElement.scrollWidth > window.innerWidth,
      queueOverlap: title.bottom > badges.top,
      editorHidden: getComputedStyle(document.querySelector(".wave-editor")).display === "none",
      previewButtonsFit: [elements.previewOriginalButton, elements.previewEditedButton, elements.previewProcessedButton]
        .every((button) => button.scrollWidth <= button.clientWidth),
    };
  });
  if (layout.overflow || layout.queueOverlap || !layout.editorHidden || !layout.previewButtonsFit) {
    throw new Error(`Mobile workspace layout failed: ${JSON.stringify(layout)}`);
  }
  console.log("PASS Mobile preview controls fit and Quick Clean hides editing controls");
  if (errors.length) throw new Error(errors.join("\n"));
  results.forEach((name) => console.log(`PASS ${name}`));
} finally {
  await browser.close();
}

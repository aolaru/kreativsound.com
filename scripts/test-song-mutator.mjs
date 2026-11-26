import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || "playwright");
const root = fileURLToPath(new URL("../", import.meta.url));
const browser = await chromium.launch({ channel: process.env.WAVE_TEST_BROWSER || "chrome", headless: true });
try {
  const page = await browser.newPage();
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto(pathToFileURL(path.join(root, "apps/wave-mutator/public/song-mutator/index.html")).href);
  const result = await page.evaluate(async () => {
    const ctx = new AudioContext({ sampleRate: 44100 });
    const source = ctx.createBuffer(2, 88200, 44100);
    for (let ch = 0; ch < 2; ch++) {
      const samples = source.getChannelData(ch);
      for (let i = 0; i < samples.length; i++) samples[i] = .22 * Math.sin(i * .037 + ch * .4) + (i % 6000 < 35 ? .25 : 0);
    }
    const original = source.getChannelData(0).slice();
    const changes = [];
    for (const style of ["dreamlike", "ambient", "ghostly", "trashed"]) {
      const rendered = await renderSong(source, style, 65);
      let difference = 0;
      const samples = rendered.buffer.getChannelData(0);
      for (let i = 0; i < samples.length; i++) {
        if (!Number.isFinite(samples[i])) throw new Error(`${style}: non-finite sample`);
        difference += Math.abs(samples[i] - original[i]);
      }
      if (difference / samples.length < .005) throw new Error(`${style}: no audible change`);
      changes.push((difference / samples.length).toFixed(3));
    }
    if (new Set(changes).size !== 4) throw new Error("Style outputs unexpectedly match");
    if (!original.every((value, i) => value === source.getChannelData(0)[i])) throw new Error("Source changed");
    const zero = await renderSong(source, "dreamlike", 0);
    if (Math.abs(zero.buffer.getChannelData(0)[200] - original[200]) > 1 / 8388608) throw new Error("Zero intensity changed source beyond quantization");
    const view = new DataView(await encodeSongWav(zero.buffer).arrayBuffer());
    if (view.getUint16(22, true) !== 2 || view.getUint16(34, true) !== 24 || view.getUint32(24, true) !== 44100 || view.getUint32(40, true) !== source.length * 6) throw new Error("Invalid WAV format");
    const packed = view.getUint8(44) | view.getUint8(45) << 8 | view.getUint8(46) << 16;
    if ((packed << 8 >> 8) / 8388608 !== zero.buffer.getChannelData(0)[0]) throw new Error("Preview differs from WAV");
    await loadFile(new File([encodeSongWav(source)], "track.wav", { type: "audio/wav" }));
    if (!song.source) throw new Error("Import failed");
    await render();
    if (!song.result || ui.export.disabled) throw new Error("Render not available for export");
    ui.intensity.value = "40";
    ui.intensity.dispatchEvent(new Event("input"));
    if (song.result || !ui.export.disabled) throw new Error("Stale render can be exported");
    return changes;
  });
  if (errors.length) throw new Error(errors.join("\n"));
  console.log("Song Mutator audio and workflow checks passed:", result.join(", "));
} finally {
  await browser.close();
}

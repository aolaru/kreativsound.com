import { createServer } from "node:http";
import { readFile, stat, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || "playwright");
const root = fileURLToPath(new URL("../", import.meta.url));
const publicRoot = path.join(root, "public");
const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".woff2": "font/woff2",
};

const server = createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url || "/", "http://localhost").pathname);
    let filePath = path.resolve(publicRoot, `.${pathname}`);
    if (!filePath.startsWith(publicRoot)) throw new Error("Invalid path");
    if ((await stat(filePath)).isDirectory()) filePath = path.join(filePath, "index.html");
    const contents = await readFile(filePath);
    response.writeHead(200, { "Content-Type": mimeTypes[path.extname(filePath)] || "application/octet-stream" });
    response.end(contents);
  } catch {
    response.writeHead(404, { "Content-Type": "text/plain" });
    response.end("Not found");
  }
});

await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const address = server.address();
const origin = `http://127.0.0.1:${address.port}`;
const browser = await chromium.launch({ channel: process.env.WAVE_TEST_BROWSER || "chrome", headless: true });

try {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  await context.addInitScript(() => {
    localStorage.setItem("kreativ-analytics-consent", "declined");
  });
  const page = await context.newPage();
  const pageErrors = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  await page.route("https://api.gumroad.com/v2/licenses/verify", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        purchase: {
          product_id: "-A9fzCUAIYZ0QZKoRvyOQA==",
          email: "shared-license@example.com",
          sale_id: "TEST-SHARED-LICENSE",
          refunded: false,
          disputed: false,
          chargebacked: false,
        },
      }),
    });
  });

  await page.goto(`${origin}/tools/wave-mutator-pro/`);
  await page.waitForFunction(() => document.body.dataset.licenseState === "locked");
  if (!await page.locator("[data-pro-workspace]").first().evaluate((element) => element.inert)) {
    throw new Error("Wave Mutator Pro workspace must be inert before activation");
  }

  const output = path.join(root, "output/wave-mutator-pro-tests");
  await mkdir(output, { recursive: true });
  await page.locator(".pro-license-panel").screenshot({ path: path.join(output, "locked-panel.png") });

  // Activate in Preset Mutator Pro, then verify that Wave Mutator Pro restores it automatically.
  await page.goto(`${origin}/preset-mutator-pro/`);
  await page.waitForSelector("#paid-feature-key");
  await page.locator("#paid-feature-key").fill("SHARED-PRO-TEST-KEY");
  await page.locator("#paid-feature-unlock-button").click();
  await page.waitForFunction(() => document.querySelector("#paid-feature-panel")?.classList.contains("is-unlocked"));
  const storedKey = await page.evaluate(() => localStorage.getItem("preset-mutator-pro-license"));
  if (storedKey !== "SHARED-PRO-TEST-KEY") throw new Error("Preset Mutator Pro did not store the shared key");

  await page.goto(`${origin}/tools/wave-mutator-pro/`);
  await page.waitForFunction(() => document.body.dataset.licenseState === "unlocked");
  await page.waitForFunction(() => Boolean(window.waveMutator));
  if (await page.locator("[data-pro-workspace]").first().evaluate((element) => element.inert)) {
    throw new Error("Shared Preset Mutator Pro activation did not unlock Wave Mutator Pro");
  }

  const envelopeResult = await page.evaluate(async () => {
    state.audioContext = new AudioContext({ sampleRate: 48000 });
    const source = new AudioBuffer({ numberOfChannels: 2, length: 4800, sampleRate: 48000 });
    source.getChannelData(0).fill(0.5);
    source.getChannelData(1).fill(-0.25);
    await loadFiles([new File([encodeWav(source, { bitDepth: "24" })], "envelope-source.wav", { type: "audio/wav" })]);
    const file = getSelectedFile();
    const decodedOriginal = file.audioBuffer.getChannelData(0).slice();
    file.settingsOverride = { ...getSettings(), trimSilence: false, fadeEnabled: false, normalizeEnabled: false };
    setEditorMode("envelope");
    file.envelopePoints = [
      { ratio: 0, gainDb: 0 },
      { ratio: 0.5, gainDb: -12 },
      { ratio: 1, gainDb: 0 },
    ];
    file.envelopeCurve = "linear";
    updateUi();
    elements.envelopeApply.click();
    const edited = getEditedBuffer(file);
    const delivery = await renderDeliveryAudio(file, { ...getExportSettings(), bitDepth: "32f" });
    return {
      operationType: file.editOperations[0]?.type,
      pointCount: file.editOperations[0]?.points.length,
      sourceUnchanged: decodedOriginal.every((value, index) => value === file.audioBuffer.getChannelData(0)[index]),
      sourceMidpoint: file.audioBuffer.getChannelData(0)[2400],
      editedMidpoint: edited.getChannelData(0)[2400],
      deliveryMidpoint: delivery.buffer.getChannelData(0)[2400],
      historyText: document.querySelector("#edit-history-list")?.textContent,
      selectionControlsDisplay: getComputedStyle(elements.selectionEditorControls).display,
      envelopeControlsDisplay: getComputedStyle(elements.envelopeEditorControls).display,
    };
  });

  if (envelopeResult.operationType !== "envelope" || envelopeResult.pointCount !== 3) {
    throw new Error("Envelope was not committed to non-destructive history");
  }
  if (!envelopeResult.sourceUnchanged || Math.abs(envelopeResult.sourceMidpoint - 0.5) > 0.0001) {
    throw new Error("Envelope changed the decoded source PCM");
  }
  if (Math.abs(envelopeResult.editedMidpoint - 0.5 * Math.pow(10, -12 / 20)) > 0.001) {
    throw new Error("Envelope midpoint gain is incorrect");
  }
  if (envelopeResult.deliveryMidpoint !== envelopeResult.editedMidpoint) {
    throw new Error("Envelope preview and 32-bit float delivery differ");
  }
  if (!envelopeResult.historyText?.includes("Volume envelope")) {
    throw new Error("Envelope operation is missing from readable history");
  }
  if (envelopeResult.selectionControlsDisplay !== "none" || envelopeResult.envelopeControlsDisplay === "none") {
    throw new Error("Envelope mode did not isolate its editing controls");
  }

  await page.locator(".preview-panel").scrollIntoViewIfNeeded();
  const waveform = page.locator("#waveform");
  const waveformBox = await waveform.boundingBox();
  if (!waveformBox) throw new Error("Waveform is not visible for envelope editing");
  await page.mouse.dblclick(
    waveformBox.x + waveformBox.width * 0.4,
    waveformBox.y + waveformBox.height * 0.65,
  );
  const interactivePointCount = await page.evaluate(() => getEnvelopePoints().length);
  if (interactivePointCount !== 3) {
    throw new Error("Double-clicking the waveform did not add an envelope point");
  }

  await page.evaluate(() => {
    const file = getSelectedFile();
    file.envelopePoints = [
      { ratio: 0, gainDb: 0 },
      { ratio: 0.25, gainDb: -18 },
      { ratio: 0.7, gainDb: 6 },
      { ratio: 1, gainDb: -6 },
    ];
    file.envelopeCurve = "smooth";
    state.selectedEnvelopePoint = 2;
    updateUi();
  });
  await page.locator(".preview-panel").screenshot({ path: path.join(output, "envelope-desktop.png") });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator(".preview-panel").scrollIntoViewIfNeeded();
  await page.locator(".preview-panel").screenshot({ path: path.join(output, "envelope-mobile.png") });

  if (pageErrors.length) throw new Error(pageErrors.join("\n"));
  console.log("PASS Wave Mutator Pro starts locked");
  console.log("PASS Preset Mutator Pro activation unlocks Wave Mutator Pro automatically");
  console.log("PASS Volume envelope is non-destructive and matches delivery PCM");
  console.log("PASS Volume envelope points respond to waveform gestures");
} finally {
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
}

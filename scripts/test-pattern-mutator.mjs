import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { DRAFT_KEY } from "../apps/pattern-mutator/public/draft.js";

const imported = await import(process.env.PLAYWRIGHT_MODULE || "playwright");
const { chromium } = imported.default || imported;
const root = fileURLToPath(new URL("../apps/pattern-mutator/public/", import.meta.url));
const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url, "http://localhost");
    const relative = decodeURIComponent(url.pathname).replace(/^\/tools\/pattern-mutator\//, "");
    let file = path.resolve(root, relative || "index.html");
    if (path.relative(root, file).startsWith("..")) throw new Error("Invalid path");
    if ((await stat(file)).isDirectory()) file = path.join(file, "index.html");
    response.writeHead(200, {
      "Content-Type": { ".js": "text/javascript", ".html": "text/html", ".css": "text/css" }[path.extname(file)] || "application/octet-stream",
      "Cache-Control": "no-store",
    });
    response.end(await readFile(file));
  } catch { response.writeHead(404); response.end(); }
});
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const origin = "http://127.0.0.1:" + server.address().port;
let browser;

async function range(page, id, value) {
  await page.locator("#" + id).evaluate((input, value) => {
    input.value = String(value);
    input.dispatchEvent(new Event("input"));
    input.dispatchEvent(new Event("change"));
  }, value);
}
async function draft(page) {
  await page.waitForTimeout(220);
  return page.evaluate((key) => JSON.parse(localStorage.getItem(key)), DRAFT_KEY);
}
async function seed(page, value) {
  await page.evaluate((initial) => {
    let value = initial;
    Math.random = () => { value = (1664525 * value + 1013904223) >>> 0; return value / 4294967296; };
  }, value);
}
function midiNotes(bytes) {
  let cursor = 22, tick = 0;
  const notes = [], active = new Map();
  const readVar = () => {
    let value = 0, byte;
    do { byte = bytes[cursor++]; value = value * 128 + (byte & 127); } while (byte & 128);
    return value;
  };
  while (cursor < bytes.length) {
    tick += readVar();
    const status = bytes[cursor++];
    if (status === 255) { cursor++; const length = readVar(); cursor += length; continue; }
    const pitch = bytes[cursor++], velocity = bytes[cursor++];
    if (status === 144) {
      assert(!active.has(pitch), "Export has overlapping repeated notes");
      const note = { start: tick, pitch, velocity };
      notes.push(note); active.set(pitch, note);
    } else {
      assert.equal(status, 128);
      assert(active.has(pitch));
      active.get(pitch).duration = tick - active.get(pitch).start;
      active.delete(pitch);
    }
  }
  assert.equal(active.size, 0);
  return notes.sort((a, b) => a.start - b.start || a.pitch - b.pitch);
}

try {
  browser = await chromium.launch({ channel: process.env.PATTERN_TEST_BROWSER || "chrome", headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.addInitScript(() => {
    const Native = window.AudioContext;
    window.audioProbe = { starts: [] };
    window.AudioContext = class extends Native {
      createOscillator() {
        const oscillator = super.createOscillator();
        const start = oscillator.start.bind(oscillator), stop = oscillator.stop.bind(oscillator);
        const record = {};
        oscillator.start = (time) => {
          Object.assign(record, { start: time, frequency: oscillator.frequency.value });
          window.audioProbe.starts.push(record);
          return start(time);
        };
        oscillator.stop = (time) => { if (Number.isFinite(time)) record.end = time; return stop(time); };
        return oscillator;
      }
    };
  });
  await page.goto(origin + "/tools/pattern-mutator/");
  await seed(page, 200);
  await page.locator("#generate").click();
  const before = await draft(page);
  assert.equal(before.current.pattern.length, 28, "The reported 28-note reproduction fixture changed");
  await page.locator('[data-lock="notes"]').click();
  await page.locator('[data-lock="expression"]').click();
  await seed(page, 700);
  await range(page, "mutation-amount", 100);
  await page.locator("#mutate").click();
  const after = await draft(page);
  assert.equal(after.current.pattern.length, 28);
  assert.equal(await page.locator(".note").count(), 28);
  for (const note of after.current.pattern) {
    const original = before.current.pattern.find((n) => n.id === note.id);
    assert.equal(note.pitch, original.pitch);
    assert.equal(note.velocity, original.velocity);
    assert.equal(note.duration, original.duration);
  }
  const downloadEvent = page.waitForEvent("download");
  await page.locator("#download").click();
  const downloaded = await downloadEvent;
  const exported = midiNotes(await readFile(await downloaded.path()));
  assert.deepEqual(exported, after.current.pattern.map(({ start, pitch, velocity, duration }) => ({ start, pitch, velocity, duration })));
  await page.locator("#audition").click();
  const played = await page.evaluate(() => window.audioProbe.starts);
  assert.equal(played.length, exported.length);
  const secondsPerTick = 60 / after.current.settings.tempo / 480;
  const startAt = played[0].start - exported[0].start * secondsPerTick;
  played.forEach((voice, i) => {
    assert(Math.abs(voice.start - (startAt + exported[i].start * secondsPerTick)) < 1e-6);
    assert(Math.abs(voice.frequency - 440 * 2 ** ((exported[i].pitch - 69) / 12)) < .01);
    assert(Math.abs(voice.end - voice.start - exported[i].duration * secondsPerTick - .01) < 1e-6);
  });
  await page.locator("#stop").click();
  console.log("PASS The reported 28-note clip retains all 28 notes in the editor, playback, and downloaded MIDI");

  await range(page, "mutation-amount", 0);
  await page.locator("#mutate").click();
  assert.deepEqual((await draft(page)).current.pattern, after.current.pattern);
  assert.equal((await draft(page)).history.length, after.history.length);
  console.log("PASS Zero mutation amount leaves edited notes and undo history unchanged");

  await page.locator('[data-lock="notes"]').click();
  await page.locator('[data-lock="expression"]').click();
  await page.locator('[data-style="warm-chords"]').click();
  const chords = await draft(page);
  const outside = (notes) => notes.filter((n) => n.start < 1920 || n.start >= 3840);
  await page.locator("#regenerate-bar").selectOption("2");
  for (const value of [1000, 3000, 4000]) {
    await seed(page, value);
    await page.locator("#regenerate-bar-button").click();
    const refreshed = await draft(page);
    assert.deepEqual(outside(refreshed.current.pattern), outside(chords.current.pattern));
    assert.deepEqual(refreshed.current.harmony, chords.current.harmony);
    assert(refreshed.current.pattern.filter((n) => n.start >= 1920 && n.start < 3840)
      .every((n) => chords.current.harmony.voicings[1].includes(n.pitch)));
  }
  console.log("PASS Regenerating bar 2 keeps the original harmony and leaves every neighboring note unchanged");

  await page.locator(".note").first().click();
  await range(page, "note-velocity", 77);
  await page.locator("#visible-bars").selectOption("1");
  await page.locator("#view-page").selectOption("3");
  await page.locator("#audition-sound").selectOption("pad");
  await page.locator("#loop-audition").check();
  await page.locator("#follow-playback").uncheck();
  await page.locator('[data-lock="rhythm"]').click();
  await range(page, "mutation-amount", 73);
  await page.locator("#undo").click();
  const session = await draft(page);
  await page.reload();
  const recovered = await draft(page);
  for (const key of ["current", "history", "future", "controls", "locks", "audio", "view", "mutationAmount"]) {
    assert.deepEqual(recovered[key], session[key], "Recovery lost " + key);
  }
  await page.locator("#redo").click();
  assert((await draft(page)).current.pattern.some((note) => note.velocity === 77));
  console.log("PASS Reload restores notes, harmony, undo/redo history, locks, sound, and editor settings");

  await page.locator("#register").selectOption("high");
  await page.locator("#role").selectOption("bass");
  await page.locator("#bars").selectOption("1");
  await page.locator("#generate").click();
  const pitchKeys = await page.locator("#pitch-labels").textContent();
  while (await page.locator(".note").count()) {
    await page.locator(".note").first().click();
    await page.locator("#delete-note").click();
  }
  assert.equal(await page.locator("#pitch-labels").textContent(), pitchKeys);
  const addedPitches = [];
  for (const ratio of [.15, .5, .85]) {
    await page.locator("#piano-roll").scrollIntoViewIfNeeded();
    const box = await page.locator("#piano-roll").boundingBox();
    await page.mouse.click(box.x + box.width * .3, box.y + box.height * ratio);
    const current = await draft(page);
    addedPitches.push(current.current.pattern[0].pitch);
    await page.locator("#delete-note").click();
  }
  assert.equal(new Set(addedPitches).size, 3);
  assert(addedPitches.every((pitch) => pitch >= 58 && pitch <= 100));
  console.log("PASS Deleting every high-register note retains the keyboard range and allows distinct pitches");
  assert.deepEqual(errors, []);
  await context.close();

  for (const unavailable of [false, true]) {
    const isolated = await browser.newContext();
    await isolated.addInitScript(({ key, unavailable }) => {
      if (unavailable) {
        Storage.prototype.getItem = Storage.prototype.setItem = () => { throw new Error("Storage blocked"); };
      } else localStorage.setItem(key, "{damaged draft");
    }, { key: DRAFT_KEY, unavailable });
    const check = await isolated.newPage();
    const errors = [];
    check.on("pageerror", (error) => errors.push(error.message));
    await check.goto(origin + "/tools/pattern-mutator/");
    await check.locator("#generate").click();
    assert(await check.locator("#download").isEnabled());
    if (unavailable) assert.match(await check.locator("#draft-status").textContent(), /unavailable/);
    assert.deepEqual(errors, []);
    await isolated.close();
  }
  console.log("PASS Damaged drafts and blocked storage do not prevent generation or MIDI export");
} finally {
  if (browser) await browser.close();
  await new Promise((resolve) => server.close(resolve));
}

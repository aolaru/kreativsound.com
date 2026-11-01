import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";

const source = await readFile(new URL("../apps/preset-mutator-pro/public/engine/license.js", import.meta.url), "utf8");
let fetchImpl;
let clearedTimers = 0;
const context = vm.createContext({
  URLSearchParams, AbortController, TextEncoder, TextDecoder, Uint8Array, Date,
  window: { localStorage: { getItem: () => null, setItem() {}, removeItem() {} } },
  fetch: (...args) => fetchImpl(...args),
  setTimeout: (callback) => setTimeout(callback, 25),
  clearTimeout: (timer) => { clearedTimers++; clearTimeout(timer); }
});
vm.runInContext(source.replace(/export /g, ""), context);
const verify = (key = "test-key") => vm.runInContext(`verifyLicenseToken(${JSON.stringify(key)})`, context);
const purchase = { product_id: "-A9fzCUAIYZ0QZKoRvyOQA==", email: "test@example.invalid" };

fetchImpl = async (url, options) => {
  assert.equal(url, "https://api.gumroad.com/v2/licenses/verify");
  assert.equal(options.method, "POST");
  assert.equal(options.body.get("increment_uses_count"), "false");
  assert.equal(options.body.get("license_key"), "TEST-KEY");
  assert(options.signal instanceof AbortSignal);
  return { ok: true, status: 200, json: async () => ({ success: true, purchase }) };
};
assert.equal((await verify()).valid, true);
for (const flag of ["refunded", "disputed", "chargebacked"]) {
  fetchImpl = async () => ({ ok: true, status: 200, json: async () => ({ success: true, purchase: { ...purchase, [flag]: true } }) });
  assert.equal((await verify()).reason, "gumroad");
}
fetchImpl = async () => ({ ok: true, status: 200, json: async () => ({ success: true, purchase: { product_id: "wrong-product" } }) });
assert.equal((await verify()).reason, "gumroad");
for (const status of [408, 429, 500, 503]) {
  fetchImpl = async () => ({ ok: false, status, json: async () => { throw Error("should not parse a service error"); } });
  assert.equal((await verify()).reason, "network");
}
fetchImpl = async () => { throw Error("offline"); };
assert.equal((await verify()).reason, "network");
fetchImpl = async () => ({ ok: true, status: 200, json: async () => { throw Error("invalid JSON"); } });
assert.equal((await verify()).reason, "network");
fetchImpl = async () => ({ ok: true, status: 200, json: async () => ({}) });
assert.equal((await verify()).reason, "network");
let signal;
fetchImpl = (_url, options) => { signal = options.signal; return new Promise(() => {}); };
assert.equal((await verify()).reason, "network");
assert.equal(signal.aborted, true);
assert(clearedTimers >= 10, "verification must release its timers");

for (const mode of ["app.js", "audio/app.js", "mutate/app.js"]) {
  const app = await readFile(new URL(`../apps/preset-mutator-pro/public/${mode}`, import.meta.url), "utf8");
  const restore = app.match(/async function restoreLicense\(\) \{[\s\S]*?\n\}/)?.[0];
  assert(restore, `missing restore function: ${mode}`);
  assert(!/^await restoreLicense\(\);/m.test(app), `${mode}: activation must not block initialization`);
  for (const result of [{ valid: false, reason: "network" }, { valid: false, reason: "gumroad" }, { valid: true, payload: { product: "preset-mutator-pro" } }]) {
    let deletions = 0;
    const state = {};
    const elements = { paidFeatureUnlockButton: { disabled: false }, paidFeatureUnlockNote: {}, paidFeatureKey: { value: "" } };
    await vm.runInNewContext(`(${restore})()`, {
      state, elements, getStoredLicenseToken: () => "saved-test-key",
      verifyLicenseToken: async () => result, clearLicenseToken: () => deletions++,
      hasLegacyUnlock: () => false, clearLegacyUnlocks() {},
      licenseVerificationMessage: context.licenseVerificationMessage
    });
    assert.equal(deletions, result.reason === "gumroad" ? 1 : 0, mode);
    assert.equal(elements.paidFeatureUnlockButton.disabled, false, mode);
    assert.equal(Object.values(state).includes(true), result.valid, `${mode}: never unlock on a network error`);
    if (result.reason === "network") {
      assert.equal(elements.paidFeatureKey.value, "saved-test-key", mode);
      assert.match(elements.paidFeatureUnlockNote.textContent, /connection/);
    }
  }
}
const storage = new Map();
let onlineCalls = 0;
const offlineWindow = { navigator: { onLine: true }, localStorage: {
  getItem: (key) => storage.get(key) ?? null,
  setItem: (key, value) => storage.set(key, value),
  removeItem: (key) => storage.delete(key),
} };
let onlineResult = { success: true, purchase };
let serviceFails = false;
const previousFetch = globalThis.fetch;
globalThis.window = offlineWindow;
globalThis.fetch = async () => {
    onlineCalls++;
    if (serviceFails) throw Error("offline");
    return { ok: true, status: 200, json: async () => onlineResult };
};
const { verifyLicenseToken: verifyOffline } = await import("../apps/preset-mutator-pro/public/engine/offline-license.js");
const graceVerify = (key = "verified-key") => verifyOffline(key);
assert.equal((await graceVerify()).valid, true);
offlineWindow.navigator.onLine = false;
serviceFails = true;
const callsBeforeOffline = onlineCalls;
assert.equal((await graceVerify()).offline, true, "previously verified key should work offline");
assert.equal(onlineCalls, callsBeforeOffline, "offline restoration should not wait for a timeout");
assert.equal((await graceVerify("unknown-key")).valid, false, "first activation must require verification");
const receiptKey = "preset-mutator-pro-verified-license";
const validReceipt = storage.get(receiptKey);
storage.set(receiptKey, JSON.stringify({ ...JSON.parse(validReceipt), verifiedAt: Date.now() - 31 * 24 * 60 * 60 * 1000 }));
assert.equal((await graceVerify()).valid, false, "offline grace must expire");
storage.set(receiptKey, validReceipt);
offlineWindow.navigator.onLine = true;
serviceFails = false;
onlineResult = { success: true, purchase: { ...purchase, refunded: true } };
assert.equal((await graceVerify()).valid, false, "refund must revoke cached access");
serviceFails = true;
assert.equal((await graceVerify()).valid, false, "revoked access cannot return offline");
globalThis.fetch = previousFetch;
delete globalThis.window;
console.log("Pro activation checks passed, including verified offline grace, expiration, and revocation.");

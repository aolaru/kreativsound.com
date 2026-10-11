import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const root = new URL("../", import.meta.url);
const read = (file) => fs.readFileSync(new URL(file, root), "utf8");
const analytics = read("public/kreativ-analytics.js");
const siteConsent = read("public/site.js").split('const consentPanel = document.querySelector("[data-privacy-consent]");')[1]
  .split('document.querySelectorAll("[data-track]")')[0];

function browser({ consent = null, idle = true, cookieOnly = false, sitePanel = true } = {}) {
  const values = new Map(consent ? [["kreativ-analytics-consent", consent]] : []);
  const callbacks = new Map();
  const listeners = new Map();
  const inserted = [];
  const elements = new Map();
  let cookie = cookieOnly && consent ? `kreativ-analytics-consent=${consent}` : "";
  let reloads = 0;
  let nextId = 1;

  function element() {
    const handlers = new Map();
    const children = new Map();
    return {
      dataset: {}, hidden: true,
      addEventListener: (name, fn) => handlers.set(name, fn),
      click: () => handlers.get("click")?.(),
      focus() {}, setAttribute() {},
      remove() { if (this.id) elements.delete(this.id); },
      querySelector: (selector) => {
        if (!children.has(selector)) children.set(selector, element());
        return children.get(selector);
      }
    };
  }
  const panel = element();
  const document = {
    readyState: "complete",
    get cookie() { return cookie; },
    set cookie(value) { cookie = value.split(";")[0]; },
    createElement: element,
    getElementById: (id) => elements.get(id),
    querySelector: (selector) => selector === "[data-privacy-consent]" && sitePanel ? panel : null,
    querySelectorAll: () => [],
    addEventListener() {},
    head: { appendChild(node) { inserted.push(node); if (node.id) elements.set(node.id, node); } },
    body: { appendChild(node) { inserted.push(node); } }
  };
  const window = {
    location: { protocol: "https:", reload: () => reloads++ },
    setTimeout: (callback) => { const id = nextId++; callbacks.set(id, callback); return id; },
    clearTimeout: (id) => callbacks.delete(id),
    addEventListener: (name, callback) => listeners.set(name, callback)
  };
  if (idle) {
    window.requestIdleCallback = window.setTimeout;
    window.cancelIdleCallback = window.clearTimeout;
  }
  const localStorage = {
    getItem(key) { if (cookieOnly) throw new Error("Storage unavailable"); return values.get(key) ?? null; },
    setItem(key, value) { if (cookieOnly) throw new Error("Storage unavailable"); values.set(key, value); }
  };
  const context = vm.createContext({ window, document, localStorage, Element: class {}, URL });
  vm.runInContext(analytics, context);
  if (sitePanel) vm.runInContext('const consentPanel = document.querySelector("[data-privacy-consent]");' + siteConsent, context);
  return {
    window, values, callbacks, inserted, panel,
    scripts: () => inserted.filter((node) => node.src),
    reloads: () => reloads,
    flush() { const pending = [...callbacks.values()]; callbacks.clear(); pending.forEach((callback) => callback()); },
    choose(value) {
      const activePanel = sitePanel ? panel : inserted.findLast((node) => node.className === "analytics-consent");
      activePanel.querySelector(`[data-analytics-${value === "accepted" ? "accept" : "decline"}]`).click();
    },
    storage(value) {
      if (value === null) values.clear();
      else values.set("kreativ-analytics-consent", value);
      listeners.get("storage")({ key: value === null ? null : "kreativ-analytics-consent", newValue: value });
    },
    cookie(value) { cookie = `kreativ-analytics-consent=${value}`; },
    emit(name) { listeners.get(name)?.(); }
  };
}

for (const idle of [true, false]) {
  for (const cookieOnly of [false, true]) {
    for (const sitePanel of [true, false]) {
      const label = `idle=${idle}, cookieOnly=${cookieOnly}, sitePanel=${sitePanel}`;
      const before = browser({ idle, cookieOnly, sitePanel });
      before.window.__trackKreativEvent("before_consent");
      before.window.__loadKreativAnalytics();
      assert.equal(before.callbacks.size, 0, `${label}: no load without consent`);
      before.choose("accepted");
      before.window.__loadKreativAnalytics();
      assert.equal(before.callbacks.size, 1, `${label}: deduplicate scheduled loads`);
      const racedCallback = [...before.callbacks.values()][0];
      before.window.__trackKreativEvent("cancelled_event");
      before.choose("declined");
      assert.equal(before.callbacks.size, 0, `${label}: cancel queued load`);
      racedCallback();
      assert.equal(before.scripts().length, 0, `${label}: recheck consent in a racing callback`);
      assert.equal(before.reloads(), 0, `${label}: no reload before providers load`);
      before.choose("accepted");
      before.flush();
      assert.equal(before.scripts().length, 2, `${label}: load providers after acceptance`);
      assert(!before.window.dataLayer.some((entry) => entry[1] === "cancelled_event"), `${label}: discard withdrawn events`);
      assert(!before.window.dataLayer.some((entry) => entry[1] === "before_consent"), `${label}: never replay pre-consent events`);
      before.window.__trackKreativEvent("allowed_event");
      assert(before.window.dataLayer.some((entry) => entry[1] === "allowed_event"));
      before.choose("declined");
      assert.equal(before.window["ga-disable-G-QRTJS1KZD9"], true, `${label}: immediately disable Google collection`);
      assert.equal(before.reloads(), 1, `${label}: unload provider listeners by reloading`);
      before.window.__trackKreativEvent("after_decline");
      before.window.gtag("event", "legacy_after_decline");
      assert.equal(before.window.dataLayer.length, 0, `${label}: block helper and legacy events after decline`);
    }
  }
}

for (const consent of [null, "declined"]) {
  const declined = browser({ consent });
  declined.window.__trackKreativEvent("blocked");
  declined.flush();
  assert.equal(declined.scripts().length, 0);
}
for (const value of ["declined", null]) {
  const otherTab = browser({ consent: "accepted" });
  otherTab.flush();
  otherTab.storage(value);
  assert.equal(otherTab.reloads(), 1, "Withdrawal/clearing consent in another tab stops loaded trackers");
}
for (const event of ["focus", "pageshow"]) {
  const cookieTab = browser({ consent: "accepted", cookieOnly: true });
  cookieTab.flush();
  cookieTab.cookie("declined");
  cookieTab.emit(event);
  assert.equal(cookieTab.reloads(), 1, "Recheck cookie-only consent and restored pages");
}

for (const app of ["preset-mutator", "preset-mutator-pro"]) {
  for (const mode of ["", "audio/", "mutate/"]) {
    const source = read(`apps/${app}/public/${mode}app.js`);
    assert(!source.includes('window.gtag("event"'), `${app}/${mode}: events must use the consent-aware helper`);
    assert(source.includes("window.__trackKreativEvent?."));
  }
}
console.log("Analytics consent checks passed: both panels, idle/timer races, cookie fallback, withdrawal, cross-tab changes, and tool events.");

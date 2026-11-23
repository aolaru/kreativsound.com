import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const source = fs.readFileSync("public/site.js", "utf8");
const searchCode = source.slice(source.indexOf("const siteSearchForm"), source.indexOf('document.querySelectorAll(".news-panel")'));
const entries = JSON.parse(fs.readFileSync("dist/search-index.json", "utf8"));

function setup(fetch) {
  class Element {
    constructor() { this.listeners = {}; this.attributes = {}; this.children = []; this.dataset = {}; this.value = ""; this.hidden = false; }
    addEventListener(name, fn) { this.listeners[name] = fn; }
    setAttribute(name, value) { this.attributes[name] = value; }
    removeAttribute(name) { delete this.attributes[name]; }
    appendChild(child) { this.children.push(child); return child; }
    replaceChildren(...children) { this.children = children; }
    querySelectorAll() { return []; }
    contains(element) { return element === input || element === this; }
    set innerHTML(value) { this.html = value; if (!value) this.children = []; }
    get innerHTML() { return this.html || ""; }
  }
  const input = new Element();
  const form = new Element();
  form.querySelector = (selector) => selector === ".site-search-input" ? input : form.children.find((child) => child.className === "site-search-results");
  const document = { querySelector: () => form, createElement: () => new Element(), addEventListener() {}, activeElement: input };
  const context = vm.createContext({ document, fetch, setTimeout, console });
  vm.runInContext(searchCode, context);
  return { input, form, context };
}

const data = () => ({ ok: true, json: async () => entries });
const ranked = setup(async () => data());
const results = await vm.runInContext('getRankedResults("vital")', ranked.context);
assert.deepEqual(Array.from(results.slice(0, 2), (entry) => entry.title), ["VELVET RUINS 2", "VELVET RUINS Lite"]);

let resolveFetch;
const delayed = setup(() => new Promise((resolve) => { resolveFetch = resolve; }));
delayed.input.value = "vital";
const pending = delayed.input.listeners.input();
delayed.input.value = "";
await delayed.input.listeners.input();
resolveFetch(data());
await pending;
assert.equal(delayed.form.children.length, 0, "A cleared query must not reopen stale results");

let attempts = 0;
const retry = setup(async () => { if (++attempts === 1) throw new Error("offline"); return data(); });
retry.input.value = "vital";
await retry.input.listeners.input();
assert.match(retry.form.children[0].children[0].textContent, /temporarily unavailable/i);
retry.input.value = "vital ";
await retry.input.listeners.input();
assert.equal(attempts, 2, "A failed request should be retried");
assert.match(retry.form.children[0].children[0].innerHTML, /VELVET RUINS 2/);
console.log("Search behavior passed: product ranking, stale requests, and retry after failure.");

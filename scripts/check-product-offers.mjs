import assert from "node:assert/strict";
import fs from "node:fs";
import { getTimedOffer, timedOffers } from "../src/lib/plugin-offers.ts";
import { refreshTimedOffers } from "../src/lib/refresh-timed-offers.ts";

const workflow = fs.readFileSync(new URL("../.github/workflows/deploy-pages.yml", import.meta.url), "utf8");
const schedules = [...workflow.matchAll(/cron:\s*'([^']+)'/g)].map((match) => match[1].split(/\s+/));

for (const [slug, definition] of Object.entries(timedOffers)) {
  const expiry = Date.parse(definition.expiresAt);
  const expiryDate = new Date(expiry);
  const schedule = schedules.find(([, , day, month]) => Number(day) === expiryDate.getUTCDate() && Number(month) === expiryDate.getUTCMonth() + 1);
  assert(schedule, `${slug}: missing expiry-date deployment schedule`);
  const scheduledTime = Date.UTC(expiryDate.getUTCFullYear(), Number(schedule[3]) - 1, Number(schedule[2]), Number(schedule[1]), Number(schedule[0]));
  assert(scheduledTime >= expiry && scheduledTime - expiry < 3600000, `${slug}: deploy shortly after, not before, expiry`);
  for (const time of [expiry - 1, expiry, expiry + 1]) {
    const now = new Date(time);
    const expected = getTimedOffer(slug, now);
    const price = { dataset: { timedOffer: slug, offerKind: "price" }, textContent: definition.introductoryPrice };
    const note = { dataset: { timedOffer: slug, offerKind: "note", offerPrefix: "Before: ", offerSuffix: " :after" }, textContent: definition.introductoryNote };
    const unrelated = { dataset: { timedOffer: "unrelated" }, textContent: "Historical launch price" };
    const schema = {
      dataset: { timedOfferSchema: slug },
      textContent: JSON.stringify({ "@type": "Product", offers: [
        { price: String(definition.introductoryAmount), priceCurrency: "EUR", priceValidUntil: definition.priceValidUntil, url: "https://kreativ.gumroad.com/l/example" },
        { price: String(definition.introductoryAmount), priceValidUntil: definition.priceValidUntil }
      ] })
    };
    const malformed = { dataset: { timedOfferSchema: slug }, textContent: "invalid JSON" };
    const root = { querySelectorAll(selector) {
      return selector === "[data-timed-offer]" ? [price, note, unrelated] : [schema, malformed];
    } };
    const next = refreshTimedOffers(root, now);
    assert.equal(price.textContent, expected.price, `${slug}: cached price at ${now.toISOString()}`);
    assert.equal(note.textContent, `Before: ${expected.note} :after`, `${slug}: preserve surrounding CTA copy`);
    assert.equal(unrelated.textContent, "Historical launch price");
    assert.equal(malformed.textContent, "invalid JSON");
    for (const offer of JSON.parse(schema.textContent).offers) {
      assert.equal(offer.price, String(expected.priceAmount), `${slug}: update all structured-data offers`);
      assert.equal(offer.priceCurrency, "EUR");
      assert.equal(offer.priceValidUntil, expected.priceValidUntil, `${slug}: remove expired priceValidUntil`);
    }
    if (next !== undefined) assert(next > time, "Only schedule upcoming expiries");
    refreshTimedOffers(root, now);
    assert.equal(note.textContent, `Before: ${expected.note} :after`, "Repeated refreshes must not duplicate copy");
  }
}
console.log("Product offer checks passed: exact expiry boundaries, cached-page text, CTA copy, structured data, and historical content.");

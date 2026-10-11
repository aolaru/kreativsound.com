import { getTimedOffer, timedOffers, type TimedOfferSlug } from "./plugin-offers.ts";

// A cached static page must not retain an expired offer while a rebuild is pending.
// Dated announcements deliberately have no markers and remain historical records.
export function refreshTimedOffers(root: Pick<Document, "querySelectorAll">, now = new Date()) {
  root.querySelectorAll<HTMLElement>("[data-timed-offer]").forEach((element) => {
    const slug = element.dataset.timedOffer as TimedOfferSlug;
    if (!Object.hasOwn(timedOffers, slug)) return;
    const offer = getTimedOffer(slug, now);
    const text = element.dataset.offerKind === "note" ? offer.note : offer.price;
    element.textContent = `${element.dataset.offerPrefix || ""}${text}${element.dataset.offerSuffix || ""}`;
  });
  root.querySelectorAll<HTMLScriptElement>("script[data-timed-offer-schema]").forEach((element) => {
    const slug = element.dataset.timedOfferSchema as TimedOfferSlug;
    if (!Object.hasOwn(timedOffers, slug)) return;
    const offer = getTimedOffer(slug, now);
    try {
      const schema = JSON.parse(element.textContent || "{}");
      if (schema["@type"] !== "Product" || !Array.isArray(schema.offers)) return;
      schema.offers.forEach((entry: Record<string, unknown>) => {
        entry.price = String(offer.priceAmount);
        entry.priceCurrency = offer.priceCurrency;
        if (offer.priceValidUntil) entry.priceValidUntil = offer.priceValidUntil;
        else delete entry.priceValidUntil;
      });
      element.textContent = JSON.stringify(schema);
    } catch {
      // Leave unrelated/malformed structured data alone.
    }
  });
  return Object.values(timedOffers).map((offer) => Date.parse(offer.expiresAt))
    .filter((expiry) => expiry > now.getTime()).sort((a, b) => a - b)[0];
}

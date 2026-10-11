export const timedOffers = {
  burnshaper: {
    expiresAt: "2026-11-09T05:55:00Z",
    priceValidUntil: "2026-11-08",
    introductoryAmount: 9,
    regularAmount: 19,
    introductoryPrice: "9 EUR introductory",
    introductoryNote: "€9 introductory price through November 8, 2026; €19 from November 9. The discount is applied automatically on Gumroad.",
    regularNote: "€19 on Gumroad. The introductory offer has ended."
  },
  "kreativ-kollection-v1": {
    expiresAt: "2027-02-20T00:00:00Z",
    priceValidUntil: "2027-02-19",
    introductoryAmount: 49,
    regularAmount: 69,
    introductoryPrice: "49 EUR",
    introductoryNote: "€49 introductory price through February 19, 2027; €69 afterward.",
    regularNote: "€69 on Gumroad. The introductory offer has ended."
  }
};

export type TimedOfferSlug = keyof typeof timedOffers;

export function getTimedOffer(slug: TimedOfferSlug, now = new Date()) {
  const definition = timedOffers[slug];
  const introductory = now.getTime() < Date.parse(definition.expiresAt);
  return {
    price: introductory ? definition.introductoryPrice : `${definition.regularAmount} EUR`,
    priceAmount: introductory ? definition.introductoryAmount : definition.regularAmount,
    priceCurrency: "EUR",
    priceValidUntil: introductory ? definition.priceValidUntil : undefined,
    note: introductory ? definition.introductoryNote : definition.regularNote
  };
}

// Matches the automatically applied introductory offer on Gumroad.
export function getBurnshaperOffer(now = new Date()) {
  return getTimedOffer("burnshaper", now);
}
export const burnshaperOffer = getBurnshaperOffer();

// The bundle introduction runs through February 19, 2027 (UTC).
export function getKollectionOffer(now = new Date()) {
  return getTimedOffer("kreativ-kollection-v1", now);
}

export const kollectionOffer = getKollectionOffer();

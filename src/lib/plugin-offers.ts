// Matches the automatically applied introductory offer on Gumroad.
export function getBurnshaperOffer(now = new Date()) {
  const introductory = now.getTime() < Date.parse("2026-11-09T05:55:00Z");
  return {
    price: introductory ? "9 EUR introductory" : "19 EUR",
    priceAmount: introductory ? 9 : 19,
    priceCurrency: "EUR",
    priceValidUntil: introductory ? "2026-11-08" : undefined,
    note: introductory
      ? "€9 introductory price through November 8, 2026; €19 from November 9. The discount is applied automatically on Gumroad."
      : "€19 on Gumroad. The introductory offer has ended."
  };
}

export const burnshaperOffer = getBurnshaperOffer();

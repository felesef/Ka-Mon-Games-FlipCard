export function mapCardsToUrls(cards) {
  return cards
    .map((c) => (typeof c === "string" ? c : c.imgURL || c.url))
    .filter(Boolean);
}

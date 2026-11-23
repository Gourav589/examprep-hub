const num = (v, fallback) => {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? Math.round(n) : fallback;
};

// Price aur offer .env se aate hain. Offer tabhi chalu hai jab end date aage ki ho.
exports.getPricing = (now = Date.now()) => {
  const listPrice = num(process.env.LIST_PRICE_INR, 399);
  const offerPrice = num(process.env.OFFER_PRICE_INR, 199);
  const endsMs = Date.parse(process.env.OFFER_ENDS_AT || "");
  const offerActive =
    Number.isFinite(endsMs) && now < endsMs && offerPrice < listPrice;

  return {
    days: 30,
    listPrice,
    offerPrice,
    price: offerActive ? offerPrice : listPrice,
    offerActive,
    endsAt: offerActive ? new Date(endsMs).toISOString() : null,
    savePercent: offerActive
      ? Math.round(((listPrice - offerPrice) / listPrice) * 100)
      : 0,
    serverNow: now,
  };
};
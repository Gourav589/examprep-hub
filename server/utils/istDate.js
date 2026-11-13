const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

// Aaj ki tareekh India ke hisaab se, jaise "2026-11-12"
exports.todayKey = () =>
  new Date(Date.now() + IST_OFFSET_MS).toISOString().slice(0, 10);

// Tareekh ko din ke number mein badalta hai (streak gin'ne ke liye)
exports.dayNumber = (key) => {
  const [y, m, d] = key.split("-").map(Number);
  return Math.floor(Date.UTC(y, m - 1, d) / 86400000);
};
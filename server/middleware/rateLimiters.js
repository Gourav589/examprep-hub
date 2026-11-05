const rateLimit = require("express-rate-limit");

// Poori API par: ek IP se 15 minute mein 300 requests
exports.apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Bahut zyada requests. Thodi der baad try karo." },
});

// Login aur signup par: 15 minute mein 10 koshish (sahi login ginti mein nahi aate)
exports.authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Bahut zyada koshish ho gayi. 15 minute baad dobara try karo." },
});

// Payment par: ek ghante mein 20 requests
exports.paymentLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Payment ki bahut zyada koshish. Thodi der baad try karo." },
});

// Reset link par: ek ghante mein 5 requests (har baar ginti hoti hai)
exports.resetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Bahut zyada reset requests. Ek ghante baad try karo." },
});
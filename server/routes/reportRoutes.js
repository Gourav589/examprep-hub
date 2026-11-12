const express = require("express");
const rateLimit = require("express-rate-limit");
const {
  createReport,
  adminList,
  resolveReport,
} = require("../controllers/reportController");
const protect = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");

const router = express.Router();

// Ek ghante mein 20 reports tak
const reportLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Bahut zyada reports. Thodi der baad try karo." },
});

router.post("/", protect, reportLimiter, createReport);
router.get("/admin", protect, adminOnly, adminList);
router.patch("/:id/resolve", protect, adminOnly, resolveReport);

module.exports = router;
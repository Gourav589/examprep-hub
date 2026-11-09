const express = require("express");
const rateLimit = require("express-rate-limit");
const {
  getReviews,
  saveReview,
  deleteMyReview,
  adminDeleteReview,
} = require("../controllers/reviewController");
const protect = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");
const optionalAuth = require("../middleware/optionalAuth");

const router = express.Router();

// Review likhne ya hatane par ek ghante mein 15 requests
const writeLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Bahut zyada koshish. Thodi der baad try karo." },
});

router.get("/", optionalAuth, getReviews);
router.put("/", protect, writeLimiter, saveReview);
router.delete("/mine", protect, writeLimiter, deleteMyReview);
router.delete("/:id", protect, adminOnly, adminDeleteReview);

module.exports = router;
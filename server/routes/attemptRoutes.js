const express = require("express");
const {
  getMyAttempts,
  getLeaderboard,
} = require("../controllers/attemptController");
const protect = require("../middleware/authMiddleware");
const optionalAuth = require("../middleware/optionalAuth");

const router = express.Router();

router.get("/my", protect, getMyAttempts);
router.get("/leaderboard/:examId", optionalAuth, getLeaderboard);

module.exports = router;
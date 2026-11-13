const express = require("express");
const { getToday, getStreak, submit } = require("../controllers/dailyController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/today", protect, getToday);
router.get("/streak", protect, getStreak);
router.post("/submit", protect, submit);

module.exports = router;
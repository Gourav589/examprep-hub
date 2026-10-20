const express = require("express");
const { getMyAttempts } = require("../controllers/attemptController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/my", protect, getMyAttempts);

module.exports = router;
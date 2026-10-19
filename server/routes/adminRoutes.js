const express = require("express");
const { getStudents, togglePremium } = require("../controllers/adminController");
const protect = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");

const router = express.Router();

router.get("/students", protect, adminOnly, getStudents);
router.patch("/students/:id/premium", protect, adminOnly, togglePremium);

module.exports = router;
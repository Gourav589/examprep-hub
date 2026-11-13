const express = require("express");
const {
  getSummary,
  getMistakes,
  getPractice,
  submitPractice,
  removeMistake,
} = require("../controllers/mistakeController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/summary", protect, getSummary);
router.get("/practice", protect, getPractice);
router.post("/practice/submit", protect, submitPractice);
router.get("/", protect, getMistakes);
router.delete("/:id", protect, removeMistake);

module.exports = router;
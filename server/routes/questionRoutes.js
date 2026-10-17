const express = require("express");
const protect = require("../middleware/authMiddleware");
const {
  getQuestionsByExam,
  submitTest,
} = require("../controllers/questionController");

const router = express.Router();

router.get("/exam/:examId", getQuestionsByExam);
router.post("/exam/:examId/submit", protect, submitTest);

module.exports = router;
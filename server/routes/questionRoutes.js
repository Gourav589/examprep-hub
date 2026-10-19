const express = require("express");
const {
  getQuestionsByExam,
  submitTest,
  getQuestionsForAdmin,
  createQuestion,
  deleteQuestion,
} = require("../controllers/questionController");
const protect = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");
const optionalAuth = require("../middleware/optionalAuth");
const router = express.Router();

router.get("/exam/:examId", optionalAuth, getQuestionsByExam);
router.post("/exam/:examId/submit", protect, submitTest);

router.get("/admin/exam/:examId", protect, adminOnly, getQuestionsForAdmin);
router.post("/", protect, adminOnly, createQuestion);
router.delete("/:id", protect, adminOnly, deleteQuestion);

module.exports = router;
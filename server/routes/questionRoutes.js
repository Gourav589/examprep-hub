const express = require("express");
const {
  getQuestionsByExam,
  getTestsForExam,
  submitTest,
  getQuestionsForAdmin,
  createQuestion,
  updateQuestion,
  bulkCreateQuestions,
  deleteQuestion,
} = require("../controllers/questionController");
const protect = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");
const optionalAuth = require("../middleware/optionalAuth");

const router = express.Router();

router.get("/exam/:examId/tests", getTestsForExam);
router.get("/exam/:examId", optionalAuth, getQuestionsByExam);
router.post("/exam/:examId/submit", protect, submitTest);

router.get("/admin/exam/:examId", protect, adminOnly, getQuestionsForAdmin);
router.post("/bulk", protect, adminOnly, bulkCreateQuestions);
router.post("/", protect, adminOnly, createQuestion);
router.put("/:id", protect, adminOnly, updateQuestion);
router.delete("/:id", protect, adminOnly, deleteQuestion);

module.exports = router;
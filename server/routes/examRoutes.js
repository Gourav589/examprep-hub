const express = require("express");
const {
  getExams,
  getExamById,
  createExam,
  deleteExam,
} = require("../controllers/examController");
const protect = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");

const router = express.Router();

router.get("/", getExams);
router.get("/:id", getExamById);

router.post("/", protect, adminOnly, createExam);
router.delete("/:id", protect, adminOnly, deleteExam);

module.exports = router;
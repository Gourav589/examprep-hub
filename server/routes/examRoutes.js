const express = require("express");
const { getExams, getExamById } = require("../controllers/examController");

const router = express.Router();

router.get("/", getExams);
router.get("/:id", getExamById);

module.exports = router;
const mongoose = require("mongoose");
const Question = require("../models/Question");
const Attempt = require("../models/Attempt");
exports.getQuestionsByExam = async (req, res) => {
  try {
    const { examId } = req.params;
    const testNumber = Number(req.query.test) || 1;

    if (!mongoose.Types.ObjectId.isValid(examId)) {
      return res.status(400).json({ message: "Invalid exam id" });
    }

    const questions = await Question.find({ exam: examId, testNumber }).select(
      "-correctIndex"
    );
    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.submitTest = async (req, res) => {
  try {
    const { examId } = req.params;
    const { testNumber = 1, answers = {} } = req.body;

    if (!mongoose.Types.ObjectId.isValid(examId)) {
      return res.status(400).json({ message: "Invalid exam id" });
    }

    const questions = await Question.find({ exam: examId, testNumber });

    let correct = 0;
    let wrong = 0;
    let skipped = 0;
    const sections = {};

    const review = questions.map((q) => {
      const picked = answers[q._id];
      if (!sections[q.section]) {
        sections[q.section] = { correct: 0, total: 0 };
      }
      sections[q.section].total += 1;

      if (picked === undefined) {
        skipped += 1;
      } else if (picked === q.correctIndex) {
        correct += 1;
        sections[q.section].correct += 1;
      } else {
        wrong += 1;
      }

      return {
        question: q.question,
        options: q.options,
        picked: picked === undefined ? null : picked,
        correctIndex: q.correctIndex,
      };
    });
await Attempt.create({
  user: req.userId,
  exam: examId,
  testNumber,
  total: questions.length,
  correct,
  wrong,
  skipped,
  score: correct,
  sections,
});
    res.json({
      total: questions.length,
      correct,
      wrong,
      skipped,
      score: correct,
      sections,
      review,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
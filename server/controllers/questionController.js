const mongoose = require("mongoose");
const Question = require("../models/Question");
const Attempt = require("../models/Attempt");
const Exam = require("../models/Exam");
const User = require("../models/User");

// Premium exam ko kaun khol sakta hai, yeh check karta hai
const canAccess = async (examId, userId) => {
  const exam = await Exam.findById(examId);
  if (!exam) return { ok: false, status: 404, message: "Exam not found" };
  if (exam.free) return { ok: true };

  if (!userId) {
    return { ok: false, status: 401, message: "Please login to access premium exams" };
  }

  const user = await User.findById(userId);
  if (user && (user.isPremium || user.role === "admin")) return { ok: true };

  return { ok: false, status: 403, message: "Premium membership required" };
};

exports.getQuestionsByExam = async (req, res) => {
  try {
    const { examId } = req.params;
    const testNumber = Number(req.query.test) || 1;

    if (!mongoose.Types.ObjectId.isValid(examId)) {
      return res.status(400).json({ message: "Invalid exam id" });
    }

    const access = await canAccess(examId, req.userId);
    if (!access.ok) {
      return res.status(access.status).json({ message: access.message });
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

    const access = await canAccess(examId, req.userId);
    if (!access.ok) {
      return res.status(access.status).json({ message: access.message });
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

exports.getQuestionsForAdmin = async (req, res) => {
  try {
    const { examId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(examId)) {
      return res.status(400).json({ message: "Invalid exam id" });
    }
    const questions = await Question.find({ exam: examId }).sort({
      testNumber: 1,
      createdAt: 1,
    });
    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createQuestion = async (req, res) => {
  try {
    const { exam, testNumber, section, question, options, correctIndex } = req.body;

    if (!mongoose.Types.ObjectId.isValid(exam)) {
      return res.status(400).json({ message: "Invalid exam id" });
    }
    const examExists = await Exam.findById(exam);
    if (!examExists) {
      return res.status(404).json({ message: "Exam not found" });
    }
    if (!question || !question.trim()) {
      return res.status(400).json({ message: "Question text is required" });
    }
    if (!Array.isArray(options) || options.length !== 4 || options.some((o) => !o.trim())) {
      return res.status(400).json({ message: "Exactly 4 options are required" });
    }
    const correct = Number(correctIndex);
    if (![0, 1, 2, 3].includes(correct)) {
      return res.status(400).json({ message: "Correct option must be 1 to 4" });
    }

    const created = await Question.create({
      exam,
      testNumber: Number(testNumber) || 1,
      section: section || "General",
      question: question.trim(),
      options: options.map((o) => o.trim()),
      correctIndex: correct,
    });
    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteQuestion = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid question id" });
    }
    const deleted = await Question.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Question not found" });
    }
    res.json({ message: "Question deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
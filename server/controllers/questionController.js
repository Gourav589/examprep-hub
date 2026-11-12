const mongoose = require("mongoose");
const Question = require("../models/Question");
const Attempt = require("../models/Attempt");
const Exam = require("../models/Exam");
const User = require("../models/User");
const QuestionReport = require("../models/QuestionReport");

const isPremiumActive = (user) =>
  user.isPremium && (!user.premiumUntil || user.premiumUntil > new Date());

// Kaun is exam ka kaunsa test khol sakta hai
const canAccess = async (examId, userId, testNumber) => {
  const exam = await Exam.findById(examId);
  if (!exam) return { ok: false, status: 404, message: "Exam not found" };

  const freeTests = typeof exam.freeTests === "number" ? exam.freeTests : 1;
  if (testNumber <= freeTests) return { ok: true };

  if (!userId) {
    return { ok: false, status: 401, message: "Please login to access premium tests" };
  }

  const user = await User.findById(userId);
  if (user && (isPremiumActive(user) || user.role === "admin")) return { ok: true };

  return { ok: false, status: 403, message: "Premium membership required" };
};

exports.getTestsForExam = async (req, res) => {
  try {
    const { examId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(examId)) {
      return res.status(400).json({ message: "Invalid exam id" });
    }

    const rows = await Question.aggregate([
      { $match: { exam: new mongoose.Types.ObjectId(examId) } },
      { $group: { _id: "$testNumber", questions: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    res.json(rows.map((r) => ({ testNumber: r._id, questions: r.questions })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getQuestionsByExam = async (req, res) => {
  try {
    const { examId } = req.params;
    const testNumber = Number(req.query.test) || 1;

    if (!mongoose.Types.ObjectId.isValid(examId)) {
      return res.status(400).json({ message: "Invalid exam id" });
    }

    const access = await canAccess(examId, req.userId, testNumber);
    if (!access.ok) {
      return res.status(access.status).json({ message: access.message });
    }

    // Sahi jawab aur explanation test ke dauran browser ko nahi bhejte
    const questions = await Question.find({ exam: examId, testNumber }).select(
      "-correctIndex -explanation"
    );
    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.submitTest = async (req, res) => {
  try {
    const { examId } = req.params;
    const testNumber = Number(req.body.testNumber) || 1;
    const answers = req.body.answers && typeof req.body.answers === "object" ? req.body.answers : {};

    if (!mongoose.Types.ObjectId.isValid(examId)) {
      return res.status(400).json({ message: "Invalid exam id" });
    }

    const access = await canAccess(examId, req.userId, testNumber);
    if (!access.ok) {
      return res.status(access.status).json({ message: access.message });
    }

    const questions = await Question.find({ exam: examId, testNumber });
    if (questions.length === 0) {
      return res.status(400).json({ message: "Is test mein koi question nahi hai" });
    }

    const exam = await Exam.findById(examId);
    const negativeMarking = exam ? exam.negativeMarking || 0 : 0;

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
        questionId: q._id,
        question: q.question,
        options: q.options,
        picked: picked === undefined ? null : picked,
        correctIndex: q.correctIndex,
        explanation: q.explanation || "",
      };
    });

    const marks = Math.max(0, Math.round((correct - wrong * negativeMarking) * 100) / 100);

    await Attempt.create({
      user: req.userId,
      exam: examId,
      testNumber,
      total: questions.length,
      correct,
      wrong,
      skipped,
      score: marks,
      sections,
    });

    res.json({
      total: questions.length,
      correct,
      wrong,
      skipped,
      score: marks,
      marks,
      negativeMarking,
      testNumber,
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
    const { exam, testNumber, section, question, options, correctIndex, explanation } = req.body;

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
      explanation: String(explanation ?? "").trim().slice(0, 1000),
    });
    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateQuestion = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid question id" });
    }

    const q = await Question.findById(req.params.id);
    if (!q) {
      return res.status(404).json({ message: "Question not found" });
    }

    const { question, options, correctIndex, section, testNumber, explanation } = req.body;

    if (question !== undefined) {
      const text = String(question).trim();
      if (!text || text.length > 1000) {
        return res.status(400).json({ message: "Question khaali ya bahut lamba hai" });
      }
      q.question = text;
    }

    if (options !== undefined) {
      if (
        !Array.isArray(options) ||
        options.length !== 4 ||
        options.some((o) => typeof o !== "string" || !o.trim() || o.length > 300)
      ) {
        return res.status(400).json({ message: "Chaaron options zaroori hain" });
      }
      q.options = options.map((o) => o.trim());
    }

    if (correctIndex !== undefined) {
      const c = Number(correctIndex);
      if (![0, 1, 2, 3].includes(c)) {
        return res.status(400).json({ message: "Sahi option 1 se 4 ke beech chuno" });
      }
      q.correctIndex = c;
    }

    if (section !== undefined) {
      q.section = String(section).trim().slice(0, 60) || "General";
    }

    if (testNumber !== undefined) {
      const t = Number(testNumber);
      if (!Number.isInteger(t) || t < 1 || t > 1000) {
        return res.status(400).json({ message: "testNumber sahi nahi hai" });
      }
      q.testNumber = t;
    }

    if (explanation !== undefined) {
      q.explanation = String(explanation).trim().slice(0, 1000);
    }

    await q.save();

    // Question theek ho gaya, to is par aayi open reports band
    await QuestionReport.updateMany(
      { question: q._id, status: "open" },
      { status: "resolved" }
    );

    res.json(q);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.bulkCreateQuestions = async (req, res) => {
  try {
    const { exam, defaultTest, questions } = req.body;

    if (!mongoose.Types.ObjectId.isValid(exam)) {
      return res.status(400).json({ message: "Invalid exam id" });
    }
    const examDoc = await Exam.findById(exam);
    if (!examDoc) {
      return res.status(404).json({ message: "Exam not found" });
    }
    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ message: "Koi question nahi mila" });
    }
    if (questions.length > 500) {
      return res.status(400).json({ message: "Ek baar mein maximum 500 questions" });
    }

    const defTest = Math.max(1, Number(defaultTest) || 1);
    const good = [];
    const failed = [];

    questions.forEach((row, i) => {
      const line = i + 2;
      const text = String(row.question ?? "").trim();
      const options = [row.option1, row.option2, row.option3, row.option4].map((o) =>
        String(o ?? "").trim()
      );
      const correct = Number(row.correct);
      const rawTest = String(row.testNumber ?? "").trim();
      const test = rawTest === "" ? defTest : Number(rawTest);
      const explanation = String(row.explanation ?? "").trim();

      if (!text) return failed.push({ line, reason: "Question khaali hai" });
      if (text.length > 1000) return failed.push({ line, reason: "Question bahut lamba hai" });
      if (options.some((o) => !o)) return failed.push({ line, reason: "Chaaron options zaroori hain" });
      if (options.some((o) => o.length > 300)) return failed.push({ line, reason: "Koi option bahut lamba hai" });
      if (![1, 2, 3, 4].includes(correct)) return failed.push({ line, reason: "correct 1 se 4 ke beech hona chahiye" });
      if (!Number.isInteger(test) || test < 1 || test > 1000) {
        return failed.push({ line, reason: "testNumber sahi nahi hai" });
      }
      if (explanation.length > 1000) return failed.push({ line, reason: "Explanation 1000 akshar se lamba hai" });

      good.push({
        exam,
        testNumber: test,
        section: String(row.section ?? "").trim().slice(0, 60) || "General",
        question: text,
        options,
        correctIndex: correct - 1,
        explanation,
      });
    });

    if (good.length > 0) {
      await Question.insertMany(good);

      const distinct = await Question.distinct("testNumber", { exam });
      if (distinct.length > examDoc.tests) {
        examDoc.tests = distinct.length;
        await examDoc.save();
      }
    }

    res.json({ added: good.length, failed });
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
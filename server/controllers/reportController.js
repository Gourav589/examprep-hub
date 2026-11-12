const mongoose = require("mongoose");
const Question = require("../models/Question");
const Attempt = require("../models/Attempt");
const QuestionReport = require("../models/QuestionReport");

const REASONS = ["wrong_answer", "wrong_question", "typo", "other"];

exports.createReport = async (req, res) => {
  try {
    const { questionId, reason } = req.body;
    const note = typeof req.body.note === "string" ? req.body.note.trim() : "";

    if (typeof questionId !== "string" || !mongoose.Types.ObjectId.isValid(questionId)) {
      return res.status(400).json({ message: "Question sahi nahi hai" });
    }
    if (!REASONS.includes(reason)) {
      return res.status(400).json({ message: "Wajah chuno" });
    }
    if (note.length > 300) {
      return res.status(400).json({ message: "Note 300 akshar se chhota rakho" });
    }

    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ message: "Question nahi mila" });
    }

    // Sirf wahi student report kar sakta hai jisne is exam ka test diya ho
    const attempted = await Attempt.exists({ user: req.userId, exam: question.exam });
    if (!attempted) {
      return res.status(403).json({ message: "Pehle is exam ka test do, phir report karo" });
    }

    await QuestionReport.findOneAndUpdate(
      { question: question._id, user: req.userId },
      { exam: question.exam, reason, note, status: "open" },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.json({ message: "Report bhej di gayi. Shukriya!" });
  } catch (error) {
    res.status(500).json({ message: "Report nahi bheji ja saki" });
  }
};

exports.adminList = async (req, res) => {
  try {
    const rows = await QuestionReport.find({ status: "open" })
      .sort({ createdAt: -1 })
      .limit(100)
      .populate("question")
      .populate("exam", "name")
      .populate("user", "name");

    const list = rows
      .filter((r) => r.question)
      .map((r) => ({
        _id: r._id,
        reason: r.reason,
        note: r.note,
        createdAt: r.createdAt,
        reporter: r.user ? r.user.name : "Student",
        exam: r.exam ? r.exam.name : "Exam",
        question: {
          _id: r.question._id,
          question: r.question.question,
          options: r.question.options,
          correctIndex: r.question.correctIndex,
          section: r.question.section,
          testNumber: r.question.testNumber,
          explanation: r.question.explanation || "",
        },
      }));

    res.json(list);
  } catch (error) {
    res.status(500).json({ message: "Reports nahi mil payi" });
  }
};

exports.resolveReport = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid report id" });
    }
    const doc = await QuestionReport.findByIdAndUpdate(
      req.params.id,
      { status: "resolved" },
      { new: true }
    );
    if (!doc) {
      return res.status(404).json({ message: "Report nahi mili" });
    }
    res.json({ message: "Report band kar di gayi" });
  } catch (error) {
    res.status(500).json({ message: "Report band nahi ho payi" });
  }
};
const mongoose = require("mongoose");
const Exam = require("../models/Exam");
const Question = require("../models/Question");

exports.getExams = async (req, res) => {
  try {
    const exams = await Exam.find();
    res.json(exams);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getExamById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid exam id" });
    }
    const exam = await Exam.findById(req.params.id);
    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }
    res.json(exam);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createExam = async (req, res) => {
  try {
    const { name, category, tests, freeTests, durationMinutes, negativeMarking } = req.body;

    if (!name || !category) {
      return res.status(400).json({ message: "Name and category are required" });
    }

    const exam = await Exam.create({
      name,
      category,
      tests: Number(tests) || 0,
      freeTests: Math.min(100, Math.max(0, Number(freeTests ?? 1) || 0)),
      durationMinutes: Math.min(300, Math.max(1, Number(durationMinutes) || 10)),
      negativeMarking: Math.min(1, Math.max(0, Number(negativeMarking) || 0)),
    });
    res.status(201).json(exam);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateExam = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid exam id" });
    }

    const exam = await Exam.findById(req.params.id);
    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    const { name, category, tests, freeTests, durationMinutes, negativeMarking } = req.body;

    if (name !== undefined && String(name).trim()) exam.name = String(name).trim();
    if (category !== undefined && String(category).trim()) exam.category = String(category).trim();
    if (tests !== undefined) exam.tests = Math.max(0, Number(tests) || 0);
    if (freeTests !== undefined) {
      exam.freeTests = Math.min(100, Math.max(0, Number(freeTests) || 0));
    }
    if (durationMinutes !== undefined) {
      exam.durationMinutes = Math.min(300, Math.max(1, Number(durationMinutes) || 10));
    }
    if (negativeMarking !== undefined) {
      exam.negativeMarking = Math.min(1, Math.max(0, Number(negativeMarking) || 0));
    }

    await exam.save();
    res.json(exam);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteExam = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid exam id" });
    }

    const exam = await Exam.findByIdAndDelete(req.params.id);
    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    await Question.deleteMany({ exam: req.params.id });
    res.json({ message: "Exam deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
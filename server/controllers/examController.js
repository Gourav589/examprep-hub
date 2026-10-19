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
    const { name, category, tests, free } = req.body;

    if (!name || !category) {
      return res.status(400).json({ message: "Name and category are required" });
    }

    const exam = await Exam.create({
      name,
      category,
      tests: Number(tests) || 0,
      free: Boolean(free),
    });
    res.status(201).json(exam);
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
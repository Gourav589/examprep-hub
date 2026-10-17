    const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
  {
    exam: { type: mongoose.Schema.Types.ObjectId, ref: "Exam", required: true },
    testNumber: { type: Number, default: 1 },
    section: { type: String, default: "General" },
    question: { type: String, required: true },
    options: { type: [String], required: true },
    correctIndex: { type: Number, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Question", questionSchema);
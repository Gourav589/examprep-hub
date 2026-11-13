const mongoose = require("mongoose");

const mistakeSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    question: { type: mongoose.Schema.Types.ObjectId, ref: "Question", required: true },
    exam: { type: mongoose.Schema.Types.ObjectId, ref: "Exam", required: true },
    timesWrong: { type: Number, default: 1 },
    status: { type: String, enum: ["active", "mastered"], default: "active" },
    lastWrongAt: { type: Date, default: Date.now },
    masteredAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// Ek student ka ek question ek hi baar notebook mein
mistakeSchema.index({ user: 1, question: 1 }, { unique: true });
mistakeSchema.index({ user: 1, status: 1, exam: 1 });

module.exports = mongoose.model("Mistake", mistakeSchema);
const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    question: { type: mongoose.Schema.Types.ObjectId, ref: "Question", required: true },
    exam: { type: mongoose.Schema.Types.ObjectId, ref: "Exam", required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    reason: {
      type: String,
      enum: ["wrong_answer", "wrong_question", "typo", "other"],
      required: true,
    },
    note: { type: String, default: "", maxlength: 300 },
    status: { type: String, enum: ["open", "resolved"], default: "open" },
  },
  { timestamps: true }
);

// Ek student ek question par ek hi report
reportSchema.index({ question: 1, user: 1 }, { unique: true });

module.exports = mongoose.model("QuestionReport", reportSchema);
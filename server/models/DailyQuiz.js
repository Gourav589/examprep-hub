const mongoose = require("mongoose");

const dailyQuizSchema = new mongoose.Schema(
  {
    date: { type: String, required: true, unique: true },
    questions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Question" }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("DailyQuiz", dailyQuizSchema);
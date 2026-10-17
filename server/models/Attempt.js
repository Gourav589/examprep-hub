const mongoose = require("mongoose");

const attemptSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    exam: { type: mongoose.Schema.Types.ObjectId, ref: "Exam", required: true },
    testNumber: { type: Number, default: 1 },
    total: Number,
    correct: Number,
    wrong: Number,
    skipped: Number,
    score: Number,
    sections: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Attempt", attemptSchema);
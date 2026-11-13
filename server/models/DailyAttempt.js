const mongoose = require("mongoose");

const dailyAttemptSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: String, required: true },
    score: { type: Number, required: true },
    total: { type: Number, required: true },
    answers: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

// Ek student din mein ek hi baar
dailyAttemptSchema.index({ user: 1, date: 1 }, { unique: true });
dailyAttemptSchema.index({ date: 1 });

module.exports = mongoose.model("DailyAttempt", dailyAttemptSchema);
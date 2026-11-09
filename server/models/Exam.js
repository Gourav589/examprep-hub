const mongoose = require("mongoose");

const examSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    category: { type: String, required: true },
    tests: { type: Number, default: 0 },
    free: { type: Boolean, default: true },
    freeTests: { type: Number, default: 1, min: 0, max: 100 },
    durationMinutes: { type: Number, default: 10, min: 1, max: 300 },
    negativeMarking: { type: Number, default: 0, min: 0, max: 1 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Exam", examSchema);
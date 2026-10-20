const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    organization: { type: String, required: true },
    lastDate: { type: Date, required: true },
    eligibility: { type: String, default: "" },
    link: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Job", jobSchema);
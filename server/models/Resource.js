const mongoose = require("mongoose");

const resourceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, maxlength: 120 },
    category: { type: String, default: "General", maxlength: 40 },
    type: { type: String, enum: ["note", "link"], default: "note" },
    description: { type: String, default: "", maxlength: 300 },
    content: { type: String, default: "", maxlength: 8000 },
    url: { type: String, default: "", maxlength: 500 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Resource", resourceSchema);
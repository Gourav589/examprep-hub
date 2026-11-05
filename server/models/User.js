const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    isPremium: { type: Boolean, default: false },
    role: { type: String, enum: ["student", "admin"], default: "student" },
    premiumUntil: { type: Date, default: null },
    emailVerified: { type: Boolean, default: false },
    verifyCodeHash: { type: String, default: null, select: false },
    verifyCodeExpires: { type: Date, default: null, select: false },
    verifyAttempts: { type: Number, default: 0, select: false },
    verifyLastSent: { type: Date, default: null, select: false },
    resetTokenHash: { type: String, default: null, select: false },
    resetTokenExpires: { type: Date, default: null, select: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
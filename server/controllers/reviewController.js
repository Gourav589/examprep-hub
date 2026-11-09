const mongoose = require("mongoose");
const Review = require("../models/Review");
const Attempt = require("../models/Attempt");
const User = require("../models/User");

const maskName = (full) => {
  const parts = String(full || "Student").trim().split(/\s+/);
  return parts.length > 1 ? `${parts[0]} ${parts[parts.length - 1][0]}.` : parts[0];
};

exports.getReviews = async (req, res) => {
  try {
    const rows = await Review.aggregate([
      { $group: { _id: "$rating", count: { $sum: 1 } } },
    ]);

    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let total = 0;
    let sum = 0;
    rows.forEach((r) => {
      distribution[r._id] = r.count;
      total += r.count;
      sum += r._id * r.count;
    });
    const average = total ? Math.round((sum / total) * 10) / 10 : 0;

    const reviews = await Review.find()
      .sort({ createdAt: -1 })
      .limit(50)
      .populate("user", "name");

    const live = reviews.filter((r) => r.user);
    const ids = live.map((r) => r.user._id);
    const testers = await Attempt.distinct("user", { user: { $in: ids } });
    const testerSet = new Set(testers.map(String));

    const list = live.map((r) => ({
      _id: r._id,
      name: maskName(r.user.name),
      rating: r.rating,
      comment: r.comment,
      createdAt: r.createdAt,
      verified: testerSet.has(String(r.user._id)),
    }));

    let mine = null;
    if (req.userId) {
      const m = await Review.findOne({ user: req.userId });
      if (m) mine = { rating: m.rating, comment: m.comment };
    }

    res.json({ average, total, distribution, reviews: list, mine });
  } catch (error) {
    res.status(500).json({ message: "Reviews nahi mil paye" });
  }
};

exports.saveReview = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (user.role === "admin") {
      return res.status(400).json({ message: "Admin review nahi de sakta" });
    }

    const rating = Number(req.body.rating);
    const comment =
      typeof req.body.comment === "string" ? req.body.comment.trim() : "";

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating 1 se 5 ke beech chuno" });
    }
    if (comment.length > 500) {
      return res.status(400).json({ message: "Review 500 akshar se chhota rakho" });
    }

    const doc = await Review.findOneAndUpdate(
      { user: req.userId },
      { rating, comment },
      { new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true }
    );

    res.json({ message: "Review save ho gaya", rating: doc.rating, comment: doc.comment });
  } catch (error) {
    res.status(500).json({ message: "Review save nahi ho paya" });
  }
};

exports.deleteMyReview = async (req, res) => {
  try {
    await Review.deleteOne({ user: req.userId });
    res.json({ message: "Aapka review hata diya gaya" });
  } catch (error) {
    res.status(500).json({ message: "Review nahi hata paya" });
  }
};

exports.adminDeleteReview = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid review id" });
    }
    const deleted = await Review.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Review nahi mila" });
    }
    res.json({ message: "Review hata diya gaya" });
  } catch (error) {
    res.status(500).json({ message: "Review nahi hata paya" });
  }
};
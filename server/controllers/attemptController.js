const Attempt = require("../models/Attempt");

exports.getMyAttempts = async (req, res) => {
  try {
    const attempts = await Attempt.find({ user: req.userId })
      .populate("exam", "name category")
      .sort({ createdAt: -1 });
    res.json(attempts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
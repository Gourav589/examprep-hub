const User = require("../models/User");
const Attempt = require("../models/Attempt");

exports.getStudents = async (req, res) => {
  try {
    const students = await User.find({ role: "student" })
      .select("-password")
      .sort({ createdAt: -1 });

    const stats = await Attempt.aggregate([
      {
        $group: {
          _id: "$user",
          attempts: { $sum: 1 },
          totalScore: { $sum: "$score" },
          totalQuestions: { $sum: "$total" },
        },
      },
    ]);

    const statMap = {};
    stats.forEach((s) => {
      statMap[s._id.toString()] = s;
    });

    const result = students.map((u) => {
      const s = statMap[u._id.toString()];
      return {
        _id: u._id,
        name: u.name,
        email: u.email,
        isPremium: u.isPremium,
        joined: u.createdAt,
        attempts: s ? s.attempts : 0,
        accuracy: s && s.totalQuestions
          ? Math.round((s.totalScore / s.totalQuestions) * 100)
          : 0,
      };
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.togglePremium = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    user.isPremium = !user.isPremium;
    await user.save();
    res.json({ _id: user._id, isPremium: user.isPremium });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
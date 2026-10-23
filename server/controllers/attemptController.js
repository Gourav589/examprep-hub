const mongoose = require("mongoose");
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

exports.getLeaderboard = async (req, res) => {
  try {
    const { examId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(examId)) {
      return res.status(400).json({ message: "Invalid exam id" });
    }

    const rows = await Attempt.aggregate([
      { $match: { exam: new mongoose.Types.ObjectId(examId) } },
      {
        $addFields: {
          pct: {
            $cond: [
              { $gt: ["$total", 0] },
              { $multiply: [{ $divide: ["$score", "$total"] }, 100] },
              0,
            ],
          },
        },
      },
      {
        $group: {
          _id: "$user",
          bestPct: { $max: "$pct" },
          attempts: { $sum: 1 },
        },
      },
      { $sort: { bestPct: -1, attempts: 1 } },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "u",
        },
      },
      { $unwind: "$u" },
      {
        $project: {
          name: "$u.name",
          bestPct: { $round: ["$bestPct", 0] },
          attempts: 1,
        },
      },
    ]);

    const maskName = (full) => {
      const parts = (full || "Student").trim().split(/\s+/);
      return parts.length > 1
        ? `${parts[0]} ${parts[parts.length - 1][0]}.`
        : parts[0];
    };

    const ranked = rows.map((r, i) => ({
      rank: i + 1,
      userId: String(r._id),
      name: maskName(r.name),
      bestPct: r.bestPct,
      attempts: r.attempts,
    }));

    const me = req.userId
      ? ranked.find((r) => r.userId === String(req.userId))
      : null;

    res.json({
      top: ranked.slice(0, 20).map(({ userId, ...rest }) => ({
        ...rest,
        isMe: userId === String(req.userId),
      })),
      me: me ? { rank: me.rank, bestPct: me.bestPct } : null,
      totalPlayers: ranked.length,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
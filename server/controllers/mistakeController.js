const mongoose = require("mongoose");
const Mistake = require("../models/Mistake");
const Exam = require("../models/Exam");
const User = require("../models/User");

const isPremiumActive = (user) =>
  user.isPremium && (!user.premiumUntil || user.premiumUntil > new Date());

// Student ke saare active galat questions, aur kaun se locked hain
async function loadActive(userId) {
  const user = await User.findById(userId);
  const premium = !!user && (user.role === "admin" || isPremiumActive(user));

  const rows = await Mistake.find({ user: userId, status: "active" })
    .sort({ lastWrongAt: -1 })
    .populate("question");

  const examIds = [...new Set(rows.map((r) => String(r.exam)))];
  const exams = await Exam.find({ _id: { $in: examIds } });
  const examMap = new Map(exams.map((e) => [String(e._id), e]));

  return rows
    .filter((r) => r.question && examMap.has(String(r.exam)))
    .map((r) => {
      const exam = examMap.get(String(r.exam));
      const freeTests = typeof exam.freeTests === "number" ? exam.freeTests : 1;
      const locked = !(premium || r.question.testNumber <= freeTests);
      return { row: r, exam, locked };
    });
}

const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const validExamParam = (value) =>
  typeof value === "string" && value !== "" && mongoose.Types.ObjectId.isValid(value);

exports.getSummary = async (req, res) => {
  try {
    const items = await loadActive(req.userId);
    const map = new Map();

    items.forEach(({ exam, locked }) => {
      const key = String(exam._id);
      if (!map.has(key)) {
        map.set(key, { examId: key, name: exam.name, category: exam.category, active: 0, locked: 0 });
      }
      const entry = map.get(key);
      if (locked) entry.locked += 1;
      else entry.active += 1;
    });

    const exams = [...map.values()].sort((a, b) => b.active - a.active);
    res.json({
      exams,
      total: exams.reduce((s, e) => s + e.active, 0),
      lockedTotal: exams.reduce((s, e) => s + e.locked, 0),
    });
  } catch (error) {
    res.status(500).json({ message: "Notebook nahi khul payi" });
  }
};

exports.getMistakes = async (req, res) => {
  try {
    let items = await loadActive(req.userId);

    if (req.query.exam !== undefined) {
      if (!validExamParam(req.query.exam)) {
        return res.status(400).json({ message: "Invalid exam id" });
      }
      items = items.filter((i) => String(i.exam._id) === req.query.exam);
    }

    const open = items
      .filter((i) => !i.locked)
      .slice(0, 200)
      .map(({ row, exam }) => ({
        _id: row._id,
        examName: exam.name,
        question: row.question.question,
        options: row.question.options,
        correctIndex: row.question.correctIndex,
        explanation: row.question.explanation || "",
        section: row.question.section,
        timesWrong: row.timesWrong,
        lastWrongAt: row.lastWrongAt,
      }));

    res.json({ items: open, lockedCount: items.filter((i) => i.locked).length });
  } catch (error) {
    res.status(500).json({ message: "Mistakes nahi mil payi" });
  }
};

// Revision test ke questions (sahi jawab aur explanation nahi bhejte)
exports.getPractice = async (req, res) => {
  try {
    let items = (await loadActive(req.userId)).filter((i) => !i.locked);

    if (req.query.exam !== undefined) {
      if (!validExamParam(req.query.exam)) {
        return res.status(400).json({ message: "Invalid exam id" });
      }
      items = items.filter((i) => String(i.exam._id) === req.query.exam);
    }

    const limit = Math.min(30, Math.max(1, Number(req.query.limit) || 15));
    const picked = shuffle(items).slice(0, limit);

    res.json(
      picked.map(({ row, exam }) => ({
        _id: row.question._id,
        question: row.question.question,
        options: row.question.options,
        section: row.question.section,
        examName: exam.name,
      }))
    );
  } catch (error) {
    res.status(500).json({ message: "Revision test nahi ban paya" });
  }
};

exports.submitPractice = async (req, res) => {
  try {
    const answers =
      req.body.answers && typeof req.body.answers === "object" ? req.body.answers : {};

    const items = (await loadActive(req.userId)).filter((i) => !i.locked);
    const byQuestion = new Map(items.map((i) => [String(i.row.question._id), i]));

    const ops = [];
    const results = [];
    let correct = 0;
    let wrong = 0;

    for (const [qid, picked] of Object.entries(answers).slice(0, 50)) {
      const item = byQuestion.get(qid);
      if (!item) continue; // jo question notebook mein nahi, usse ignore
      if (!Number.isInteger(picked) || picked < 0 || picked > 3) continue;

      const q = item.row.question;
      const ok = picked === q.correctIndex;

      if (ok) {
        correct += 1;
        ops.push({
          updateOne: {
            filter: { _id: item.row._id },
            update: { $set: { status: "mastered", masteredAt: new Date() } },
          },
        });
      } else {
        wrong += 1;
        ops.push({
          updateOne: {
            filter: { _id: item.row._id },
            update: { $inc: { timesWrong: 1 }, $set: { lastWrongAt: new Date() } },
          },
        });
      }

      results.push({
        questionId: qid,
        question: q.question,
        options: q.options,
        picked,
        correctIndex: q.correctIndex,
        explanation: q.explanation || "",
        correct: ok,
      });
    }

    if (ops.length > 0) {
      await Mistake.bulkWrite(ops);
    }

    res.json({
      answered: results.length,
      correct,
      wrong,
      remaining: Math.max(0, items.length - correct),
      results,
    });
  } catch (error) {
    res.status(500).json({ message: "Revision submit nahi ho paya" });
  }
};

exports.removeMistake = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid id" });
    }
    await Mistake.deleteOne({ _id: req.params.id, user: req.userId });
    res.json({ message: "Notebook se hata diya" });
  } catch (error) {
    res.status(500).json({ message: "Nahi hata paya" });
  }
};
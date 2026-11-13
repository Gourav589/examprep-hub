const crypto = require("crypto");
const Exam = require("../models/Exam");
const Question = require("../models/Question");
const User = require("../models/User");
const DailyQuiz = require("../models/DailyQuiz");
const DailyAttempt = require("../models/DailyAttempt");
const Mistake = require("../models/Mistake");
const { todayKey, dayNumber } = require("../utils/istDate");

const QUIZ_SIZE = 10;
const MIN_POOL = 5;

// Tareekh se ek pakka random number (roz ek hi quiz banne ke liye)
const seedFrom = (text) =>
  crypto.createHash("sha256").update(text).digest().readUInt32BE(0);

function mulberry32(a) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Aaj ka quiz: free tests ke questions mein se 10, din bhar wahi
async function getOrCreateQuiz(date) {
  let quiz = await DailyQuiz.findOne({ date });
  if (quiz) return quiz;

  const exams = await Exam.find({}, "freeTests");
  const conds = exams.map((e) => ({
    exam: e._id,
    testNumber: { $lte: typeof e.freeTests === "number" ? e.freeTests : 1 },
  }));
  if (conds.length === 0) return null;

  const pool = await Question.find({ $or: conds }, "_id").lean();
  if (pool.length < MIN_POOL) return null;

  const ids = pool.map((p) => String(p._id)).sort();
  const rand = mulberry32(seedFrom(date));
  for (let i = ids.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [ids[i], ids[j]] = [ids[j], ids[i]];
  }

  try {
    quiz = await DailyQuiz.create({ date, questions: ids.slice(0, QUIZ_SIZE) });
  } catch (e) {
    // Dusre request ne pehle hi bana diya
    quiz = await DailyQuiz.findOne({ date });
  }
  return quiz;
}

async function orderQuestions(quiz, hide) {
  let query = Question.find({ _id: { $in: quiz.questions } });
  if (hide) query = query.select(hide);
  const docs = await query;
  const map = new Map(docs.map((d) => [String(d._id), d]));
  return quiz.questions.map((id) => map.get(String(id))).filter(Boolean);
}

function gradeSummary(qs, answers) {
  let score = 0;
  const results = qs.map((q) => {
    const raw = answers[String(q._id)];
    const picked = Number.isInteger(raw) ? raw : null;
    const correct = picked === q.correctIndex;
    if (correct) score += 1;
    return {
      questionId: q._id,
      question: q.question,
      options: q.options,
      picked,
      correctIndex: q.correctIndex,
      explanation: q.explanation || "",
      correct,
    };
  });
  return { score, total: qs.length, results };
}

// Streak: lagatar kitne din (aaj ya kal tak)
async function streakFor(userId, today) {
  const rows = await DailyAttempt.find({ user: userId }, "date")
    .sort({ date: -1 })
    .limit(400)
    .lean();

  const days = [...new Set(rows.map((r) => dayNumber(r.date)))].sort((a, b) => b - a);
  const todayNo = dayNumber(today);
  const todayDone = days[0] === todayNo;

  let current = 0;
  let expected = todayDone ? todayNo : todayNo - 1;
  for (const d of days) {
    if (d === expected) {
      current += 1;
      expected -= 1;
    } else if (d < expected) {
      break;
    }
  }

  let longest = 0;
  let run = 0;
  let prev = null;
  for (const d of [...days].reverse()) {
    run = prev !== null && d === prev + 1 ? run + 1 : 1;
    longest = Math.max(longest, run);
    prev = d;
  }

  return { current, longest, todayDone, total: days.length };
}

exports.getStreak = async (req, res) => {
  try {
    res.json(await streakFor(req.userId, todayKey()));
  } catch (error) {
    res.status(500).json({ message: "Streak nahi mili" });
  }
};

exports.getToday = async (req, res) => {
  try {
    const date = todayKey();
    const quiz = await getOrCreateQuiz(date);

    const [streak, attempt, participants] = await Promise.all([
      streakFor(req.userId, date),
      DailyAttempt.findOne({ user: req.userId, date }),
      DailyAttempt.countDocuments({ date }),
    ]);

    if (!quiz) {
      return res.json({ date, ready: false, done: false, streak, participants });
    }

    if (attempt) {
      const qs = await orderQuestions(quiz);
      return res.json({
        date,
        ready: true,
        done: true,
        ...gradeSummary(qs, attempt.answers || {}),
        streak,
        participants,
      });
    }

    const qs = await orderQuestions(quiz, "-correctIndex -explanation");
    res.json({
      date,
      ready: true,
      done: false,
      questions: qs.map((q) => ({
        _id: q._id,
        question: q.question,
        options: q.options,
        section: q.section,
      })),
      streak,
      participants,
    });
  } catch (error) {
    res.status(500).json({ message: "Daily quiz nahi khul paya" });
  }
};

exports.submit = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (user.role === "admin") {
      return res.status(400).json({ message: "Admin daily quiz nahi de sakta" });
    }

    const date = todayKey();
    const quiz = await DailyQuiz.findOne({ date });
    if (!quiz) {
      return res.status(400).json({ message: "Aaj ka quiz abhi taiyar nahi hai" });
    }
    if (await DailyAttempt.exists({ user: req.userId, date })) {
      return res.status(409).json({ message: "Aaj ka quiz aap de chuke ho. Kal naya milega!" });
    }

    // Sirf aaj ke quiz ke questions aur 0 se 3 ke jawab maane jaate hain
    const valid = new Set(quiz.questions.map(String));
    const raw = req.body.answers && typeof req.body.answers === "object" ? req.body.answers : {};
    const answers = {};
    for (const [k, v] of Object.entries(raw)) {
      if (valid.has(k) && Number.isInteger(v) && v >= 0 && v <= 3) answers[k] = v;
    }

    const qs = await orderQuestions(quiz);
    const summary = gradeSummary(qs, answers);

    try {
      await DailyAttempt.create({
        user: req.userId,
        date,
        score: summary.score,
        total: summary.total,
        answers,
      });
    } catch (e) {
      if (e.code === 11000) {
        return res.status(409).json({ message: "Aaj ka quiz aap de chuke ho. Kal naya milega!" });
      }
      throw e;
    }

    // Galat jawab Mistakes Notebook mein (fail ho to bhi quiz save rahe)
    try {
      const examOf = new Map(qs.map((q) => [String(q._id), q.exam]));
      const ops = summary.results
        .filter((r) => !r.correct && r.picked !== null)
        .map((r) => ({
          updateOne: {
            filter: { user: req.userId, question: r.questionId },
            update: {
              $set: {
                exam: examOf.get(String(r.questionId)),
                status: "active",
                lastWrongAt: new Date(),
                masteredAt: null,
              },
              $inc: { timesWrong: 1 },
            },
            upsert: true,
          },
        }));
      if (ops.length > 0) await Mistake.bulkWrite(ops);
    } catch (e) {
      console.log("Daily mistakes save nahi hui:", e.message);
    }

    const [streak, participants] = await Promise.all([
      streakFor(req.userId, date),
      DailyAttempt.countDocuments({ date }),
    ]);

    res.json({ date, ready: true, done: true, ...summary, streak, participants });
  } catch (error) {
    res.status(500).json({ message: "Quiz submit nahi ho paya" });
  }
};
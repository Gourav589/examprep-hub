require("dotenv").config();
const mongoose = require("mongoose");
const Exam = require("./models/Exam");

// Time aur negative marking andaze hain, Admin Panel se badal sakte ho
const exams = [
  // MS Office aur Computer Basics
  { name: "Computer Fundamentals", durationMinutes: 30, negativeMarking: 0 },
  { name: "Computer Awareness (Govt Exams)", durationMinutes: 30, negativeMarking: 0.25 },
  { name: "MS Word", durationMinutes: 20, negativeMarking: 0 },
  { name: "MS Excel", durationMinutes: 20, negativeMarking: 0 },
  { name: "MS PowerPoint", durationMinutes: 20, negativeMarking: 0 },
  { name: "Internet and Email", durationMinutes: 20, negativeMarking: 0 },
  { name: "CCC Practice", durationMinutes: 90, negativeMarking: 0 },
  { name: "Operating System Basics", durationMinutes: 30, negativeMarking: 0 },
  { name: "Networking Basics", durationMinutes: 30, negativeMarking: 0 },

  // Programming aur Web
  { name: "Python", durationMinutes: 30, negativeMarking: 0 },
  { name: "C Programming", durationMinutes: 30, negativeMarking: 0 },
  { name: "C++", durationMinutes: 30, negativeMarking: 0 },
  { name: "Java", durationMinutes: 30, negativeMarking: 0 },
  { name: "JavaScript", durationMinutes: 30, negativeMarking: 0 },
  { name: "HTML and CSS", durationMinutes: 20, negativeMarking: 0 },
  { name: "SQL and DBMS", durationMinutes: 30, negativeMarking: 0 },
  { name: "Data Structures", durationMinutes: 30, negativeMarking: 0 },
];

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  let added = 0;
  for (const e of exams) {
    const res = await Exam.updateOne(
      { name: e.name },
      {
        $setOnInsert: {
          category: "Computer",
          tests: 0,
          freeTests: 1,
          durationMinutes: e.durationMinutes,
          negativeMarking: e.negativeMarking,
        },
      },
      { upsert: true }
    );
    if (res.upsertedCount) added += 1;
  }

  console.log(`Naye computer exams add hue: ${added}, pehle se maujood: ${exams.length - added}`);
  process.exit();
};

run();
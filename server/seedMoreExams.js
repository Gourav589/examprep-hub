require("dotenv").config();
const mongoose = require("mongoose");
const Exam = require("./models/Exam");

// negativeMarking = ek sahi jawab ke marks ka hissa (jaise 0.25 = chauthai)
// Time aur negative marking andaze hain, official notification se milakar Admin Panel mein badal lo
const exams = [
  // UPSC
  { name: "UPSC Prelims GS Paper 1", category: "UPSC", free: false, durationMinutes: 120, negativeMarking: 0.33 },
  { name: "UPSC Prelims CSAT Paper 2", category: "UPSC", free: false, durationMinutes: 120, negativeMarking: 0.33 },
  { name: "UPSC Mains GS Practice (MCQ)", category: "UPSC", free: false, durationMinutes: 60, negativeMarking: 0 },

  // SSC
  { name: "SSC CGL Tier 2", category: "SSC", free: false, durationMinutes: 120, negativeMarking: 0.25 },
  { name: "SSC MTS", category: "SSC", free: true, durationMinutes: 45, negativeMarking: 0.25 },
  { name: "SSC GD Constable", category: "SSC", free: true, durationMinutes: 60, negativeMarking: 0.25 },
  { name: "SSC CPO", category: "SSC", free: false, durationMinutes: 120, negativeMarking: 0.25 },

  // Banking
  { name: "IBPS PO Mains", category: "Banking", free: false, durationMinutes: 60, negativeMarking: 0.25 },
  { name: "IBPS Clerk Prelims", category: "Banking", free: true, durationMinutes: 60, negativeMarking: 0.25 },
  { name: "IBPS Clerk Mains", category: "Banking", free: false, durationMinutes: 60, negativeMarking: 0.25 },
  { name: "SBI PO Prelims", category: "Banking", free: false, durationMinutes: 60, negativeMarking: 0.25 },
  { name: "SBI PO Mains", category: "Banking", free: false, durationMinutes: 60, negativeMarking: 0.25 },
  { name: "IBPS RRB Office Assistant", category: "Banking", free: true, durationMinutes: 45, negativeMarking: 0.25 },

  // Railway
  { name: "RRB Group D", category: "Railway", free: true, durationMinutes: 90, negativeMarking: 0.33 },
  { name: "RRB ALP", category: "Railway", free: false, durationMinutes: 60, negativeMarking: 0.33 },
  { name: "RRB JE", category: "Railway", free: false, durationMinutes: 90, negativeMarking: 0.33 },

  // Defence
  { name: "NDA", category: "Defence", free: false, durationMinutes: 90, negativeMarking: 0.33 },
  { name: "CDS", category: "Defence", free: false, durationMinutes: 60, negativeMarking: 0.33 },
  { name: "Agniveer", category: "Defence", free: true, durationMinutes: 60, negativeMarking: 0.25 },

  // Teaching
  { name: "CTET", category: "Teaching", free: true, durationMinutes: 90, negativeMarking: 0 },

  // Himachal Pradesh
  { name: "HPAS Prelims", category: "HP State", free: false, durationMinutes: 120, negativeMarking: 0.33 },
  { name: "HPAS Mains Practice (MCQ)", category: "HP State", free: false, durationMinutes: 60, negativeMarking: 0 },
  { name: "HP Allied Services Prelims", category: "HP State", free: false, durationMinutes: 120, negativeMarking: 0.25 },
  { name: "HP Patwari", category: "HP State", free: true, durationMinutes: 60, negativeMarking: 0.25 },
  { name: "HP Junior Office Assistant", category: "HP State", free: true, durationMinutes: 60, negativeMarking: 0.25 },
  { name: "HP Clerk", category: "HP State", free: true, durationMinutes: 60, negativeMarking: 0.25 },
  { name: "HP Forest Guard", category: "HP State", free: true, durationMinutes: 60, negativeMarking: 0.25 },
  { name: "HP Naib Tehsildar", category: "HP State", free: false, durationMinutes: 90, negativeMarking: 0.25 },
  { name: "HP Police SI", category: "HP State", free: false, durationMinutes: 90, negativeMarking: 0.25 },
  { name: "HP TET JBT", category: "HP State", free: true, durationMinutes: 90, negativeMarking: 0 },
  { name: "HP TET TGT", category: "HP State", free: true, durationMinutes: 90, negativeMarking: 0 },
];

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  let added = 0;
  for (const e of exams) {
    const { name, ...rest } = e;
    const res = await Exam.updateOne(
      { name },
      { $setOnInsert: { tests: 0, ...rest } },
      { upsert: true }
    );
    if (res.upsertedCount) added += 1;
  }

  console.log(`Naye exams add hue: ${added}, pehle se maujood: ${exams.length - added}`);
  process.exit();
};

run();
require("dotenv").config();
const mongoose = require("mongoose");
const Exam = require("./models/Exam");

const exams = [
  { name: "SSC CGL", tests: 10, category: "SSC", free: true },
  { name: "SSC CHSL", tests: 8, category: "SSC", free: true },
  { name: "IBPS PO", tests: 12, category: "Banking", free: false },
  { name: "SBI Clerk", tests: 9, category: "Banking", free: false },
  { name: "RRB NTPC", tests: 10, category: "Railway", free: true },
  { name: "HP Police", tests: 6, category: "State Govt", free: true },
];

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await Exam.deleteMany();
  await Exam.insertMany(exams);
  console.log("Exams added");
  process.exit();
};

seed();
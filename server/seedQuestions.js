require("dotenv").config();
const mongoose = require("mongoose");
const Exam = require("./models/Exam");
const Question = require("./models/Question");

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const exam = await Exam.findOne({ name: "SSC CGL" });
  if (!exam) {
    console.log("SSC CGL exam nahi mila, pehle node seed.js chalao");
    process.exit();
  }

  const questions = [
    {
      section: "Reasoning",
      question: "Find the odd one out: 2, 4, 8, 16, 20",
      options: ["4", "8", "16", "20"],
      correctIndex: 3,
    },
    {
      section: "Maths",
      question: "What is 15% of 200?",
      options: ["20", "25", "30", "35"],
      correctIndex: 2,
    },
    {
      section: "General Awareness",
      question: "Who is known as the Father of the Indian Constitution?",
      options: ["Mahatma Gandhi", "B. R. Ambedkar", "J. L. Nehru", "Sardar Patel"],
      correctIndex: 1,
    },
    {
      section: "English",
      question: "Choose the synonym of 'Rapid'.",
      options: ["Slow", "Quick", "Weak", "Late"],
      correctIndex: 1,
    },
    {
      section: "Maths",
      question: "If x + 5 = 12, what is x?",
      options: ["5", "6", "7", "8"],
      correctIndex: 2,
    },
  ].map((q) => ({ ...q, exam: exam._id, testNumber: 1 }));

  await Question.deleteMany({ exam: exam._id });
  await Question.insertMany(questions);
  console.log(`${questions.length} questions added`);
  process.exit();
};

run();
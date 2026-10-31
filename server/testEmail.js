require("dotenv").config();
const { sendEmail } = require("./utils/sendEmail");

const to = process.argv[2] || process.env.EMAIL_USER;

sendEmail({
  to,
  subject: "ExamPrep Hub test email",
  html: "<p>Email setup sahi chal raha hai.</p>",
})
  .then(() => console.log("Email bhej diya:", to))
  .catch((e) => console.log("Error:", e.message));
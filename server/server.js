const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
require("dotenv").config();

const connectDB = require("./config/db");
const { apiLimiter, authLimiter, paymentLimiter, resetLimiter } = require("./middleware/rateLimiters");

connectDB();

const app = express();

// Live server (Render jaisa) proxy ke peeche hota hai, tab asli IP ke liye yeh zaroori hai
if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL ? process.env.CLIENT_URL.split(",") : true,
  })
);
app.use(express.json({ limit: "1mb" }));

app.use("/api", apiLimiter);
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/signup", authLimiter);
app.use("/api/payments", paymentLimiter);

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/exams", require("./routes/examRoutes"));
app.use("/api/questions", require("./routes/questionRoutes"));
app.use("/api/attempts", require("./routes/attemptRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/jobs", require("./routes/jobRoutes"));
app.use("/api/reviews", require("./routes/reviewRoutes"));
app.use("/api/payments", require("./routes/paymentRoutes"));
app.use("/api/analytics", require("./routes/analyticsRoutes"));
app.use("/api/auth/forgot-password", resetLimiter);
app.use("/api/auth/reset-password", resetLimiter);
app.use("/api/auth/verify-email", authLimiter);
app.use("/api/auth/resend-code", resetLimiter);

app.get("/", (req, res) => {
  res.send("ExamPrep Hub API is running");
});

// Jo API route exist nahi karta
app.use("/api", (req, res) => {
  res.status(404).json({ message: "API route nahi mila" });
});

// Saaf error messages (andar ka error bahar nahi dikhate)
app.use((err, req, res, next) => {
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ message: "Galat JSON bheja gaya" });
  }
  if (err.type === "entity.too.large") {
    return res.status(413).json({ message: "Data bahut bada hai" });
  }
  console.error(err);
  res.status(500).json({ message: "Server mein dikkat aayi" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
const express = require("express");
const {
  createOrder,
  verifyPayment,
  getStatus,
} = require("../controllers/paymentController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/create-order", protect, createOrder);
router.post("/verify", protect, verifyPayment);
router.get("/status", protect, getStatus);

module.exports = router;
const crypto = require("crypto");
const Razorpay = require("razorpay");
const User = require("../models/User");
const Payment = require("../models/Payment");
const { sendEmail, membershipEmail } = require("../utils/sendEmail");

const PRICE_INR = 200;
const PLAN_DAYS = 30;

const getClient = () =>
  new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });

exports.createOrder = async (req, res) => {
  try {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return res.status(500).json({ message: "Payment keys set nahi hain" });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (user.role === "admin") {
      return res.status(400).json({ message: "Admin ko membership ki zaroorat nahi" });
    }

    const order = await getClient().orders.create({
      amount: PRICE_INR * 100,
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
      notes: { userId: String(user._id), plan: "monthly" },
    });

    await Payment.create({
      user: user._id,
      orderId: order.id,
      amount: order.amount,
      status: "created",
    });

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      name: user.name,
      email: user.email,
    });
  } catch (error) {
    const reason = error.error?.description || error.message;
    res.status(500).json({ message: `Order nahi ban paya: ${reason}` });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: "Payment details poori nahi hain" });
    }

    const payment = await Payment.findOne({
      orderId: razorpay_order_id,
      user: req.userId,
    });
    if (!payment) {
      return res.status(404).json({ message: "Order nahi mila" });
    }

    const user = await User.findById(req.userId);

    if (payment.status === "paid") {
      return res.json({
        message: "Payment pehle se verify ho chuka hai",
        premiumUntil: user.premiumUntil,
      });
    }

    const expected = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    const a = Buffer.from(expected);
    const b = Buffer.from(String(razorpay_signature));
    const valid = a.length === b.length && crypto.timingSafeEqual(a, b);

    if (!valid) {
      payment.status = "failed";
      await payment.save();
      return res.status(400).json({ message: "Payment verify nahi hua" });
    }

    payment.status = "paid";
    payment.paymentId = razorpay_payment_id;
    await payment.save();

    const now = new Date();
    const base = user.premiumUntil && user.premiumUntil > now ? user.premiumUntil : now;
    user.isPremium = true;
    user.premiumUntil = new Date(base.getTime() + PLAN_DAYS * 24 * 60 * 60 * 1000);
    await user.save();

    // Email alag se bhejte hain: fail bhi ho jaye to payment par asar nahi
    const mail = membershipEmail(user, user.premiumUntil);
    sendEmail({ to: user.email, ...mail }).catch((e) =>
      console.log("Email nahi gaya:", e.message)
    );

    res.json({ message: "Payment successful", premiumUntil: user.premiumUntil });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getStatus = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const active =
      user.isPremium && (!user.premiumUntil || user.premiumUntil > new Date());
    res.json({ isPremium: active, premiumUntil: user.premiumUntil, price: PRICE_INR });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
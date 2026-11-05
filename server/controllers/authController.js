const crypto = require("crypto");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { sendEmail, resetEmail, verifyEmailMail } = require("../utils/sendEmail");

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CODE_MINUTES = 15;
const MAX_ATTEMPTS = 5;
const RESEND_SECONDS = 60;

const createToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

const publicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
});

const checkNewPassword = (pw) => {
  if (typeof pw !== "string") return "Password sahi format mein nahi hai";
  if (pw.length < 8) return "Password kam se kam 8 akshar ka rakho";
  if (pw.length > 72) return "Password 72 akshar se chhota rakho";
  return null;
};

const hashToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

const hashCode = (code) =>
  crypto.createHmac("sha256", process.env.JWT_SECRET).update(String(code)).digest("hex");

const makeCode = () => String(crypto.randomInt(0, 1000000)).padStart(6, "0");

// Naya code banake mail karta hai
async function issueVerifyCode(user) {
  const code = makeCode();
  user.verifyCodeHash = hashCode(code);
  user.verifyCodeExpires = new Date(Date.now() + CODE_MINUTES * 60 * 1000);
  user.verifyAttempts = 0;
  user.verifyLastSent = new Date();
  await user.save();

  if (process.env.NODE_ENV !== "production") {
    console.log("Verification code (sirf development mein dikhta hai):", code);
  }

  const mail = verifyEmailMail(user, code, CODE_MINUTES);
  sendEmail({ to: user.email, ...mail }).catch((e) =>
    console.log("Verification email nahi gaya:", e.message)
  );
}

exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (typeof name !== "string" || typeof email !== "string") {
      return res.status(400).json({ message: "Naam aur email sahi format mein bharo" });
    }

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (cleanName.length < 2 || cleanName.length > 60) {
      return res.status(400).json({ message: "Naam 2 se 60 akshar ke beech rakho" });
    }
    if (cleanEmail.length > 254 || !EMAIL_RE.test(cleanEmail)) {
      return res.status(400).json({ message: "Sahi email likho" });
    }
    const pwError = checkNewPassword(password);
    if (pwError) {
      return res.status(400).json({ message: pwError });
    }

    const exists = await User.findOne({ email: cleanEmail });
    if (exists) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      name: cleanName,
      email: cleanEmail,
      password: hashed,
      emailVerified: false,
    });

    await issueVerifyCode(user);

    res.status(201).json({ needsVerification: true, email: user.email });
  } catch (error) {
    res.status(500).json({ message: "Signup nahi ho paya" });
  }
};

exports.verifyEmail = async (req, res) => {
  try {
    const { email, code } = req.body;

    if (
      typeof email !== "string" ||
      typeof code !== "string" ||
      !/^\d{6}$/.test(code.trim())
    ) {
      return res.status(400).json({ message: "6 ank ka code likho" });
    }

    const bad = { message: "Code galat hai ya purana ho gaya" };

    const user = await User.findOne({ email: email.trim().toLowerCase() }).select(
      "+verifyCodeHash +verifyCodeExpires +verifyAttempts"
    );

    if (!user || !user.verifyCodeHash || !user.verifyCodeExpires) {
      return res.status(400).json(bad);
    }
    if (user.emailVerified) {
      return res.status(400).json({ message: "Email pehle se verify hai. Login karo." });
    }
    if (user.verifyCodeExpires < new Date()) {
      return res.status(400).json(bad);
    }
    if ((user.verifyAttempts || 0) >= MAX_ATTEMPTS) {
      return res
        .status(429)
        .json({ message: "Bahut zyada galat koshish. Naya code mangao." });
    }

    const given = Buffer.from(hashCode(code.trim()));
    const saved = Buffer.from(user.verifyCodeHash);
    const ok = given.length === saved.length && crypto.timingSafeEqual(given, saved);

    if (!ok) {
      user.verifyAttempts = (user.verifyAttempts || 0) + 1;
      await user.save();
      return res.status(400).json(bad);
    }

    user.emailVerified = true;
    user.verifyCodeHash = null;
    user.verifyCodeExpires = null;
    user.verifyAttempts = 0;
    await user.save();

    res.json({ token: createToken(user._id), user: publicUser(user) });
  } catch (error) {
    res.status(500).json({ message: "Verify nahi ho paya" });
  }
};

exports.resendCode = async (req, res) => {
  const generic = { message: "Agar account verify hona baaki hai, to naya code bhej diya gaya hai." };

  try {
    const { email } = req.body;
    if (typeof email !== "string" || !EMAIL_RE.test(email.trim())) {
      return res.status(400).json({ message: "Sahi email likho" });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() }).select(
      "+verifyLastSent"
    );

    if (user && !user.emailVerified) {
      const waited = user.verifyLastSent
        ? (Date.now() - user.verifyLastSent.getTime()) / 1000
        : RESEND_SECONDS;

      if (waited >= RESEND_SECONDS) {
        await issueVerifyCode(user);
      }
    }

    res.json(generic);
  } catch (error) {
    res.status(500).json({ message: "Abhi code nahi bheja ja saka" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (typeof email !== "string" || typeof password !== "string") {
      return res.status(400).json({ message: "Email aur password sahi format mein bharo" });
    }
    if (email.length > 254 || password.length > 128) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    if (!user.emailVerified) {
      await issueVerifyCode(user);
      return res.status(403).json({
        message: "Pehle apni email verify karo. Naya code bhej diya gaya hai.",
        needsVerification: true,
        email: user.email,
      });
    }

    res.json({
      token: createToken(user._id),
      user: publicUser(user),
    });
  } catch (error) {
    res.status(500).json({ message: "Login nahi ho paya" });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const name = typeof req.body.name === "string" ? req.body.name.trim() : "";
    if (name.length < 2 || name.length > 60) {
      return res.status(400).json({ message: "Naam 2 se 60 akshar ke beech rakho" });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.name = name;
    await user.save();

    res.json(publicUser(user));
  } catch (error) {
    res.status(500).json({ message: "Naam nahi badla ja saka" });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (typeof oldPassword !== "string" || !oldPassword) {
      return res.status(400).json({ message: "Purana password bharo" });
    }
    const pwError = checkNewPassword(newPassword);
    if (pwError) {
      return res.status(400).json({ message: pwError });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const match = await bcrypt.compare(oldPassword, user.password);
    if (!match) {
      return res.status(400).json({ message: "Purana password galat hai" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: "Password badal gaya" });
  } catch (error) {
    res.status(500).json({ message: "Password nahi badla ja saka" });
  }
};

exports.forgotPassword = async (req, res) => {
  const generic = {
    message: "Agar yeh email registered hai, to reset link bhej diya gaya hai.",
  };

  try {
    const { email } = req.body;
    if (typeof email !== "string" || !EMAIL_RE.test(email.trim())) {
      return res.status(400).json({ message: "Sahi email likho" });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });

    if (user) {
      const token = crypto.randomBytes(32).toString("hex");
      user.resetTokenHash = hashToken(token);
      user.resetTokenExpires = new Date(Date.now() + 30 * 60 * 1000);
      await user.save();

      const base = (process.env.CLIENT_URL || "http://localhost:5173")
        .split(",")[0]
        .replace(/\/$/, "");
      const link = `${base}/reset-password/${token}`;

      if (process.env.NODE_ENV !== "production") {
        console.log("Reset link (sirf development mein dikhta hai):", link);
      }

      const mail = resetEmail(user, link);
      sendEmail({ to: user.email, ...mail }).catch((e) =>
        console.log("Reset email nahi gaya:", e.message)
      );
    }

    res.json(generic);
  } catch (error) {
    res.status(500).json({ message: "Abhi request poori nahi ho payi" });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (typeof token !== "string" || !/^[a-f0-9]{64}$/.test(token)) {
      return res.status(400).json({ message: "Link sahi nahi hai ya purana ho gaya" });
    }
    const pwError = checkNewPassword(newPassword);
    if (pwError) {
      return res.status(400).json({ message: pwError });
    }

    const user = await User.findOne({
      resetTokenHash: hashToken(token),
      resetTokenExpires: { $gt: new Date() },
    });
    if (!user) {
      return res.status(400).json({ message: "Link sahi nahi hai ya purana ho gaya" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetTokenHash = null;
    user.resetTokenExpires = null;
    user.emailVerified = true; // reset link email se aaya, matlab email asli hai
    await user.save();

    res.json({ message: "Password badal gaya. Ab login karo." });
  } catch (error) {
    res.status(500).json({ message: "Password nahi badla ja saka" });
  }
};
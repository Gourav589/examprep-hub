const nodemailer = require("nodemailer");

const escapeHtml = (value) =>
  String(value ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[c]));

let transporter = null;

const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD,
      },
      tls:
        process.env.EMAIL_ALLOW_INSECURE_TLS === "true"
          ? { rejectUnauthorized: false }
          : undefined,
    });
  }
  return transporter;
};

exports.sendEmail = async ({ to, subject, html }) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
    throw new Error("Email settings .env mein nahi hain");
  }
  return getTransporter().sendMail({
    from: `"ExamPrep Hub" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
};

exports.membershipEmail = (user, until) => {
  const date = new Date(until).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return {
    subject: "Aapki ExamPrep Hub premium membership chalu ho gayi",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden">
        <div style="background:#2563eb;color:white;padding:18px 22px">
          <h2 style="margin:0">ExamPrep Hub</h2>
        </div>
        <div style="padding:22px;color:#1e293b">
          <p>Hi ${escapeHtml(user.name)},</p>
          <p>Aapka payment mil gaya hai. Aapki <b>premium membership chalu ho gayi hai</b>.</p>
          <p style="background:#f1f5f9;padding:12px 16px;border-radius:8px">
            Amount: <b>Rs 200</b><br/>
            Valid till: <b>${escapeHtml(date)}</b>
          </p>
          <p>Ab saare premium mock tests unlock hain. Practice shuru karo aur apna score badhao!</p>
          <p style="color:#64748b;font-size:13px">Agar yeh payment aapne nahi kiya, to is mail ka jawab dekar humein batao.</p>
        </div>
      </div>`,
  };
};
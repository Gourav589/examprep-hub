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

exports.resetEmail = (user, link) => ({
  subject: "ExamPrep Hub: password reset karo",
  html: `
    <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden">
      <div style="background:#2563eb;color:white;padding:18px 22px">
        <h2 style="margin:0">ExamPrep Hub</h2>
      </div>
      <div style="padding:22px;color:#1e293b">
        <p>Hi ${escapeHtml(user.name)},</p>
        <p>Aapke account ka password reset karne ki request mili hai. Neeche wale button par click karke naya password set karo.</p>
        <p style="margin:22px 0">
          <a href="${escapeHtml(link)}" style="background:#2563eb;color:white;padding:12px 22px;border-radius:8px;text-decoration:none;font-weight:bold">Password reset karo</a>
        </p>
        <p style="color:#64748b;font-size:13px">Yeh link 30 minute tak chalega aur sirf ek baar use hoga. Agar yeh request aapne nahi ki, to is mail ko ignore kar do, aapka password nahi badlega.</p>
      </div>
    </div>`,
});

exports.verifyEmailMail = (user, code, minutes) => ({
  subject: `ExamPrep Hub: aapka verification code ${code}`,
  html: `
    <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden">
      <div style="background:#2563eb;color:white;padding:18px 22px">
        <h2 style="margin:0">ExamPrep Hub</h2>
      </div>
      <div style="padding:22px;color:#1e293b">
        <p>Hi ${escapeHtml(user.name)},</p>
        <p>Apni email verify karne ke liye yeh code website par daalo:</p>
        <p style="font-size:34px;letter-spacing:8px;font-weight:bold;background:#f1f5f9;padding:14px;border-radius:10px;text-align:center">${escapeHtml(code)}</p>
        <p style="color:#64748b;font-size:13px">Yeh code ${escapeHtml(minutes)} minute tak chalega. Agar aapne account nahi banaya, to is mail ko ignore kar do.</p>
      </div>
    </div>`,
});
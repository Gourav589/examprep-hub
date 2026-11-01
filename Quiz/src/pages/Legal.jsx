import { Link } from "react-router-dom";
import useSeo from "../hooks/useSeo";
import { SITE } from "../config/site";
import "./Legal.css";

function buildPages() {
  const contactLine = `Questions about this page? Email us at ${SITE.email}.`;

  return {
    terms: {
      title: "Terms of Use",
      intro: `These terms explain how you can use ${SITE.name}.`,
      sections: [
        {
          h: "1. Accepting these terms",
          p: [
            `By creating an account or using ${SITE.name}, you agree to these terms. If you do not agree, please do not use the website.`,
          ],
        },
        {
          h: "2. Your account",
          p: [
            "You are responsible for keeping your password safe and for everything that happens in your account.",
            "Please give correct details when you sign up. One person should use one account.",
          ],
        },
        {
          h: "3. Using the tests",
          p: [
            "The tests are for your personal practice. Please do not copy, resell or bulk-share our questions or results, and do not try to break or bypass the security of the website.",
          ],
        },
        {
          h: "4. Premium membership",
          p: [
            `Premium costs Rs ${SITE.price} for ${SITE.days} days and unlocks premium exams. It is a one-time payment for that period and does not renew automatically. If you pay again before it ends, more days are added.`,
            "Payments are processed by Razorpay. Our refund rules are on the Refund Policy page.",
          ],
        },
        {
          h: "5. Content and accuracy",
          p: [
            "Questions are made for practice. We try to keep them correct, but we do not promise that they match any real exam or that they will guarantee a result.",
            `${SITE.name} is not connected to or endorsed by any government body, exam board or recruiting organisation. Job alerts come from public notifications. Always confirm the details on the official website before you apply.`,
          ],
        },
        {
          h: "6. Availability",
          p: [
            "We may change, pause or remove features at any time. The website may sometimes be unavailable because of maintenance or technical problems.",
          ],
        },
        {
          h: "7. Suspending accounts",
          p: [
            "We may suspend or close an account that breaks these terms or misuses the website.",
          ],
        },
        {
          h: "8. Limits of responsibility",
          p: [
            "To the extent the law allows, we are not responsible for indirect loss, or for decisions you make based on the content of the website.",
          ],
        },
        {
          h: "9. Changes",
          p: [
            "We may update these terms. The date at the top shows the latest version. If you keep using the website after an update, you accept the new terms.",
          ],
        },
        { h: "10. Contact", p: [contactLine] },
      ],
    },

    privacy: {
      title: "Privacy Policy",
      intro: `This page explains what information ${SITE.name} keeps and why.`,
      sections: [
        {
          h: "1. What we collect",
          p: [
            "Your name and email address, and your password (stored only as a one-way hash, so we cannot read it).",
            "Your test attempts, scores and section-wise results.",
            "Payment records: Razorpay order and payment ids, amount, status and date.",
            "We do not store your card, UPI or bank details. Those are handled by Razorpay.",
          ],
        },
        {
          h: "2. How we use it",
          p: [
            "To run your account, show your results, progress and leaderboard rank, and calculate analytics such as percentile and score trends.",
            "To process your membership and send confirmation emails, and to keep the website secure.",
          ],
        },
        {
          h: "3. Leaderboard",
          p: [
            "The leaderboard shows only your first name, the first letter of your last name, and your best score. Your email is never shown.",
          ],
        },
        {
          h: "4. Data on your device",
          p: [
            "To keep you logged in, we save a login token in your browser (local storage). Logging out removes it.",
          ],
        },
        {
          h: "5. Who else handles data",
          p: [
            "Razorpay processes payments. An email service sends our confirmation emails. Our hosting and database providers store the website data.",
            "We do not sell your personal data.",
          ],
        },
        {
          h: "6. Security",
          p: [
            "We protect accounts with hashed passwords and access checks on the server. No system is perfectly secure, so please use a strong password and do not share it.",
          ],
        },
        {
          h: "7. Your choices",
          p: [
            `You can ask us to show, correct or delete your data by emailing ${SITE.email}. If we delete your account, your results are deleted too.`,
          ],
        },
        {
          h: "8. Changes",
          p: ["We may update this policy. The date at the top shows the latest version."],
        },
        { h: "9. Contact", p: [contactLine] },
      ],
    },

    refund: {
      title: "Refund Policy",
      intro: `This page explains refunds for the ${SITE.name} premium membership.`,
      sections: [
        {
          h: "1. Premium is a digital service",
          p: [
            "Premium access starts immediately after payment. Because the service is delivered right away, payments are generally not refundable.",
          ],
        },
        {
          h: "2. When we will help",
          p: [
            "You were charged twice for the same plan.",
            "Your payment was successful but premium was not activated.",
            "A technical problem on our side stops you from using premium.",
          ],
        },
        {
          h: "3. How to ask",
          p: [
            `Email ${SITE.email} within 7 days of the payment. Please include your registered email, the Razorpay payment id and a screenshot, if you have one.`,
          ],
        },
        {
          h: "4. How long it takes",
          p: [
            "We review requests within 5 to 7 working days. An approved refund goes back to the original payment method, and your bank may take a few more days to show it.",
          ],
        },
        {
          h: "5. Failed payments",
          p: [
            "If money is deducted but the payment fails, the amount is usually returned automatically by the bank or Razorpay within a few working days.",
          ],
        },
        { h: "6. Contact", p: [contactLine] },
      ],
    },
  };
}

function Legal({ kind }) {
  const pages = buildPages();
  const page = pages[kind];

  useSeo(
    `${page.title} | ${SITE.name}`,
    `${page.title} of ${SITE.name}.`
  );

  return (
    <div className="lg-wrap">
      <h1>{page.title}</h1>
      <p className="lg-updated">Last updated: {SITE.updated}</p>
      <p className="lg-intro">{page.intro}</p>

      {page.sections.map((s) => (
        <div key={s.h} className="lg-section">
          <h3>{s.h}</h3>
          {s.p.map((text, i) => (
            <p key={i}>{text}</p>
          ))}
        </div>
      ))}

      <div className="lg-links">
        <Link to="/terms">Terms</Link>
        <Link to="/privacy">Privacy</Link>
        <Link to="/refund-policy">Refund</Link>
        <Link to="/contact">Contact</Link>
      </div>
    </div>
  );
}

export default Legal;
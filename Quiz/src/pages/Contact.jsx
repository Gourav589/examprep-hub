import { Link } from "react-router-dom";
import useSeo from "../hooks/useSeo";
import { SITE } from "../config/site";
import "./Legal.css";

function Contact() {
  useSeo(`Contact Us | ${SITE.name}`, `Contact ${SITE.name} for support, payment or account help.`);

  return (
    <div className="lg-wrap">
      <h1>Contact Us</h1>
      <p className="lg-intro">Koi sawal ya dikkat ho to hum madad ke liye yahan hain.</p>

      <div className="lg-section">
        <h3>Email</h3>
        <p>
          <a href={`mailto:${SITE.email}`} className="lg-mail">{SITE.email}</a>
        </p>
        <p>Hum aam taur par 2 working days ke andar jawab dete hain.</p>
      </div>

      <div className="lg-section">
        <h3>Mail mein yeh batao</h3>
        <p>Apni registered email, dikkat ka chhota vivaran, aur payment ke liye Razorpay payment id.</p>
      </div>

      <div className="lg-section">
        <h3>Zaroori links</h3>
        <p>
          <Link to="/terms">Terms of Use</Link> |{" "}
          <Link to="/privacy">Privacy Policy</Link> |{" "}
          <Link to="/refund-policy">Refund Policy</Link>
        </p>
      </div>
    </div>
  );
}

export default Contact;
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";
import useSeo from "../hooks/useSeo";
import usePricing from "../hooks/usePricing";
import Countdown from "../components/Countdown";
import { clearPremiumCache } from "../hooks/usePremium";
import "./Membership.css";

function loadCheckout() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

function Membership() {
  useSeo(
    "Premium Membership | ExamPrep Hub",
    "Unlock every premium mock test with a monthly membership."
  );

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const { pricing, offset, refresh } = usePricing();

  const [status, setStatus] = useState(null);
  const [paying, setPaying] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });

  const loadStatus = () => {
    API.get("/payments/status")
      .then((res) => setStatus(res.data))
      .catch(() => {});
  };

  useEffect(() => {
    if (user && user.role !== "admin") loadStatus();
  }, []);

  const handlePay = async () => {
    setMsg({ type: "", text: "" });

    if (!user) {
      navigate("/login");
      return;
    }
    if (!pricing) return;

    setPaying(true);

    const ok = await loadCheckout();
    if (!ok) {
      setMsg({ type: "err", text: "Razorpay load nahi hua. Internet check karo." });
      setPaying(false);
      return;
    }

    try {
      const { data } = await API.post("/payments/create-order");

      // Agar offer isi beech khatam ho gaya ho, to chupchap naye price par charge nahi karte
      if (data.amount !== pricing.price * 100) {
        await refresh();
        setMsg({
          type: "err",
          text: `Offer abhi khatam ho gaya. Ab price ₹${data.amount / 100} hai. Dekhkar dobara try karo.`,
        });
        setPaying(false);
        return;
      }

      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: "ExamPrep Hub",
        description: `Premium membership (${pricing.days} din)`,
        order_id: data.orderId,
        prefill: { name: data.name, email: data.email },
        theme: { color: "#2563eb" },
        handler: async (response) => {
          try {
            const res = await API.post("/payments/verify", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            clearPremiumCache();
            setMsg({ type: "ok", text: res.data.message });
            loadStatus();
          } catch (err) {
            setMsg({
              type: "err",
              text: err.response?.data?.message || "Payment verify nahi hua",
            });
          }
          setPaying(false);
        },
        modal: {
          ondismiss: () => setPaying(false),
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (resp) => {
        setMsg({
          type: "err",
          text: resp.error?.description || "Payment fail ho gaya",
        });
        setPaying(false);
      });
      rzp.open();
    } catch (err) {
      setMsg({
        type: "err",
        text: err.response?.data?.message || err.message,
      });
      setPaying(false);
    }
  };

  const isAdmin = user && user.role === "admin";
  const offer = pricing && pricing.offerActive;

  return (
    <div className="section">
      <h1>Premium Membership</h1>
      <p className="mb-sub">Har exam ke saare tests unlock karo, {pricing ? pricing.days : 30} din ke liye.</p>

      {status && status.isPremium && (
        <div className="mb-active">
          Aapki membership chalu hai
          {status.premiumUntil &&
            ` (${new Date(status.premiumUntil).toLocaleDateString()} tak)`}
          . Dobara pay karoge to {pricing ? pricing.days : 30} din aur jud jayenge.
        </div>
      )}

      {msg.text && <div className={"mb-msg " + msg.type}>{msg.text}</div>}

      <div className={"mb-card" + (offer ? " mb-card-offer" : "")}>
        {offer && (
          <div className="mb-ribbon">🎉 {pricing.savePercent}% OFF | Limited offer</div>
        )}

        <span className="mb-tag">Monthly Plan</span>

        <div className="mb-price">
          {offer && <s className="mb-old">₹{pricing.listPrice}</s>}
          ₹{pricing ? pricing.price : "--"}{" "}
          <small>/ {pricing ? pricing.days : 30} din</small>
        </div>

        {offer && (
          <div className="mb-offer">
            <span>
              Aapki bachat: <b>₹{pricing.listPrice - pricing.offerPrice}</b>
            </span>
            <Countdown
              endsAt={pricing.endsAt}
              offset={offset}
              label="Offer khatam hone mein"
              onDone={refresh}
            />
          </div>
        )}

        <ul className="mb-list">
          <li>✔ Har exam ke saare tests (Test 2 aur aage ke sab)</li>
          <li>✔ Section-wise result aur analytics</li>
          <li>✔ Leaderboard aur rank</li>
          <li>✔ Kabhi bhi cancel, auto-renew nahi</li>
        </ul>

        {isAdmin ? (
          <p className="mb-note">Admin ko membership ki zaroorat nahi hai.</p>
        ) : (
          <button className="mb-btn" onClick={handlePay} disabled={paying || !pricing}>
            {paying
              ? "Please wait..."
              : !pricing
              ? "Loading..."
              : user
              ? `Pay ₹${pricing.price} and Unlock`
              : "Login karke Unlock karo"}
          </button>
        )}

        {offer && (
          <p className="mb-note">
            Offer khatam hone ke baad price ₹{pricing.listPrice} ho jayega.
          </p>
        )}
        <p className="mb-note">
          Payment Razorpay se hota hai. Aapke card ya UPI ki details is website par save nahi hoti.
        </p>
      </div>

      <p style={{ marginTop: "18px" }}>
        <Link to="/exams" className="card-btn">Mock Tests dekho</Link>
      </p>
    </div>
  );
}

export default Membership;
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import "../pages/DailyQuiz.css";

function DailyQuizCard() {
  const user = JSON.parse(localStorage.getItem("user"));
  const isStudent = user && user.role !== "admin";
  const [streak, setStreak] = useState(null);

  useEffect(() => {
    if (!isStudent) return;
    API.get("/daily/streak")
      .then((res) => setStreak(res.data))
      .catch(() => {});
  }, [isStudent]);

  if (user && user.role === "admin") return null;

  const done = streak && streak.todayDone;

  return (
    <section className="section">
      <div className="dqc">
        <div className="dqc-flame">🔥</div>
        <div className="dqc-text">
          <h3>Daily Quiz</h3>
          {isStudent && streak ? (
            <p>
              {streak.current > 0
                ? `${streak.current} din ki streak chal rahi hai. `
                : "Aaj se streak shuru karo. "}
              {done ? "Aaj ka quiz ho gaya ✔" : "Aaj ka 10 question ka quiz abhi baaki hai."}
            </p>
          ) : (
            <p>Roz 10 free questions. Streak banao aur 3, 7, 30 din ke badge jeeto.</p>
          )}
        </div>
        <Link to="/daily" className="dqc-btn">
          {done ? "Result dekho" : user ? "Aaj ka quiz do" : "Login karke shuru karo"}
        </Link>
      </div>
    </section>
  );
}

export default DailyQuizCard;
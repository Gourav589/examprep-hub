import { useState, useEffect } from "react";
import API from "../services/api";

let cached = null;

export function clearPremiumCache() {
  cached = null;
}

function usePremium() {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));
  const isAdmin = user && user.role === "admin";

  const [active, setActive] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      setActive(true);
      return;
    }
    if (!token) {
      setActive(false);
      return;
    }
    if (cached && cached.token === token && Date.now() - cached.time < 30000) {
      setActive(cached.active);
      return;
    }
    API.get("/payments/status")
      .then((res) => {
        cached = { token, active: res.data.isPremium, time: Date.now() };
        setActive(res.data.isPremium);
      })
      .catch(() => setActive(false));
  }, [token, isAdmin]);

  return active;
}

export default usePremium;
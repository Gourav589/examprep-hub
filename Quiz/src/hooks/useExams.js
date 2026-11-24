import { useState, useEffect } from "react";
import API from "../services/api";

let cache = null;
let pending = null;

// Exams ki list ek baar laata hai aur 5 minute yaad rakhta hai
export default function useExams() {
  const [exams, setExams] = useState(cache ? cache.data : []);

  useEffect(() => {
    let alive = true;

    if (cache && Date.now() - cache.at < 5 * 60 * 1000) {
      setExams(cache.data);
      return;
    }

    if (!pending) {
      pending = API.get("/exams")
        .then((res) => {
          if (Array.isArray(res.data)) cache = { at: Date.now(), data: res.data };
          return cache ? cache.data : [];
        })
        .catch(() => [])
        .finally(() => {
          pending = null;
        });
    }

    pending.then((data) => {
      if (alive) setExams(data);
    });

    return () => {
      alive = false;
    };
  }, []);

  return exams;
}
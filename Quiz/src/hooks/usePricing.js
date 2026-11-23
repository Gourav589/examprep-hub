import { useState, useEffect, useCallback } from "react";
import API from "../services/api";

let cache = null; // { at, data, offset }

// Price aur offer server se laata hai. offset = server aur is device ke time ka fark,
// taaki countdown server ke samay se chale, device ki ghadi se nahi.
export default function usePricing() {
  const [state, setState] = useState(cache);

  const refresh = useCallback(() => {
    const sent = Date.now();
    return API.get("/pricing")
      .then((res) => {
        const mid = (sent + Date.now()) / 2;
        cache = { at: Date.now(), data: res.data, offset: res.data.serverNow - mid };
        setState(cache);
        return res.data;
      })
      .catch(() => null);
  }, []);

  useEffect(() => {
    if (cache && Date.now() - cache.at < 60000) {
      setState(cache);
      return;
    }
    refresh();
  }, [refresh]);

  return {
    pricing: state ? state.data : null,
    offset: state ? state.offset : 0,
    refresh,
  };
}
exports.getMyAnalytics = async (req, res) => {
  try {
    const base = process.env.ANALYTICS_URL || "http://127.0.0.1:8000";
    const key = process.env.ANALYTICS_KEY;

    if (!key) {
      return res.status(500).json({ message: "Analytics key set nahi hai" });
    }

    const response = await fetch(`${base}/analytics/${req.userId}`, {
      headers: { "x-api-key": key },
    signal: AbortSignal.timeout(60000),
    });

    if (!response.ok) {
      return res.status(502).json({ message: "Analytics service se sahi jawab nahi mila" });
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(503).json({ message: "Analytics service abhi chalu nahi hai" });
  }
};
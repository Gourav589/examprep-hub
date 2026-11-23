const express = require("express");
const { getPricing } = require("../config/pricing");

const router = express.Router();

router.get("/", (req, res) => {
  res.set("Cache-Control", "no-store");
  res.json(getPricing());
});

module.exports = router;
const express = require("express");
const {
  signup,
  login,
  updateProfile,
  changePassword,
} = require("../controllers/authController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.put("/profile", protect, updateProfile);
router.put("/password", protect, changePassword);

module.exports = router;
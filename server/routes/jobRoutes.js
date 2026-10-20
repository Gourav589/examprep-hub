const express = require("express");
const { getJobs, createJob, deleteJob } = require("../controllers/jobController");
const protect = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");

const router = express.Router();

router.get("/", getJobs);
router.post("/", protect, adminOnly, createJob);
router.delete("/:id", protect, adminOnly, deleteJob);

module.exports = router;
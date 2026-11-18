const express = require("express");
const {
  getResources,
  getResource,
  createResource,
  updateResource,
  deleteResource,
} = require("../controllers/resourceController");
const protect = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");

const router = express.Router();

router.get("/", getResources);
router.get("/:id", getResource);
router.post("/", protect, adminOnly, createResource);
router.put("/:id", protect, adminOnly, updateResource);
router.delete("/:id", protect, adminOnly, deleteResource);

module.exports = router;
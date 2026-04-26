const express = require("express");
const router = express.Router();

const { requireAuth } = require("../middleware/authMiddleware");
const {
  getApplications,
  createApplication,
  updateApplication,
  deleteApplication,
} = require("../controllers/applicationController");

router.get("/", requireAuth, getApplications);
router.post("/", requireAuth, createApplication);
router.put("/:id", requireAuth, updateApplication);
router.delete("/:id", requireAuth, deleteApplication);

module.exports = router;
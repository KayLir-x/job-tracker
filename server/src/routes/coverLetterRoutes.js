const express = require("express");
const router = express.Router();

const { requireAuth } = require("../middleware/authMiddleware");
const {
  getCoverLetters,
  createCoverLetter,
  updateCoverLetter,
  deleteCoverLetter,
} = require("../controllers/coverLetterController");

router.get("/", requireAuth, getCoverLetters);
router.post("/", requireAuth, createCoverLetter);
router.put("/:id", requireAuth, updateCoverLetter);
router.delete("/:id", requireAuth, deleteCoverLetter);

module.exports = router;
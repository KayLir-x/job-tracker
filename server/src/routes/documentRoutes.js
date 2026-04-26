const express = require("express");
const router = express.Router();

const { requireAuth } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
const {
  getDocuments,
  uploadDocument,
  deleteDocument,
} = require("../controllers/documentController");

router.get("/", requireAuth, getDocuments);
router.post("/", requireAuth, upload.single("file"), uploadDocument);
router.delete("/:id", requireAuth, deleteDocument);

module.exports = router;
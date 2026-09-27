const express = require("express");

const {
  uploadDocument,
  getDocuments,
} = require("../controllers/documentController");

const {
  processDocument,
} = require("../controllers/documentProcessingController");

const protect = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

// Upload PDF
router.post(
  "/upload",
  protect,
  upload.single("pdf"),
  uploadDocument
);

// Get user's documents
router.get(
  "/",
  protect,
  getDocuments
);

// Process PDF
router.post(
  "/:id/process",
  protect,
  processDocument
);

module.exports = router;
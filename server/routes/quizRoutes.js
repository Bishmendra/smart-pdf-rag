const express = require("express");

const {
  generateDocumentQuiz,
} = require("../controllers/quizController");

const protect = require(
  "../middleware/authMiddleware"
);

const router =
  express.Router();

router.post(
  "/generate",
  protect,
  generateDocumentQuiz
);

module.exports = router;
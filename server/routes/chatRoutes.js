const express = require("express");

const {
  chatWithDocument,
} = require(
  "../controllers/chatController"
);

const protect = require(
  "../middleware/authMiddleware"
);

const router =
  express.Router();

router.post(
  "/",
  protect,
  chatWithDocument
);

module.exports = router;

const express = require("express");
const cors = require("cors");
require("dotenv").config();

const db = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const documentRoutes = require("./routes/documentRoutes");
const quizRoutes = require(
  "./routes/quizRoutes"
);

const chatRoutes =
  require("./routes/chatRoutes");

const protect = require("./middleware/authMiddleware");

const app = express();


// ===============================
// MIDDLEWARE
// ===============================

app.use(cors());

app.use(express.json());


app.use(
  "/api/quiz",
  quizRoutes
);
// ===============================
// BASIC ROUTE
// ===============================

app.get("/", (req, res) => {
  res.json({
    message: "Smart PDF RAG Backend is running!",
  });
});


// ===============================
// DATABASE TEST
// ===============================

app.get("/api/test-db", async (req, res) => {
  try {

    const [rows] = await db.query(
      "SELECT 1 + 1 AS result"
    );

    res.json({
      success: true,
      database: "Connected",
      result: rows[0].result,
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: "Database connection failed",
      error: error.message,
    });
  }
});


// ===============================
// AUTH ROUTES
// ===============================

app.use(
  "/api/auth",
  authRoutes
);


// ===============================
// DOCUMENT ROUTES
// ===============================

app.use(
  "/api/documents",
  documentRoutes
);

app.use(
  "/api/chat",
  chatRoutes
);

// ===============================
// PROTECTED TEST ROUTE
// ===============================

app.get(
  "/api/profile",
  protect,
  (req, res) => {

    res.json({
      success: true,
      message:
        "Protected route accessed successfully",

      user: req.user,
    });

  }
);


// ===============================
// ERROR HANDLER
// ===============================

app.use(
  (error, req, res, next) => {

    console.error(error);

    if (
      error.message ===
      "Only PDF files are allowed"
    ) {

      return res.status(400).json({
        success: false,
        message: error.message,
      });

    }

    res.status(500).json({
      success: false,
      message: "Something went wrong",
    });

  }
);


// ===============================
// START SERVER
// ===============================

const PORT =
  process.env.PORT || 5000;

app.listen(PORT, () => {

  console.log(
    `Server is running on port ${PORT}`
  );

});
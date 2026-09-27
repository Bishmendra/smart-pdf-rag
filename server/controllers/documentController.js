const db = require("../config/db");

const uploadDocument = async (req, res) => {
  try {
    // Check whether a file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload a PDF file",
      });
    }

    // User comes from JWT middleware
    const userId = req.user.id;

    // Original PDF name
    const originalName = req.file.originalname;

    // Path where file is stored
    const filePath = req.file.path;

    // Insert document into MySQL
    const [result] = await db.query(
      `
      INSERT INTO documents
      (user_id, original_name, file_path, status)
      VALUES (?, ?, ?, ?)
      `,
      [
        userId,
        originalName,
        filePath,
        "uploaded",
      ]
    );

    res.status(201).json({
      success: true,
      message: "PDF uploaded successfully",

      document: {
        id: result.insertId,
        originalName,
        status: "uploaded",
      },
    });

  } catch (error) {
    console.error("Upload Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to upload PDF",
    });
  }
};


// Get documents belonging to logged-in user
const getDocuments = async (req, res) => {
  try {
    const userId = req.user.id;

    const [documents] = await db.query(
      `
      SELECT
        id,
        original_name,
        status,
        created_at
      FROM documents
      WHERE user_id = ?
      ORDER BY created_at DESC
      `,
      [userId]
    );

    res.json({
      success: true,
      documents,
    });

  } catch (error) {
    console.error(
      "Get Documents Error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to get documents",
    });
  }
};


module.exports = {
  uploadDocument,
  getDocuments,
};
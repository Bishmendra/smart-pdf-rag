const db = require("../config/db");

const {
  extractTextFromPDF,
} = require("../services/pdfService");

const {
  chunkText,
} = require("../services/chunkService");

const {
  embedChunks,
} = require("../services/embeddingService");

const processDocument = async (req, res) => {
  try {
    const userId = req.user.id;
    const documentId = req.params.id;

    // Find document belonging to logged-in user
    const [documents] = await db.query(
      `
      SELECT *
      FROM documents
      WHERE id = ?
      AND user_id = ?
      `,
      [documentId, userId]
    );

    if (documents.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    const document = documents[0];

    // Set status to processing
    await db.query(
      `
      UPDATE documents
      SET status = ?
      WHERE id = ?
      `,
      ["processing", documentId]
    );

    // Extract PDF text
    const pdfData =
      await extractTextFromPDF(
        document.file_path
      );

    // Check extracted text
    if (
  !pdfData.text ||
  pdfData.text.trim().length === 0
) {
  await db.query(
    `
    UPDATE documents
    SET status = ?
    WHERE id = ?
    `,
    ["failed", documentId]
  );

  return res.status(400).json({
    success: false,
    message:
      "No readable text was found in this PDF.",
  });
}

    // Create chunks
    const chunks =
  chunkText(pdfData.text).map(
    (chunk) => ({
      userId,
      documentId: document.id,
      chunkIndex: chunk.chunkIndex,
      text: chunk.text,
    })
  );

      // Generate embeddings
    const embeddedChunks =
  await embedChunks(chunks);
    // Update status
    await db.query(
      `
      UPDATE documents
      SET status = ?
      WHERE id = ?
      `,
      ["processed", documentId]
    );

    // Return processing information
    res.json({
      success: true,
      message:
        "PDF processed successfully",

      document: {
        id: document.id,
        name: document.original_name,
        pages: pdfData.numberOfPages,
        characters: pdfData.text.length,
        chunks: chunks.length,
      },
    });
  } catch (error) {
    console.error(
      "Document Processing Error:",
      error
    );

    try {
      const documentId = req.params.id;

      await db.query(
        `
        UPDATE documents
        SET status = ?
        WHERE id = ?
        `,
        ["failed", documentId]
      );
    } catch (dbError) {
      console.error(
        "Failed to update document status:",
        dbError
      );
    }

    res.status(500).json({
      success: false,
      message:
        "Failed to process PDF",
    });
  }
};

module.exports = {
  processDocument,
};
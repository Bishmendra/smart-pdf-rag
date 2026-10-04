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

const {
  upsertEmbeddings,
} = require("../services/vectorService");

const processDocument = async (req, res) => {
  const documentId = req.params.id;
  const userId = req.user.id;

  try {
    // 1. Get document
    const [documents] = await db.query(
      `
      SELECT *
      FROM documents
      WHERE id = ? AND user_id = ?
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

    // 2. Prevent duplicate processing
    if (document.status === "processing") {
      return res.status(409).json({
        success: false,
        message: "This PDF is already being processed",
      });
    }

    if (document.status === "processed") {
      return res.status(409).json({
        success: false,
        message: "This PDF has already been processed",
      });
    }

    // 3. Set processing status
    await db.query(
      `
      UPDATE documents
      SET status = ?
      WHERE id = ?
      `,
      ["processing", documentId]
    );

    console.log(
      `Processing document ${documentId}...`
    );

    // 4. Extract PDF text
    const pdfData =
      await extractTextFromPDF(
        document.file_path
      );

    if (
      !pdfData.text ||
      pdfData.text.trim().length === 0
    ) {
      throw new Error(
        "No readable text found in PDF"
      );
    }

    console.log(
      `Extracted ${pdfData.text.length} characters`
    );

    // 5. Chunk text
    const chunks = chunkText(
      pdfData.text
    );

    if (chunks.length === 0) {
      throw new Error(
        "No chunks generated from PDF"
      );
    }

    console.log(
      `Generated ${chunks.length} chunks`
    );

    // 6. Add metadata
    const chunksWithMetadata =
      chunks.map((chunk) => ({
        ...chunk,
        userId,
        documentId: Number(documentId),
      }));

    // 7. Generate embeddings
    const embeddedChunks =
      await embedChunks(
        chunksWithMetadata
      );

    // 8. Store vectors
    await upsertEmbeddings(
      embeddedChunks
    );

    // 9. Mark document as processed
    await db.query(
      `
      UPDATE documents
      SET status = ?
      WHERE id = ?
      `,
      ["processed", documentId]
    );

    console.log(
      `Document ${documentId} processed successfully`
    );

    // 10. Send response
    return res.json({
      success: true,

      message:
        "PDF processed successfully",

      document: {
        id: document.id,
        name: document.original_name,
        pages: pdfData.numberOfPages,
        characters:
          pdfData.text.length,
        chunks:
          embeddedChunks.length,
      },
    });

  } catch (error) {

    console.error(
      "Document Processing Error:",
      error
    );

    // Mark processing as failed
    try {
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

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to process PDF",
    });
  }
};

module.exports = {
  processDocument,
};
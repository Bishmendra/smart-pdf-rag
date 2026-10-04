const db = require("../config/db");

const {
  getDocumentChunks,
} = require("../services/vectorService");

const {
  generateQuiz,
} = require("../services/quizService");


const generateDocumentQuiz = async (
  req,
  res
) => {
  const documentId =
    req.body.documentId;

  const userId =
    req.user.id;

  try {
    if (!documentId) {
      return res.status(400).json({
        success: false,
        message:
          "Document ID is required",
      });
    }

    // --------------------------------
    // Verify document ownership
    // --------------------------------

    const [documents] =
      await db.query(
        `
        SELECT id, original_name, status
        FROM documents
        WHERE id = ?
        AND user_id = ?
        `,
        [
          documentId,
          userId,
        ]
      );

    if (documents.length === 0) {
      return res.status(404).json({
        success: false,
        message:
          "Document not found",
      });
    }

    const document =
      documents[0];

    // --------------------------------
    // PDF must already be processed
    // --------------------------------

    if (
      document.status !==
      "processed"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Please process the PDF before generating a quiz.",
      });
    }

    console.log(
      `Generating quiz for document ${documentId}...`
    );

    // --------------------------------
    // Get document chunks
    // --------------------------------

    const chunks =
      await getDocumentChunks(
        userId,
        documentId
      );

    if (
      !chunks ||
      chunks.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "No content found for this PDF.",
      });
    }

    console.log(
      `Retrieved ${chunks.length} document chunks`
    );

    // --------------------------------
    // Sort chunks by original index
    // --------------------------------

    chunks.sort(
      (a, b) =>
        (a.payload?.chunkIndex ?? 0) -
        (b.payload?.chunkIndex ?? 0)
    );

    // --------------------------------
    // Select representative chunks
    // --------------------------------

    let selectedChunks;

    const MAX_CHUNKS = 15;

    if (
      chunks.length <= MAX_CHUNKS
    ) {
      selectedChunks = chunks;
    } else {
      selectedChunks = [];

      const step =
        chunks.length /
        MAX_CHUNKS;

      for (
        let i = 0;
        i < MAX_CHUNKS;
        i++
      ) {
        const index = Math.floor(
          i * step
        );

        selectedChunks.push(
          chunks[index]
        );
      }
    }

    // --------------------------------
    // Build context
    // --------------------------------

    const context =
      selectedChunks
        .map(
          (chunk) =>
            chunk.payload?.text || ""
        )
        .filter(
          (text) => text.trim()
        )
        .join("\n\n");

    if (!context.trim()) {
      return res.status(400).json({
        success: false,
        message:
          "No readable content found in the PDF.",
      });
    }

    console.log(
      `Quiz context size: ${context.length} characters`
    );

    // --------------------------------
    // Generate quiz
    // --------------------------------

    const questions =
      await generateQuiz(
        context
      );

    console.log(
      `Generated ${questions.length} quiz questions`
    );

    // --------------------------------
    // Response
    // --------------------------------

    return res.json({
      success: true,

      document: {
        id: document.id,
        name:
          document.original_name,
      },

      questions,
    });

  } catch (error) {
    console.error(
      "Quiz Controller Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to generate quiz",
    });
  }
};


module.exports = {
  generateDocumentQuiz,
};
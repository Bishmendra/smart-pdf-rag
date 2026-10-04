const db = require("../config/db");

const {
  embedText,
} = require("../services/embeddingService");

const {
  searchSimilarChunks,
} = require("../services/vectorService");

const {
  generateAnswer,
} = require("../services/ollamaService");

const generalQuestions = [
  "hello",
  "hi",
  "hey",
  "what is your name",
  "who are you",
  "how are you",
  "thanks",
  "thank you",
  "good morning",
  "good afternoon",
  "good evening",
];

const summaryQuestions = [
  "summarize",
  "summarize is pdf",
  "summary",
  "summary of this pdf",
  "overview",
  "what is this pdf about",
  "what is this document about",
  "what does this pdf discuss",
  "what does this document discuss",
  "give me an overview",
];

const chatWithDocument = async (req, res) => {
  try {
    const {
      question,
      documentId,
    } = req.body;

    const userId = req.user.id;

    // --------------------------------
    // 1. Validate request
    // --------------------------------

    if (
      !question ||
      !question.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Question is required",
      });
    }

    if (!documentId) {
      return res.status(400).json({
        success: false,
        message:
          "Document ID is required",
      });
    }

    const cleanQuestion =
      question.trim();

    const normalizedQuestion =
      cleanQuestion.toLowerCase();

    // --------------------------------
    // 2. Handle general conversation
    // --------------------------------

    const isGeneralQuestion =
      generalQuestions.some(
        (item) =>
          normalizedQuestion === item ||
          normalizedQuestion.includes(item)
      );

    if (isGeneralQuestion) {
      return res.json({
        success: true,

        answer:
          "Hello! I'm your PDF assistant. I can answer questions about your uploaded PDF.",

        sources: [],
      });
    }

    // --------------------------------
    // 3. Verify document ownership
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
        message: "Document not found",
      });
    }

    const document =
      documents[0];

    // --------------------------------
    // 4. Check document status
    // --------------------------------

    if (
      document.status !==
      "processed"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Please process the PDF before asking questions.",
      });
    }

    // --------------------------------
    // 5. Detect summary question
    // --------------------------------

    const isSummaryQuestion =
      summaryQuestions.some(
        (keyword) =>
          normalizedQuestion.includes(
            keyword
          )
      );

    // --------------------------------
    // 6. Select retrieval size
    // --------------------------------

    const resultLimit =
      isSummaryQuestion
        ? 15
        : 5;

    console.log(
      `Question type: ${
        isSummaryQuestion
          ? "SUMMARY"
          : "NORMAL"
      }`
    );

    console.log(
      `Retrieving ${resultLimit} chunks...`
    );

    // --------------------------------
    // 7. Generate question embedding
    // --------------------------------

    const queryEmbedding =
      await embedText(
        cleanQuestion
      );

    // --------------------------------
    // 8. Search Qdrant
    // --------------------------------

    const results =
      await searchSimilarChunks(
        queryEmbedding,
        userId,
        documentId,
        resultLimit
      );

    // --------------------------------
    // 9. Validate results
    // --------------------------------

    const validResults =
      results.filter(
        (result) =>
          result.payload &&
          result.payload.text
      );

    if (
      validResults.length === 0
    ) {
      return res.json({
        success: true,

        answer:
          "I could not find relevant information in the uploaded PDF.",

        sources: [],
      });
    }

    // --------------------------------
    // 10. Build context
    // --------------------------------

    const context =
      validResults
        .map(
          (result) =>
            result.payload.text
        )
        .join("\n\n");

    // --------------------------------
    // 11. Generate answer
    // --------------------------------

    const answer =
      await generateAnswer(
        context,
        cleanQuestion
      );

    // --------------------------------
    // 12. Return response
    // --------------------------------

    return res.json({
      success: true,

      answer,

      sources:
        validResults.map(
          (result) => ({
            score:
              result.score,

            chunkIndex:
              result.payload
                .chunkIndex,

            text:
              result.payload.text,
          })
        ),
    });

  } catch (error) {

    console.error(
      "Chat Controller Error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Failed to generate answer",
    });
  }
};

module.exports = {
  chatWithDocument,
};
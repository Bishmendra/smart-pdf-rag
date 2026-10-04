const qdrant = require("../config/qdrant");
const crypto = require("crypto");
const COLLECTION_NAME =
  process.env.QDRANT_COLLECTION;


// Create collection if it does not exist
const createCollection = async (
  vectorSize
) => {
  try {
    const collections =
      await qdrant.getCollections();

    const collectionExists =
      collections.collections.some(
        (collection) =>
          collection.name ===
          COLLECTION_NAME
      );

    if (collectionExists) {
      console.log(
        `Qdrant collection "${COLLECTION_NAME}" already exists.`
      );

      return;
    }

    await qdrant.createCollection(
      COLLECTION_NAME,
      {
        vectors: {
          size: vectorSize,
          distance: "Cosine",
        },
      }
    );

    console.log(
      `Qdrant collection "${COLLECTION_NAME}" created.`
    );
  } catch (error) {
    console.error(
      "Qdrant Collection Error:",
      error
    );

    throw error;
  }
};


// Store embedded chunks in Qdrant
const upsertEmbeddings = async (
  embeddedChunks
) => {
  try {
    if (
      !embeddedChunks ||
      embeddedChunks.length === 0
    ) {
      return;
    }

    const points =
  embeddedChunks.map(
    (chunk) => ({
      id: crypto.randomUUID(),

      vector: chunk.embedding,

      payload: {
        userId: chunk.userId,
        documentId: chunk.documentId,
        chunkIndex: chunk.chunkIndex,
        text: chunk.text,
      },
    })
  );

    await qdrant.upsert(
      COLLECTION_NAME,
      {
        wait: true,
        points,
      }
    );

    console.log(
      `${points.length} embeddings stored in Qdrant.`
    );
  } catch (error) {
    console.error(
      "Qdrant Upsert Error:",
      error
    );

    throw new Error(
      "Failed to store embeddings in Qdrant"
    );
  }
};

const searchSimilarChunks = async (
  queryEmbedding,
  userId,
  documentId,
  limit = 5
) => {
  try {
    const response = await qdrant.query(
      COLLECTION_NAME,
      {
        query: queryEmbedding,

        limit,

        with_payload: true,

        filter: {
          must: [
            {
              key: "userId",
              match: {
                value: userId,
              },
            },
            {
              key: "documentId",
              match: {
                value: Number(documentId),
              },
            },
          ],
        },
      }
    );

    console.log(
      "Qdrant search response:",
      JSON.stringify(
        response,
        null,
        2
      )
    );

    return response.points || [];
  } catch (error) {
    console.error(
      "Qdrant Search Error:",
      error
    );

    throw new Error(
      "Failed to search Qdrant"
    );
  }
};


const getDocumentChunks = async (
  userId,
  documentId
) => {
  try {
    const response = await qdrant.scroll(
      COLLECTION_NAME,
      {
        filter: {
          must: [
            {
              key: "userId",
              match: {
                value: userId,
              },
            },
            {
              key: "documentId",
              match: {
                value: Number(documentId),
              },
            },
          ],
        },

        limit: 100,

        with_payload: true,

        with_vector: false,
      }
    );

    return response.points || [];
  } catch (error) {
    console.error(
      "Qdrant Document Chunks Error:",
      error
    );

    throw new Error(
      "Failed to retrieve document chunks"
    );
  }
};

module.exports = {
  createCollection,
  upsertEmbeddings,
  searchSimilarChunks,
  getDocumentChunks,
};
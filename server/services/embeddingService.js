const embedText = async (text) => {
  try {
    const response = await fetch(
      `${process.env.OLLAMA_BASE_URL}/api/embed`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          model:
            process.env.OLLAMA_EMBEDDING_MODEL,
          input: text,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();

      throw new Error(
        `Ollama API error: ${errorText}`
      );
    }

    const data = await response.json();

    if (
      !data.embeddings ||
      !data.embeddings[0]
    ) {
      throw new Error(
        "No embedding returned by Ollama"
      );
    }

    return data.embeddings[0];
  } catch (error) {
    console.error(
      "Embedding Error:",
      error
    );

    throw new Error(
      "Failed to generate embedding"
    );
  }
};


// Generate embeddings for multiple chunks
const embedChunks = async (chunks) => {
  const embeddedChunks = [];

  for (const chunk of chunks) {
    console.log(
      `Generating embedding for chunk ${chunk.chunkIndex}...`
    );

    const embedding = await embedText(
      chunk.text
    );

    embeddedChunks.push({
  userId: chunk.userId,
  documentId: chunk.documentId,
  chunkIndex: chunk.chunkIndex,
  text: chunk.text,
  embedding,
});
  }

  return embeddedChunks;
};


module.exports = {
  embedText,
  embedChunks,
};
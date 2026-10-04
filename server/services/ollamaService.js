const generateAnswer = async (
  context,
  question
) => {
  try {
    const prompt = `
You are a PDF question-answering assistant.

Your job is to answer the user's question using ONLY the information contained in the provided PDF context.

IMPORTANT RULES:

1. Use only the provided CONTEXT.
2. Do not use outside knowledge.
3. Do not invent facts.
4. Do not assume information that is not present.
5. If the answer cannot be found in the context, say:
   "I could not find the answer in the uploaded PDF."
6. For summary questions, combine the relevant information into a structured summary.
7. Use Markdown formatting.
8. Use headings for major sections.
9. Use bullet points for lists.
10. Use numbered lists for steps or processes.
11. Use **bold** for important concepts.
12. Keep explanations clear and organized.
13. Do not repeat the same information unnecessarily.
14. Do not mention the retrieval process, embeddings, Qdrant, or the context itself.
15. Answer directly without saying "According to the provided context" unless necessary.

FORMATTING EXAMPLE:

## Main Topic

Short explanation of the topic.

### Key Concepts

- **Concept 1** – Explanation.
- **Concept 2** – Explanation.
- **Concept 3** – Explanation.

### Process

1. **Step 1** – Explanation.
2. **Step 2** – Explanation.
3. **Step 3** – Explanation.

CONTEXT:
${context}

USER QUESTION:
${question}

ANSWER:
`;

    const response = await fetch(
      `${process.env.OLLAMA_BASE_URL}/api/generate`,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          model:
            process.env
              .OLLAMA_CHAT_MODEL ||
            "llama3.2",

          prompt,

          stream: false,
        }),
      }
    );

    if (!response.ok) {
      const errorText =
        await response.text();

      throw new Error(
        `Ollama API error: ${errorText}`
      );
    }

    const data =
      await response.json();

    if (!data.response) {
      throw new Error(
        "No response received from Ollama"
      );
    }

    return data.response.trim();

  } catch (error) {

    console.error(
      "Ollama Generation Error:",
      error
    );

    throw new Error(
      "Failed to generate answer"
    );
  }
};

module.exports = {
  generateAnswer,
};
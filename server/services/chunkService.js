const chunkText = (
  text,
  chunkSize = 800,
  overlap = 100
) => {
  if (!text || text.trim().length === 0) {
    return [];
  }

  const cleanedText = text
    .replace(/\s+/g, " ")
    .trim();

  const chunks = [];

  let start = 0;
  let chunkIndex = 0;

  while (start < cleanedText.length) {
    const end = Math.min(
      start + chunkSize,
      cleanedText.length
    );

    const chunk = cleanedText
      .slice(start, end)
      .trim();

    if (chunk.length > 0) {
      chunks.push({
        chunkIndex,
        text: chunk,
      });

      chunkIndex++;
    }

    if (end === cleanedText.length) {
      break;
    }

    start += chunkSize - overlap;
  }

  return chunks;
};

module.exports = {
  chunkText,
};
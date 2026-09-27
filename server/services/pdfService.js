const fs = require("fs");
const pdfParse = require("pdf-parse");

const extractTextFromPDF = async (filePath) => {
  try {
    // Read PDF file
    const dataBuffer = fs.readFileSync(filePath);

    // Extract PDF text
    const data = await pdfParse(dataBuffer);

    return {
      text: data.text,
      numberOfPages: data.numpages,
    };
  } catch (error) {
    console.error("PDF Extraction Error:", error);
    throw new Error("Failed to extract text from PDF");
  }
};

module.exports = {
  extractTextFromPDF,
};
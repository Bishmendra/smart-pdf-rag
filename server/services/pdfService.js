const fs = require("fs");
const {
  PDFParse,
} = require("pdf-parse");

const extractTextFromPDF = async (filePath) => {
  let parser;

  try {
    const dataBuffer = fs.readFileSync(
      filePath
    );

    parser = new PDFParse({
      data: dataBuffer,
    });

    const result =
      await parser.getText();

    return {
      text: result.text,
      numberOfPages:
        result.total ||
        result.numpages ||
        0,
    };
  } catch (error) {
    console.error(
      "PDF Extraction Error:",
      error
    );

    throw new Error(
      "Failed to extract text from PDF"
    );
  } finally {
    if (parser) {
      await parser.destroy();
    }
  }
};

module.exports = {
  extractTextFromPDF,
};
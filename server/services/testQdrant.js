require("dotenv").config();

const qdrant = require("./config/qdrant");

const testQdrant = async () => {
  try {
    const response =
      await qdrant.getCollections();

    console.log(
      "Qdrant connection successful!"
    );

    console.log(
      "Collections:",
      response.collections
    );
  } catch (error) {
    console.error(
      "Qdrant connection failed:"
    );

    console.error(
      error.message
    );
  }
};

testQdrant();
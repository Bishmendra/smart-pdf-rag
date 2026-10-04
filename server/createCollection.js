require("dotenv").config();

const {
  createCollection,
} = require("./services/vectorService");

const create = async () => {
  try {
    const vectorSize = 768;

    await createCollection(
      vectorSize
    );

    console.log(
      "Collection setup complete."
    );
  } catch (error) {
    console.error(
      "Collection setup failed:",
      error.message
    );
  }
};

create();
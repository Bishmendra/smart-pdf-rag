const {
  QdrantClient,
} = require("@qdrant/js-client-rest");

const qdrant = new QdrantClient({
  url: process.env.QDRANT_URL,
});

module.exports = qdrant;
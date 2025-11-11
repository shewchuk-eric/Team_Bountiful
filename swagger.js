const swaggerAutogen = require('swagger-autogen')();

const doc = {
  info: {
    title: 'Book of Mormon Characters API',
    description: 'A searchable database of characters found in the Book of Mormon.',
  },
  host: 'localhost:3000'
};

const outputFile = './swagger.json';
const routes = ['./routes/index.js'];


swaggerAutogen(outputFile, routes, doc);
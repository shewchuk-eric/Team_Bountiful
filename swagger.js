const swaggerAutogen = require('swagger-autogen')();

const doc = {
  info: {
    title: 'Book of Mormon Characters API',
    description: 'A searchable database of characters found in the Book of Mormon.',
  },
  host: 'localhost:3000', // Local development = 'localhost:3000' Remote =  'team-bountiful.onrender.com'
  schemes: ['http'], // Local development = 'http' Remote = 'https
};

const outputFile = './swagger.json';
const routes = ['./routes/index.js'];


swaggerAutogen(outputFile, routes, doc);
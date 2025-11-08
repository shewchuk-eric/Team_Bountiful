const swaggerAutogen = require('swagger-autogen')();

const doc = {
  info: {
    title: 'My Pizza Ordering API',
    description: 'Manage customers and their orders at my imaginary pizza factory with a MongoDB backend.',
  },
  host: 'localhost:3000'
};

const outputFile = './swagger.json';
const routes = ['./routes/index.js'];


swaggerAutogen(outputFile, routes, doc);
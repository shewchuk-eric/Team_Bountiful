const quotes = require('express').Router();
const quotesController = require('../controllers/con_quotes.js');


quotes.get('/', quotesController.listAll);
quotes.get('/:book', quotesController.listByBook);
quotes.get('/:id', quotesController.listByCharacter);
quotes.post('/createNewQuote/', quotesController.createNewQuote);
quotes.put('/updateQuote/:id', quotesControllerr.updateQuote);


module.exports = users;
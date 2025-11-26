const quotes = require('express').Router();
const quotesController = require('../controllers/con_quotes.js');

quotes.get('/', quotesController.listAll);
quotes.get('/listByBook/:book', quotesController.listByBook);
// quotes.get('/listByCharacter/:id', quotesController.listByCharacter);
quotes.get('/listByCharacter/:character', quotesController.listByCharacter);
quotes.post('/createNewQuote', quotesController.createNewQuote);
quotes.put('/updateQuote/:id', quotesController.updateQuote);
quotes.delete('/removeQuote/:id', quotesController.removeQuote);

module.exports = quotes;

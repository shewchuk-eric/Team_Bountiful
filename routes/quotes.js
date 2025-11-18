const quotes = require('express').Router();
const quotesController = require('../controllers/con_quotes.js');
const { ensureAuthenticated, ensureAdmin } = require('../models/utilities');

// require login
quotes.get('/', ensureAuthenticated, quotesController.listAll);
quotes.get('/:book', ensureAuthenticated, quotesController.listByBook);
quotes.get('/:id', ensureAuthenticated, quotesController.listByCharacter);

//admin only
quotes.post('/createNewQuote', ensureAdmin, quotesController.createNewQuote);
quotes.put('/updateQuote/:id', ensureAdmin, quotesController.updateQuote);

module.exports = quotes;

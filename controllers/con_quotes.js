let username;

const mongodb = require('../db/connect');
const ObjectId = require('mongodb').ObjectId; 
// const { userSchema, requireLogin, getToday } = require('../models/utilities');
// const today = getToday();

//TODO: Implement the following character controller functions


//quotes.get('/', quotesController.listAll);
//quotes.get('/:book', quotesController.listByBook);
//quotes.get('/:id', quotesController.listByCharacter);
//quotes.post('/createNewQuote/', quotesController.createNewQuote);
//quotes.put('/updateQuote/:id', quotesControllerr.updateQuote);


module.exports = { listAll, listByBook, listByCharacter, createNewQuote, updateQuote };
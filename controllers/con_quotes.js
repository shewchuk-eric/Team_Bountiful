const mongodb = require('../db/connect');
const ObjectId = require('mongodb').ObjectId;
const {
  requireLogin
} = require('../models/utilities');


//TODO: Implement the following character controller functions

// GET: RETRIEVE ALL QUOTES
const listAll = async (req, res) => {
  /*
    #swagger.tags = ['GET: Quotes']
  */

  /* let user = requireLogin(req, res, next);
    if (!user) {
      res.status(403).json({ message: 'Forbidden. You must be signed in to use this resource.' });
      return;
    } */ // Validation for user level access - remove comment marks when sign-in is functional
  const result = await mongodb.getDb().db('team_bountiful').collection('quotes').find({});
  result.toArray().then((lists) => {
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(lists);
  });
};

// GET: LIST ALL QUOTES BY BOOK
const listByBook = async (req, res) => {
  /*
    #swagger.tags = ['GET: Quotes']
  */

  //validate user login
  const bookName = req.params.book
  const result = await mongodb.getDb().db('team_bountiful').collection('quotes').find({
    whereFound: {
      $regex: new RegExp(bookName, 'i')
    }
  });
  result.toArray().then((lists) => {
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(lists);
  });
};


// GET: LIST ALL QUOTES BY CHARACTER
const listByCharacter = async (req, res) => {
  /*
    #swagger.tags = ['GET: Quotes']
  */

  //validate user login
  const character = req.params.id
  const result = await mongodb.getDb().db('team_bountiful').collection('quotes').find({
    characterId: character
  });
  result.toArray().then((lists) => {
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(lists);
  });
};

// POST: CREATE ON QUOTE
const createNewQuote = async (req, res) => {
  /*
    #swagger.tags = ['POST: Quotes']
  */

  // validate user login - maybe admin level access? (allow users to create their own quotes?)
  const quote = {
    characterId: req.body.characterId,
    characterName: req.body.characterName,
    whereFound: req.body.whereFound,
    characterQuality: req.body.characterQuality,
    text: req.body.text
  };

  const response = await mongodb.getDb().db('team_bountiful').collection('quotes').insertOne(quote);
  if (response.acknowledged) {
    res.status(201).json(response);
  } else {
    res.status(500).json(response.error || 'Something went wrong - quote not inserted.');
  };
};

// PUT: UPDATE QUOTE BY ID
const updateQuote = async (req, res) => {
  /*
    #swagger.tags = ['DELETE: Quotes']
  */

  // validate user login - maybe admin level access? (allow users to only update their own quotes?)
  try {
    const quoteId = new ObjectId(req.params.id);
    const quote = {
      characterId: req.body.characterId,
      characterName: req.body.characterName,
      whereFound: req.body.whereFound,
      characterQuality: req.body.characterQuality,
      text: req.body.text
    };
    const response = await mongodb.getDb().db('team_bountiful').collection('quotes').replaceOne({
      _id: quoteId
    }, quote);
    if (response.modifiedCount > 0) {
      res.status(204).send();
    } else {
      return res.status(404).json({
        messsage: 'The quote with the specified id was not found or there was not a change in the request body.'
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: error.message || 'An internal server error occurred.'
    });
  }
};


module.exports = {
  listAll,
  listByBook,
  listByCharacter,
  createNewQuote,
  updateQuote
};
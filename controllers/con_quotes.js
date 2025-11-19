const mongodb = require('../db/connect');
const ObjectId = require('mongodb').ObjectId;
const {
  requireLogin
} = require('../models/utilities');


//TODO: Implement the following character controller functions
const listAll = async (req, res) => {
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

const listByBook = async (req, res) => {
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

const listByCharacter = async (req, res) => {
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

const createNewQuote = async (req, res) => {
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

const updateQuote = async (req, res) => {
  // validate user login - maybe admin level access? (allow users to only update their own quotes?)
};


module.exports = {
  listAll,
  listByBook,
  listByCharacter,
  createNewQuote,
  updateQuote
};
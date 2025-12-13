const mongodb = require('../db/connect');
const ObjectId = require('mongodb').ObjectId;
const { requireLogin, quoteSchema } = require('../models/utilities');

// GET: RETRIEVE ALL QUOTES (PUBLIC)
const listAll = async (req, res) => {
  /*
    #swagger.tags = ['Quotes']
    #swagger.description = 'List all quotes.'
  */

  try {
    const result = await mongodb.getDb().db('team_bountiful').collection('quotes').find({});
    result.toArray().then((lists) => {
      res.setHeader('Content-Type', 'application/json');
      res.status(200).json(lists);
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || 'An internal server error occurred.'
    });
  }
};

// GET: LIST ALL QUOTES BY BOOK (PUBLIC)
const listByBook = async (req, res) => {
  /*
    #swagger.tags = ['Quotes']
    #swagger.description = 'List all quotes by book.'
  */

  try {
    const bookParam = req.params.book;
    const result = await mongodb.getDb().db('team_bountiful').collection('quotes').find({
      bookName: bookParam
    });

    result.toArray().then((lists) => {
      if (lists.length === 0) {
        return res.status(404).json({ message: 'No quotes with the specified book were found.' });
      }
      res.setHeader('Content-Type', 'application/json');
      res.status(200).json(lists);
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || 'An internal server error occurred.'
    });
  }
};

// GET: LIST ALL QUOTES BY CHARACTER (PUBLIC)
const listByCharacter = async (req, res) => {
  /*
    #swagger.tags = ['Quotes']
    #swagger.description = 'List all quotes by character.'
  */

  try {
    const characterParam = req.params.character;
    const result = await mongodb.getDb().db('team_bountiful').collection('quotes').find({
      characterName: characterParam
    });

    result.toArray().then((lists) => {
      if (lists.length === 0) {
        return res.status(404).json({ message: 'No quotes with the specified character were found.' });
      }
      res.setHeader('Content-Type', 'application/json');
      res.status(200).json(lists);
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || 'An internal server error occurred.'
    });
  }
};

// POST: CREATE ONE QUOTE (ADMIN ONLY)
const createNewQuote = async (req, res) => {
  /*
    #swagger.tags = ['Quotes']
    #swagger.description = 'Create a new quote.'
  */

  try {
    let user = requireLogin(req, res);
    if (!user || req.session.accessLevel != 'admin') {
      console.log('Access level insufficient:', req.session.accessLevel);
      res.status(403).json({ message: 'Forbidden. You do not have access to this resource.' });
      return;
    }

    const { error } = quoteSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const quote = {
      characterId: req.body.characterId,
      characterName: req.body.characterName,
      bookName: req.body.bookName,
      verse: req.body.verse,
      characterQuality: req.body.characterQuality,
      text: req.body.text
    };

    const response = await mongodb.getDb().db('team_bountiful').collection('quotes').insertOne(quote);
    if (response.acknowledged) {
      res.status(201).json(response);
    }
  } catch (error) {
    return res.status(500).json({
      message: error.message || 'An internal server error occurred.'
    });
  }
};

// PUT: UPDATE QUOTE BY ID (ADMIN ONLY)
const updateQuote = async (req, res) => {
  /*
    #swagger.tags = ['Quotes']
    #swagger.description = 'Update quote by id.'
  */

  try {
    let user = requireLogin(req, res);
    if (!user || req.session.accessLevel != 'admin') {
      console.log('Access level insufficient:', req.session.accessLevel);
      res.status(403).json({ message: 'Forbidden. You do not have access to this resource.' });
      return;
    }

    const { error } = quoteSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const quoteId = new ObjectId(req.params.id);
    const quote = {
      characterId: req.body.characterId,
      characterName: req.body.characterName,
      bookName: req.body.bookName,
      verse: req.body.verse,
      characterQuality: req.body.characterQuality,
      text: req.body.text
    };

    const response = await mongodb.getDb().db('team_bountiful').collection('quotes').replaceOne(
      { _id: quoteId },
      quote
    );

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

// DELETE: DELETE QUOTE BY ID (ADMIN ONLY)
const removeQuote = async (req, res) => {
  /*
    #swagger.tags = ['Quotes']
    #swagger.description = 'Delete quote by id.'
  */

  try {
    let user = requireLogin(req, res);
    if (!user || req.session.accessLevel != 'admin') {
      console.log('Access level insufficient:', req.session.accessLevel);
      res.status(403).json({ message: 'Forbidden. You do not have access to this resource.' });
      return;
    }

    const quoteId = new ObjectId(req.params.id);
    const response = await mongodb.getDb().db('team_bountiful').collection('quotes').deleteOne({ _id: quoteId });

    if (response.deletedCount === 1) {
      res.status(200).json({ message: 'The quote with the specified id was successfully deleted.' });
    } else {
      return res.status(404).json({ messsage: 'The quote with the specified id was not found.' });
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
  updateQuote,
  removeQuote
};

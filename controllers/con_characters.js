const mongodb = require('../db/connect');
const ObjectId = require('mongodb').ObjectId; 
const { ensureAuthenticated } = require('../models/utilities'); // may need to add a second validation function 


//TODO: Implement the following character controller functions
const listAll = async (req, res) => {
/* let user = ensureAuthenticated(req, res, next);
  if (!user) {
    res.status(403).json({ message: 'Forbidden. You must be signed in to use this resource.' });
    return;
  } */ // Validation for user level access - remove comment marks when sign-in is functional
  const result = await mongodb.getDb().db('team_bountiful').collection('characters').find({});
  result.toArray().then((lists) => {
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(lists);
  });
};

const listDetails = async (req, res) => {
//validate user login
  const charId = new ObjectId(req.params.id);
  const result = await mongodb.getDb().db('team_bountiful').collection('characters').find({ _id: charId });
    result.toArray().then((lists) => {
        res.setHeader('Content-Type', 'application/json');
        res.status(200).json(lists);
    });
};

const listByBook = async (req, res) => {
//validate user login
  const bookParam = req.params.book;
  const result = await mongodb.getDb().db('team_bountiful').collection('characters').find({ firstBookSeen: req.params.book });
    result.toArray().then((lists) => {
        res.setHeader('Content-Type', 'application/json');
        res.status(200).json(lists);
    });
};

const listByQuality = async (req, res) => {
//validate user login
  const qualityParam = req.params.quality;
  const result = await mongodb.getDb().db('team_bountiful').collection('characters').find({ quality: qualityParam });
    result.toArray().then((lists) => {
        res.setHeader('Content-Type', 'application/json');
        res.status(200).json(lists);
    });
};

const createNewCharacter = async (req, res) => {
// validate admin level access
  const charId = new ObjectId(req.params.id);
  const character = {
    characterName: req.body.characterName,
    firstBookSeen: req.body.firstBookSeen,
    firstVerseSeen: req.body.firstVerseSeen,
    quality: req.body.quality,
    notes: req.body.notes
  };
    const response = await mongodb.getDb().db('team_bountiful').collection('characters').insertOne(character);
    if (response.acknowledged) {
      res.status(201).json(response);
    } else {
      res.status(500).json(response.error || 'Something went wrong - character not inserted.');
    };
};

const updateCharacter = async (req, res) => {
// validate admin level access
  const charId = new ObjectId(req.params.id);
  const character = {
    characterName: req.body.characterName,
    firstBookSeen: req.body.firstBookSeen,
    firstVerseSeen: req.body.firstVerseSeen,
    quality: req.body.quality,
    notes: req.body.notes
  };
  const response = await mongodb.getDb().db('team_bountiful').collection('characters').replaceOne({ _id: charId }, character);
  if (response.modifiedCount > 0) {
    res.status(204).send();
  } else {
    res.status(500).json(response.error || 'Some error occurred while updating the character.');
  }
}; 


module.exports = { listAll, listDetails, listByBook, listByQuality, createNewCharacter, updateCharacter };
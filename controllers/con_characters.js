const mongodb = require('../db/connect');
const ObjectId = require('mongodb').ObjectId;
const { requireLogin, characterSchema } = require('../models/utilities'); // may need to add a second validation function

// GET: LIST ALL CHARACTERS (PUBLIC)
const listAll = async (req, res) => {
  /*
    #swagger.tags = ['Characters']
    #swagger.description = 'List all characters.'
    #swagger.responses[200] = {
      description: 'All characters were successfully found.',
      schema: {
        type: 'array',
        items: { $ref: '#/definitions/Character' }
      }
    }
    #swagger.responses[500] = {
      description: 'Internal server error.',
      schema: { message: 'An internal server error occurred.'}
    }
  */

  try {
    const result = await mongodb.getDb().db('team_bountiful').collection('characters').find({});
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

// GET: LIST CHARACTER DETAILS BY ID (PUBLIC)
const listDetails = async (req, res) => {
  /*
    #swagger.tags = ['Characters']
    #swagger.description = 'List character details by id.'
    #swagger.parameters['id'] = {
      in: 'path',
      type: 'string',
      required: true,
      description: 'This is an object id of the character to retrieve. Example id: 6912970eb69127d1966091e3',
      example: '6912970eb69127d1966091e3'
    }
    #swagger.responses[200] = {
      description: 'The character with the specified id was successfully retrieved.',
      schema: { $ref: '#/definitions/Character' }
    }
    #swagger.responses[404] = {
      description: 'The character with the specified id was not found.',
      schema: { messsage: 'The character with the specified id was not found.' }
    }
    #swagger.responses[500] = {
      description: 'Internal server error.',
      schema: { message: 'An internal server error occurred.'}
    }
  */

  try {
    const charId = new ObjectId(req.params.id);
    const result = await mongodb.getDb().db('team_bountiful').collection('characters').find({ _id: charId });

    result.toArray().then((lists) => {
      if (lists.length === 0) {
        return res.status(404).json({ message: 'The character with the specified id was not found.' });
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

// GET: LIST ALL CHARACTERS BY BOOK (PUBLIC)
const listByBook = async (req, res) => {
  /*
    #swagger.tags = ['Characters']
    #swagger.description = 'List all characters by book.'
    #swagger.parameters['book'] = {
      in: 'path',
      type: 'string',
      required: true,
      description: 'This lists all the characters by a specific book. Example book: 1 Nephi',
      example: '1 Nephi'
    }
    #swagger.responses[200] = {
      description: 'All characters with the specified book were successfully retrieved.',
      schema: { $ref: '#/definitions/Character' }
    }
    #swagger.responses[404] = {
      description: 'No characters with the specified book were found.',
      schema: { messsage: 'No characters with the specified book were found.' }
    }
    #swagger.responses[500] = {
      description: 'Internal server error.',
      schema: { message: 'An internal server error occurred.'}
    }
  */

  try {
    const bookParam = req.params.book;
    const result = await mongodb.getDb().db('team_bountiful').collection('characters').find({ firstBookSeen: bookParam });

    result.toArray().then((lists) => {
      if (lists.length === 0) {
        return res.status(404).json({ message: 'No characters with the specified book were found.' });
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

// GET: LIST ALL CHARACTERS BY QUALITY (PUBLIC)
const listByQuality = async (req, res) => {
  /*
    #swagger.tags = ['Characters']
    #swagger.description = 'List all characters by quality.'
    #swagger.parameters['quality'] = {
      in: 'path',
      type: 'string',
      required: true,
      description: 'This lists all the characters by a specific quality. Example quality: Hero',
      example: 'Hero'
    }
    #swagger.responses[200] = {
      description: 'All characters with the specified quality were successfully retrieved.',
      schema: { $ref: '#/definitions/Character' }
    }
    #swagger.responses[404] = {
      description: 'No characters with the specified quality were found.',
      schema: { messsage: 'No characters with the specified quality were found.' }
    }
    #swagger.responses[500] = {
      description: 'Internal server error.',
      schema: { message: 'An internal server error occurred.'}
    }
  */

  try {
    const qualityParam = req.params.quality;
    const result = await mongodb.getDb().db('team_bountiful').collection('characters').find({ quality: qualityParam });

    result.toArray().then((lists) => {
      if (lists.length === 0) {
        return res.status(404).json({ message: 'No characters with the specified quality were found.' });
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

// POST: CREATE ONE CHARACTER (ADMIN ONLY)
const createNewCharacter = async (req, res, next) => {
  /*
    #swagger.tags = ['Characters']
    #swagger.description = 'Create a new character.'
  */
  const { error } = characterSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  try {
    let user = requireLogin(req, res, next);
    if (!user || req.session.accessLevel != 'admin') {
      console.log('Access level insufficient:', req.session.accessLevel);
      res.status(403).json({ message: 'Forbidden. You do not have access to this resource.' });
      return;
    }

    const character = {
      characterName: req.body.characterName,
      firstBookSeen: req.body.firstBookSeen,
      firstVerseSeen: req.body.firstVerseSeen,
      quality: req.body.quality,
      notes: req.body.notes
    };

    if (!character) {
      return res.status(400).json({ message: 'One or more fields are missing to create a character.' });
    }

    const response = await mongodb.getDb().db('team_bountiful').collection('characters').insertOne(character);
    if (response.acknowledged) {
      res.status(201).json(response);
    }
  } catch (error) {
    return res.status(500).json({
      message: error.message || 'An internal server error occurred.'
    });
  }
};

// PUT: UPDATE CHARACTER BY ID (ADMIN ONLY)
const updateCharacter = async (req, res, next) => {
  /*
    #swagger.tags = ['Characters']
    #swagger.description = 'Update character by id.'
  */

  try {
    let user = requireLogin(req, res, next);
    if (!user || req.session.accessLevel != 'admin') {
      console.log('Access level insufficient:', req.session.accessLevel);
      res.status(403).json({ message: 'Forbidden. You do not have access to this resource.' });
      return;
    }

    const charId = new ObjectId(req.params.id);
    const character = {
      characterName: req.body.characterName,
      firstBookSeen: req.body.firstBookSeen,
      firstVerseSeen: req.body.firstVerseSeen,
      quality: req.body.quality,
      notes: req.body.notes
    };

    const response = await mongodb.getDb().db('team_bountiful').collection('characters').updateOne(
      { _id: charId },
      { $set: character }
    );

    if (response.modifiedCount > 0) {
      res.status(204).send();
    } else {
      return res.status(404).json({ messsage: 'The character with the specified id was not found or there was not a change in the request body.' });
    }
  } catch (error) {
    return res.status(500).json({
      message: error.message || 'An internal server error occurred.'
    });
  }
};

// DELETE: DELETE CHARACTER BY ID (ADMIN ONLY)
const deleteCharacter = async (req, res, next) => {
  /*
    #swagger.tags = ['Characters']
    #swagger.description = 'Delete character by id.'
  */

  try {
    let user = requireLogin(req, res, next);
    if (!user || req.session.accessLevel != 'admin') {
      console.log('Access level insufficient:', req.session.accessLevel);
      res.status(403).json({ message: 'Forbidden. You do not have access to this resource.' });
      return;
    }

    const charId = new ObjectId(req.params.id);
    const response = await mongodb.getDb().db('team_bountiful').collection('characters').deleteOne({ _id: charId });

    if (response.deletedCount === 1) {
      res.status(200).json({ message: 'The character with the specified id was successfully deleted.' });
    } else {
      return res.status(404).json({ messsage: 'The character with the specified id was not found.' });
    }
  } catch (error) {
    return res.status(500).json({
      message: error.message || 'An internal server error occurred.'
    });
  }
};

module.exports = {
  listAll,
  listDetails,
  listByBook,
  listByQuality,
  createNewCharacter,
  updateCharacter,
  deleteCharacter
};

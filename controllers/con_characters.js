const mongodb = require('../db/connect');
const ObjectId = require('mongodb').ObjectId; 
const { requireLogin, characterSchema } = require('../models/utilities'); // may need to add a second validation function 


//TODO: Implement the following character controller functions

// GET: LIST ALL CHARACTERS
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
    #swagger.responses[403] = {
      description: 'Permission denied',
      schema: { message: 'Forbidden. You must be signed in to use this resource.' } 
    }
    #swagger.responses[500] = {
      description: 'Internal server error.',
      schema: { message: 'An internal server error occurred.'}
    }
  */

  try {
    let user = requireLogin(req, res);
    if (!user) {
      console.log('Access level insufficient:', req.session.accessLevel);
      res.status(403).json({ message: 'You must be signed in to use this resource.' });
      return;
    }
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

// GET: LIST CHARACTER DETAILS BY ID
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
    #swagger.responses[403] = {
      description: 'Permission denied',
      schema: { message: 'Forbidden. You must be signed in to use this resource.' } 
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
    let user = requireLogin(req, res);
    if (!user) {
      console.log('Access level insufficient:', req.session.accessLevel);
      res.status(403).json({ message: 'You must be signed in to use this resource.' });
      return;
    }
    const charId = new ObjectId(req.params.id);
    const result = await mongodb.getDb().db('team_bountiful').collection('characters').find({ _id: charId });

    // if (!result) {
    //   return res.status(404).json({ message: 'The character with the specified id was not found.' });    
    // }

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

// GET: LIST ALL CHARACTERS BY BOOK
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
    #swagger.responses[403] = {
      description: 'Permission denied',
      schema: { message: 'Forbidden. You must be signed in to use this resource.' } 
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
    let user = requireLogin(req, res);
    if (!user) {
      console.log('Access level insufficient:', req.session.accessLevel);
      res.status(403).json({ message: 'You must be signed in to use this resource.' });
      return;
    }
    const bookParam = req.params.book;
    // const result = await mongodb.getDb().db('team_bountiful').collection('characters').find({ firstBookSeen: req.params.book });
    const result = await mongodb.getDb().db('team_bountiful').collection('characters').find({ firstBookSeen: bookParam });

    // if (!result) {
    //   return res.status(404).json({ message: 'No characters with the specified book were found.' });    
    // }

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

// GET: LIST ALL CHARACTERS BY QUALITY
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
    #swagger.responses[403] = {
      description: 'Permission denied',
      schema: { message: 'Forbidden. You must be signed in to use this resource.' } 
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
    let user = requireLogin(req, res);
    if (!user) {
      console.log('Access level insufficient:', req.session.accessLevel);
      res.status(403).json({ message: 'You must be signed in to use this resource.' });
      return;
    }
    const qualityParam = req.params.quality;
    const result = await mongodb.getDb().db('team_bountiful').collection('characters').find({ quality: qualityParam });

    // if (!result) {
    //   return res.status(404).json({ message: 'No characters with the specified quality were found.' });    
    // }

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

// POST: CREATE ONE CHARACTER
const createNewCharacter = async (req, res) => {
  /*
    #swagger.tags = ['Characters']
    #swagger.description = 'Create a new character.'
    #swagger.parameters['body'] = {
      in: 'body',
      required: true,
      description: 'This contains the character object that contains the data to create.',
      schema: { $ref: '#/definitions/Character' } 
    }
    #swagger.responses[201] = {
      description: 'A character was successfully created.',
      schema: { $ref: '#/definitions/Character' }
    }
    #swagger.responses[403] = {
      description: 'Permission denied',
      schema: { message: 'Forbidden. You must be signed in to use this resource.' } 
    }
    #swagger.responses[400] = {
      description: 'One or more fields are missing to create a character.',
      schema: { messsage: 'One or more fields are missing to create a character.' }
    }
    #swagger.responses[500] = {
      description: 'Internal server error.',
      schema: { message: 'An internal server error occurred.'}
    }
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
    } // else {
    //   res.status(500).json(response.error || 'Something went wrong - character not inserted.');
    // };
  } catch (error) {
    return res.status(500).json({
      message: error.message || 'An internal server error occurred.'
    });
  }    
};

// PUT: UPDATE CHARACTER BY ID
const updateCharacter = async (req, res) => {
  /*
    #swagger.tags = ['Characters']
    #swagger.description = 'Update character by id.'
    #swagger.parameters['id'] = {
      in: 'path',
      type: 'string',
      required: true,
      description: 'This is an object id of the character to update. Example id: 6912970eb69127d1966091e3',
      example: '6912970eb69127d1966091e3'
    }
    #swagger.parameters['body'] = {
      in: 'body',
      required: true,
      description: 'This contains the character object to update.',
      schema: { $ref: '#/definitions/Character' } 
    }
    #swagger.responses[204] = {
      description: 'A status of 204 (No Content) indicates the character was successfully updated.',
    }
    #swagger.responses[403] = {
      description: 'Permission denied',
      schema: { message: 'Forbidden. You must be signed in to use this resource.' } 
    }
    #swagger.responses[404] = {
      description: 'The character with the specified id was not found or there was not a change in the request body.',
      schema: { messsage: 'The character with the specified id was not found or there was not a change in the request body.' }
    }
    #swagger.responses[500] = {
      description: 'Internal server error.',
      schema: { message: 'An internal server error occurred.'}
    }
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
    const response = await mongodb.getDb().db('team_bountiful').collection('characters').replaceOne({ _id: charId }, character);
    if (response.modifiedCount > 0) {
      res.status(204).send();
    } // else {
    //   res.status(500).json(response.error || 'Some error occurred while updating the character.');
    // }
    else {
      return res.status(404).json({ messsage: 'The character with the specified id was not found or there was not a change in the request body.' });
    }
  } catch (error) {
    return res.status(500).json({
      message: error.message || 'An internal server error occurred.'
    });
  }
};

// DELETE: DELETE CHARACTER BY ID
const deleteCharacter = async (req, res) => {
  /*
    #swagger.tags = ['Characters']
    #swagger.description = 'Delete character by id.'
    #swagger.parameters['id'] = {
      in: 'path',
      type: 'string',
      required: true,
      description: 'This is an object id of the character to delete. Example id: 6912970eb69127d1966091e3',
      example: '6912970eb69127d1966091e3'   
    }
    #swagger.responses[200] = {
      description: 'The character with the specified id was successfully deleted.',
      schema: { message: 'The character with the specified id was successfully deleted.' } 
    }
    #swagger.responses[403] = {
      description: 'Permission denied',
      schema: { message: 'Forbidden. You must be signed in to delete this resource.' } 
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
    let user = requireLogin(req, res, next);
    if (!user || req.session.accessLevel != 'admin') {
      console.log('Access level insufficient:', req.session.accessLevel);
      res.status(403).json({ message: 'Forbidden. You do not have access to this resource.' });
      return;
    }
    const charId = new ObjectId(req.params.id);
    // Reference for deleteOne and deletedCount: https://www.mongodb.com/docs/manual/reference/method/db.collection.deleteOne/
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


module.exports = { listAll, listDetails, listByBook, listByQuality, createNewCharacter, updateCharacter, deleteCharacter };
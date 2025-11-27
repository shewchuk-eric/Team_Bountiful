const mongodb = require('../db/connect');
const ObjectId = require('mongodb').ObjectId;
const {
  requireLogin
} = require('../models/utilities');
const {
  quoteSchema
} = require('../models/utilities');

//TODO: Implement the following character controller functions

// GET: RETRIEVE ALL QUOTES
const listAll = async (req, res) => {
  /*
    #swagger.tags = ['GET: Quotes']
    #swagger.description = 'List all quotes.'
    #swagger.responses[200] = {
      description: 'All quotes were successfully found.',
      schema: {
        type: 'array',
        items: { $ref: '#/definitions/Quote' }
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
    } catch (error) {
      return res.status(500).json({
        message: error.message || 'An internal server error occurred.'
      });
    }
};

// GET: LIST ALL QUOTES BY BOOK
const listByBook = async (req, res) => {
  /*
    #swagger.tags = ['GET: Quotes']
    #swagger.description = 'List all quotes by book.'
    #swagger.parameters['book'] = {
      in: 'path',
      type: 'string',
      required: true,
      description: 'This lists all the quotes by a specific book. Example book: 1 Nephi',
      example: '1 Nephi'
    }
    #swagger.responses[200] = {
      description: 'All quotes with the specified book were successfully retrieved.',
      schema: { $ref: '#/definitions/Quote' }
    }
    #swagger.responses[403] = {
      description: 'Permission denied',
      schema: { message: 'Forbidden. You must be signed in to use this resource.' } 
    }
    #swagger.responses[404] = {
      description: 'No quotes with the specified book were found.',
      schema: { messsage: 'No quotes with the specified book were found.' }
    }
    #swagger.responses[500] = {
      description: 'Internal server error.',
      schema: { message: 'An internal server error occurred.'}
    }
  */

  try {
    //validate user login
    const bookParam = req.params.book
    const result = await mongodb.getDb().db('team_bountiful').collection('quotes').find({
      bookName: bookParam
      // whereFound: {
      //   $regex: new RegExp(bookName, 'i')
      // }
    });
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


// GET: LIST ALL QUOTES BY CHARACTER
const listByCharacter = async (req, res) => {
  /*
    #swagger.tags = ['GET: Quotes']
    #swagger.description = 'List all quotes by character.'
    #swagger.parameters['character'] = {
      in: 'path',
      type: 'string',
      required: true,
      description: 'This lists all the quotes by a specific character. Example character: Nephi',
      example: 'Nephi'
    }
    #swagger.responses[200] = {
      description: 'All quotes with the specified character were successfully retrieved.',
      schema: { $ref: '#/definitions/Quote' }
    }
    #swagger.responses[403] = {
      description: 'Permission denied',
      schema: { message: 'Forbidden. You must be signed in to use this resource.' } 
    }
    #swagger.responses[404] = {
      description: 'No quotes with the specified character were found.',
      schema: { messsage: 'No quotes with the specified character were found.' }
    }
    #swagger.responses[500] = {
      description: 'Internal server error.',
      schema: { message: 'An internal server error occurred.'}
    }
  */

  try {
    //validate user login
    // const character = req.params.id
    const characterParam = req.params.character;
    const result = await mongodb.getDb().db('team_bountiful').collection('quotes').find({
      characterName: characterParam // characterId: character
    });

    if (!result) {
      return res.status(404).json({
        message: 'No quotes with the specified character were found.'
      });
    }

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

// POST: CREATE ONE QUOTE
const createNewQuote = async (req, res) => {
  /*
    #swagger.tags = ['POST: Quotes']
    #swagger.description = 'Create a new quote.'
    #swagger.parameters['body'] = {
      in: 'body',
      required: true,
      description: 'This contains the quote object that contains the data to create.',
      schema: { $ref: '#/definitions/Quote' } 
    }
    #swagger.responses[201] = {
      description: 'A quote was successfully created.',
      schema: { $ref: '#/definitions/Quote' }
    }
    #swagger.responses[403] = {
      description: 'Permission denied',
      schema: { message: 'Forbidden. You must be signed in to use this resource.' } 
    }
    #swagger.responses[400] = {
      description: 'One or more fields are missing to create a quote.',
      schema: { messsage: 'One or more fields are missing to create a quote.' }
    }
    #swagger.responses[500] = {
      description: 'Internal server error.',
      schema: { message: 'An internal server error occurred.'}
    }
  */

  try {
    // validate user login - maybe admin level access? (allow users to create their own quotes?)
    const {
      error
    } = quoteSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: error.details[0].message
      });
    }

    const quote = {
      characterId: req.body.characterId,
      characterName: req.body.characterName,
      bookName: req.body.bookName,
      verse: req.body.verse,
      // whereFound: req.body.whereFound,
      characterQuality: req.body.characterQuality,
      text: req.body.text
    };

    const response = await mongodb.getDb().db('team_bountiful').collection('quotes').insertOne(quote);
    if (response.acknowledged) {
      res.status(201).json(response);
    } // else {
    //   res.status(500).json(response.error || 'Something went wrong - quote not inserted.');
    // };
  } catch (error) {
    return res.status(500).json({
      message: error.message || 'An internal server error occurred.'
    });
  }
};

// PUT: UPDATE QUOTE BY ID
const updateQuote = async (req, res) => {
  /*
    #swagger.tags = ['PUT: Quotes']
    #swagger.description = 'Update quote by id.'
    #swagger.parameters['id'] = {
      in: 'path',
      type: 'string',
      required: true,
      description: 'This is an object id of the quote to update. Example id: 69227d43cc3fae26dd0125f9',
      example: '69227d43cc3fae26dd0125f9'
    }
    #swagger.parameters['body'] = {
      in: 'body',
      required: true,
      description: 'This contains the quote object to update.',
      schema: { $ref: '#/definitions/Quote' } 
    }
    #swagger.responses[204] = {
      description: 'A status of 204 (No Content) indicates the quote was successfully updated.'
    }
    #swagger.responses[400] = {
      description: 'A status of 400 indicates the quote was not in the correct format.',
      schema: { message: 'At least one field is not in the correct format.' }
    }      
    #swagger.responses[403] = {
      description: 'Permission denied',
      schema: { message: 'Forbidden. You must be signed in to use this resource.' } 
    }
    #swagger.responses[404] = {
      description: 'The quote with the specified id was not found or there was not a change in the request body.',
      schema: { messsage: 'The quote with the specified id was not found or there was not a change in the request body.' }
    }
    #swagger.responses[500] = {
      description: 'Internal server error.',
      schema: { message: 'An internal server error occurred.'}
    }
  */

  try {
  // validate user login - maybe admin level access? (allow users to only update their own quotes?)
    const {
      error
    } = quoteSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: error.details[0].message
      });
    }

    const quoteId = new ObjectId(req.params.id);
    const quote = {
      characterId: req.body.characterId,
      characterName: req.body.characterName,
      bookName: req.body.bookName,
      verse: req.body.verse,
      // whereFound: req.body.whereFound,
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

// DELETE: DELETE QUOTE BY ID
const removeQuote = async (req, res) => {
  /*
    #swagger.tags = ['DELETE: Quotes']
    #swagger.description = 'Delete quote by id.'
    #swagger.parameters['id'] = {
      in: 'path',
      type: 'string',
      required: true,
      description: 'This is an object id of the quote to delete. Example id: 69227d43cc3fae26dd0125f9',
      example: '69227d43cc3fae26dd0125f9'   
    }
    #swagger.responses[200] = {
      description: 'The quote with the specified id was successfully deleted.',
      schema: { message: 'The quote with the specified id was successfully deleted.' } 
    }
    #swagger.responses[403] = {
      description: 'Permission denied',
      schema: { message: 'Forbidden. You must be signed in to delete this resource.' } 
    }
    #swagger.responses[404] = {
      description: 'The quote with the specified id was not found.',
      schema: { messsage: 'The quote with the specified id was not found.' }
    }
    #swagger.responses[500] = {
      description: 'Internal server error.',
      schema: { message: 'An internal server error occurred.'}
    }
  */

  try {
    // validate admin level access
    const quoteId = new ObjectId(req.params.id);
    // Reference for deleteOne and deletedCount: https://www.mongodb.com/docs/manual/reference/method/db.collection.deleteOne/
    const response = await mongodb.getDb().db('team_bountiful').collection('quotes').deleteOne({
      _id: quoteId
    });
    if (response.deletedCount === 1) {
      res.status(200).json({
        message: 'The quote with the specified id was successfully deleted.'
      });
    } else {
      return res.status(404).json({
        messsage: 'The quote with the specified id was not found.'
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
  updateQuote,
  removeQuote
};
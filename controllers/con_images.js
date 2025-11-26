const mongodb = require('../db/connect');
const ObjectId = require('mongodb').ObjectId;
const {
  requireLogin
} = require('../models/utilities'); // may need to add a second validation function
const {
  imageSchema
} = require('../models/utilities');

//TODO: Implement the following character controller functions

// GET: RETRIEVE ALL IMAGES
const listAll = async (req, res) => {
  /*
    #swagger.tags = ['GET: Images']
    #swagger.description = 'List all images.'
    #swagger.responses[200] = {
      description: 'All images were successfully found.',
      schema: {
        type: 'array',
        items: { $ref: '#/definitions/Image' }
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
    const result = await mongodb.getDb().db('team_bountiful').collection('images').find({});
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

// GET: LIST ALL IMAGES BY BOOK
const listByBook = async (req, res) => {
  /*
    #swagger.tags = ['GET: Images']
    #swagger.description = 'List all images by book.'
    #swagger.parameters['book'] = {
      in: 'path',
      type: 'string',
      required: true,
      description: 'This lists all the images by a specific book. Example book: 1 Nephi',
      example: '1 Nephi'
    }
    #swagger.responses[200] = {
      description: 'All images with the specified book were successfully retrieved.',
      schema: { $ref: '#/definitions/Image' }
    }
    #swagger.responses[403] = {
      description: 'Permission denied',
      schema: { message: 'Forbidden. You must be signed in to use this resource.' } 
    }
    #swagger.responses[404] = {
      description: 'No images with the specified book were found.',
      schema: { messsage: 'No images with the specified book were found.' }
    }
    #swagger.responses[500] = {
      description: 'Internal server error.',
      schema: { message: 'An internal server error occurred.'}
    }
  */

  try {
    //validate user login
    const bookParam = req.params.book;
    const result = await mongodb.getDb().db('team_bountiful').collection('images').find({
      bookWhereSeen: bookParam
    });

    if (!result) {
      return res.status(404).json({
        message: 'No images with the specified book were found.'
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

// GET: LIST IMAGES BY CHARACTER
const listByCharacter = async (req, res) => {
  /*
    #swagger.tags = ['GET: Images']
    #swagger.description = 'List all images by character.'
    #swagger.parameters['character'] = {
      in: 'path',
      type: 'string',
      required: true,
      description: 'This lists all the images by a specific character. Example character: Nephi',
      example: 'Nephi'
    }
    #swagger.responses[200] = {
      description: 'All images with the specified character were successfully retrieved.',
      schema: { $ref: '#/definitions/Image' }
    }
    #swagger.responses[403] = {
      description: 'Permission denied',
      schema: { message: 'Forbidden. You must be signed in to use this resource.' } 
    }
    #swagger.responses[404] = {
      description: 'No images with the specified character were found.',
      schema: { messsage: 'No images with the specified character were found.' }
    }
    #swagger.responses[500] = {
      description: 'Internal server error.',
      schema: { message: 'An internal server error occurred.'}
    }
  */

  try {
    //validate user login
    const characterParam = req.params.character;
    const result = await mongodb.getDb().db('team_bountiful').collection('images').find({
      characterName: characterParam
    });

    if (!result) {
      return res.status(404).json({
        message: 'No images with the specified character were found.'
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

// POST: CREATE ONE IMAGE
const createNewImage = async (req, res) => {
  /*
    #swagger.tags = ['POST: Images']
    #swagger.description = 'Create a new image.'
    #swagger.parameters['body'] = {
      in: 'body',
      required: true,
      description: 'This contains the image object that contains the data to create.',
      schema: { $ref: '#/definitions/Image' } 
    }
    #swagger.responses[201] = {
      description: 'An image was successfully created.',
      schema: { $ref: '#/definitions/Image' }
    }
    #swagger.responses[403] = {
      description: 'Permission denied',
      schema: { message: 'Forbidden. You must be signed in to use this resource.' } 
    }
    #swagger.responses[400] = {
      description: 'One or more fields are missing to create an image.',
      schema: { messsage: 'One or more fields are missing to create an image.' }
    }
    #swagger.responses[500] = {
      description: 'Internal server error.',
      schema: { message: 'An internal server error occurred.'}
    }
  */

  try {
    // validate admin level access
    const {
      error
    } = imageSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: error.details[0].message
      });
    }
    const image = {
      characterId: req.body.characterId,
      characterName: req.body.characterName,
      bookWhereSeen: req.body.bookWhereSeen,
      characterQuality: req.body.characterQuality,
      filename: req.body.filename,
      caption: req.body.caption,
      description: req.body.description,
      source: req.body.source
    };

    if (!image) {
      return res.status(400).json({
        message: 'One or more fields are missing to create an image.'
      });
    }

    const response = await mongodb.getDb().db('team_bountiful').collection('images').insertOne(image);
    if (response.acknowledged) {
      res.status(201).json(response);
    }
  } catch (error) {
    return res.status(500).json({
      message: error.message || 'An internal server error occurred.'
    });
  }
};

// PUT: UPDATE IMAGE BY ID
const updateImage = async (req, res) => {
  /*
    #swagger.tags = ['PUT: Images']
    #swagger.description = 'Update image by id.'
    #swagger.parameters['id'] = {
      in: 'path',
      type: 'string',
      required: true,
      description: 'This is an object id of the image to update. Example id: 69227d43cc3fae26dd0125f9',
      example: '69227d43cc3fae26dd0125f9'
    }
    #swagger.parameters['body'] = {
      in: 'body',
      required: true,
      description: 'This contains the image object to update.',
      schema: { $ref: '#/definitions/Image' } 
    }
    #swagger.responses[204] = {
      description: 'A status of 204 (No Content) indicates the image was successfully updated.'
    }
    #swagger.responses[400] = {
      description: 'A status of 400 indicates the image was not in the correct format.',
      schema: { message: 'At least one field is not in the correct format.' }
    }      
    #swagger.responses[403] = {
      description: 'Permission denied',
      schema: { message: 'Forbidden. You must be signed in to use this resource.' } 
    }
    #swagger.responses[404] = {
      description: 'The image with the specified id was not found or there was not a change in the request body.',
      schema: { messsage: 'The image with the specified id was not found or there was not a change in the request body.' }
    }
    #swagger.responses[500] = {
      description: 'Internal server error.',
      schema: { message: 'An internal server error occurred.'}
    }
  */

  try {
    // validate admin level access
    const {
      error
    } = imageSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: error.details[0].message
      });
    }
    const imageId = new ObjectId(req.params.id);
    const image = {
      characterName: req.body.characterName,
      bookWhereSeen: req.body.bookWhereSeen,
      characterQuality: req.body.characterQuality,
      filename: req.body.filename,
      caption: req.body.caption,
      description: req.body.description,
      source: req.body.source
    };
    const response = await mongodb.getDb().db('team_bountiful').collection('images').replaceOne({
      _id: imageId
    }, image);
    if (response.modifiedCount > 0) {
      res.status(204).send();
    } else {
      return res.status(404).json({
        messsage: 'The image with the specified id was not found or there was not a change in the request body.'
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: error.message || 'An internal server error occurred.'
    });
  }
};

// DELETE: DELETE IMAGE BY ID
const removeImage = async (req, res) => {
  /*
    #swagger.tags = ['DELETE: Images']
    #swagger.description = 'Delete image by id.'
    #swagger.parameters['id'] = {
      in: 'path',
      type: 'string',
      required: true,
      description: 'This is an object id of the image to delete. Example id: 69227d43cc3fae26dd0125f9',
      example: '69227d43cc3fae26dd0125f9'   
    }
    #swagger.responses[200] = {
      description: 'The image with the specified id was successfully deleted.',
      schema: { message: 'The image with the specified id was successfully deleted.' } 
    }
    #swagger.responses[403] = {
      description: 'Permission denied',
      schema: { message: 'Forbidden. You must be signed in to delete this resource.' } 
    }
    #swagger.responses[404] = {
      description: 'The image with the specified id was not found.',
      schema: { messsage: 'The image with the specified id was not found.' }
    }
    #swagger.responses[500] = {
      description: 'Internal server error.',
      schema: { message: 'An internal server error occurred.'}
    }
  */

  try {
    // validate admin level access
    const imageId = new ObjectId(req.params.id);
    // Reference for deleteOne and deletedCount: https://www.mongodb.com/docs/manual/reference/method/db.collection.deleteOne/
    const response = await mongodb.getDb().db('team_bountiful').collection('images').deleteOne({
      _id: imageId
    });
    if (response.deletedCount === 1) {
      res.status(200).json({
        message: 'The image with the specified id was successfully deleted.'
      });
    } else {
      return res.status(404).json({
        messsage: 'The image with the specified id was not found.'
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
  createNewImage,
  updateImage,
  removeImage
};
const mongodb = require('../db/connect');
const ObjectId = require('mongodb').ObjectId;
const { requireLogin } = require('../models/utilities'); // may need to add a second validation function
const { imageSchema } = require('../models/utilities');

// GET: RETRIEVE ALL IMAGES (PUBLIC)
const listAll = async (req, res) => {
  /*
    #swagger.tags = ['Images']
    #swagger.description = 'List all images.'
  */

  try {
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

// GET: LIST ALL IMAGES BY BOOK (PUBLIC)
const listByBook = async (req, res) => {
  /*
    #swagger.tags = ['Images']
    #swagger.description = 'List all images by book.'
  */

  try {
    const bookParam = req.params.book;
    const result = await mongodb.getDb().db('team_bountiful').collection('images').find({
      bookWhereSeen: bookParam
    });

    result.toArray().then((lists) => {
      if (lists.length === 0) {
        return res.status(404).json({ message: 'No images with the specified book were found.' });
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

// GET: LIST IMAGES BY CHARACTER (PUBLIC)
const listByCharacter = async (req, res) => {
  /*
    #swagger.tags = ['Images']
    #swagger.description = 'List all images by character.'
  */

  try {
    const characterParam = req.params.character;
    const result = await mongodb.getDb().db('team_bountiful').collection('images').find({
      characterName: characterParam
    });

    result.toArray().then((lists) => {
      if (lists.length === 0) {
        return res.status(404).json({ message: 'No images with the specified character were found.' });
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

// POST: CREATE ONE IMAGE (ADMIN ONLY)
const createNewImage = async (req, res) => {
  /*
    #swagger.tags = ['Images']
    #swagger.description = 'Create a new image.'
  */

  try {
    let user = requireLogin(req, res);
    if (!user || req.session.accessLevel != 'admin') {
      console.log('Access level insufficient:', req.session.accessLevel);
      res.status(403).json({ message: 'Forbidden. You do not have access to this resource.' });
      return;
    }

    const { error } = imageSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const image = {
      characterId: req.body.characterId,
      characterName: req.body.characterName,
      bookWhereSeen: req.body.bookWhereSeen,
      characterQuality: req.body.characterQuality,
      caption: req.body.caption,
      description: req.body.description,
      source: req.body.source
    };

    if (!image) {
      return res.status(400).json({ message: 'One or more fields are missing to create an image.' });
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

// PUT: UPDATE IMAGE BY ID (ADMIN ONLY)
const updateImage = async (req, res) => {
  /*
    #swagger.tags = ['Images']
    #swagger.description = 'Update image by id.'
  */

  try {
    let user = requireLogin(req, res);
    if (!user || req.session.accessLevel != 'admin') {
      console.log('Access level insufficient:', req.session.accessLevel);
      res.status(403).json({ message: 'Forbidden. You do not have access to this resource.' });
      return;
    }

    const { error } = imageSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const imageId = new ObjectId(req.params.id);
    const image = {
      characterId: req.body.characterId,
      characterName: req.body.characterName,
      bookWhereSeen: req.body.bookWhereSeen,
      characterQuality: req.body.characterQuality,
      caption: req.body.caption,
      description: req.body.description,
      source: req.body.source
    };

    const response = await mongodb.getDb().db('team_bountiful').collection('images').replaceOne(
      { _id: imageId },
      image
    );

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

// DELETE: DELETE IMAGE BY ID (ADMIN ONLY)
const removeImage = async (req, res, next) => {
  /*
    #swagger.tags = ['Images']
    #swagger.description = 'Delete image by id.'
  */

  try {
    let user = requireLogin(req, res, next);
    if (!user || req.session.accessLevel != 'admin') {
      console.log('Access level insufficient:', req.session.accessLevel);
      res.status(403).json({ message: 'Forbidden. You do not have access to this resource.' });
      return;
    }

    const imageId = new ObjectId(req.params.id);
    const response = await mongodb.getDb().db('team_bountiful').collection('images').deleteOne({ _id: imageId });

    if (response.deletedCount === 1) {
      res.status(200).json({ message: 'The image with the specified id was successfully deleted.' });
    } else {
      return res.status(404).json({ messsage: 'The image with the specified id was not found.' });
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

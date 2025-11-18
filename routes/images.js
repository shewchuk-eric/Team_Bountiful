const images = require('express').Router();
const imagesController = require('../controllers/con_images.js');
const { ensureAuthenticated, ensureAdmin } = require('../models/utilities');

//Require Login
images.get('/', ensureAuthenticated, imagesController.listAll); 
images.get('/:id/', ensureAuthenticated, imagesController.listByCharacter);
images.get('/imageByBook/:book', ensureAuthenticated, imagesController.listByBook);

//admin only
images.post('/createNewImage', ensureAdmin, imagesController.createNewImage);
images.put('/updateImage/:id', ensureAdmin, imagesController.updateImage);
images.delete('/removeImage/:id', ensureAdmin, imagesController.removeImage);

module.exports = images;

const images = require('express').Router();
const imagesController = require('../controllers/con_images.js');


images.get('/', imagesController.listAll); 
images.get('/:id/', imagesController.listByCharacter);
images.get('/imageByBook/:book', imagesController.listByBook);
images.post('/createNewImage', imagesController.createNewImage);
images.put('/updateImage/:id', imagesController.updateImage);
images.delete('/removeImage/:id', imagesController.removeImage);


module.exports = images;
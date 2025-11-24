const characters = require('express').Router();
const charactersController = require('../controllers/con_characters.js');

characters.get('/listByBook/:book', charactersController.listByBook);
characters.get('/listByQuality/:quality', charactersController.listByQuality);
characters.get('/:id', charactersController.listDetails);
characters.get('/', charactersController.listAll);
characters.post('/createNewCharacter', charactersController.createNewCharacter);
characters.put('/updateCharacter/:id', charactersController.updateCharacter);
characters.delete('/deleteCharacter/:id', charactersController.deleteCharacter);

module.exports = characters;
const characters = require('express').Router();
const charactersController = require('../controllers/con_characters.js');


characters.get('/', charactersController.listAll);
characters.get('/:id', charactersController.listDetails);
characters.get('/listByBook/:book', charactersController.listByBook);
characters.get('/listByQuality/:quality', charactersController.listByQuality);
characters.post('/createNewCharacter', charactersController.createNewCharacter);
characters.put('/updateCharacter/:id', charactersController.updateCharacter);


module.exports = characters;
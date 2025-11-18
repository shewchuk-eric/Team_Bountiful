const characters = require('express').Router();
const charactersController = require('../controllers/con_characters.js');
const { ensureAuthenticated, ensureAdmin } = require('../models/utilities');

//require login
characters.get('/', ensureAuthenticated, charactersController.listAll);
characters.get('/:id', ensureAuthenticated, charactersController.listDetails);
characters.get('/listByBook/:book', ensureAuthenticated, charactersController.listByBook);
characters.get('/listByQuality/:quality', ensureAuthenticated, charactersController.listByQuality);

//admin only
characters.post('/createNewCharacter', ensureAdmin, charactersController.createNewCharacter);
characters.put('/updateCharacter/:id', ensureAdmin, charactersController.updateCharacter);

module.exports = characters;

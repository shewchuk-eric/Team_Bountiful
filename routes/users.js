const users = require('express').Router();
const usersController = require('../controllers/con_users.js');
const { ensureAuthenticated, ensureAdmin } = require('../models/utilities');

// Admin-only
users.get('/', ensureAdmin, usersController.listAllUsers); 
// Public
users.post('/createNewUser', usersController.createNewUser);
// Auth required
users.put('/updateUser/:id', ensureAuthenticated, usersController.updateUser);
// Auth required
users.patch('/changePassword/:id', ensureAuthenticated, usersController.changePassword);
// Admin-only
users.patch('/setAccessLevel/:id', ensureAdmin, usersController.setAccessLevel);
// Admin-only
users.delete('/removeUser/:id', ensureAdmin, usersController.removeUser);

module.exports = users;
const users = require('express').Router();
const usersController = require('../controllers/con_users.js');


users.get('/', usersController.listAllUsers); 
users.post('/createNewUser', usersController.createNewUser);
users.put('/updateUser/:id', usersController.updateUser);
users.patch('/changePassword/:id', usersController.changePassword);
users.patch('/setAccessLevel/:id', usersController.setAccessLevel);
users.delete('/removeUser/:id', usersController.removeUser);


module.exports = users;
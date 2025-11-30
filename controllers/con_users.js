const mongodb = require('../db/connect');
const ObjectId = require('mongodb').ObjectId; 
const { userSchema, requireLogin, getToday } = require('../models/utilities');
const today = getToday();

// GET: LIST ALL USERS
const listAllUsers = async (req, res, next) => {
  /*
    #swagger.tags = ['GET: Users']
    #swagger.description = 'List all users.'
    #swagger.responses[200] = {
      description: 'All users were successfully found.',
      schema: {
        type: 'array',
        items: { $ref: '#/definitions/User' }
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
    let user = requireLogin(req, res, next);
    console.log('user status is: ', user);
    console.log('accessLevel is: ', req.session.accessLevel);
    if (!user || req.session.accessLevel != 'admin') {
      console.log('Access level insufficient:', req.session.accessLevel);
      res.status(403).json({ message: 'Forbidden. You do not have access to this resource.' });
      return;
    }
    const result = await mongodb.getDb().db('team_bountiful').collection('users').find({});
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

//GET: CHECK FOR ADMIN BY GITNAME
const getUserByGitName = async (req, res, next) => {
  try {
    const gitName = req.params.gitName;
    const result = await mongodb.getDb().db('team_bountiful').collection('users').findOne({ gitName: gitName });
    if (result && result.accessLevel === 'admin') {
      req.session.accessLevel = 'admin';
    } else {
      req.session.accessLevel = 'user';
    }
  } catch (error) {
    return res.status(500).json({
      message: error.message || 'An internal server error occurred.'
    });
  } 
  //console.log('userName is: ', req.session.username);
  //console.log('accessLevel is: ', req.session.accessLevel);
  res.redirect('/api-docs/#/');
};

// POST: CREATE NEW USER
const createNewUser = async (req, res, next) => {
  /*
    #swagger.tags = ['POST: Users']
    #swagger.description = 'Create a new user.'
    #swagger.parameters['body'] = {
      in: 'body',
      required: true,
      description: 'This contains the user object that contains the data to create.',
      schema: { $ref: '#/definitions/User' } 
    }
    #swagger.responses[201] = {
      description: 'A user was successfully created.',
      schema: { $ref: '#/definitions/User' }
    }
    #swagger.responses[403] = {
      description: 'Permission denied',
      schema: { message: 'Forbidden. You must be signed in to use this resource.' } 
    }
    #swagger.responses[400] = {
      description: 'One or more fields are missing to create a user.',
      schema: { messsage: 'One or more fields are missing to create a user.' }
    }
    #swagger.responses[500] = {
      description: 'Internal server error.',
      schema: { message: 'An internal server error occurred.'}
    }
  */

  try {
    const { error } = userSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    const newUser = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      userName: req.body.userName,
      password: req.body.password,
      accessLevel: req.body.accessLevel,
      accountModified: `${today}`,
      gitName: req.body.gitName
    };
    const response = await mongodb.getDb().db('team_bountiful').collection('users').insertOne(newUser);
    if (response.acknowledged) {
      res.status(201).json(response);
    } // else {
    //   res.status(500).json(response.error || 'Something went wrong - user not inserted');
    // }
  } catch (error) {
    return res.status(500).json({
      message: error.message || 'An internal server error occurred.'
    });
  }    
};

// PUT: UPDATE USER
const updateUser = async (req, res) => {
  /*
    #swagger.tags = ['PUT: Users']
    #swagger.description = 'Update user by id.'
    #swagger.parameters['id'] = {
      in: 'path',
      type: 'string',
      required: true,
      description: 'This is an user id of the quote to update. Example id: 69227d43cc3fae26dd0125f9',
      example: '69227d43cc3fae26dd0125f9'
    }
    #swagger.parameters['body'] = {
      in: 'body',
      required: true,
      description: 'This contains the quote object to update.',
      schema: { $ref: '#/definitions/User' } 
    }
    #swagger.responses[204] = {
      description: 'A status of 204 (No Content) indicates the user was successfully updated.'
    }
    #swagger.responses[400] = {
      description: 'A status of 400 indicates the user was not in the correct format.',
      schema: { message: 'At least one field is not in the correct format.' }
    }      
    #swagger.responses[403] = {
      description: 'Permission denied',
      schema: { message: 'Forbidden. You must be signed in to use this resource.' } 
    }
    #swagger.responses[404] = {
      description: 'The user with the specified id was not found or there was not a change in the request body.',
      schema: { messsage: 'The user with the specified id was not found or there was not a change in the request body.' }
    }
    #swagger.responses[500] = {
      description: 'Internal server error.',
      schema: { message: 'An internal server error occurred.'}
    }
  */

  try {
    // validate admin level access or that person making the change is the user themselves
    const userId = new ObjectId(req.params.id);
    const contact = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      userName: req.body.userName,
      password: req.body.password,
      accessLevel: req.body.accessLevel,
      accountModified: `${today}`,
      gitName: req.body.gitName
    };
    const response = await mongodb.getDb().db('team_bountiful').collection('users').replaceOne({ _id: userId }, contact);
    if (response.modifiedCount > 0) {
      res.status(204).send();
    } // else {
    //   res.status(500).json(response.error || 'Some error occurred while updating the contact.');
    // }
  } catch (error) {
    return res.status(500).json({
      message: error.message || 'An internal server error occurred.'
    });
  }    
};

// PATCH: UPDATE USER PASSWORD
const changePassword = async (req, res) => {
  /*
    #swagger.tags = ['PATCH: Users']
    #swagger.description = 'Update user password by id.'
    #swagger.parameters['id'] = {
      in: 'path',
      type: 'string',
      required: true,
      description: 'This is an object id of the user to update. Example id: 69227d43cc3fae26dd0125f9',
      example: '69227d43cc3fae26dd0125f9'
    }
    #swagger.parameters['body'] = {
      in: 'body',
      required: true,
      description: 'This contains the user object to update.',
      schema: { password: 'dallins123Password' } 
    }
    #swagger.responses[204] = {
      description: 'A status of 204 (No Content) indicates the user password was successfully updated.'
    }
    #swagger.responses[400] = {
      description: 'A status of 400 indicates the user password was not in the correct format.',
      schema: { message: 'The user password is not in the correct format.' }
    }      
    #swagger.responses[403] = {
      description: 'Permission denied',
      schema: { message: 'Forbidden. You must be signed in to use this resource.' } 
    }
    #swagger.responses[404] = {
      description: 'The user with the specified id was not found or there was not a change in the request body.',
      schema: { messsage: 'The user with the specified id was not found or there was not a change in the request body.' }
    }
    #swagger.responses[500] = {
      description: 'Internal server error.',
      schema: { message: 'An internal server error occurred.'}
    }
  */

  try {
    // validate admin level access
    const userId = new ObjectId(req.params.id);
    const newPassword = {password: req.body.password};

    if (!newPassword) {
      return res.status(400).json({
        message: 'The user password is not in the correct format.'
      });
    }

    const response = await mongodb.getDb().db('team_bountiful').collection('users').updateOne({ _id: userId }, { $set: newPassword });
      if (response.modifiedCount > 0) {
      res.status(204).send();
    } // else {
    //   res.status(500).json(response.error || 'Unable to update the password at this time.');
    // }
    else {
      return res.status(404).json({ 
        message: 'The user with the specified id was not found or there was not a change in the request body.'
      })
    }
  } catch (error) {
    return res.status(500).json({
      message: error.message || 'An internal server error occurred.'
    });
  }    
};

// PATCH: UPDATE ACCESS LEVEL
const setAccessLevel = async (req, res) => {
  /*
    #swagger.tags = ['PATCH: Users']
    #swagger.description = 'Update user access level by id.'
    #swagger.parameters['id'] = {
      in: 'path',
      type: 'string',
      required: true,
      description: 'This is an object id of the user to update. Example id: 69227d43cc3fae26dd0125f9',
      example: '69227d43cc3fae26dd0125f9'
    }
    #swagger.parameters['body'] = {
      in: 'body',
      required: true,
      description: 'This contains the user object to update.',
      schema: { accessLevel: 'admin' } 
    }
    #swagger.responses[204] = {
      description: 'A status of 204 (No Content) indicates the user access level was successfully updated.'
    }
    #swagger.responses[400] = {
      description: 'A status of 400 indicates the user access level was not in the correct format.',
      schema: { message: 'The user access level is not in the correct format.' }
    }      
    #swagger.responses[403] = {
      description: 'Permission denied',
      schema: { message: 'Forbidden. You must be signed in to use this resource.' } 
    }
    #swagger.responses[404] = {
      description: 'The user with the specified id was not found or there was not a change in the request body.',
      schema: { messsage: 'The user with the specified id was not found or there was not a change in the request body.' }
    }
    #swagger.responses[500] = {
      description: 'Internal server error.',
      schema: { message: 'An internal server error occurred.'}
    }
  */

  try {
    // validate admin level access
    const userId = new ObjectId(req.params.id);  
    const newAccessLevel = {accessLevel: 'admin'};
    const addGitName = {gitName: req.body.gitName};

    if (!newAccessLevel) {
      return res.status(400).json({
        message: 'The user access level is not in the correct format.'
      });
    }

    const response = await mongodb.getDb().db('team_bountiful').collection('users').updateOne({ _id: userId }, { $set: newAccessLevel });
    console.log(addGitName);
    const gitResponse = await mongodb.getDb().db('team_bountiful').collection('users').updateOne({ _id: userId }, { $set: addGitName });
    if (response.modifiedCount > 0 || gitResponse.modifiedCount > 0) {
      res.status(204).send();
    } // else {
    //   res.status(500).json(response.error || 'Unable to modify user access level at this time.');
    // }
    else {
      return res.status(404).json({ 
        message: 'The user with the specified id was not found or there was not a change in the request body.'
      })
    }    
  } catch (error) {
    return res.status(500).json({
      message: error.message || 'An internal server error occurred.'
    });
  }      
};

// DELETE: DELETE USER BY ID
const removeUser = async (req, res) => {
  /*
    #swagger.tags = ['DELETE: Users']
    #swagger.description = 'Delete user by id.'
    #swagger.parameters['id'] = {
      in: 'path',
      type: 'string',
      required: true,
      description: 'This is an object id of the user to delete. Example id: 69227d43cc3fae26dd0125f9',
      example: '69227d43cc3fae26dd0125f9'   
    }
    #swagger.responses[204] = {
      description: 'A status of 204 (No Content) indicates the user was successfully deleted.'
    }
    #swagger.responses[403] = {
      description: 'Permission denied',
      schema: { message: 'Forbidden. You must be signed in to delete this resource.' } 
    }
    #swagger.responses[404] = {
      description: 'The user with the specified id was not found.',
      schema: { messsage: 'The user with the specified id was not found.' }
    }
    #swagger.responses[500] = {
      description: 'Internal server error.',
      schema: { message: 'An internal server error occurred.'}
    }
  */

  try {
    // validate admin level access or that person making the change is the user themselves
    const userId = new ObjectId(req.params.id);
    const response = await mongodb.getDb().db('team_bountiful').collection('users').deleteOne({ _id: userId }, true);
    console.log(response);
    if (response.deletedCount > 0) {
      res.status(204).send();
    } // else {
    //   res.status(500).json(response.error || 'An error occurred while deleting the contact.');
    // }
    else {
      return res.status(404).json({
        messsage: 'The user with the specified id was not found.'
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: error.message || 'An internal server error occurred.'
    });
  }    
};

module.exports = { listAllUsers, getUserByGitName, createNewUser, updateUser, changePassword, setAccessLevel, removeUser };
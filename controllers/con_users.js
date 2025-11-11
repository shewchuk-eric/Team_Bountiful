const mongodb = require('../db/connect');
const ObjectId = require('mongodb').ObjectId; 
const { userSchema, requireLogin, getToday } = require('../models/utilities');
const today = getToday();


const listAllUsers = async (req, res, next) => {
  /* let user = requireLogin(req, res, next);
  if (!user || userLevel != 'admin') {
    res.status(403).json({ message: 'Forbidden. You do not have access to this resource.' });
    return;
  } */ // Validation for admin level access - remove comment marks when sign-in is functional
  const result = await mongodb.getDb().db('team_bountiful').collection('users').find({});
  result.toArray().then((lists) => {
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(lists);
  });
};

const createNewUser = async (req, res, next) => {
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
    accountModified: `${today}`
  };
  const response = await mongodb.getDb().db('team_bountiful').collection('users').insertOne(newUser);
  if (response.acknowledged) {
    res.status(201).json(response);
  } else {
    res.status(500).json(response.error || 'Something went wrong - user not inserted.');
  }
};

const updateUser = async (req, res) => {
// validate admin level access or that person making the change is the user themselves
  const userId = new ObjectId(req.params.id);
  const contact = {
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    userName: req.body.userName,
    password: req.body.password,
    accessLevel: req.body.accessLevel,
    accountModified: `${today}`
  };
  const response = await mongodb.getDb().db('team_bountiful').collection('users').replaceOne({ _id: userId }, contact);
  if (response.modifiedCount > 0) {
    res.status(204).send();
  } else {
    res.status(500).json(response.error || 'Some error occurred while updating the contact.');
  }
};

const changePassword = async (req, res) => {
// validate admin level access
  const userId = new ObjectId(req.params.id);
  const newPassword = {password: req.body.password};
  const response = await mongodb.getDb().db('team_bountiful').collection('users').updateOne({ _id: userId }, { $set: newPassword });
    if (response.modifiedCount > 0) {
    res.status(204).send();
  } else {
    res.status(500).json(response.error || 'Unable to update the password at this time.');
  }
};

const setAccessLevel = async (req, res) => {
// validate admin level access
  const userId = new ObjectId(req.params.id);  
    const newAccessLevel = {accessLevel: 'admin'};
    const response = await mongodb.getDb().db('team_bountiful').collection('users').updateOne({ _id: userId }, { $set: newAccessLevel });
    if (response.modifiedCount > 0) {
    res.status(204).send();
  } else {
    res.status(500).json(response.error || 'Unable to modify user access level at this time.');
  }
};

const removeUser = async (req, res) => {
// validate admin level access or that person making the change is the user themselves
  const userId = new ObjectId(req.params.id);
  const response = await mongodb.getDb().db('team_bountiful').collection('users').deleteOne({ _id: userId }, true);
  console.log(response);
  if (response.deletedCount > 0) {
    res.status(204).send();
  } else {
    res.status(500).json(response.error || 'An error occurred while deleting the contact.');
  }
};

module.exports = { listAllUsers, createNewUser, updateUser, changePassword, setAccessLevel, removeUser };
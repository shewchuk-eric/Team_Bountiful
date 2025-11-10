const mongodb = require('../db/connect');
const ObjectId = require('mongodb').ObjectId; 
const { requireLogin } = require('../models/utilities'); // may need to add a second validation function

//TODO: Implement the following character controller functions
const listAll  = async (req, res) => {
/* let user = requireLogin(req, res, next);
  if (!user) {
    res.status(403).json({ message: 'Forbidden. You must be signed in to use this resource.' });
    return;
  } */ // Validation for user level access - remove comment marks when sign-in is functional
  const result = await mongodb.getDb().db('team_bountiful').collection('images').find({});
  result.toArray().then((lists) => {
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(lists);
  });
 }; 

const listByBook  = async (req, res) => {
//validate user login
 };

const listByCharacter  = async (req, res) => {
//validate user login
 };

const createNewImage  = async (req, res) => {
// validate admin level access
 };

const updateImage  = async (req, res) => {
// validate admin level access
 };

const removeImage  = async (req, res) => {
// validate admin level access
 };

module.exports = { listAll, listByBook, listByCharacter, createNewImage, updateImage, removeImage };
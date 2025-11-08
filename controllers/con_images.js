const mongodb = require('../db/connect');
const ObjectId = require('mongodb').ObjectId; 
const { requireLogin } = require('../models/utilities'); // may need to add a second validation function

//TODO: Implement the following character controller functions
const listAll  = async (req, res) => {
//validate user login
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
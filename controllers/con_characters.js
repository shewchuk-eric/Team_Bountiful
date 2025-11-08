const mongodb = require('../db/connect');
const ObjectId = require('mongodb').ObjectId; 
const { requireLogin } = require('../models/utilities'); // may need to add a second validation function 


//TODO: Implement the following character controller functions
const listAll = async (req, res) => {
//validate user login
    };

const listDetails = async (req, res) => {
//validate user login
    };

const listByBook = async (req, res) => {
//validate user login
    };

const listByQuality = async (req, res) => {
//validate user login
    };

const createNewCharacter = async (req, res) => {
// validate admin level access
    };

const updateCharacter = async (req, res) => {
// validate admin level access
    }; 


module.exports = { listAll, listDetails, listByBook, listByQuality, createNewCharacter, updateCharacter };
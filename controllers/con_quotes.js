const mongodb = require('../db/connect');
const ObjectId = require('mongodb').ObjectId; 
const { requireLogin } = require('../models/utilities');


//TODO: Implement the following character controller functions
const listAll = async (req, res) => {
//validate user login
    };

const listByBook = async (req, res) => {
//validate user login
    };

const listByCharacter = async (req, res) => {
//validate user login
    };

const createNewQuote = async (req, res) => {
// validate user login - maybe admin level access? (allow users to create their own quotes?)
    };

const updateQuote = async (req, res) => {
// validate user login - maybe admin level access? (allow users to only update their own quotes?)
    };


module.exports = { listAll, listByBook, listByCharacter, createNewQuote, updateQuote };
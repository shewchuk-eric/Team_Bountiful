const express = require('express');
const router = express.Router();


router.use('/', require('./swagger'));
router.use('/users', require('./users'));
router.use('/characters', require('./characters'));
router.use('/quotes', require('./quotes'));
router.use('/images', require('./images'));

module.exports = router;
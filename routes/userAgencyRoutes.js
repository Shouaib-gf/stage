const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { createGetUserAgenciesHandler } = require('../controllers/userAgencyController');

const router = express.Router();

router.get('/', protect, createGetUserAgenciesHandler());

module.exports = router;

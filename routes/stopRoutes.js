const express = require('express');
const { createStop, getStops, getStopById, updateStop, deleteStop } = require('../controllers/stopController');
const { protect, isSuperOrAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, isSuperOrAdmin, createStop);
router.get('/',  getStops);
router.get('/:id',  getStopById);
router.put('/:id', protect, isSuperOrAdmin, updateStop);
router.delete('/:id', protect, isSuperOrAdmin, deleteStop);

module.exports = router;

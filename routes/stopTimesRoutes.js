const express = require('express');
const { createStopTime, getStopTimes, getStopTimeById, updateStopTime, deleteStopTime, getStopTimesByTrip} = require('../controllers/stopTimeController');
const { protect, isSuperOrAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, isSuperOrAdmin, createStopTime);
router.get('/trips/:tripId', protect, getStopTimesByTrip);
router.get('/:id', protect, getStopTimeById);
router.get('/', protect, getStopTimes);
router.put('/:id', protect, isSuperOrAdmin, updateStopTime);
router.delete('/:id', protect, isSuperOrAdmin, deleteStopTime);

module.exports = router;

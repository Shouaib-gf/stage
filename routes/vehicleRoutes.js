const express = require('express');
const {
  getAllVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle
} = require('../controllers/vehicleController');
const { protect, isSuperOrAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', protect, getAllVehicles);
router.get('/:id', protect, getVehicleById); // ✅ Corrected line
router.post('/', protect, isSuperOrAdmin, createVehicle);
router.put('/:id', protect, isSuperOrAdmin, updateVehicle);
router.delete('/:id', protect, isSuperOrAdmin, deleteVehicle);

module.exports = router;

const express = require('express');
const {createAssignment,getAllAssignments,getAssignmentById,updateAssignment,deleteAssignment } = require('../controllers/VehicleAssignementController');
const { protect, isSuperOrAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

router.post("/", protect, isSuperOrAdmin, createAssignment);
router.get("/",protect, getAllAssignments);
router.get("/:id",protect, getAssignmentById);
router.put("/:id", protect, isSuperOrAdmin, updateAssignment);
router.delete("/:id", protect, isSuperOrAdmin, deleteAssignment);

module.exports = router;

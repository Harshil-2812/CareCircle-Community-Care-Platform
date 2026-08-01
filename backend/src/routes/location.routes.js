const express = require('express');
const router = express.Router();
const { getLocations, createLocation } = require('../controllers/location.controller');
const authMiddleware = require('../middleware/authMiddleware');
const { checkRole } = require('../middleware/roleMiddleware');

// GET /api/locations
router.get('/', authMiddleware, getLocations);
// POST /api/locations (Admin)
router.post('/', authMiddleware, checkRole('Admin'), createLocation);

module.exports = router;

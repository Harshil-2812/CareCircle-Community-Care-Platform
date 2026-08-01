const express = require('express');
const router = express.Router();
const { getPostalCodes, createPostalCode } = require('../controllers/location.controller');
const authMiddleware = require('../middleware/authMiddleware');
const { checkRole } = require('../middleware/roleMiddleware');

// GET /api/postal-codes
router.get('/', authMiddleware, getPostalCodes);
// POST /api/postal-codes (Admin)
router.post('/', authMiddleware, checkRole('Admin'), createPostalCode);

module.exports = router;

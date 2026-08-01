const express = require('express');
const router = express.Router();
const { getCategories, createCategory } = require('../controllers/category.controller');
const authMiddleware = require('../middleware/authMiddleware');
const { checkRole } = require('../middleware/roleMiddleware');

router.get('/', authMiddleware, getCategories);
router.post('/', authMiddleware, checkRole('Admin'), createCategory);

module.exports = router;

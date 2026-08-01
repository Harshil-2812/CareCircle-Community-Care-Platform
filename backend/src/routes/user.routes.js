const express = require('express');
const router = express.Router();
const { getAllUsers, getUserById, updateUserStatus, getRoles, getTopVolunteerLeaderboardRaw } = require('../controllers/user.controller');
const authMiddleware = require('../middleware/authMiddleware');
const { checkRole } = require('../middleware/roleMiddleware');

// Analytics routes MUST be before /:id to avoid being caught as a param
router.get('/analytics/top-volunteers', authMiddleware, checkRole('Admin'), getTopVolunteerLeaderboardRaw);

router.get('/', authMiddleware, checkRole('Admin'), getAllUsers);
router.get('/roles', authMiddleware, getRoles);
router.get('/:id', authMiddleware, getUserById);
router.put('/:id/status', authMiddleware, checkRole('Admin'), updateUserStatus);

module.exports = router;

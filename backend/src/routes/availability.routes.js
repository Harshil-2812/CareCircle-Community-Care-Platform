const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/availability.controller');
const authMiddleware = require('../middleware/authMiddleware');
const { checkRole } = require('../middleware/roleMiddleware');

// Specific routes before /:id
router.get('/mine', authMiddleware, checkRole('Volunteer'), ctrl.getMyAvailability);
router.get('/volunteer/:id', authMiddleware, ctrl.getVolunteerAvailability);

router.post('/', authMiddleware, checkRole('Volunteer'), ctrl.addAvailability);
router.delete('/:id', authMiddleware, ctrl.deleteAvailability);

module.exports = router;

const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/assignment.controller');
const authMiddleware = require('../middleware/authMiddleware');
const { checkRole } = require('../middleware/roleMiddleware');

// Analytics routes MUST be before /:id to avoid being caught as a param
router.get('/analytics/volunteer-tasks', authMiddleware, checkRole('Admin'), ctrl.getVolunteerTaskAssignmentDetailsRaw);

router.post('/', authMiddleware, checkRole('Admin', 'Volunteer'), ctrl.createAssignment);
router.put('/:id/complete', authMiddleware, checkRole('Admin', 'Volunteer'), ctrl.completeAssignment);
router.get('/:id', authMiddleware, ctrl.getAssignmentById);

module.exports = router;

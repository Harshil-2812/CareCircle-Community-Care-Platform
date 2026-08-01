const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/task.controller');
const authMiddleware = require('../middleware/authMiddleware');
const { checkRole } = require('../middleware/roleMiddleware');

// Specific routes BEFORE /:id
router.get('/pending', authMiddleware, ctrl.getPendingTasks);
router.get('/my-assignments', authMiddleware, checkRole('Volunteer'), ctrl.getMyAssignments);

router.get('/analytics/urgent', authMiddleware, checkRole('Admin'), ctrl.getUrgentTasksPendingRaw);

router.get('/', authMiddleware, ctrl.getAllTasks);
router.post('/', authMiddleware, checkRole('Admin', 'Family'), ctrl.createTask);
router.get('/:id', authMiddleware, ctrl.getTaskById);
router.put('/:id/status', authMiddleware, ctrl.updateTaskStatus);

module.exports = router;

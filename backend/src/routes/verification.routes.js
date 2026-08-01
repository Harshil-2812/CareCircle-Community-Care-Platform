const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/verification.controller');
const authMiddleware = require('../middleware/authMiddleware');
const { checkRole } = require('../middleware/roleMiddleware');

// Specific routes before /:id
router.get('/pending', authMiddleware, checkRole('Admin'), ctrl.getPendingVerifications);
router.get('/status', authMiddleware, checkRole('Volunteer'), ctrl.getMyVerificationStatus);

router.get('/analytics/admin-log', authMiddleware, checkRole('Admin'), ctrl.getAdminVerificationLogRaw);

router.post('/', authMiddleware, checkRole('Volunteer'), ctrl.submitVerification);
router.put('/:id', authMiddleware, checkRole('Admin'), ctrl.updateVerification);

module.exports = router;

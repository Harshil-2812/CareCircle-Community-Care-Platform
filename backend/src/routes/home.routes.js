const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/home.controller');
const authMiddleware = require('../middleware/authMiddleware');
const { checkRole } = require('../middleware/roleMiddleware');

// Analytics routes MUST be before /:id to avoid being caught as a param
router.get('/analytics/occupancy', authMiddleware, checkRole('Admin'), ctrl.getCareHomeOccupancyReportRaw);

router.get('/', authMiddleware, ctrl.getHomes);
router.post('/', authMiddleware, checkRole('Admin'), ctrl.createHome);
router.get('/:id', authMiddleware, ctrl.getHomeById);
router.put('/:id', authMiddleware, checkRole('Admin'), ctrl.updateHome);
router.get('/:id/residents', authMiddleware, ctrl.getResidents);
router.post('/:id/residents', authMiddleware, checkRole('Admin'), ctrl.addResident);
router.put('/:id/residents/:resident_id/discharge', authMiddleware, checkRole('Admin'), ctrl.dischargeResident);

module.exports = router;

const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/network.controller');
const authMiddleware = require('../middleware/authMiddleware');
const { checkRole } = require('../middleware/roleMiddleware');

// Analytics routes MUST be before /:id to avoid being caught as a param
router.get('/analytics/residents', authMiddleware, checkRole('Admin'), ctrl.getNetworkResidentMappingRaw);

router.get('/', authMiddleware, ctrl.getNetworks);
router.post('/', authMiddleware, checkRole('Admin'), ctrl.createNetwork);
router.post('/:id/homes', authMiddleware, checkRole('Admin'), ctrl.addHomeToNetwork);
router.get('/:id/homes', authMiddleware, ctrl.getNetworkHomes);

module.exports = router;

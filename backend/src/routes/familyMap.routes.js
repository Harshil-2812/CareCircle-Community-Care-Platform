const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/familyMap.controller');
const authMiddleware = require('../middleware/authMiddleware');
const { checkRole } = require('../middleware/roleMiddleware');

router.post('/', authMiddleware, checkRole('Family', 'Admin'), ctrl.addFamilyMap);
router.get('/my-elderly', authMiddleware, checkRole('Family', 'Admin'), ctrl.getMyElderly);
router.delete('/:map_id', authMiddleware, ctrl.removeFamilyMap);

router.get('/analytics/dashboard', authMiddleware, checkRole('Family', 'Admin'), ctrl.getFamilyDashboardMappingRaw);

module.exports = router;

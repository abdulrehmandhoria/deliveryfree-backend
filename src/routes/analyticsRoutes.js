const express = require('express');
const analyticsController = require('../controllers/analyticsController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect, restrictTo('ADMIN'));

router.get('/advanced-stats', analyticsController.getAdvancedStats);
router.get('/rider/:riderId', analyticsController.getRiderAnalytics);
router.get('/rider', analyticsController.getRiderAnalytics);

module.exports = router;

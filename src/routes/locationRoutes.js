const express = require('express');
const locationController = require('../controllers/locationController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, restrictTo('RIDER'), locationController.saveLocation);
router.get('/order/:orderId', locationController.getLatestLocation);
router.get('/rider/:riderId', locationController.getLocationByRider);
router.get('/history/:orderId', locationController.getLocationHistory);

module.exports = router;

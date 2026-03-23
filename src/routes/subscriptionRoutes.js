const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

// Get current logic from authController as it handles subscriptions for now
router.get('/my', protect, authController.getMySubscription);

module.exports = router;

const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

// Public/Authenticated access for fetching
router.get('/', protect, settingsController.getSettings);

// Admin only access for updating
router.put('/', protect, restrictTo('ADMIN'), settingsController.updateSettings);

module.exports = router;

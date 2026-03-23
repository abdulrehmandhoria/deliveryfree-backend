const express = require('express');
const trackingController = require('../controllers/trackingController');

const router = express.Router();

// Public route for customer tracking
router.get('/:id', trackingController.getPublicTracking);

module.exports = router;

const express = require('express');
const authController = require('../controllers/authController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/my-subscription', protect, authController.getMySubscription);
router.patch('/toggle-online', protect, authController.toggleOnlineStatus);
router.get('/riders', protect, restrictTo('ADMIN'), authController.getAllRiders);

// Admin only routes
router.use(restrictTo('ADMIN'));
router.get('/restaurants', authController.getAllRestaurants);
router.post('/assign-plan', authController.updateUserSubscription);
router.post('/assign-restaurants', authController.assignRestaurantsToRider);
router.patch('/toggle-status', authController.toggleUserStatus);

module.exports = router;

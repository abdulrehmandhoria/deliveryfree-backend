const express = require('express');
const orderController = require('../controllers/orderController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

// All routes require authentication
router.use(protect);

// ========== RESTAURANT: Create order ==========
router.post('/create', orderController.createOrder);

// ========== RESTAURANT: Get own orders ==========
router.get('/restaurant-orders', orderController.getRestaurantOrders);

// ========== RIDER: Get orders ==========
router.get('/available', orderController.getAvailableOrders);
router.get('/completed', orderController.getCompletedOrders);
router.get('/active', orderController.getActiveOrder);
router.get('/my', orderController.getMyOrders);
router.get('/debug-orders', orderController.debugGetAllOrders);

// ========== ADMIN: Get all orders ==========
router.get('/all', restrictTo('ADMIN'), orderController.getAllOrders);
router.get('/stats', restrictTo('ADMIN'), orderController.getOrderStats);
router.post('/auto-assign', restrictTo('ADMIN'), orderController.autoAssignPendingOrders);

// ========== Order actions with ID ==========
router.patch('/:id/accept', orderController.acceptOrder);
router.get('/:id', orderController.getOrder);
router.patch('/:id', orderController.updateOrderStatus);

module.exports = router;

const express = require('express');
const orderController = require('../controllers/orderController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.post('/', orderController.createOrder);
router.get('/available', orderController.getAvailableOrders);
router.get('/completed', orderController.getCompletedOrders);
router.get('/debug-orders', protect, orderController.debugGetAllOrders);

router.get('/all', restrictTo('ADMIN'), orderController.getAllOrders);
router.get('/stats', restrictTo('ADMIN'), orderController.getOrderStats);
router.post('/auto-assign', restrictTo('ADMIN'), orderController.autoAssignPendingOrders);

router.route('/')
  .get(orderController.getRestaurantOrders);
router.patch('/:id/accept', orderController.acceptOrder);

router.route('/:id')
  .get(orderController.getOrder)
  .patch(orderController.updateOrderStatus);

module.exports = router;

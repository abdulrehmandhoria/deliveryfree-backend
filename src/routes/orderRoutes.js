const express = require('express');
const orderController = require('../controllers/orderController');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const { checkSubscription } = require('../middleware/subscriptionMiddleware');

const router = express.Router();

router.use(protect); // All order routes are protected

// Apply subscription check to order creation and job board
router.post('/', checkSubscription, orderController.createOrder);
router.get('/available', checkSubscription, orderController.getAvailableOrders);

router.get('/all', restrictTo('ADMIN'), orderController.getAllOrders);
router.get('/stats', restrictTo('ADMIN'), orderController.getOrderStats);

router.route('/')
  .get(orderController.getRestaurantOrders);
router.patch('/:id/accept', orderController.acceptOrder);

router.route('/:id')
  .get(orderController.getOrder)
  .patch(orderController.updateOrderStatus);

module.exports = router;

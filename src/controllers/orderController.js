const Order = require('../models/Order');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const User = require('../models/User');

const autoAssignRider = async (order) => {
  // 1. Find all online riders
  const onlineRiders = await User.find({ role: 'RIDER', isOnline: true });
  if (onlineRiders.length === 0) return null;

  // 2. Filter by restaurant affinity (if any rider is specifically assigned to this restaurant)
  let eligibleRiders = onlineRiders.filter(r =>
    r.assignedRestaurants && r.assignedRestaurants.some(id => id.toString() === order.restaurant.toString())
  );

  // 3. If no specific affinity, consider all online riders (Open Market)
  if (eligibleRiders.length === 0) {
    eligibleRiders = onlineRiders;
  }

  // 4. Sort by workload (activeOrders)
  // We need to fetch the count for each eligible rider
  const ridersWithWorkload = await Promise.all(eligibleRiders.map(async (rider) => {
    const activeOrders = await Order.countDocuments({
      rider: rider._id,
      status: { $in: ['ASSIGNED', 'PICKED_UP', 'OUT_FOR_DELIVERY'] }
    });
    return { rider, activeOrders };
  }));

  // Sort by activeOrders ascending
  ridersWithWorkload.sort((a, b) => a.activeOrders - b.activeOrders);

  // 5. Return the best rider
  return ridersWithWorkload[0].rider;
};

exports.getAllOrders = catchAsync(async (req, res, next) => {
  const orders = await Order.find().populate('restaurant rider').sort('-createdAt');

  res.status(200).json({
    status: 'success',
    results: orders.length,
    data: {
      orders,
    },
  });
});

exports.createOrder = catchAsync(async (req, res, next) => {
  // Add restaurant from logged in user
  req.body.restaurant = req.user._id;

  const order = await Order.create(req.body);

  // Auto assignment logic
  const bestRider = await autoAssignRider(order);
  if (bestRider) {
    order.rider = bestRider._id;
    order.status = 'ASSIGNED';
    order.assignmentType = 'AUTO';
    await order.save();
  }

  const populatedOrder = await Order.findById(order._id).populate('restaurant');

  // Emit event for real-time updates
  const io = req.app.get('socketio');
  io.emit('ORDER_CREATED', populatedOrder);

  res.status(201).json({
    status: 'success',
    data: { order: populatedOrder },
  });
});

exports.getRestaurantOrders = catchAsync(async (req, res, next) => {
  const orders = await Order.find({ restaurant: req.user._id }).sort('-createdAt');

  res.status(200).json({
    status: 'success',
    results: orders.length,
    data: {
      orders,
    },
  });
});

exports.getOrder = catchAsync(async (req, res, next) => {
  const order = await Order.findById(req.params.id).populate('restaurant rider');

  if (!order) {
    return next(new AppError('Order not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      order,
    },
  });
});

exports.getAvailableOrders = catchAsync(async (req, res, next) => {
  // Check if rider is online
  if (!req.user.isOnline) {
    return next(new AppError('You must be online to view available orders.', 400));
  }

  // Filter orders by assigned restaurants
  const filter = { status: 'PENDING' };
  if (req.user.assignedRestaurants && req.user.assignedRestaurants.length > 0) {
    filter.restaurant = { $in: req.user.assignedRestaurants };
  }

  const orders = await Order.find(filter).populate('restaurant').sort('-createdAt');

  res.status(200).json({
    status: 'success',
    results: orders.length,
    data: {
      orders,
    },
  });
});

exports.acceptOrder = catchAsync(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new AppError('Order not found', 404));
  }

  if (order.status !== 'PENDING') {
    return next(new AppError('Order is no longer available', 400));
  }

  order.rider = req.user._id;
  order.status = 'ASSIGNED';
  await order.save();
  await order.populate('restaurant rider');

  // Emit real-time events
  const socketManager = require('../utils/socketManager');
  socketManager.emitEvent('STATUS_UPDATED', order, `order_${order._id}`);
  socketManager.emitEvent('STATUS_UPDATED', order);

  // WhatsApp Notification (Optional - could fail but we don't block)
  const whatsappService = require('../utils/whatsappService');
  whatsappService.sendStatusUpdate(order.customerPhone, order._id, order.status, order.customerName);

  res.status(200).json({
    status: 'success',
    data: {
      order,
    },
  });
});

exports.updateOrderStatus = catchAsync(async (req, res, next) => {
  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status },
    { new: true, runValidators: true }
  ).populate('restaurant rider');

  if (!order) {
    return next(new AppError('Order not found', 404));
  }

  // Emit real-time event
  const socketManager = require('../utils/socketManager');
  socketManager.emitEvent('STATUS_UPDATED', order, `order_${order._id}`);

  // WhatsApp Notification
  const whatsappService = require('../utils/whatsappService');
  whatsappService.sendStatusUpdate(order.customerPhone, order._id, order.status, order.customerName);

  res.status(200).json({
    status: 'success',
    data: {
      order,
    },
  });
});

exports.getOrderStats = catchAsync(async (req, res, next) => {
  const stats = await Order.aggregate([
    {
      $facet: {
        statusBreakdown: [
          { $group: { _id: '$status', count: { $sum: 1 } } }
        ],
        revenueStats: [
          { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' }, totalOrders: { $sum: 1 } } }
        ],
        dailyOrders: [
          {
            $group: {
              _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
              count: { $sum: 1 },
              revenue: { $sum: '$totalAmount' }
            }
          },
          { $sort: { _id: 1 } },
          { $limit: 7 }
        ]
      }
    }
  ]);

  res.status(200).json({
    status: 'success',
    data: stats[0]
  });
});

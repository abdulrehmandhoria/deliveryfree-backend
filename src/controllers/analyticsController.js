const Order = require('../models/Order');
const User = require('../models/User');
const catchAsync = require('../utils/catchAsync');

exports.getAdvancedStats = catchAsync(async (req, res, next) => {
  const stats = await Order.aggregate([
    {
      $facet: {
        revenueByMonth: [
          {
            $group: {
              _id: { $month: "$createdAt" },
              totalRevenue: { $sum: "$totalAmount" },
              orderCount: { $sum: 1 }
            }
          },
          { $sort: { "_id": 1 } }
        ],
        ordersByRestaurant: [
          {
            $lookup: {
              from: 'users',
              localField: 'restaurant',
              foreignField: '_id',
              as: 'restaurantInfo'
            }
          },
          { $unwind: "$restaurantInfo" },
          {
            $group: {
              _id: "$restaurantInfo.name",
              count: { $sum: 1 },
              revenue: { $sum: "$totalAmount" }
            }
          }
        ],
        riderPerformance: [
          { $match: { status: 'DELIVERED', rider: { $ne: null } } },
          {
            $lookup: {
              from: 'users',
              localField: 'rider',
              foreignField: '_id',
              as: 'riderInfo'
            }
          },
          { $unwind: "$riderInfo" },
          {
            $group: {
              _id: "$riderInfo._id",
              riderName: { $first: "$riderInfo.name" },
              riderPhone: { $first: "$riderInfo.phone" },
              deliveries: { $sum: 1 },
              totalEarnings: { $sum: 50 }
            }
          }
        ],
        orderStatusBreakdown: [
          {
            $group: {
              _id: "$status",
              count: { $sum: 1 }
            }
          }
        ],
        dailyOrders: [
          {
            $group: {
              _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
              count: { $sum: 1 },
              revenue: { $sum: '$totalAmount' }
            }
          },
          { $sort: { _id: -1 } },
          { $limit: 7 }
        ],
        avgOrderValue: [
          {
            $group: {
              _id: null,
              avgValue: { $avg: '$totalAmount' },
              totalOrders: { $sum: 1 },
              totalRevenue: { $sum: '$totalAmount' }
            }
          }
        ]
      }
    }
  ]);

  const riders = await User.find({ role: 'RIDER' }).select('name phone isOnline assignedRestaurants');
  const riderActivity = riders.map(rider => ({
    _id: rider._id,
    name: rider.name,
    phone: rider.phone,
    isOnline: rider.isOnline,
    assignedRestaurants: rider.assignedRestaurants?.length || 0
  }));

  const activeOrders = await Order.find({ status: { $in: ['ASSIGNED', 'PICKED_UP', 'OUT_FOR_DELIVERY'] } })
    .populate('rider', 'name phone')
    .populate('restaurant', 'name');

  res.status(200).json({
    status: 'success',
    data: {
      stats: stats[0],
      riderActivity,
      activeOrders,
      summary: {
        totalRiders: riders.length,
        onlineRiders: riders.filter(r => r.isOnline).length,
        totalActiveOrders: activeOrders.length
      }
    }
  });
});

exports.getRiderAnalytics = catchAsync(async (req, res, next) => {
  const riderId = req.params.riderId || req.user._id;

  const riderOrders = await Order.find({ rider: riderId }).sort('-createdAt');

  const totalDelivered = riderOrders.filter(o => o.status === 'DELIVERED').length;
  const totalCancelled = riderOrders.filter(o => o.status === 'CANCELLED').length;
  const totalEarnings = totalDelivered * 50;

  const recentOrders = riderOrders.slice(0, 10);

  res.status(200).json({
    status: 'success',
    data: {
      riderId,
      totalOrders: riderOrders.length,
      totalDelivered,
      totalCancelled,
      totalEarnings,
      rating: 4.5,
      recentOrders
    }
  });
});

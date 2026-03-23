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
              _id: "$riderInfo.name",
              deliveries: { $sum: 1 },
              totalEarnings: { $sum: 50 } // Base fee proxy
            }
          }
        ]
      }
    }
  ]);

  res.status(200).json({
    status: 'success',
    data: { stats: stats[0] }
  });
});

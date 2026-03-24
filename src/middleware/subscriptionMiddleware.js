const Subscription = require('../models/Subscription');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.checkSubscription = catchAsync(async (req, res, next) => {
  if (req.user.role === 'ADMIN') return next();

  const subscription = await Subscription.findOne({ user: req.user._id }).populate('plan');

  if (!subscription) {
    console.log(`Subscription check failed: No subscription for user ${req.user._id}`);
    return next(new AppError('No active subscription found. Please subscribe to continue.', 403));
  }

  const endDateTime = new Date(subscription.endDate).getTime();
  const now = Date.now();
  
  console.log(`Subscription check for user ${req.user._id}:`, {
    status: subscription.status,
    endDate: subscription.endDate,
    endDateTime,
    now,
    isExpired: endDateTime < now
  });
  
  if (subscription.status !== 'ACTIVE') {
    return next(new AppError('Your subscription is not active.', 403));
  }
  
  if (endDateTime < now) {
    return next(new AppError('Your subscription has expired. Please renew.', 403));
  }

  req.subscription = subscription;
  next();
});

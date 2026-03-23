const Subscription = require('../models/Subscription');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.checkSubscription = catchAsync(async (req, res, next) => {
  // Admin bypass
  if (req.user.role === 'ADMIN') return next();

  const subscription = await Subscription.findOne({ user: req.user._id });

  if (!subscription) {
    return next(new AppError('No active subscription found. Please subscribe to continue.', 403));
  }

  if (subscription.status !== 'ACTIVE' || subscription.endDate < Date.now()) {
    return next(new AppError('Your subscription has expired or is inactive.', 403));
  }

  // Attach subscription to request for later use
  req.subscription = subscription;
  next();
});

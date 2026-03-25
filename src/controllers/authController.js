const jwt = require('jsonwebtoken');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const User = require('../models/User');
const Subscription = require('../models/Subscription');
const Plan = require('../models/Plan');

exports.getAllRestaurants = catchAsync(async (req, res, next) => {
  const restaurants = await User.find({ role: 'RESTAURANT' }).select('-password');
  
  // Get subscriptions for these restaurants
  const restaurantIds = restaurants.map(r => r._id);
  const subscriptions = await Subscription.find({ user: { $in: restaurantIds } }).populate('plan');

  res.status(200).json({
    status: 'success',
    results: restaurants.length,
    data: {
      restaurants,
      subscriptions
    },
  });
});

exports.updateUserSubscription = catchAsync(async (req, res, next) => {
  const { userId, planId, customPrice } = req.body;

  const plan = await Plan.findById(planId);
  if (!plan) return next(new AppError('Plan not found', 404));

  const duration = plan.duration || 30;
  const endDate = new Date(Date.now() + duration * 24 * 60 * 60 * 1000);
  const startDate = new Date();

  let subscription = await Subscription.findOne({ user: userId });

  if (subscription) {
    subscription.plan = planId;
    subscription.status = 'ACTIVE';
    subscription.startDate = startDate;
    subscription.endDate = endDate;
    subscription.customPrice = customPrice || null;
    await subscription.save();
  } else {
    subscription = await Subscription.create({
      user: userId,
      plan: planId,
      status: 'ACTIVE',
      startDate: startDate,
      endDate: endDate,
      customPrice: customPrice || null
    });
  }

  await subscription.populate('plan');

  res.status(200).json({
    status: 'success',
    data: {
      subscription,
    },
  });
});

exports.getMySubscription = catchAsync(async (req, res, next) => {
  const subscription = await Subscription.findOne({ user: req.user._id }).populate('plan');

  res.status(200).json({
    status: 'success',
    data: {
      subscription,
    },
  });
});

exports.checkMySubscription = catchAsync(async (req, res, next) => {
  const subscription = await Subscription.findOne({ user: req.user._id }).populate('plan');

  let status = 'inactive';
  let message = 'No subscription found';

  if (subscription) {
    const isExpired = new Date(subscription.endDate).getTime() < Date.now();
    if (subscription.status === 'ACTIVE' && !isExpired) {
      status = 'active';
      message = 'Subscription is active';
    } else if (subscription.status !== 'ACTIVE') {
      status = 'inactive';
      message = 'Subscription is not active';
    } else if (isExpired) {
      status = 'expired';
      message = 'Subscription has expired';
    }
  }

  res.status(200).json({
    status: 'success',
    data: {
      subscription,
      checkStatus: status,
      message,
      serverTime: new Date().toISOString(),
      subscriptionEndDate: subscription?.endDate,
    },
  });
});

exports.toggleOnlineStatus = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { isOnline: req.body.isOnline },
    { new: true, runValidators: true }
  );

  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});

exports.toggleUserStatus = catchAsync(async (req, res, next) => {
  const { userId, isActive } = req.body;
  const user = await User.findByIdAndUpdate(
    userId,
    { isActive },
    { new: true, runValidators: true }
  );
  if (!user) return next(new AppError('User not found', 404));
  
  res.status(200).json({
    status: 'success',
    data: { user },
  });
});

exports.toggleSubscriptionStatus = catchAsync(async (req, res, next) => {
  const { userId, status } = req.body;
  
  let subscription = await Subscription.findOne({ user: userId });
  
  if (!subscription) {
    return next(new AppError('Subscription not found', 404));
  }
  
  subscription.status = status;
  await subscription.save();
  await subscription.populate('plan');
  
  res.status(200).json({
    status: 'success',
    data: {
      subscription,
    },
  });
});

exports.assignRestaurantsToRider = catchAsync(async (req, res, next) => {
  const { riderId, restaurantIds } = req.body;

  const rider = await User.findByIdAndUpdate(
    riderId,
    { assignedRestaurants: restaurantIds },
    { new: true, runValidators: true }
  );

  if (!rider) return next(new AppError('Rider not found', 404));

  res.status(200).json({
    status: 'success',
    data: {
      rider,
    },
  });
});

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

exports.register = catchAsync(async (req, res, next) => {
  const { name, email, password, role, phone } = req.body;

  if (!name || !email || !password || !role || !phone) {
    return next(new AppError('Please provide all required fields', 400));
  }

  const newUser = await User.create({
    name,
    email,
    password,
    role,
    phone,
  });

  // Auto-create a free subscription for 30 days
  const freePlan = await Plan.findOne({ name: 'Free Trial' });
  if (freePlan) {
    await Subscription.create({
      user: newUser._id,
      plan: freePlan._id,
      status: 'ACTIVE',
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });
  }

  createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }

  // Attempt to find in database
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  // Check if user is active
  if (user.isActive === false) {
    return next(new AppError('Your account has been deactivated. Please contact support.', 403));
  }

  createSendToken(user, 200, res);
});

const Order = require('../models/Order');

exports.getAllRiders = catchAsync(async (req, res, next) => {
  const riders = await User.find({ role: 'RIDER' }).select('-password').populate('assignedRestaurants', 'name');
  
  // Calculate workload for each rider
  const ridersWithWorkload = await Promise.all(riders.map(async (rider) => {
    const activeOrders = await Order.countDocuments({
      rider: rider._id,
      status: { $in: ['ASSIGNED', 'PICKED_UP', 'OUT_FOR_DELIVERY'] }
    });
    
    return {
      ...rider.toObject(),
      activeOrders
    };
  }));

  res.status(200).json({
    status: 'success',
    results: ridersWithWorkload.length,
    data: {
      riders: ridersWithWorkload,
    },
  });
});

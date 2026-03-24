const Location = require('../models/Location');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.saveLocation = catchAsync(async (req, res, next) => {
  const { lat, lng, orderId, accuracy, speed, heading } = req.body;
  
  if (!lat || !lng) {
    return next(new AppError('Latitude and longitude are required', 400));
  }

  const location = await Location.create({
    riderId: req.user._id,
    orderId: orderId || null,
    location: { lat, lng },
    accuracy: accuracy || 0,
    speed: speed || 0,
    heading: heading || 0
  });

  res.status(201).json({
    status: 'success',
    data: {
      location
    }
  });
});

exports.getLatestLocation = catchAsync(async (req, res, next) => {
  const { orderId } = req.params;

  let location;
  
  if (orderId) {
    location = await Location.findOne({ orderId })
      .sort('-createdAt')
      .populate('riderId', 'name phone');
  } else {
    location = await Location.findOne({ riderId: req.params.riderId })
      .sort('-createdAt')
      .populate('riderId', 'name phone');
  }

  if (!location) {
    return next(new AppError('No location found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      location
    }
  });
});

exports.getLocationByRider = catchAsync(async (req, res, next) => {
  const { riderId } = req.params;

  const location = await Location.findOne({ riderId })
    .sort('-createdAt')
    .populate('riderId', 'name phone');

  if (!location) {
    return next(new AppError('No location found for this rider', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      location
    }
  });
});

exports.getLocationHistory = catchAsync(async (req, res, next) => {
  const { orderId } = req.params;
  const { limit = 100 } = req.query;

  const locations = await Location.find({ orderId })
    .sort('-createdAt')
    .limit(parseInt(limit))
    .populate('riderId', 'name phone');

  res.status(200).json({
    status: 'success',
    results: locations.length,
    data: {
      locations
    }
  });
});

const Product = require('../models/Product');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.getProducts = catchAsync(async (req, res, next) => {
  const filter = { restaurant: req.user._id };
  
  if (req.query.category) {
    filter.category = req.query.category;
  }
  
  if (req.query.isAvailable) {
    filter.isAvailable = req.query.isAvailable === 'true';
  }

  const products = await Product.find(filter).sort('-createdAt');

  res.status(200).json({
    status: 'success',
    results: products.length,
    data: {
      products,
    },
  });
});

exports.getCategories = catchAsync(async (req, res, next) => {
  const categories = await Product.distinct('category', { restaurant: req.user._id });

  res.status(200).json({
    status: 'success',
    results: categories.length,
    data: {
      categories,
    },
  });
});

exports.createProduct = catchAsync(async (req, res, next) => {
  req.body.restaurant = req.user._id;
  
  const product = await Product.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      product,
    },
  });
});

exports.updateProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findOneAndUpdate(
    { _id: req.params.id, restaurant: req.user._id },
    req.body,
    { new: true, runValidators: true }
  );

  if (!product) {
    return next(new AppError('Product not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      product,
    },
  });
});

exports.deleteProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findOneAndDelete({
    _id: req.params.id,
    restaurant: req.user._id
  });

  if (!product) {
    return next(new AppError('Product not found', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

const Plan = require('../models/Plan');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const cache = require('../utils/cache');

exports.getPlans = async (req, res) => {
  try {
    const cachedPlans = cache.get('all_plans');
    if (cachedPlans) {
      return res.status(200).json({ success: true, count: cachedPlans.length, plans: cachedPlans });
    }

    const plans = await Plan.find();
    cache.set('all_plans', plans);

    res.status(200).json({ success: true, count: plans.length, plans });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createPlan = catchAsync(async (req, res, next) => {
  const newPlan = await Plan.create(req.body);

    cache.del('all_plans');
    res.status(201).json({
      status: 'success',
      data: {
        plan: newPlan,
      },
    });
});

exports.updatePlan = catchAsync(async (req, res, next) => {
  const plan = await Plan.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!plan) {
    return next(new AppError('No plan found with that ID', 404));
  }

    cache.del('all_plans');
    res.status(200).json({
      status: 'success',
      data: {
        plan,
      },
    });
});

exports.deletePlan = catchAsync(async (req, res, next) => {
  const plan = await Plan.findByIdAndUpdate(req.params.id, { active: false }, { new: true }); // Assuming soft delete, but updating with new: true to return the updated doc
  if (!plan) return res.status(404).json({ success: false, message: 'Plan not found' });
  
  cache.del('all_plans');
  res.status(200).json({ success: true, plan });
});

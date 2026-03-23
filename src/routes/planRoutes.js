const express = require('express');
const planController = require('../controllers/planController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', planController.getPlans);

// Admin only routes
router.use(protect, restrictTo('ADMIN'));

router.post('/', planController.createPlan);
router.route('/:id')
  .patch(planController.updatePlan)
  .delete(planController.deletePlan);

module.exports = router;

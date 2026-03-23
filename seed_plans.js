const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Plan = require('./src/models/Plan');

dotenv.config();

const seedPlans = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('DB Connected for seeding plans...');

    const plans = [
      {
        name: 'Free Trial',
        price: 0,
        features: ['5 orders per day', 'Email support', 'Basic analytics'],
      },
      {
        name: 'Professional',
        price: 2500,
        features: ['Unlimited orders', 'Priority support', 'Advanced analytics', 'WhatsApp alerts'],
      },
      {
        name: 'Enterprise',
        price: 5000,
        features: ['Multiple locations', 'Dedicated manager', 'API access', 'Custom reporting'],
      },
    ];

    await Plan.deleteMany();
    await Plan.insertMany(plans);

    console.log('Plans seeded successfully!');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedPlans();

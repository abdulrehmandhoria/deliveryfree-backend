const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./src/models/User');
const Subscription = require('./src/models/Subscription');

dotenv.config();

const seedSubscriptions = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('DB connection successful for seeding!');

    const users = await User.find();
    console.log(`Found ${users.length} users. Checking subscriptions...`);

    for (const user of users) {
      const existingSub = await Subscription.findOne({ user: user._id });
      if (!existingSub) {
        await Subscription.create({
          user: user._id,
          plan: 'FREE',
          status: 'ACTIVE',
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days trial
          whatsappNotifications: true
        });
        console.log(`Created trial subscription for ${user.email}`);
      }
    }

    console.log('Seeding complete!');
    process.exit();
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
};

seedSubscriptions();

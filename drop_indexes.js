const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const dropIndexes = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('DB connection successful!');

    const collection = mongoose.connection.db.collection('subscriptions');
    await collection.dropIndexes();
    console.log('All indexes dropped from subscriptions collection (except _id)');

    process.exit();
  } catch (err) {
    console.error('Drop failed:', err);
    process.exit(1);
  }
};

dropIndexes();

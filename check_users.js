const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./src/models/User');

dotenv.config();

const checkUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const count = await User.countDocuments();
    const users = await User.find({}, { name: 1, email: 1, role: 1 });
    console.log(`Total Users in DB: ${count}`);
    console.log('Users:', JSON.stringify(users, null, 2));
    process.exit();
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
};

checkUsers();

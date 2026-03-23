const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./src/models/User');

dotenv.config();

const users = [
  {
    name: 'Admin User',
    email: 'admin@deliverfree.com',
    password: 'password123',
    role: 'ADMIN',
    phone: '03001234567',
  },
  {
    name: 'Restaurant User',
    email: 'restaurant@deliverfree.com',
    password: 'password123',
    role: 'RESTAURANT',
    phone: '03007654321',
  },
  {
    name: 'Rider User',
    email: 'rider@deliverfree.com',
    password: 'password123',
    role: 'RIDER',
    phone: '03123456789',
  },
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('DB Connected for seeding...');
    
    await User.deleteMany({}); // Clear existing users for fresh seed
    await User.create(users);
    
    console.log('Database Seeded Successfully!');
    process.exit();
  } catch (err) {
    console.error('Seeding Error:', err);
    process.exit(1);
  }
};

seedDB();

const dotenv = require('dotenv');
const mongoose = require('mongoose');

process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.log(err.stack);
  process.exit(1);
});

dotenv.config();

const app = require('./app');

const PORT = process.env.PORT || 5000;
const DB = process.env.MONGODB_URI;

const connectDB = async () => {
  try {
    await mongoose.connect(DB);
    console.log('DB connection successful!');
  } catch (err) {
    console.error('DB connection failed! Retrying in 5 seconds...', err.message);
    setTimeout(connectDB, 5000);
  }
};

connectDB();

const socketManager = require('./utils/socketManager');

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`App running on port ${PORT} across all interfaces...`);
});

socketManager.init(server);

process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

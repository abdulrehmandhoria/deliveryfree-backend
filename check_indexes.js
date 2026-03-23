const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const checkIndexes = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('DB connection successful!');

    const collections = await mongoose.connection.db.listCollections().toArray();
    for (const col of collections) {
      const indexes = await mongoose.connection.db.collection(col.name).indexes();
      console.log(`Indexes for ${col.name}:`, JSON.stringify(indexes, null, 2));
    }

    process.exit();
  } catch (err) {
    console.error('Check failed:', err);
    process.exit(1);
  }
};

checkIndexes();

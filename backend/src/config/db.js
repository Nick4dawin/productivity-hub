const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

dotenv.config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB connected`);

    // Check for and drop the old, problematic clerkId index
    const userIndexes = await User.collection.getIndexes();
    if (userIndexes.clerkId_1) {
      console.log('Obsolete clerkId index found. Dropping it now...');
      await User.collection.dropIndex('clerkId_1');
      console.log('Successfully dropped clerkId index.');
    }

  } catch (err) {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1);
  }
};

module.exports = connectDB; 
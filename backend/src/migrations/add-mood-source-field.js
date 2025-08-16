const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

async function migrateMoodSourceField() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB for migration');

    // Get the Mood collection
    const db = mongoose.connection.db;
    const moodCollection = db.collection('moods');

    // Update all existing mood documents to have source: 'manual'
    const result = await moodCollection.updateMany(
      { source: { $exists: false } },
      { $set: { source: 'manual' } }
    );

    console.log(`Migration completed: Updated ${result.modifiedCount} mood entries with source: 'manual'`);
    
    // Verify the migration
    const totalMoods = await moodCollection.countDocuments();
    const moodsWithSource = await moodCollection.countDocuments({ source: { $exists: true } });
    
    console.log(`Verification: ${moodsWithSource}/${totalMoods} mood entries have source field`);

  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  migrateMoodSourceField()
    .then(() => {
      console.log('Migration completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

module.exports = migrateMoodSourceField;

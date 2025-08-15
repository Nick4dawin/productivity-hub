const mongoose = require('mongoose');

/**
 * Migration script to add confidence scoring fields to existing collections
 * Run this script to update existing data with confidence scoring support
 */

const Journal = require('../models/Journal');
const Todo = require('../models/Todo');
const Media = require('../models/Media');
const Mood = require('../models/Mood');
const Habit = require('../models/Habit');

class ConfidenceScoringMigration {
  
  async run() {
    console.log('Starting confidence scoring migration...');
    
    try {
      await this.migrateJournalEntries();
      await this.migrateTodos();
      await this.migrateMedia();
      await this.migrateMoods();
      await this.migrateHabits();
      
      console.log('Migration completed successfully!');
    } catch (error) {
      console.error('Migration failed:', error);
      throw error;
    }
  }
  
  async migrateJournalEntries() {
    console.log('Migrating journal entries...');
    
    const journals = await Journal.find({
      $or: [
        { 'analysis.confidence': { $exists: false } },
        { 'analysis.extracted.mood.confidence': { $exists: false } }
      ]
    });
    
    let updated = 0;
    
    for (const journal of journals) {
      let needsUpdate = false;
      
      // Add overall confidence if missing
      if (!journal.analysis?.confidence) {
        if (!journal.analysis) journal.analysis = {};
        journal.analysis.confidence = 0.7; // Default confidence
        needsUpdate = true;
      }
      
      // Update extracted data structure for confidence scoring
      if (journal.analysis?.extracted) {
        const extracted = journal.analysis.extracted;
        
        // Update mood structure
        if (extracted.mood && typeof extracted.mood === 'string') {
          extracted.mood = {
            value: extracted.mood,
            confidence: 0.7,
            reasoning: 'Migrated from legacy format'
          };
          needsUpdate = true;
        }
        
        // Update todos with confidence
        if (extracted.todos && Array.isArray(extracted.todos)) {
          extracted.todos.forEach(todo => {
            if (!todo.confidence) {
              todo.confidence = 0.7;
              todo.reasoning = 'Migrated from legacy format';
              needsUpdate = true;
            }
          });
        }
        
        // Update media with confidence
        if (extracted.media && Array.isArray(extracted.media)) {
          extracted.media.forEach(media => {
            if (!media.confidence) {
              media.confidence = 0.7;
              media.reasoning = 'Migrated from legacy format';
              needsUpdate = true;
            }
          });
        }
        
        // Update habits with confidence
        if (extracted.habits && Array.isArray(extracted.habits)) {
          extracted.habits.forEach(habit => {
            if (!habit.confidence) {
              habit.confidence = 0.7;
              habit.reasoning = 'Migrated from legacy format';
              needsUpdate = true;
            }
          });
        }
      }
      
      if (needsUpdate) {
        await journal.save();
        updated++;
      }
    }
    
    console.log(`Updated ${updated} journal entries`);
  }
  
  async migrateTodos() {
    console.log('Migrating todos...');
    
    const result = await Todo.updateMany(
      { confidence: { $exists: false } },
      { 
        $set: { 
          confidence: 0.8,
          source: 'manual' // Distinguish from AI-extracted todos
        } 
      }
    );
    
    console.log(`Updated ${result.modifiedCount} todos`);
  }
  
  async migrateMedia() {
    console.log('Migrating media...');
    
    const result = await Media.updateMany(
      { confidence: { $exists: false } },
      { 
        $set: { 
          confidence: 0.8,
          source: 'manual' // Distinguish from AI-extracted media
        } 
      }
    );
    
    console.log(`Updated ${result.modifiedCount} media items`);
  }
  
  async migrateMoods() {
    console.log('Migrating moods...');
    
    const result = await Mood.updateMany(
      { confidence: { $exists: false } },
      { 
        $set: { 
          confidence: 0.9 // Moods are usually manually entered, so high confidence
        } 
      }
    );
    
    console.log(`Updated ${result.modifiedCount} mood entries`);
  }
  
  async migrateHabits() {
    console.log('Migrating habits...');
    
    const result = await Habit.updateMany(
      { confidence: { $exists: false } },
      { 
        $set: { 
          confidence: 0.9 // Habits are usually manually tracked, so high confidence
        } 
      }
    );
    
    console.log(`Updated ${result.modifiedCount} habit entries`);
  }
  
  async addIndexes() {
    console.log('Adding performance indexes...');
    
    try {
      // Add indexes for efficient querying of confidence scores
      await Journal.collection.createIndex({ 'analysis.confidence': 1 });
      await Journal.collection.createIndex({ 'analysis.extracted.mood.confidence': 1 });
      await Todo.collection.createIndex({ confidence: 1, userId: 1 });
      await Media.collection.createIndex({ confidence: 1, user: 1 });
      await Mood.collection.createIndex({ confidence: 1, user: 1 });
      await Habit.collection.createIndex({ confidence: 1, userId: 1 });
      
      console.log('Indexes created successfully');
    } catch (error) {
      console.log('Some indexes may already exist:', error.message);
    }
  }
  
  async validateMigration() {
    console.log('Validating migration...');
    
    const journalCount = await Journal.countDocuments({ 'analysis.confidence': { $exists: true } });
    const todoCount = await Todo.countDocuments({ confidence: { $exists: true } });
    const mediaCount = await Media.countDocuments({ confidence: { $exists: true } });
    const moodCount = await Mood.countDocuments({ confidence: { $exists: true } });
    const habitCount = await Habit.countDocuments({ confidence: { $exists: true } });
    
    console.log('Migration validation results:');
    console.log(`- Journals with confidence: ${journalCount}`);
    console.log(`- Todos with confidence: ${todoCount}`);
    console.log(`- Media with confidence: ${mediaCount}`);
    console.log(`- Moods with confidence: ${moodCount}`);
    console.log(`- Habits with confidence: ${habitCount}`);
  }
}

// Export for use in other scripts
module.exports = ConfidenceScoringMigration;

// Run migration if this file is executed directly
if (require.main === module) {
  const migration = new ConfidenceScoringMigration();
  
  migration.run()
    .then(() => migration.addIndexes())
    .then(() => migration.validateMigration())
    .then(() => {
      console.log('Migration completed successfully!');
      process.exit(0);
    })
    .catch(error => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}
const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const express = require('express');

// Import models
const Journal = require('../../src/models/Journal');
const Todo = require('../../src/models/Todo');
const Media = require('../../src/models/Media');
const Mood = require('../../src/models/Mood');
const Habit = require('../../src/models/Habit');
const UserPreferences = require('../../src/models/UserPreferences');

// Import services and controllers
const journalController = require('../../src/controllers/journal.controller');
const aiService = require('../../src/services/ai.service');

// Mock AI service to avoid external API calls
jest.mock('../../src/services/ai.service');

describe('Journal Workflow Integration Tests', () => {
  let mongoServer;
  let app;
  const testUserId = new mongoose.Types.ObjectId();

  beforeAll(async () => {
    // Setup in-memory MongoDB
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);

    // Setup Express app
    app = express();
    app.use(express.json());
    
    // Mock auth middleware
    app.use((req, res, next) => {
      req.user = { _id: testUserId };
      next();
    });

    // Setup routes
    app.post('/journal', journalController.createEntry);
    app.post('/journal/actions', journalController.saveExtractedItems);
    app.post('/journal/analyze-realtime', journalController.analyzeRealtime);
    app.get('/journal/suggestions', journalController.getSuggestions);
    app.get('/journal/preferences', journalController.getUserPreferences);
    app.put('/journal/preferences', journalController.updateUserPreferences);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    // Clear all collections
    await Journal.deleteMany({});
    await Todo.deleteMany({});
    await Media.deleteMany({});
    await Mood.deleteMany({});
    await Habit.deleteMany({});
    await UserPreferences.deleteMany({});

    // Reset mocks
    jest.clearAllMocks();
  });

  describe('Complete Journal Entry to Extraction Workflow', () => {
    it('should handle complete workflow from journal creation to item extraction', async () => {
      // Mock AI analysis response
      const mockAnalysis = {
        summary: 'User is feeling motivated and has clear goals',
        sentiment: 'Positive',
        keywords: ['motivated', 'exercise', 'book'],
        suggestions: ['Keep up the positive momentum'],
        insights: 'Good balance of physical and mental activities',
        confidence: 0.88,
        extracted: {
          mood: {
            value: 'motivated',
            confidence: 0.9,
            reasoning: 'Explicitly mentioned feeling motivated'
          },
          todos: [{
            title: 'Go for a run',
            time: 'future',
            dueDate: '2024-01-20',
            priority: 'medium',
            confidence: 0.85,
            reasoning: 'Clear action item mentioned'
          }],
          media: [{
            title: 'Atomic Habits',
            type: 'book',
            status: 'reading',
            confidence: 0.8,
            reasoning: 'Book title clearly mentioned'
          }],
          habits: [{
            name: 'Daily reading',
            status: 'done',
            frequency: 'daily',
            confidence: 0.9,
            reasoning: 'Routine activity mentioned'
          }]
        }
      };

      aiService.extractDataWithConfidence.mockResolvedValue(mockAnalysis);

      // Step 1: Create journal entry
      const journalResponse = await request(app)
        .post('/journal')
        .send({
          content: 'I feel motivated today! Planning to go for a run and continue reading Atomic Habits. Already did my daily reading session.',
          title: 'Motivated Monday',
          category: 'Personal',
          mood: 'motivated',
          energy: 'High',
          activities: ['exercise', 'reading']
        });

      expect(journalResponse.status).toBe(201);
      expect(journalResponse.body.analysis.confidence).toBe(0.88);
      
      const journalId = journalResponse.body._id;

      // Step 2: Extract and save items
      const extractionResponse = await request(app)
        .post('/journal/actions')
        .send({
          journalId,
          mood: mockAnalysis.extracted.mood,
          todos: mockAnalysis.extracted.todos,
          media: mockAnalysis.extracted.media,
          habits: mockAnalysis.extracted.habits,
          userPreferences: {
            confidenceThreshold: 0.7
          }
        });

      expect(extractionResponse.status).toBe(200);
      expect(extractionResponse.body.savedItems.mood).toBeDefined();
      expect(extractionResponse.body.savedItems.todos).toHaveLength(1);
      expect(extractionResponse.body.savedItems.media).toHaveLength(1);
      expect(extractionResponse.body.savedItems.habits).toHaveLength(1);

      // Step 3: Verify items were saved to database
      const savedTodos = await Todo.find({ userId: testUserId });
      const savedMedia = await Media.find({ user: testUserId });
      const savedMoods = await Mood.find({ user: testUserId });
      const savedHabits = await Habit.find({ userId: testUserId });

      expect(savedTodos).toHaveLength(1);
      expect(savedTodos[0].title).toBe('Go for a run');
      expect(savedTodos[0].confidence).toBe(0.85);

      expect(savedMedia).toHaveLength(1);
      expect(savedMedia[0].title).toBe('Atomic Habits');
      expect(savedMedia[0].confidence).toBe(0.8);

      expect(savedMoods).toHaveLength(1);
      expect(savedMoods[0].mood).toBe('motivated');
      expect(savedMoods[0].confidence).toBe(0.9);

      expect(savedHabits).toHaveLength(1);
      expect(savedHabits[0].name).toBe('Daily reading');
      expect(savedHabits[0].confidence).toBe(0.9);
    });

    it('should handle partial success when some items fail validation', async () => {
      const mockAnalysis = {
        summary: 'Mixed confidence items',
        confidence: 0.7,
        extracted: {
          mood: {
            value: 'neutral',
            confidence: 0.9 // High confidence - should save
          },
          todos: [
            {
              title: 'High confidence todo',
              time: 'future',
              confidence: 0.85 // Should save
            },
            {
              title: 'Low confidence todo',
              time: 'future',
              confidence: 0.4 // Should reject
            }
          ],
          media: [],
          habits: []
        }
      };

      aiService.extractDataWithConfidence.mockResolvedValue(mockAnalysis);

      // Create journal entry
      const journalResponse = await request(app)
        .post('/journal')
        .send({
          content: 'Test content',
          title: 'Test',
          category: 'Personal'
        });

      const journalId = journalResponse.body._id;

      // Extract items with high confidence threshold
      const extractionResponse = await request(app)
        .post('/journal/actions')
        .send({
          journalId,
          mood: mockAnalysis.extracted.mood,
          todos: mockAnalysis.extracted.todos,
          userPreferences: {
            confidenceThreshold: 0.8
          }
        });

      expect(extractionResponse.status).toBe(200);
      expect(extractionResponse.body.partialSuccess).toBe(true);
      expect(extractionResponse.body.savedItems.mood).toBeDefined();
      expect(extractionResponse.body.savedItems.todos).toHaveLength(1);
      expect(extractionResponse.body.errors).toHaveLength(1);
      expect(extractionResponse.body.errors[0].type).toBe('todos');
    });
  });

  describe('User Preference Learning Integration', () => {
    it('should track user preferences and adjust suggestions', async () => {
      // Step 1: Get initial preferences
      const initialPrefsResponse = await request(app)
        .get('/journal/preferences');

      expect(initialPrefsResponse.status).toBe(200);
      expect(initialPrefsResponse.body.preferences.confidenceThreshold).toBe(0.7);

      // Step 2: Simulate user accepting high-confidence suggestions
      for (let i = 0; i < 5; i++) {
        await journalController.trackUserPreference(testUserId, 'mood', 'accepted', 0.9);
        await journalController.trackUserPreference(testUserId, 'todo', 'accepted', 0.85);
      }

      // Step 3: Check if preferences were learned
      const updatedPrefsResponse = await request(app)
        .get('/journal/preferences');

      expect(updatedPrefsResponse.status).toBe(200);
      const stats = updatedPrefsResponse.body.stats.stats;
      expect(stats.mood.accepted).toBe(5);
      expect(stats.mood.acceptanceRate).toBe(1.0);
      expect(stats.todo.accepted).toBe(5);
      expect(stats.todo.acceptanceRate).toBe(1.0);
    });

    it('should update user preferences manually', async () => {
      const updateResponse = await request(app)
        .put('/journal/preferences')
        .send({
          confidenceThreshold: 0.8,
          suggestionTypes: ['mood', 'reflection'],
          promptStyle: 'analytical',
          autoAdjustThreshold: false
        });

      expect(updateResponse.status).toBe(200);
      expect(updateResponse.body.preferences.confidenceThreshold).toBe(0.8);
      expect(updateResponse.body.preferences.suggestionTypes).toEqual(['mood', 'reflection']);
      expect(updateResponse.body.preferences.promptStyle).toBe('analytical');
    });
  });

  describe('Real-time Analysis Integration', () => {
    it('should provide real-time analysis during typing', async () => {
      const mockRealtimeAnalysis = {
        mood: {
          detected: 'anxious',
          confidence: 0.8,
          suggestion: 'Consider taking a break'
        },
        quickSuggestions: ['What might be causing this anxiety?'],
        actionItems: ['Schedule doctor appointment'],
        analyzing: false
      };

      aiService.analyzeJournalContentRealtime.mockResolvedValue(mockRealtimeAnalysis);

      const response = await request(app)
        .post('/journal/analyze-realtime')
        .send({
          content: 'I feel anxious about my upcoming doctor appointment',
          userId: testUserId.toString()
        });

      expect(response.status).toBe(200);
      expect(response.body.mood.detected).toBe('anxious');
      expect(response.body.mood.confidence).toBe(0.8);
      expect(response.body.quickSuggestions).toContain('What might be causing this anxiety?');
      expect(response.body.actionItems).toContain('Schedule doctor appointment');
    });
  });

  describe('Contextual Suggestions Integration', () => {
    it('should generate personalized suggestions based on user data', async () => {
      // Setup user data
      await new Mood({
        user: testUserId,
        mood: 'stressed',
        date: new Date(),
        confidence: 0.9
      }).save();

      await new Todo({
        userId: testUserId,
        title: 'Important presentation',
        dueDate: new Date(Date.now() + 86400000), // Tomorrow
        priority: 'high',
        completed: false,
        confidence: 0.9
      }).save();

      const mockSuggestions = {
        suggestions: [{
          prompt: 'How are you preparing for your important presentation tomorrow?',
          type: 'todo',
          relevance: 0.9,
          reasoning: 'Based on your upcoming high-priority task and recent stress'
        }],
        fallbackPrompts: ['What\'s on your mind today?']
      };

      aiService.generateContextualSuggestions.mockResolvedValue(mockSuggestions);

      const response = await request(app)
        .get('/journal/suggestions');

      expect(response.status).toBe(200);
      expect(response.body.suggestions).toHaveLength(1);
      expect(response.body.suggestions[0].type).toBe('todo');
      expect(response.body.suggestions[0].relevance).toBe(0.9);
      expect(response.body.userPreferences).toBeDefined();
    });
  });

  describe('Error Handling and Graceful Degradation', () => {
    it('should handle AI service failures gracefully', async () => {
      aiService.extractDataWithConfidence.mockRejectedValue(new Error('AI Service Unavailable'));

      const response = await request(app)
        .post('/journal')
        .send({
          content: 'Test content',
          title: 'Test',
          category: 'Personal'
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Error creating journal entry');
    });

    it('should provide fallback suggestions when context service fails', async () => {
      // Mock context service failure
      const contextAggregationService = require('../../src/services/context-aggregation.service');
      jest.doMock('../../src/services/context-aggregation.service', () => ({
        getUserContext: jest.fn().mockRejectedValue(new Error('Context Service Error'))
      }));

      const response = await request(app)
        .get('/journal/suggestions');

      expect(response.status).toBe(500);
      expect(response.body.fallbackPrompts).toContain('What\'s on your mind today?');
      expect(response.body.error).toBe('Suggestions temporarily unavailable');
    });
  });
});
const request = require('supertest');
const express = require('express');
const journalController = require('../src/controllers/journal.controller');

// Mock dependencies
jest.mock('../src/models/Journal');
jest.mock('../src/models/Todo');
jest.mock('../src/models/Media');
jest.mock('../src/models/Mood');
jest.mock('../src/models/Habit');
jest.mock('../src/services/ai.service');
jest.mock('../src/services/context-aggregation.service');
jest.mock('../src/services/user-preferences.service');

const Journal = require('../src/models/Journal');
const Todo = require('../src/models/Todo');
const aiService = require('../src/services/ai.service');
const contextAggregationService = require('../src/services/context-aggregation.service');
const userPreferencesService = require('../src/services/user-preferences.service');

// Setup Express app for testing
const app = express();
app.use(express.json());

// Mock auth middleware
app.use((req, res, next) => {
  req.user = { _id: 'user123' };
  next();
});

// Setup routes
app.post('/journal', journalController.createEntry);
app.post('/journal/actions', journalController.saveExtractedItems);
app.post('/journal/analyze-realtime', journalController.analyzeRealtime);
app.get('/journal/suggestions', journalController.getSuggestions);
app.get('/journal/preferences', journalController.getUserPreferences);

describe('Journal Controller', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /journal', () => {
    it('should create journal entry with AI analysis', async () => {
      const mockAnalysis = {
        summary: 'Test analysis',
        confidence: 0.85,
        extracted: {
          mood: { value: 'happy', confidence: 0.9 },
          todos: [],
          media: [],
          habits: []
        }
      };

      const mockJournal = {
        _id: 'journal123',
        content: 'Test content',
        analysis: mockAnalysis,
        save: jest.fn().mockResolvedValue(true)
      };

      aiService.extractDataWithConfidence.mockResolvedValue(mockAnalysis);
      contextAggregationService.getLightweightContext.mockResolvedValue({});
      Journal.mockImplementation(() => mockJournal);

      const response = await request(app)
        .post('/journal')
        .send({
          content: 'Test content',
          title: 'Test Entry',
          category: 'Personal'
        });

      expect(response.status).toBe(201);
      expect(response.body.analysis.confidence).toBe(0.85);
      expect(aiService.extractDataWithConfidence).toHaveBeenCalled();
    });

    it('should handle missing required fields', async () => {
      const response = await request(app)
        .post('/journal')
        .send({
          content: 'Test content'
          // Missing title and category
        });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /journal/actions', () => {
    it('should save extracted items with confidence validation', async () => {
      const mockJournal = {
        _id: 'journal123',
        user: 'user123',
        date: new Date(),
        energy: 'Medium',
        activities: []
      };

      const mockTodo = {
        save: jest.fn().mockResolvedValue({ _id: 'todo123' })
      };

      Journal.findOne.mockResolvedValue(mockJournal);
      Todo.mockImplementation(() => mockTodo);
      journalController.trackUserPreference = jest.fn().mockResolvedValue(true);

      const response = await request(app)
        .post('/journal/actions')
        .send({
          journalId: 'journal123',
          todos: [{
            title: 'Test todo',
            time: 'future',
            confidence: 0.8
          }],
          userPreferences: {
            confidenceThreshold: 0.7
          }
        });

      expect(response.status).toBe(200);
      expect(response.body.savedItems.todos).toHaveLength(1);
      expect(mockTodo.save).toHaveBeenCalled();
    });

    it('should reject items below confidence threshold', async () => {
      const mockJournal = {
        _id: 'journal123',
        user: 'user123',
        date: new Date()
      };

      Journal.findOne.mockResolvedValue(mockJournal);

      const response = await request(app)
        .post('/journal/actions')
        .send({
          journalId: 'journal123',
          todos: [{
            title: 'Low confidence todo',
            time: 'future',
            confidence: 0.5
          }],
          userPreferences: {
            confidenceThreshold: 0.7
          }
        });

      expect(response.status).toBe(200);
      expect(response.body.errors).toHaveLength(1);
      expect(response.body.errors[0].type).toBe('todos');
    });
  });

  describe('POST /journal/analyze-realtime', () => {
    it('should perform real-time analysis', async () => {
      const mockAnalysis = {
        mood: { detected: 'happy', confidence: 0.8 },
        quickSuggestions: ['Keep writing'],
        analyzing: false
      };

      aiService.analyzeJournalContentRealtime.mockResolvedValue(mockAnalysis);

      const response = await request(app)
        .post('/journal/analyze-realtime')
        .send({
          content: 'I feel happy today',
          userId: 'user123'
        });

      expect(response.status).toBe(200);
      expect(response.body.mood.detected).toBe('happy');
      expect(response.body.quickSuggestions).toContain('Keep writing');
    });

    it('should handle short content gracefully', async () => {
      const response = await request(app)
        .post('/journal/analyze-realtime')
        .send({
          content: 'Hi',
          userId: 'user123'
        });

      expect(response.status).toBe(200);
      expect(response.body.analyzing).toBe(false);
    });
  });

  describe('GET /journal/suggestions', () => {
    it('should return personalized suggestions', async () => {
      const mockContext = {
        recentMoods: [{ mood: 'happy' }],
        upcomingTodos: []
      };

      const mockSuggestions = {
        suggestions: [{
          prompt: 'How are you feeling today?',
          type: 'mood',
          relevance: 0.9
        }],
        fallbackPrompts: ['What\'s on your mind?']
      };

      const mockPreferences = {
        getSuggestionFilters: () => ({
          types: ['mood', 'reflection'],
          confidenceThreshold: 0.7
        }),
        suggestionTypes: ['mood', 'reflection'],
        confidenceThreshold: 0.7,
        promptStyle: 'reflective'
      };

      contextAggregationService.getUserContext.mockResolvedValue(mockContext);
      userPreferencesService.getUserPreferences.mockResolvedValue(mockPreferences);
      aiService.generateContextualSuggestions.mockResolvedValue(mockSuggestions);
      userPreferencesService.prioritizeSuggestions.mockResolvedValue(mockSuggestions.suggestions);

      const response = await request(app)
        .get('/journal/suggestions');

      expect(response.status).toBe(200);
      expect(response.body.suggestions).toHaveLength(1);
      expect(response.body.userPreferences.confidenceThreshold).toBe(0.7);
    });
  });

  describe('GET /journal/preferences', () => {
    it('should return user preferences and stats', async () => {
      const mockPreferences = {
        suggestionTypes: ['mood', 'reflection'],
        confidenceThreshold: 0.7,
        promptStyle: 'reflective',
        topicsOfInterest: ['wellness'],
        autoAdjustThreshold: true,
        minConfidenceThreshold: 0.3,
        maxConfidenceThreshold: 0.95
      };

      const mockStats = {
        stats: {
          mood: { accepted: 5, rejected: 1, acceptanceRate: 0.83 }
        },
        currentThreshold: 0.7,
        autoAdjust: true
      };

      userPreferencesService.getUserPreferences.mockResolvedValue(mockPreferences);
      userPreferencesService.getAcceptanceStats.mockResolvedValue(mockStats);

      const response = await request(app)
        .get('/journal/preferences');

      expect(response.status).toBe(200);
      expect(response.body.preferences.confidenceThreshold).toBe(0.7);
      expect(response.body.stats.stats.mood.acceptanceRate).toBe(0.83);
    });
  });
});

describe('Journal Controller Error Handling', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should handle AI service failures gracefully', async () => {
    aiService.extractDataWithConfidence.mockRejectedValue(new Error('AI Service Error'));
    contextAggregationService.getLightweightContext.mockResolvedValue({});

    const response = await request(app)
      .post('/journal')
      .send({
        content: 'Test content',
        title: 'Test Entry',
        category: 'Personal'
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Error creating journal entry');
  });

  it('should handle database failures in saveExtractedItems', async () => {
    Journal.findOne.mockRejectedValue(new Error('Database Error'));

    const response = await request(app)
      .post('/journal/actions')
      .send({
        journalId: 'journal123',
        todos: [{ title: 'Test', confidence: 0.8 }]
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Error saving extracted items');
  });

  it('should provide fallback suggestions when AI fails', async () => {
    contextAggregationService.getUserContext.mockRejectedValue(new Error('Context Error'));

    const response = await request(app)
      .get('/journal/suggestions');

    expect(response.status).toBe(500);
    expect(response.body.fallbackPrompts).toContain('What\'s on your mind today?');
    expect(response.body.error).toBe('Suggestions temporarily unavailable');
  });
});
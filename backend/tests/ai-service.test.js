const { 
  analyzeJournalEntry, 
  analyzeJournalContentRealtime, 
  generateContextualSuggestions,
  extractDataWithConfidence 
} = require('../src/services/ai.service');

// Mock Groq SDK
jest.mock('groq-sdk', () => {
  return jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: jest.fn()
      }
    }
  }));
});

describe('AI Service', () => {
  
  describe('analyzeJournalEntry', () => {
    it('should analyze journal entry with confidence scoring', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: JSON.stringify({
              summary: 'Test summary',
              sentiment: 'Positive',
              keywords: ['test', 'journal'],
              suggestions: ['Keep writing'],
              insights: 'Good progress',
              confidence: 0.85,
              extracted: {
                mood: { value: 'happy', confidence: 0.9 },
                todos: [{ title: 'Test todo', time: 'future', confidence: 0.8 }],
                media: [],
                habits: []
              }
            })
          }
        }]
      };

      const groq = require('groq-sdk');
      const mockGroq = new groq();
      mockGroq.chat.completions.create.mockResolvedValue(mockResponse);

      const result = await analyzeJournalEntry('I feel happy today and need to test this feature');
      
      expect(result).toHaveProperty('confidence');
      expect(result.confidence).toBe(0.85);
      expect(result.extracted.mood).toHaveProperty('confidence');
      expect(result.extracted.mood.confidence).toBe(0.9);
    });

    it('should handle API failures gracefully', async () => {
      const groq = require('groq-sdk');
      const mockGroq = new groq();
      mockGroq.chat.completions.create.mockRejectedValue(new Error('API Error'));

      const result = await analyzeJournalEntry('Test content');
      
      expect(result).toHaveProperty('confidence', 0.0);
      expect(result.summary).toBe('Could not analyze entry.');
      expect(result.extracted.mood).toHaveProperty('confidence', 0.0);
    });
  });

  describe('analyzeJournalContentRealtime', () => {
    it('should perform real-time analysis with debouncing', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: JSON.stringify({
              mood: { detected: 'anxious', confidence: 0.8, suggestion: 'Take a deep breath' },
              quickSuggestions: ['Explore this feeling further'],
              actionItems: ['Call doctor'],
              analyzing: true
            })
          }
        }]
      };

      const groq = require('groq-sdk');
      const mockGroq = new groq();
      mockGroq.chat.completions.create.mockResolvedValue(mockResponse);

      const result = await analyzeJournalContentRealtime('I feel anxious about my appointment', 'user123');
      
      expect(result.mood.detected).toBe('anxious');
      expect(result.mood.confidence).toBe(0.8);
      expect(result.quickSuggestions).toContain('Explore this feeling further');
    });

    it('should return empty analysis for short content', async () => {
      const result = await analyzeJournalContentRealtime('Hi', 'user123');
      
      expect(result.analyzing).toBe(false);
      expect(result.suggestions).toEqual([]);
    });
  });

  describe('generateContextualSuggestions', () => {
    it('should generate personalized suggestions based on context', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: JSON.stringify({
              suggestions: [
                {
                  prompt: 'How are you feeling about your upcoming presentation?',
                  type: 'mood',
                  relevance: 0.9,
                  reasoning: 'Based on your recent anxiety patterns'
                }
              ],
              fallbackPrompts: ['What\'s on your mind today?']
            })
          }
        }]
      };

      const groq = require('groq-sdk');
      const mockGroq = new groq();
      mockGroq.chat.completions.create.mockResolvedValue(mockResponse);

      const userContext = {
        recentMoods: [{ mood: 'anxious', confidence: 0.8 }],
        upcomingTodos: [{ title: 'Presentation', priority: 'high' }]
      };

      const result = await generateContextualSuggestions(userContext);
      
      expect(result.suggestions).toHaveLength(1);
      expect(result.suggestions[0].type).toBe('mood');
      expect(result.suggestions[0].relevance).toBe(0.9);
      expect(result.fallbackPrompts).toContain('What\'s on your mind today?');
    });
  });

  describe('extractDataWithConfidence', () => {
    it('should extract data with enhanced confidence scoring', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: JSON.stringify({
              summary: 'Enhanced extraction',
              sentiment: 'Positive',
              keywords: ['test'],
              suggestions: ['Continue'],
              insights: 'Good analysis',
              confidence: 0.88,
              extracted: {
                mood: { value: 'motivated', confidence: 0.85, reasoning: 'Explicit mention' },
                todos: [{
                  title: 'Finish project',
                  time: 'future',
                  confidence: 0.9,
                  reasoning: 'Clear action item'
                }],
                media: [],
                habits: []
              }
            })
          }
        }]
      };

      const groq = require('groq-sdk');
      const mockGroq = new groq();
      mockGroq.chat.completions.create.mockResolvedValue(mockResponse);

      const context = {
        previousMoods: [{ mood: 'neutral' }],
        userPreferences: { confidenceThreshold: 0.7 }
      };

      const result = await extractDataWithConfidence('I feel motivated to finish my project', context);
      
      expect(result.confidence).toBe(0.88);
      expect(result.extracted.mood.reasoning).toBe('Explicit mention');
      expect(result.extracted.todos[0].reasoning).toBe('Clear action item');
    });
  });
});

describe('AI Service Integration', () => {
  it('should maintain consistency across different analysis methods', async () => {
    const content = 'I feel excited about reading a new book and need to exercise daily';
    
    // Mock consistent responses
    const mockResponse = {
      choices: [{
        message: {
          content: JSON.stringify({
            summary: 'Positive outlook with goals',
            sentiment: 'Positive',
            keywords: ['excited', 'book', 'exercise'],
            suggestions: ['Set reading schedule'],
            insights: 'Good balance of interests',
            confidence: 0.85,
            extracted: {
              mood: { value: 'excited', confidence: 0.9 },
              todos: [{ title: 'Exercise daily', time: 'future', confidence: 0.8 }],
              media: [{ title: 'New book', type: 'book', status: 'planned', confidence: 0.85 }],
              habits: [{ name: 'Daily exercise', status: 'planned', confidence: 0.8 }]
            }
          })
        }
      }]
    };

    const groq = require('groq-sdk');
    const mockGroq = new groq();
    mockGroq.chat.completions.create.mockResolvedValue(mockResponse);

    const fullAnalysis = await analyzeJournalEntry(content);
    const enhancedAnalysis = await extractDataWithConfidence(content);
    
    // Both should detect similar mood
    expect(fullAnalysis.extracted.mood.value).toBe('excited');
    expect(enhancedAnalysis.extracted.mood.value).toBe('excited');
    
    // Confidence scores should be consistent
    expect(fullAnalysis.confidence).toBeGreaterThan(0.8);
    expect(enhancedAnalysis.confidence).toBeGreaterThan(0.8);
  });
});
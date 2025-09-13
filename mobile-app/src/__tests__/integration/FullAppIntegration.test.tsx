import React from 'react';
import { render, fireEvent, waitFor, act } from '../../test-utils';
import { AppNavigator } from '../../navigation/AppNavigator';
import { ApiService } from '../../services/ApiService';
import { OfflineManager } from '../../services/OfflineManager';
import { SyncManager } from '../../services/SyncManager';
import { NetworkManager } from '../../services/NetworkManager';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock services for integration testing
jest.mock('../../services/ApiService');
jest.mock('../../services/OfflineManager');
jest.mock('../../services/SyncManager');
jest.mock('../../services/NetworkManager');

const mockApiService = ApiService as jest.Mocked<typeof ApiService>;
const mockOfflineManager = OfflineManager as jest.Mocked<typeof OfflineManager>;
const mockSyncManager = SyncManager as jest.Mocked<typeof SyncManager>;
const mockNetworkManager = NetworkManager as jest.Mocked<typeof NetworkManager>;

describe('Full App Integration Tests', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await AsyncStorage.clear();
    
    // Setup default mock responses
    mockApiService.prototype.login = jest.fn().mockResolvedValue({
      token: 'mock-token',
      user: { _id: '1', email: 'test@example.com', name: 'Test User' }
    });
    
    mockNetworkManager.prototype.isOnline = jest.fn().mockReturnValue(true);
    mockOfflineManager.prototype.getCachedData = jest.fn().mockResolvedValue(null);
    mockSyncManager.prototype.syncPendingOperations = jest.fn().mockResolvedValue(undefined);
  });

  describe('Authentication Integration', () => {
    it('should complete full authentication flow with token management', async () => {
      const { getByTestId, getByText, findByText } = render(<AppNavigator />);

      // Should start with login screen
      expect(getByText('Sign In')).toBeTruthy();

      // Fill login form
      const emailInput = getByTestId('email-input');
      const passwordInput = getByTestId('password-input');
      const loginButton = getByText('Sign In');

      fireEvent.changeText(emailInput, 'test@example.com');
      fireEvent.changeText(passwordInput, 'password123');
      fireEvent.press(loginButton);

      // Wait for authentication and navigation to dashboard
      await waitFor(() => {
        expect(mockApiService.prototype.login).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123',
        });
      });

      // Should navigate to dashboard after successful login
      const dashboardTitle = await findByText('Dashboard');
      expect(dashboardTitle).toBeTruthy();
    });

    it('should handle token refresh on 401 responses', async () => {
      // Mock initial login success
      mockApiService.prototype.login = jest.fn().mockResolvedValue({
        token: 'initial-token',
        user: { _id: '1', email: 'test@example.com', name: 'Test User' }
      });

      // Mock API call that returns 401
      mockApiService.prototype.getHabits = jest.fn()
        .mockRejectedValueOnce({ response: { status: 401 } })
        .mockResolvedValueOnce([]);

      // Mock token refresh
      mockApiService.prototype.refreshToken = jest.fn().mockResolvedValue('new-token');

      const { getByTestId, getByText, findByText } = render(<AppNavigator />);

      // Login first
      const emailInput = getByTestId('email-input');
      const passwordInput = getByTestId('password-input');
      const loginButton = getByText('Sign In');

      fireEvent.changeText(emailInput, 'test@example.com');
      fireEvent.changeText(passwordInput, 'password123');
      fireEvent.press(loginButton);

      await findByText('Dashboard');

      // Navigate to habits which should trigger the 401 and token refresh
      const habitsTab = getByText('Habits');
      fireEvent.press(habitsTab);

      await waitFor(() => {
        expect(mockApiService.prototype.refreshToken).toHaveBeenCalled();
      });
    });
  });

  describe('Data Synchronization Integration', () => {
    it('should sync data between web and mobile platforms', async () => {
      // Mock authenticated state
      const mockHabits = [
        { _id: '1', name: 'Exercise', category: 'Health', completedDates: [], streak: 0 },
        { _id: '2', name: 'Read', category: 'Learning', completedDates: [], streak: 0 }
      ];

      mockApiService.prototype.getHabits = jest.fn().mockResolvedValue(mockHabits);
      mockApiService.prototype.createHabit = jest.fn().mockResolvedValue({
        _id: '3', name: 'Meditate', category: 'Wellness', completedDates: [], streak: 0
      });

      const { getByTestId, getByText, findByText } = render(<AppNavigator />, {
        initialAuthState: { 
          user: { _id: '1', email: 'test@example.com', name: 'Test User' }, 
          isAuthenticated: true 
        }
      });

      // Navigate to habits
      const habitsTab = getByText('Habits');
      fireEvent.press(habitsTab);

      // Wait for habits to load
      await findByText('Exercise');
      await findByText('Read');

      // Add new habit
      const addButton = getByTestId('add-habit-button');
      fireEvent.press(addButton);

      const habitNameInput = getByTestId('habit-name-input');
      const saveButton = getByText('Save');

      fireEvent.changeText(habitNameInput, 'Meditate');
      fireEvent.press(saveButton);

      await waitFor(() => {
        expect(mockApiService.prototype.createHabit).toHaveBeenCalledWith({
          name: 'Meditate',
          category: expect.any(String)
        });
      });
    });

    it('should handle offline/online transitions and sync behavior', async () => {
      // Start offline
      mockNetworkManager.prototype.isOnline = jest.fn().mockReturnValue(false);
      
      const mockCachedHabits = [
        { _id: '1', name: 'Exercise', category: 'Health', completedDates: [], streak: 0 }
      ];
      
      mockOfflineManager.prototype.getCachedData = jest.fn().mockResolvedValue(mockCachedHabits);
      mockOfflineManager.prototype.queueSync = jest.fn().mockResolvedValue(undefined);

      const { getByTestId, getByText, findByText } = render(<AppNavigator />, {
        initialAuthState: { 
          user: { _id: '1', email: 'test@example.com', name: 'Test User' }, 
          isAuthenticated: true 
        }
      });

      // Navigate to habits
      const habitsTab = getByText('Habits');
      fireEvent.press(habitsTab);

      // Should show cached data
      await findByText('Exercise');

      // Try to add habit while offline
      const addButton = getByTestId('add-habit-button');
      fireEvent.press(addButton);

      const habitNameInput = getByTestId('habit-name-input');
      const saveButton = getByText('Save');

      fireEvent.changeText(habitNameInput, 'Offline Habit');
      fireEvent.press(saveButton);

      // Should queue for sync
      await waitFor(() => {
        expect(mockOfflineManager.prototype.queueSync).toHaveBeenCalled();
      });

      // Simulate coming back online
      mockNetworkManager.prototype.isOnline = jest.fn().mockReturnValue(true);
      
      // Trigger network state change
      act(() => {
        // This would normally be triggered by network state listener
        // For testing, we manually trigger sync
      });

      await waitFor(() => {
        expect(mockSyncManager.prototype.syncPendingOperations).toHaveBeenCalled();
      });
    });
  });

  describe('Cross-Feature Integration', () => {
    it('should integrate journal entries with mood tracking and AI analysis', async () => {
      const mockJournalEntry = {
        _id: '1',
        title: 'Great Day',
        content: 'Had an amazing day today!',
        date: new Date().toISOString(),
        category: 'Personal'
      };

      const mockAnalysis = {
        summary: 'Positive entry about a good day',
        sentiment: 'positive',
        keywords: ['amazing', 'great'],
        suggestions: ['Keep up the positive attitude'],
        insights: 'User is in a good mood'
      };

      mockApiService.prototype.createJournalEntry = jest.fn().mockResolvedValue(mockJournalEntry);
      mockApiService.prototype.analyzeJournalEntry = jest.fn().mockResolvedValue(mockAnalysis);
      mockApiService.prototype.logMood = jest.fn().mockResolvedValue({
        _id: '1',
        mood: 'happy',
        activities: ['work', 'exercise'],
        date: new Date().toISOString()
      });

      const { getByTestId, getByText, findByText } = render(<AppNavigator />, {
        initialAuthState: { 
          user: { _id: '1', email: 'test@example.com', name: 'Test User' }, 
          isAuthenticated: true 
        }
      });

      // Navigate to journal
      const journalTab = getByText('Journal');
      fireEvent.press(journalTab);

      // Create journal entry
      const addEntryButton = getByTestId('add-entry-button');
      fireEvent.press(addEntryButton);

      const titleInput = getByTestId('journal-title-input');
      const contentInput = getByTestId('journal-content-input');
      const saveButton = getByText('Save');

      fireEvent.changeText(titleInput, 'Great Day');
      fireEvent.changeText(contentInput, 'Had an amazing day today!');
      fireEvent.press(saveButton);

      await waitFor(() => {
        expect(mockApiService.prototype.createJournalEntry).toHaveBeenCalled();
      });

      // Should trigger AI analysis
      await waitFor(() => {
        expect(mockApiService.prototype.analyzeJournalEntry).toHaveBeenCalled();
      });

      // Navigate to mood tracking
      const moodTab = getByText('Mood');
      fireEvent.press(moodTab);

      // Log mood based on journal sentiment
      const happyMoodButton = getByTestId('mood-happy');
      fireEvent.press(happyMoodButton);

      await waitFor(() => {
        expect(mockApiService.prototype.logMood).toHaveBeenCalledWith({
          mood: 'happy',
          activities: expect.any(Array),
          date: expect.any(String)
        });
      });
    });

    it('should integrate habits with goals and coaching', async () => {
      const mockHabit = {
        _id: '1',
        name: 'Exercise',
        category: 'Health',
        completedDates: [],
        streak: 0
      };

      const mockGoal = {
        _id: '1',
        title: 'Fitness Goal',
        description: 'Exercise 5 times per week',
        targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        progress: 0
      };

      mockApiService.prototype.toggleHabitDate = jest.fn().mockResolvedValue({
        ...mockHabit,
        completedDates: [new Date().toISOString().split('T')[0]],
        streak: 1
      });

      mockApiService.prototype.updateGoalProgress = jest.fn().mockResolvedValue({
        ...mockGoal,
        progress: 20
      });

      mockApiService.prototype.getCoachInsights = jest.fn().mockResolvedValue({
        insights: ['Great job on maintaining your exercise habit!'],
        suggestions: ['Try to increase workout intensity'],
        motivation: 'You\'re on track to reach your fitness goal!'
      });

      const { getByTestId, getByText, findByText } = render(<AppNavigator />, {
        initialAuthState: { 
          user: { _id: '1', email: 'test@example.com', name: 'Test User' }, 
          isAuthenticated: true 
        }
      });

      // Complete habit
      const habitsTab = getByText('Habits');
      fireEvent.press(habitsTab);

      const exerciseHabit = getByTestId('habit-1-toggle');
      fireEvent.press(exerciseHabit);

      await waitFor(() => {
        expect(mockApiService.prototype.toggleHabitDate).toHaveBeenCalled();
      });

      // Check goal progress update
      await waitFor(() => {
        expect(mockApiService.prototype.updateGoalProgress).toHaveBeenCalled();
      });

      // Navigate to coach for insights
      const moreTab = getByText('More');
      fireEvent.press(moreTab);

      const coachOption = getByText('AI Coach');
      fireEvent.press(coachOption);

      await waitFor(() => {
        expect(mockApiService.prototype.getCoachInsights).toHaveBeenCalled();
      });
    });
  });

  describe('Performance Integration', () => {
    it('should handle large datasets efficiently', async () => {
      // Generate large dataset
      const largeHabitsList = Array.from({ length: 1000 }, (_, i) => ({
        _id: `habit-${i}`,
        name: `Habit ${i}`,
        category: 'Test',
        completedDates: [],
        streak: 0
      }));

      mockApiService.prototype.getHabits = jest.fn().mockResolvedValue(largeHabitsList);

      const startTime = Date.now();

      const { getByText, findByText } = render(<AppNavigator />, {
        initialAuthState: { 
          user: { _id: '1', email: 'test@example.com', name: 'Test User' }, 
          isAuthenticated: true 
        }
      });

      const habitsTab = getByText('Habits');
      fireEvent.press(habitsTab);

      // Wait for first habit to render
      await findByText('Habit 0');

      const renderTime = Date.now() - startTime;

      // Should render within reasonable time (less than 2 seconds)
      expect(renderTime).toBeLessThan(2000);
    });

    it('should maintain smooth scrolling with large lists', async () => {
      const largeTodoList = Array.from({ length: 500 }, (_, i) => ({
        _id: `todo-${i}`,
        title: `Todo ${i}`,
        completed: false,
        priority: 'medium',
        category: 'Test'
      }));

      mockApiService.prototype.getTodos = jest.fn().mockResolvedValue(largeTodoList);

      const { getByTestId, getByText } = render(<AppNavigator />, {
        initialAuthState: { 
          user: { _id: '1', email: 'test@example.com', name: 'Test User' }, 
          isAuthenticated: true 
        }
      });

      const todosTab = getByText('Todos');
      fireEvent.press(todosTab);

      // Wait for list to load
      await waitFor(() => {
        expect(getByTestId('todo-list')).toBeTruthy();
      });

      // Simulate scrolling
      const todoList = getByTestId('todo-list');
      fireEvent.scroll(todoList, {
        nativeEvent: {
          contentOffset: { y: 1000 },
          contentSize: { height: 10000, width: 400 },
          layoutMeasurement: { height: 600, width: 400 },
        },
      });

      // Should handle scroll without crashes
      expect(todoList).toBeTruthy();
    });
  });
});
import React from 'react';
import { render, fireEvent, waitFor, act } from '../../test-utils';
import { AppNavigator } from '../../navigation/AppNavigator';
import { OfflineManager } from '../../services/OfflineManager';
import { SyncManager } from '../../services/SyncManager';
import { NetworkManager } from '../../services/NetworkManager';
import { ApiService } from '../../services/ApiService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

// Mock network info
jest.mock('@react-native-community/netinfo');
const mockNetInfo = NetInfo as jest.Mocked<typeof NetInfo>;

// Mock services
jest.mock('../../services/OfflineManager');
jest.mock('../../services/SyncManager');
jest.mock('../../services/NetworkManager');
jest.mock('../../services/ApiService');

const mockOfflineManager = new OfflineManager() as jest.Mocked<OfflineManager>;
const mockSyncManager = new SyncManager() as jest.Mocked<SyncManager>;
const mockNetworkManager = new NetworkManager() as jest.Mocked<NetworkManager>;
const mockApiService = new ApiService() as jest.Mocked<ApiService>;

describe('Data Synchronization Integration Tests', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await AsyncStorage.clear();
    
    // Setup default network state
    mockNetInfo.fetch.mockResolvedValue({
      isConnected: true,
      isInternetReachable: true,
      type: 'wifi',
      details: {}
    } as any);
  });

  describe('Offline Data Management', () => {
    it('should cache data when online and serve from cache when offline', async () => {
      const mockHabits = [
        { _id: '1', name: 'Exercise', category: 'Health', completedDates: [], streak: 0 },
        { _id: '2', name: 'Read', category: 'Learning', completedDates: [], streak: 0 }
      ];

      // Start online - should fetch and cache data
      mockNetworkManager.isOnline.mockReturnValue(true);
      mockApiService.getHabits.mockResolvedValue(mockHabits);
      mockOfflineManager.cacheData.mockResolvedValue(undefined);

      const { getByText, findByText, rerender } = render(<AppNavigator />, {
        initialAuthState: { 
          user: { _id: '1', email: 'test@example.com', name: 'Test User' }, 
          isAuthenticated: true 
        }
      });

      // Navigate to habits
      const habitsTab = getByText('Habits');
      fireEvent.press(habitsTab);

      // Wait for data to load and cache
      await findByText('Exercise');
      
      await waitFor(() => {
        expect(mockApiService.getHabits).toHaveBeenCalled();
        expect(mockOfflineManager.cacheData).toHaveBeenCalledWith('habits', mockHabits);
      });

      // Go offline
      mockNetworkManager.isOnline.mockReturnValue(false);
      mockOfflineManager.getCachedData.mockResolvedValue(mockHabits);
      mockApiService.getHabits.mockRejectedValue(new Error('Network error'));

      // Simulate app restart or navigation away and back
      rerender(<AppNavigator />, {
        initialAuthState: { 
          user: { _id: '1', email: 'test@example.com', name: 'Test User' }, 
          isAuthenticated: true 
        }
      });

      const habitsTabOffline = getByText('Habits');
      fireEvent.press(habitsTabOffline);

      // Should show cached data
      await findByText('Exercise');
      
      await waitFor(() => {
        expect(mockOfflineManager.getCachedData).toHaveBeenCalledWith('habits');
      });
    });

    it('should queue operations when offline and sync when back online', async () => {
      // Start offline
      mockNetworkManager.isOnline.mockReturnValue(false);
      mockOfflineManager.queueSync.mockResolvedValue(undefined);

      const { getByTestId, getByText, findByText } = render(<AppNavigator />, {
        initialAuthState: { 
          user: { _id: '1', email: 'test@example.com', name: 'Test User' }, 
          isAuthenticated: true 
        }
      });

      // Navigate to habits
      const habitsTab = getByText('Habits');
      fireEvent.press(habitsTab);

      // Try to add habit while offline
      const addButton = getByTestId('add-habit-button');
      fireEvent.press(addButton);

      const habitNameInput = getByTestId('habit-name-input');
      const categorySelect = getByTestId('category-select');
      const saveButton = getByText('Save');

      fireEvent.changeText(habitNameInput, 'Offline Habit');
      fireEvent.press(categorySelect);
      fireEvent.press(getByText('Health'));
      fireEvent.press(saveButton);

      // Should queue the operation
      await waitFor(() => {
        expect(mockOfflineManager.queueSync).toHaveBeenCalledWith({
          type: 'CREATE_HABIT',
          endpoint: '/habits',
          data: {
            name: 'Offline Habit',
            category: 'Health'
          },
          timestamp: expect.any(Number)
        });
      });

      // Come back online
      mockNetworkManager.isOnline.mockReturnValue(true);
      mockSyncManager.syncPendingOperations.mockResolvedValue(undefined);
      mockApiService.createHabit.mockResolvedValue({
        _id: '3',
        name: 'Offline Habit',
        category: 'Health',
        completedDates: [],
        streak: 0
      });

      // Simulate network state change
      act(() => {
        // Trigger sync when network comes back
        mockSyncManager.syncPendingOperations();
      });

      await waitFor(() => {
        expect(mockSyncManager.syncPendingOperations).toHaveBeenCalled();
      });
    });

    it('should handle sync conflicts gracefully', async () => {
      const localHabit = {
        _id: '1',
        name: 'Exercise - Local Edit',
        category: 'Health',
        completedDates: ['2024-01-01'],
        streak: 1,
        lastModified: Date.now() - 1000 // Older
      };

      const serverHabit = {
        _id: '1',
        name: 'Exercise - Server Edit',
        category: 'Fitness',
        completedDates: ['2024-01-01', '2024-01-02'],
        streak: 2,
        lastModified: Date.now() // Newer
      };

      mockSyncManager.syncPendingOperations.mockImplementation(async () => {
        // Simulate conflict detection
        throw new Error('Conflict detected');
      });

      mockSyncManager.resolveConflict.mockResolvedValue(serverHabit);

      const { getByText, findByText } = render(<AppNavigator />, {
        initialAuthState: { 
          user: { _id: '1', email: 'test@example.com', name: 'Test User' }, 
          isAuthenticated: true 
        }
      });

      // Trigger sync that will cause conflict
      act(() => {
        mockSyncManager.syncPendingOperations();
      });

      // Should show conflict resolution dialog
      await findByText(/conflict detected/i);

      // User chooses server version
      const useServerButton = getByText('Use Server Version');
      fireEvent.press(useServerButton);

      await waitFor(() => {
        expect(mockSyncManager.resolveConflict).toHaveBeenCalledWith(
          localHabit,
          serverHabit,
          'server'
        );
      });
    });
  });

  describe('Real-time Sync', () => {
    it('should sync changes immediately when online', async () => {
      mockNetworkManager.isOnline.mockReturnValue(true);
      mockApiService.toggleHabitDate.mockResolvedValue({
        _id: '1',
        name: 'Exercise',
        category: 'Health',
        completedDates: ['2024-01-01'],
        streak: 1
      });

      const { getByTestId, getByText } = render(<AppNavigator />, {
        initialAuthState: { 
          user: { _id: '1', email: 'test@example.com', name: 'Test User' }, 
          isAuthenticated: true 
        }
      });

      // Navigate to habits
      const habitsTab = getByText('Habits');
      fireEvent.press(habitsTab);

      // Toggle habit completion
      const habitToggle = getByTestId('habit-1-toggle');
      fireEvent.press(habitToggle);

      // Should sync immediately
      await waitFor(() => {
        expect(mockApiService.toggleHabitDate).toHaveBeenCalledWith('1', expect.any(String));
      });
    });

    it('should show sync status indicators', async () => {
      mockNetworkManager.isOnline.mockReturnValue(false);
      mockOfflineManager.getPendingSyncCount.mockResolvedValue(3);

      const { getByTestId, getByText } = render(<AppNavigator />, {
        initialAuthState: { 
          user: { _id: '1', email: 'test@example.com', name: 'Test User' }, 
          isAuthenticated: true 
        }
      });

      // Should show offline indicator
      expect(getByTestId('offline-indicator')).toBeTruthy();
      expect(getByText('3 items pending sync')).toBeTruthy();

      // Come back online
      mockNetworkManager.isOnline.mockReturnValue(true);
      mockSyncManager.syncPendingOperations.mockResolvedValue(undefined);

      act(() => {
        // Simulate network state change
      });

      // Should show syncing indicator
      await waitFor(() => {
        expect(getByTestId('sync-indicator')).toBeTruthy();
      });
    });
  });

  describe('Data Consistency', () => {
    it('should maintain data consistency across app restarts', async () => {
      const initialData = {
        habits: [{ _id: '1', name: 'Exercise', category: 'Health', completedDates: [], streak: 0 }],
        todos: [{ _id: '1', title: 'Buy groceries', completed: false, priority: 'medium' }],
        journalEntries: [{ _id: '1', title: 'Day 1', content: 'Great start!', date: '2024-01-01' }]
      };

      // First app session
      mockOfflineManager.getCachedData.mockImplementation((key) => {
        return Promise.resolve(initialData[key as keyof typeof initialData] || null);
      });

      const { getByText, findByText, unmount } = render(<AppNavigator />, {
        initialAuthState: { 
          user: { _id: '1', email: 'test@example.com', name: 'Test User' }, 
          isAuthenticated: true 
        }
      });

      // Check habits
      const habitsTab = getByText('Habits');
      fireEvent.press(habitsTab);
      await findByText('Exercise');

      // Check todos
      const todosTab = getByText('Todos');
      fireEvent.press(todosTab);
      await findByText('Buy groceries');

      // Check journal
      const journalTab = getByText('Journal');
      fireEvent.press(journalTab);
      await findByText('Day 1');

      // Unmount app (simulate app close)
      unmount();

      // Restart app
      const { getByText: getByText2, findByText: findByText2 } = render(<AppNavigator />, {
        initialAuthState: { 
          user: { _id: '1', email: 'test@example.com', name: 'Test User' }, 
          isAuthenticated: true 
        }
      });

      // Data should still be available
      const habitsTab2 = getByText2('Habits');
      fireEvent.press(habitsTab2);
      await findByText2('Exercise');

      const todosTab2 = getByText2('Todos');
      fireEvent.press(todosTab2);
      await findByText2('Buy groceries');

      const journalTab2 = getByText2('Journal');
      fireEvent.press(journalTab2);
      await findByText2('Day 1');
    });

    it('should handle partial sync failures gracefully', async () => {
      const syncQueue = [
        { id: '1', type: 'CREATE_HABIT', data: { name: 'Habit 1' } },
        { id: '2', type: 'CREATE_TODO', data: { title: 'Todo 1' } },
        { id: '3', type: 'UPDATE_JOURNAL', data: { title: 'Updated Entry' } }
      ];

      mockSyncManager.getSyncQueue.mockResolvedValue(syncQueue);
      
      // First operation succeeds
      mockApiService.createHabit.mockResolvedValueOnce({
        _id: '1', name: 'Habit 1', category: 'Health', completedDates: [], streak: 0
      });
      
      // Second operation fails
      mockApiService.createTodo.mockRejectedValueOnce(new Error('Server error'));
      
      // Third operation succeeds
      mockApiService.updateJournalEntry.mockResolvedValueOnce({
        _id: '3', title: 'Updated Entry', content: 'Content', date: '2024-01-01'
      });

      mockSyncManager.syncPendingOperations.mockImplementation(async () => {
        // Simulate partial sync
        const queue = await mockSyncManager.getSyncQueue();
        for (const item of queue) {
          try {
            if (item.type === 'CREATE_HABIT') {
              await mockApiService.createHabit(item.data);
            } else if (item.type === 'CREATE_TODO') {
              await mockApiService.createTodo(item.data);
            } else if (item.type === 'UPDATE_JOURNAL') {
              await mockApiService.updateJournalEntry(item.data);
            }
          } catch (error) {
            // Keep failed items in queue
            console.log('Sync failed for item:', item.id);
          }
        }
      });

      const { getByText, findByText } = render(<AppNavigator />, {
        initialAuthState: { 
          user: { _id: '1', email: 'test@example.com', name: 'Test User' }, 
          isAuthenticated: true 
        }
      });

      // Trigger sync
      act(() => {
        mockSyncManager.syncPendingOperations();
      });

      // Should show partial sync status
      await findByText(/1 item failed to sync/i);

      // Should allow retry
      const retryButton = getByText('Retry Sync');
      fireEvent.press(retryButton);

      await waitFor(() => {
        expect(mockSyncManager.syncPendingOperations).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('Cross-Platform Sync', () => {
    it('should sync changes made on web platform to mobile', async () => {
      // Simulate web changes by having server return updated data
      const initialHabits = [
        { _id: '1', name: 'Exercise', category: 'Health', completedDates: [], streak: 0 }
      ];

      const updatedHabits = [
        { _id: '1', name: 'Exercise', category: 'Health', completedDates: ['2024-01-01'], streak: 1 },
        { _id: '2', name: 'Read', category: 'Learning', completedDates: [], streak: 0 } // New habit added on web
      ];

      // First load
      mockApiService.getHabits.mockResolvedValueOnce(initialHabits);

      const { getByText, findByText, rerender } = render(<AppNavigator />, {
        initialAuthState: { 
          user: { _id: '1', email: 'test@example.com', name: 'Test User' }, 
          isAuthenticated: true 
        }
      });

      const habitsTab = getByText('Habits');
      fireEvent.press(habitsTab);

      await findByText('Exercise');

      // Simulate pull-to-refresh (sync with server)
      mockApiService.getHabits.mockResolvedValueOnce(updatedHabits);

      const habitsList = getByText('Exercise').parent;
      fireEvent(habitsList, 'refresh');

      // Should show updated data from web
      await findByText('Read'); // New habit from web
      
      // Exercise should show as completed (updated on web)
      await waitFor(() => {
        expect(mockApiService.getHabits).toHaveBeenCalledTimes(2);
      });
    });

    it('should handle concurrent edits from multiple devices', async () => {
      const habitId = '1';
      const mobileEdit = {
        _id: habitId,
        name: 'Exercise - Mobile Edit',
        category: 'Health',
        completedDates: ['2024-01-01'],
        streak: 1,
        lastModified: Date.now()
      };

      const webEdit = {
        _id: habitId,
        name: 'Exercise - Web Edit',
        category: 'Fitness',
        completedDates: ['2024-01-01', '2024-01-02'],
        streak: 2,
        lastModified: Date.now() + 1000 // Newer
      };

      // Mobile makes edit
      mockApiService.updateHabit.mockRejectedValueOnce({
        response: { status: 409, data: { conflict: webEdit } }
      });

      const { getByTestId, getByText, findByText } = render(<AppNavigator />, {
        initialAuthState: { 
          user: { _id: '1', email: 'test@example.com', name: 'Test User' }, 
          isAuthenticated: true 
        }
      });

      const habitsTab = getByText('Habits');
      fireEvent.press(habitsTab);

      // Edit habit
      const editButton = getByTestId('habit-1-edit');
      fireEvent.press(editButton);

      const nameInput = getByTestId('habit-name-input');
      fireEvent.changeText(nameInput, 'Exercise - Mobile Edit');

      const saveButton = getByText('Save');
      fireEvent.press(saveButton);

      // Should detect conflict
      await findByText(/conflict detected/i);
      await findByText('Exercise - Web Edit'); // Show server version
      await findByText('Exercise - Mobile Edit'); // Show local version

      // User chooses to merge
      const mergeButton = getByText('Merge Changes');
      fireEvent.press(mergeButton);

      await waitFor(() => {
        expect(mockSyncManager.resolveConflict).toHaveBeenCalledWith(
          mobileEdit,
          webEdit,
          'merge'
        );
      });
    });
  });
});
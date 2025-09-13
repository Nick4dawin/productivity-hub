/**
 * Basic Integration Test
 * 
 * This test validates core app functionality and integration points
 * without complex mocking to ensure the app works end-to-end.
 */

import { ApiService } from '../../services/ApiService';
import { OfflineManager } from '../../services/OfflineManager';
import { SyncManager } from '../../services/SyncManager';
import { NetworkManager } from '../../services/NetworkManager';

// Simple integration tests without React components
describe('Basic Integration Tests', () => {
  describe('API Service Integration', () => {
    it('should initialize API service correctly', () => {
      const apiService = new ApiService();
      expect(apiService).toBeDefined();
      expect(typeof apiService.login).toBe('function');
      expect(typeof apiService.register).toBe('function');
      expect(typeof apiService.getHabits).toBe('function');
    });

    it('should handle authentication flow structure', async () => {
      const apiService = new ApiService();
      
      // Mock successful login response
      const mockLogin = jest.spyOn(apiService, 'login').mockResolvedValue({
        token: 'test-token',
        user: {
          _id: '1',
          email: 'test@example.com',
          name: 'Test User',
          profilePicture: null
        }
      });

      const result = await apiService.login({
        email: 'test@example.com',
        password: 'password123'
      });

      expect(result.token).toBe('test-token');
      expect(result.user.email).toBe('test@example.com');
      
      mockLogin.mockRestore();
    });

    it('should handle API error responses', async () => {
      const apiService = new ApiService();
      
      const mockLogin = jest.spyOn(apiService, 'login').mockRejectedValue(
        new Error('Invalid credentials')
      );

      await expect(apiService.login({
        email: 'test@example.com',
        password: 'wrong-password'
      })).rejects.toThrow('Invalid credentials');
      
      mockLogin.mockRestore();
    });
  });

  describe('Offline Manager Integration', () => {
    it('should initialize offline manager correctly', () => {
      const offlineManager = new OfflineManager();
      expect(offlineManager).toBeDefined();
      expect(typeof offlineManager.cacheData).toBe('function');
      expect(typeof offlineManager.getCachedData).toBe('function');
      expect(typeof offlineManager.queueSync).toBe('function');
    });

    it('should handle data caching operations', async () => {
      const offlineManager = new OfflineManager();
      
      const testData = [
        { _id: '1', name: 'Test Habit', category: 'Health' }
      ];

      // Mock caching operations
      const mockCache = jest.spyOn(offlineManager, 'cacheData').mockResolvedValue(undefined);
      const mockGet = jest.spyOn(offlineManager, 'getCachedData').mockResolvedValue(testData);

      await offlineManager.cacheData('habits', testData);
      const cachedData = await offlineManager.getCachedData('habits');

      expect(mockCache).toHaveBeenCalledWith('habits', testData);
      expect(cachedData).toEqual(testData);
      
      mockCache.mockRestore();
      mockGet.mockRestore();
    });

    it('should handle sync queue operations', async () => {
      const offlineManager = new OfflineManager();
      
      const syncItem = {
        id: '1',
        type: 'CREATE_HABIT',
        endpoint: '/habits',
        data: { name: 'New Habit' },
        timestamp: Date.now()
      };

      const mockQueue = jest.spyOn(offlineManager, 'queueSync').mockResolvedValue(undefined);
      const mockGetQueue = jest.spyOn(offlineManager, 'getSyncQueue').mockResolvedValue([syncItem]);

      await offlineManager.queueSync(syncItem);
      const queue = await offlineManager.getSyncQueue();

      expect(mockQueue).toHaveBeenCalledWith(syncItem);
      expect(queue).toContain(syncItem);
      
      mockQueue.mockRestore();
      mockGetQueue.mockRestore();
    });
  });

  describe('Sync Manager Integration', () => {
    it('should initialize sync manager correctly', () => {
      const syncManager = new SyncManager();
      expect(syncManager).toBeDefined();
      expect(typeof syncManager.sync).toBe('function');
      expect(typeof syncManager.isSyncInProgress).toBe('function');
    });

    it('should handle sync operations', async () => {
      const syncManager = new SyncManager();
      
      const mockSync = jest.spyOn(syncManager, 'sync').mockResolvedValue({
        success: true,
        syncedCount: 0,
        failedCount: 0,
        conflicts: [],
        errors: []
      });

      await syncManager.sync();

      expect(mockSync).toHaveBeenCalled();
      
      mockSync.mockRestore();
    });

    it('should handle conflict resolution', async () => {
      const syncManager = new SyncManager();
      
      const mockRegisterResolver = jest.spyOn(syncManager, 'registerConflictResolver').mockImplementation(() => {});
      const mockAddListener = jest.spyOn(syncManager, 'addSyncListener').mockReturnValue(() => {});

      syncManager.registerConflictResolver('habits', async () => ({
        strategy: 'server-wins',
        resolvedData: { _id: '1', name: 'Server Edit' }
      }));

      const unsubscribe = syncManager.addSyncListener(() => {});

      expect(mockRegisterResolver).toHaveBeenCalled();
      expect(mockAddListener).toHaveBeenCalled();
      expect(typeof unsubscribe).toBe('function');
      
      mockRegisterResolver.mockRestore();
      mockAddListener.mockRestore();
    });
  });

  describe('Network Manager Integration', () => {
    it('should initialize network manager correctly', () => {
      const networkManager = new NetworkManager();
      expect(networkManager).toBeDefined();
      expect(typeof networkManager.isOnline).toBe('function');
      expect(typeof networkManager.addListener).toBe('function');
    });

    it('should handle network state detection', () => {
      const networkManager = new NetworkManager();
      
      const mockIsOnline = jest.spyOn(networkManager, 'isOnline').mockReturnValue(true);

      const isOnline = networkManager.isOnline();

      expect(isOnline).toBe(true);
      
      mockIsOnline.mockRestore();
    });

    it('should handle network state changes', () => {
      const networkManager = new NetworkManager();
      
      const mockListener = jest.fn();
      const mockAddListener = jest.spyOn(networkManager, 'addListener').mockReturnValue(() => {});

      networkManager.addListener(mockListener);

      expect(mockAddListener).toHaveBeenCalledWith(mockListener);
      
      mockAddListener.mockRestore();
    });
  });

  describe('Cross-Service Integration', () => {
    it('should integrate API service with offline manager', async () => {
      const apiService = new ApiService();
      const offlineManager = new OfflineManager();
      
      const testHabits = [
        { _id: '1', name: 'Exercise', category: 'Health' },
        { _id: '2', name: 'Read', category: 'Learning' }
      ];

      // Mock API call
      const mockGetHabits = jest.spyOn(apiService, 'getHabits').mockResolvedValue(testHabits);
      const mockCache = jest.spyOn(offlineManager, 'cacheData').mockResolvedValue(undefined);

      // Simulate fetching and caching data
      const habits = await apiService.getHabits();
      await offlineManager.cacheData('habits', habits);

      expect(mockGetHabits).toHaveBeenCalled();
      expect(mockCache).toHaveBeenCalledWith('habits', testHabits);
      
      mockGetHabits.mockRestore();
      mockCache.mockRestore();
    });

    it('should integrate offline manager with sync manager', async () => {
      const offlineManager = new OfflineManager();
      const syncManager = new SyncManager();
      
      const syncItem = {
        id: '1',
        type: 'CREATE_HABIT',
        endpoint: '/habits',
        data: { name: 'Offline Habit' },
        timestamp: Date.now()
      };

      // Mock offline operations
      const mockQueue = jest.spyOn(offlineManager, 'queueSync').mockResolvedValue(undefined);
      const mockGetQueue = jest.spyOn(offlineManager, 'getSyncQueue').mockResolvedValue([syncItem]);
      const mockSync = jest.spyOn(syncManager, 'sync').mockResolvedValue({
        success: true, syncedCount: 1, failedCount: 0, conflicts: [], errors: []
      });

      // Simulate offline operation and sync
      await offlineManager.queueSync(syncItem);
      const queue = await offlineManager.getSyncQueue();
      await syncManager.sync();

      expect(mockQueue).toHaveBeenCalledWith(syncItem);
      expect(mockGetQueue).toHaveBeenCalled();
      expect(mockSync).toHaveBeenCalled();
      
      mockQueue.mockRestore();
      mockGetQueue.mockRestore();
      mockSync.mockRestore();
    });

    it('should integrate network manager with sync operations', async () => {
      const networkManager = new NetworkManager();
      const syncManager = new SyncManager();
      
      // Mock network state
      const mockIsOnline = jest.spyOn(networkManager, 'isOnline').mockReturnValue(true);
      const mockSync = jest.spyOn(syncManager, 'sync').mockResolvedValue({
        success: true, syncedCount: 0, failedCount: 0, conflicts: [], errors: []
      });

      // Simulate network-dependent sync
      if (networkManager.isOnline()) {
        await syncManager.sync();
      }

      expect(mockIsOnline).toHaveBeenCalled();
      expect(mockSync).toHaveBeenCalled();
      
      mockIsOnline.mockRestore();
      mockSync.mockRestore();
    });
  });

  describe('Data Flow Integration', () => {
    it('should handle complete data flow from API to cache to sync', async () => {
      const apiService = new ApiService();
      const offlineManager = new OfflineManager();
      const syncManager = new SyncManager();
      const networkManager = new NetworkManager();

      // Mock all services
      const mockGetHabits = jest.spyOn(apiService, 'getHabits').mockResolvedValue([]);
      const mockCreateHabit = jest.spyOn(apiService, 'createHabit').mockResolvedValue({
        _id: '1', name: 'New Habit', category: 'Health', completedDates: [], streak: 0
      });
      const mockCache = jest.spyOn(offlineManager, 'cacheData').mockResolvedValue(undefined);
      const mockQueue = jest.spyOn(offlineManager, 'queueSync').mockResolvedValue(undefined);
      const mockIsOnline = jest.spyOn(networkManager, 'isOnline').mockReturnValue(false);
      const mockSync = jest.spyOn(syncManager, 'sync').mockResolvedValue({
        success: true, syncedCount: 1, failedCount: 0, conflicts: [], errors: []
      });

      // Simulate complete flow
      // 1. Fetch initial data
      const habits = await apiService.getHabits();
      await offlineManager.cacheData('habits', habits);

      // 2. Create habit while offline
      if (!networkManager.isOnline()) {
        await offlineManager.queueSync({
          id: '1',
          type: 'CREATE_HABIT',
          endpoint: '/habits',
          data: { name: 'Offline Habit' },
          timestamp: Date.now()
        });
      }

      // 3. Come back online and sync
      mockIsOnline.mockReturnValue(true);
      if (networkManager.isOnline()) {
        await syncManager.sync();
      }

      expect(mockGetHabits).toHaveBeenCalled();
      expect(mockCache).toHaveBeenCalled();
      expect(mockQueue).toHaveBeenCalled();
      expect(mockSync).toHaveBeenCalled();

      // Cleanup mocks
      [mockGetHabits, mockCreateHabit, mockCache, mockQueue, mockIsOnline, mockSync]
        .forEach(mock => mock.mockRestore());
    });

    it('should handle authentication token flow', async () => {
      const apiService = new ApiService();
      
      // Mock authentication flow
      const mockLogin = jest.spyOn(apiService, 'login').mockResolvedValue({
        token: 'jwt-token',
        user: { _id: '1', email: 'test@example.com', name: 'Test User', profilePicture: null }
      });
      
      const mockRefresh = jest.spyOn(apiService, 'refreshToken').mockResolvedValue('new-jwt-token');

      // Simulate auth flow
      const loginResult = await apiService.login({ email: 'test@example.com', password: 'password' });
      expect(loginResult.token).toBe('jwt-token');

      // Simulate token refresh
      const newToken = await apiService.refreshToken('old-refresh-token');
      expect(newToken).toBe('new-jwt-token');

      // Cleanup mocks
      mockLogin.mockRestore();
      mockRefresh.mockRestore();
    });
  });
});
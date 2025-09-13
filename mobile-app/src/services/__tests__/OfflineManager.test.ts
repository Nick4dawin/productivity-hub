import AsyncStorage from '@react-native-async-storage/async-storage';
import { OfflineManager } from '../OfflineManager';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

describe('OfflineManager', () => {
  let offlineManager: OfflineManager;

  beforeEach(() => {
    offlineManager = new OfflineManager();
    jest.clearAllMocks();
  });

  describe('cacheData', () => {
    it('should cache data with timestamp', async () => {
      const testData = { id: 1, name: 'Test' };
      const mockTimestamp = 1640995200000; // 2022-01-01
      
      jest.spyOn(Date, 'now').mockReturnValue(mockTimestamp);
      
      await offlineManager.cacheData('test_key', testData);
      
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        'test_key',
        JSON.stringify({
          data: testData,
          timestamp: mockTimestamp,
          version: 1,
        })
      );
    });
  });

  describe('getCachedData', () => {
    it('should return cached data if not expired', async () => {
      const testData = { id: 1, name: 'Test' };
      const currentTime = 1640995200000;
      const cachedTime = currentTime - 1000; // 1 second ago
      
      jest.spyOn(Date, 'now').mockReturnValue(currentTime);
      
      mockAsyncStorage.getItem.mockResolvedValue(
        JSON.stringify({
          data: testData,
          timestamp: cachedTime,
          version: 1,
        })
      );
      
      const result = await offlineManager.getCachedData('test_key', 5000); // 5 second max age
      
      expect(result).toEqual(testData);
    });

    it('should return null if data is expired', async () => {
      const testData = { id: 1, name: 'Test' };
      const currentTime = 1640995200000;
      const cachedTime = currentTime - 10000; // 10 seconds ago
      
      jest.spyOn(Date, 'now').mockReturnValue(currentTime);
      
      mockAsyncStorage.getItem.mockResolvedValue(
        JSON.stringify({
          data: testData,
          timestamp: cachedTime,
          version: 1,
        })
      );
      
      const result = await offlineManager.getCachedData('test_key', 5000); // 5 second max age
      
      expect(result).toBeNull();
    });

    it('should return null if no cached data exists', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);
      
      const result = await offlineManager.getCachedData('test_key');
      
      expect(result).toBeNull();
    });
  });

  describe('queueSync', () => {
    it('should add operation to sync queue', async () => {
      const operation = {
        id: 'op1',
        type: 'CREATE_HABIT' as const,
        endpoint: '/habits',
        data: { name: 'Test Habit' },
        timestamp: Date.now(),
      };

      mockAsyncStorage.getItem.mockResolvedValue('[]');
      
      await offlineManager.queueSync(operation);
      
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        'syncQueue',
        JSON.stringify([operation])
      );
    });

    it('should append to existing sync queue', async () => {
      const existingOperation = {
        id: 'op1',
        type: 'CREATE_TODO' as const,
        endpoint: '/todos',
        data: { title: 'Existing Todo' },
        timestamp: Date.now() - 1000,
      };

      const newOperation = {
        id: 'op2',
        type: 'CREATE_HABIT' as const,
        endpoint: '/habits',
        data: { name: 'New Habit' },
        timestamp: Date.now(),
      };

      mockAsyncStorage.getItem.mockResolvedValue(
        JSON.stringify([existingOperation])
      );
      
      await offlineManager.queueSync(newOperation);
      
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        'syncQueue',
        JSON.stringify([existingOperation, newOperation])
      );
    });
  });

  describe('getSyncQueue', () => {
    it('should return empty array if no queue exists', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);
      
      const queue = await offlineManager.getSyncQueue();
      
      expect(queue).toEqual([]);
    });

    it('should return parsed sync queue', async () => {
      const operations = [
        {
          id: 'op1',
          type: 'CREATE_HABIT' as const,
          endpoint: '/habits',
          data: { name: 'Test Habit' },
          timestamp: Date.now(),
        },
      ];

      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(operations));
      
      const queue = await offlineManager.getSyncQueue();
      
      expect(queue).toEqual(operations);
    });
  });

  describe('clearCache', () => {
    it('should clear specific cache key', async () => {
      await offlineManager.clearCache('test_key');
      
      expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith('test_key');
    });

    it('should clear all cache if no key provided', async () => {
      await offlineManager.clearCache();
      
      expect(mockAsyncStorage.clear).toHaveBeenCalled();
    });
  });

  describe('isDataStale', () => {
    it('should return true if data is stale', async () => {
      const currentTime = 1640995200000;
      const cachedTime = currentTime - 10000; // 10 seconds ago
      
      jest.spyOn(Date, 'now').mockReturnValue(currentTime);
      
      mockAsyncStorage.getItem.mockResolvedValue(
        JSON.stringify({
          data: {},
          timestamp: cachedTime,
          version: 1,
        })
      );
      
      const isStale = await offlineManager.isDataStale('test_key', 5000); // 5 second max age
      
      expect(isStale).toBe(true);
    });

    it('should return false if data is fresh', async () => {
      const currentTime = 1640995200000;
      const cachedTime = currentTime - 1000; // 1 second ago
      
      jest.spyOn(Date, 'now').mockReturnValue(currentTime);
      
      mockAsyncStorage.getItem.mockResolvedValue(
        JSON.stringify({
          data: {},
          timestamp: cachedTime,
          version: 1,
        })
      );
      
      const isStale = await offlineManager.isDataStale('test_key', 5000); // 5 second max age
      
      expect(isStale).toBe(false);
    });
  });
});
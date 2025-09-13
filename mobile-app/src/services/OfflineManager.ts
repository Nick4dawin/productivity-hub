import AsyncStorage from '@react-native-async-storage/async-storage';
import { SyncItem } from '@/types';

interface CachedData<T = any> {
  data: T;
  timestamp: number;
  version: number;
  expiresAt?: number;
}

export class OfflineManager {
  private static instance: OfflineManager;
  private readonly CACHE_PREFIX = '@LifeOS_Cache_';
  private readonly SYNC_QUEUE_KEY = '@LifeOS_SyncQueue';
  private readonly DEFAULT_CACHE_VERSION = 1;

  static getInstance(): OfflineManager {
    if (!OfflineManager.instance) {
      OfflineManager.instance = new OfflineManager();
    }
    return OfflineManager.instance;
  }

  /**
   * Cache data with optional expiration
   */
  async cacheData<T>(key: string, data: T, maxAge?: number): Promise<void> {
    try {
      const cacheKey = this.CACHE_PREFIX + key;
      const cachedData: CachedData<T> = {
        data,
        timestamp: Date.now(),
        version: this.DEFAULT_CACHE_VERSION,
        expiresAt: maxAge ? Date.now() + maxAge : undefined,
      };

      await AsyncStorage.setItem(cacheKey, JSON.stringify(cachedData));
    } catch (error) {
      console.error('Error caching data:', error);
    }
  }

  /**
   * Get cached data if it exists and hasn't expired
   */
  async getCachedData<T>(key: string, maxAge?: number): Promise<T | null> {
    try {
      const cacheKey = this.CACHE_PREFIX + key;
      const cachedString = await AsyncStorage.getItem(cacheKey);
      
      if (!cachedString) {
        return null;
      }

      const cached: CachedData<T> = JSON.parse(cachedString);
      const now = Date.now();

      // Check if data has expired based on expiresAt or maxAge
      if (cached.expiresAt && now > cached.expiresAt) {
        await this.removeCachedData(key);
        return null;
      }

      if (maxAge && now - cached.timestamp > maxAge) {
        await this.removeCachedData(key);
        return null;
      }

      return cached.data;
    } catch (error) {
      console.error('Error getting cached data:', error);
      return null;
    }
  }

  /**
   * Remove cached data
   */
  async removeCachedData(key: string): Promise<void> {
    try {
      const cacheKey = this.CACHE_PREFIX + key;
      await AsyncStorage.removeItem(cacheKey);
    } catch (error) {
      console.error('Error removing cached data:', error);
    }
  }

  /**
   * Clear all cached data
   */
  async clearAllCache(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith(this.CACHE_PREFIX));
      await AsyncStorage.multiRemove(cacheKeys);
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }

  /**
   * Get cache size and statistics
   */
  async getCacheStats(): Promise<{
    totalItems: number;
    totalSize: number;
    oldestItem?: { key: string; timestamp: number };
    newestItem?: { key: string; timestamp: number };
  }> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith(this.CACHE_PREFIX));
      
      let totalSize = 0;
      let oldestItem: { key: string; timestamp: number } | undefined;
      let newestItem: { key: string; timestamp: number } | undefined;

      for (const key of cacheKeys) {
        const value = await AsyncStorage.getItem(key);
        if (value) {
          totalSize += value.length;
          
          try {
            const cached: CachedData = JSON.parse(value);
            const displayKey = key.replace(this.CACHE_PREFIX, '');
            
            if (!oldestItem || cached.timestamp < oldestItem.timestamp) {
              oldestItem = { key: displayKey, timestamp: cached.timestamp };
            }
            
            if (!newestItem || cached.timestamp > newestItem.timestamp) {
              newestItem = { key: displayKey, timestamp: cached.timestamp };
            }
          } catch (parseError) {
            // Skip invalid cached items
          }
        }
      }

      return {
        totalItems: cacheKeys.length,
        totalSize,
        oldestItem,
        newestItem,
      };
    } catch (error) {
      console.error('Error getting cache stats:', error);
      return { totalItems: 0, totalSize: 0 };
    }
  }

  /**
   * Add operation to sync queue
   */
  async queueSync(operation: Omit<SyncItem, 'id' | 'timestamp'>): Promise<void> {
    try {
      const queue = await this.getSyncQueue();
      const syncItem: SyncItem = {
        ...operation,
        id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
      };
      
      queue.push(syncItem);
      await AsyncStorage.setItem(this.SYNC_QUEUE_KEY, JSON.stringify(queue));
    } catch (error) {
      console.error('Error queuing sync operation:', error);
    }
  }

  /**
   * Get sync queue
   */
  async getSyncQueue(): Promise<SyncItem[]> {
    try {
      const queueString = await AsyncStorage.getItem(this.SYNC_QUEUE_KEY);
      return queueString ? JSON.parse(queueString) : [];
    } catch (error) {
      console.error('Error getting sync queue:', error);
      return [];
    }
  }

  /**
   * Remove item from sync queue
   */
  async removeFromSyncQueue(itemId: string): Promise<void> {
    try {
      const queue = await this.getSyncQueue();
      const updatedQueue = queue.filter(item => item.id !== itemId);
      await AsyncStorage.setItem(this.SYNC_QUEUE_KEY, JSON.stringify(updatedQueue));
    } catch (error) {
      console.error('Error removing from sync queue:', error);
    }
  }

  /**
   * Clear sync queue
   */
  async clearSyncQueue(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.SYNC_QUEUE_KEY);
    } catch (error) {
      console.error('Error clearing sync queue:', error);
    }
  }

  /**
   * Check if data exists in cache
   */
  async hasCachedData(key: string): Promise<boolean> {
    try {
      const cacheKey = this.CACHE_PREFIX + key;
      const value = await AsyncStorage.getItem(cacheKey);
      return value !== null;
    } catch (error) {
      console.error('Error checking cached data:', error);
      return false;
    }
  }

  /**
   * Get cache invalidation strategies
   */
  async invalidateExpiredCache(): Promise<number> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith(this.CACHE_PREFIX));
      let removedCount = 0;

      for (const key of cacheKeys) {
        const value = await AsyncStorage.getItem(key);
        if (value) {
          try {
            const cached: CachedData = JSON.parse(value);
            const now = Date.now();
            
            if (cached.expiresAt && now > cached.expiresAt) {
              await AsyncStorage.removeItem(key);
              removedCount++;
            }
          } catch (parseError) {
            // Remove invalid cached items
            await AsyncStorage.removeItem(key);
            removedCount++;
          }
        }
      }

      return removedCount;
    } catch (error) {
      console.error('Error invalidating expired cache:', error);
      return 0;
    }
  }

  /**
   * Batch cache operations for better performance
   */
  async batchCacheData(items: Array<{ key: string; data: any; maxAge?: number }>): Promise<void> {
    try {
      const cacheItems: Array<[string, string]> = [];
      
      for (const item of items) {
        const cacheKey = this.CACHE_PREFIX + item.key;
        const cachedData: CachedData = {
          data: item.data,
          timestamp: Date.now(),
          version: this.DEFAULT_CACHE_VERSION,
          expiresAt: item.maxAge ? Date.now() + item.maxAge : undefined,
        };
        
        cacheItems.push([cacheKey, JSON.stringify(cachedData)]);
      }

      await AsyncStorage.multiSet(cacheItems);
    } catch (error) {
      console.error('Error batch caching data:', error);
    }
  }

  /**
   * Get multiple cached items at once
   */
  async getBatchCachedData<T>(keys: string[], maxAge?: number): Promise<Record<string, T | null>> {
    try {
      const cacheKeys = keys.map(key => this.CACHE_PREFIX + key);
      const values = await AsyncStorage.multiGet(cacheKeys);
      const result: Record<string, T | null> = {};
      const now = Date.now();

      for (let i = 0; i < keys.length; i++) {
        const originalKey = keys[i];
        const [, value] = values[i];
        
        if (value) {
          try {
            const cached: CachedData<T> = JSON.parse(value);
            
            // Check expiration
            if (cached.expiresAt && now > cached.expiresAt) {
              result[originalKey] = null;
              // Remove expired item
              await this.removeCachedData(originalKey);
            } else if (maxAge && now - cached.timestamp > maxAge) {
              result[originalKey] = null;
              // Remove expired item
              await this.removeCachedData(originalKey);
            } else {
              result[originalKey] = cached.data;
            }
          } catch (parseError) {
            result[originalKey] = null;
          }
        } else {
          result[originalKey] = null;
        }
      }

      return result;
    } catch (error) {
      console.error('Error getting batch cached data:', error);
      return keys.reduce((acc, key) => ({ ...acc, [key]: null }), {});
    }
  }
}

export const offlineManager = OfflineManager.getInstance();
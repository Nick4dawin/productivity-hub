import { useState, useEffect, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { offlineManager } from '@/services/OfflineManager';
import { networkManager, NetworkState } from '@/services/NetworkManager';
import { SyncItem } from '@/types';

// Network state hook
export const useNetworkState = () => {
  const [networkState, setNetworkState] = useState<NetworkState>(
    networkManager.getCurrentState()
  );

  useEffect(() => {
    const unsubscribe = networkManager.addListener(setNetworkState);
    return unsubscribe;
  }, []);

  return {
    ...networkState,
    isOnline: networkManager.isOnline(),
    isOffline: networkManager.isOffline(),
    networkType: networkManager.getNetworkTypeDescription(),
    isMetered: networkManager.isMeteredConnection(),
    isFast: networkManager.isFastConnection(),
  };
};

// Offline cache hook
export const useOfflineCache = <T>(
  key: string,
  fetcher: () => Promise<T>,
  options?: {
    maxAge?: number;
    enabled?: boolean;
    refetchOnReconnect?: boolean;
  }
) => {
  const { isOnline } = useNetworkState();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: [key],
    queryFn: async () => {
      // Try to get cached data first
      const cachedData = await offlineManager.getCachedData<T>(key, options?.maxAge);
      
      if (isOnline) {
        try {
          // Fetch fresh data when online
          const freshData = await fetcher();
          // Cache the fresh data
          await offlineManager.cacheData(key, freshData, options?.maxAge);
          return freshData;
        } catch (error) {
          // If fetch fails but we have cached data, return it
          if (cachedData !== null) {
            return cachedData;
          }
          throw error;
        }
      } else {
        // Return cached data when offline
        if (cachedData !== null) {
          return cachedData;
        }
        throw new Error('No cached data available offline');
      }
    },
    enabled: options?.enabled !== false,
    staleTime: options?.maxAge || 5 * 60 * 1000, // 5 minutes default
    retry: (failureCount, error) => {
      // Don't retry if offline and no cached data
      if (!isOnline && error.message.includes('No cached data')) {
        return false;
      }
      return failureCount < 3;
    },
  });

  // Refetch when coming back online
  useEffect(() => {
    if (isOnline && options?.refetchOnReconnect !== false) {
      query.refetch();
    }
  }, [isOnline, options?.refetchOnReconnect, query]);

  const invalidateCache = useCallback(async () => {
    await offlineManager.removeCachedData(key);
    queryClient.invalidateQueries({ queryKey: [key] });
  }, [key, queryClient]);

  return {
    ...query,
    invalidateCache,
    isFromCache: !isOnline && query.data !== undefined,
  };
};

// Sync queue hook
export const useSyncQueue = () => {
  const [syncQueue, setSyncQueue] = useState<SyncItem[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const { isOnline } = useNetworkState();

  // Load sync queue on mount
  useEffect(() => {
    const loadQueue = async () => {
      const queue = await offlineManager.getSyncQueue();
      setSyncQueue(queue);
    };
    loadQueue();
  }, []);

  const addToQueue = useCallback(async (operation: Omit<SyncItem, 'id' | 'timestamp'>) => {
    await offlineManager.queueSync(operation);
    const updatedQueue = await offlineManager.getSyncQueue();
    setSyncQueue(updatedQueue);
  }, []);

  const removeFromQueue = useCallback(async (itemId: string) => {
    await offlineManager.removeFromSyncQueue(itemId);
    const updatedQueue = await offlineManager.getSyncQueue();
    setSyncQueue(updatedQueue);
  }, []);

  const clearQueue = useCallback(async () => {
    await offlineManager.clearSyncQueue();
    setSyncQueue([]);
  }, []);

  return {
    syncQueue,
    queueLength: syncQueue.length,
    isSyncing,
    isOnline,
    addToQueue,
    removeFromQueue,
    clearQueue,
    setIsSyncing,
  };
};

// Cache management hook
export const useCacheManager = () => {
  const [cacheStats, setCacheStats] = useState({
    totalItems: 0,
    totalSize: 0,
    oldestItem: undefined as { key: string; timestamp: number } | undefined,
    newestItem: undefined as { key: string; timestamp: number } | undefined,
  });

  const refreshStats = useCallback(async () => {
    const stats = await offlineManager.getCacheStats();
    setCacheStats(stats);
  }, []);

  const clearAllCache = useCallback(async () => {
    await offlineManager.clearAllCache();
    await refreshStats();
  }, [refreshStats]);

  const invalidateExpiredCache = useCallback(async () => {
    const removedCount = await offlineManager.invalidateExpiredCache();
    await refreshStats();
    return removedCount;
  }, [refreshStats]);

  const formatCacheSize = useCallback((bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }, []);

  useEffect(() => {
    refreshStats();
  }, [refreshStats]);

  return {
    cacheStats,
    refreshStats,
    clearAllCache,
    invalidateExpiredCache,
    formatCacheSize,
  };
};

// Offline-first data mutation hook
export const useOfflineMutation = <TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: {
    onSuccess?: (data: TData, variables: TVariables) => void;
    onError?: (error: Error, variables: TVariables) => void;
    syncEndpoint?: string;
    optimisticUpdate?: (variables: TVariables) => void;
  }
) => {
  const { isOnline } = useNetworkState();
  const { addToQueue } = useSyncQueue();
  const [isPending, setIsPending] = useState(false);

  const mutate = useCallback(async (variables: TVariables) => {
    setIsPending(true);

    try {
      if (isOnline) {
        // Execute mutation immediately when online
        const result = await mutationFn(variables);
        options?.onSuccess?.(result, variables);
        return result;
      } else {
        // Queue for later sync when offline
        if (options?.syncEndpoint) {
          await addToQueue({
            type: 'create', // or determine based on operation
            endpoint: options.syncEndpoint,
            data: variables,
          });
        }

        // Apply optimistic update
        options?.optimisticUpdate?.(variables);
        
        // Return a placeholder result
        return {} as TData;
      }
    } catch (error) {
      options?.onError?.(error as Error, variables);
      throw error;
    } finally {
      setIsPending(false);
    }
  }, [isOnline, mutationFn, options, addToQueue]);

  return {
    mutate,
    isPending,
    isOnline,
  };
};

// Connection status hook with retry logic
export const useConnectionRetry = () => {
  const { isOnline } = useNetworkState();
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  const waitForConnection = useCallback(async (timeout: number = 30000) => {
    setIsRetrying(true);
    try {
      const connected = await networkManager.waitForConnection(timeout);
      if (connected) {
        setRetryCount(0);
      } else {
        setRetryCount(prev => prev + 1);
      }
      return connected;
    } finally {
      setIsRetrying(false);
    }
  }, []);

  const retry = useCallback(async () => {
    await networkManager.refresh();
    if (!isOnline) {
      return waitForConnection();
    }
    return true;
  }, [isOnline, waitForConnection]);

  return {
    isOnline,
    retryCount,
    isRetrying,
    retry,
    waitForConnection,
  };
};
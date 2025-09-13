import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Alert } from 'react-native';
import { useNetworkState, useSyncQueue } from '@/hooks/useOffline';
import { offlineManager } from '@/services/OfflineManager';
import { apiService } from '@/services/ApiService';
import { SyncItem } from '@/types';

interface OfflineContextType {
  isOnline: boolean;
  isOffline: boolean;
  networkType: string;
  syncQueue: SyncItem[];
  queueLength: number;
  isSyncing: boolean;
  lastSyncTime: number | null;
  syncData: () => Promise<void>;
  clearOfflineData: () => Promise<void>;
  addToSyncQueue: (operation: Omit<SyncItem, 'id' | 'timestamp'>) => Promise<void>;
}

const OfflineContext = createContext<OfflineContextType | undefined>(undefined);

interface OfflineProviderProps {
  children: ReactNode;
}

export const OfflineProvider: React.FC<OfflineProviderProps> = ({ children }) => {
  const networkState = useNetworkState();
  const syncQueueHook = useSyncQueue();
  const [lastSyncTime, setLastSyncTime] = useState<number | null>(null);

  // Auto-sync when coming back online
  useEffect(() => {
    if (networkState.isOnline && syncQueueHook.queueLength > 0 && !syncQueueHook.isSyncing) {
      // Delay sync slightly to ensure connection is stable
      const timer = setTimeout(() => {
        syncData();
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [networkState.isOnline, syncQueueHook.queueLength, syncQueueHook.isSyncing]);

  // Show offline/online notifications
  useEffect(() => {
    if (networkState.isOffline) {
      Alert.alert(
        'You\'re Offline',
        'You can continue using the app. Your changes will sync when you\'re back online.',
        [{ text: 'OK' }]
      );
    } else if (lastSyncTime && networkState.isOnline) {
      // Only show "back online" if we were previously offline
      Alert.alert(
        'You\'re Back Online',
        syncQueueHook.queueLength > 0 
          ? `Syncing ${syncQueueHook.queueLength} pending changes...`
          : 'All your data is up to date.',
        [{ text: 'OK' }]
      );
    }
  }, [networkState.isOnline, networkState.isOffline, syncQueueHook.queueLength, lastSyncTime]);

  const syncData = async () => {
    if (!networkState.isOnline || syncQueueHook.isSyncing) {
      return;
    }

    syncQueueHook.setIsSyncing(true);
    
    try {
      const queue = await offlineManager.getSyncQueue();
      let successCount = 0;
      let failureCount = 0;

      for (const operation of queue) {
        try {
          await executeOperation(operation);
          await syncQueueHook.removeFromQueue(operation.id);
          successCount++;
        } catch (error) {
          console.error('Sync operation failed:', operation, error);
          failureCount++;
          
          // Remove operations that are too old (older than 7 days)
          const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
          if (operation.timestamp < sevenDaysAgo) {
            await syncQueueHook.removeFromQueue(operation.id);
            console.log('Removed old sync operation:', operation.id);
          }
        }
      }

      setLastSyncTime(Date.now());

      if (successCount > 0) {
        console.log(`Successfully synced ${successCount} operations`);
      }
      
      if (failureCount > 0) {
        console.warn(`Failed to sync ${failureCount} operations`);
      }

    } catch (error) {
      console.error('Sync process failed:', error);
    } finally {
      syncQueueHook.setIsSyncing(false);
    }
  };

  const executeOperation = async (operation: SyncItem): Promise<any> => {
    const { type, endpoint, data } = operation;

    switch (type) {
      case 'create':
        return apiService.request({
          method: 'POST',
          url: endpoint,
          data,
        });
      
      case 'update':
        return apiService.request({
          method: 'PUT',
          url: endpoint,
          data,
        });
      
      case 'delete':
        return apiService.request({
          method: 'DELETE',
          url: endpoint,
        });
      
      default:
        throw new Error(`Unknown operation type: ${type}`);
    }
  };

  const clearOfflineData = async () => {
    try {
      await offlineManager.clearAllCache();
      await syncQueueHook.clearQueue();
      setLastSyncTime(null);
      
      Alert.alert(
        'Offline Data Cleared',
        'All cached data and pending sync operations have been cleared.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error clearing offline data:', error);
      Alert.alert(
        'Error',
        'Failed to clear offline data. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const addToSyncQueue = async (operation: Omit<SyncItem, 'id' | 'timestamp'>) => {
    await syncQueueHook.addToQueue(operation);
  };

  const contextValue: OfflineContextType = {
    isOnline: networkState.isOnline,
    isOffline: networkState.isOffline,
    networkType: networkState.networkType,
    syncQueue: syncQueueHook.syncQueue,
    queueLength: syncQueueHook.queueLength,
    isSyncing: syncQueueHook.isSyncing,
    lastSyncTime,
    syncData,
    clearOfflineData,
    addToSyncQueue,
  };

  return (
    <OfflineContext.Provider value={contextValue}>
      {children}
    </OfflineContext.Provider>
  );
};

export const useOfflineContext = (): OfflineContextType => {
  const context = useContext(OfflineContext);
  if (context === undefined) {
    throw new Error('useOfflineContext must be used within an OfflineProvider');
  }
  return context;
};
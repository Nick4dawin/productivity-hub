import { offlineManager } from './OfflineManager';
import { networkManager } from './NetworkManager';
import { apiService } from './ApiService';
import { SyncItem } from '@/types';

export interface ConflictResolution {
  strategy: 'client-wins' | 'server-wins' | 'merge' | 'manual';
  resolvedData?: any;
}

export interface SyncConflict {
  id: string;
  type: 'version-mismatch' | 'concurrent-edit' | 'deleted-on-server';
  localData: any;
  serverData?: any;
  lastModified: {
    local: number;
    server?: number;
  };
}

export interface SyncResult {
  success: boolean;
  syncedCount: number;
  failedCount: number;
  conflicts: SyncConflict[];
  errors: Array<{ operation: SyncItem; error: string }>;
}

export class SyncManager {
  private static instance: SyncManager;
  private isSyncing = false;
  private syncListeners: Set<(result: SyncResult) => void> = new Set();
  private conflictResolvers: Map<string, (conflict: SyncConflict) => Promise<ConflictResolution>> = new Map();

  static getInstance(): SyncManager {
    if (!SyncManager.instance) {
      SyncManager.instance = new SyncManager();
    }
    return SyncManager.instance;
  }

  /**
   * Add sync result listener
   */
  addSyncListener(listener: (result: SyncResult) => void): () => void {
    this.syncListeners.add(listener);
    return () => this.syncListeners.delete(listener);
  }

  /**
   * Register conflict resolver for specific data type
   */
  registerConflictResolver(
    dataType: string, 
    resolver: (conflict: SyncConflict) => Promise<ConflictResolution>
  ): void {
    this.conflictResolvers.set(dataType, resolver);
  }

  /**
   * Execute sync process
   */
  async sync(): Promise<SyncResult> {
    if (this.isSyncing) {
      throw new Error('Sync already in progress');
    }

    if (!networkManager.isOnline()) {
      throw new Error('Cannot sync while offline');
    }

    this.isSyncing = true;

    const result: SyncResult = {
      success: true,
      syncedCount: 0,
      failedCount: 0,
      conflicts: [],
      errors: [],
    };

    try {
      const queue = await offlineManager.getSyncQueue();
      
      // Group operations by type for better conflict detection
      const groupedOperations = this.groupOperationsByEntity(queue);

      for (const [entityType, operations] of groupedOperations) {
        await this.syncEntityOperations(entityType, operations, result);
      }

      // Handle any remaining individual operations
      const ungroupedOperations = queue.filter(op => 
        !this.isGroupableOperation(op)
      );

      for (const operation of ungroupedOperations) {
        await this.syncSingleOperation(operation, result);
      }

      result.success = result.failedCount === 0 && result.conflicts.length === 0;

    } catch (error) {
      console.error('Sync process failed:', error);
      result.success = false;
      result.errors.push({
        operation: {} as SyncItem,
        error: error instanceof Error ? error.message : 'Unknown sync error',
      });
    } finally {
      this.isSyncing = false;
      this.notifySyncListeners(result);
    }

    return result;
  }

  /**
   * Group operations by entity for conflict detection
   */
  private groupOperationsByEntity(operations: SyncItem[]): Map<string, SyncItem[]> {
    const grouped = new Map<string, SyncItem[]>();

    for (const operation of operations) {
      const entityType = this.extractEntityType(operation);
      if (entityType) {
        if (!grouped.has(entityType)) {
          grouped.set(entityType, []);
        }
        grouped.get(entityType)!.push(operation);
      }
    }

    return grouped;
  }

  /**
   * Extract entity type from operation endpoint
   */
  private extractEntityType(operation: SyncItem): string | null {
    const match = operation.endpoint.match(/\/api\/([^\/]+)/);
    return match ? match[1] : null;
  }

  /**
   * Check if operation can be grouped for conflict resolution
   */
  private isGroupableOperation(operation: SyncItem): boolean {
    return this.extractEntityType(operation) !== null;
  }

  /**
   * Sync operations for a specific entity type
   */
  private async syncEntityOperations(
    entityType: string, 
    operations: SyncItem[], 
    result: SyncResult
  ): Promise<void> {
    // Sort operations by timestamp to maintain order
    operations.sort((a, b) => a.timestamp - b.timestamp);

    for (const operation of operations) {
      try {
        // Check for conflicts before executing
        const conflict = await this.detectConflict(operation);
        
        if (conflict) {
          result.conflicts.push(conflict);
          
          // Try to resolve conflict automatically
          const resolution = await this.resolveConflict(entityType, conflict);
          
          if (resolution.strategy !== 'manual') {
            await this.applyConflictResolution(operation, resolution);
            await offlineManager.removeFromSyncQueue(operation.id);
            result.syncedCount++;
          } else {
            result.failedCount++;
          }
        } else {
          // No conflict, execute operation normally
          await this.executeOperation(operation);
          await offlineManager.removeFromSyncQueue(operation.id);
          result.syncedCount++;
        }
      } catch (error) {
        console.error('Failed to sync operation:', operation, error);
        result.failedCount++;
        result.errors.push({
          operation,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }
  }

  /**
   * Sync a single operation
   */
  private async syncSingleOperation(operation: SyncItem, result: SyncResult): Promise<void> {
    try {
      await this.executeOperation(operation);
      await offlineManager.removeFromSyncQueue(operation.id);
      result.syncedCount++;
    } catch (error) {
      console.error('Failed to sync operation:', operation, error);
      result.failedCount++;
      result.errors.push({
        operation,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Detect conflicts for an operation
   */
  private async detectConflict(operation: SyncItem): Promise<SyncConflict | null> {
    try {
      // For update operations, check if server version has changed
      if (operation.type === 'update') {
        const entityId = this.extractEntityId(operation);
        if (entityId) {
          const serverData = await this.fetchServerData(operation.endpoint, entityId);
          
          if (serverData) {
            // Check if server data was modified after local operation
            const serverModified = new Date(serverData.updatedAt || serverData.createdAt).getTime();
            
            if (serverModified > operation.timestamp) {
              return {
                id: `${operation.id}-conflict`,
                type: 'concurrent-edit',
                localData: operation.data,
                serverData,
                lastModified: {
                  local: operation.timestamp,
                  server: serverModified,
                },
              };
            }
          }
        }
      }

      // For delete operations, check if item still exists
      if (operation.type === 'delete') {
        const entityId = this.extractEntityId(operation);
        if (entityId) {
          try {
            await this.fetchServerData(operation.endpoint, entityId);
            // If we get here, item still exists on server
            return null;
          } catch (error) {
            // Item doesn't exist on server - this might be expected
            return null;
          }
        }
      }

      return null;
    } catch (error) {
      console.error('Error detecting conflict:', error);
      return null;
    }
  }

  /**
   * Extract entity ID from operation
   */
  private extractEntityId(operation: SyncItem): string | null {
    // Try to extract ID from endpoint
    const match = operation.endpoint.match(/\/([a-f0-9]{24})$/);
    if (match) return match[1];

    // Try to extract ID from data
    if (operation.data && operation.data._id) {
      return operation.data._id;
    }

    return null;
  }

  /**
   * Fetch current server data for comparison
   */
  private async fetchServerData(endpoint: string, entityId: string): Promise<any> {
    const baseEndpoint = endpoint.replace(`/${entityId}`, '');
    return apiService.request({
      method: 'GET',
      url: `${baseEndpoint}/${entityId}`,
    });
  }

  /**
   * Resolve conflict using registered resolvers or default strategies
   */
  private async resolveConflict(
    entityType: string, 
    conflict: SyncConflict
  ): Promise<ConflictResolution> {
    const resolver = this.conflictResolvers.get(entityType);
    
    if (resolver) {
      return resolver(conflict);
    }

    // Default conflict resolution strategies
    return this.getDefaultResolution(conflict);
  }

  /**
   * Get default conflict resolution
   */
  private getDefaultResolution(conflict: SyncConflict): ConflictResolution {
    switch (conflict.type) {
      case 'concurrent-edit':
        // Default to server wins for concurrent edits
        return {
          strategy: 'server-wins',
          resolvedData: conflict.serverData,
        };
      
      case 'version-mismatch':
        // Try to merge if possible, otherwise server wins
        const mergedData = this.attemptMerge(conflict.localData, conflict.serverData);
        return {
          strategy: mergedData ? 'merge' : 'server-wins',
          resolvedData: mergedData || conflict.serverData,
        };
      
      case 'deleted-on-server':
        // Server wins - item was deleted
        return {
          strategy: 'server-wins',
        };
      
      default:
        return {
          strategy: 'manual',
        };
    }
  }

  /**
   * Attempt to merge conflicting data
   */
  private attemptMerge(localData: any, serverData: any): any | null {
    try {
      // Simple merge strategy - combine non-conflicting fields
      const merged = { ...serverData };
      
      for (const [key, value] of Object.entries(localData)) {
        // Skip system fields
        if (['_id', 'createdAt', 'updatedAt', '__v'].includes(key)) {
          continue;
        }
        
        // If server doesn't have this field, use local value
        if (!(key in serverData)) {
          merged[key] = value;
        }
        // If values are the same, no conflict
        else if (JSON.stringify(serverData[key]) === JSON.stringify(value)) {
          merged[key] = value;
        }
        // For arrays, try to merge unique items
        else if (Array.isArray(value) && Array.isArray(serverData[key])) {
          merged[key] = [...new Set([...serverData[key], ...value])];
        }
        // For simple values, prefer server data
        else {
          merged[key] = serverData[key];
        }
      }
      
      return merged;
    } catch (error) {
      console.error('Error merging data:', error);
      return null;
    }
  }

  /**
   * Apply conflict resolution
   */
  private async applyConflictResolution(
    operation: SyncItem, 
    resolution: ConflictResolution
  ): Promise<void> {
    switch (resolution.strategy) {
      case 'client-wins':
        // Execute original operation
        await this.executeOperation(operation);
        break;
      
      case 'server-wins':
        // Skip operation, server data takes precedence
        // Optionally update local cache with server data
        if (resolution.resolvedData) {
          const cacheKey = this.getCacheKeyForOperation(operation);
          if (cacheKey) {
            await offlineManager.cacheData(cacheKey, resolution.resolvedData);
          }
        }
        break;
      
      case 'merge':
        // Execute operation with merged data
        const mergedOperation = {
          ...operation,
          data: resolution.resolvedData,
        };
        await this.executeOperation(mergedOperation);
        break;
      
      case 'manual':
        // Leave in queue for manual resolution
        throw new Error('Manual conflict resolution required');
    }
  }

  /**
   * Get cache key for operation
   */
  private getCacheKeyForOperation(operation: SyncItem): string | null {
    const entityType = this.extractEntityType(operation);
    const entityId = this.extractEntityId(operation);
    
    if (entityType && entityId) {
      return `${entityType}_${entityId}`;
    }
    
    return null;
  }

  /**
   * Execute a sync operation
   */
  private async executeOperation(operation: SyncItem): Promise<any> {
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
  }

  /**
   * Notify sync listeners
   */
  private notifySyncListeners(result: SyncResult): void {
    this.syncListeners.forEach(listener => {
      try {
        listener(result);
      } catch (error) {
        console.error('Error in sync listener:', error);
      }
    });
  }

  /**
   * Get sync status
   */
  isSyncInProgress(): boolean {
    return this.isSyncing;
  }

  /**
   * Force sync specific operations
   */
  async syncOperations(operationIds: string[]): Promise<SyncResult> {
    const queue = await offlineManager.getSyncQueue();
    const operationsToSync = queue.filter(op => operationIds.includes(op.id));
    
    const result: SyncResult = {
      success: true,
      syncedCount: 0,
      failedCount: 0,
      conflicts: [],
      errors: [],
    };

    for (const operation of operationsToSync) {
      await this.syncSingleOperation(operation, result);
    }

    result.success = result.failedCount === 0 && result.conflicts.length === 0;
    this.notifySyncListeners(result);
    
    return result;
  }
}

export const syncManager = SyncManager.getInstance();
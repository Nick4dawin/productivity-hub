import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { ConflictResolutionModal } from './ConflictResolutionModal';
import { useOfflineContext } from '@/contexts/OfflineContext';
import { syncManager, SyncResult, SyncConflict, ConflictResolution } from '@/services/SyncManager';

export const SyncStatus: React.FC = () => {
  const { colors } = useTheme();
  const { 
    isOnline, 
    queueLength, 
    isSyncing, 
    syncData, 
    lastSyncTime 
  } = useOfflineContext();
  
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null);
  const [showConflictModal, setShowConflictModal] = useState(false);
  const [pendingConflicts, setPendingConflicts] = useState<SyncConflict[]>([]);

  useEffect(() => {
    const unsubscribe = syncManager.addSyncListener((result) => {
      setSyncResult(result);
      
      if (result.conflicts.length > 0) {
        setPendingConflicts(result.conflicts);
        setShowConflictModal(true);
      }
    });

    return unsubscribe;
  }, []);

  const formatLastSync = () => {
    if (!lastSyncTime) return 'Never';
    
    const now = Date.now();
    const diff = now - lastSyncTime;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  const handleManualSync = async () => {
    if (!isOnline) {
      Alert.alert('Offline', 'Cannot sync while offline. Please check your connection.');
      return;
    }

    if (isSyncing) {
      Alert.alert('Sync in Progress', 'A sync is already in progress. Please wait.');
      return;
    }

    try {
      await syncData();
    } catch (error) {
      Alert.alert('Sync Failed', 'Failed to sync data. Please try again.');
    }
  };

  const handleConflictResolve = async (conflictId: string, resolution: ConflictResolution) => {
    // Apply resolution logic here
    console.log('Resolving conflict:', conflictId, resolution);
    
    // Remove resolved conflict from pending list
    setPendingConflicts(prev => prev.filter(c => c.id !== conflictId));
    
    // Close modal if no more conflicts
    if (pendingConflicts.length <= 1) {
      setShowConflictModal(false);
    }
  };

  const getSyncStatusColor = () => {
    if (!isOnline) return colors.error;
    if (isSyncing) return colors.warning;
    if (queueLength > 0) return colors.warning;
    if (syncResult && !syncResult.success) return colors.error;
    return colors.success;
  };

  const getSyncStatusText = () => {
    if (!isOnline) return 'Offline';
    if (isSyncing) return 'Syncing...';
    if (queueLength > 0) return `${queueLength} items pending`;
    if (syncResult && !syncResult.success) return 'Sync failed';
    return 'Up to date';
  };

  const getSyncStatusIcon = () => {
    if (!isOnline) return '📴';
    if (isSyncing) return '🔄';
    if (queueLength > 0) return '⏳';
    if (syncResult && !syncResult.success) return '❌';
    return '✅';
  };

  return (
    <>
      <Card style={styles.card}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>
            Sync Status
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: getSyncStatusColor() }]}>
            <Text style={styles.statusIcon}>{getSyncStatusIcon()}</Text>
            <Text style={styles.statusText}>{getSyncStatusText()}</Text>
          </View>
        </View>

        <View style={styles.details}>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
              Last sync:
            </Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>
              {formatLastSync()}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
              Connection:
            </Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>
              {isOnline ? 'Online' : 'Offline'}
            </Text>
          </View>

          {queueLength > 0 && (
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                Pending items:
              </Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>
                {queueLength}
              </Text>
            </View>
          )}

          {syncResult && (
            <>
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                  Last sync result:
                </Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>
                  {syncResult.syncedCount} synced, {syncResult.failedCount} failed
                </Text>
              </View>

              {syncResult.conflicts.length > 0 && (
                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                    Conflicts:
                  </Text>
                  <TouchableOpacity onPress={() => setShowConflictModal(true)}>
                    <Text style={[styles.detailValue, { color: colors.error }]}>
                      {syncResult.conflicts.length} conflicts need resolution
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </>
          )}
        </View>

        <View style={styles.actions}>
          <Button
            title={isSyncing ? 'Syncing...' : 'Sync Now'}
            onPress={handleManualSync}
            disabled={!isOnline || isSyncing}
            loading={isSyncing}
            style={styles.syncButton}
          />

          {pendingConflicts.length > 0 && (
            <Button
              title={`Resolve ${pendingConflicts.length} Conflicts`}
              onPress={() => setShowConflictModal(true)}
              variant="outline"
              style={styles.conflictButton}
            />
          )}
        </View>

        {syncResult && syncResult.errors.length > 0 && (
          <View style={styles.errorsContainer}>
            <Text style={[styles.errorsTitle, { color: colors.error }]}>
              Sync Errors:
            </Text>
            {syncResult.errors.slice(0, 3).map((error, index) => (
              <Text key={index} style={[styles.errorText, { color: colors.textSecondary }]}>
                • {error.error}
              </Text>
            ))}
            {syncResult.errors.length > 3 && (
              <Text style={[styles.errorText, { color: colors.textSecondary }]}>
                ... and {syncResult.errors.length - 3} more
              </Text>
            )}
          </View>
        )}
      </Card>

      <ConflictResolutionModal
        visible={showConflictModal}
        conflicts={pendingConflicts}
        onResolve={handleConflictResolve}
        onClose={() => setShowConflictModal(false)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  details: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  syncButton: {
    flex: 1,
  },
  conflictButton: {
    flex: 1,
  },
  errorsContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    borderRadius: 8,
  },
  errorsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 12,
    marginBottom: 4,
  },
});
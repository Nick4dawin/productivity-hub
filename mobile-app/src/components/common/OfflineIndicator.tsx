import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useOfflineContext } from '@/contexts/OfflineContext';

export const OfflineIndicator: React.FC = () => {
  const { colors } = useTheme();
  const { 
    isOffline, 
    isSyncing, 
    queueLength, 
    networkType, 
    syncData,
    lastSyncTime 
  } = useOfflineContext();

  const formatLastSync = () => {
    if (!lastSyncTime) return 'Never synced';
    
    const now = Date.now();
    const diff = now - lastSyncTime;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  if (!isOffline && queueLength === 0 && !isSyncing) {
    return null; // Don't show indicator when online and nothing to sync
  }

  const getIndicatorColor = () => {
    if (isSyncing) return colors.warning;
    if (isOffline) return colors.error;
    if (queueLength > 0) return colors.warning;
    return colors.success;
  };

  const getIndicatorText = () => {
    if (isSyncing) return `Syncing ${queueLength} items...`;
    if (isOffline && queueLength > 0) return `Offline • ${queueLength} pending`;
    if (isOffline) return `Offline • ${networkType}`;
    if (queueLength > 0) return `${queueLength} items to sync`;
    return 'Online';
  };

  const getIndicatorIcon = () => {
    if (isSyncing) return '🔄';
    if (isOffline) return '📴';
    if (queueLength > 0) return '⏳';
    return '✅';
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { backgroundColor: getIndicatorColor() },
      ]}
      onPress={syncData}
      disabled={isSyncing || isOffline}
    >
      <View style={styles.content}>
        <Text style={styles.icon}>{getIndicatorIcon()}</Text>
        <View style={styles.textContainer}>
          <Text style={styles.statusText}>
            {getIndicatorText()}
          </Text>
          {lastSyncTime && (
            <Text style={styles.syncTimeText}>
              Last sync: {formatLastSync()}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 8,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    fontSize: 16,
    marginRight: 8,
  },
  textContainer: {
    flex: 1,
  },
  statusText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  syncTimeText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    marginTop: 2,
  },
});
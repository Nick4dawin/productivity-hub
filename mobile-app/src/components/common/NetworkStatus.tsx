import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { SyncStatus } from '@/components/sync/SyncStatus';
import { useNetworkState, useConnectionRetry, useCacheManager } from '@/hooks/useOffline';

export const NetworkStatus: React.FC = () => {
  const { colors } = useTheme();
  const networkState = useNetworkState();
  const { retry, isRetrying, retryCount } = useConnectionRetry();
  const { cacheStats, formatCacheSize, clearAllCache, invalidateExpiredCache } = useCacheManager();
  const [showDetails, setShowDetails] = useState(false);

  const getNetworkIcon = () => {
    if (networkState.isOnline) {
      if (networkState.isFast) return '📶';
      if (networkState.isMetered) return '📱';
      return '🌐';
    }
    return '📴';
  };

  const getNetworkDescription = () => {
    if (!networkState.isOnline) {
      return 'No internet connection';
    }

    const parts = [networkState.networkType];
    
    if (networkState.isMetered) {
      parts.push('(metered)');
    }
    
    if (networkState.isInternetReachable === false) {
      parts.push('(no internet)');
    }

    return parts.join(' ');
  };

  const handleClearCache = async () => {
    await clearAllCache();
  };

  const handleCleanupCache = async () => {
    const removedCount = await invalidateExpiredCache();
    console.log(`Removed ${removedCount} expired cache items`);
  };

  return (
    <>
      <TouchableOpacity
        style={[
          styles.statusBar,
          { 
            backgroundColor: networkState.isOnline ? colors.success : colors.error,
          },
        ]}
        onPress={() => setShowDetails(true)}
      >
        <Text style={styles.statusIcon}>{getNetworkIcon()}</Text>
        <Text style={styles.statusText}>
          {getNetworkDescription()}
        </Text>
        {retryCount > 0 && (
          <Text style={styles.retryText}>
            (Retry {retryCount})
          </Text>
        )}
      </TouchableOpacity>

      <Modal
        visible={showDetails}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowDetails(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Network & Sync Details
            </Text>
            <TouchableOpacity onPress={() => setShowDetails(false)}>
              <Text style={[styles.closeButton, { color: colors.primary }]}>
                Done
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            {/* Network Information */}
            <Card style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Network Information
              </Text>
              
              <View style={styles.infoGrid}>
                <View style={styles.infoItem}>
                  <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                    Status
                  </Text>
                  <Text style={[styles.infoValue, { color: colors.text }]}>
                    {networkState.isOnline ? 'Connected' : 'Disconnected'}
                  </Text>
                </View>

                <View style={styles.infoItem}>
                  <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                    Type
                  </Text>
                  <Text style={[styles.infoValue, { color: colors.text }]}>
                    {networkState.networkType}
                  </Text>
                </View>

                <View style={styles.infoItem}>
                  <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                    Internet Access
                  </Text>
                  <Text style={[styles.infoValue, { color: colors.text }]}>
                    {networkState.isInternetReachable === null ? 'Unknown' :
                     networkState.isInternetReachable ? 'Available' : 'Limited'}
                  </Text>
                </View>

                <View style={styles.infoItem}>
                  <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                    Connection Quality
                  </Text>
                  <Text style={[styles.infoValue, { color: colors.text }]}>
                    {networkState.isFast ? 'Fast' : 
                     networkState.isMetered ? 'Metered' : 'Standard'}
                  </Text>
                </View>
              </View>

              {!networkState.isOnline && (
                <Button
                  title={isRetrying ? 'Retrying...' : 'Retry Connection'}
                  onPress={retry}
                  loading={isRetrying}
                  style={styles.retryButton}
                />
              )}
            </Card>

            {/* Sync Status */}
            <SyncStatus />

            {/* Cache Information */}
            <Card style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Offline Cache
              </Text>
              
              <View style={styles.infoGrid}>
                <View style={styles.infoItem}>
                  <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                    Cached Items
                  </Text>
                  <Text style={[styles.infoValue, { color: colors.text }]}>
                    {cacheStats.totalItems}
                  </Text>
                </View>

                <View style={styles.infoItem}>
                  <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                    Cache Size
                  </Text>
                  <Text style={[styles.infoValue, { color: colors.text }]}>
                    {formatCacheSize(cacheStats.totalSize)}
                  </Text>
                </View>

                {cacheStats.oldestItem && (
                  <View style={styles.infoItem}>
                    <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                      Oldest Item
                    </Text>
                    <Text style={[styles.infoValue, { color: colors.text }]}>
                      {new Date(cacheStats.oldestItem.timestamp).toLocaleDateString()}
                    </Text>
                  </View>
                )}

                {cacheStats.newestItem && (
                  <View style={styles.infoItem}>
                    <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                      Newest Item
                    </Text>
                    <Text style={[styles.infoValue, { color: colors.text }]}>
                      {new Date(cacheStats.newestItem.timestamp).toLocaleDateString()}
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.cacheActions}>
                <Button
                  title="Clean Expired"
                  onPress={handleCleanupCache}
                  variant="outline"
                  style={styles.cacheButton}
                />
                <Button
                  title="Clear All"
                  onPress={handleClearCache}
                  variant="outline"
                  style={styles.cacheButton}
                />
              </View>
            </Card>

            {/* Connection Tips */}
            {!networkState.isOnline && (
              <Card style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  Connection Tips
                </Text>
                
                <View style={styles.tipsList}>
                  <Text style={[styles.tipText, { color: colors.textSecondary }]}>
                    • Check your Wi-Fi or cellular connection
                  </Text>
                  <Text style={[styles.tipText, { color: colors.textSecondary }]}>
                    • Try moving to an area with better signal
                  </Text>
                  <Text style={[styles.tipText, { color: colors.textSecondary }]}>
                    • Restart your device's network settings
                  </Text>
                  <Text style={[styles.tipText, { color: colors.textSecondary }]}>
                    • Your changes will sync automatically when connected
                  </Text>
                </View>
              </Card>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 6,
  },
  statusIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  statusText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  retryText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  infoGrid: {
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  retryButton: {
    marginTop: 8,
  },
  cacheActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cacheButton: {
    flex: 1,
  },
  tipsList: {
    gap: 8,
  },
  tipText: {
    fontSize: 14,
    lineHeight: 20,
  },
});
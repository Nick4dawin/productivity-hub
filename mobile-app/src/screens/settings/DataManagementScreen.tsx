import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useTheme } from '@/contexts/ThemeContext';
import { useOffline } from '@/hooks/useOffline';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import SyncPreferences from '@/components/settings/SyncPreferences';
import PrivacySettings from '@/components/settings/PrivacySettings';

interface StorageInfo {
  totalSize: number;
  categories: {
    cache: number;
    userData: number;
    images: number;
    offline: number;
    settings: number;
  };
}

export const DataManagementScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const { clearOfflineData, syncPendingData } = useOffline();

  const [storageInfo, setStorageInfo] = useState<StorageInfo>({
    totalSize: 0,
    categories: {
      cache: 0,
      userData: 0,
      images: 0,
      offline: 0,
      settings: 0,
    },
  });
  const [isLoading, setIsLoading] = useState(false);
  const [lastClearTime, setLastClearTime] = useState<Date | null>(null);
  const [activeTab, setActiveTab] = useState<'storage' | 'sync' | 'privacy'>('storage');

  useEffect(() => {
    loadStorageInfo();
    loadLastClearTime();
  }, []);

  const loadStorageInfo = async () => {
    try {
      // In a real app, this would calculate actual storage usage
      // For now, we'll simulate storage data
      const mockStorageInfo: StorageInfo = {
        totalSize: 45.2,
        categories: {
          cache: 15.8,
          userData: 12.4,
          images: 8.9,
          offline: 5.3,
          settings: 2.8,
        },
      };
      setStorageInfo(mockStorageInfo);
    } catch (error) {
      console.error('Failed to load storage info:', error);
    }
  };

  const loadLastClearTime = async () => {
    try {
      const lastClear = await AsyncStorage.getItem('lastCacheClear');
      if (lastClear) {
        setLastClearTime(new Date(lastClear));
      }
    } catch (error) {
      console.error('Failed to load last clear time:', error);
    }
  };

  const formatSize = (sizeInMB: number): string => {
    if (sizeInMB < 1) {
      return `${(sizeInMB * 1024).toFixed(0)} KB`;
    }
    return `${sizeInMB.toFixed(1)} MB`;
  };

  const handleClearCache = async () => {
    Alert.alert(
      'Clear Cache',
      'This will remove cached images and temporary data. Your personal data will not be affected.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Clear Cache',
          onPress: performCacheClear,
        },
      ]
    );
  };

  const performCacheClear = async () => {
    setIsLoading(true);
    try {
      // Clear various cache types
      await AsyncStorage.multiRemove([
        'imageCache',
        'apiCache',
        'tempData',
      ]);

      // Update last clear time
      await AsyncStorage.setItem('lastCacheClear', new Date().toISOString());
      setLastClearTime(new Date());

      // Update storage info
      const newStorageInfo = { ...storageInfo };
      newStorageInfo.categories.cache = 0;
      newStorageInfo.totalSize -= storageInfo.categories.cache;
      setStorageInfo(newStorageInfo);

      Alert.alert('Success', 'Cache cleared successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to clear cache');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearOfflineData = async () => {
    Alert.alert(
      'Clear Offline Data',
      'This will remove all offline data. Make sure you have an internet connection to re-download your data.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Clear Offline Data',
          style: 'destructive',
          onPress: performOfflineDataClear,
        },
      ]
    );
  };

  const performOfflineDataClear = async () => {
    setIsLoading(true);
    try {
      await clearOfflineData();

      // Update storage info
      const newStorageInfo = { ...storageInfo };
      newStorageInfo.categories.offline = 0;
      newStorageInfo.totalSize -= storageInfo.categories.offline;
      setStorageInfo(newStorageInfo);

      Alert.alert('Success', 'Offline data cleared successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to clear offline data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSyncData = async () => {
    setIsLoading(true);
    try {
      await syncPendingData();
      Alert.alert('Success', 'Data synchronized successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to sync data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportData = () => {
    Alert.alert(
      'Export Data',
      'Choose export format:',
      [
        {
          text: 'JSON',
          onPress: () => exportData('json'),
        },
        {
          text: 'CSV',
          onPress: () => exportData('csv'),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  const exportData = async (format: 'json' | 'csv') => {
    try {
      // In a real implementation, this would generate and download the export
      Alert.alert(
        'Export Started',
        `Your data export in ${format.toUpperCase()} format has been started. You will receive a download link via email.`
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to start data export');
    }
  };

  const renderStorageCategory = (
    key: keyof StorageInfo['categories'],
    label: string,
    icon: string,
    description: string
  ) => (
    <View style={styles.categoryItem}>
      <View style={styles.categoryIcon}>
        <Ionicons name={icon as any} size={20} color={colors.primary} />
      </View>
      <View style={styles.categoryContent}>
        <Text style={[styles.categoryLabel, { color: colors.text }]}>
          {label}
        </Text>
        <Text style={[styles.categoryDescription, { color: colors.textSecondary }]}>
          {description}
        </Text>
      </View>
      <Text style={[styles.categorySize, { color: colors.text }]}>
        {formatSize(storageInfo.categories[key])}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Data Management
        </Text>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'storage' && { backgroundColor: colors.primary },
          ]}
          onPress={() => setActiveTab('storage')}
        >
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'storage' ? 'white' : colors.text },
            ]}
          >
            Storage
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'sync' && { backgroundColor: colors.primary },
          ]}
          onPress={() => setActiveTab('sync')}
        >
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'sync' ? 'white' : colors.text },
            ]}
          >
            Sync
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'privacy' && { backgroundColor: colors.primary },
          ]}
          onPress={() => setActiveTab('privacy')}
        >
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'privacy' ? 'white' : colors.text },
            ]}
          >
            Privacy
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'storage' && renderStorageTab()}
        {activeTab === 'sync' && <SyncPreferences />}
        {activeTab === 'privacy' && <PrivacySettings />}
      </ScrollView>
    </SafeAreaView>
  );

  const renderStorageTab = () => (
    <>
        {/* Storage Overview */}
        <Card style={styles.overviewCard}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Storage Usage
          </Text>
          
          <View style={styles.totalStorage}>
            <Ionicons name="phone-portrait" size={32} color={colors.primary} />
            <View style={styles.totalStorageContent}>
              <Text style={[styles.totalStorageSize, { color: colors.text }]}>
                {formatSize(storageInfo.totalSize)}
              </Text>
              <Text style={[styles.totalStorageLabel, { color: colors.textSecondary }]}>
                Total app storage
              </Text>
            </View>
          </View>

          <View style={styles.storageBreakdown}>
            {renderStorageCategory(
              'cache',
              'Cache',
              'layers',
              'Temporary files and cached images'
            )}
            {renderStorageCategory(
              'userData',
              'User Data',
              'person',
              'Your habits, journal entries, and goals'
            )}
            {renderStorageCategory(
              'images',
              'Images',
              'image',
              'Profile pictures and attachments'
            )}
            {renderStorageCategory(
              'offline',
              'Offline Data',
              'cloud-offline',
              'Data available when offline'
            )}
            {renderStorageCategory(
              'settings',
              'Settings',
              'settings',
              'App preferences and configuration'
            )}
          </View>
        </Card>

        {/* Cache Management */}
        <Card style={styles.managementCard}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Cache Management
          </Text>
          
          {lastClearTime && (
            <Text style={[styles.lastClearText, { color: colors.textSecondary }]}>
              Last cleared: {lastClearTime.toLocaleDateString()} at {lastClearTime.toLocaleTimeString()}
            </Text>
          )}

          <Button
            title="Clear Cache"
            onPress={handleClearCache}
            loading={isLoading}
            variant="outline"
            style={styles.actionButton}
            leftIcon="trash"
          />

          <Text style={[styles.actionDescription, { color: colors.textSecondary }]}>
            Removes temporary files and cached images. This will free up storage space but may slow down the app temporarily.
          </Text>
        </Card>

        {/* Offline Data Management */}
        <Card style={styles.managementCard}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Offline Data
          </Text>

          <Button
            title="Sync Data"
            onPress={handleSyncData}
            loading={isLoading}
            style={styles.actionButton}
            leftIcon="sync"
          />

          <Button
            title="Clear Offline Data"
            onPress={handleClearOfflineData}
            loading={isLoading}
            variant="outline"
            style={[styles.actionButton, { borderColor: colors.warning }]}
            textStyle={{ color: colors.warning }}
            leftIcon="cloud-offline"
          />

          <Text style={[styles.actionDescription, { color: colors.textSecondary }]}>
            Sync uploads any pending changes. Clearing offline data requires internet to re-download your information.
          </Text>
        </Card>

        {/* Data Export */}
        <Card style={styles.managementCard}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Data Export
          </Text>

          <Button
            title="Export All Data"
            onPress={handleExportData}
            variant="outline"
            style={styles.actionButton}
            leftIcon="download"
          />

          <Text style={[styles.actionDescription, { color: colors.textSecondary }]}>
            Download a complete copy of your data in JSON or CSV format. Useful for backups or switching to another app.
          </Text>
        </Card>

        {/* Privacy Settings */}
        <Card style={styles.managementCard}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Privacy & Data Control
          </Text>

          <View style={styles.privacyItem}>
            <Ionicons name="shield-checkmark" size={20} color={colors.success} />
            <View style={styles.privacyContent}>
              <Text style={[styles.privacyTitle, { color: colors.text }]}>
                Data Encryption
              </Text>
              <Text style={[styles.privacyDescription, { color: colors.textSecondary }]}>
                Your data is encrypted both in transit and at rest
              </Text>
            </View>
          </View>

          <View style={styles.privacyItem}>
            <Ionicons name="lock-closed" size={20} color={colors.success} />
            <View style={styles.privacyContent}>
              <Text style={[styles.privacyTitle, { color: colors.text }]}>
                Secure Storage
              </Text>
              <Text style={[styles.privacyDescription, { color: colors.textSecondary }]}>
                Sensitive data is stored using device security features
              </Text>
            </View>
          </View>

          <View style={styles.privacyItem}>
            <Ionicons name="eye-off" size={20} color={colors.success} />
            <View style={styles.privacyContent}>
              <Text style={[styles.privacyTitle, { color: colors.text }]}>
                No Data Sharing
              </Text>
              <Text style={[styles.privacyDescription, { color: colors.textSecondary }]}>
                Your personal data is never shared with third parties
              </Text>
            </View>
          </View>

          <Button
            title="View Privacy Policy"
            onPress={() => {
              Alert.alert('Privacy Policy', 'Privacy policy would open here');
            }}
            variant="outline"
            style={styles.actionButton}
            leftIcon="document-text"
          />
        </Card>
      </>
    );
  };
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    flex: 1,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FA',
    margin: 16,
    borderRadius: 8,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  overviewCard: {
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  totalStorage: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
  },
  totalStorageContent: {
    marginLeft: 16,
  },
  totalStorageSize: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  totalStorageLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  storageBreakdown: {
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    paddingTop: 16,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  categoryIcon: {
    width: 32,
    alignItems: 'center',
    marginRight: 12,
  },
  categoryContent: {
    flex: 1,
  },
  categoryLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  categoryDescription: {
    fontSize: 11,
    marginTop: 2,
  },
  categorySize: {
    fontSize: 14,
    fontWeight: '500',
  },
  managementCard: {
    padding: 16,
    marginBottom: 16,
  },
  lastClearText: {
    fontSize: 12,
    marginBottom: 16,
  },
  actionButton: {
    marginBottom: 12,
  },
  actionDescription: {
    fontSize: 12,
    lineHeight: 16,
  },
  privacyItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  privacyContent: {
    flex: 1,
    marginLeft: 12,
  },
  privacyTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  privacyDescription: {
    fontSize: 12,
    lineHeight: 16,
  },
});
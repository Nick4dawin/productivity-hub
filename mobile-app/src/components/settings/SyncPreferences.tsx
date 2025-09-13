import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useTheme } from '@/contexts/ThemeContext';
import { useOffline } from '@/hooks/useOffline';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';

interface SyncSettings {
  autoSync: boolean;
  syncOnWiFiOnly: boolean;
  syncFrequency: 'immediate' | 'hourly' | 'daily' | 'manual';
  backgroundSync: boolean;
  syncHabits: boolean;
  syncJournal: boolean;
  syncTodos: boolean;
  syncGoals: boolean;
  syncFinance: boolean;
  syncMedia: boolean;
  conflictResolution: 'server' | 'local' | 'ask';
}

const defaultSettings: SyncSettings = {
  autoSync: true,
  syncOnWiFiOnly: false,
  syncFrequency: 'immediate',
  backgroundSync: true,
  syncHabits: true,
  syncJournal: true,
  syncTodos: true,
  syncGoals: true,
  syncFinance: true,
  syncMedia: true,
  conflictResolution: 'ask',
};

const SyncPreferences: React.FC = () => {
  const { colors } = useTheme();
  const { syncPendingData, isOnline, pendingSyncCount } = useOffline();
  const [settings, setSettings] = useState<SyncSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  useEffect(() => {
    loadSettings();
    loadLastSyncTime();
  }, []);

  const loadSettings = async () => {
    try {
      const stored = await AsyncStorage.getItem('syncSettings');
      if (stored) {
        setSettings({ ...defaultSettings, ...JSON.parse(stored) });
      }
    } catch (error) {
      console.error('Failed to load sync settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadLastSyncTime = async () => {
    try {
      const lastSync = await AsyncStorage.getItem('lastSyncTime');
      if (lastSync) {
        setLastSyncTime(new Date(lastSync));
      }
    } catch (error) {
      console.error('Failed to load last sync time:', error);
    }
  };

  const saveSettings = async (newSettings: SyncSettings) => {
    try {
      await AsyncStorage.setItem('syncSettings', JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.error('Failed to save sync settings:', error);
      Alert.alert('Error', 'Failed to save sync settings');
    }
  };

  const updateSetting = (key: keyof SyncSettings, value: any) => {
    const newSettings = { ...settings, [key]: value };
    saveSettings(newSettings);
  };

  const handleManualSync = async () => {
    if (!isOnline) {
      Alert.alert('Offline', 'Please connect to the internet to sync your data');
      return;
    }

    setIsLoading(true);
    try {
      await syncPendingData();
      await AsyncStorage.setItem('lastSyncTime', new Date().toISOString());
      setLastSyncTime(new Date());
      Alert.alert('Success', 'Data synchronized successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to sync data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetSyncData = () => {
    Alert.alert(
      'Reset Sync Data',
      'This will clear all pending sync operations and reset sync settings. Are you sure?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.multiRemove([
                'syncQueue',
                'lastSyncTime',
                'syncSettings',
              ]);
              setSettings(defaultSettings);
              setLastSyncTime(null);
              Alert.alert('Success', 'Sync data has been reset');
            } catch (error) {
              Alert.alert('Error', 'Failed to reset sync data');
            }
          },
        },
      ]
    );
  };

  const getFrequencyLabel = (frequency: string) => {
    switch (frequency) {
      case 'immediate':
        return 'Immediate';
      case 'hourly':
        return 'Every hour';
      case 'daily':
        return 'Daily';
      case 'manual':
        return 'Manual only';
      default:
        return 'Immediate';
    }
  };

  const getConflictResolutionLabel = (resolution: string) => {
    switch (resolution) {
      case 'server':
        return 'Server wins';
      case 'local':
        return 'Local wins';
      case 'ask':
        return 'Ask me';
      default:
        return 'Ask me';
    }
  };

  const renderToggleSetting = (
    key: keyof SyncSettings,
    title: string,
    description: string,
    icon: string,
    disabled?: boolean
  ) => (
    <View style={[styles.settingItem, disabled && styles.disabledSetting]}>
      <View style={styles.settingIcon}>
        <Ionicons 
          name={icon as any} 
          size={20} 
          color={disabled ? colors.textSecondary : colors.primary} 
        />
      </View>
      <View style={styles.settingContent}>
        <Text style={[styles.settingTitle, { color: colors.text }]}>
          {title}
        </Text>
        <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
          {description}
        </Text>
      </View>
      <Switch
        value={settings[key] as boolean}
        onValueChange={(value) => updateSetting(key, value)}
        disabled={disabled}
        trackColor={{ false: colors.border, true: colors.primary }}
        thumbColor={settings[key] ? 'white' : colors.textSecondary}
      />
    </View>
  );

  const renderSelectSetting = (
    key: keyof SyncSettings,
    title: string,
    description: string,
    icon: string,
    options: { value: string; label: string }[],
    disabled?: boolean
  ) => (
    <TouchableOpacity 
      style={[styles.settingItem, disabled && styles.disabledSetting]}
      onPress={() => {
        if (disabled) return;
        Alert.alert(
          title,
          'Choose an option:',
          options.map(option => ({
            text: option.label,
            onPress: () => updateSetting(key, option.value),
          })).concat([{ text: 'Cancel', style: 'cancel' }])
        );
      }}
      disabled={disabled}
    >
      <View style={styles.settingIcon}>
        <Ionicons 
          name={icon as any} 
          size={20} 
          color={disabled ? colors.textSecondary : colors.primary} 
        />
      </View>
      <View style={styles.settingContent}>
        <Text style={[styles.settingTitle, { color: colors.text }]}>
          {title}
        </Text>
        <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
          {description}
        </Text>
      </View>
      <View style={styles.settingValue}>
        <Text style={[styles.valueText, { color: colors.text }]}>
          {key === 'syncFrequency' 
            ? getFrequencyLabel(settings[key] as string)
            : getConflictResolutionLabel(settings[key] as string)
          }
        </Text>
        <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <Card style={styles.container}>
        <Text style={[styles.loadingText, { color: colors.text }]}>
          Loading sync preferences...
        </Text>
      </Card>
    );
  }

  return (
    <View style={styles.container}>
      {/* Sync Status */}
      <Card style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Sync Status
        </Text>
        
        <View style={styles.statusContainer}>
          <View style={styles.statusItem}>
            <Ionicons 
              name={isOnline ? 'cloud-done' : 'cloud-offline'} 
              size={24} 
              color={isOnline ? colors.success : colors.error} 
            />
            <Text style={[styles.statusText, { color: colors.text }]}>
              {isOnline ? 'Online' : 'Offline'}
            </Text>
          </View>
          
          {pendingSyncCount > 0 && (
            <View style={styles.statusItem}>
              <Ionicons name="sync" size={24} color={colors.warning} />
              <Text style={[styles.statusText, { color: colors.text }]}>
                {pendingSyncCount} pending changes
              </Text>
            </View>
          )}
        </View>

        {lastSyncTime && (
          <Text style={[styles.lastSyncText, { color: colors.textSecondary }]}>
            Last sync: {lastSyncTime.toLocaleDateString()} at {lastSyncTime.toLocaleTimeString()}
          </Text>
        )}

        <Button
          title="Sync Now"
          onPress={handleManualSync}
          loading={isLoading}
          disabled={!isOnline}
          style={styles.syncButton}
          leftIcon="sync"
        />
      </Card>

      {/* General Sync Settings */}
      <Card style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          General Settings
        </Text>

        {renderToggleSetting(
          'autoSync',
          'Auto Sync',
          'Automatically sync changes when online',
          'sync'
        )}

        {renderToggleSetting(
          'syncOnWiFiOnly',
          'WiFi Only',
          'Only sync when connected to WiFi',
          'wifi',
          !settings.autoSync
        )}

        {renderToggleSetting(
          'backgroundSync',
          'Background Sync',
          'Sync data when app is in background',
          'cloud-upload',
          !settings.autoSync
        )}

        {renderSelectSetting(
          'syncFrequency',
          'Sync Frequency',
          'How often to sync your data',
          'time',
          [
            { value: 'immediate', label: 'Immediate' },
            { value: 'hourly', label: 'Every hour' },
            { value: 'daily', label: 'Daily' },
            { value: 'manual', label: 'Manual only' },
          ],
          !settings.autoSync
        )}
      </Card>

      {/* Data Type Settings */}
      <Card style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Data Types to Sync
        </Text>

        {renderToggleSetting(
          'syncHabits',
          'Habits',
          'Sync habit data and completion status',
          'repeat',
          !settings.autoSync
        )}

        {renderToggleSetting(
          'syncJournal',
          'Journal',
          'Sync journal entries and mood data',
          'book',
          !settings.autoSync
        )}

        {renderToggleSetting(
          'syncTodos',
          'Tasks',
          'Sync todo items and completion status',
          'checkmark-circle',
          !settings.autoSync
        )}

        {renderToggleSetting(
          'syncGoals',
          'Goals',
          'Sync goals and milestone progress',
          'flag',
          !settings.autoSync
        )}

        {renderToggleSetting(
          'syncFinance',
          'Finance',
          'Sync financial data and budgets',
          'card',
          !settings.autoSync
        )}

        {renderToggleSetting(
          'syncMedia',
          'Media',
          'Sync media tracking and progress',
          'play-circle',
          !settings.autoSync
        )}
      </Card>

      {/* Conflict Resolution */}
      <Card style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Conflict Resolution
        </Text>
        
        <Text style={[styles.sectionDescription, { color: colors.textSecondary }]}>
          What to do when the same data is changed on multiple devices
        </Text>

        {renderSelectSetting(
          'conflictResolution',
          'When conflicts occur',
          'How to resolve data conflicts',
          'git-merge',
          [
            { value: 'server', label: 'Server wins (use cloud version)' },
            { value: 'local', label: 'Local wins (use device version)' },
            { value: 'ask', label: 'Ask me each time' },
          ]
        )}
      </Card>

      {/* Advanced Options */}
      <Card style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Advanced Options
        </Text>

        <Button
          title="Reset Sync Data"
          onPress={handleResetSyncData}
          variant="outline"
          style={[styles.resetButton, { borderColor: colors.error }]}
          textStyle={{ color: colors.error }}
          leftIcon="refresh"
        />

        <Text style={[styles.resetDescription, { color: colors.textSecondary }]}>
          This will clear all pending sync operations and reset sync settings to defaults.
        </Text>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    marginBottom: 16,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  sectionDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  statusItem: {
    alignItems: 'center',
  },
  statusText: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  lastSyncText: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 16,
  },
  syncButton: {
    marginTop: 8,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  disabledSetting: {
    opacity: 0.5,
  },
  settingIcon: {
    width: 32,
    alignItems: 'center',
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 12,
    lineHeight: 16,
  },
  settingValue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  valueText: {
    fontSize: 14,
    fontWeight: '500',
    marginRight: 4,
  },
  resetButton: {
    marginBottom: 12,
  },
  resetDescription: {
    fontSize: 12,
    lineHeight: 16,
  },
  loadingText: {
    textAlign: 'center',
    fontSize: 16,
    padding: 20,
  },
});

export default SyncPreferences;
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  Alert,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useTheme } from '@/contexts/ThemeContext';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';

interface PrivacySettings {
  analyticsEnabled: boolean;
  crashReportingEnabled: boolean;
  personalizedAds: boolean;
  dataCollection: boolean;
  locationTracking: boolean;
  biometricAuth: boolean;
  autoLock: boolean;
  autoLockTimeout: number; // in minutes
  shareUsageData: boolean;
  marketingEmails: boolean;
  productUpdates: boolean;
}

const defaultSettings: PrivacySettings = {
  analyticsEnabled: true,
  crashReportingEnabled: true,
  personalizedAds: false,
  dataCollection: true,
  locationTracking: false,
  biometricAuth: false,
  autoLock: false,
  autoLockTimeout: 5,
  shareUsageData: false,
  marketingEmails: false,
  productUpdates: true,
};

const PrivacySettings: React.FC = () => {
  const { colors } = useTheme();
  const [settings, setSettings] = useState<PrivacySettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const stored = await AsyncStorage.getItem('privacySettings');
      if (stored) {
        setSettings({ ...defaultSettings, ...JSON.parse(stored) });
      }
    } catch (error) {
      console.error('Failed to load privacy settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async (newSettings: PrivacySettings) => {
    try {
      await AsyncStorage.setItem('privacySettings', JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.error('Failed to save privacy settings:', error);
      Alert.alert('Error', 'Failed to save privacy settings');
    }
  };

  const updateSetting = (key: keyof PrivacySettings, value: any) => {
    const newSettings = { ...settings, [key]: value };
    saveSettings(newSettings);
  };

  const handleDataDeletion = () => {
    Alert.alert(
      'Delete All Data',
      'This will permanently delete all your data from our servers. This action cannot be undone. Are you sure?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete All Data',
          style: 'destructive',
          onPress: () => {
            // In a real app, this would call the API to delete user data
            Alert.alert(
              'Data Deletion Requested',
              'Your data deletion request has been submitted. You will receive a confirmation email within 24 hours.'
            );
          },
        },
      ]
    );
  };

  const handleDataExport = () => {
    Alert.alert(
      'Export Personal Data',
      'We will prepare a complete export of your personal data and send you a download link via email.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Request Export',
          onPress: () => {
            // In a real app, this would call the API to generate data export
            Alert.alert(
              'Export Requested',
              'Your data export has been requested. You will receive a download link via email within 24 hours.'
            );
          },
        },
      ]
    );
  };

  const openPrivacyPolicy = () => {
    Linking.openURL('https://example.com/privacy-policy');
  };

  const openTermsOfService = () => {
    Linking.openURL('https://example.com/terms-of-service');
  };

  const getAutoLockTimeoutLabel = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} minutes`;
    }
    const hours = Math.floor(minutes / 60);
    return hours === 1 ? '1 hour' : `${hours} hours`;
  };

  const renderToggleSetting = (
    key: keyof PrivacySettings,
    title: string,
    description: string,
    icon: string,
    requiresConfirmation?: boolean
  ) => (
    <View style={styles.settingItem}>
      <View style={styles.settingIcon}>
        <Ionicons name={icon as any} size={20} color={colors.primary} />
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
        onValueChange={(value) => {
          if (requiresConfirmation && value) {
            Alert.alert(
              'Confirm',
              `Are you sure you want to enable ${title.toLowerCase()}?`,
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Enable', onPress: () => updateSetting(key, value) },
              ]
            );
          } else {
            updateSetting(key, value);
          }
        }}
        trackColor={{ false: colors.border, true: colors.primary }}
        thumbColor={settings[key] ? 'white' : colors.textSecondary}
      />
    </View>
  );

  const renderSelectSetting = (
    key: keyof PrivacySettings,
    title: string,
    description: string,
    icon: string,
    options: { value: number; label: string }[]
  ) => (
    <TouchableOpacity 
      style={styles.settingItem}
      onPress={() => {
        Alert.alert(
          title,
          'Choose timeout duration:',
          options.map(option => ({
            text: option.label,
            onPress: () => updateSetting(key, option.value),
          })).concat([{ text: 'Cancel', style: 'cancel' }])
        );
      }}
    >
      <View style={styles.settingIcon}>
        <Ionicons name={icon as any} size={20} color={colors.primary} />
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
          {getAutoLockTimeoutLabel(settings[key] as number)}
        </Text>
        <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <Card style={styles.container}>
        <Text style={[styles.loadingText, { color: colors.text }]}>
          Loading privacy settings...
        </Text>
      </Card>
    );
  }

  return (
    <View style={styles.container}>
      {/* Data Collection */}
      <Card style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Data Collection
        </Text>

        {renderToggleSetting(
          'analyticsEnabled',
          'Analytics',
          'Help improve the app by sharing anonymous usage data',
          'analytics'
        )}

        {renderToggleSetting(
          'crashReportingEnabled',
          'Crash Reporting',
          'Automatically send crash reports to help fix bugs',
          'bug'
        )}

        {renderToggleSetting(
          'shareUsageData',
          'Usage Statistics',
          'Share app usage patterns for product improvement',
          'stats-chart'
        )}

        {renderToggleSetting(
          'locationTracking',
          'Location Services',
          'Allow location-based features and insights',
          'location',
          true
        )}
      </Card>

      {/* Security */}
      <Card style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Security & Authentication
        </Text>

        {renderToggleSetting(
          'biometricAuth',
          'Biometric Authentication',
          'Use fingerprint or face recognition to unlock the app',
          'finger-print'
        )}

        {renderToggleSetting(
          'autoLock',
          'Auto Lock',
          'Automatically lock the app after inactivity',
          'lock-closed'
        )}

        {settings.autoLock && renderSelectSetting(
          'autoLockTimeout',
          'Auto Lock Timeout',
          'Time before the app automatically locks',
          'time',
          [
            { value: 1, label: '1 minute' },
            { value: 5, label: '5 minutes' },
            { value: 15, label: '15 minutes' },
            { value: 30, label: '30 minutes' },
            { value: 60, label: '1 hour' },
          ]
        )}
      </Card>

      {/* Communications */}
      <Card style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Communications
        </Text>

        {renderToggleSetting(
          'marketingEmails',
          'Marketing Emails',
          'Receive promotional emails and special offers',
          'mail'
        )}

        {renderToggleSetting(
          'productUpdates',
          'Product Updates',
          'Get notified about new features and updates',
          'notifications'
        )}
      </Card>

      {/* Advertising */}
      <Card style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Advertising
        </Text>

        {renderToggleSetting(
          'personalizedAds',
          'Personalized Ads',
          'Show ads based on your interests and activity',
          'megaphone'
        )}

        <View style={styles.adInfo}>
          <Ionicons name="information-circle" size={16} color={colors.info} />
          <Text style={[styles.adInfoText, { color: colors.textSecondary }]}>
            We do not currently show ads, but this setting will apply if we introduce advertising in the future.
          </Text>
        </View>
      </Card>

      {/* Data Rights */}
      <Card style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Your Data Rights
        </Text>

        <Text style={[styles.sectionDescription, { color: colors.textSecondary }]}>
          You have the right to access, export, or delete your personal data at any time.
        </Text>

        <Button
          title="Export My Data"
          onPress={handleDataExport}
          variant="outline"
          style={styles.dataButton}
          leftIcon="download"
        />

        <Button
          title="Delete All My Data"
          onPress={handleDataDeletion}
          variant="outline"
          style={[styles.dataButton, { borderColor: colors.error }]}
          textStyle={{ color: colors.error }}
          leftIcon="trash"
        />
      </Card>

      {/* Legal */}
      <Card style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Legal Information
        </Text>

        <TouchableOpacity style={styles.legalItem} onPress={openPrivacyPolicy}>
          <Ionicons name="shield-checkmark" size={20} color={colors.primary} />
          <Text style={[styles.legalText, { color: colors.text }]}>
            Privacy Policy
          </Text>
          <Ionicons name="open" size={16} color={colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.legalItem} onPress={openTermsOfService}>
          <Ionicons name="document-text" size={20} color={colors.primary} />
          <Text style={[styles.legalText, { color: colors.text }]}>
            Terms of Service
          </Text>
          <Ionicons name="open" size={16} color={colors.textSecondary} />
        </TouchableOpacity>

        <View style={styles.complianceInfo}>
          <Text style={[styles.complianceText, { color: colors.textSecondary }]}>
            This app complies with GDPR, CCPA, and other privacy regulations. 
            Your data is encrypted and stored securely.
          </Text>
        </View>
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
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
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
  adInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 12,
    padding: 12,
    backgroundColor: '#F0F8FF',
    borderRadius: 8,
  },
  adInfoText: {
    fontSize: 12,
    lineHeight: 16,
    marginLeft: 8,
    flex: 1,
  },
  dataButton: {
    marginBottom: 12,
  },
  legalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  legalText: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
    marginLeft: 12,
  },
  complianceInfo: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
  },
  complianceText: {
    fontSize: 12,
    lineHeight: 16,
    textAlign: 'center',
  },
  loadingText: {
    textAlign: 'center',
    fontSize: 16,
    padding: 20,
  },
});

export default PrivacySettings;
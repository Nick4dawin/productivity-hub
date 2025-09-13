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

import { useTheme } from '../../contexts/ThemeContext';
import { notificationService } from '../../services/NotificationService';

import Card from '../common/Card';
import Button from '../common/Button';

interface NotificationSettings {
  enabled: boolean;
  todos: boolean;
  habits: boolean;
  goals: boolean;
  routines: boolean;
  goalDeadlines: boolean;
  goalCheckIns: boolean;
  routineReminders: boolean;
  milestoneAchievements: boolean;
  dailySummary: boolean;
  // Timing preferences
  morningRoutineTime: string;
  eveningRoutineTime: string;
  goalCheckInDay: number; // 0 = Sunday, 1 = Monday, etc.
  goalCheckInTime: string;
  dailySummaryTime: string;
}

const defaultSettings: NotificationSettings = {
  enabled: true,
  todos: true,
  habits: true,
  goals: true,
  routines: true,
  goalDeadlines: true,
  goalCheckIns: true,
  routineReminders: true,
  milestoneAchievements: true,
  dailySummary: true,
  morningRoutineTime: '07:00',
  eveningRoutineTime: '21:00',
  goalCheckInDay: 0, // Sunday
  goalCheckInTime: '19:00',
  dailySummaryTime: '20:00',
};

const NotificationPreferences: React.FC = () => {
  const { theme } = useTheme();
  const [settings, setSettings] = useState<NotificationSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const stored = await AsyncStorage.getItem('notificationSettings');
      if (stored) {
        setSettings({ ...defaultSettings, ...JSON.parse(stored) });
      }
    } catch (error) {
      console.error('Failed to load notification settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async (newSettings: NotificationSettings) => {
    try {
      await AsyncStorage.setItem('notificationSettings', JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.error('Failed to save notification settings:', error);
      Alert.alert('Error', 'Failed to save notification settings');
    }
  };

  const updateSetting = (key: keyof NotificationSettings, value: any) => {
    const newSettings = { ...settings, [key]: value };
    saveSettings(newSettings);
  };

  const requestPermissions = async () => {
    const granted = await notificationService.requestPermissions();
    if (granted) {
      updateSetting('enabled', true);
      Alert.alert('Success', 'Notification permissions granted');
    } else {
      Alert.alert(
        'Permissions Required',
        'Please enable notifications in your device settings to receive reminders'
      );
    }
  };

  const testNotification = () => {
    notificationService.showNotification(
      'Test Notification',
      'This is a test notification from your productivity app!'
    );
  };

  const getDayName = (dayIndex: number) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayIndex];
  };

  const renderToggleSetting = (
    key: keyof NotificationSettings,
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
          color={disabled ? theme.colors.textSecondary : theme.colors.primary} 
        />
      </View>
      <View style={styles.settingContent}>
        <Text style={[styles.settingTitle, { color: theme.colors.text }]}>
          {title}
        </Text>
        <Text style={[styles.settingDescription, { color: theme.colors.textSecondary }]}>
          {description}
        </Text>
      </View>
      <Switch
        value={settings[key] as boolean}
        onValueChange={(value) => updateSetting(key, value)}
        disabled={disabled || !settings.enabled}
        trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
        thumbColor={settings[key] ? 'white' : theme.colors.textSecondary}
      />
    </View>
  );

  const renderTimeSetting = (
    key: keyof NotificationSettings,
    title: string,
    description: string,
    icon: string
  ) => (
    <TouchableOpacity 
      style={styles.settingItem}
      onPress={() => {
        // In a real app, this would open a time picker
        Alert.alert('Time Picker', 'Time picker would open here');
      }}
      disabled={!settings.enabled}
    >
      <View style={styles.settingIcon}>
        <Ionicons 
          name={icon as any} 
          size={20} 
          color={settings.enabled ? theme.colors.primary : theme.colors.textSecondary} 
        />
      </View>
      <View style={styles.settingContent}>
        <Text style={[styles.settingTitle, { color: theme.colors.text }]}>
          {title}
        </Text>
        <Text style={[styles.settingDescription, { color: theme.colors.textSecondary }]}>
          {description}
        </Text>
      </View>
      <View style={styles.timeValue}>
        <Text style={[styles.timeText, { color: theme.colors.text }]}>
          {settings[key] as string}
        </Text>
        <Ionicons name="chevron-forward" size={16} color={theme.colors.textSecondary} />
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <Card style={styles.container}>
        <Text style={[styles.loadingText, { color: theme.colors.text }]}>
          Loading notification preferences...
        </Text>
      </Card>
    );
  }

  return (
    <View style={styles.container}>
      {/* Master Toggle */}
      <Card style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Notifications
        </Text>
        
        {renderToggleSetting(
          'enabled',
          'Enable Notifications',
          'Receive reminders and updates from the app',
          'notifications'
        )}

        {!settings.enabled && (
          <Button
            title="Enable Notifications"
            onPress={requestPermissions}
            style={styles.enableButton}
          />
        )}
      </Card>

      {/* Category Settings */}
      <Card style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Notification Types
        </Text>

        {renderToggleSetting(
          'todos',
          'Task Reminders',
          'Get notified about due dates and overdue tasks',
          'checkmark-circle-outline',
          !settings.enabled
        )}

        {renderToggleSetting(
          'habits',
          'Habit Reminders',
          'Daily reminders to complete your habits',
          'repeat-outline',
          !settings.enabled
        )}

        {renderToggleSetting(
          'goals',
          'Goal Notifications',
          'Updates about goal progress and milestones',
          'flag-outline',
          !settings.enabled
        )}

        {renderToggleSetting(
          'routines',
          'Routine Reminders',
          'Notifications to start your daily routines',
          'time-outline',
          !settings.enabled
        )}
      </Card>

      {/* Goal-Specific Settings */}
      {settings.enabled && settings.goals && (
        <Card style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Goal Notifications
          </Text>

          {renderToggleSetting(
            'goalDeadlines',
            'Deadline Reminders',
            'Get notified when goal deadlines are approaching',
            'alarm-outline'
          )}

          {renderToggleSetting(
            'goalCheckIns',
            'Weekly Check-ins',
            'Weekly reminders to update your goal progress',
            'calendar-outline'
          )}

          {renderToggleSetting(
            'milestoneAchievements',
            'Milestone Celebrations',
            'Celebrate when you complete goal milestones',
            'trophy-outline'
          )}

          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => {
              Alert.alert('Day Picker', 'Day picker would open here');
            }}
          >
            <View style={styles.settingIcon}>
              <Ionicons name="calendar" size={20} color={theme.colors.primary} />
            </View>
            <View style={styles.settingContent}>
              <Text style={[styles.settingTitle, { color: theme.colors.text }]}>
                Check-in Day
              </Text>
              <Text style={[styles.settingDescription, { color: theme.colors.textSecondary }]}>
                Day of the week for goal check-ins
              </Text>
            </View>
            <View style={styles.timeValue}>
              <Text style={[styles.timeText, { color: theme.colors.text }]}>
                {getDayName(settings.goalCheckInDay)}
              </Text>
              <Ionicons name="chevron-forward" size={16} color={theme.colors.textSecondary} />
            </View>
          </TouchableOpacity>

          {renderTimeSetting(
            'goalCheckInTime',
            'Check-in Time',
            'Time for weekly goal check-in reminders',
            'time'
          )}
        </Card>
      )}

      {/* Routine-Specific Settings */}
      {settings.enabled && settings.routines && (
        <Card style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Routine Reminders
          </Text>

          {renderToggleSetting(
            'routineReminders',
            'Daily Reminders',
            'Get notified when it\'s time to start your routines',
            'refresh-outline'
          )}

          {renderTimeSetting(
            'morningRoutineTime',
            'Morning Routine Time',
            'Default time for morning routine reminders',
            'sunny'
          )}

          {renderTimeSetting(
            'eveningRoutineTime',
            'Evening Routine Time',
            'Default time for evening routine reminders',
            'moon'
          )}
        </Card>
      )}

      {/* Other Settings */}
      <Card style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Other Notifications
        </Text>

        {renderToggleSetting(
          'dailySummary',
          'Daily Summary',
          'End-of-day productivity summary and planning',
          'analytics-outline',
          !settings.enabled
        )}

        {settings.enabled && settings.dailySummary && renderTimeSetting(
          'dailySummaryTime',
          'Summary Time',
          'Time for daily productivity summary',
          'time'
        )}
      </Card>

      {/* Test Notification */}
      {settings.enabled && (
        <Card style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Test Notifications
          </Text>
          <Text style={[styles.sectionDescription, { color: theme.colors.textSecondary }]}>
            Send a test notification to make sure everything is working
          </Text>
          <Button
            title="Send Test Notification"
            onPress={testNotification}
            variant="outline"
            style={styles.testButton}
          />
        </Card>
      )}
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
  timeValue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 14,
    fontWeight: '500',
    marginRight: 4,
  },
  enableButton: {
    marginTop: 12,
  },
  testButton: {
    marginTop: 8,
  },
  loadingText: {
    textAlign: 'center',
    fontSize: 16,
    padding: 20,
  },
});

export default NotificationPreferences;
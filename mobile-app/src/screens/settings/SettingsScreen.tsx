import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import NotificationPreferences from '@/components/settings/NotificationPreferences';

interface SettingItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: string;
  type: 'navigation' | 'toggle' | 'action';
  value?: boolean;
  onPress?: () => void;
  onToggle?: (value: boolean) => void;
  destructive?: boolean;
}

export const SettingsScreen: React.FC = () => {
  const { theme, colors, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const navigation = useNavigation();
  const [showNotifications, setShowNotifications] = useState(false);

  const handleDataExport = async () => {
    try {
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
    } catch (error) {
      Alert.alert('Error', 'Failed to export data');
    }
  };

  const exportData = async (format: 'json' | 'csv') => {
    try {
      // In a real implementation, this would call the API to generate export
      const exportUrl = `https://api.example.com/export?format=${format}&userId=${user?._id}`;
      
      await Share.share({
        message: `Your productivity data export is ready: ${exportUrl}`,
        title: 'Data Export',
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share export link');
    }
  };

  const handleBackup = () => {
    Alert.alert(
      'Backup Data',
      'Your data is automatically backed up to the cloud. You can also create a manual backup.',
      [
        {
          text: 'Create Manual Backup',
          onPress: () => {
            // In a real implementation, this would trigger a backup
            Alert.alert('Success', 'Manual backup created successfully');
          },
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: logout,
        },
      ]
    );
  };

  const generalSettings: SettingItem[] = [
    {
      id: 'theme',
      title: 'Dark Mode',
      subtitle: 'Switch between light and dark themes',
      icon: theme === 'dark' ? 'moon' : 'sunny',
      type: 'toggle',
      value: theme === 'dark',
      onToggle: toggleTheme,
    },
    {
      id: 'notifications',
      title: 'Notifications',
      subtitle: 'Manage notification preferences',
      icon: 'notifications',
      type: 'navigation',
      onPress: () => setShowNotifications(true),
    },
  ];

  const accountSettings: SettingItem[] = [
    {
      id: 'profile',
      title: 'Edit Profile',
      subtitle: 'Update your personal information',
      icon: 'person',
      type: 'navigation',
      onPress: () => navigation.navigate('Profile' as never),
    },
    {
      id: 'password',
      title: 'Change Password',
      subtitle: 'Update your account password',
      icon: 'lock-closed',
      type: 'navigation',
      onPress: () => navigation.navigate('ChangePassword' as never),
    },
  ];

  const dataSettings: SettingItem[] = [
    {
      id: 'export',
      title: 'Export Data',
      subtitle: 'Download your data in JSON or CSV format',
      icon: 'download',
      type: 'action',
      onPress: handleDataExport,
    },
    {
      id: 'backup',
      title: 'Backup & Sync',
      subtitle: 'Manage data backup and synchronization',
      icon: 'cloud',
      type: 'action',
      onPress: handleBackup,
    },
    {
      id: 'cache',
      title: 'Clear Cache',
      subtitle: 'Free up storage space',
      icon: 'trash',
      type: 'action',
      onPress: () => navigation.navigate('DataManagement' as never),
    },
  ];

  const supportSettings: SettingItem[] = [
    {
      id: 'help',
      title: 'Help & Support',
      subtitle: 'Get help and contact support',
      icon: 'help-circle',
      type: 'navigation',
      onPress: () => {
        // In a real app, this would open help/support
        Alert.alert('Help', 'Help & Support coming soon');
      },
    },
    {
      id: 'privacy',
      title: 'Privacy Policy',
      subtitle: 'View our privacy policy',
      icon: 'shield-checkmark',
      type: 'navigation',
      onPress: () => {
        // In a real app, this would open privacy policy
        Alert.alert('Privacy', 'Privacy Policy coming soon');
      },
    },
    {
      id: 'terms',
      title: 'Terms of Service',
      subtitle: 'View terms and conditions',
      icon: 'document-text',
      type: 'navigation',
      onPress: () => {
        // In a real app, this would open terms
        Alert.alert('Terms', 'Terms of Service coming soon');
      },
    },
  ];

  const dangerSettings: SettingItem[] = [
    {
      id: 'logout',
      title: 'Sign Out',
      subtitle: 'Sign out of your account',
      icon: 'log-out',
      type: 'action',
      onPress: handleLogout,
      destructive: true,
    },
    {
      id: 'delete',
      title: 'Delete Account',
      subtitle: 'Permanently delete your account and data',
      icon: 'trash',
      type: 'navigation',
      onPress: () => navigation.navigate('DeleteAccount' as never),
      destructive: true,
    },
  ];

  const renderSettingItem = (item: SettingItem) => (
    <TouchableOpacity
      key={item.id}
      style={styles.settingItem}
      onPress={item.onPress}
      disabled={item.type === 'toggle'}
    >
      <View style={styles.settingIcon}>
        <Ionicons
          name={item.icon as any}
          size={20}
          color={item.destructive ? colors.error : colors.primary}
        />
      </View>
      <View style={styles.settingContent}>
        <Text
          style={[
            styles.settingTitle,
            { color: item.destructive ? colors.error : colors.text },
          ]}
        >
          {item.title}
        </Text>
        {item.subtitle && (
          <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>
            {item.subtitle}
          </Text>
        )}
      </View>
      <View style={styles.settingAction}>
        {item.type === 'toggle' && (
          <Switch
            value={item.value}
            onValueChange={item.onToggle}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={item.value ? 'white' : colors.textSecondary}
          />
        )}
        {item.type === 'navigation' && (
          <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
        )}
      </View>
    </TouchableOpacity>
  );

  const renderSettingSection = (title: string, items: SettingItem[]) => (
    <Card style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
      {items.map(renderSettingItem)}
    </Card>
  );

  if (showNotifications) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setShowNotifications(false)}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Notification Preferences
          </Text>
        </View>
        <ScrollView style={styles.content}>
          <NotificationPreferences />
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Settings</Text>
      </View>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* User Info */}
        <Card style={styles.userCard}>
          <View style={styles.userInfo}>
            <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
              <Text style={styles.avatarText}>
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </Text>
            </View>
            <View style={styles.userDetails}>
              <Text style={[styles.userName, { color: colors.text }]}>
                {user?.name || 'User'}
              </Text>
              <Text style={[styles.userEmail, { color: colors.textSecondary }]}>
                {user?.email || 'user@example.com'}
              </Text>
            </View>
          </View>
        </Card>

        {/* Settings Sections */}
        {renderSettingSection('General', generalSettings)}
        {renderSettingSection('Account', accountSettings)}
        {renderSettingSection('Data & Privacy', dataSettings)}
        {renderSettingSection('Support', supportSettings)}
        {renderSettingSection('Account Actions', dangerSettings)}

        {/* App Version */}
        <View style={styles.versionInfo}>
          <Text style={[styles.versionText, { color: colors.textSecondary }]}>
            Version 1.0.0
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
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
  content: {
    flex: 1,
    padding: 16,
  },
  userCard: {
    marginBottom: 24,
    padding: 16,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    color: 'white',
    fontSize: 24,
    fontWeight: '600',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
  },
  section: {
    marginBottom: 16,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
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
  settingSubtitle: {
    fontSize: 12,
    lineHeight: 16,
  },
  settingAction: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  versionInfo: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  versionText: {
    fontSize: 12,
  },
});
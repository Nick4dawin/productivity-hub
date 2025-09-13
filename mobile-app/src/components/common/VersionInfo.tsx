import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import { useTheme } from '@/contexts/ThemeContext';

interface VersionInfoProps {
  showBuildNumber?: boolean;
  style?: any;
}

export const VersionInfo: React.FC<VersionInfoProps> = ({ 
  showBuildNumber = false, 
  style 
}) => {
  const { colors } = useTheme();
  const version = DeviceInfo.getVersion();
  const buildNumber = DeviceInfo.getBuildNumber();

  return (
    <View style={[styles.container, style]}>
      <Text style={[styles.versionText, { color: colors.textSecondary }]}>
        Version {version}
        {showBuildNumber && ` (${buildNumber})`}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  versionText: {
    fontSize: 12,
    fontWeight: '400',
  },
});
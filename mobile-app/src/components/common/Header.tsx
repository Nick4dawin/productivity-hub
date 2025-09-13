import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '@/contexts/ThemeContext';

export interface HeaderProps {
  title: string;
  subtitle?: string;
  leftIcon?: string;
  rightIcon?: string;
  onLeftPress?: () => void;
  onRightPress?: () => void;
  rightAction?: {
    icon: string;
    onPress: () => void;
  };
  showBackButton?: boolean;
  style?: ViewStyle;
  titleStyle?: TextStyle;
  subtitleStyle?: TextStyle;
  backgroundColor?: string;
  testID?: string;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  leftIcon,
  rightIcon,
  onLeftPress,
  onRightPress,
  rightAction,
  showBackButton = false,
  style,
  titleStyle,
  subtitleStyle,
  backgroundColor,
  testID,
}) => {
  const { colors } = useTheme();

  const getLeftIcon = () => {
    if (showBackButton) return 'arrow-back';
    return leftIcon;
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: backgroundColor || colors.surface },
        style,
      ]}
      edges={['top']}
      testID={testID}
    >
      <View style={styles.header}>
        <View style={styles.leftSection}>
          {(getLeftIcon() || onLeftPress) && (
            <TouchableOpacity
              style={styles.iconButton}
              onPress={onLeftPress}
              testID={`${testID}-left-button`}
            >
              <Icon
                name={getLeftIcon() || 'menu'}
                size={24}
                color={colors.text}
              />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.centerSection}>
          <Text
            style={[styles.title, { color: colors.text }, titleStyle]}
            numberOfLines={1}
          >
            {title}
          </Text>
          {subtitle && (
            <Text
              style={[
                styles.subtitle,
                { color: colors.textSecondary },
                subtitleStyle,
              ]}
              numberOfLines={1}
            >
              {subtitle}
            </Text>
          )}
        </View>

        <View style={styles.rightSection}>
          {rightAction && (
            <TouchableOpacity
              style={styles.iconButton}
              onPress={rightAction.onPress}
              testID={`${testID}-right-action`}
            >
              {rightAction.icon === '+' ? (
                <Text style={[styles.addIcon, { color: colors.text }]}>+</Text>
              ) : (
                <Icon
                  name={rightAction.icon}
                  size={24}
                  color={colors.text}
                />
              )}
            </TouchableOpacity>
          )}
          {!rightAction && (rightIcon || onRightPress) && (
            <TouchableOpacity
              style={styles.iconButton}
              onPress={onRightPress}
              testID={`${testID}-right-button`}
            >
              <Icon
                name={rightIcon || 'more-vert'}
                size={24}
                color={colors.text}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 56,
  },
  leftSection: {
    width: 40,
    alignItems: 'flex-start',
  },
  centerSection: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  rightSection: {
    width: 40,
    alignItems: 'flex-end',
  },
  iconButton: {
    padding: 8,
    borderRadius: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 2,
    textAlign: 'center',
  },
  addIcon: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});
import React from 'react';
import {
  View,
  ActivityIndicator,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

export interface LoadingSpinnerProps {
  size?: 'small' | 'large';
  color?: string;
  text?: string;
  overlay?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  testID?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'large',
  color,
  text,
  overlay = false,
  style,
  textStyle,
  testID,
}) => {
  const { colors } = useTheme();

  const containerStyle = overlay
    ? [styles.overlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]
    : [styles.container, { backgroundColor: colors.background }];

  return (
    <View style={[containerStyle, style]} testID={testID}>
      <ActivityIndicator
        size={size}
        color={color || colors.primary}
        testID={`${testID}-spinner`}
      />
      {text && (
        <Text
          style={[
            styles.text,
            { color: overlay ? '#FFFFFF' : colors.text },
            textStyle,
          ]}
        >
          {text}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  text: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
  },
});
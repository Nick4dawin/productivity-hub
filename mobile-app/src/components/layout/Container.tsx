import React from 'react';
import { View, ViewStyle } from 'react-native';
import { SafeAreaView, Edge } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';

export interface ContainerProps {
  children: React.ReactNode;
  safe?: boolean;
  edges?: readonly Edge[];
  padding?: 'none' | 'small' | 'medium' | 'large';
  backgroundColor?: string;
  style?: ViewStyle;
  testID?: string;
}

export const Container: React.FC<ContainerProps> = ({
  children,
  safe = true,
  edges = ['top', 'bottom'],
  padding = 'medium',
  backgroundColor,
  style,
  testID,
}) => {
  const { colors } = useTheme();

  const getContainerStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      flex: 1,
      backgroundColor: backgroundColor || colors.background,
    };

    // Padding styles
    switch (padding) {
      case 'small':
        baseStyle.padding = 8;
        break;
      case 'large':
        baseStyle.padding = 24;
        break;
      case 'medium':
        baseStyle.padding = 16;
        break;
      default: // none
        baseStyle.padding = 0;
    }

    return baseStyle;
  };

  const containerStyle = [getContainerStyle(), style];

  if (safe) {
    return (
      <SafeAreaView style={containerStyle} edges={edges} testID={testID}>
        {children}
      </SafeAreaView>
    );
  }

  return (
    <View style={containerStyle} testID={testID}>
      {children}
    </View>
  );
};
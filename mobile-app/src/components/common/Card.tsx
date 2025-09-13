import React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  TouchableOpacity,
  TouchableOpacityProps,
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

export interface CardProps extends TouchableOpacityProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'none' | 'small' | 'medium' | 'large';
  margin?: 'none' | 'small' | 'medium' | 'large';
  style?: ViewStyle;
  touchable?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'medium',
  margin = 'none',
  style,
  touchable = false,
  ...touchableProps
}) => {
  const { colors } = useTheme();

  const getCardStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: 12,
      backgroundColor: colors.surface,
    };

    // Variant styles
    switch (variant) {
      case 'elevated':
        baseStyle.shadowColor = colors.text;
        baseStyle.shadowOffset = { width: 0, height: 2 };
        baseStyle.shadowOpacity = 0.1;
        baseStyle.shadowRadius = 4;
        baseStyle.elevation = 3;
        break;
      case 'outlined':
        baseStyle.borderWidth = 1;
        baseStyle.borderColor = colors.border;
        break;
      default: // default
        // No additional styles
        break;
    }

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

    // Margin styles
    switch (margin) {
      case 'small':
        baseStyle.margin = 8;
        break;
      case 'large':
        baseStyle.margin = 24;
        break;
      case 'medium':
        baseStyle.margin = 16;
        break;
      default: // none
        baseStyle.margin = 0;
    }

    return baseStyle;
  };

  const cardStyle = [getCardStyle(), style];

  if (touchable) {
    return (
      <TouchableOpacity
        style={cardStyle}
        activeOpacity={0.7}
        {...touchableProps}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={cardStyle}>{children}</View>;
};
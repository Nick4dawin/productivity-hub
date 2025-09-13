import React, { useRef } from 'react';
import {
  TouchableOpacity,
  Animated,
  ViewStyle,
  TextStyle,
  Text,
  StyleSheet,
} from 'react-native';
import { hapticService } from '../../services/HapticService';
import { AnimationService } from '../../services/AnimationService';
import { useTheme } from '../../contexts/ThemeContext';

interface AnimatedButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  hapticType?: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';
  animationType?: 'scale' | 'bounce' | 'pulse' | 'none';
  children?: React.ReactNode;
}

const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
  hapticType = 'light',
  animationType = 'scale',
  children,
}) => {
  const { theme } = useTheme();
  const scaleValue = useRef(new Animated.Value(1)).current;
  const opacityValue = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (disabled || loading) return;

    // Trigger haptic feedback
    switch (hapticType) {
      case 'light':
        hapticService.light();
        break;
      case 'medium':
        hapticService.medium();
        break;
      case 'heavy':
        hapticService.heavy();
        break;
      case 'success':
        hapticService.success();
        break;
      case 'warning':
        hapticService.warning();
        break;
      case 'error':
        hapticService.error();
        break;
    }

    // Trigger animation
    switch (animationType) {
      case 'scale':
        AnimationService.scale(scaleValue, 0.95, 100).start();
        break;
      case 'bounce':
        AnimationService.bounce(scaleValue, 200).start();
        break;
      case 'pulse':
        Animated.parallel([
          AnimationService.scale(scaleValue, 1.05, 100),
          AnimationService.fadeOut(opacityValue, 100, 0.8),
        ]).start();
        break;
    }
  };

  const handlePressOut = () => {
    if (disabled || loading) return;

    // Reset animation
    switch (animationType) {
      case 'scale':
        AnimationService.scale(scaleValue, 1, 100).start();
        break;
      case 'pulse':
        Animated.parallel([
          AnimationService.scale(scaleValue, 1, 100),
          AnimationService.fadeIn(opacityValue, 100, 1),
        ]).start();
        break;
    }
  };

  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
    };

    // Size styles
    switch (size) {
      case 'small':
        baseStyle.paddingHorizontal = 12;
        baseStyle.paddingVertical = 8;
        baseStyle.minHeight = 32;
        break;
      case 'medium':
        baseStyle.paddingHorizontal = 16;
        baseStyle.paddingVertical = 12;
        baseStyle.minHeight = 44;
        break;
      case 'large':
        baseStyle.paddingHorizontal = 20;
        baseStyle.paddingVertical = 16;
        baseStyle.minHeight = 52;
        break;
    }

    // Variant styles
    switch (variant) {
      case 'primary':
        baseStyle.backgroundColor = theme.colors.primary;
        break;
      case 'secondary':
        baseStyle.backgroundColor = theme.colors.secondary;
        break;
      case 'outline':
        baseStyle.backgroundColor = 'transparent';
        baseStyle.borderWidth = 1;
        baseStyle.borderColor = theme.colors.primary;
        break;
      case 'ghost':
        baseStyle.backgroundColor = 'transparent';
        break;
    }

    // Disabled style
    if (disabled) {
      baseStyle.opacity = 0.5;
    }

    return baseStyle;
  };

  const getTextStyle = (): TextStyle => {
    const baseStyle: TextStyle = {
      fontWeight: '600',
    };

    // Size styles
    switch (size) {
      case 'small':
        baseStyle.fontSize = 14;
        break;
      case 'medium':
        baseStyle.fontSize = 16;
        break;
      case 'large':
        baseStyle.fontSize = 18;
        break;
    }

    // Variant styles
    switch (variant) {
      case 'primary':
      case 'secondary':
        baseStyle.color = 'white';
        break;
      case 'outline':
      case 'ghost':
        baseStyle.color = theme.colors.primary;
        break;
    }

    return baseStyle;
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      <Animated.View
        style={[
          getButtonStyle(),
          {
            transform: [{ scale: scaleValue }],
            opacity: opacityValue,
          },
          style,
        ]}
      >
        {children || (
          <Text style={[getTextStyle(), textStyle]}>
            {loading ? 'Loading...' : title}
          </Text>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
};

export default AnimatedButton;
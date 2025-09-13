import React, { useRef, useEffect } from 'react';
import {
  View,
  Animated,
  StyleSheet,
  ViewStyle,
  Dimensions,
} from 'react-native';
import { AnimationService } from '../../services/AnimationService';

interface ScreenTransitionProps {
  children: React.ReactNode;
  type?: 'fade' | 'slide' | 'scale' | 'slideUp' | 'slideDown';
  duration?: number;
  delay?: number;
  style?: ViewStyle;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const ScreenTransition: React.FC<ScreenTransitionProps> = ({
  children,
  type = 'fade',
  duration = 300,
  delay = 0,
  style,
}) => {
  const opacityValue = useRef(new Animated.Value(0)).current;
  const translateXValue = useRef(new Animated.Value(0)).current;
  const translateYValue = useRef(new Animated.Value(0)).current;
  const scaleValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const startAnimation = () => {
      switch (type) {
        case 'fade':
          AnimationService.fadeIn(opacityValue, duration).start();
          break;
        case 'slide':
          translateXValue.setValue(screenWidth);
          Animated.parallel([
            AnimationService.fadeIn(opacityValue, duration),
            AnimationService.slideInRight(translateXValue, duration, screenWidth),
          ]).start();
          break;
        case 'scale':
          Animated.parallel([
            AnimationService.fadeIn(opacityValue, duration),
            AnimationService.scale(scaleValue, 1, duration),
          ]).start();
          break;
        case 'slideUp':
          translateYValue.setValue(screenHeight);
          Animated.parallel([
            AnimationService.fadeIn(opacityValue, duration),
            Animated.timing(translateYValue, {
              toValue: 0,
              duration,
              useNativeDriver: true,
            }),
          ]).start();
          break;
        case 'slideDown':
          translateYValue.setValue(-screenHeight);
          Animated.parallel([
            AnimationService.fadeIn(opacityValue, duration),
            Animated.timing(translateYValue, {
              toValue: 0,
              duration,
              useNativeDriver: true,
            }),
          ]).start();
          break;
      }
    };

    if (delay > 0) {
      setTimeout(startAnimation, delay);
    } else {
      startAnimation();
    }
  }, [type, duration, delay]);

  const getTransform = () => {
    const transform: any[] = [];

    if (type === 'slide') {
      transform.push({ translateX: translateXValue });
    }

    if (type === 'slideUp' || type === 'slideDown') {
      transform.push({ translateY: translateYValue });
    }

    if (type === 'scale') {
      transform.push({ scale: scaleValue });
    }

    return transform;
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: opacityValue,
          transform: getTransform(),
        },
        style,
      ]}
    >
      {children}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default ScreenTransition;
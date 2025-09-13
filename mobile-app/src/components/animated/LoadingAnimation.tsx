import React, { useRef, useEffect } from 'react';
import {
  View,
  Animated,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { AnimationService } from '../../services/AnimationService';
import { useTheme } from '../../contexts/ThemeContext';

interface LoadingAnimationProps {
  type?: 'spinner' | 'pulse' | 'dots' | 'bars' | 'skeleton';
  size?: 'small' | 'medium' | 'large';
  color?: string;
  style?: ViewStyle;
}

const LoadingAnimation: React.FC<LoadingAnimationProps> = ({
  type = 'spinner',
  size = 'medium',
  color,
  style,
}) => {
  const { theme } = useTheme();
  const animationColor = color || theme.colors.primary;

  const getSizeValue = () => {
    switch (size) {
      case 'small':
        return 20;
      case 'medium':
        return 40;
      case 'large':
        return 60;
      default:
        return 40;
    }
  };

  const renderSpinner = () => {
    const rotationValue = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      const animation = Animated.loop(
        AnimationService.rotate(rotationValue, 1000)
      );
      animation.start();
      return () => animation.stop();
    }, []);

    const sizeValue = getSizeValue();

    return (
      <Animated.View
        style={[
          styles.spinner,
          {
            width: sizeValue,
            height: sizeValue,
            borderColor: `${animationColor}20`,
            borderTopColor: animationColor,
            borderWidth: sizeValue / 10,
            borderRadius: sizeValue / 2,
            transform: [
              {
                rotate: rotationValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '360deg'],
                }),
              },
            ],
          },
        ]}
      />
    );
  };

  const renderPulse = () => {
    const pulseValue = useRef(new Animated.Value(0.3)).current;

    useEffect(() => {
      const animation = AnimationService.loadingPulse(pulseValue);
      animation.start();
      return () => animation.stop();
    }, []);

    const sizeValue = getSizeValue();

    return (
      <Animated.View
        style={[
          styles.pulse,
          {
            width: sizeValue,
            height: sizeValue,
            borderRadius: sizeValue / 2,
            backgroundColor: animationColor,
            opacity: pulseValue,
          },
        ]}
      />
    );
  };

  const renderDots = () => {
    const dot1 = useRef(new Animated.Value(0.3)).current;
    const dot2 = useRef(new Animated.Value(0.3)).current;
    const dot3 = useRef(new Animated.Value(0.3)).current;

    useEffect(() => {
      const createDotAnimation = (animatedValue: Animated.Value, delay: number) =>
        Animated.loop(
          Animated.sequence([
            Animated.delay(delay),
            Animated.timing(animatedValue, {
              toValue: 1,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.timing(animatedValue, {
              toValue: 0.3,
              duration: 400,
              useNativeDriver: true,
            }),
          ])
        );

      const animations = [
        createDotAnimation(dot1, 0),
        createDotAnimation(dot2, 200),
        createDotAnimation(dot3, 400),
      ];

      animations.forEach(animation => animation.start());
      return () => animations.forEach(animation => animation.stop());
    }, []);

    const dotSize = getSizeValue() / 3;

    return (
      <View style={styles.dotsContainer}>
        {[dot1, dot2, dot3].map((dot, index) => (
          <Animated.View
            key={index}
            style={[
              styles.dot,
              {
                width: dotSize,
                height: dotSize,
                borderRadius: dotSize / 2,
                backgroundColor: animationColor,
                opacity: dot,
                marginHorizontal: dotSize / 4,
              },
            ]}
          />
        ))}
      </View>
    );
  };

  const renderBars = () => {
    const bar1 = useRef(new Animated.Value(0.3)).current;
    const bar2 = useRef(new Animated.Value(0.3)).current;
    const bar3 = useRef(new Animated.Value(0.3)).current;
    const bar4 = useRef(new Animated.Value(0.3)).current;

    useEffect(() => {
      const createBarAnimation = (animatedValue: Animated.Value, delay: number) =>
        Animated.loop(
          Animated.sequence([
            Animated.delay(delay),
            Animated.timing(animatedValue, {
              toValue: 1,
              duration: 300,
              useNativeDriver: false,
            }),
            Animated.timing(animatedValue, {
              toValue: 0.3,
              duration: 300,
              useNativeDriver: false,
            }),
          ])
        );

      const animations = [
        createBarAnimation(bar1, 0),
        createBarAnimation(bar2, 100),
        createBarAnimation(bar3, 200),
        createBarAnimation(bar4, 300),
      ];

      animations.forEach(animation => animation.start());
      return () => animations.forEach(animation => animation.stop());
    }, []);

    const barWidth = getSizeValue() / 8;
    const barMaxHeight = getSizeValue();

    return (
      <View style={styles.barsContainer}>
        {[bar1, bar2, bar3, bar4].map((bar, index) => (
          <Animated.View
            key={index}
            style={[
              styles.bar,
              {
                width: barWidth,
                height: bar.interpolate({
                  inputRange: [0.3, 1],
                  outputRange: [barMaxHeight * 0.3, barMaxHeight],
                }),
                backgroundColor: animationColor,
                marginHorizontal: barWidth / 2,
              },
            ]}
          />
        ))}
      </View>
    );
  };

  const renderSkeleton = () => {
    const shimmerValue = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(shimmerValue, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(shimmerValue, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      animation.start();
      return () => animation.stop();
    }, []);

    const sizeValue = getSizeValue();

    return (
      <View style={styles.skeletonContainer}>
        <Animated.View
          style={[
            styles.skeletonLine,
            {
              width: sizeValue * 2,
              height: sizeValue / 4,
              backgroundColor: animationColor,
              opacity: shimmerValue.interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: [0.3, 0.7, 0.3],
              }),
            },
          ]}
        />
        <Animated.View
          style={[
            styles.skeletonLine,
            {
              width: sizeValue * 1.5,
              height: sizeValue / 4,
              backgroundColor: animationColor,
              opacity: shimmerValue.interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: [0.2, 0.6, 0.2],
              }),
              marginTop: sizeValue / 8,
            },
          ]}
        />
        <Animated.View
          style={[
            styles.skeletonLine,
            {
              width: sizeValue * 1.8,
              height: sizeValue / 4,
              backgroundColor: animationColor,
              opacity: shimmerValue.interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: [0.25, 0.65, 0.25],
              }),
              marginTop: sizeValue / 8,
            },
          ]}
        />
      </View>
    );
  };

  const renderAnimation = () => {
    switch (type) {
      case 'spinner':
        return renderSpinner();
      case 'pulse':
        return renderPulse();
      case 'dots':
        return renderDots();
      case 'bars':
        return renderBars();
      case 'skeleton':
        return renderSkeleton();
      default:
        return renderSpinner();
    }
  };

  return (
    <View style={[styles.container, style]}>
      {renderAnimation()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinner: {
    // Styles applied dynamically
  },
  pulse: {
    // Styles applied dynamically
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    // Styles applied dynamically
  },
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 60,
  },
  bar: {
    borderRadius: 2,
  },
  skeletonContainer: {
    alignItems: 'flex-start',
  },
  skeletonLine: {
    borderRadius: 4,
  },
});

export default LoadingAnimation;
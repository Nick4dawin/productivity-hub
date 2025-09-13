import React, { useRef, useEffect } from 'react';
import {
  View,
  Animated,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AnimationService } from '../../services/AnimationService';
import { hapticService } from '../../services/HapticService';

interface CompletionAnimationProps {
  visible: boolean;
  type: 'habit' | 'todo' | 'goal' | 'routine';
  onComplete?: () => void;
  color?: string;
  size?: number;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const CompletionAnimation: React.FC<CompletionAnimationProps> = ({
  visible,
  type,
  onComplete,
  color = '#4CAF50',
  size = 80,
}) => {
  const scaleValue = useRef(new Animated.Value(0)).current;
  const opacityValue = useRef(new Animated.Value(0)).current;
  const rotationValue = useRef(new Animated.Value(0)).current;
  const pulseValue = useRef(new Animated.Value(1)).current;
  
  // Confetti animations
  const confettiAnimations = useRef(
    Array.from({ length: 12 }, () => ({
      translateX: new Animated.Value(0),
      translateY: new Animated.Value(0),
      rotation: new Animated.Value(0),
      scale: new Animated.Value(1),
      opacity: new Animated.Value(1),
    }))
  ).current;

  useEffect(() => {
    if (visible) {
      startAnimation();
    } else {
      resetAnimation();
    }
  }, [visible]);

  const startAnimation = () => {
    // Trigger haptic feedback based on type
    switch (type) {
      case 'habit':
        hapticService.habitComplete();
        break;
      case 'todo':
        hapticService.todoComplete();
        break;
      case 'goal':
        hapticService.goalMilestone();
        break;
      case 'routine':
        hapticService.routineComplete();
        break;
    }

    // Main icon animation
    Animated.sequence([
      // Fade in and scale up
      Animated.parallel([
        AnimationService.fadeIn(opacityValue, 200),
        AnimationService.scale(scaleValue, 1.2, 300),
      ]),
      // Bounce effect
      AnimationService.scale(scaleValue, 0.9, 150),
      AnimationService.scale(scaleValue, 1, 200),
      // Pulse effect
      Animated.parallel([
        AnimationService.pulse(pulseValue, 0.95, 1.05, 800),
        AnimationService.rotate(rotationValue, 1000, 0.1),
      ]),
    ]).start();

    // Confetti animation
    if (type === 'goal' || type === 'routine') {
      startConfettiAnimation();
    }

    // Auto-hide after animation
    setTimeout(() => {
      hideAnimation();
    }, 2500);
  };

  const startConfettiAnimation = () => {
    const confettiAnimationPromises = confettiAnimations.map((confetti, index) => {
      const angle = (index / confettiAnimations.length) * 2 * Math.PI;
      const distance = 100 + Math.random() * 50;
      const targetX = Math.cos(angle) * distance;
      const targetY = Math.sin(angle) * distance - 50;

      return Animated.parallel([
        Animated.timing(confetti.translateX, {
          toValue: targetX,
          duration: 1000 + Math.random() * 500,
          useNativeDriver: true,
        }),
        Animated.timing(confetti.translateY, {
          toValue: targetY,
          duration: 800 + Math.random() * 400,
          useNativeDriver: true,
        }),
        Animated.timing(confetti.rotation, {
          toValue: Math.random() * 4 - 2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.delay(500),
          Animated.timing(confetti.opacity, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
        ]),
      ]);
    });

    Animated.parallel(confettiAnimationPromises).start();
  };

  const hideAnimation = () => {
    Animated.parallel([
      AnimationService.fadeOut(opacityValue, 300),
      AnimationService.scale(scaleValue, 0.8, 300),
    ]).start(() => {
      resetAnimation();
      if (onComplete) {
        onComplete();
      }
    });
  };

  const resetAnimation = () => {
    scaleValue.setValue(0);
    opacityValue.setValue(0);
    rotationValue.setValue(0);
    pulseValue.setValue(1);
    
    confettiAnimations.forEach(confetti => {
      confetti.translateX.setValue(0);
      confetti.translateY.setValue(0);
      confetti.rotation.setValue(0);
      confetti.scale.setValue(1);
      confetti.opacity.setValue(1);
    });
  };

  const getIcon = () => {
    switch (type) {
      case 'habit':
        return 'checkmark-circle';
      case 'todo':
        return 'checkmark-done-circle';
      case 'goal':
        return 'trophy';
      case 'routine':
        return 'ribbon';
      default:
        return 'checkmark-circle';
    }
  };

  const getColors = () => {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'];
    return colors;
  };

  if (!visible) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      {/* Confetti */}
      {(type === 'goal' || type === 'routine') && confettiAnimations.map((confetti, index) => (
        <Animated.View
          key={index}
          style={[
            styles.confetti,
            {
              backgroundColor: getColors()[index % getColors().length],
              transform: [
                { translateX: confetti.translateX },
                { translateY: confetti.translateY },
                { rotate: confetti.rotation.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '360deg'],
                }) },
                { scale: confetti.scale },
              ],
              opacity: confetti.opacity,
            },
          ]}
        />
      ))}

      {/* Main Icon */}
      <Animated.View
        style={[
          styles.iconContainer,
          {
            transform: [
              { scale: Animated.multiply(scaleValue, pulseValue) },
              { rotate: rotationValue.interpolate({
                inputRange: [0, 1],
                outputRange: ['0deg', '36deg'],
              }) },
            ],
            opacity: opacityValue,
          },
        ]}
      >
        <View style={[styles.iconBackground, { backgroundColor: color }]}>
          <Ionicons
            name={getIcon() as any}
            size={size * 0.6}
            color="white"
          />
        </View>
      </Animated.View>

      {/* Ripple Effect */}
      <Animated.View
        style={[
          styles.ripple,
          {
            width: size * 2,
            height: size * 2,
            borderRadius: size,
            borderColor: color,
            transform: [{ scale: scaleValue }],
            opacity: opacityValue.interpolate({
              inputRange: [0, 0.5, 1],
              outputRange: [0, 0.3, 0],
            }),
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  iconBackground: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  ripple: {
    position: 'absolute',
    borderWidth: 2,
    zIndex: 1,
  },
  confetti: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});

export default CompletionAnimation;
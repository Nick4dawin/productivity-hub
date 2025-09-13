import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  Animated,
  PanGestureHandler,
  State,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GestureService, SwipeConfig } from '../../services/GestureService';
import { AnimationService } from '../../services/AnimationService';
import { hapticService } from '../../services/HapticService';
import { useTheme } from '../../contexts/ThemeContext';

interface SwipeAction {
  icon: string;
  color: string;
  backgroundColor: string;
  onPress: () => void;
  label?: string;
}

interface AnimatedListItemProps {
  children: React.ReactNode;
  onPress?: () => void;
  onLongPress?: () => void;
  leftAction?: SwipeAction;
  rightAction?: SwipeAction;
  style?: ViewStyle;
  disabled?: boolean;
  animateOnMount?: boolean;
  mountDelay?: number;
}

const AnimatedListItem: React.FC<AnimatedListItemProps> = ({
  children,
  onPress,
  onLongPress,
  leftAction,
  rightAction,
  style,
  disabled = false,
  animateOnMount = false,
  mountDelay = 0,
}) => {
  const { theme } = useTheme();
  const translateX = useRef(new Animated.Value(0)).current;
  const scaleValue = useRef(new Animated.Value(animateOnMount ? 0 : 1)).current;
  const opacityValue = useRef(new Animated.Value(animateOnMount ? 0 : 1)).current;
  const [isRevealed, setIsRevealed] = useState(false);

  React.useEffect(() => {
    if (animateOnMount) {
      setTimeout(() => {
        Animated.parallel([
          AnimationService.spring(scaleValue, 1),
          AnimationService.fadeIn(opacityValue, 300),
        ]).start();
      }, mountDelay);
    }
  }, [animateOnMount, mountDelay]);

  const handleGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: translateX } }],
    { useNativeDriver: true }
  );

  const handleStateChange = (event: any) => {
    const { translationX, velocityX, state } = event.nativeEvent;

    if (state === State.END) {
      const threshold = 80;
      const velocityThreshold = 500;
      
      const shouldTriggerLeft = translationX < -threshold || velocityX < -velocityThreshold;
      const shouldTriggerRight = translationX > threshold || velocityX > velocityThreshold;

      if (shouldTriggerLeft && leftAction) {
        // Trigger left action
        hapticService.swipeAction();
        leftAction.onPress();
        resetPosition();
      } else if (shouldTriggerRight && rightAction) {
        // Trigger right action
        hapticService.swipeAction();
        rightAction.onPress();
        resetPosition();
      } else if (Math.abs(translationX) > 40) {
        // Reveal actions
        const targetValue = translationX > 0 ? 80 : -80;
        Animated.spring(translateX, {
          toValue: targetValue,
          useNativeDriver: true,
        }).start();
        setIsRevealed(true);
      } else {
        // Reset position
        resetPosition();
      }
    }
  };

  const resetPosition = () => {
    Animated.spring(translateX, {
      toValue: 0,
      useNativeDriver: true,
    }).start();
    setIsRevealed(false);
  };

  const handlePress = () => {
    if (disabled) return;
    
    if (isRevealed) {
      resetPosition();
      return;
    }

    hapticService.light();
    
    // Scale animation on press
    Animated.sequence([
      AnimationService.scale(scaleValue, 0.98, 100),
      AnimationService.scale(scaleValue, 1, 100),
    ]).start();

    if (onPress) {
      onPress();
    }
  };

  const handleLongPress = () => {
    if (disabled || !onLongPress) return;
    
    hapticService.longPress();
    onLongPress();
  };

  const renderAction = (action: SwipeAction, side: 'left' | 'right') => (
    <TouchableOpacity
      style={[
        styles.actionButton,
        {
          backgroundColor: action.backgroundColor,
          [side]: 0,
        },
      ]}
      onPress={() => {
        hapticService.medium();
        action.onPress();
        resetPosition();
      }}
    >
      <Ionicons name={action.icon as any} size={24} color={action.color} />
      {action.label && (
        <Text style={[styles.actionLabel, { color: action.color }]}>
          {action.label}
        </Text>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Background Actions */}
      {leftAction && (
        <View style={[styles.actionContainer, styles.leftActionContainer]}>
          {renderAction(leftAction, 'left')}
        </View>
      )}
      {rightAction && (
        <View style={[styles.actionContainer, styles.rightActionContainer]}>
          {renderAction(rightAction, 'right')}
        </View>
      )}

      {/* Main Content */}
      <PanGestureHandler
        onGestureEvent={handleGestureEvent}
        onHandlerStateChange={handleStateChange}
        enabled={!disabled && (!!leftAction || !!rightAction)}
      >
        <Animated.View
          style={[
            styles.content,
            {
              transform: [
                { translateX },
                { scale: scaleValue },
              ],
              opacity: opacityValue,
            },
            style,
          ]}
        >
          <TouchableOpacity
            onPress={handlePress}
            onLongPress={handleLongPress}
            disabled={disabled}
            activeOpacity={0.8}
            style={[
              styles.touchable,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
              },
            ]}
          >
            {children}
          </TouchableOpacity>
        </Animated.View>
      </PanGestureHandler>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    marginVertical: 2,
  },
  content: {
    zIndex: 1,
  },
  touchable: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    marginHorizontal: 16,
  },
  actionContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 80,
    zIndex: 0,
  },
  leftActionContainer: {
    left: 16,
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
  },
  rightActionContainer: {
    right: 16,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
});

export default AnimatedListItem;
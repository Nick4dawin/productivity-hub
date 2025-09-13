import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { Animated } from 'react-native';
import { hapticService } from './HapticService';

export interface SwipeConfig {
  threshold: number;
  velocityThreshold: number;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
}

export interface LongPressConfig {
  duration: number;
  onLongPress: () => void;
  onLongPressStart?: () => void;
  onLongPressEnd?: () => void;
}

/**
 * Service for managing gesture interactions
 */
export class GestureService {
  /**
   * Create swipe gesture configuration
   */
  static createSwipeConfig(config: Partial<SwipeConfig>): SwipeConfig {
    return {
      threshold: 50,
      velocityThreshold: 500,
      ...config,
    };
  }

  /**
   * Handle pan gesture for swipe detection
   */
  static handlePanGesture(
    event: any,
    config: SwipeConfig,
    animatedValue?: Animated.Value
  ): void {
    const { translationX, translationY, velocityX, velocityY, state } = event.nativeEvent;

    if (state === State.ACTIVE && animatedValue) {
      // Update animated value during gesture
      animatedValue.setValue(translationX);
    }

    if (state === State.END) {
      const absTranslationX = Math.abs(translationX);
      const absTranslationY = Math.abs(translationY);
      const absVelocityX = Math.abs(velocityX);
      const absVelocityY = Math.abs(velocityY);

      // Determine if gesture meets threshold requirements
      const meetsDistanceThreshold = 
        absTranslationX > config.threshold || absTranslationY > config.threshold;
      const meetsVelocityThreshold = 
        absVelocityX > config.velocityThreshold || absVelocityY > config.velocityThreshold;

      if (meetsDistanceThreshold || meetsVelocityThreshold) {
        // Determine swipe direction
        if (absTranslationX > absTranslationY) {
          // Horizontal swipe
          if (translationX > 0 && config.onSwipeRight) {
            hapticService.swipeAction();
            config.onSwipeRight();
          } else if (translationX < 0 && config.onSwipeLeft) {
            hapticService.swipeAction();
            config.onSwipeLeft();
          }
        } else {
          // Vertical swipe
          if (translationY > 0 && config.onSwipeDown) {
            hapticService.swipeAction();
            config.onSwipeDown();
          } else if (translationY < 0 && config.onSwipeUp) {
            hapticService.swipeAction();
            config.onSwipeUp();
          }
        }
      }

      // Reset animated value
      if (animatedValue) {
        Animated.spring(animatedValue, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      }
    }
  }

  /**
   * Create long press gesture handler
   */
  static createLongPressHandler(config: LongPressConfig) {
    let longPressTimer: NodeJS.Timeout | null = null;
    let isLongPressing = false;

    const startLongPress = () => {
      if (config.onLongPressStart) {
        config.onLongPressStart();
      }

      longPressTimer = setTimeout(() => {
        isLongPressing = true;
        hapticService.longPress();
        config.onLongPress();
      }, config.duration);
    };

    const cancelLongPress = () => {
      if (longPressTimer) {
        clearTimeout(longPressTimer);
        longPressTimer = null;
      }

      if (isLongPressing && config.onLongPressEnd) {
        config.onLongPressEnd();
      }

      isLongPressing = false;
    };

    return {
      onPressIn: startLongPress,
      onPressOut: cancelLongPress,
      onLongPress: () => {}, // Handled by timer
    };
  }

  /**
   * Create pull-to-refresh gesture configuration
   */
  static createPullToRefreshConfig(
    onRefresh: () => void,
    threshold: number = 100
  ) {
    return {
      threshold,
      onSwipeDown: () => {
        hapticService.refresh();
        onRefresh();
      },
    };
  }

  /**
   * Create swipe-to-delete gesture configuration
   */
  static createSwipeToDeleteConfig(
    onDelete: () => void,
    threshold: number = 100
  ) {
    return {
      threshold,
      velocityThreshold: 300,
      onSwipeLeft: () => {
        hapticService.delete();
        onDelete();
      },
    };
  }

  /**
   * Create swipe-to-complete gesture configuration
   */
  static createSwipeToCompleteConfig(
    onComplete: () => void,
    threshold: number = 100
  ) {
    return {
      threshold,
      velocityThreshold: 300,
      onSwipeRight: () => {
        hapticService.success();
        onComplete();
      },
    };
  }

  /**
   * Create swipe actions configuration (both directions)
   */
  static createSwipeActionsConfig(
    onLeftAction: () => void,
    onRightAction: () => void,
    leftLabel: string = 'Delete',
    rightLabel: string = 'Complete'
  ) {
    return {
      threshold: 80,
      velocityThreshold: 400,
      onSwipeLeft: () => {
        if (leftLabel.toLowerCase().includes('delete')) {
          hapticService.delete();
        } else {
          hapticService.swipeAction();
        }
        onLeftAction();
      },
      onSwipeRight: () => {
        if (rightLabel.toLowerCase().includes('complete')) {
          hapticService.success();
        } else {
          hapticService.swipeAction();
        }
        onRightAction();
      },
    };
  }

  /**
   * Calculate swipe progress (0-1) based on translation
   */
  static calculateSwipeProgress(
    translation: number,
    threshold: number,
    maxProgress: number = 1
  ): number {
    const progress = Math.abs(translation) / threshold;
    return Math.min(progress, maxProgress);
  }

  /**
   * Determine if swipe should trigger action
   */
  static shouldTriggerSwipe(
    translation: number,
    velocity: number,
    threshold: number,
    velocityThreshold: number
  ): boolean {
    return Math.abs(translation) > threshold || Math.abs(velocity) > velocityThreshold;
  }

  /**
   * Create animated swipe reveal effect
   */
  static createSwipeRevealAnimation(
    translateX: Animated.Value,
    targetValue: number,
    duration: number = 200
  ): Animated.CompositeAnimation {
    return Animated.timing(translateX, {
      toValue: targetValue,
      duration,
      useNativeDriver: true,
    });
  }

  /**
   * Create bounce back animation for cancelled swipes
   */
  static createBounceBackAnimation(
    translateX: Animated.Value,
    duration: number = 300
  ): Animated.CompositeAnimation {
    return Animated.spring(translateX, {
      toValue: 0,
      tension: 100,
      friction: 8,
      useNativeDriver: true,
    });
  }
}

/**
 * Common gesture configurations
 */
export const GesturePresets = {
  // Todo item gestures
  todoSwipe: (onComplete: () => void, onDelete: () => void) =>
    GestureService.createSwipeActionsConfig(onDelete, onComplete, 'Delete', 'Complete'),

  // Habit item gestures
  habitSwipe: (onToggle: () => void, onEdit: () => void) =>
    GestureService.createSwipeActionsConfig(onEdit, onToggle, 'Edit', 'Toggle'),

  // Journal entry gestures
  journalSwipe: (onDelete: () => void, onEdit: () => void) =>
    GestureService.createSwipeActionsConfig(onDelete, onEdit, 'Delete', 'Edit'),

  // Goal item gestures
  goalSwipe: (onEdit: () => void, onProgress: () => void) =>
    GestureService.createSwipeActionsConfig(onEdit, onProgress, 'Edit', 'Update Progress'),

  // Media item gestures
  mediaSwipe: (onDelete: () => void, onProgress: () => void) =>
    GestureService.createSwipeActionsConfig(onDelete, onProgress, 'Remove', 'Update Progress'),

  // Long press configurations
  habitLongPress: (onEdit: () => void) =>
    GestureService.createLongPressHandler({
      duration: 500,
      onLongPress: onEdit,
    }),

  todoLongPress: (onEdit: () => void) =>
    GestureService.createLongPressHandler({
      duration: 500,
      onLongPress: onEdit,
    }),

  // Pull to refresh
  pullToRefresh: (onRefresh: () => void) =>
    GestureService.createPullToRefreshConfig(onRefresh, 80),
};

export { GestureService };
import { Animated, Easing } from 'react-native';

/**
 * Service for managing common animations across the app
 */
export class AnimationService {
  /**
   * Create a fade in animation
   */
  static fadeIn(
    animatedValue: Animated.Value,
    duration: number = 300,
    toValue: number = 1
  ): Animated.CompositeAnimation {
    return Animated.timing(animatedValue, {
      toValue,
      duration,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    });
  }

  /**
   * Create a fade out animation
   */
  static fadeOut(
    animatedValue: Animated.Value,
    duration: number = 300,
    toValue: number = 0
  ): Animated.CompositeAnimation {
    return Animated.timing(animatedValue, {
      toValue,
      duration,
      easing: Easing.in(Easing.quad),
      useNativeDriver: true,
    });
  }

  /**
   * Create a slide in from right animation
   */
  static slideInRight(
    animatedValue: Animated.Value,
    duration: number = 300,
    fromValue: number = 100
  ): Animated.CompositeAnimation {
    animatedValue.setValue(fromValue);
    return Animated.timing(animatedValue, {
      toValue: 0,
      duration,
      easing: Easing.out(Easing.back(1.2)),
      useNativeDriver: true,
    });
  }

  /**
   * Create a slide in from left animation
   */
  static slideInLeft(
    animatedValue: Animated.Value,
    duration: number = 300,
    fromValue: number = -100
  ): Animated.CompositeAnimation {
    animatedValue.setValue(fromValue);
    return Animated.timing(animatedValue, {
      toValue: 0,
      duration,
      easing: Easing.out(Easing.back(1.2)),
      useNativeDriver: true,
    });
  }

  /**
   * Create a slide out to right animation
   */
  static slideOutRight(
    animatedValue: Animated.Value,
    duration: number = 250,
    toValue: number = 100
  ): Animated.CompositeAnimation {
    return Animated.timing(animatedValue, {
      toValue,
      duration,
      easing: Easing.in(Easing.back(1.2)),
      useNativeDriver: true,
    });
  }

  /**
   * Create a slide out to left animation
   */
  static slideOutLeft(
    animatedValue: Animated.Value,
    duration: number = 250,
    toValue: number = -100
  ): Animated.CompositeAnimation {
    return Animated.timing(animatedValue, {
      toValue,
      duration,
      easing: Easing.in(Easing.back(1.2)),
      useNativeDriver: true,
    });
  }

  /**
   * Create a scale animation
   */
  static scale(
    animatedValue: Animated.Value,
    toValue: number,
    duration: number = 200
  ): Animated.CompositeAnimation {
    return Animated.timing(animatedValue, {
      toValue,
      duration,
      easing: Easing.out(Easing.back(1.5)),
      useNativeDriver: true,
    });
  }

  /**
   * Create a bounce animation
   */
  static bounce(
    animatedValue: Animated.Value,
    duration: number = 600
  ): Animated.CompositeAnimation {
    return Animated.sequence([
      Animated.timing(animatedValue, {
        toValue: 1.2,
        duration: duration * 0.3,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(animatedValue, {
        toValue: 0.9,
        duration: duration * 0.2,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: duration * 0.5,
        easing: Easing.out(Easing.back(1.5)),
        useNativeDriver: true,
      }),
    ]);
  }

  /**
   * Create a pulse animation (repeating scale)
   */
  static pulse(
    animatedValue: Animated.Value,
    minScale: number = 0.95,
    maxScale: number = 1.05,
    duration: number = 1000
  ): Animated.CompositeAnimation {
    return Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: maxScale,
          duration: duration / 2,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: minScale,
          duration: duration / 2,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );
  }

  /**
   * Create a shake animation
   */
  static shake(
    animatedValue: Animated.Value,
    intensity: number = 10,
    duration: number = 500
  ): Animated.CompositeAnimation {
    return Animated.sequence([
      Animated.timing(animatedValue, {
        toValue: intensity,
        duration: duration / 8,
        useNativeDriver: true,
      }),
      Animated.timing(animatedValue, {
        toValue: -intensity,
        duration: duration / 4,
        useNativeDriver: true,
      }),
      Animated.timing(animatedValue, {
        toValue: intensity * 0.7,
        duration: duration / 4,
        useNativeDriver: true,
      }),
      Animated.timing(animatedValue, {
        toValue: -intensity * 0.7,
        duration: duration / 4,
        useNativeDriver: true,
      }),
      Animated.timing(animatedValue, {
        toValue: 0,
        duration: duration / 8,
        useNativeDriver: true,
      }),
    ]);
  }

  /**
   * Create a rotation animation
   */
  static rotate(
    animatedValue: Animated.Value,
    duration: number = 1000,
    rotations: number = 1
  ): Animated.CompositeAnimation {
    return Animated.timing(animatedValue, {
      toValue: rotations,
      duration,
      easing: Easing.linear,
      useNativeDriver: true,
    });
  }

  /**
   * Create a spring animation
   */
  static spring(
    animatedValue: Animated.Value,
    toValue: number,
    tension: number = 100,
    friction: number = 8
  ): Animated.CompositeAnimation {
    return Animated.spring(animatedValue, {
      toValue,
      tension,
      friction,
      useNativeDriver: true,
    });
  }

  /**
   * Create a stagger animation for multiple items
   */
  static stagger(
    animations: Animated.CompositeAnimation[],
    delay: number = 100
  ): Animated.CompositeAnimation {
    return Animated.stagger(delay, animations);
  }

  /**
   * Create a completion celebration animation
   */
  static celebration(
    scaleValue: Animated.Value,
    opacityValue: Animated.Value
  ): Animated.CompositeAnimation {
    return Animated.parallel([
      Animated.sequence([
        Animated.timing(scaleValue, {
          toValue: 1.3,
          duration: 200,
          easing: Easing.out(Easing.back(2)),
          useNativeDriver: true,
        }),
        Animated.timing(scaleValue, {
          toValue: 1,
          duration: 300,
          easing: Easing.out(Easing.back(1.5)),
          useNativeDriver: true,
        }),
      ]),
      Animated.sequence([
        Animated.timing(opacityValue, {
          toValue: 0.8,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(opacityValue, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
    ]);
  }

  /**
   * Create a loading pulse animation
   */
  static loadingPulse(
    animatedValue: Animated.Value
  ): Animated.CompositeAnimation {
    return Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 0.3,
          duration: 800,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );
  }

  /**
   * Create a swipe reveal animation
   */
  static swipeReveal(
    animatedValue: Animated.Value,
    toValue: number,
    duration: number = 200
  ): Animated.CompositeAnimation {
    return Animated.timing(animatedValue, {
      toValue,
      duration,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    });
  }

  /**
   * Create a card flip animation
   */
  static cardFlip(
    animatedValue: Animated.Value,
    duration: number = 600
  ): Animated.CompositeAnimation {
    return Animated.timing(animatedValue, {
      toValue: 1,
      duration,
      easing: Easing.inOut(Easing.quad),
      useNativeDriver: true,
    });
  }

  /**
   * Create a progress bar animation
   */
  static progressBar(
    animatedValue: Animated.Value,
    toValue: number,
    duration: number = 1000
  ): Animated.CompositeAnimation {
    return Animated.timing(animatedValue, {
      toValue,
      duration,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false, // Width animations can't use native driver
    });
  }

  /**
   * Create a slide up modal animation
   */
  static slideUpModal(
    animatedValue: Animated.Value,
    duration: number = 300
  ): Animated.CompositeAnimation {
    return Animated.timing(animatedValue, {
      toValue: 0,
      duration,
      easing: Easing.out(Easing.back(1.2)),
      useNativeDriver: true,
    });
  }

  /**
   * Create a slide down modal animation
   */
  static slideDownModal(
    animatedValue: Animated.Value,
    toValue: number,
    duration: number = 250
  ): Animated.CompositeAnimation {
    return Animated.timing(animatedValue, {
      toValue,
      duration,
      easing: Easing.in(Easing.back(1.2)),
      useNativeDriver: true,
    });
  }
}

/**
 * Common animation presets
 */
export const AnimationPresets = {
  // Screen transitions
  screenFadeIn: (opacity: Animated.Value) => AnimationService.fadeIn(opacity, 300),
  screenSlideIn: (translateX: Animated.Value) => AnimationService.slideInRight(translateX, 300),
  
  // List item animations
  listItemSlideIn: (translateX: Animated.Value, delay: number = 0) => 
    Animated.sequence([
      Animated.delay(delay),
      AnimationService.slideInRight(translateX, 250),
    ]),
  
  // Button press animations
  buttonPress: (scale: Animated.Value) => 
    Animated.sequence([
      AnimationService.scale(scale, 0.95, 100),
      AnimationService.scale(scale, 1, 100),
    ]),
  
  // Completion animations
  habitComplete: (scale: Animated.Value, opacity: Animated.Value) =>
    AnimationService.celebration(scale, opacity),
  
  todoComplete: (scale: Animated.Value) => AnimationService.bounce(scale),
  
  // Loading animations
  loadingSpinner: (rotation: Animated.Value) => 
    Animated.loop(AnimationService.rotate(rotation, 1000)),
  
  loadingPulse: (opacity: Animated.Value) => AnimationService.loadingPulse(opacity),
  
  // Error animations
  inputError: (translateX: Animated.Value) => AnimationService.shake(translateX, 5, 400),
  
  // Modal animations
  modalSlideUp: (translateY: Animated.Value) => {
    translateY.setValue(300);
    return AnimationService.slideUpModal(translateY);
  },
  
  modalSlideDown: (translateY: Animated.Value) => 
    AnimationService.slideDownModal(translateY, 300),
};

export { AnimationService };
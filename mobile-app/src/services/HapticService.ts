import { Haptics } from 'expo-haptics';
import { Platform } from 'react-native';

/**
 * Service for managing haptic feedback across the app
 */
export class HapticService {
  private static instance: HapticService;
  private isEnabled: boolean = true;

  private constructor() {}

  public static getInstance(): HapticService {
    if (!HapticService.instance) {
      HapticService.instance = new HapticService();
    }
    return HapticService.instance;
  }

  /**
   * Enable or disable haptic feedback
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  /**
   * Check if haptic feedback is enabled
   */
  isHapticEnabled(): boolean {
    return this.isEnabled && Platform.OS !== 'web';
  }

  /**
   * Light haptic feedback for subtle interactions
   * Use for: button taps, toggle switches, selection changes
   */
  async light(): Promise<void> {
    if (!this.isHapticEnabled()) return;
    
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.warn('Haptic feedback failed:', error);
    }
  }

  /**
   * Medium haptic feedback for standard interactions
   * Use for: form submissions, item selections, navigation
   */
  async medium(): Promise<void> {
    if (!this.isHapticEnabled()) return;
    
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      console.warn('Haptic feedback failed:', error);
    }
  }

  /**
   * Heavy haptic feedback for important interactions
   * Use for: confirmations, completions, important actions
   */
  async heavy(): Promise<void> {
    if (!this.isHapticEnabled()) return;
    
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } catch (error) {
      console.warn('Haptic feedback failed:', error);
    }
  }

  /**
   * Success haptic feedback for positive outcomes
   * Use for: task completion, goal achievement, successful saves
   */
  async success(): Promise<void> {
    if (!this.isHapticEnabled()) return;
    
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.warn('Haptic feedback failed:', error);
    }
  }

  /**
   * Warning haptic feedback for cautionary actions
   * Use for: validation errors, warnings, attention needed
   */
  async warning(): Promise<void> {
    if (!this.isHapticEnabled()) return;
    
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } catch (error) {
      console.warn('Haptic feedback failed:', error);
    }
  }

  /**
   * Error haptic feedback for negative outcomes
   * Use for: errors, failures, destructive actions
   */
  async error(): Promise<void> {
    if (!this.isHapticEnabled()) return;
    
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } catch (error) {
      console.warn('Haptic feedback failed:', error);
    }
  }

  /**
   * Selection haptic feedback for item selection
   * Use for: list item selection, picker changes, tab switches
   */
  async selection(): Promise<void> {
    if (!this.isHapticEnabled()) return;
    
    try {
      await Haptics.selectionAsync();
    } catch (error) {
      console.warn('Haptic feedback failed:', error);
    }
  }

  /**
   * Habit completion haptic - success with medium impact
   */
  async habitComplete(): Promise<void> {
    await this.success();
    // Add a slight delay and light tap for celebration effect
    setTimeout(async () => {
      await this.light();
    }, 100);
  }

  /**
   * Todo completion haptic - success feedback
   */
  async todoComplete(): Promise<void> {
    await this.success();
  }

  /**
   * Goal milestone haptic - heavy success feedback
   */
  async goalMilestone(): Promise<void> {
    await this.heavy();
    setTimeout(async () => {
      await this.success();
    }, 150);
  }

  /**
   * Routine completion haptic - medium success feedback
   */
  async routineComplete(): Promise<void> {
    await this.medium();
    setTimeout(async () => {
      await this.success();
    }, 100);
  }

  /**
   * Swipe action haptic - light feedback for swipe gestures
   */
  async swipeAction(): Promise<void> {
    await this.light();
  }

  /**
   * Long press haptic - medium feedback for long press actions
   */
  async longPress(): Promise<void> {
    await this.medium();
  }

  /**
   * Button press haptic - light feedback for button taps
   */
  async buttonPress(): Promise<void> {
    await this.light();
  }

  /**
   * Toggle haptic - selection feedback for toggles and switches
   */
  async toggle(): Promise<void> {
    await this.selection();
  }

  /**
   * Navigation haptic - light feedback for navigation actions
   */
  async navigation(): Promise<void> {
    await this.light();
  }

  /**
   * Form validation error haptic
   */
  async validationError(): Promise<void> {
    await this.error();
  }

  /**
   * Form submission success haptic
   */
  async formSubmit(): Promise<void> {
    await this.medium();
  }

  /**
   * Refresh haptic - light feedback for pull-to-refresh
   */
  async refresh(): Promise<void> {
    await this.light();
  }

  /**
   * Delete action haptic - warning feedback for destructive actions
   */
  async delete(): Promise<void> {
    await this.warning();
  }

  /**
   * Achievement celebration haptic sequence
   */
  async celebration(): Promise<void> {
    await this.heavy();
    setTimeout(async () => {
      await this.medium();
    }, 100);
    setTimeout(async () => {
      await this.light();
    }, 200);
  }

  /**
   * Streak milestone haptic - special celebration for streaks
   */
  async streakMilestone(streakCount: number): Promise<void> {
    // More intense haptic for higher streaks
    if (streakCount >= 30) {
      await this.celebration();
    } else if (streakCount >= 7) {
      await this.goalMilestone();
    } else {
      await this.success();
    }
  }
}

// Export singleton instance
export const hapticService = HapticService.getInstance();
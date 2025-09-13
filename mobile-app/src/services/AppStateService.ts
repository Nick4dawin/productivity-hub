import { AppState, AppStateStatus } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface AppStateInfo {
  currentState: AppStateStatus;
  previousState: AppStateStatus | null;
  backgroundTime?: number;
  foregroundTime?: number;
  sessionDuration?: number;
}

export interface AppStateListener {
  onForeground?: (info: AppStateInfo) => void;
  onBackground?: (info: AppStateInfo) => void;
  onInactive?: (info: AppStateInfo) => void;
}

/**
 * Service for managing app state changes and lifecycle events
 */
export class AppStateService {
  private static instance: AppStateService;
  private listeners: AppStateListener[] = [];
  private currentState: AppStateStatus = AppState.currentState;
  private previousState: AppStateStatus | null = null;
  private backgroundTime: number | null = null;
  private foregroundTime: number | null = null;
  private sessionStartTime: number = Date.now();
  private appStateSubscription: any = null;

  private constructor() {
    this.initialize();
  }

  public static getInstance(): AppStateService {
    if (!AppStateService.instance) {
      AppStateService.instance = new AppStateService();
    }
    return AppStateService.instance;
  }

  /**
   * Initialize app state tracking
   */
  private initialize(): void {
    this.sessionStartTime = Date.now();
    this.foregroundTime = Date.now();

    // Listen for app state changes
    this.appStateSubscription = AppState.addEventListener('change', this.handleAppStateChange);

    // Load previous session data
    this.loadSessionData();
  }

  /**
   * Handle app state changes
   */
  private handleAppStateChange = (nextAppState: AppStateStatus): void => {
    const now = Date.now();
    this.previousState = this.currentState;
    this.currentState = nextAppState;

    const stateInfo: AppStateInfo = {
      currentState: nextAppState,
      previousState: this.previousState,
      sessionDuration: now - this.sessionStartTime,
    };

    switch (nextAppState) {
      case 'active':
        this.handleForeground(stateInfo, now);
        break;
      case 'background':
        this.handleBackground(stateInfo, now);
        break;
      case 'inactive':
        this.handleInactive(stateInfo, now);
        break;
    }

    this.saveSessionData();
  };

  /**
   * Handle app coming to foreground
   */
  private handleForeground(stateInfo: AppStateInfo, now: number): void {
    this.foregroundTime = now;

    if (this.backgroundTime) {
      const backgroundDuration = now - this.backgroundTime;
      stateInfo.backgroundTime = backgroundDuration;
      
      // Log background duration for analytics
      console.log(`App was in background for ${Math.round(backgroundDuration / 1000)} seconds`);
    }

    // Notify listeners
    this.listeners.forEach(listener => {
      try {
        listener.onForeground?.(stateInfo);
      } catch (error) {
        console.error('Error in foreground listener:', error);
      }
    });
  }

  /**
   * Handle app going to background
   */
  private handleBackground(stateInfo: AppStateInfo, now: number): void {
    this.backgroundTime = now;

    if (this.foregroundTime) {
      const foregroundDuration = now - this.foregroundTime;
      stateInfo.foregroundTime = foregroundDuration;
      
      // Log foreground duration for analytics
      console.log(`App was in foreground for ${Math.round(foregroundDuration / 1000)} seconds`);
    }

    // Notify listeners
    this.listeners.forEach(listener => {
      try {
        listener.onBackground?.(stateInfo);
      } catch (error) {
        console.error('Error in background listener:', error);
      }
    });
  }

  /**
   * Handle app becoming inactive
   */
  private handleInactive(stateInfo: AppStateInfo, now: number): void {
    // Notify listeners
    this.listeners.forEach(listener => {
      try {
        listener.onInactive?.(stateInfo);
      } catch (error) {
        console.error('Error in inactive listener:', error);
      }
    });
  }

  /**
   * Add app state listener
   */
  addListener(listener: AppStateListener): () => void {
    this.listeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * Remove app state listener
   */
  removeListener(listener: AppStateListener): void {
    const index = this.listeners.indexOf(listener);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  /**
   * Get current app state info
   */
  getCurrentState(): AppStateInfo {
    const now = Date.now();
    return {
      currentState: this.currentState,
      previousState: this.previousState,
      sessionDuration: now - this.sessionStartTime,
      backgroundTime: this.backgroundTime ? now - this.backgroundTime : undefined,
      foregroundTime: this.foregroundTime ? now - this.foregroundTime : undefined,
    };
  }

  /**
   * Check if app is currently active
   */
  isActive(): boolean {
    return this.currentState === 'active';
  }

  /**
   * Check if app is in background
   */
  isBackground(): boolean {
    return this.currentState === 'background';
  }

  /**
   * Check if app is inactive
   */
  isInactive(): boolean {
    return this.currentState === 'inactive';
  }

  /**
   * Get session duration in milliseconds
   */
  getSessionDuration(): number {
    return Date.now() - this.sessionStartTime;
  }

  /**
   * Get time spent in background (if currently in background)
   */
  getBackgroundDuration(): number | null {
    if (!this.backgroundTime) return null;
    return Date.now() - this.backgroundTime;
  }

  /**
   * Get time spent in foreground (if currently in foreground)
   */
  getForegroundDuration(): number | null {
    if (!this.foregroundTime) return null;
    return Date.now() - this.foregroundTime;
  }

  /**
   * Save session data to storage
   */
  private async saveSessionData(): Promise<void> {
    try {
      const sessionData = {
        sessionStartTime: this.sessionStartTime,
        currentState: this.currentState,
        backgroundTime: this.backgroundTime,
        foregroundTime: this.foregroundTime,
        lastSaveTime: Date.now(),
      };

      await AsyncStorage.setItem('appSessionData', JSON.stringify(sessionData));
    } catch (error) {
      console.error('Failed to save session data:', error);
    }
  }

  /**
   * Load session data from storage
   */
  private async loadSessionData(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem('appSessionData');
      if (stored) {
        const sessionData = JSON.parse(stored);
        
        // Check if this is a new session (app was closed and reopened)
        const timeSinceLastSave = Date.now() - sessionData.lastSaveTime;
        const isNewSession = timeSinceLastSave > 5 * 60 * 1000; // 5 minutes threshold

        if (isNewSession) {
          // Start new session
          this.sessionStartTime = Date.now();
          this.backgroundTime = null;
          this.foregroundTime = Date.now();
        } else {
          // Continue previous session
          this.sessionStartTime = sessionData.sessionStartTime;
          this.backgroundTime = sessionData.backgroundTime;
          this.foregroundTime = sessionData.foregroundTime;
        }
      }
    } catch (error) {
      console.error('Failed to load session data:', error);
    }
  }

  /**
   * Reset session (start new session)
   */
  resetSession(): void {
    this.sessionStartTime = Date.now();
    this.backgroundTime = null;
    this.foregroundTime = Date.now();
    this.saveSessionData();
  }

  /**
   * Get app usage statistics
   */
  async getUsageStats(): Promise<{
    totalSessions: number;
    averageSessionDuration: number;
    totalForegroundTime: number;
    lastActiveTime: number;
  }> {
    try {
      const stored = await AsyncStorage.getItem('appUsageStats');
      const defaultStats = {
        totalSessions: 1,
        averageSessionDuration: this.getSessionDuration(),
        totalForegroundTime: this.getForegroundDuration() || 0,
        lastActiveTime: Date.now(),
      };

      if (!stored) {
        return defaultStats;
      }

      return { ...defaultStats, ...JSON.parse(stored) };
    } catch (error) {
      console.error('Failed to get usage stats:', error);
      return {
        totalSessions: 0,
        averageSessionDuration: 0,
        totalForegroundTime: 0,
        lastActiveTime: 0,
      };
    }
  }

  /**
   * Update app usage statistics
   */
  async updateUsageStats(): Promise<void> {
    try {
      const currentStats = await this.getUsageStats();
      const sessionDuration = this.getSessionDuration();
      
      const updatedStats = {
        totalSessions: currentStats.totalSessions + 1,
        averageSessionDuration: 
          (currentStats.averageSessionDuration * currentStats.totalSessions + sessionDuration) / 
          (currentStats.totalSessions + 1),
        totalForegroundTime: currentStats.totalForegroundTime + (this.getForegroundDuration() || 0),
        lastActiveTime: Date.now(),
      };

      await AsyncStorage.setItem('appUsageStats', JSON.stringify(updatedStats));
    } catch (error) {
      console.error('Failed to update usage stats:', error);
    }
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    if (this.appStateSubscription) {
      this.appStateSubscription.remove();
      this.appStateSubscription = null;
    }
    this.listeners = [];
  }
}

// Export singleton instance
export const appStateService = AppStateService.getInstance();
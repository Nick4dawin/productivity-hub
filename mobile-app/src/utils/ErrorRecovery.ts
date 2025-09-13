import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { errorHandler } from '../services/ErrorHandler';

// Error recovery strategies
export enum RecoveryStrategy {
  RETRY = 'retry',
  FALLBACK = 'fallback',
  CACHE = 'cache',
  OFFLINE = 'offline',
  RESET = 'reset',
}

// Recovery action interface
export interface RecoveryAction {
  strategy: RecoveryStrategy;
  action: () => Promise<any>;
  fallbackData?: any;
  maxRetries?: number;
  retryDelay?: number;
}

// Recovery result
export interface RecoveryResult<T = any> {
  success: boolean;
  data?: T;
  error?: Error;
  strategy: RecoveryStrategy;
  attempts: number;
}

// Error recovery manager
export class ErrorRecoveryManager {
  private static instance: ErrorRecoveryManager;
  private recoveryAttempts = new Map<string, number>();

  private constructor() {}

  static getInstance(): ErrorRecoveryManager {
    if (!ErrorRecoveryManager.instance) {
      ErrorRecoveryManager.instance = new ErrorRecoveryManager();
    }
    return ErrorRecoveryManager.instance;
  }

  // Execute action with recovery strategies
  async executeWithRecovery<T>(
    actionId: string,
    primaryAction: () => Promise<T>,
    recoveryActions: RecoveryAction[]
  ): Promise<RecoveryResult<T>> {
    let lastError: Error | undefined;
    let attempts = 0;

    // Try primary action first
    try {
      const result = await primaryAction();
      this.resetAttempts(actionId);
      return {
        success: true,
        data: result,
        strategy: RecoveryStrategy.RETRY,
        attempts: 1,
      };
    } catch (error) {
      lastError = error as Error;
      attempts = 1;
      
      errorHandler.addBreadcrumb(
        `Primary action failed: ${actionId}`,
        'error_recovery'
      );
    }

    // Try recovery strategies
    for (const recovery of recoveryActions) {
      try {
        const currentAttempts = this.getAttempts(actionId);
        const maxRetries = recovery.maxRetries || 3;

        if (currentAttempts >= maxRetries) {
          continue; // Skip this strategy if max retries exceeded
        }

        // Add delay if specified
        if (recovery.retryDelay && currentAttempts > 0) {
          await this.delay(recovery.retryDelay * currentAttempts);
        }

        const result = await recovery.action();
        this.resetAttempts(actionId);
        
        errorHandler.addBreadcrumb(
          `Recovery successful: ${actionId} using ${recovery.strategy}`,
          'error_recovery'
        );

        return {
          success: true,
          data: result,
          strategy: recovery.strategy,
          attempts: attempts + currentAttempts + 1,
        };
      } catch (recoveryError) {
        this.incrementAttempts(actionId);
        lastError = recoveryError as Error;
        attempts++;
        
        errorHandler.addBreadcrumb(
          `Recovery failed: ${actionId} using ${recovery.strategy}`,
          'error_recovery'
        );
      }
    }

    // All recovery strategies failed
    return {
      success: false,
      error: lastError,
      strategy: RecoveryStrategy.RETRY,
      attempts,
    };
  }

  // Retry with exponential backoff
  async retryWithBackoff<T>(
    action: () => Promise<T>,
    maxRetries = 3,
    baseDelay = 1000
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await action();
      } catch (error) {
        lastError = error as Error;
        
        if (attempt < maxRetries - 1) {
          const delay = baseDelay * Math.pow(2, attempt);
          await this.delay(delay);
        }
      }
    }

    throw lastError!;
  }

  // Circuit breaker pattern
  async executeWithCircuitBreaker<T>(
    actionId: string,
    action: () => Promise<T>,
    options: {
      failureThreshold?: number;
      resetTimeout?: number;
      fallback?: () => Promise<T>;
    } = {}
  ): Promise<T> {
    const {
      failureThreshold = 5,
      resetTimeout = 60000, // 1 minute
      fallback,
    } = options;

    const circuitKey = `circuit_${actionId}`;
    const failureCountKey = `failures_${actionId}`;
    const lastFailureKey = `last_failure_${actionId}`;

    // Check circuit state
    const circuitState = await AsyncStorage.getItem(circuitKey);
    const failureCount = parseInt(await AsyncStorage.getItem(failureCountKey) || '0');
    const lastFailureTime = parseInt(await AsyncStorage.getItem(lastFailureKey) || '0');

    // If circuit is open, check if we should try again
    if (circuitState === 'open') {
      const timeSinceLastFailure = Date.now() - lastFailureTime;
      
      if (timeSinceLastFailure < resetTimeout) {
        if (fallback) {
          return await fallback();
        }
        throw new Error(`Circuit breaker is open for ${actionId}`);
      } else {
        // Try to close circuit (half-open state)
        await AsyncStorage.setItem(circuitKey, 'half-open');
      }
    }

    try {
      const result = await action();
      
      // Success - reset circuit
      await AsyncStorage.removeItem(circuitKey);
      await AsyncStorage.removeItem(failureCountKey);
      await AsyncStorage.removeItem(lastFailureKey);
      
      return result;
    } catch (error) {
      const newFailureCount = failureCount + 1;
      
      await AsyncStorage.setItem(failureCountKey, newFailureCount.toString());
      await AsyncStorage.setItem(lastFailureKey, Date.now().toString());
      
      if (newFailureCount >= failureThreshold) {
        await AsyncStorage.setItem(circuitKey, 'open');
      }
      
      if (fallback) {
        return await fallback();
      }
      
      throw error;
    }
  }

  // Graceful degradation
  async executeWithGracefulDegradation<T>(
    primaryAction: () => Promise<T>,
    fallbackActions: Array<() => Promise<T>>,
    defaultValue?: T
  ): Promise<T> {
    // Try primary action
    try {
      return await primaryAction();
    } catch (primaryError) {
      errorHandler.addBreadcrumb(
        'Primary action failed, trying fallbacks',
        'graceful_degradation'
      );
    }

    // Try fallback actions
    for (let i = 0; i < fallbackActions.length; i++) {
      try {
        const result = await fallbackActions[i]();
        errorHandler.addBreadcrumb(
          `Fallback ${i + 1} succeeded`,
          'graceful_degradation'
        );
        return result;
      } catch (fallbackError) {
        errorHandler.addBreadcrumb(
          `Fallback ${i + 1} failed`,
          'graceful_degradation'
        );
      }
    }

    // All actions failed, return default value if provided
    if (defaultValue !== undefined) {
      errorHandler.addBreadcrumb(
        'All actions failed, using default value',
        'graceful_degradation'
      );
      return defaultValue;
    }

    throw new Error('All recovery actions failed');
  }

  // User-guided recovery
  async promptUserRecovery<T>(
    error: Error,
    recoveryOptions: Array<{
      title: string;
      action: () => Promise<T>;
      description?: string;
    }>
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const buttons = recoveryOptions.map((option, index) => ({
        text: option.title,
        onPress: async () => {
          try {
            const result = await option.action();
            resolve(result);
          } catch (recoveryError) {
            reject(recoveryError);
          }
        },
      }));

      buttons.push({
        text: 'Cancel',
        onPress: () => reject(error),
      });

      Alert.alert(
        'Recovery Options',
        'Choose how you would like to proceed:',
        buttons
      );
    });
  }

  // Utility methods
  private getAttempts(actionId: string): number {
    return this.recoveryAttempts.get(actionId) || 0;
  }

  private incrementAttempts(actionId: string): void {
    const current = this.getAttempts(actionId);
    this.recoveryAttempts.set(actionId, current + 1);
  }

  private resetAttempts(actionId: string): void {
    this.recoveryAttempts.delete(actionId);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Clear all recovery state
  clearRecoveryState(): void {
    this.recoveryAttempts.clear();
  }
}

// Singleton instance
export const errorRecoveryManager = ErrorRecoveryManager.getInstance();

// Utility functions for common recovery patterns
export const withRetry = async <T>(
  action: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> => {
  return errorRecoveryManager.retryWithBackoff(action, maxRetries, delay);
};

export const withFallback = async <T>(
  primaryAction: () => Promise<T>,
  fallbackAction: () => Promise<T>
): Promise<T> => {
  return errorRecoveryManager.executeWithGracefulDegradation(
    primaryAction,
    [fallbackAction]
  );
};

export const withCircuitBreaker = async <T>(
  actionId: string,
  action: () => Promise<T>,
  fallback?: () => Promise<T>
): Promise<T> => {
  return errorRecoveryManager.executeWithCircuitBreaker(actionId, action, {
    fallback,
  });
};
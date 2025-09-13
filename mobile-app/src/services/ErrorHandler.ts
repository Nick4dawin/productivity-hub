import { Alert } from 'react-native';

// Error types
export class NetworkError extends Error {
  constructor(message: string, public statusCode?: number) {
    super(message);
    this.name = 'NetworkError';
  }
}

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthError';
  }
}

export class ValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class OfflineError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'OfflineError';
  }
}

export class CacheError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CacheError';
  }
}

// Error severity levels
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

// Error context interface
export interface ErrorContext {
  userId?: string;
  screen?: string;
  action?: string;
  timestamp: number;
  deviceInfo?: {
    platform: string;
    version: string;
    model?: string;
  };
  appVersion?: string;
  buildNumber?: string;
}

// Error report interface
export interface ErrorReport {
  error: Error;
  severity: ErrorSeverity;
  context: ErrorContext;
  stackTrace?: string;
  breadcrumbs?: string[];
}

// Crash reporting service interface
export interface CrashReportingService {
  recordError(report: ErrorReport): Promise<void>;
  setUserContext(userId: string, userInfo?: Record<string, any>): void;
  addBreadcrumb(message: string, category?: string): void;
  setCustomData(key: string, value: any): void;
}

// Mock crash reporting service (replace with actual service like Crashlytics)
class MockCrashReportingService implements CrashReportingService {
  private breadcrumbs: string[] = [];
  private customData: Record<string, any> = {};
  private userContext: { userId?: string; userInfo?: Record<string, any> } = {};

  async recordError(report: ErrorReport): Promise<void> {
    if (__DEV__) {
      console.group('🚨 Error Report');
      console.error('Error:', report.error);
      console.log('Severity:', report.severity);
      console.log('Context:', report.context);
      console.log('Breadcrumbs:', this.breadcrumbs);
      console.log('Custom Data:', this.customData);
      console.groupEnd();
    }

    // In production, this would send to actual crash reporting service
    // Example: await crashlytics().recordError(report.error);
  }

  setUserContext(userId: string, userInfo?: Record<string, any>): void {
    this.userContext = { userId, userInfo };
  }

  addBreadcrumb(message: string, category = 'general'): void {
    const breadcrumb = `[${category}] ${new Date().toISOString()}: ${message}`;
    this.breadcrumbs.push(breadcrumb);
    
    // Keep only last 50 breadcrumbs
    if (this.breadcrumbs.length > 50) {
      this.breadcrumbs = this.breadcrumbs.slice(-50);
    }
  }

  setCustomData(key: string, value: any): void {
    this.customData[key] = value;
  }
}

// Main error handler class
export class ErrorHandler {
  private static instance: ErrorHandler;
  private crashReportingService: CrashReportingService;
  private errorQueue: ErrorReport[] = [];
  private isProcessingQueue = false;

  private constructor() {
    this.crashReportingService = new MockCrashReportingService();
    this.setupGlobalErrorHandlers();
  }

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  // Set up global error handlers
  private setupGlobalErrorHandlers(): void {
    // Handle unhandled promise rejections
    const originalHandler = global.ErrorUtils?.getGlobalHandler();
    
    global.ErrorUtils?.setGlobalHandler((error: Error, isFatal?: boolean) => {
      this.handleError(error, {
        severity: isFatal ? ErrorSeverity.CRITICAL : ErrorSeverity.HIGH,
        context: {
          timestamp: Date.now(),
          screen: 'unknown',
          action: 'global_error',
        },
      });

      // Call original handler if it exists
      if (originalHandler) {
        originalHandler(error, isFatal);
      }
    });

    // Handle unhandled promise rejections
    if (typeof global.addEventListener === 'function') {
      global.addEventListener('unhandledrejection', (event) => {
        this.handleError(new Error(event.reason), {
          severity: ErrorSeverity.HIGH,
          context: {
            timestamp: Date.now(),
            screen: 'unknown',
            action: 'unhandled_promise_rejection',
          },
        });
      });
    }
  }

  // Main error handling method
  async handleError(
    error: Error,
    options: {
      severity?: ErrorSeverity;
      context?: Partial<ErrorContext>;
      showUserMessage?: boolean;
      userMessage?: string;
    } = {}
  ): Promise<void> {
    const {
      severity = this.determineSeverity(error),
      context = {},
      showUserMessage = true,
      userMessage,
    } = options;

    // Create error report
    const report: ErrorReport = {
      error,
      severity,
      context: {
        timestamp: Date.now(),
        ...context,
      },
      stackTrace: error.stack,
    };

    // Add to queue for processing
    this.errorQueue.push(report);
    this.processErrorQueue();

    // Show user-friendly message if needed
    if (showUserMessage) {
      this.showUserErrorMessage(error, userMessage);
    }

    // Add breadcrumb
    this.crashReportingService.addBreadcrumb(
      `Error: ${error.message}`,
      'error'
    );
  }

  // Process error queue
  private async processErrorQueue(): Promise<void> {
    if (this.isProcessingQueue || this.errorQueue.length === 0) {
      return;
    }

    this.isProcessingQueue = true;

    try {
      while (this.errorQueue.length > 0) {
        const report = this.errorQueue.shift();
        if (report) {
          await this.crashReportingService.recordError(report);
        }
      }
    } catch (processingError) {
      console.error('Failed to process error queue:', processingError);
    } finally {
      this.isProcessingQueue = false;
    }
  }

  // Determine error severity
  private determineSeverity(error: Error): ErrorSeverity {
    if (error instanceof AuthError) {
      return ErrorSeverity.MEDIUM;
    }
    
    if (error instanceof NetworkError) {
      return error.statusCode && error.statusCode >= 500 
        ? ErrorSeverity.HIGH 
        : ErrorSeverity.MEDIUM;
    }
    
    if (error instanceof ValidationError) {
      return ErrorSeverity.LOW;
    }
    
    if (error instanceof OfflineError) {
      return ErrorSeverity.LOW;
    }

    // Default to medium for unknown errors
    return ErrorSeverity.MEDIUM;
  }

  // Show user-friendly error message
  private showUserErrorMessage(error: Error, customMessage?: string): void {
    let title = 'Something went wrong';
    let message = customMessage || this.getUserFriendlyMessage(error);

    if (error instanceof NetworkError) {
      title = 'Connection Error';
      message = customMessage || 'Please check your internet connection and try again.';
    } else if (error instanceof AuthError) {
      title = 'Authentication Error';
      message = customMessage || 'Please log in again to continue.';
    } else if (error instanceof ValidationError) {
      title = 'Invalid Input';
      message = customMessage || error.message;
    } else if (error instanceof OfflineError) {
      title = 'Offline Mode';
      message = customMessage || 'This action will be completed when you\'re back online.';
    }

    Alert.alert(title, message, [
      { text: 'OK', style: 'default' },
      {
        text: 'Report Issue',
        style: 'cancel',
        onPress: () => this.showReportDialog(error),
      },
    ]);
  }

  // Get user-friendly error message
  private getUserFriendlyMessage(error: Error): string {
    const errorMessages: Record<string, string> = {
      'Network request failed': 'Unable to connect to our servers. Please check your internet connection.',
      'Request timeout': 'The request took too long. Please try again.',
      'Invalid credentials': 'The email or password you entered is incorrect.',
      'User not found': 'No account found with this email address.',
      'Email already exists': 'An account with this email already exists.',
      'Validation failed': 'Please check your input and try again.',
    };

    return errorMessages[error.message] || 'An unexpected error occurred. Please try again.';
  }

  // Show error report dialog
  private showReportDialog(error: Error): void {
    Alert.alert(
      'Report Issue',
      'Would you like to send a report to help us fix this issue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send Report',
          onPress: () => {
            this.crashReportingService.addBreadcrumb(
              'User reported issue',
              'user_action'
            );
            // In a real app, this might open an email or feedback form
            Alert.alert('Thank you', 'Your report has been sent.');
          },
        },
      ]
    );
  }

  // Public methods for adding context
  setUserContext(userId: string, userInfo?: Record<string, any>): void {
    this.crashReportingService.setUserContext(userId, userInfo);
  }

  addBreadcrumb(message: string, category?: string): void {
    this.crashReportingService.addBreadcrumb(message, category);
  }

  setCustomData(key: string, value: any): void {
    this.crashReportingService.setCustomData(key, value);
  }

  // Utility methods for common error scenarios
  handleApiError(error: any, context?: Partial<ErrorContext>): void {
    let processedError: Error;

    if (error.response) {
      // HTTP error response
      const status = error.response.status;
      const message = error.response.data?.message || error.message;
      
      if (status === 401) {
        processedError = new AuthError('Authentication required');
      } else if (status >= 500) {
        processedError = new NetworkError('Server error', status);
      } else if (status >= 400) {
        processedError = new ValidationError(message);
      } else {
        processedError = new NetworkError(message, status);
      }
    } else if (error.request) {
      // Network error
      processedError = new NetworkError('Network request failed');
    } else {
      // Other error
      processedError = error instanceof Error ? error : new Error(String(error));
    }

    this.handleError(processedError, { context });
  }

  handleValidationError(message: string, field?: string): void {
    this.handleError(new ValidationError(message, field), {
      severity: ErrorSeverity.LOW,
      showUserMessage: true,
    });
  }

  handleOfflineError(message: string): void {
    this.handleError(new OfflineError(message), {
      severity: ErrorSeverity.LOW,
      showUserMessage: true,
      userMessage: 'This action will be completed when you\'re back online.',
    });
  }
}

// Singleton instance
export const errorHandler = ErrorHandler.getInstance();

// React hook for error handling
export const useErrorHandler = () => {
  const handleError = (error: Error, options?: Parameters<typeof errorHandler.handleError>[1]) => {
    errorHandler.handleError(error, options);
  };

  const handleApiError = (error: any, context?: Partial<ErrorContext>) => {
    errorHandler.handleApiError(error, context);
  };

  const handleValidationError = (message: string, field?: string) => {
    errorHandler.handleValidationError(message, field);
  };

  const addBreadcrumb = (message: string, category?: string) => {
    errorHandler.addBreadcrumb(message, category);
  };

  return {
    handleError,
    handleApiError,
    handleValidationError,
    addBreadcrumb,
  };
};
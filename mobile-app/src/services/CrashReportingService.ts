import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Types for crash reporting
export interface CrashReport {
  id: string;
  timestamp: number;
  error: {
    name: string;
    message: string;
    stack?: string;
  };
  context: {
    userId?: string;
    screen?: string;
    action?: string;
    appVersion?: string;
    buildNumber?: string;
    platform: string;
    osVersion?: string;
    deviceModel?: string;
  };
  breadcrumbs: Breadcrumb[];
  customData: Record<string, any>;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface Breadcrumb {
  timestamp: number;
  message: string;
  category: string;
  level: 'info' | 'warning' | 'error';
}

export interface UserContext {
  userId: string;
  email?: string;
  name?: string;
  customAttributes?: Record<string, any>;
}

// Abstract crash reporting service
export abstract class CrashReportingService {
  protected breadcrumbs: Breadcrumb[] = [];
  protected customData: Record<string, any> = {};
  protected userContext?: UserContext;

  abstract initialize(): Promise<void>;
  abstract recordError(report: CrashReport): Promise<void>;
  abstract recordNonFatalError(error: Error, context?: Record<string, any>): Promise<void>;
  abstract setUserContext(user: UserContext): void;
  abstract clearUserContext(): void;

  // Common methods
  addBreadcrumb(message: string, category = 'general', level: Breadcrumb['level'] = 'info'): void {
    const breadcrumb: Breadcrumb = {
      timestamp: Date.now(),
      message,
      category,
      level,
    };

    this.breadcrumbs.push(breadcrumb);

    // Keep only last 100 breadcrumbs
    if (this.breadcrumbs.length > 100) {
      this.breadcrumbs = this.breadcrumbs.slice(-100);
    }
  }

  setCustomData(key: string, value: any): void {
    this.customData[key] = value;
  }

  removeCustomData(key: string): void {
    delete this.customData[key];
  }

  clearBreadcrumbs(): void {
    this.breadcrumbs = [];
  }

  protected createCrashReport(
    error: Error,
    severity: CrashReport['severity'] = 'medium',
    context: Partial<CrashReport['context']> = {}
  ): CrashReport {
    return {
      id: this.generateReportId(),
      timestamp: Date.now(),
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      context: {
        platform: Platform.OS,
        osVersion: Platform.Version.toString(),
        ...context,
      },
      breadcrumbs: [...this.breadcrumbs],
      customData: { ...this.customData },
      severity,
    };
  }

  private generateReportId(): string {
    return `crash_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Local crash reporting service (stores crashes locally)
export class LocalCrashReportingService extends CrashReportingService {
  private readonly STORAGE_KEY = 'crash_reports';
  private readonly MAX_STORED_REPORTS = 50;

  async initialize(): Promise<void> {
    // Clean up old reports on initialization
    await this.cleanupOldReports();
  }

  async recordError(report: CrashReport): Promise<void> {
    try {
      const existingReports = await this.getStoredReports();
      const updatedReports = [report, ...existingReports].slice(0, this.MAX_STORED_REPORTS);
      
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedReports));
      
      if (__DEV__) {
        console.group('🚨 Crash Report Recorded');
        console.error('Error:', report.error);
        console.log('Context:', report.context);
        console.log('Breadcrumbs:', report.breadcrumbs);
        console.groupEnd();
      }
    } catch (storageError) {
      console.error('Failed to store crash report:', storageError);
    }
  }

  async recordNonFatalError(error: Error, context?: Record<string, any>): Promise<void> {
    const report = this.createCrashReport(error, 'medium', context);
    await this.recordError(report);
  }

  setUserContext(user: UserContext): void {
    this.userContext = user;
  }

  clearUserContext(): void {
    this.userContext = undefined;
  }

  // Additional methods for local service
  async getStoredReports(): Promise<CrashReport[]> {
    try {
      const reportsJson = await AsyncStorage.getItem(this.STORAGE_KEY);
      return reportsJson ? JSON.parse(reportsJson) : [];
    } catch (error) {
      console.error('Failed to retrieve crash reports:', error);
      return [];
    }
  }

  async clearStoredReports(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear crash reports:', error);
    }
  }

  async exportReports(): Promise<string> {
    const reports = await this.getStoredReports();
    return JSON.stringify(reports, null, 2);
  }

  private async cleanupOldReports(): Promise<void> {
    const reports = await this.getStoredReports();
    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    
    const recentReports = reports.filter(report => report.timestamp > oneWeekAgo);
    
    if (recentReports.length !== reports.length) {
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(recentReports));
    }
  }
}

// Firebase Crashlytics service (placeholder - would need actual Firebase setup)
export class FirebaseCrashlyticsService extends CrashReportingService {
  async initialize(): Promise<void> {
    // Initialize Firebase Crashlytics
    // await crashlytics().setCrashlyticsCollectionEnabled(true);
    console.log('Firebase Crashlytics initialized (placeholder)');
  }

  async recordError(report: CrashReport): Promise<void> {
    try {
      // Record to Firebase Crashlytics
      // await crashlytics().recordError(new Error(report.error.message));
      // await crashlytics().setAttributes(report.customData);
      
      if (__DEV__) {
        console.group('🚨 Firebase Crash Report');
        console.error('Error:', report.error);
        console.log('Context:', report.context);
        console.groupEnd();
      }
    } catch (error) {
      console.error('Failed to record crash to Firebase:', error);
    }
  }

  async recordNonFatalError(error: Error, context?: Record<string, any>): Promise<void> {
    try {
      // await crashlytics().recordError(error);
      if (context) {
        // await crashlytics().setAttributes(context);
      }
    } catch (reportingError) {
      console.error('Failed to record non-fatal error:', reportingError);
    }
  }

  setUserContext(user: UserContext): void {
    this.userContext = user;
    // await crashlytics().setUserId(user.userId);
    // if (user.email) await crashlytics().setAttribute('email', user.email);
    // if (user.name) await crashlytics().setAttribute('name', user.name);
  }

  clearUserContext(): void {
    this.userContext = undefined;
    // await crashlytics().setUserId('');
  }
}

// Sentry service (placeholder - would need actual Sentry setup)
export class SentryService extends CrashReportingService {
  async initialize(): Promise<void> {
    // Initialize Sentry
    // Sentry.init({ dsn: 'YOUR_DSN_HERE' });
    console.log('Sentry initialized (placeholder)');
  }

  async recordError(report: CrashReport): Promise<void> {
    try {
      // Sentry.captureException(new Error(report.error.message), {
      //   contexts: { crash_context: report.context },
      //   extra: report.customData,
      //   level: report.severity,
      // });
      
      if (__DEV__) {
        console.group('🚨 Sentry Crash Report');
        console.error('Error:', report.error);
        console.log('Context:', report.context);
        console.groupEnd();
      }
    } catch (error) {
      console.error('Failed to record crash to Sentry:', error);
    }
  }

  async recordNonFatalError(error: Error, context?: Record<string, any>): Promise<void> {
    try {
      // Sentry.captureException(error, { extra: context });
    } catch (reportingError) {
      console.error('Failed to record non-fatal error:', reportingError);
    }
  }

  setUserContext(user: UserContext): void {
    this.userContext = user;
    // Sentry.setUser({
    //   id: user.userId,
    //   email: user.email,
    //   username: user.name,
    // });
  }

  clearUserContext(): void {
    this.userContext = undefined;
    // Sentry.setUser(null);
  }
}

// Factory for creating crash reporting service
export class CrashReportingFactory {
  static create(type: 'local' | 'firebase' | 'sentry' = 'local'): CrashReportingService {
    switch (type) {
      case 'firebase':
        return new FirebaseCrashlyticsService();
      case 'sentry':
        return new SentryService();
      case 'local':
      default:
        return new LocalCrashReportingService();
    }
  }
}

// Singleton instance
export const crashReportingService = CrashReportingFactory.create('local');
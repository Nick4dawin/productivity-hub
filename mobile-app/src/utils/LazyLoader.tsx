import React, { lazy, Suspense, ComponentType } from 'react';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

// Higher-order component for lazy loading screens
export function withLazyLoading<P extends object>(
  importFunc: () => Promise<{ default: ComponentType<P> }>,
  fallback?: React.ComponentType
) {
  const LazyComponent = lazy(importFunc);
  const FallbackComponent = fallback || LoadingSpinner;

  return (props: P) => (
    <Suspense fallback={<FallbackComponent />}>
      <LazyComponent {...props} />
    </Suspense>
  );
}

// Lazy load heavy screens
export const LazyAnalyticsScreen = withLazyLoading(
  () => import('../screens/dashboard/AnalyticsScreen')
);

export const LazyHabitAnalyticsScreen = withLazyLoading(
  () => import('../screens/habits/HabitAnalyticsScreen')
);

export const LazyMediaAnalyticsScreen = withLazyLoading(
  () => import('../screens/media/MediaAnalyticsScreen')
);

export const LazyCoachScreen = withLazyLoading(
  () => import('../screens/coach/CoachScreen')
);

// Lazy load heavy components
export const LazyVictoryChart = withLazyLoading(
  () => import('victory-native').then(module => ({ default: module.VictoryChart }))
);

export const LazyImagePicker = withLazyLoading(
  () => import('react-native-image-picker').then(module => ({ default: module }))
);

// Dynamic import utility for conditional loading
export class DynamicImporter {
  private static cache = new Map<string, any>();

  static async importModule<T>(
    key: string,
    importFunc: () => Promise<T>
  ): Promise<T> {
    if (this.cache.has(key)) {
      return this.cache.get(key);
    }

    try {
      const module = await importFunc();
      this.cache.set(key, module);
      return module;
    } catch (error) {
      console.error(`Failed to import module ${key}:`, error);
      throw error;
    }
  }

  static clearCache(key?: string) {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }
}

// Conditional feature loading based on platform or user preferences
export class FeatureLoader {
  static async loadCameraFeature() {
    return DynamicImporter.importModule(
      'camera',
      () => import('../services/CameraService')
    );
  }

  static async loadBiometricFeature() {
    return DynamicImporter.importModule(
      'biometric',
      () => import('../services/BiometricService')
    );
  }

  static async loadAnalyticsFeature() {
    return DynamicImporter.importModule(
      'analytics',
      () => import('../hooks/useAnalytics')
    );
  }

  static async loadChartingLibrary() {
    return DynamicImporter.importModule(
      'victory',
      () => import('victory-native')
    );
  }
}

// Bundle analyzer helper (development only)
export class BundleAnalyzer {
  static logBundleSize() {
    if (__DEV__) {
      console.log('Bundle analysis - Cache size:', DynamicImporter['cache'].size);
      console.log('Cached modules:', Array.from(DynamicImporter['cache'].keys()));
    }
  }

  static measureComponentRender<P>(
    Component: ComponentType<P>,
    name: string
  ): ComponentType<P> {
    if (!__DEV__) return Component;

    return (props: P) => {
      const startTime = performance.now();
      
      React.useEffect(() => {
        const endTime = performance.now();
        console.log(`${name} render time: ${endTime - startTime}ms`);
      });

      return <Component {...props} />;
    };
  }
}
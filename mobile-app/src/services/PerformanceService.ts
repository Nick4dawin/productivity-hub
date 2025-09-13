import { InteractionManager, Dimensions } from 'react-native';

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  metadata?: Record<string, any>;
}

interface MemoryInfo {
  jsHeapSizeLimit: number;
  totalJSHeapSize: number;
  usedJSHeapSize: number;
}

class PerformanceService {
  private metrics: PerformanceMetric[] = [];
  private observers: Map<string, (metric: PerformanceMetric) => void> = new Map();
  private isMonitoring = false;

  // Start performance monitoring
  startMonitoring() {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    this.setupMemoryMonitoring();
    this.setupInteractionMonitoring();
  }

  // Stop performance monitoring
  stopMonitoring() {
    this.isMonitoring = false;
    this.observers.clear();
  }

  // Record a performance metric
  recordMetric(name: string, value: number, metadata?: Record<string, any>) {
    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
      metadata,
    };

    this.metrics.push(metric);
    this.notifyObservers(metric);

    // Keep only last 100 metrics to prevent memory leaks
    if (this.metrics.length > 100) {
      this.metrics = this.metrics.slice(-100);
    }
  }

  // Measure function execution time
  measureExecution<T>(name: string, fn: () => T): T {
    const startTime = performance.now();
    const result = fn();
    const endTime = performance.now();
    
    this.recordMetric(`execution_${name}`, endTime - startTime, {
      type: 'execution_time',
    });

    return result;
  }

  // Measure async function execution time
  async measureAsyncExecution<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const startTime = performance.now();
    const result = await fn();
    const endTime = performance.now();
    
    this.recordMetric(`async_execution_${name}`, endTime - startTime, {
      type: 'async_execution_time',
    });

    return result;
  }

  // Measure component render time
  measureRender(componentName: string) {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      this.recordMetric(`render_${componentName}`, endTime - startTime, {
        type: 'render_time',
      });
    };
  }

  // Monitor memory usage
  private setupMemoryMonitoring() {
    if (!__DEV__) return;

    const monitorMemory = () => {
      if (!this.isMonitoring) return;

      // Get memory info (if available)
      if (global.performance && global.performance.memory) {
        const memory = global.performance.memory as MemoryInfo;
        
        this.recordMetric('memory_used', memory.usedJSHeapSize, {
          type: 'memory',
          total: memory.totalJSHeapSize,
          limit: memory.jsHeapSizeLimit,
        });
      }

      // Schedule next check
      setTimeout(monitorMemory, 5000); // Check every 5 seconds
    };

    monitorMemory();
  }

  // Monitor interaction responsiveness
  private setupInteractionMonitoring() {
    let interactionStart = 0;

    const originalCreateInteractionHandle = InteractionManager.createInteractionHandle;
    const originalClearInteractionHandle = InteractionManager.clearInteractionHandle;

    InteractionManager.createInteractionHandle = () => {
      interactionStart = performance.now();
      return originalCreateInteractionHandle();
    };

    InteractionManager.clearInteractionHandle = (handle: number) => {
      if (interactionStart > 0) {
        const duration = performance.now() - interactionStart;
        this.recordMetric('interaction_duration', duration, {
          type: 'interaction',
        });
        interactionStart = 0;
      }
      return originalClearInteractionHandle(handle);
    };
  }

  // Get performance report
  getPerformanceReport() {
    const now = Date.now();
    const last5Minutes = now - 5 * 60 * 1000;
    
    const recentMetrics = this.metrics.filter(m => m.timestamp > last5Minutes);
    
    const report = {
      totalMetrics: recentMetrics.length,
      averageRenderTime: this.getAverageMetric(recentMetrics, 'render_time'),
      averageExecutionTime: this.getAverageMetric(recentMetrics, 'execution_time'),
      averageInteractionTime: this.getAverageMetric(recentMetrics, 'interaction'),
      memoryUsage: this.getLatestMetric(recentMetrics, 'memory'),
      slowestOperations: this.getSlowestOperations(recentMetrics),
    };

    return report;
  }

  // Subscribe to performance metrics
  subscribe(name: string, callback: (metric: PerformanceMetric) => void) {
    this.observers.set(name, callback);
  }

  // Unsubscribe from performance metrics
  unsubscribe(name: string) {
    this.observers.delete(name);
  }

  // Clear all metrics
  clearMetrics() {
    this.metrics = [];
  }

  // Private helper methods
  private notifyObservers(metric: PerformanceMetric) {
    this.observers.forEach(callback => {
      try {
        callback(metric);
      } catch (error) {
        console.error('Error in performance observer:', error);
      }
    });
  }

  private getAverageMetric(metrics: PerformanceMetric[], type: string): number {
    const filtered = metrics.filter(m => m.metadata?.type === type);
    if (filtered.length === 0) return 0;
    
    const sum = filtered.reduce((acc, m) => acc + m.value, 0);
    return sum / filtered.length;
  }

  private getLatestMetric(metrics: PerformanceMetric[], type: string): PerformanceMetric | null {
    const filtered = metrics.filter(m => m.metadata?.type === type);
    return filtered.length > 0 ? filtered[filtered.length - 1] : null;
  }

  private getSlowestOperations(metrics: PerformanceMetric[], limit = 5): PerformanceMetric[] {
    return metrics
      .filter(m => m.metadata?.type?.includes('execution') || m.metadata?.type === 'render_time')
      .sort((a, b) => b.value - a.value)
      .slice(0, limit);
  }
}

// Performance monitoring hooks
export const usePerformanceMonitoring = () => {
  const measureRender = (componentName: string) => {
    return performanceService.measureRender(componentName);
  };

  const measureFunction = <T>(name: string, fn: () => T): T => {
    return performanceService.measureExecution(name, fn);
  };

  const measureAsyncFunction = async <T>(name: string, fn: () => Promise<T>): Promise<T> => {
    return performanceService.measureAsyncExecution(name, fn);
  };

  return {
    measureRender,
    measureFunction,
    measureAsyncFunction,
    getReport: () => performanceService.getPerformanceReport(),
  };
};

// Singleton instance
export const performanceService = new PerformanceService();

// Auto-start monitoring in development
if (__DEV__) {
  performanceService.startMonitoring();
}
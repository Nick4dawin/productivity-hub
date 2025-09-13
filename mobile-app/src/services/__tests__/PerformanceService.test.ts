import { performanceService, usePerformanceMonitoring } from '../PerformanceService';
import { renderHook } from '@testing-library/react-native';

// Mock performance.now
const mockPerformanceNow = jest.fn();
global.performance = {
  now: mockPerformanceNow,
  memory: {
    jsHeapSizeLimit: 1000000,
    totalJSHeapSize: 500000,
    usedJSHeapSize: 300000,
  },
} as any;

describe('PerformanceService', () => {
  beforeEach(() => {
    performanceService.clearMetrics();
    mockPerformanceNow.mockReturnValue(1000);
  });

  afterEach(() => {
    performanceService.stopMonitoring();
    jest.clearAllMocks();
  });

  describe('recordMetric', () => {
    it('should record a performance metric', () => {
      performanceService.recordMetric('test_metric', 100, { type: 'test' });
      
      const report = performanceService.getPerformanceReport();
      expect(report.totalMetrics).toBe(1);
    });

    it('should limit metrics to 100 entries', () => {
      // Record 150 metrics
      for (let i = 0; i < 150; i++) {
        performanceService.recordMetric(`metric_${i}`, i);
      }
      
      const report = performanceService.getPerformanceReport();
      expect(report.totalMetrics).toBeLessThanOrEqual(100);
    });
  });

  describe('measureExecution', () => {
    it('should measure function execution time', () => {
      mockPerformanceNow
        .mockReturnValueOnce(1000) // Start time
        .mockReturnValueOnce(1100); // End time

      const result = performanceService.measureExecution('test_function', () => {
        return 'test result';
      });

      expect(result).toBe('test result');
      
      const report = performanceService.getPerformanceReport();
      expect(report.totalMetrics).toBe(1);
    });
  });

  describe('measureAsyncExecution', () => {
    it('should measure async function execution time', async () => {
      mockPerformanceNow
        .mockReturnValueOnce(1000) // Start time
        .mockReturnValueOnce(1200); // End time

      const result = await performanceService.measureAsyncExecution(
        'async_test',
        async () => {
          await new Promise(resolve => setTimeout(resolve, 10));
          return 'async result';
        }
      );

      expect(result).toBe('async result');
      
      const report = performanceService.getPerformanceReport();
      expect(report.totalMetrics).toBe(1);
    });
  });

  describe('measureRender', () => {
    it('should measure component render time', () => {
      mockPerformanceNow
        .mockReturnValueOnce(1000) // Start time
        .mockReturnValueOnce(1050); // End time

      const endMeasurement = performanceService.measureRender('TestComponent');
      endMeasurement();
      
      const report = performanceService.getPerformanceReport();
      expect(report.totalMetrics).toBe(1);
    });
  });

  describe('getPerformanceReport', () => {
    it('should generate a performance report', () => {
      performanceService.recordMetric('render_test', 50, { type: 'render_time' });
      performanceService.recordMetric('execution_test', 100, { type: 'execution_time' });
      performanceService.recordMetric('memory_test', 300000, { type: 'memory' });
      
      const report = performanceService.getPerformanceReport();
      
      expect(report.totalMetrics).toBe(3);
      expect(report.averageRenderTime).toBe(50);
      expect(report.averageExecutionTime).toBe(100);
      expect(report.memoryUsage).toBeTruthy();
    });
  });

  describe('subscribe/unsubscribe', () => {
    it('should notify observers of new metrics', () => {
      const observer = jest.fn();
      performanceService.subscribe('test_observer', observer);
      
      performanceService.recordMetric('test_metric', 100);
      
      expect(observer).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'test_metric',
          value: 100,
        })
      );
      
      performanceService.unsubscribe('test_observer');
    });
  });
});

describe('usePerformanceMonitoring', () => {
  it('should provide performance monitoring utilities', () => {
    const { result } = renderHook(() => usePerformanceMonitoring());
    
    expect(result.current.measureRender).toBeDefined();
    expect(result.current.measureFunction).toBeDefined();
    expect(result.current.measureAsyncFunction).toBeDefined();
    expect(result.current.getReport).toBeDefined();
  });

  it('should measure function execution through hook', () => {
    const { result } = renderHook(() => usePerformanceMonitoring());
    
    mockPerformanceNow
      .mockReturnValueOnce(1000)
      .mockReturnValueOnce(1100);

    const testResult = result.current.measureFunction('hook_test', () => {
      return 'hook result';
    });

    expect(testResult).toBe('hook result');
  });
});
import React from 'react';
import { render } from '../../test-utils';
import { VirtualizedList } from '../../components/performance/VirtualizedList';
import { MemoizedChart, MemoizedListItem } from '../../components/performance/MemoizedComponents';
import { HabitsScreen } from '../../screens/habits/HabitsScreen';
import { expectRenderTimeUnder } from '../../test-utils';

// Mock large datasets
const generateLargeDataset = (size: number) => {
  return Array.from({ length: size }, (_, index) => ({
    id: `item-${index}`,
    name: `Item ${index}`,
    value: Math.random() * 100,
  }));
};

const generateChartData = (size: number) => {
  return Array.from({ length: size }, (_, index) => ({
    x: index,
    y: Math.random() * 100,
  }));
};

describe('Render Performance Tests', () => {
  describe('VirtualizedList Performance', () => {
    it('should render large list efficiently', async () => {
      const largeDataset = generateLargeDataset(1000);
      
      const renderItem = ({ item }: { item: typeof largeDataset[0] }) => (
        <MemoizedListItem
          id={item.id}
          title={item.name}
          value={item.value.toString()}
        />
      );

      await expectRenderTimeUnder(() => {
        render(
          <VirtualizedList
            data={largeDataset}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            itemHeight={80}
          />
        );
      }, 100); // Should render under 100ms
    });

    it('should handle rapid data updates efficiently', async () => {
      const initialData = generateLargeDataset(100);
      
      const renderItem = ({ item }: { item: typeof initialData[0] }) => (
        <MemoizedListItem
          id={item.id}
          title={item.name}
          value={item.value.toString()}
        />
      );

      const { rerender } = render(
        <VirtualizedList
          data={initialData}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
        />
      );

      // Simulate rapid updates
      for (let i = 0; i < 10; i++) {
        const updatedData = generateLargeDataset(100);
        
        await expectRenderTimeUnder(() => {
          rerender(
            <VirtualizedList
              data={updatedData}
              renderItem={renderItem}
              keyExtractor={(item) => item.id}
            />
          );
        }, 50); // Each update should be under 50ms
      }
    });
  });

  describe('Chart Performance', () => {
    it('should render complex charts efficiently', async () => {
      const chartData = generateChartData(100);

      await expectRenderTimeUnder(() => {
        render(
          <MemoizedChart
            data={chartData}
            type="line"
            width={300}
            height={200}
            animate={false} // Disable animation for performance test
          />
        );
      }, 200); // Should render under 200ms
    });

    it('should handle chart data updates efficiently', async () => {
      const initialData = generateChartData(50);

      const { rerender } = render(
        <MemoizedChart
          data={initialData}
          type="line"
          width={300}
          height={200}
          animate={false}
        />
      );

      // Test multiple data updates
      for (let i = 0; i < 5; i++) {
        const newData = generateChartData(50);
        
        await expectRenderTimeUnder(() => {
          rerender(
            <MemoizedChart
              data={newData}
              type="line"
              width={300}
              height={200}
              animate={false}
            />
          );
        }, 100); // Each update should be under 100ms
      }
    });
  });

  describe('Screen Performance', () => {
    it('should render HabitsScreen efficiently', async () => {
      const mockNavigation = {
        navigate: jest.fn(),
        goBack: jest.fn(),
        reset: jest.fn(),
        setOptions: jest.fn(),
      };

      await expectRenderTimeUnder(() => {
        render(
          <HabitsScreen 
            navigation={mockNavigation as any} 
            route={{} as any} 
          />
        );
      }, 300); // Should render under 300ms
    });
  });

  describe('Memory Performance', () => {
    it('should not create memory leaks with large lists', () => {
      const largeDataset = generateLargeDataset(1000);
      
      const renderItem = ({ item }: { item: typeof largeDataset[0] }) => (
        <MemoizedListItem
          id={item.id}
          title={item.name}
          value={item.value.toString()}
        />
      );

      const { unmount } = render(
        <VirtualizedList
          data={largeDataset}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
        />
      );

      // Unmount should clean up properly
      expect(() => unmount()).not.toThrow();
    });

    it('should handle component remounting efficiently', async () => {
      const data = generateLargeDataset(100);
      
      const renderItem = ({ item }: { item: typeof data[0] }) => (
        <MemoizedListItem
          id={item.id}
          title={item.name}
          value={item.value.toString()}
        />
      );

      // Mount and unmount multiple times
      for (let i = 0; i < 5; i++) {
        await expectRenderTimeUnder(() => {
          const { unmount } = render(
            <VirtualizedList
              data={data}
              renderItem={renderItem}
              keyExtractor={(item) => item.id}
            />
          );
          unmount();
        }, 150); // Each mount/unmount cycle should be under 150ms
      }
    });
  });

  describe('Memoization Performance', () => {
    it('should prevent unnecessary re-renders with memoized components', () => {
      const renderSpy = jest.fn();
      
      const TestComponent = React.memo(() => {
        renderSpy();
        return (
          <MemoizedListItem
            id="test"
            title="Test Item"
            value="100"
          />
        );
      });

      const { rerender } = render(<TestComponent />);
      
      expect(renderSpy).toHaveBeenCalledTimes(1);

      // Re-render with same props should not trigger render
      rerender(<TestComponent />);
      
      expect(renderSpy).toHaveBeenCalledTimes(1);
    });

    it('should re-render only when props change', () => {
      const renderSpy = jest.fn();
      
      const TestComponent = React.memo<{ value: string }>(({ value }) => {
        renderSpy();
        return (
          <MemoizedListItem
            id="test"
            title="Test Item"
            value={value}
          />
        );
      });

      const { rerender } = render(<TestComponent value="100" />);
      
      expect(renderSpy).toHaveBeenCalledTimes(1);

      // Re-render with different props should trigger render
      rerender(<TestComponent value="200" />);
      
      expect(renderSpy).toHaveBeenCalledTimes(2);
    });
  });
});
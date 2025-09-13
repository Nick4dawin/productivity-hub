import React from 'react';
import { Text } from 'react-native';
import { render, fireEvent } from '../../test-utils';
import { VirtualizedList } from '../performance/VirtualizedList';

const mockData = [
  { id: '1', name: 'Item 1' },
  { id: '2', name: 'Item 2' },
  { id: '3', name: 'Item 3' },
];

const renderItem = ({ item }: { item: typeof mockData[0] }) => (
  <Text testID={`item-${item.id}`}>{item.name}</Text>
);

const keyExtractor = (item: typeof mockData[0]) => item.id;

describe('VirtualizedList', () => {
  it('should render list items correctly', () => {
    const { getByTestId } = render(
      <VirtualizedList
        data={mockData}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
      />
    );

    expect(getByTestId('item-1')).toBeTruthy();
    expect(getByTestId('item-2')).toBeTruthy();
    expect(getByTestId('item-3')).toBeTruthy();
  });

  it('should show loading component when isLoading is true', () => {
    const LoadingComponent = () => <Text testID="loading">Loading...</Text>;
    
    const { getByTestId, queryByTestId } = render(
      <VirtualizedList
        data={[]}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        isLoading={true}
        loadingComponent={LoadingComponent}
      />
    );

    expect(getByTestId('loading')).toBeTruthy();
    expect(queryByTestId('item-1')).toBeFalsy();
  });

  it('should show empty component when data is empty and not loading', () => {
    const EmptyComponent = () => <Text testID="empty">No items</Text>;
    
    const { getByTestId } = render(
      <VirtualizedList
        data={[]}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        isLoading={false}
        emptyComponent={EmptyComponent}
      />
    );

    expect(getByTestId('empty')).toBeTruthy();
  });

  it('should call onRefresh when pull to refresh is triggered', () => {
    const onRefresh = jest.fn();
    
    const { getByTestId } = render(
      <VirtualizedList
        data={mockData}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        onRefresh={onRefresh}
        refreshing={false}
        testID="virtualized-list"
      />
    );

    const flatList = getByTestId('virtualized-list');
    
    // Simulate pull to refresh
    fireEvent(flatList, 'refresh');
    
    expect(onRefresh).toHaveBeenCalled();
  });

  it('should use custom item height for getItemLayout', () => {
    const customItemHeight = 100;
    
    const { getByTestId } = render(
      <VirtualizedList
        data={mockData}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        itemHeight={customItemHeight}
        testID="virtualized-list"
      />
    );

    const flatList = getByTestId('virtualized-list');
    
    // Check if the component renders without errors with custom item height
    expect(flatList).toBeTruthy();
  });

  it('should handle empty data gracefully', () => {
    const { queryByTestId } = render(
      <VirtualizedList
        data={[]}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
      />
    );

    expect(queryByTestId('item-1')).toBeFalsy();
  });

  it('should use fallback key extractor when none provided', () => {
    const { getByTestId } = render(
      <VirtualizedList
        data={mockData}
        renderItem={renderItem}
        testID="virtualized-list"
      />
    );

    // Should render without errors even without keyExtractor
    expect(getByTestId('virtualized-list')).toBeTruthy();
  });
});
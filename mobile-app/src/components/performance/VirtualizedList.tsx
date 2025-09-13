import React, { memo, useCallback, useMemo } from 'react';
import {
  FlatList,
  FlatListProps,
  ListRenderItem,
  ViewStyle,
  RefreshControl,
} from 'react-native';
import { LoadingSpinner } from '../common/LoadingSpinner';

interface VirtualizedListProps<T> extends Omit<FlatListProps<T>, 'renderItem'> {
  data: T[];
  renderItem: ListRenderItem<T>;
  itemHeight?: number;
  isLoading?: boolean;
  onRefresh?: () => void;
  refreshing?: boolean;
  emptyComponent?: React.ComponentType;
  loadingComponent?: React.ComponentType;
  estimatedItemSize?: number;
}

const ITEM_HEIGHT = 80; // Default item height
const WINDOW_SIZE = 10;
const MAX_TO_RENDER_PER_BATCH = 10;
const UPDATE_CELLS_BATCH_PERIOD = 50;

function VirtualizedListComponent<T>({
  data,
  renderItem,
  itemHeight = ITEM_HEIGHT,
  isLoading = false,
  onRefresh,
  refreshing = false,
  emptyComponent: EmptyComponent,
  loadingComponent: LoadingComponent = LoadingSpinner,
  estimatedItemSize,
  keyExtractor,
  style,
  ...props
}: VirtualizedListProps<T>) {
  // Memoize the getItemLayout function for better performance
  const getItemLayout = useCallback(
    (data: T[] | null | undefined, index: number) => ({
      length: itemHeight,
      offset: itemHeight * index,
      index,
    }),
    [itemHeight]
  );

  // Memoize the key extractor
  const memoizedKeyExtractor = useCallback(
    (item: T, index: number) => {
      if (keyExtractor) {
        return keyExtractor(item, index);
      }
      // Fallback to index if no keyExtractor provided
      return index.toString();
    },
    [keyExtractor]
  );

  // Memoize the render item to prevent unnecessary re-renders
  const memoizedRenderItem = useCallback(
    (info: { item: T; index: number }) => renderItem(info),
    [renderItem]
  );

  // Refresh control
  const refreshControl = useMemo(() => {
    if (onRefresh) {
      return (
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#007AFF"
        />
      );
    }
    return undefined;
  }, [onRefresh, refreshing]);

  // Loading state
  if (isLoading && LoadingComponent) {
    return <LoadingComponent />;
  }

  // Empty state
  if (!isLoading && data.length === 0 && EmptyComponent) {
    return <EmptyComponent />;
  }

  return (
    <FlatList
      data={data}
      renderItem={memoizedRenderItem}
      keyExtractor={memoizedKeyExtractor}
      getItemLayout={getItemLayout}
      refreshControl={refreshControl}
      // Performance optimizations
      removeClippedSubviews={true}
      maxToRenderPerBatch={MAX_TO_RENDER_PER_BATCH}
      updateCellsBatchingPeriod={UPDATE_CELLS_BATCH_PERIOD}
      windowSize={WINDOW_SIZE}
      initialNumToRender={MAX_TO_RENDER_PER_BATCH}
      // Memory optimizations
      disableVirtualization={false}
      legacyImplementation={false}
      // Style
      style={style}
      {...props}
    />
  );
}

export const VirtualizedList = memo(VirtualizedListComponent) as <T>(
  props: VirtualizedListProps<T>
) => React.ReactElement;
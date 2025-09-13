import React from 'react';
import {
  FlatList,
  View,
  Text,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { JournalEntry } from '@/types';
import { JournalItem } from './JournalItem';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

interface JournalListProps {
  entries: JournalEntry[];
  loading?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  onEntryPress: (entry: JournalEntry) => void;
  onEntryEdit: (entry: JournalEntry) => void;
  onEntryDelete: (id: string) => void;
  emptyMessage?: string;
}

export const JournalList: React.FC<JournalListProps> = ({
  entries,
  loading = false,
  refreshing = false,
  onRefresh,
  onEntryPress,
  onEntryEdit,
  onEntryDelete,
  emptyMessage = 'No journal entries yet. Start writing to capture your thoughts!',
}) => {
  const { colors } = useTheme();

  const renderItem = ({ item }: { item: JournalEntry }) => (
    <JournalItem
      entry={item}
      onPress={onEntryPress}
      onEdit={onEntryEdit}
      onDelete={onEntryDelete}
    />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
        {emptyMessage}
      </Text>
    </View>
  );

  const keyExtractor = (item: JournalEntry) => item._id;

  const getItemLayout = (data: any, index: number) => ({
    length: 120, // Approximate item height
    offset: 120 * index,
    index,
  });

  if (loading && entries.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner />
      </View>
    );
  }

  return (
    <FlatList
      data={entries}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      getItemLayout={getItemLayout}
      contentContainerStyle={[
        styles.container,
        entries.length === 0 && styles.emptyContainer,
      ]}
      showsVerticalScrollIndicator={false}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        ) : undefined
      }
      ListEmptyComponent={renderEmptyState}
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      windowSize={10}
      initialNumToRender={10}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
});
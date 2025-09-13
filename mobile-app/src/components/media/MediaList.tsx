import React from 'react';
import { FlatList, View, Text, StyleSheet, RefreshControl } from 'react-native';
import { Media } from '@/types';
import { MediaCard } from './MediaCard';
import { useTheme } from '@/contexts/ThemeContext';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

interface MediaListProps {
  media: Media[];
  loading?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  onMediaPress: (media: Media) => void;
  emptyMessage?: string;
}

export const MediaList: React.FC<MediaListProps> = ({
  media,
  loading,
  refreshing = false,
  onRefresh,
  onMediaPress,
  emptyMessage = 'No media found. Add some to get started!',
}) => {
  const { colors } = useTheme();

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner />
      </View>
    );
  }

  const renderMediaCard = ({ item }: { item: Media }) => (
    <MediaCard media={item} onPress={onMediaPress} />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>📚</Text>
      <Text style={[styles.emptyTitle, { color: colors.text }]}>
        No Media Yet
      </Text>
      <Text style={[styles.emptyMessage, { color: colors.textSecondary }]}>
        {emptyMessage}
      </Text>
    </View>
  );

  return (
    <FlatList
      data={media}
      renderItem={renderMediaCard}
      keyExtractor={(item) => item._id}
      contentContainerStyle={[
        styles.container,
        media.length === 0 && styles.emptyList,
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
      getItemLayout={(data, index) => ({
        length: 280, // Approximate item height
        offset: 280 * index,
        index,
      })}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  emptyList: {
    flex: 1,
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
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyMessage: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
});
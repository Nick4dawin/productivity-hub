import React, { useState, useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '@/contexts/ThemeContext';
import { useMedia, filterMediaByType, filterMediaByStatus, filterMediaByRating, sortMediaBy } from '@/hooks/useMedia';
import { MediaList } from '@/components/media/MediaList';
import { MediaSearch } from '@/components/media/MediaSearch';
import { MediaFilter } from '@/components/media/MediaFilter';
import { Header } from '@/components/common/Header';
import { Media } from '@/types';

export const MediaScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const { data: media = [], isLoading, refetch, isRefetching } = useMedia();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedRating, setSelectedRating] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  // Filter and sort media based on current filters
  const filteredMedia = useMemo(() => {
    let filtered = media;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(query) ||
        item.genre?.toLowerCase().includes(query) ||
        item.type.toLowerCase().includes(query)
      );
    }

    // Apply type filter
    filtered = filterMediaByType(filtered, selectedType);

    // Apply status filter
    filtered = filterMediaByStatus(filtered, selectedStatus);

    // Apply rating filter
    filtered = filterMediaByRating(filtered, selectedRating || undefined);

    // Sort by most recently updated
    return sortMediaBy(filtered, 'updatedAt', 'desc');
  }, [media, searchQuery, selectedType, selectedStatus, selectedRating]);

  const handleMediaPress = (mediaItem: Media) => {
    navigation.navigate('MediaDetail' as never, { media: mediaItem } as never);
  };

  const handleAddMedia = () => {
    navigation.navigate('AddMedia' as never);
  };

  const resetFilters = () => {
    setSelectedType('All');
    setSelectedStatus('All');
    setSelectedRating(0);
    setSearchQuery('');
  };

  const hasActiveFilters = selectedType !== 'All' || selectedStatus !== 'All' || selectedRating > 0 || searchQuery.trim();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header 
        title="Media Library" 
        rightElement={
          <View style={styles.headerButtons}>
            <TouchableOpacity onPress={() => navigation.navigate('MediaAnalytics' as never)} style={styles.headerButton}>
              <Text style={[styles.headerButtonText, { color: colors.primary }]}>Analytics</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleAddMedia} style={styles.headerButton}>
              <Text style={[styles.headerButtonText, { color: colors.primary }]}>Add</Text>
            </TouchableOpacity>
          </View>
        }
      />

      <MediaSearch onSearch={setSearchQuery} value={searchQuery} />

      <View style={styles.filterHeader}>
        <TouchableOpacity
          onPress={() => setShowFilters(!showFilters)}
          style={[styles.filterToggle, { backgroundColor: colors.surface, borderColor: colors.border }]}
        >
          <Text style={[styles.filterToggleText, { color: colors.text }]}>
            Filters {showFilters ? '▲' : '▼'}
          </Text>
          {hasActiveFilters && (
            <View style={[styles.filterIndicator, { backgroundColor: colors.primary }]} />
          )}
        </TouchableOpacity>

        {hasActiveFilters && (
          <TouchableOpacity onPress={resetFilters} style={styles.resetButton}>
            <Text style={[styles.resetButtonText, { color: colors.primary }]}>Reset</Text>
          </TouchableOpacity>
        )}
      </View>

      {showFilters && (
        <MediaFilter
          selectedType={selectedType}
          selectedStatus={selectedStatus}
          selectedRating={selectedRating}
          onTypeChange={setSelectedType}
          onStatusChange={setSelectedStatus}
          onRatingChange={setSelectedRating}
        />
      )}

      <View style={styles.listContainer}>
        <MediaList
          media={filteredMedia}
          loading={isLoading}
          refreshing={isRefetching}
          onRefresh={refetch}
          onMediaPress={handleMediaPress}
          emptyMessage={
            hasActiveFilters
              ? 'No media found matching your filters. Try adjusting your search criteria.'
              : 'No media in your library yet. Add some books, movies, TV shows, or games to get started!'
          }
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  headerButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  filterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  filterToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    position: 'relative',
  },
  filterToggleText: {
    fontSize: 14,
    fontWeight: '500',
  },
  filterIndicator: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  resetButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  resetButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  listContainer: {
    flex: 1,
  },
});
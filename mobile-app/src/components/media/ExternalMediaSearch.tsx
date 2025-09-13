import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Alert } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useSearchExternalMedia } from '@/hooks/useMedia';
import { MediaSearch } from './MediaSearch';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

interface ExternalMediaSearchProps {
  mediaType: 'Movie' | 'TV Show' | 'Book' | 'Game';
  onSelect: (media: any) => void;
}

interface ExternalMediaItem {
  id: string;
  title: string;
  imageUrl?: string;
  poster?: string;
  genre?: string;
  year?: string;
  description?: string;
  totalEpisodes?: number;
  totalPages?: number;
  rating?: number;
}

export const ExternalMediaSearch: React.FC<ExternalMediaSearchProps> = ({
  mediaType,
  onSelect,
}) => {
  const { colors } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ExternalMediaItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Mock external search since we don't have real API integration
  const mockSearch = async (query: string, type: string): Promise<ExternalMediaItem[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock data based on type
    const mockResults: Record<string, ExternalMediaItem[]> = {
      'Movie': [
        {
          id: '1',
          title: `${query} Movie`,
          imageUrl: 'https://via.placeholder.com/300x450/007AFF/FFFFFF?text=Movie',
          genre: 'Action',
          year: '2023',
          description: 'A thrilling action movie',
          rating: 4.5,
        },
        {
          id: '2',
          title: `${query} Adventure`,
          imageUrl: 'https://via.placeholder.com/300x450/34C759/FFFFFF?text=Adventure',
          genre: 'Adventure',
          year: '2022',
          description: 'An exciting adventure film',
          rating: 4.2,
        },
      ],
      'TV Show': [
        {
          id: '1',
          title: `${query} Series`,
          imageUrl: 'https://via.placeholder.com/300x450/FF9500/FFFFFF?text=TV+Show',
          genre: 'Drama',
          year: '2023',
          description: 'A compelling drama series',
          totalEpisodes: 24,
          rating: 4.7,
        },
        {
          id: '2',
          title: `${query} Chronicles`,
          imageUrl: 'https://via.placeholder.com/300x450/5856D6/FFFFFF?text=Chronicles',
          genre: 'Sci-Fi',
          year: '2022',
          description: 'A sci-fi adventure series',
          totalEpisodes: 12,
          rating: 4.3,
        },
      ],
      'Book': [
        {
          id: '1',
          title: `The ${query} Guide`,
          imageUrl: 'https://via.placeholder.com/300x450/FF3B30/FFFFFF?text=Book',
          genre: 'Non-Fiction',
          year: '2023',
          description: 'A comprehensive guide',
          totalPages: 320,
          rating: 4.4,
        },
        {
          id: '2',
          title: `${query}: A Novel`,
          imageUrl: 'https://via.placeholder.com/300x450/5AC8FA/FFFFFF?text=Novel',
          genre: 'Fiction',
          year: '2022',
          description: 'A captivating novel',
          totalPages: 450,
          rating: 4.6,
        },
      ],
      'Game': [
        {
          id: '1',
          title: `${query} Quest`,
          imageUrl: 'https://via.placeholder.com/300x450/30D158/FFFFFF?text=Game',
          genre: 'RPG',
          year: '2023',
          description: 'An epic role-playing game',
          rating: 4.8,
        },
        {
          id: '2',
          title: `${query} Adventure`,
          imageUrl: 'https://via.placeholder.com/300x450/FF453A/FFFFFF?text=Adventure',
          genre: 'Action',
          year: '2022',
          description: 'An action-packed adventure',
          rating: 4.5,
        },
      ],
    };

    return mockResults[type] || [];
  };

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      // In a real app, this would use the useSearchExternalMedia hook
      // For now, we'll use mock data
      const results = await mockSearch(query, mediaType);
      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
      Alert.alert('Error', 'Failed to search external APIs. Please try again.');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const renderSearchResult = ({ item }: { item: ExternalMediaItem }) => (
    <TouchableOpacity
      style={[styles.resultCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onPress={() => onSelect(item)}
      activeOpacity={0.7}
    >
      <View style={styles.resultContent}>
        {item.imageUrl && (
          <Image source={{ uri: item.imageUrl }} style={styles.resultImage} />
        )}
        
        <View style={styles.resultInfo}>
          <Text style={[styles.resultTitle, { color: colors.text }]} numberOfLines={2}>
            {item.title}
          </Text>
          
          <View style={styles.resultMeta}>
            {item.genre && (
              <Text style={[styles.resultGenre, { color: colors.textSecondary }]}>
                {item.genre}
              </Text>
            )}
            {item.year && (
              <Text style={[styles.resultYear, { color: colors.textSecondary }]}>
                • {item.year}
              </Text>
            )}
          </View>

          {item.description && (
            <Text style={[styles.resultDescription, { color: colors.textSecondary }]} numberOfLines={2}>
              {item.description}
            </Text>
          )}

          <View style={styles.resultDetails}>
            {item.totalEpisodes && (
              <Text style={[styles.resultDetail, { color: colors.textSecondary }]}>
                {item.totalEpisodes} episodes
              </Text>
            )}
            {item.totalPages && (
              <Text style={[styles.resultDetail, { color: colors.textSecondary }]}>
                {item.totalPages} pages
              </Text>
            )}
            {item.rating && (
              <Text style={[styles.resultRating, { color: colors.warning }]}>
                ★ {item.rating}
              </Text>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => {
    if (isSearching) {
      return (
        <View style={styles.centerContainer}>
          <LoadingSpinner />
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            Searching external APIs...
          </Text>
        </View>
      );
    }

    if (!searchQuery.trim()) {
      return (
        <View style={styles.centerContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            Search External APIs
          </Text>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            Search for {mediaType.toLowerCase()}s from external databases to quickly add them to your library.
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyIcon}>📭</Text>
        <Text style={[styles.emptyTitle, { color: colors.text }]}>
          No Results Found
        </Text>
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
          No {mediaType.toLowerCase()}s found for "{searchQuery}". Try a different search term.
        </Text>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <MediaSearch
        onSearch={handleSearch}
        placeholder={`Search for ${mediaType.toLowerCase()}s...`}
      />

      <FlatList
        data={searchResults}
        renderItem={renderSearchResult}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContainer,
          searchResults.length === 0 && styles.emptyList,
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyState}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContainer: {
    padding: 16,
  },
  emptyList: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  searchIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  resultCard: {
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  resultContent: {
    flexDirection: 'row',
    padding: 16,
  },
  resultImage: {
    width: 80,
    height: 120,
    borderRadius: 8,
    marginRight: 16,
    backgroundColor: '#f0f0f0',
  },
  resultInfo: {
    flex: 1,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  resultMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  resultGenre: {
    fontSize: 14,
    fontWeight: '500',
  },
  resultYear: {
    fontSize: 14,
    marginLeft: 4,
  },
  resultDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  resultDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
  },
  resultDetail: {
    fontSize: 12,
    fontWeight: '500',
  },
  resultRating: {
    fontSize: 14,
    fontWeight: '600',
  },
});
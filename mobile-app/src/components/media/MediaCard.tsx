import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Media } from '@/types';
import { useTheme } from '@/contexts/ThemeContext';
import { getMediaProgress } from '@/hooks/useMedia';

interface MediaCardProps {
  media: Media;
  onPress: (media: Media) => void;
}

export const MediaCard: React.FC<MediaCardProps> = ({ media, onPress }) => {
  const { colors } = useTheme();
  const progress = getMediaProgress(media);

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'Completed':
        return colors.success;
      case 'In Progress':
        return colors.warning;
      case 'Planned':
        return colors.info;
      default:
        return colors.textSecondary;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Movie':
        return '🎬';
      case 'TV Show':
        return '📺';
      case 'Book':
        return '📚';
      case 'Game':
        return '🎮';
      default:
        return '📄';
    }
  };

  const renderProgressInfo = () => {
    if (media.type === 'TV Show' && media.episodesWatched !== undefined && media.totalEpisodes) {
      return `${media.episodesWatched}/${media.totalEpisodes} episodes`;
    }
    
    if (media.type === 'Book' && media.pagesRead !== undefined && media.totalPages) {
      return `${media.pagesRead}/${media.totalPages} pages`;
    }
    
    return null;
  };

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onPress={() => onPress(media)}
      activeOpacity={0.7}
    >
      <View style={styles.imageContainer}>
        {media.imageUrl ? (
          <Image source={{ uri: media.imageUrl }} style={styles.image} />
        ) : (
          <View style={[styles.placeholderImage, { backgroundColor: colors.background }]}>
            <Text style={styles.typeIcon}>{getTypeIcon(media.type)}</Text>
          </View>
        )}
        
        {progress > 0 && progress < 100 && (
          <View style={[styles.progressBar, { backgroundColor: colors.background }]}>
            <View 
              style={[
                styles.progressFill, 
                { 
                  backgroundColor: colors.primary,
                  width: `${progress}%`
                }
              ]} 
            />
          </View>
        )}
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
            {media.title}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(media.status) }]}>
            <Text style={[styles.statusText, { color: colors.surface }]}>
              {media.status || 'Unknown'}
            </Text>
          </View>
        </View>

        <View style={styles.metadata}>
          <Text style={[styles.type, { color: colors.textSecondary }]}>
            {getTypeIcon(media.type)} {media.type}
          </Text>
          
          {media.genre && (
            <Text style={[styles.genre, { color: colors.textSecondary }]}>
              • {media.genre}
            </Text>
          )}
        </View>

        {renderProgressInfo() && (
          <Text style={[styles.progress, { color: colors.textSecondary }]}>
            {renderProgressInfo()}
          </Text>
        )}

        {media.rating && (
          <View style={styles.rating}>
            <Text style={[styles.ratingText, { color: colors.warning }]}>
              {'★'.repeat(Math.floor(media.rating))}
              {'☆'.repeat(5 - Math.floor(media.rating))}
            </Text>
            <Text style={[styles.ratingValue, { color: colors.textSecondary }]}>
              {media.rating}/5
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
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
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  placeholderImage: {
    width: '100%',
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  typeIcon: {
    fontSize: 48,
  },
  progressBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 4,
  },
  progressFill: {
    height: '100%',
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  metadata: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  type: {
    fontSize: 14,
    fontWeight: '500',
  },
  genre: {
    fontSize: 14,
    marginLeft: 4,
  },
  progress: {
    fontSize: 14,
    marginBottom: 8,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 16,
    marginRight: 8,
  },
  ratingValue: {
    fontSize: 14,
  },
});
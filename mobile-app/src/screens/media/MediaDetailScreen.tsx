import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useTheme } from '@/contexts/ThemeContext';
import { useUpdateMedia, useDeleteMedia, getMediaProgress } from '@/hooks/useMedia';
import { Media } from '@/types';
import { Header } from '@/components/common/Header';
import { Button } from '@/components/common/Button';
import { MediaProgressTracker } from '@/components/media/MediaProgressTracker';
import { MediaRatingReview } from '@/components/media/MediaRatingReview';

type MediaDetailScreenRouteProp = RouteProp<{ MediaDetail: { media: Media } }, 'MediaDetail'>;

export const MediaDetailScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const route = useRoute<MediaDetailScreenRouteProp>();
  const { media } = route.params;

  const updateMediaMutation = useUpdateMedia();
  const deleteMediaMutation = useDeleteMedia();

  const [isEditing, setIsEditing] = useState(false);
  const progress = getMediaProgress(media);

  const handleUpdateProgress = async (progressData: any) => {
    try {
      await updateMediaMutation.mutateAsync({
        id: media._id,
        data: progressData,
      });
    } catch (error) {
      console.error('Error updating progress:', error);
      Alert.alert('Error', 'Failed to update progress. Please try again.');
    }
  };

  const handleUpdateRatingReview = async (ratingData: { rating?: number; review?: string }) => {
    try {
      await updateMediaMutation.mutateAsync({
        id: media._id,
        data: ratingData,
      });
    } catch (error) {
      console.error('Error updating rating/review:', error);
      Alert.alert('Error', 'Failed to update rating/review. Please try again.');
    }
  };

  const handleStatusChange = async (status: 'Completed' | 'In Progress' | 'Planned') => {
    try {
      const updateData: any = { status };
      
      // Auto-complete progress when marking as completed
      if (status === 'Completed') {
        if (media.type === 'TV Show' && media.totalEpisodes) {
          updateData.episodesWatched = media.totalEpisodes;
        } else if (media.type === 'Book' && media.totalPages) {
          updateData.pagesRead = media.totalPages;
        }
      }
      
      await updateMediaMutation.mutateAsync({
        id: media._id,
        data: updateData,
      });
    } catch (error) {
      console.error('Error updating status:', error);
      Alert.alert('Error', 'Failed to update status. Please try again.');
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Media',
      `Are you sure you want to delete "${media.title}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteMediaMutation.mutateAsync(media._id);
              navigation.goBack();
            } catch (error) {
              console.error('Error deleting media:', error);
              Alert.alert('Error', 'Failed to delete media. Please try again.');
            }
          },
        },
      ]
    );
  };

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

  const renderStatusButtons = () => (
    <View style={styles.statusContainer}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Status</Text>
      <View style={styles.statusButtons}>
        {(['Planned', 'In Progress', 'Completed'] as const).map((status) => (
          <TouchableOpacity
            key={status}
            style={[
              styles.statusButton,
              {
                backgroundColor: media.status === status ? getStatusColor(status) : colors.surface,
                borderColor: media.status === status ? getStatusColor(status) : colors.border,
              },
            ]}
            onPress={() => handleStatusChange(status)}
            disabled={updateMediaMutation.isPending}
          >
            <Text
              style={[
                styles.statusButtonText,
                {
                  color: media.status === status ? colors.surface : colors.text,
                },
              ]}
            >
              {status}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title="Media Details"
        leftElement={
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={[styles.backText, { color: colors.primary }]}>Back</Text>
          </TouchableOpacity>
        }
        rightElement={
          <TouchableOpacity onPress={handleDelete}>
            <Text style={[styles.deleteText, { color: colors.error }]}>Delete</Text>
          </TouchableOpacity>
        }
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View style={[styles.headerSection, { backgroundColor: colors.surface }]}>
          <View style={styles.headerContent}>
            {media.imageUrl ? (
              <Image source={{ uri: media.imageUrl }} style={styles.coverImage} />
            ) : (
              <View style={[styles.placeholderImage, { backgroundColor: colors.background }]}>
                <Text style={styles.typeIcon}>{getTypeIcon(media.type)}</Text>
              </View>
            )}

            <View style={styles.headerInfo}>
              <Text style={[styles.title, { color: colors.text }]}>{media.title}</Text>
              
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

              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(media.status) }]}>
                <Text style={[styles.statusBadgeText, { color: colors.surface }]}>
                  {media.status || 'Unknown'}
                </Text>
              </View>

              {progress > 0 && (
                <View style={styles.progressSection}>
                  <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>
                    Progress: {Math.round(progress)}%
                  </Text>
                  <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
                    <View
                      style={[
                        styles.progressFill,
                        {
                          backgroundColor: colors.primary,
                          width: `${progress}%`,
                        },
                      ]}
                    />
                  </View>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Status Section */}
        {renderStatusButtons()}

        {/* Progress Tracking Section */}
        <MediaProgressTracker
          media={media}
          onUpdateProgress={handleUpdateProgress}
          loading={updateMediaMutation.isPending}
        />

        {/* Rating and Review Section */}
        <MediaRatingReview
          media={media}
          onUpdateRatingReview={handleUpdateRatingReview}
          loading={updateMediaMutation.isPending}
        />

        {/* Additional Info */}
        {(media.createdAt || media.updatedAt) && (
          <View style={[styles.section, { backgroundColor: colors.surface }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Information</Text>
            {media.createdAt && (
              <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                Added: {new Date(media.createdAt).toLocaleDateString()}
              </Text>
            )}
            {media.updatedAt && (
              <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                Last updated: {new Date(media.updatedAt).toLocaleDateString()}
              </Text>
            )}
          </View>
        )}

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  backText: {
    fontSize: 16,
    fontWeight: '500',
  },
  deleteText: {
    fontSize: 16,
    fontWeight: '500',
  },
  headerSection: {
    padding: 20,
    marginBottom: 16,
  },
  headerContent: {
    flexDirection: 'row',
  },
  coverImage: {
    width: 120,
    height: 180,
    borderRadius: 12,
    marginRight: 16,
  },
  placeholderImage: {
    width: 120,
    height: 180,
    borderRadius: 12,
    marginRight: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  typeIcon: {
    fontSize: 48,
  },
  headerInfo: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  metadata: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  type: {
    fontSize: 16,
    fontWeight: '500',
  },
  genre: {
    fontSize: 16,
    marginLeft: 4,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 16,
  },
  statusBadgeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  progressSection: {
    marginTop: 8,
  },
  progressLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
  },
  section: {
    padding: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  statusContainer: {
    padding: 20,
    marginBottom: 16,
  },
  statusButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  statusButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  statusButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  infoText: {
    fontSize: 14,
    marginBottom: 4,
  },
  bottomSpacing: {
    height: 32,
  },
});
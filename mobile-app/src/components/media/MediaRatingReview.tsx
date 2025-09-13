import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Media } from '@/types';
import { Button } from '@/components/common/Button';

interface MediaRatingReviewProps {
  media: Media;
  onUpdateRatingReview: (data: { rating?: number; review?: string }) => Promise<void>;
  loading?: boolean;
}

export const MediaRatingReview: React.FC<MediaRatingReviewProps> = ({
  media,
  onUpdateRatingReview,
  loading = false,
}) => {
  const { colors } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [rating, setRating] = useState(media.rating || 0);
  const [review, setReview] = useState(media.review || '');

  const handleSave = async () => {
    try {
      await onUpdateRatingReview({
        rating: rating > 0 ? rating : undefined,
        review: review.trim() || undefined,
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving rating/review:', error);
    }
  };

  const handleCancel = () => {
    setRating(media.rating || 0);
    setReview(media.review || '');
    setIsEditing(false);
  };

  const renderStars = (currentRating: number, onPress?: (rating: number) => void) => (
    <View style={styles.starsContainer}>
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity
          key={star}
          onPress={() => onPress?.(currentRating === star ? 0 : star)}
          disabled={!onPress}
          style={styles.starButton}
        >
          <Text
            style={[
              styles.star,
              {
                color: star <= currentRating ? colors.warning : colors.textSecondary,
              },
            ]}
          >
            ★
          </Text>
        </TouchableOpacity>
      ))}
      <Text style={[styles.ratingText, { color: colors.textSecondary }]}>
        {currentRating > 0 ? `${currentRating}/5` : 'No rating'}
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Rating & Review</Text>

      {isEditing ? (
        <View style={styles.editContainer}>
          {/* Rating Section */}
          <View style={styles.ratingSection}>
            <Text style={[styles.label, { color: colors.text }]}>Rating</Text>
            {renderStars(rating, setRating)}
          </View>

          {/* Review Section */}
          <View style={styles.reviewSection}>
            <Text style={[styles.label, { color: colors.text }]}>Review</Text>
            <TextInput
              style={[
                styles.reviewInput,
                {
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
              value={review}
              onChangeText={setReview}
              placeholder="Write your thoughts about this media..."
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonRow}>
            <Button
              title="Cancel"
              onPress={handleCancel}
              variant="outline"
              style={styles.button}
            />
            <Button
              title="Save"
              onPress={handleSave}
              loading={loading}
              style={styles.button}
            />
          </View>
        </View>
      ) : (
        <View style={styles.displayContainer}>
          {/* Current Rating */}
          <View style={styles.currentRating}>
            <Text style={[styles.label, { color: colors.text }]}>Rating</Text>
            {renderStars(media.rating || 0)}
          </View>

          {/* Current Review */}
          <View style={styles.currentReview}>
            <Text style={[styles.label, { color: colors.text }]}>Review</Text>
            {media.review ? (
              <Text style={[styles.reviewText, { color: colors.text }]}>
                {media.review}
              </Text>
            ) : (
              <Text style={[styles.noReviewText, { color: colors.textSecondary }]}>
                No review yet
              </Text>
            )}
          </View>

          {/* Edit Button */}
          <TouchableOpacity
            style={[styles.editButton, { backgroundColor: colors.primary }]}
            onPress={() => setIsEditing(true)}
          >
            <Text style={[styles.editButtonText, { color: colors.surface }]}>
              {media.rating || media.review ? 'Edit Rating & Review' : 'Add Rating & Review'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  displayContainer: {
    flex: 1,
  },
  editContainer: {
    flex: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  currentRating: {
    marginBottom: 20,
  },
  currentReview: {
    marginBottom: 20,
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starButton: {
    padding: 2,
  },
  star: {
    fontSize: 24,
  },
  ratingText: {
    marginLeft: 12,
    fontSize: 14,
  },
  reviewText: {
    fontSize: 16,
    lineHeight: 24,
  },
  noReviewText: {
    fontSize: 16,
    fontStyle: 'italic',
  },
  editButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  ratingSection: {
    marginBottom: 20,
  },
  reviewSection: {
    marginBottom: 20,
  },
  reviewInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
  },
});
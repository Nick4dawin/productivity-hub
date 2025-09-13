import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { useTheme } from '@/contexts/ThemeContext';
import { useCreateMedia, useSearchExternalMedia } from '@/hooks/useMedia';
import { CreateMediaData } from '@/types';
import { Header } from '@/components/common/Header';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ExternalMediaSearch } from '@/components/media/ExternalMediaSearch';

interface AddMediaFormData {
  title: string;
  type: 'Movie' | 'TV Show' | 'Book' | 'Game';
  genre: string;
  status: 'Completed' | 'In Progress' | 'Planned';
  rating: number;
  review: string;
  imageUrl: string;
  episodesWatched: number;
  totalEpisodes: number;
  pagesRead: number;
  totalPages: number;
}

const MEDIA_TYPES: Array<'Movie' | 'TV Show' | 'Book' | 'Game'> = ['Movie', 'TV Show', 'Book', 'Game'];
const MEDIA_STATUSES: Array<'Completed' | 'In Progress' | 'Planned'> = ['Completed', 'In Progress', 'Planned'];

export const AddMediaScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const createMediaMutation = useCreateMedia();
  
  const [showExternalSearch, setShowExternalSearch] = useState(false);
  const [selectedType, setSelectedType] = useState<'Movie' | 'TV Show' | 'Book' | 'Game'>('Movie');

  const { control, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<AddMediaFormData>({
    defaultValues: {
      title: '',
      type: 'Movie',
      genre: '',
      status: 'Planned',
      rating: 0,
      review: '',
      imageUrl: '',
      episodesWatched: 0,
      totalEpisodes: 0,
      pagesRead: 0,
      totalPages: 0,
    },
  });

  const watchedType = watch('type');
  const watchedStatus = watch('status');

  const onSubmit = async (data: AddMediaFormData) => {
    try {
      const mediaData: CreateMediaData = {
        title: data.title.trim(),
        type: data.type,
        genre: data.genre.trim() || undefined,
        status: data.status,
        rating: data.rating > 0 ? data.rating : undefined,
        review: data.review.trim() || undefined,
        imageUrl: data.imageUrl.trim() || undefined,
      };

      // Add progress fields based on type
      if (data.type === 'TV Show') {
        if (data.totalEpisodes > 0) {
          mediaData.totalEpisodes = data.totalEpisodes;
          mediaData.episodesWatched = Math.min(data.episodesWatched, data.totalEpisodes);
        }
      } else if (data.type === 'Book') {
        if (data.totalPages > 0) {
          mediaData.totalPages = data.totalPages;
          mediaData.pagesRead = Math.min(data.pagesRead, data.totalPages);
        }
      }

      await createMediaMutation.mutateAsync(mediaData);
      Alert.alert('Success', 'Media added successfully!');
      navigation.goBack();
    } catch (error) {
      console.error('Error creating media:', error);
      Alert.alert('Error', 'Failed to add media. Please try again.');
    }
  };

  const handleExternalMediaSelect = (externalMedia: any) => {
    setValue('title', externalMedia.title || '');
    setValue('imageUrl', externalMedia.imageUrl || externalMedia.poster || '');
    setValue('genre', externalMedia.genre || '');
    
    if (externalMedia.totalEpisodes) {
      setValue('totalEpisodes', externalMedia.totalEpisodes);
    }
    if (externalMedia.totalPages) {
      setValue('totalPages', externalMedia.totalPages);
    }
    
    setShowExternalSearch(false);
  };

  const renderTypeSelector = () => (
    <View style={styles.selectorContainer}>
      <Text style={[styles.label, { color: colors.text }]}>Type *</Text>
      <View style={styles.typeButtons}>
        {MEDIA_TYPES.map((type) => (
          <TouchableOpacity
            key={type}
            style={[
              styles.typeButton,
              {
                backgroundColor: watchedType === type ? colors.primary : colors.surface,
                borderColor: watchedType === type ? colors.primary : colors.border,
              },
            ]}
            onPress={() => {
              setValue('type', type);
              setSelectedType(type);
            }}
          >
            <Text
              style={[
                styles.typeButtonText,
                {
                  color: watchedType === type ? colors.surface : colors.text,
                },
              ]}
            >
              {type}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderStatusSelector = () => (
    <View style={styles.selectorContainer}>
      <Text style={[styles.label, { color: colors.text }]}>Status *</Text>
      <View style={styles.statusButtons}>
        {MEDIA_STATUSES.map((status) => (
          <TouchableOpacity
            key={status}
            style={[
              styles.statusButton,
              {
                backgroundColor: watchedStatus === status ? colors.primary : colors.surface,
                borderColor: watchedStatus === status ? colors.primary : colors.border,
              },
            ]}
            onPress={() => setValue('status', status)}
          >
            <Text
              style={[
                styles.statusButtonText,
                {
                  color: watchedStatus === status ? colors.surface : colors.text,
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

  const renderRatingSelector = () => (
    <View style={styles.selectorContainer}>
      <Text style={[styles.label, { color: colors.text }]}>Rating</Text>
      <Controller
        control={control}
        name="rating"
        render={({ field: { value, onChange } }) => (
          <View style={styles.ratingContainer}>
            {[1, 2, 3, 4, 5].map((rating) => (
              <TouchableOpacity
                key={rating}
                onPress={() => onChange(value === rating ? 0 : rating)}
                style={styles.starButton}
              >
                <Text style={[styles.star, { color: rating <= value ? colors.warning : colors.textSecondary }]}>
                  ★
                </Text>
              </TouchableOpacity>
            ))}
            <Text style={[styles.ratingText, { color: colors.textSecondary }]}>
              {value > 0 ? `${value}/5` : 'No rating'}
            </Text>
          </View>
        )}
      />
    </View>
  );

  const renderProgressFields = () => {
    if (watchedType === 'TV Show') {
      return (
        <View style={styles.progressContainer}>
          <Text style={[styles.label, { color: colors.text }]}>Episodes Progress</Text>
          <View style={styles.progressRow}>
            <Controller
              control={control}
              name="episodesWatched"
              render={({ field: { value, onChange } }) => (
                <Input
                  label="Episodes Watched"
                  value={value?.toString() || ''}
                  onChangeText={(text) => onChange(parseInt(text) || 0)}
                  keyboardType="numeric"
                  containerStyle={styles.progressInput}
                />
              )}
            />
            <Controller
              control={control}
              name="totalEpisodes"
              render={({ field: { value, onChange } }) => (
                <Input
                  label="Total Episodes"
                  value={value?.toString() || ''}
                  onChangeText={(text) => onChange(parseInt(text) || 0)}
                  keyboardType="numeric"
                  containerStyle={styles.progressInput}
                />
              )}
            />
          </View>
        </View>
      );
    }

    if (watchedType === 'Book') {
      return (
        <View style={styles.progressContainer}>
          <Text style={[styles.label, { color: colors.text }]}>Reading Progress</Text>
          <View style={styles.progressRow}>
            <Controller
              control={control}
              name="pagesRead"
              render={({ field: { value, onChange } }) => (
                <Input
                  label="Pages Read"
                  value={value?.toString() || ''}
                  onChangeText={(text) => onChange(parseInt(text) || 0)}
                  keyboardType="numeric"
                  containerStyle={styles.progressInput}
                />
              )}
            />
            <Controller
              control={control}
              name="totalPages"
              render={({ field: { value, onChange } }) => (
                <Input
                  label="Total Pages"
                  value={value?.toString() || ''}
                  onChangeText={(text) => onChange(parseInt(text) || 0)}
                  keyboardType="numeric"
                  containerStyle={styles.progressInput}
                />
              )}
            />
          </View>
        </View>
      );
    }

    return null;
  };

  if (showExternalSearch) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Header
          title="Search External APIs"
          leftElement={
            <TouchableOpacity onPress={() => setShowExternalSearch(false)}>
              <Text style={[styles.cancelText, { color: colors.primary }]}>Cancel</Text>
            </TouchableOpacity>
          }
        />
        <ExternalMediaSearch
          mediaType={selectedType}
          onSelect={handleExternalMediaSelect}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title="Add Media"
        leftElement={
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={[styles.cancelText, { color: colors.primary }]}>Cancel</Text>
          </TouchableOpacity>
        }
        rightElement={
          <TouchableOpacity onPress={() => setShowExternalSearch(true)}>
            <Text style={[styles.searchText, { color: colors.primary }]}>Search</Text>
          </TouchableOpacity>
        }
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderTypeSelector()}

        <Controller
          control={control}
          name="title"
          rules={{ required: 'Title is required' }}
          render={({ field: { value, onChange } }) => (
            <Input
              label="Title *"
              value={value}
              onChangeText={onChange}
              error={errors.title?.message}
              placeholder="Enter media title"
            />
          )}
        />

        <Controller
          control={control}
          name="genre"
          render={({ field: { value, onChange } }) => (
            <Input
              label="Genre"
              value={value}
              onChangeText={onChange}
              placeholder="e.g., Action, Drama, Fantasy"
            />
          )}
        />

        {renderStatusSelector()}

        {renderProgressFields()}

        {renderRatingSelector()}

        <Controller
          control={control}
          name="review"
          render={({ field: { value, onChange } }) => (
            <Input
              label="Review"
              value={value}
              onChangeText={onChange}
              placeholder="Your thoughts about this media..."
              multiline
              numberOfLines={4}
            />
          )}
        />

        <Controller
          control={control}
          name="imageUrl"
          render={({ field: { value, onChange } }) => (
            <Input
              label="Image URL"
              value={value}
              onChangeText={onChange}
              placeholder="https://example.com/image.jpg"
              autoCapitalize="none"
            />
          )}
        />

        <View style={styles.buttonContainer}>
          <Button
            title="Add Media"
            onPress={handleSubmit(onSubmit)}
            loading={createMediaMutation.isPending}
            disabled={createMediaMutation.isPending}
          />
        </View>
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
    padding: 16,
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '500',
  },
  searchText: {
    fontSize: 16,
    fontWeight: '500',
  },
  selectorContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  typeButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  statusButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  statusButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starButton: {
    padding: 4,
  },
  star: {
    fontSize: 24,
  },
  ratingText: {
    marginLeft: 12,
    fontSize: 14,
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressRow: {
    flexDirection: 'row',
    gap: 12,
  },
  progressInput: {
    flex: 1,
  },
  buttonContainer: {
    marginTop: 24,
    marginBottom: 32,
  },
});
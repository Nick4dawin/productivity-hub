import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Media } from '@/types';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';

interface MediaProgressTrackerProps {
  media: Media;
  onUpdateProgress: (progressData: any) => Promise<void>;
  loading?: boolean;
}

export const MediaProgressTracker: React.FC<MediaProgressTrackerProps> = ({
  media,
  onUpdateProgress,
  loading = false,
}) => {
  const { colors } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [episodesWatched, setEpisodesWatched] = useState(media.episodesWatched?.toString() || '0');
  const [totalEpisodes, setTotalEpisodes] = useState(media.totalEpisodes?.toString() || '0');
  const [pagesRead, setPagesRead] = useState(media.pagesRead?.toString() || '0');
  const [totalPages, setTotalPages] = useState(media.totalPages?.toString() || '0');

  const handleSaveProgress = async () => {
    try {
      const progressData: any = {};

      if (media.type === 'TV Show') {
        const episodes = parseInt(episodesWatched) || 0;
        const total = parseInt(totalEpisodes) || 0;
        
        if (episodes > total && total > 0) {
          Alert.alert('Invalid Progress', 'Episodes watched cannot exceed total episodes.');
          return;
        }
        
        progressData.episodesWatched = episodes;
        if (total > 0) {
          progressData.totalEpisodes = total;
        }
      } else if (media.type === 'Book') {
        const pages = parseInt(pagesRead) || 0;
        const total = parseInt(totalPages) || 0;
        
        if (pages > total && total > 0) {
          Alert.alert('Invalid Progress', 'Pages read cannot exceed total pages.');
          return;
        }
        
        progressData.pagesRead = pages;
        if (total > 0) {
          progressData.totalPages = total;
        }
      }

      await onUpdateProgress(progressData);
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  };

  const handleCancel = () => {
    // Reset to original values
    setEpisodesWatched(media.episodesWatched?.toString() || '0');
    setTotalEpisodes(media.totalEpisodes?.toString() || '0');
    setPagesRead(media.pagesRead?.toString() || '0');
    setTotalPages(media.totalPages?.toString() || '0');
    setIsEditing(false);
  };

  const renderTVShowProgress = () => (
    <View style={styles.progressContent}>
      <Text style={[styles.progressTitle, { color: colors.text }]}>Episode Progress</Text>
      
      {isEditing ? (
        <View style={styles.editContainer}>
          <View style={styles.inputRow}>
            <Input
              label="Episodes Watched"
              value={episodesWatched}
              onChangeText={setEpisodesWatched}
              keyboardType="numeric"
              containerStyle={styles.inputContainer}
            />
            <Input
              label="Total Episodes"
              value={totalEpisodes}
              onChangeText={setTotalEpisodes}
              keyboardType="numeric"
              containerStyle={styles.inputContainer}
            />
          </View>
          
          <View style={styles.buttonRow}>
            <Button
              title="Cancel"
              onPress={handleCancel}
              variant="outline"
              style={styles.button}
            />
            <Button
              title="Save"
              onPress={handleSaveProgress}
              loading={loading}
              style={styles.button}
            />
          </View>
        </View>
      ) : (
        <View style={styles.displayContainer}>
          <Text style={[styles.progressText, { color: colors.text }]}>
            {media.episodesWatched || 0} / {media.totalEpisodes || '?'} episodes
          </Text>
          
          {media.totalEpisodes && media.episodesWatched !== undefined && (
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      backgroundColor: colors.primary,
                      width: `${Math.min((media.episodesWatched / media.totalEpisodes) * 100, 100)}%`,
                    },
                  ]}
                />
              </View>
              <Text style={[styles.progressPercentage, { color: colors.textSecondary }]}>
                {Math.round((media.episodesWatched / media.totalEpisodes) * 100)}%
              </Text>
            </View>
          )}
          
          <TouchableOpacity
            style={[styles.editButton, { backgroundColor: colors.primary }]}
            onPress={() => setIsEditing(true)}
          >
            <Text style={[styles.editButtonText, { color: colors.surface }]}>
              Update Progress
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const renderBookProgress = () => (
    <View style={styles.progressContent}>
      <Text style={[styles.progressTitle, { color: colors.text }]}>Reading Progress</Text>
      
      {isEditing ? (
        <View style={styles.editContainer}>
          <View style={styles.inputRow}>
            <Input
              label="Pages Read"
              value={pagesRead}
              onChangeText={setPagesRead}
              keyboardType="numeric"
              containerStyle={styles.inputContainer}
            />
            <Input
              label="Total Pages"
              value={totalPages}
              onChangeText={setTotalPages}
              keyboardType="numeric"
              containerStyle={styles.inputContainer}
            />
          </View>
          
          <View style={styles.buttonRow}>
            <Button
              title="Cancel"
              onPress={handleCancel}
              variant="outline"
              style={styles.button}
            />
            <Button
              title="Save"
              onPress={handleSaveProgress}
              loading={loading}
              style={styles.button}
            />
          </View>
        </View>
      ) : (
        <View style={styles.displayContainer}>
          <Text style={[styles.progressText, { color: colors.text }]}>
            {media.pagesRead || 0} / {media.totalPages || '?'} pages
          </Text>
          
          {media.totalPages && media.pagesRead !== undefined && (
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      backgroundColor: colors.primary,
                      width: `${Math.min((media.pagesRead / media.totalPages) * 100, 100)}%`,
                    },
                  ]}
                />
              </View>
              <Text style={[styles.progressPercentage, { color: colors.textSecondary }]}>
                {Math.round((media.pagesRead / media.totalPages) * 100)}%
              </Text>
            </View>
          )}
          
          <TouchableOpacity
            style={[styles.editButton, { backgroundColor: colors.primary }]}
            onPress={() => setIsEditing(true)}
          >
            <Text style={[styles.editButtonText, { color: colors.surface }]}>
              Update Progress
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const renderOtherMediaProgress = () => (
    <View style={styles.progressContent}>
      <Text style={[styles.progressTitle, { color: colors.text }]}>Progress</Text>
      <Text style={[styles.noProgressText, { color: colors.textSecondary }]}>
        Progress tracking is not available for {media.type.toLowerCase()}s.
        Use the status buttons above to track completion.
      </Text>
    </View>
  );

  if (media.type === 'TV Show') {
    return (
      <View style={[styles.container, { backgroundColor: colors.surface }]}>
        {renderTVShowProgress()}
      </View>
    );
  }

  if (media.type === 'Book') {
    return (
      <View style={[styles.container, { backgroundColor: colors.surface }]}>
        {renderBookProgress()}
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      {renderOtherMediaProgress()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    marginBottom: 16,
  },
  progressContent: {
    flex: 1,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  displayContainer: {
    alignItems: 'flex-start',
  },
  progressText: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 12,
  },
  progressBarContainer: {
    width: '100%',
    marginBottom: 16,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
  },
  progressPercentage: {
    fontSize: 12,
    textAlign: 'right',
  },
  editButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  editContainer: {
    width: '100%',
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  inputContainer: {
    flex: 1,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
  },
  noProgressText: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
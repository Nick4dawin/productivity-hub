import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '@/contexts/ThemeContext';
import { Header } from '@/components/common/Header';
import { JournalEditor } from '@/components/journal/JournalEditor';
import { PhotoAttachment } from '@/components/journal/PhotoAttachment';
import { AIAnalysis } from '@/components/journal/AIAnalysis';
import { MoodExtraction } from '@/components/journal/MoodExtraction';
import {
  useCreateJournalEntry,
  useUpdateJournalEntry,
  useJournalEntries,
  getJournalCategories,
} from '@/hooks/useJournal';
import { JournalEntry, CreateJournalData } from '@/types';
import { ScrollView } from 'react-native-gesture-handler';
import { Text } from 'react-native-gesture-handler';
import { Text } from 'react-native-gesture-handler';
import { Text } from 'react-native-gesture-handler';
import { Text } from 'react-native-gesture-handler';
import { Text } from 'react-native-gesture-handler';
import { Text } from 'react-native-gesture-handler';
import { Text } from 'react-native-gesture-handler';
import { Text } from 'react-native-gesture-handler';
import { ScrollView } from 'react-native-gesture-handler';

type JournalEntryScreenRouteProp = RouteProp<{
  JournalEntry: {
    entry?: JournalEntry;
    mode?: 'create' | 'edit' | 'view';
    initialContent?: string;
  };
}, 'JournalEntry'>;

export const JournalEntryScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const route = useRoute<JournalEntryScreenRouteProp>();
  
  const { entry, mode = 'view', initialContent } = route.params || {};
  const isEditing = mode === 'edit' || mode === 'create';
  
  // Form state
  const [title, setTitle] = useState(entry?.title || '');
  const [content, setContent] = useState(entry?.content || initialContent || '');
  const [category, setCategory] = useState(entry?.category || 'Personal');
  const [photos, setPhotos] = useState<string[]>([]);
  const [hasChanges, setHasChanges] = useState(false);

  // API hooks
  const { data: entries = [] } = useJournalEntries();
  const createEntryMutation = useCreateJournalEntry();
  const updateEntryMutation = useUpdateJournalEntry();

  // Get available categories
  const categories = getJournalCategories(entries);

  useEffect(() => {
    // Check if there are unsaved changes
    const hasUnsavedChanges = 
      title !== (entry?.title || '') ||
      content !== (entry?.content || '') ||
      category !== (entry?.category || 'Personal');
    
    setHasChanges(hasUnsavedChanges);
  }, [title, content, category, entry]);

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Missing Title', 'Please enter a title for your journal entry.');
      return;
    }

    if (!content.trim()) {
      Alert.alert('Missing Content', 'Please write some content for your journal entry.');
      return;
    }

    const entryData: CreateJournalData = {
      title: title.trim(),
      content: content.trim(),
      category: category.trim(),
      date: entry?.date || new Date().toISOString(),
    };

    try {
      if (mode === 'create') {
        await createEntryMutation.mutateAsync(entryData);
        Alert.alert('Success', 'Journal entry created successfully!', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else if (mode === 'edit' && entry) {
        await updateEntryMutation.mutateAsync({
          id: entry._id,
          data: entryData,
        });
        Alert.alert('Success', 'Journal entry updated successfully!', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      }
    } catch (error) {
      Alert.alert(
        'Error',
        `Failed to ${mode === 'create' ? 'create' : 'update'} journal entry. Please try again.`
      );
    }
  };

  const handleDiscard = () => {
    if (hasChanges) {
      Alert.alert(
        'Discard Changes',
        'Are you sure you want to discard your changes?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Discard', style: 'destructive', onPress: () => navigation.goBack() },
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  const toggleEditMode = () => {
    if (isEditing) {
      handleDiscard();
    } else {
      navigation.setParams({ mode: 'edit' });
    }
  };

  const getHeaderTitle = () => {
    switch (mode) {
      case 'create':
        return 'New Entry';
      case 'edit':
        return 'Edit Entry';
      default:
        return entry?.title || 'Journal Entry';
    }
  };

  const renderHeaderRight = () => {
    if (isEditing) {
      return (
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={handleDiscard}
          >
            <Icon name="close" size={24} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.saveButton,
              { backgroundColor: colors.primary },
              (!title.trim() || !content.trim()) && styles.saveButtonDisabled,
            ]}
            onPress={handleSave}
            disabled={!title.trim() || !content.trim() || createEntryMutation.isPending || updateEntryMutation.isPending}
          >
            <Icon name="check" size={20} color="white" />
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <TouchableOpacity
        style={styles.headerButton}
        onPress={toggleEditMode}
      >
        <Icon name="edit" size={24} color={colors.text} />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title={getHeaderTitle()}
        showBackButton
        rightComponent={renderHeaderRight()}
      />

      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {isEditing ? (
          <View style={styles.editorContainer}>
            <JournalEditor
              title={title}
              content={content}
              category={category}
              onTitleChange={setTitle}
              onContentChange={setContent}
              onCategoryChange={setCategory}
              categories={categories}
            />
            
            <PhotoAttachment
              photos={photos}
              onPhotosChange={setPhotos}
            />
          </View>
        ) : (
          <ScrollView style={styles.viewContainer} showsVerticalScrollIndicator={false}>
            <View style={styles.viewContent}>
              <Text style={[styles.viewTitle, { color: colors.text }]}>
                {entry?.title}
              </Text>
              
              <View style={styles.viewMeta}>
                <Text style={[styles.viewDate, { color: colors.textSecondary }]}>
                  {entry?.date ? new Date(entry.date).toLocaleDateString() : ''}
                </Text>
                <View style={[styles.viewCategory, { backgroundColor: colors.primary + '20' }]}>
                  <Text style={[styles.viewCategoryText, { color: colors.primary }]}>
                    {entry?.category}
                  </Text>
                </View>
              </View>
              
              <Text style={[styles.viewContent, { color: colors.text }]}>
                {entry?.content}
              </Text>
              
              {entry && <AIAnalysis entry={entry} />}
              {entry && <MoodExtraction entry={entry} />}
            </View>
          </ScrollView>
        )}
      </KeyboardAvoidingView>
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerButton: {
    padding: 8,
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  editorContainer: {
    flex: 1,
  },
  viewContainer: {
    flex: 1,
  },
  viewContent: {
    padding: 16,
  },
  viewTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  viewMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewDate: {
    fontSize: 14,
  },
  viewCategory: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  viewCategoryText: {
    fontSize: 12,
    fontWeight: '500',
  },
  viewContent: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 24,
  },
});
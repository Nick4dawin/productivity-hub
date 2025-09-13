import React, { useState, useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '@/contexts/ThemeContext';
import { Header } from '@/components/common/Header';
import { JournalList } from '@/components/journal/JournalList';
import { JournalSearch } from '@/components/journal/JournalSearch';
import { JournalPrompts } from '@/components/journal/JournalPrompts';
import {
  useJournalEntries,
  useDeleteJournalEntry,
  searchJournalEntries,
  getEntriesByCategory,
  getJournalCategories,
  getRecentEntries,
} from '@/hooks/useJournal';
import { useMoods, getRecentMoods } from '@/hooks/useMood';
import { JournalEntry } from '@/types';

export const JournalScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation();
  
  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState<'date' | 'title'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showPrompts, setShowPrompts] = useState(false);

  // API hooks
  const { data: entries = [], isLoading, refetch, isRefetching } = useJournalEntries();
  const { data: moods = [] } = useMoods();
  const deleteEntryMutation = useDeleteJournalEntry();

  // Get available categories
  const categories = useMemo(() => getJournalCategories(entries), [entries]);

  // Filter and sort entries
  const filteredEntries = useMemo(() => {
    let filtered = entries;

    // Apply search filter
    if (searchTerm.trim()) {
      filtered = searchJournalEntries(filtered, searchTerm);
    }

    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = getEntriesByCategory(filtered, selectedCategory);
    }

    // Apply sorting
    filtered = [...filtered].sort((a, b) => {
      let comparison = 0;
      
      if (sortBy === 'date') {
        comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
      } else {
        comparison = a.title.localeCompare(b.title);
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [entries, searchTerm, selectedCategory, sortBy, sortOrder]);

  const handleEntryPress = (entry: JournalEntry) => {
    navigation.navigate('JournalEntry', { entry });
  };

  const handleEntryEdit = (entry: JournalEntry) => {
    navigation.navigate('JournalEntry', { entry, mode: 'edit' });
  };

  const handleEntryDelete = async (id: string) => {
    try {
      await deleteEntryMutation.mutateAsync(id);
    } catch (error) {
      Alert.alert('Error', 'Failed to delete journal entry. Please try again.');
    }
  };

  const handleAddEntry = () => {
    navigation.navigate('JournalEntry', { mode: 'create' });
  };

  const handlePromptSelect = (prompt: string) => {
    setShowPrompts(false);
    navigation.navigate('JournalEntry', { 
      mode: 'create',
      initialContent: prompt + '\n\n'
    });
  };

  // Get recent data for AI prompts
  const recentEntries = getRecentEntries(entries, 7);
  const recentMoods = getRecentMoods(moods, 7);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title="Journal"
        rightComponent={
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={[styles.promptsButton, { backgroundColor: colors.surface }]}
              onPress={() => setShowPrompts(true)}
            >
              <Icon name="lightbulb-outline" size={20} color={colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.addButton, { backgroundColor: colors.primary }]}
              onPress={handleAddEntry}
            >
              <Icon name="add" size={24} color="white" />
            </TouchableOpacity>
          </View>
        }
      />
      
      <JournalSearch
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        categories={categories}
        sortBy={sortBy}
        onSortChange={setSortBy}
        sortOrder={sortOrder}
        onSortOrderChange={setSortOrder}
      />

      <JournalList
        entries={filteredEntries}
        loading={isLoading}
        refreshing={isRefetching}
        onRefresh={refetch}
        onEntryPress={handleEntryPress}
        onEntryEdit={handleEntryEdit}
        onEntryDelete={handleEntryDelete}
        emptyMessage={
          searchTerm || selectedCategory !== 'all'
            ? 'No entries match your search criteria.'
            : 'No journal entries yet. Start writing to capture your thoughts!'
        }
      />

      {/* AI Prompts Modal */}
      <Modal
        visible={showPrompts}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowPrompts(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <JournalPrompts
            recentEntries={recentEntries}
            recentMoods={recentMoods}
            onPromptSelect={handlePromptSelect}
          />
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  promptsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
  },
});
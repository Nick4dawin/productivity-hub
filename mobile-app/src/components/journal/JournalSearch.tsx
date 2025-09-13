import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '@/contexts/ThemeContext';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';

interface JournalSearchProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  categories: string[];
  sortBy: 'date' | 'title';
  onSortChange: (sort: 'date' | 'title') => void;
  sortOrder: 'asc' | 'desc';
  onSortOrderChange: (order: 'asc' | 'desc') => void;
}

export const JournalSearch: React.FC<JournalSearchProps> = ({
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  categories,
  sortBy,
  onSortChange,
  sortOrder,
  onSortOrderChange,
}) => {
  const { colors } = useTheme();
  const [showFilters, setShowFilters] = useState(false);

  const hasActiveFilters = selectedCategory !== 'all' || sortBy !== 'date' || sortOrder !== 'desc';

  const clearFilters = () => {
    onCategoryChange('all');
    onSortChange('date');
    onSortOrderChange('desc');
    onSearchChange('');
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Input
          placeholder="Search journal entries..."
          value={searchTerm}
          onChangeText={onSearchChange}
          leftIcon="search"
          style={styles.searchInput}
        />
        <TouchableOpacity
          style={[
            styles.filterButton,
            { backgroundColor: hasActiveFilters ? colors.primary : colors.surface },
          ]}
          onPress={() => setShowFilters(true)}
        >
          <Icon
            name="filter-list"
            size={20}
            color={hasActiveFilters ? 'white' : colors.text}
          />
        </TouchableOpacity>
      </View>

      <Modal
        visible={showFilters}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowFilters(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowFilters(false)}>
              <Icon name="close" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Filter & Sort
            </Text>
            <TouchableOpacity onPress={clearFilters}>
              <Text style={[styles.clearText, { color: colors.primary }]}>
                Clear
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Category Filter */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Category
              </Text>
              <View style={styles.categoryContainer}>
                <TouchableOpacity
                  style={[
                    styles.categoryChip,
                    {
                      backgroundColor: selectedCategory === 'all' ? colors.primary : colors.surface,
                    },
                  ]}
                  onPress={() => onCategoryChange('all')}
                >
                  <Text
                    style={[
                      styles.categoryChipText,
                      {
                        color: selectedCategory === 'all' ? 'white' : colors.text,
                      },
                    ]}
                  >
                    All
                  </Text>
                </TouchableOpacity>
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.categoryChip,
                      {
                        backgroundColor: selectedCategory === category ? colors.primary : colors.surface,
                      },
                    ]}
                    onPress={() => onCategoryChange(category)}
                  >
                    <Text
                      style={[
                        styles.categoryChipText,
                        {
                          color: selectedCategory === category ? 'white' : colors.text,
                        },
                      ]}
                    >
                      {category}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Sort Options */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Sort By
              </Text>
              <View style={styles.sortContainer}>
                <TouchableOpacity
                  style={[
                    styles.sortOption,
                    {
                      backgroundColor: sortBy === 'date' ? colors.primary + '20' : 'transparent',
                    },
                  ]}
                  onPress={() => onSortChange('date')}
                >
                  <Icon
                    name="radio-button-checked"
                    size={20}
                    color={sortBy === 'date' ? colors.primary : colors.textSecondary}
                  />
                  <Text style={[styles.sortOptionText, { color: colors.text }]}>
                    Date
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.sortOption,
                    {
                      backgroundColor: sortBy === 'title' ? colors.primary + '20' : 'transparent',
                    },
                  ]}
                  onPress={() => onSortChange('title')}
                >
                  <Icon
                    name="radio-button-checked"
                    size={20}
                    color={sortBy === 'title' ? colors.primary : colors.textSecondary}
                  />
                  <Text style={[styles.sortOptionText, { color: colors.text }]}>
                    Title
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Sort Order */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Order
              </Text>
              <View style={styles.sortContainer}>
                <TouchableOpacity
                  style={[
                    styles.sortOption,
                    {
                      backgroundColor: sortOrder === 'desc' ? colors.primary + '20' : 'transparent',
                    },
                  ]}
                  onPress={() => onSortOrderChange('desc')}
                >
                  <Icon
                    name="radio-button-checked"
                    size={20}
                    color={sortOrder === 'desc' ? colors.primary : colors.textSecondary}
                  />
                  <Text style={[styles.sortOptionText, { color: colors.text }]}>
                    Newest First
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.sortOption,
                    {
                      backgroundColor: sortOrder === 'asc' ? colors.primary + '20' : 'transparent',
                    },
                  ]}
                  onPress={() => onSortOrderChange('asc')}
                >
                  <Icon
                    name="radio-button-checked"
                    size={20}
                    color={sortOrder === 'asc' ? colors.primary : colors.textSecondary}
                  />
                  <Text style={[styles.sortOptionText, { color: colors.text }]}>
                    Oldest First
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <Button
              title="Apply Filters"
              onPress={() => setShowFilters(false)}
              style={styles.applyButton}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchInput: {
    flex: 1,
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  clearText: {
    fontSize: 16,
    fontWeight: '500',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  sortContainer: {
    gap: 8,
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 12,
  },
  sortOptionText: {
    fontSize: 16,
  },
  modalFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  applyButton: {
    marginTop: 0,
  },
});
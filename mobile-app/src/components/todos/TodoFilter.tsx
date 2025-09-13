import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';

export type TodoFilterType = 'all' | 'active' | 'completed';
export type TodoSortType = 'priority' | 'dueDate' | 'category';

interface TodoFilterProps {
  activeFilter: TodoFilterType;
  activeSortBy: TodoSortType;
  onFilterChange: (filter: TodoFilterType) => void;
  onSortChange: (sortBy: TodoSortType) => void;
  todoStats: {
    total: number;
    active: number;
    completed: number;
    overdue: number;
  };
}

export const TodoFilter: React.FC<TodoFilterProps> = ({
  activeFilter,
  activeSortBy,
  onFilterChange,
  onSortChange,
  todoStats,
}) => {
  const { colors } = useTheme();

  const filterOptions = [
    { key: 'all' as TodoFilterType, label: 'All', count: todoStats.total },
    { key: 'active' as TodoFilterType, label: 'Active', count: todoStats.active },
    { key: 'completed' as TodoFilterType, label: 'Completed', count: todoStats.completed },
  ];

  const sortOptions = [
    { key: 'priority' as TodoSortType, label: 'Priority', icon: 'flag' },
    { key: 'dueDate' as TodoSortType, label: 'Due Date', icon: 'calendar' },
    { key: 'category' as TodoSortType, label: 'Category', icon: 'folder' },
  ];

  const renderFilterButton = (option: typeof filterOptions[0]) => {
    const isActive = activeFilter === option.key;
    
    return (
      <TouchableOpacity
        key={option.key}
        style={[
          styles.filterButton,
          {
            backgroundColor: isActive ? colors.primary : colors.surface,
            borderColor: isActive ? colors.primary : colors.border,
          }
        ]}
        onPress={() => onFilterChange(option.key)}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.filterButtonText,
            { color: isActive ? 'white' : colors.text }
          ]}
        >
          {option.label}
        </Text>
        <Text
          style={[
            styles.filterButtonCount,
            { color: isActive ? 'white' : colors.textSecondary }
          ]}
        >
          {option.count}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderSortButton = (option: typeof sortOptions[0]) => {
    const isActive = activeSortBy === option.key;
    
    return (
      <TouchableOpacity
        key={option.key}
        style={[
          styles.sortButton,
          {
            backgroundColor: isActive ? colors.primary : colors.surface,
            borderColor: isActive ? colors.primary : colors.border,
          }
        ]}
        onPress={() => onSortChange(option.key)}
        activeOpacity={0.7}
      >
        <Ionicons
          name={option.icon as any}
          size={16}
          color={isActive ? 'white' : colors.textSecondary}
        />
        <Text
          style={[
            styles.sortButtonText,
            { color: isActive ? 'white' : colors.text }
          ]}
        >
          {option.label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Filter Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Filter
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContainer}
        >
          {filterOptions.map(renderFilterButton)}
        </ScrollView>
      </View>

      {/* Sort Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Sort by
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.sortContainer}
        >
          {sortOptions.map(renderSortButton)}
        </ScrollView>
      </View>

      {/* Overdue Alert */}
      {todoStats.overdue > 0 && (
        <View style={[styles.overdueAlert, { backgroundColor: '#FF3B30' }]}>
          <Ionicons name="warning" size={16} color="white" />
          <Text style={styles.overdueText}>
            {todoStats.overdue} overdue task{todoStats.overdue > 1 ? 's' : ''}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  section: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginHorizontal: 16,
  },
  filterContainer: {
    paddingHorizontal: 16,
    gap: 8,
  },
  sortContainer: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  filterButtonCount: {
    fontSize: 12,
    fontWeight: '600',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    gap: 6,
  },
  sortButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  overdueAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    borderRadius: 8,
    gap: 6,
  },
  overdueText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
});
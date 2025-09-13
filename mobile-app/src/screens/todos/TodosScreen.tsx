import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '@/contexts/ThemeContext';
import { Header } from '@/components/common/Header';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { TodoList } from '@/components/todos/TodoList';
import { TodoFilter, TodoFilterType, TodoSortType } from '@/components/todos/TodoFilter';
import { TodoSearch } from '@/components/todos/TodoSearch';
import { TodoStats } from '@/components/todos/TodoStats';
import { FloatingActionButton } from '@/components/todos/FloatingActionButton';
import { useFilteredTodos, useTodoStats, useSearchTodos } from '@/hooks/useTodos';
import { Todo } from '@/types';

export const TodosScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const [filter, setFilter] = useState<TodoFilterType>('all');
  const [sortBy, setSortBy] = useState<TodoSortType>('priority');
  const [groupByCategory, setGroupByCategory] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showStats, setShowStats] = useState(false);

  const { data: filteredTodos = [], isLoading, isRefetching, refetch } = useFilteredTodos(filter, sortBy);
  const searchResults = useSearchTodos(searchQuery);
  const todoStats = useTodoStats();
  
  // Apply search filter to already filtered todos
  const todos = searchQuery.trim() 
    ? filteredTodos.filter(todo => searchResults.includes(todo))
    : filteredTodos;

  const handleAddTodo = () => {
    navigation.navigate('AddTodo' as never);
  };

  const handleEditTodo = (todo: Todo) => {
    navigation.navigate('AddTodo' as never, { todo } as never);
  };

  const handleToggleGrouping = () => {
    setGroupByCategory(!groupByCategory);
  };

  const handleToggleStats = () => {
    setShowStats(!showStats);
  };

  const handleCategoryPress = (category: string) => {
    setSearchQuery('');
    setFilter('all');
    // This would ideally filter by category, but for now we'll just clear search
    setShowStats(false);
  };

  const getEmptyMessage = () => {
    switch (filter) {
      case 'active':
        return 'No active todos. Great job! 🎉';
      case 'completed':
        return 'No completed todos yet.';
      default:
        return 'No todos yet. Tap + to add your first todo!';
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Header 
          title="Todos" 
          rightComponent={
            <TouchableOpacity onPress={handleAddTodo}>
              <Ionicons name="add" size={24} color={colors.primary} />
            </TouchableOpacity>
          }
        />
        <LoadingSpinner />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header 
        title="Todos" 
        rightComponent={
          <View style={styles.headerActions}>
            <TouchableOpacity 
              onPress={handleToggleStats}
              style={styles.headerButton}
            >
              <Ionicons 
                name={showStats ? "stats-chart" : "stats-chart-outline"} 
                size={20} 
                color={colors.primary} 
              />
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={handleToggleGrouping}
              style={styles.headerButton}
            >
              <Ionicons 
                name={groupByCategory ? "list" : "folder"} 
                size={20} 
                color={colors.primary} 
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleAddTodo} style={styles.headerButton}>
              <Ionicons name="add" size={24} color={colors.primary} />
            </TouchableOpacity>
          </View>
        }
      />
      
      {!showStats && (
        <>
          <TodoSearch onSearch={setSearchQuery} />
          <TodoFilter
            activeFilter={filter}
            activeSortBy={sortBy}
            onFilterChange={setFilter}
            onSortChange={setSortBy}
            todoStats={todoStats}
          />
        </>
      )}

      <View style={styles.content}>
        {showStats ? (
          <TodoStats 
            stats={todoStats} 
            onCategoryPress={handleCategoryPress}
          />
        ) : (
          <TodoList
            todos={todos}
            isLoading={isLoading}
            isRefreshing={isRefetching}
            onRefresh={refetch}
            onEditTodo={handleEditTodo}
            groupByCategory={groupByCategory}
            emptyMessage={getEmptyMessage()}
          />
        )}
      </View>

      {/* Floating Action Button */}
      <FloatingActionButton onAddTodo={handleAddTodo} />
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
  },
  headerButton: {
    marginLeft: 12,
  },
  content: {
    flex: 1,
  },

});
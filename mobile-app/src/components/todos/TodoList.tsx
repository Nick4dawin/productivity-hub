import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Todo } from '@/types';
import { TodoItem } from './TodoItem';

interface TodoListProps {
  todos: Todo[];
  isLoading?: boolean;
  isRefreshing?: boolean;
  onRefresh?: () => void;
  onEditTodo?: (todo: Todo) => void;
  groupByCategory?: boolean;
  emptyMessage?: string;
}

interface TodoSection {
  title: string;
  data: Todo[];
}

export const TodoList: React.FC<TodoListProps> = ({
  todos,
  isLoading = false,
  isRefreshing = false,
  onRefresh,
  onEditTodo,
  groupByCategory = false,
  emptyMessage = 'No todos found',
}) => {
  const { colors } = useTheme();

  const renderTodoItem = ({ item }: { item: Todo }) => (
    <TodoItem todo={item} onEdit={onEditTodo} />
  );

  const renderSectionHeader = ({ section }: { section: TodoSection }) => (
    <View style={[styles.sectionHeader, { backgroundColor: colors.background }]}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        {section.title}
      </Text>
      <Text style={[styles.sectionCount, { color: colors.textSecondary }]}>
        {section.data.length}
      </Text>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
        {emptyMessage}
      </Text>
    </View>
  );

  if (groupByCategory) {
    // Group todos by category
    const todosByCategory = todos.reduce((acc, todo) => {
      if (!acc[todo.category]) {
        acc[todo.category] = [];
      }
      acc[todo.category].push(todo);
      return acc;
    }, {} as Record<string, Todo[]>);

    const sections: TodoSection[] = Object.entries(todosByCategory).map(([category, categoryTodos]) => ({
      title: category,
      data: categoryTodos,
    }));

    return (
      <FlatList
        data={sections}
        keyExtractor={(item) => item.title}
        renderItem={({ item: section }) => (
          <View>
            {renderSectionHeader({ section })}
            <FlatList
              data={section.data}
              keyExtractor={(item) => item._id}
              renderItem={renderTodoItem}
              scrollEnabled={false}
            />
          </View>
        )}
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          ) : undefined
        }
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.container,
          todos.length === 0 && styles.emptyContainer,
        ]}
      />
    );
  }

  return (
    <FlatList
      data={todos}
      keyExtractor={(item) => item._id}
      renderItem={renderTodoItem}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        ) : undefined
      }
      ListEmptyComponent={renderEmptyState}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={[
        styles.container,
        todos.length === 0 && styles.emptyContainer,
      ]}
      getItemLayout={(data, index) => ({
        length: 80, // Approximate item height
        offset: 80 * index,
        index,
      })}
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      windowSize={10}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  sectionCount: {
    fontSize: 14,
    fontWeight: '500',
  },
});
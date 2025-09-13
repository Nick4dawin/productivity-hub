import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Alert,
} from 'react-native';
import { Swipeable, GestureHandlerRootView } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { Todo } from '@/types';
import { useToggleTodo, useDeleteTodo } from '@/hooks/useTodos';

interface TodoItemProps {
  todo: Todo;
  onEdit?: (todo: Todo) => void;
}

export const TodoItem: React.FC<TodoItemProps> = ({ todo, onEdit }) => {
  const { colors } = useTheme();
  const toggleTodo = useToggleTodo();
  const deleteTodo = useDeleteTodo();

  const handleToggle = () => {
    toggleTodo.mutate(todo._id);
  };

  const handleEdit = () => {
    onEdit?.(todo);
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Todo',
      'Are you sure you want to delete this todo?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteTodo.mutate(todo._id),
        },
      ]
    );
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return '#FF3B30';
      case 'medium':
        return '#FF9500';
      case 'low':
        return '#34C759';
      default:
        return colors.textSecondary;
    }
  };

  const formatDueDate = (dueDate?: string) => {
    if (!dueDate) return null;
    
    const date = new Date(dueDate);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else if (date < today) {
      return 'Overdue';
    } else {
      return date.toLocaleDateString();
    }
  };

  const isOverdue = todo.dueDate && new Date(todo.dueDate) < new Date() && !todo.completed;

  const renderRightActions = (progress: Animated.AnimatedAddition, dragX: Animated.AnimatedAddition) => {
    const editScale = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    });

    const deleteScale = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    });

    return (
      <View style={styles.rightActions}>
        <Animated.View style={[styles.actionButton, { transform: [{ scale: editScale }] }]}>
          <TouchableOpacity
            style={[styles.editButton, { backgroundColor: colors.primary }]}
            onPress={handleEdit}
          >
            <Ionicons name="pencil" size={20} color="white" />
          </TouchableOpacity>
        </Animated.View>
        <Animated.View style={[styles.actionButton, { transform: [{ scale: deleteScale }] }]}>
          <TouchableOpacity
            style={[styles.deleteButton, { backgroundColor: '#FF3B30' }]}
            onPress={handleDelete}
          >
            <Ionicons name="trash" size={20} color="white" />
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  };

  const renderLeftActions = (progress: Animated.AnimatedAddition, dragX: Animated.AnimatedAddition) => {
    const completeScale = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    });

    return (
      <View style={styles.leftActions}>
        <Animated.View style={[styles.actionButton, { transform: [{ scale: completeScale }] }]}>
          <TouchableOpacity
            style={[
              styles.completeButton,
              { backgroundColor: todo.completed ? '#FF9500' : '#34C759' }
            ]}
            onPress={handleToggle}
          >
            <Ionicons 
              name={todo.completed ? "arrow-undo" : "checkmark"} 
              size={20} 
              color="white" 
            />
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  };

  return (
    <GestureHandlerRootView>
      <Swipeable
        renderRightActions={renderRightActions}
        renderLeftActions={renderLeftActions}
        rightThreshold={40}
        leftThreshold={40}
      >
        <View style={[
          styles.container,
          { backgroundColor: colors.surface, borderColor: colors.border }
        ]}>
          <TouchableOpacity
            style={styles.content}
            onPress={handleToggle}
            activeOpacity={0.7}
          >
            <View style={styles.leftContent}>
              <TouchableOpacity
                style={[
                  styles.checkbox,
                  {
                    backgroundColor: todo.completed ? colors.primary : 'transparent',
                    borderColor: todo.completed ? colors.primary : colors.textSecondary,
                  }
                ]}
                onPress={handleToggle}
              >
                {todo.completed && (
                  <Ionicons name="checkmark" size={16} color="white" />
                )}
              </TouchableOpacity>
              
              <View style={styles.textContent}>
                <Text
                  style={[
                    styles.title,
                    {
                      color: todo.completed ? colors.textSecondary : colors.text,
                      textDecorationLine: todo.completed ? 'line-through' : 'none',
                    }
                  ]}
                  numberOfLines={2}
                >
                  {todo.title}
                </Text>
                
                <View style={styles.metadata}>
                  <View style={styles.categoryContainer}>
                    <Text style={[styles.category, { color: colors.textSecondary }]}>
                      {todo.category}
                    </Text>
                  </View>
                  
                  {todo.dueDate && (
                    <Text
                      style={[
                        styles.dueDate,
                        {
                          color: isOverdue ? '#FF3B30' : colors.textSecondary,
                        }
                      ]}
                    >
                      {formatDueDate(todo.dueDate)}
                    </Text>
                  )}
                </View>
              </View>
            </View>
            
            <View style={styles.rightContent}>
              <View
                style={[
                  styles.priorityIndicator,
                  { backgroundColor: getPriorityColor(todo.priority) }
                ]}
              />
            </View>
          </TouchableOpacity>
        </View>
      </Swipeable>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  leftContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textContent: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  metadata: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoryContainer: {
    flex: 1,
  },
  category: {
    fontSize: 12,
    fontWeight: '400',
  },
  dueDate: {
    fontSize: 12,
    fontWeight: '500',
  },
  rightContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  priorityIndicator: {
    width: 4,
    height: 24,
    borderRadius: 2,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingRight: 16,
  },
  leftActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingLeft: 16,
  },
  actionButton: {
    marginHorizontal: 4,
  },
  editButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completeButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Card } from '@/components/common';
import { useTheme } from '@/contexts/ThemeContext';
import { Todo } from '@/types';

interface UpcomingTasksProps {
  tasks: Todo[];
  onTaskPress?: (task: Todo) => void;
  onToggleTask?: (taskId: string) => void;
}

export const UpcomingTasks: React.FC<UpcomingTasksProps> = ({ 
  tasks, 
  onTaskPress,
  onToggleTask 
}) => {
  const { colors } = useTheme();

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return colors.error;
      case 'medium':
        return colors.warning;
      case 'low':
        return colors.success;
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

  const renderTaskItem = ({ item }: { item: Todo }) => (
    <TouchableOpacity
      onPress={() => onTaskPress?.(item)}
      activeOpacity={0.7}
    >
      <View style={[styles.taskItem, { borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={[
            styles.checkbox,
            { borderColor: colors.border },
            item.completed && { backgroundColor: colors.primary }
          ]}
          onPress={() => onToggleTask?.(item._id)}
        >
          {item.completed && (
            <Text style={styles.checkmark}>✓</Text>
          )}
        </TouchableOpacity>
        
        <View style={styles.taskContent}>
          <Text 
            style={[
              styles.taskTitle, 
              { color: colors.text },
              item.completed && styles.completedTask
            ]}
          >
            {item.title}
          </Text>
          <View style={styles.taskMeta}>
            <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(item.priority) }]}>
              <Text style={styles.priorityText}>{item.priority}</Text>
            </View>
            {item.dueDate && (
              <Text style={[styles.dueDate, { color: colors.textSecondary }]}>
                {formatDueDate(item.dueDate)}
              </Text>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.text }]}>Upcoming Tasks</Text>
      <Card style={styles.tasksCard} variant="elevated" padding="none">
        {tasks.length > 0 ? (
          <FlatList
            data={tasks.slice(0, 5)} // Show only first 5 tasks
            renderItem={renderTaskItem}
            keyExtractor={(item) => item._id}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false}
          />
        ) : (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No upcoming tasks
            </Text>
          </View>
        )}
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  tasksCard: {
    marginHorizontal: 16,
    padding: 0,
    borderRadius: 12,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
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
  checkmark: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  completedTask: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginRight: 8,
  },
  priorityText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  dueDate: {
    fontSize: 12,
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
  },
});
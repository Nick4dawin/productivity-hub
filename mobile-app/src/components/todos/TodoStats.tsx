import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';

interface TodoStatsProps {
  stats: {
    total: number;
    completed: number;
    active: number;
    overdue: number;
    byPriority: {
      high: number;
      medium: number;
      low: number;
    };
    byCategory: Record<string, number>;
  };
  onCategoryPress?: (category: string) => void;
}

export const TodoStats: React.FC<TodoStatsProps> = ({
  stats,
  onCategoryPress,
}) => {
  const { colors } = useTheme();

  const completionRate = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;

  const priorityColors = {
    high: '#FF3B30',
    medium: '#FF9500',
    low: '#34C759',
  };

  const renderProgressBar = () => (
    <View style={styles.progressContainer}>
      <View style={styles.progressHeader}>
        <Text style={[styles.progressTitle, { color: colors.text }]}>
          Completion Progress
        </Text>
        <Text style={[styles.progressPercentage, { color: colors.primary }]}>
          {completionRate.toFixed(0)}%
        </Text>
      </View>
      
      <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
        <View
          style={[
            styles.progressFill,
            {
              backgroundColor: colors.primary,
              width: `${completionRate}%`,
            }
          ]}
        />
      </View>
      
      <View style={styles.progressLabels}>
        <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>
          {stats.completed} completed
        </Text>
        <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>
          {stats.active} remaining
        </Text>
      </View>
    </View>
  );

  const renderPriorityStats = () => (
    <View style={styles.priorityContainer}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        By Priority
      </Text>
      
      <View style={styles.priorityGrid}>
        {Object.entries(stats.byPriority).map(([priority, count]) => (
          <View
            key={priority}
            style={[
              styles.priorityCard,
              { backgroundColor: colors.surface, borderColor: colors.border }
            ]}
          >
            <View
              style={[
                styles.priorityIndicator,
                { backgroundColor: priorityColors[priority as keyof typeof priorityColors] }
              ]}
            />
            <Text style={[styles.priorityCount, { color: colors.text }]}>
              {count}
            </Text>
            <Text style={[styles.priorityLabel, { color: colors.textSecondary }]}>
              {priority.charAt(0).toUpperCase() + priority.slice(1)}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );

  const renderCategoryStats = () => {
    const categories = Object.entries(stats.byCategory)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5); // Show top 5 categories

    if (categories.length === 0) return null;

    return (
      <View style={styles.categoryContainer}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          By Category
        </Text>
        
        <View style={styles.categoryList}>
          {categories.map(([category, count]) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryItem,
                { backgroundColor: colors.surface, borderColor: colors.border }
              ]}
              onPress={() => onCategoryPress?.(category)}
              activeOpacity={0.7}
            >
              <View style={styles.categoryInfo}>
                <Text style={[styles.categoryName, { color: colors.text }]}>
                  {category}
                </Text>
                <Text style={[styles.categoryCount, { color: colors.textSecondary }]}>
                  {count} todo{count !== 1 ? 's' : ''}
                </Text>
              </View>
              
              <View style={styles.categoryProgress}>
                <View
                  style={[
                    styles.categoryProgressBar,
                    { backgroundColor: colors.border }
                  ]}
                >
                  <View
                    style={[
                      styles.categoryProgressFill,
                      {
                        backgroundColor: colors.primary,
                        width: `${(count / stats.total) * 100}%`,
                      }
                    ]}
                  />
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color={colors.textSecondary}
                />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  const renderOverdueAlert = () => {
    if (stats.overdue === 0) return null;

    return (
      <View style={[styles.overdueAlert, { backgroundColor: '#FF3B30' }]}>
        <Ionicons name="warning" size={20} color="white" />
        <Text style={styles.overdueText}>
          {stats.overdue} overdue task{stats.overdue > 1 ? 's' : ''} need attention
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {renderOverdueAlert()}
      {renderProgressBar()}
      {renderPriorityStats()}
      {renderCategoryStats()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 20,
  },
  overdueAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  overdueText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  progressContainer: {
    gap: 8,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  progressPercentage: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressLabel: {
    fontSize: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  priorityContainer: {
    gap: 12,
  },
  priorityGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  priorityCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    gap: 4,
  },
  priorityIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  priorityCount: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  priorityLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  categoryContainer: {
    gap: 12,
  },
  categoryList: {
    gap: 8,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  categoryCount: {
    fontSize: 12,
  },
  categoryProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryProgressBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  categoryProgressFill: {
    height: '100%',
    borderRadius: 2,
  },
});
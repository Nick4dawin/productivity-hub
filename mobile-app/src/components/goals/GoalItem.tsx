import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Swipeable } from 'react-native-gesture-handler';

import { useTheme } from '../../contexts/ThemeContext';
import { useGoalProgress } from '../../hooks/useGoals';
import { Goal } from '../../types';

import Card from '../common/Card';

interface GoalItemProps {
  goal: Goal;
  onPress: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const GoalItem: React.FC<GoalItemProps> = ({
  goal,
  onPress,
  onEdit,
  onDelete,
}) => {
  const { theme } = useTheme();
  const { progress, completedMilestones, totalMilestones } = useGoalProgress(goal);

  const getStatusColor = (status: Goal['status']) => {
    switch (status) {
      case 'Completed':
        return theme.colors.success;
      case 'In Progress':
        return theme.colors.primary;
      case 'On Hold':
        return theme.colors.warning;
      default:
        return theme.colors.textSecondary;
    }
  };

  const getStatusIcon = (status: Goal['status']) => {
    switch (status) {
      case 'Completed':
        return 'checkmark-circle';
      case 'In Progress':
        return 'play-circle';
      case 'On Hold':
        return 'pause-circle';
      default:
        return 'ellipse-outline';
    }
  };

  const renderRightActions = () => (
    <View style={styles.rightActions}>
      <TouchableOpacity
        style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
        onPress={onEdit}
      >
        <Ionicons name="pencil" size={20} color="white" />
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.actionButton, { backgroundColor: theme.colors.error }]}
        onPress={onDelete}
      >
        <Ionicons name="trash" size={20} color="white" />
      </TouchableOpacity>
    </View>
  );

  return (
    <Swipeable renderRightActions={renderRightActions}>
      <Card style={styles.container}>
        <TouchableOpacity onPress={onPress} style={styles.content}>
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              <Text style={[styles.title, { color: theme.colors.text }]} numberOfLines={2}>
                {goal.title}
              </Text>
              <View style={styles.statusContainer}>
                <Ionicons
                  name={getStatusIcon(goal.status)}
                  size={16}
                  color={getStatusColor(goal.status)}
                />
                <Text style={[styles.status, { color: getStatusColor(goal.status) }]}>
                  {goal.status}
                </Text>
              </View>
            </View>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { backgroundColor: theme.colors.border }]}>
              <View
                style={[
                  styles.progressFill,
                  {
                    backgroundColor: getStatusColor(goal.status),
                    width: `${progress}%`,
                  },
                ]}
              />
            </View>
            <Text style={[styles.progressText, { color: theme.colors.textSecondary }]}>
              {completedMilestones}/{totalMilestones} milestones • {progress}%
            </Text>
          </View>

          {/* SMART Goal Preview */}
          {goal.specific && (
            <Text style={[styles.description, { color: theme.colors.textSecondary }]} numberOfLines={2}>
              {goal.specific}
            </Text>
          )}

          {/* Milestones Preview */}
          {goal.milestones.length > 0 && (
            <View style={styles.milestonesPreview}>
              <Text style={[styles.milestonesTitle, { color: theme.colors.textSecondary }]}>
                Next Milestones:
              </Text>
              {goal.milestones
                .filter(m => !m.completed)
                .slice(0, 2)
                .map((milestone, index) => (
                  <View key={milestone._id} style={styles.milestoneItem}>
                    <Ionicons
                      name="ellipse-outline"
                      size={12}
                      color={theme.colors.textSecondary}
                    />
                    <Text style={[styles.milestoneText, { color: theme.colors.textSecondary }]} numberOfLines={1}>
                      {milestone.title}
                    </Text>
                  </View>
                ))}
            </View>
          )}
        </TouchableOpacity>
      </Card>
    </Swipeable>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  status: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '500',
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  milestonesPreview: {
    marginTop: 8,
  },
  milestonesTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  milestoneItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  milestoneText: {
    fontSize: 12,
    marginLeft: 6,
    flex: 1,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    width: 60,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default GoalItem;
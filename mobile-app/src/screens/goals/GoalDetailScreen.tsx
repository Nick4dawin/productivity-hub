import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { useGoals, useGoalProgress, useUpdateMilestone, useDeleteGoal } from '../../hooks/useGoals';
import { useTheme } from '../../contexts/ThemeContext';
import { Milestone } from '../../types';

import Header from '../../components/common/Header';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';

interface RouteParams {
  goalId: string;
}

const GoalDetailScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { goalId } = route.params as RouteParams;
  const { theme } = useTheme();

  const { data: goals = [], isLoading } = useGoals();
  const updateMilestoneMutation = useUpdateMilestone();
  const deleteGoalMutation = useDeleteGoal();

  const goal = goals.find(g => g._id === goalId);
  const { progress, completedMilestones, totalMilestones } = goal ? useGoalProgress(goal) : { progress: 0, completedMilestones: 0, totalMilestones: 0 };

  const handleEditGoal = () => {
    navigation.navigate('EditGoal' as never, { goalId } as never);
  };

  const handleDeleteGoal = () => {
    Alert.alert(
      'Delete Goal',
      `Are you sure you want to delete "${goal?.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteGoalMutation.mutateAsync(goalId);
              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete goal');
            }
          },
        },
      ]
    );
  };

  const handleToggleMilestone = async (milestone: Milestone) => {
    try {
      await updateMilestoneMutation.mutateAsync({
        goalId,
        milestoneId: milestone._id,
        completed: !milestone.completed,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to update milestone');
    }
  };

  const getStatusColor = (status: string) => {
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

  const getStatusIcon = (status: string) => {
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

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Header title="Goal Details" showBackButton />
        <LoadingSpinner />
      </SafeAreaView>
    );
  }

  if (!goal) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Header title="Goal Details" showBackButton />
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: theme.colors.text }]}>
            Goal not found
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Header 
        title="Goal Details" 
        showBackButton
        rightComponent={
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={handleEditGoal} style={styles.headerButton}>
              <Ionicons name="pencil" size={20} color={theme.colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDeleteGoal} style={styles.headerButton}>
              <Ionicons name="trash" size={20} color={theme.colors.error} />
            </TouchableOpacity>
          </View>
        }
      />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Goal Header */}
        <Card style={styles.headerCard}>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            {goal.title}
          </Text>
          
          <View style={styles.statusContainer}>
            <Ionicons
              name={getStatusIcon(goal.status)}
              size={20}
              color={getStatusColor(goal.status)}
            />
            <Text style={[styles.status, { color: getStatusColor(goal.status) }]}>
              {goal.status}
            </Text>
          </View>

          {/* Progress */}
          <View style={styles.progressContainer}>
            <View style={styles.progressHeader}>
              <Text style={[styles.progressLabel, { color: theme.colors.textSecondary }]}>
                Progress
              </Text>
              <Text style={[styles.progressPercentage, { color: theme.colors.text }]}>
                {progress}%
              </Text>
            </View>
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
              {completedMilestones} of {totalMilestones} milestones completed
            </Text>
          </View>
        </Card>

        {/* SMART Goal Details */}
        <Card style={styles.smartCard}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            SMART Goal Framework
          </Text>

          {goal.specific && (
            <View style={styles.smartSection}>
              <Text style={[styles.smartLabel, { color: theme.colors.primary }]}>
                Specific
              </Text>
              <Text style={[styles.smartText, { color: theme.colors.text }]}>
                {goal.specific}
              </Text>
            </View>
          )}

          {goal.measurable && (
            <View style={styles.smartSection}>
              <Text style={[styles.smartLabel, { color: theme.colors.primary }]}>
                Measurable
              </Text>
              <Text style={[styles.smartText, { color: theme.colors.text }]}>
                {goal.measurable}
              </Text>
            </View>
          )}

          {goal.achievable && (
            <View style={styles.smartSection}>
              <Text style={[styles.smartLabel, { color: theme.colors.primary }]}>
                Achievable
              </Text>
              <Text style={[styles.smartText, { color: theme.colors.text }]}>
                {goal.achievable}
              </Text>
            </View>
          )}

          {goal.relevant && (
            <View style={styles.smartSection}>
              <Text style={[styles.smartLabel, { color: theme.colors.primary }]}>
                Relevant
              </Text>
              <Text style={[styles.smartText, { color: theme.colors.text }]}>
                {goal.relevant}
              </Text>
            </View>
          )}

          {goal.timeBound && (
            <View style={styles.smartSection}>
              <Text style={[styles.smartLabel, { color: theme.colors.primary }]}>
                Time-bound
              </Text>
              <Text style={[styles.smartText, { color: theme.colors.text }]}>
                {goal.timeBound}
              </Text>
            </View>
          )}
        </Card>

        {/* Milestones */}
        {goal.milestones.length > 0 && (
          <Card style={styles.milestonesCard}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Milestones
            </Text>

            {goal.milestones.map((milestone) => (
              <TouchableOpacity
                key={milestone._id}
                onPress={() => handleToggleMilestone(milestone)}
                style={styles.milestoneItem}
              >
                <Ionicons
                  name={milestone.completed ? 'checkmark-circle' : 'ellipse-outline'}
                  size={24}
                  color={milestone.completed ? theme.colors.success : theme.colors.textSecondary}
                />
                <View style={styles.milestoneContent}>
                  <Text
                    style={[
                      styles.milestoneTitle,
                      { color: theme.colors.text },
                      milestone.completed && styles.completedText,
                    ]}
                  >
                    {milestone.title}
                  </Text>
                  {milestone.dueDate && (
                    <Text style={[styles.milestoneDueDate, { color: theme.colors.textSecondary }]}>
                      Due: {milestone.dueDate}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </Card>
        )}

        {/* Actions */}
        <View style={styles.actions}>
          <Button
            title="Edit Goal"
            onPress={handleEditGoal}
            variant="outline"
            style={styles.actionButton}
          />
          <Button
            title="Delete Goal"
            onPress={handleDeleteGoal}
            variant="outline"
            style={[styles.actionButton, { borderColor: theme.colors.error }]}
            textStyle={{ color: theme.colors.error }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  headerActions: {
    flexDirection: 'row',
  },
  headerButton: {
    marginLeft: 16,
  },
  headerCard: {
    marginBottom: 16,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  status: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  progressContainer: {
    marginTop: 8,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  progressPercentage: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '500',
  },
  smartCard: {
    marginBottom: 16,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  smartSection: {
    marginBottom: 16,
  },
  smartLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  smartText: {
    fontSize: 14,
    lineHeight: 20,
  },
  milestonesCard: {
    marginBottom: 16,
    padding: 20,
  },
  milestoneItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  milestoneContent: {
    flex: 1,
    marginLeft: 12,
  },
  milestoneTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  milestoneDueDate: {
    fontSize: 12,
    fontWeight: '500',
  },
  completedText: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    marginBottom: 32,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 8,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    fontWeight: '500',
  },
});

export default GoalDetailScreen;
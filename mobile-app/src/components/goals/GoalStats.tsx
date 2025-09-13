import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../../contexts/ThemeContext';
import { useGoalProgress } from '../../hooks/useGoals';
import { Goal } from '../../types';

import Card from '../common/Card';

interface GoalStatsProps {
  goals: Goal[];
}

const GoalStats: React.FC<GoalStatsProps> = ({ goals }) => {
  const { theme } = useTheme();

  // Calculate statistics
  const totalGoals = goals.length;
  const completedGoals = goals.filter(g => g.status === 'Completed').length;
  const inProgressGoals = goals.filter(g => g.status === 'In Progress').length;
  const onHoldGoals = goals.filter(g => g.status === 'On Hold').length;

  // Calculate overall progress
  const totalProgress = goals.reduce((sum, goal) => {
    const { progress } = useGoalProgress(goal);
    return sum + progress;
  }, 0);
  const averageProgress = totalGoals > 0 ? Math.round(totalProgress / totalGoals) : 0;

  // Calculate total milestones
  const totalMilestones = goals.reduce((sum, goal) => sum + goal.milestones.length, 0);
  const completedMilestones = goals.reduce((sum, goal) => 
    sum + goal.milestones.filter(m => m.completed).length, 0
  );

  const stats = [
    {
      icon: 'flag',
      label: 'Total Goals',
      value: totalGoals.toString(),
      color: theme.colors.primary,
    },
    {
      icon: 'checkmark-circle',
      label: 'Completed',
      value: completedGoals.toString(),
      color: theme.colors.success,
    },
    {
      icon: 'play-circle',
      label: 'In Progress',
      value: inProgressGoals.toString(),
      color: theme.colors.primary,
    },
    {
      icon: 'pause-circle',
      label: 'On Hold',
      value: onHoldGoals.toString(),
      color: theme.colors.warning,
    },
  ];

  if (totalGoals === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Main Stats Grid */}
      <View style={styles.statsGrid}>
        {stats.map((stat, index) => (
          <Card key={index} style={styles.statCard}>
            <View style={styles.statContent}>
              <Ionicons
                name={stat.icon as any}
                size={24}
                color={stat.color}
                style={styles.statIcon}
              />
              <Text style={[styles.statValue, { color: theme.colors.text }]}>
                {stat.value}
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                {stat.label}
              </Text>
            </View>
          </Card>
        ))}
      </View>

      {/* Progress Summary */}
      <Card style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, { color: theme.colors.text }]}>
              {averageProgress}%
            </Text>
            <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>
              Average Progress
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, { color: theme.colors.text }]}>
              {completedMilestones}/{totalMilestones}
            </Text>
            <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>
              Milestones Done
            </Text>
          </View>
        </View>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statCard: {
    width: '48%',
    marginBottom: 8,
  },
  statContent: {
    alignItems: 'center',
    padding: 16,
  },
  statIcon: {
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  summaryCard: {
    padding: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 16,
  },
});

export default GoalStats;
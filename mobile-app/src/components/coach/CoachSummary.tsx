import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Card } from '@/components/common/Card';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { useCoachData } from '@/hooks/useCoach';

export const CoachSummary: React.FC = () => {
  const { colors } = useTheme();
  const { data: coachData, isLoading } = useCoachData();

  const generateSummary = () => {
    if (!coachData) return null;

    const totalTasks = coachData.todos.length + coachData.completedTasks.length;
    const completionRate = totalTasks > 0 ? (coachData.completedTasks.length / totalTasks) * 100 : 0;
    
    const recentMoods = coachData.moodLog.slice(-7);
    const averageMood = recentMoods.length > 0 
      ? recentMoods.reduce((sum, mood) => sum + mood.rating, 0) / recentMoods.length 
      : 0;

    const activeHabits = coachData.habitProgress.length;
    const totalGoals = coachData.goals.shortTerm.length + coachData.goals.longTerm.length;

    return {
      totalTasks,
      completionRate,
      averageMood,
      activeHabits,
      totalGoals,
      pendingTasks: coachData.todos.length,
    };
  };

  const getMoodDescription = (rating: number) => {
    if (rating >= 4.5) return { text: 'Excellent', color: colors.success };
    if (rating >= 3.5) return { text: 'Good', color: colors.primary };
    if (rating >= 2.5) return { text: 'Okay', color: colors.warning };
    return { text: 'Needs attention', color: colors.error };
  };

  const getCompletionDescription = (rate: number) => {
    if (rate >= 80) return { text: 'Outstanding', color: colors.success };
    if (rate >= 60) return { text: 'Good progress', color: colors.primary };
    if (rate >= 40) return { text: 'Making progress', color: colors.warning };
    return { text: 'Room for improvement', color: colors.error };
  };

  if (isLoading) {
    return (
      <Card style={styles.card}>
        <LoadingSpinner />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Generating your summary...
        </Text>
      </Card>
    );
  }

  const summary = generateSummary();
  if (!summary) {
    return (
      <Card style={styles.card}>
        <Text style={[styles.errorText, { color: colors.error }]}>
          Unable to generate summary
        </Text>
      </Card>
    );
  }

  const moodDesc = getMoodDescription(summary.averageMood);
  const completionDesc = getCompletionDescription(summary.completionRate);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Overall Summary */}
      <Card style={styles.summaryCard}>
        <Text style={[styles.title, { color: colors.text }]}>
          📋 Your Productivity Summary
        </Text>
        
        <View style={styles.summaryGrid}>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryNumber, { color: colors.primary }]}>
              {summary.totalTasks}
            </Text>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
              Total Tasks
            </Text>
          </View>
          
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryNumber, { color: completionDesc.color }]}>
              {summary.completionRate.toFixed(0)}%
            </Text>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
              Completed
            </Text>
          </View>
          
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryNumber, { color: colors.warning }]}>
              {summary.pendingTasks}
            </Text>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
              Pending
            </Text>
          </View>
        </View>

        <Text style={[styles.summaryDescription, { color: colors.text }]}>
          You have {completionDesc.text.toLowerCase()} with a {summary.completionRate.toFixed(0)}% completion rate.
        </Text>
      </Card>

      {/* Mood Analysis */}
      <Card style={styles.moodCard}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>
          😊 Mood Analysis
        </Text>
        
        <View style={styles.moodContainer}>
          <View style={styles.moodRating}>
            <Text style={[styles.moodNumber, { color: moodDesc.color }]}>
              {summary.averageMood.toFixed(1)}
            </Text>
            <Text style={[styles.moodScale, { color: colors.textSecondary }]}>
              / 5.0
            </Text>
          </View>
          
          <View style={styles.moodDescription}>
            <Text style={[styles.moodStatus, { color: moodDesc.color }]}>
              {moodDesc.text}
            </Text>
            <Text style={[styles.moodSubtext, { color: colors.textSecondary }]}>
              Average mood over the last 7 entries
            </Text>
          </View>
        </View>
      </Card>

      {/* Habits & Goals */}
      <Card style={styles.habitsGoalsCard}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>
          🎯 Habits & Goals
        </Text>
        
        <View style={styles.habitsGoalsGrid}>
          <View style={styles.habitsGoalsItem}>
            <Text style={[styles.habitsGoalsNumber, { color: colors.success }]}>
              {summary.activeHabits}
            </Text>
            <Text style={[styles.habitsGoalsLabel, { color: colors.textSecondary }]}>
              Active Habits
            </Text>
          </View>
          
          <View style={styles.habitsGoalsItem}>
            <Text style={[styles.habitsGoalsNumber, { color: colors.primary }]}>
              {summary.totalGoals}
            </Text>
            <Text style={[styles.habitsGoalsLabel, { color: colors.textSecondary }]}>
              Total Goals
            </Text>
          </View>
        </View>

        <Text style={[styles.habitsGoalsDescription, { color: colors.textSecondary }]}>
          You're tracking {summary.activeHabits} habits and working towards {summary.totalGoals} goals.
        </Text>
      </Card>

      {/* Personalized Insights */}
      <Card style={styles.insightsCard}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>
          💡 Personalized Insights
        </Text>
        
        <View style={styles.insightsList}>
          {summary.completionRate > 80 && (
            <Text style={[styles.insightText, { color: colors.text }]}>
              • You're crushing your tasks! Keep up the excellent momentum.
            </Text>
          )}
          
          {summary.averageMood >= 4 && (
            <Text style={[styles.insightText, { color: colors.text }]}>
              • Your mood has been consistently positive. Great job maintaining balance!
            </Text>
          )}
          
          {summary.activeHabits >= 3 && (
            <Text style={[styles.insightText, { color: colors.text }]}>
              • You're building multiple habits simultaneously. Focus on consistency over quantity.
            </Text>
          )}
          
          {summary.pendingTasks > 10 && (
            <Text style={[styles.insightText, { color: colors.text }]}>
              • Consider breaking down large tasks into smaller, manageable chunks.
            </Text>
          )}
          
          {summary.totalGoals === 0 && (
            <Text style={[styles.insightText, { color: colors.text }]}>
              • Setting clear goals can help direct your daily activities more effectively.
            </Text>
          )}
        </View>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  card: {
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
  },
  summaryCard: {
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  summaryDescription: {
    fontSize: 16,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  moodCard: {
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  moodContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  moodRating: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginRight: 16,
  },
  moodNumber: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  moodScale: {
    fontSize: 16,
    marginLeft: 4,
  },
  moodDescription: {
    flex: 1,
  },
  moodStatus: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  moodSubtext: {
    fontSize: 14,
  },
  habitsGoalsCard: {
    marginBottom: 16,
  },
  habitsGoalsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  habitsGoalsItem: {
    alignItems: 'center',
  },
  habitsGoalsNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  habitsGoalsLabel: {
    fontSize: 14,
    textAlign: 'center',
  },
  habitsGoalsDescription: {
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  insightsCard: {
    marginBottom: 16,
  },
  insightsList: {
    gap: 8,
  },
  insightText: {
    fontSize: 14,
    lineHeight: 20,
  },
});
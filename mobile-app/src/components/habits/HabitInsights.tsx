import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Habit } from '@/types';
import { getCurrentStreak, getHabitCompletionRate, isHabitCompletedToday } from '@/hooks/useHabits';

interface HabitInsightsProps {
  habits: Habit[];
  onHabitPress?: (habit: Habit) => void;
}

interface Insight {
  type: 'success' | 'warning' | 'info' | 'tip';
  title: string;
  message: string;
  action?: {
    text: string;
    onPress: () => void;
  };
  habit?: Habit;
}

export const HabitInsights: React.FC<HabitInsightsProps> = ({
  habits,
  onHabitPress,
}) => {
  const { colors } = useTheme();

  const generateInsights = (): Insight[] => {
    const insights: Insight[] = [];

    if (habits.length === 0) {
      insights.push({
        type: 'info',
        title: 'Get Started',
        message: 'Create your first habit to begin your journey toward positive change!',
      });
      return insights;
    }

    // Check for habits with long streaks
    const longStreakHabits = habits.filter(habit => getCurrentStreak(habit) >= 7);
    if (longStreakHabits.length > 0) {
      const bestHabit = longStreakHabits.reduce((best, current) => 
        getCurrentStreak(current) > getCurrentStreak(best) ? current : best
      );
      insights.push({
        type: 'success',
        title: 'Streak Champion! 🔥',
        message: `Amazing ${getCurrentStreak(bestHabit)}-day streak with "${bestHabit.name}"! Keep it up!`,
        habit: bestHabit,
        action: onHabitPress ? {
          text: 'View Details',
          onPress: () => onHabitPress(bestHabit),
        } : undefined,
      });
    }

    // Check for habits that haven't been completed today
    const incompleteTodayHabits = habits.filter(habit => !isHabitCompletedToday(habit));
    if (incompleteTodayHabits.length > 0 && incompleteTodayHabits.length <= 3) {
      const randomHabit = incompleteTodayHabits[Math.floor(Math.random() * incompleteTodayHabits.length)];
      insights.push({
        type: 'info',
        title: 'Daily Reminder',
        message: `Don't forget to complete "${randomHabit.name}" today to maintain your progress!`,
        habit: randomHabit,
      });
    }

    // Check for struggling habits (low completion rate)
    const strugglingHabits = habits.filter(habit => {
      const rate = getHabitCompletionRate(habit, 14);
      return rate < 30 && rate > 0; // Has some attempts but low success
    });
    
    if (strugglingHabits.length > 0) {
      const strugglingHabit = strugglingHabits[0];
      insights.push({
        type: 'warning',
        title: 'Need Some Help?',
        message: `"${strugglingHabit.name}" has a ${getHabitCompletionRate(strugglingHabit, 14)}% completion rate. Consider making it smaller or easier.`,
        habit: strugglingHabit,
        action: onHabitPress ? {
          text: 'Edit Habit',
          onPress: () => onHabitPress(strugglingHabit),
        } : undefined,
      });
    }

    // Check for perfect habits (100% completion rate)
    const perfectHabits = habits.filter(habit => {
      const rate = getHabitCompletionRate(habit, 7);
      return rate === 100 && habit.completedDates.length >= 7;
    });
    
    if (perfectHabits.length > 0) {
      const perfectHabit = perfectHabits[0];
      insights.push({
        type: 'success',
        title: 'Perfect Week! ⭐',
        message: `You've completed "${perfectHabit.name}" every day this week. Consider adding a new challenge!`,
        habit: perfectHabit,
      });
    }

    // Check for category imbalance
    const categories = [...new Set(habits.map(habit => habit.category))];
    if (categories.length === 1 && habits.length >= 3) {
      insights.push({
        type: 'tip',
        title: 'Diversify Your Habits',
        message: `All your habits are in "${categories[0]}". Consider adding habits from other life areas for balanced growth.`,
      });
    }

    // Check for too many habits
    if (habits.length > 7) {
      const avgCompletionRate = habits.reduce((sum, habit) => 
        sum + getHabitCompletionRate(habit, 7), 0) / habits.length;
      
      if (avgCompletionRate < 60) {
        insights.push({
          type: 'warning',
          title: 'Quality Over Quantity',
          message: `You have ${habits.length} habits with ${Math.round(avgCompletionRate)}% completion rate. Consider focusing on fewer habits to build consistency.`,
        });
      }
    }

    // Motivational insights based on overall progress
    const totalCompletions = habits.reduce((sum, habit) => sum + habit.completedDates.length, 0);
    if (totalCompletions >= 50) {
      insights.push({
        type: 'success',
        title: 'Milestone Achieved! 🎉',
        message: `You've completed habits ${totalCompletions} times! Your dedication is building lasting change.`,
      });
    }

    // Weekly completion insights
    const todayCompletions = habits.filter(habit => isHabitCompletedToday(habit)).length;
    const completionPercentage = habits.length > 0 ? Math.round((todayCompletions / habits.length) * 100) : 0;
    
    if (completionPercentage === 100 && habits.length > 1) {
      insights.push({
        type: 'success',
        title: 'Perfect Day! 🌟',
        message: `You've completed all ${habits.length} habits today. You're unstoppable!`,
      });
    } else if (completionPercentage >= 75) {
      insights.push({
        type: 'success',
        title: 'Great Progress!',
        message: `You've completed ${completionPercentage}% of your habits today. Keep up the momentum!`,
      });
    }

    // Habit formation insights
    const newHabits = habits.filter(habit => habit.completedDates.length < 21); // Less than 21 days
    const establishedHabits = habits.filter(habit => habit.completedDates.length >= 21);
    
    if (newHabits.length > 0 && establishedHabits.length > 0) {
      insights.push({
        type: 'tip',
        title: 'Building Strong Foundations',
        message: `You have ${establishedHabits.length} established habits and ${newHabits.length} in formation. Focus on consistency with new ones!`,
      });
    }

    return insights.slice(0, 4); // Limit to 4 insights to avoid overwhelming
  };

  const getInsightColor = (type: Insight['type']) => {
    switch (type) {
      case 'success':
        return colors.success;
      case 'warning':
        return colors.warning;
      case 'info':
        return colors.info;
      case 'tip':
        return colors.primary;
      default:
        return colors.textSecondary;
    }
  };

  const getInsightIcon = (type: Insight['type']) => {
    switch (type) {
      case 'success':
        return '✅';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      case 'tip':
        return '💡';
      default:
        return '📊';
    }
  };

  const insights = generateInsights();

  if (insights.length === 0) {
    return null;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <Text style={[styles.title, { color: colors.text }]}>
        Insights & Suggestions
      </Text>
      
      {insights.map((insight, index) => (
        <View
          key={index}
          style={[
            styles.insightCard,
            {
              backgroundColor: colors.background,
              borderLeftColor: getInsightColor(insight.type),
            },
          ]}
        >
          <View style={styles.insightHeader}>
            <Text style={styles.insightIcon}>
              {getInsightIcon(insight.type)}
            </Text>
            <Text
              style={[
                styles.insightTitle,
                { color: getInsightColor(insight.type) },
              ]}
            >
              {insight.title}
            </Text>
          </View>
          
          <Text style={[styles.insightMessage, { color: colors.text }]}>
            {insight.message}
          </Text>
          
          {insight.action && (
            <TouchableOpacity
              style={[
                styles.actionButton,
                { backgroundColor: getInsightColor(insight.type) },
              ]}
              onPress={insight.action.onPress}
            >
              <Text style={[styles.actionButtonText, { color: colors.surface }]}>
                {insight.action.text}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  insightCard: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 4,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  insightIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  insightMessage: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
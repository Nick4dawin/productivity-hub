import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Habit } from '@/types';
import { getCurrentStreak, getHabitCompletionRate } from '@/hooks/useHabits';

interface HabitProgressProps {
  habit: Habit;
  showAnimation?: boolean;
}

export const HabitProgress: React.FC<HabitProgressProps> = ({
  habit,
  showAnimation = false,
}) => {
  const { colors } = useTheme();
  const currentStreak = getCurrentStreak(habit);
  const completionRate30Days = getHabitCompletionRate(habit, 30);
  const completionRate7Days = getHabitCompletionRate(habit, 7);

  const animatedValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (showAnimation) {
      Animated.timing(animatedValue, {
        toValue: completionRate30Days,
        duration: 1000,
        useNativeDriver: false,
      }).start();
    } else {
      animatedValue.setValue(completionRate30Days);
    }
  }, [completionRate30Days, showAnimation]);

  const getStreakColor = (streak: number) => {
    if (streak >= 30) return colors.success;
    if (streak >= 7) return colors.warning;
    if (streak >= 3) return colors.info;
    return colors.textSecondary;
  };

  const getCompletionRateColor = (rate: number) => {
    if (rate >= 80) return colors.success;
    if (rate >= 60) return colors.warning;
    if (rate >= 40) return colors.info;
    return colors.error;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <Text style={[styles.title, { color: colors.text }]}>Progress</Text>
      
      {/* Current Streak */}
      <View style={styles.statRow}>
        <View style={styles.statItem}>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            Current Streak
          </Text>
          <View style={styles.streakContainer}>
            <Text
              style={[
                styles.streakNumber,
                { color: getStreakColor(currentStreak) },
              ]}
            >
              {currentStreak}
            </Text>
            <Text style={[styles.streakUnit, { color: colors.textSecondary }]}>
              {currentStreak === 1 ? 'day' : 'days'}
            </Text>
            {currentStreak > 0 && (
              <Text style={styles.fireEmoji}>🔥</Text>
            )}
          </View>
        </View>
      </View>

      {/* Completion Rates */}
      <View style={styles.statRow}>
        <View style={styles.statItem}>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            Last 7 Days
          </Text>
          <Text
            style={[
              styles.statValue,
              { color: getCompletionRateColor(completionRate7Days) },
            ]}
          >
            {completionRate7Days}%
          </Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            Last 30 Days
          </Text>
          <Text
            style={[
              styles.statValue,
              { color: getCompletionRateColor(completionRate30Days) },
            ]}
          >
            {completionRate30Days}%
          </Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressSection}>
        <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>
          30-Day Completion Rate
        </Text>
        <View style={[styles.progressBarContainer, { backgroundColor: colors.border }]}>
          <Animated.View
            style={[
              styles.progressBar,
              {
                backgroundColor: getCompletionRateColor(completionRate30Days),
                width: animatedValue.interpolate({
                  inputRange: [0, 100],
                  outputRange: ['0%', '100%'],
                  extrapolate: 'clamp',
                }),
              },
            ]}
          />
        </View>
      </View>

      {/* Milestones */}
      <View style={styles.milestonesSection}>
        <Text style={[styles.milestonesTitle, { color: colors.text }]}>
          Milestones
        </Text>
        <View style={styles.milestonesContainer}>
          {[3, 7, 14, 30, 60, 100].map((milestone) => (
            <View
              key={milestone}
              style={[
                styles.milestone,
                {
                  backgroundColor:
                    currentStreak >= milestone ? colors.success : colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.milestoneText,
                  {
                    color:
                      currentStreak >= milestone ? colors.surface : colors.textSecondary,
                  },
                ]}
              >
                {milestone}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    margin: 16,
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
  statRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    marginBottom: 4,
    textAlign: 'center',
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
  },
  streakNumber: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  streakUnit: {
    fontSize: 14,
    marginLeft: 4,
  },
  fireEmoji: {
    fontSize: 20,
    marginLeft: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  progressSection: {
    marginBottom: 16,
  },
  progressLabel: {
    fontSize: 12,
    marginBottom: 8,
  },
  progressBarContainer: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  milestonesSection: {
    marginTop: 8,
  },
  milestonesTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  milestonesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  milestone: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  milestoneText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
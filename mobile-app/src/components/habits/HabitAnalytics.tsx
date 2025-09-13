import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { VictoryChart, VictoryLine, VictoryArea, VictoryBar, VictoryAxis, VictoryTheme } from 'victory-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Habit } from '@/types';
import { getHabitCompletionRate, getCurrentStreak } from '@/hooks/useHabits';

interface HabitAnalyticsProps {
  habits: Habit[];
}

const { width: screenWidth } = Dimensions.get('window');
const chartWidth = screenWidth - 32;

export const HabitAnalytics: React.FC<HabitAnalyticsProps> = ({ habits }) => {
  const { colors } = useTheme();

  // Calculate analytics data
  const getWeeklyCompletionData = () => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split('T')[0];
    });

    return last7Days.map((date, index) => {
      const completedCount = habits.filter(habit => 
        habit.completedDates.includes(date)
      ).length;
      
      return {
        x: index + 1,
        y: habits.length > 0 ? (completedCount / habits.length) * 100 : 0,
        date: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
      };
    });
  };

  const getHabitCompletionRates = () => {
    return habits.map(habit => ({
      habit: habit.name.length > 15 ? habit.name.substring(0, 15) + '...' : habit.name,
      rate: getHabitCompletionRate(habit, 30),
      color: habit.color || colors.primary,
    })).sort((a, b) => b.rate - a.rate);
  };

  const getCategoryBreakdown = () => {
    const categoryCount: { [key: string]: number } = {};
    habits.forEach(habit => {
      categoryCount[habit.category] = (categoryCount[habit.category] || 0) + 1;
    });

    return Object.entries(categoryCount).map(([category, count]) => ({
      category: category.length > 12 ? category.substring(0, 12) + '...' : category,
      count,
      percentage: habits.length > 0 ? Math.round((count / habits.length) * 100) : 0,
    }));
  };

  const getStreakDistribution = () => {
    const streaks = habits.map(habit => getCurrentStreak(habit));
    const distribution = {
      '0 days': streaks.filter(s => s === 0).length,
      '1-3 days': streaks.filter(s => s >= 1 && s <= 3).length,
      '4-7 days': streaks.filter(s => s >= 4 && s <= 7).length,
      '8-30 days': streaks.filter(s => s >= 8 && s <= 30).length,
      '30+ days': streaks.filter(s => s > 30).length,
    };

    return Object.entries(distribution).map(([range, count]) => ({
      range,
      count,
      percentage: habits.length > 0 ? Math.round((count / habits.length) * 100) : 0,
    }));
  };

  const getOverallStats = () => {
    const totalHabits = habits.length;
    const activeStreaks = habits.filter(habit => getCurrentStreak(habit) > 0).length;
    const avgCompletionRate = habits.length > 0 
      ? Math.round(habits.reduce((sum, habit) => sum + getHabitCompletionRate(habit, 30), 0) / habits.length)
      : 0;
    const longestStreak = Math.max(...habits.map(habit => getCurrentStreak(habit)), 0);

    return {
      totalHabits,
      activeStreaks,
      avgCompletionRate,
      longestStreak,
    };
  };

  const weeklyData = getWeeklyCompletionData();
  const habitRates = getHabitCompletionRates();
  const categoryData = getCategoryBreakdown();
  const streakData = getStreakDistribution();
  const overallStats = getOverallStats();

  if (habits.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.surface }]}>
        <Text style={[styles.title, { color: colors.text }]}>Habit Analytics</Text>
        <View style={styles.emptyState}>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            No habits to analyze yet. Create some habits to see your analytics!
          </Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.surface }]}>
      <Text style={[styles.title, { color: colors.text }]}>Habit Analytics</Text>

      {/* Overall Stats */}
      <View style={styles.statsGrid}>
        <View style={[styles.statCard, { backgroundColor: colors.background }]}>
          <Text style={[styles.statNumber, { color: colors.primary }]}>
            {overallStats.totalHabits}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            Total Habits
          </Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.background }]}>
          <Text style={[styles.statNumber, { color: colors.success }]}>
            {overallStats.activeStreaks}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            Active Streaks
          </Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.background }]}>
          <Text style={[styles.statNumber, { color: colors.warning }]}>
            {overallStats.avgCompletionRate}%
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            Avg Completion
          </Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.background }]}>
          <Text style={[styles.statNumber, { color: colors.info }]}>
            {overallStats.longestStreak}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            Longest Streak
          </Text>
        </View>
      </View>

      {/* Weekly Completion Trend */}
      <View style={styles.chartSection}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          7-Day Completion Trend
        </Text>
        <View style={[styles.chartContainer, { backgroundColor: colors.background }]}>
          <VictoryChart
            width={chartWidth}
            height={200}
            padding={{ left: 50, top: 20, right: 20, bottom: 50 }}
            theme={VictoryTheme.material}
          >
            <VictoryAxis
              dependentAxis
              tickFormat={(t) => `${t}%`}
              style={{
                tickLabels: { fill: colors.textSecondary, fontSize: 12 },
                axis: { stroke: colors.border },
                grid: { stroke: colors.border, strokeOpacity: 0.3 },
              }}
            />
            <VictoryAxis
              tickFormat={(x) => weeklyData[x - 1]?.date || ''}
              style={{
                tickLabels: { fill: colors.textSecondary, fontSize: 12 },
                axis: { stroke: colors.border },
              }}
            />
            <VictoryArea
              data={weeklyData}
              style={{
                data: { fill: colors.primary, fillOpacity: 0.3, stroke: colors.primary, strokeWidth: 2 },
              }}
              animate={{
                duration: 1000,
                onLoad: { duration: 500 },
              }}
            />
          </VictoryChart>
        </View>
      </View>

      {/* Habit Completion Rates */}
      <View style={styles.chartSection}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          30-Day Completion Rates
        </Text>
        <View style={[styles.chartContainer, { backgroundColor: colors.background }]}>
          <VictoryChart
            width={chartWidth}
            height={Math.max(200, habitRates.length * 30)}
            padding={{ left: 120, top: 20, right: 20, bottom: 50 }}
            domainPadding={{ y: 20 }}
          >
            <VictoryAxis
              dependentAxis
              tickFormat={(t) => `${t}%`}
              style={{
                tickLabels: { fill: colors.textSecondary, fontSize: 12 },
                axis: { stroke: colors.border },
                grid: { stroke: colors.border, strokeOpacity: 0.3 },
              }}
            />
            <VictoryAxis
              tickFormat={(x) => habitRates[x - 1]?.habit || ''}
              style={{
                tickLabels: { fill: colors.textSecondary, fontSize: 10, angle: 0 },
                axis: { stroke: colors.border },
              }}
            />
            <VictoryBar
              data={habitRates.map((item, index) => ({ x: index + 1, y: item.rate }))}
              style={{
                data: { fill: colors.success },
              }}
              animate={{
                duration: 1000,
                onLoad: { duration: 500 },
              }}
            />
          </VictoryChart>
        </View>
      </View>

      {/* Category Breakdown */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Habits by Category
        </Text>
        {categoryData.map((item, index) => (
          <View key={index} style={styles.categoryItem}>
            <View style={styles.categoryInfo}>
              <Text style={[styles.categoryName, { color: colors.text }]}>
                {item.category}
              </Text>
              <Text style={[styles.categoryCount, { color: colors.textSecondary }]}>
                {item.count} habits ({item.percentage}%)
              </Text>
            </View>
            <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
              <View
                style={[
                  styles.progressFill,
                  {
                    backgroundColor: colors.primary,
                    width: `${item.percentage}%`,
                  },
                ]}
              />
            </View>
          </View>
        ))}
      </View>

      {/* Streak Distribution */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Streak Distribution
        </Text>
        {streakData.map((item, index) => (
          <View key={index} style={styles.streakItem}>
            <View style={styles.streakInfo}>
              <Text style={[styles.streakRange, { color: colors.text }]}>
                {item.range}
              </Text>
              <Text style={[styles.streakCount, { color: colors.textSecondary }]}>
                {item.count} habits ({item.percentage}%)
              </Text>
            </View>
            <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
              <View
                style={[
                  styles.progressFill,
                  {
                    backgroundColor: colors.warning,
                    width: `${item.percentage}%`,
                  },
                ]}
              />
            </View>
          </View>
        ))}
      </View>

      {/* Insights */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Insights & Suggestions
        </Text>
        <View style={[styles.insightCard, { backgroundColor: colors.background }]}>
          {overallStats.avgCompletionRate >= 80 && (
            <Text style={[styles.insightText, { color: colors.success }]}>
              🎉 Excellent! You're maintaining an {overallStats.avgCompletionRate}% completion rate.
            </Text>
          )}
          {overallStats.avgCompletionRate < 50 && (
            <Text style={[styles.insightText, { color: colors.warning }]}>
              💪 Your completion rate is {overallStats.avgCompletionRate}%. Try focusing on fewer habits to build consistency.
            </Text>
          )}
          {overallStats.longestStreak >= 30 && (
            <Text style={[styles.insightText, { color: colors.success }]}>
              🔥 Amazing {overallStats.longestStreak}-day streak! You're building strong habits.
            </Text>
          )}
          {overallStats.activeStreaks === 0 && habits.length > 0 && (
            <Text style={[styles.insightText, { color: colors.info }]}>
              🚀 Start building momentum by completing at least one habit today!
            </Text>
          )}
          {categoryData.length === 1 && (
            <Text style={[styles.insightText, { color: colors.info }]}>
              🌟 Consider diversifying your habits across different life areas for balanced growth.
            </Text>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  chartSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  chartContainer: {
    borderRadius: 12,
    padding: 8,
    alignItems: 'center',
  },
  section: {
    marginBottom: 24,
  },
  categoryItem: {
    marginBottom: 12,
  },
  categoryInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '500',
  },
  categoryCount: {
    fontSize: 12,
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
  streakItem: {
    marginBottom: 12,
  },
  streakInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  streakRange: {
    fontSize: 14,
    fontWeight: '500',
  },
  streakCount: {
    fontSize: 12,
  },
  insightCard: {
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  insightText: {
    fontSize: 14,
    lineHeight: 20,
  },
});
import React, { useState } from 'react';
import { ScrollView, StyleSheet, RefreshControl, View, Text, TouchableOpacity } from 'react-native';
import { Container, Header, LoadingSpinner } from '@/components';
import { HabitChart, MoodChart, ProductivityChart } from '@/components/charts';
import { useTheme } from '@/contexts/ThemeContext';
import { useAnalytics } from '@/hooks/useAnalytics';

export const AnalyticsScreen: React.FC = () => {
  const { colors } = useTheme();
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');
  const { 
    habitAnalytics, 
    moodAnalytics, 
    productivityAnalytics, 
    isLoading, 
    error, 
    refreshAnalytics 
  } = useAnalytics(timeRange);

  const timeRangeOptions = [
    { label: 'Week', value: 'week' as const },
    { label: 'Month', value: 'month' as const },
    { label: 'Year', value: 'year' as const },
  ];

  if (isLoading) {
    return (
      <Container padding="none">
        <Header title="Analytics" />
        <LoadingSpinner />
      </Container>
    );
  }

  if (error) {
    return (
      <Container padding="none">
        <Header title="Analytics" />
        <ScrollView
          contentContainerStyle={styles.errorContainer}
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={refreshAnalytics} />
          }
        >
          <Text style={[styles.errorText, { color: colors.error }]}>
            {error}
          </Text>
        </ScrollView>
      </Container>
    );
  }

  return (
    <Container padding="none">
      <Header title="Analytics" />
      
      {/* Time Range Selector */}
      <View style={[styles.timeRangeContainer, { backgroundColor: colors.surface }]}>
        {timeRangeOptions.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.timeRangeButton,
              { borderColor: colors.border },
              timeRange === option.value && { 
                backgroundColor: colors.primary,
                borderColor: colors.primary,
              },
            ]}
            onPress={() => setTimeRange(option.value)}
          >
            <Text
              style={[
                styles.timeRangeText,
                { color: timeRange === option.value ? 'white' : colors.text },
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refreshAnalytics}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {/* Habit Analytics */}
        {habitAnalytics && habitAnalytics.weeklyProgress.length > 0 && (
          <View style={[styles.chartSection, { backgroundColor: colors.surface }]}>
            <HabitChart 
              data={habitAnalytics.weeklyProgress}
              title="Habit Completion Rate"
            />
          </View>
        )}

        {/* Mood Analytics */}
        {moodAnalytics && moodAnalytics.moodTrend.length > 0 && (
          <View style={[styles.chartSection, { backgroundColor: colors.surface }]}>
            <MoodChart 
              data={moodAnalytics.moodTrend}
              title="Mood & Energy Trends"
            />
          </View>
        )}

        {/* Productivity Analytics */}
        {productivityAnalytics && productivityAnalytics.dailyProductivity.length > 0 && (
          <View style={[styles.chartSection, { backgroundColor: colors.surface }]}>
            <ProductivityChart 
              data={productivityAnalytics.dailyProductivity}
              title="Daily Productivity"
            />
          </View>
        )}

        {/* Summary Stats */}
        {habitAnalytics && (
          <View style={[styles.summarySection, { backgroundColor: colors.surface }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Summary Statistics
            </Text>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.primary }]}>
                  {habitAnalytics.completionRate.toFixed(1)}%
                </Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                  Habit Completion
                </Text>
              </View>
              {moodAnalytics && (
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: colors.secondary }]}>
                    {moodAnalytics.averageMood.toFixed(1)}/5
                  </Text>
                  <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                    Average Mood
                  </Text>
                </View>
              )}
              {productivityAnalytics && (
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: colors.success }]}>
                    {productivityAnalytics.completionRate.toFixed(1)}%
                  </Text>
                  <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                    Task Completion
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}
      </ScrollView>
    </Container>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  content: {
    paddingVertical: 16,
  },
  timeRangeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
  },
  timeRangeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginHorizontal: 4,
  },
  timeRangeText: {
    fontSize: 14,
    fontWeight: '500',
  },
  chartSection: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    padding: 16,
  },
  summarySection: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
  },
});
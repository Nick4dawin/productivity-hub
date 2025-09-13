import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { VictoryChart, VictoryLine, VictoryArea, VictoryAxis, VictoryScatter } from 'victory-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '@/contexts/ThemeContext';
import { Mood } from '@/types';
import { getMoodTrendData, getMoodStats } from '@/hooks/useMood';

interface MoodHistoryProps {
  moods: Mood[];
  timeRange?: 'week' | 'month' | 'year';
  onTimeRangeChange?: (range: 'week' | 'month' | 'year') => void;
}

const { width: screenWidth } = Dimensions.get('window');
const chartWidth = screenWidth - 32;

export const MoodHistory: React.FC<MoodHistoryProps> = ({
  moods,
  timeRange = 'month',
  onTimeRangeChange,
}) => {
  const { colors } = useTheme();
  const [viewType, setViewType] = useState<'chart' | 'calendar'>('chart');

  const getDaysForRange = (range: string) => {
    switch (range) {
      case 'week': return 7;
      case 'year': return 365;
      default: return 30;
    }
  };

  const trendData = getMoodTrendData(moods, getDaysForRange(timeRange));
  const stats = getMoodStats(moods);

  // Filter out null values for chart
  const chartData = trendData
    .filter(item => item.mood !== null)
    .map((item, index) => ({
      x: index,
      y: item.mood,
      date: item.date,
    }));

  const getMoodEmoji = (value: number) => {
    if (value <= 1.5) return '😢';
    if (value <= 2.5) return '😔';
    if (value <= 3.5) return '😐';
    if (value <= 4.5) return '😊';
    return '😄';
  };

  const getMoodLabel = (value: number) => {
    if (value <= 1.5) return 'Very Sad';
    if (value <= 2.5) return 'Sad';
    if (value <= 3.5) return 'Neutral';
    if (value <= 4.5) return 'Happy';
    return 'Very Happy';
  };

  const renderTimeRangeSelector = () => (
    <View style={styles.timeRangeContainer}>
      {(['week', 'month', 'year'] as const).map((range) => (
        <TouchableOpacity
          key={range}
          style={[
            styles.timeRangeButton,
            {
              backgroundColor: timeRange === range ? colors.primary : colors.surface,
            },
          ]}
          onPress={() => onTimeRangeChange?.(range)}
        >
          <Text
            style={[
              styles.timeRangeText,
              {
                color: timeRange === range ? 'white' : colors.text,
              },
            ]}
          >
            {range.charAt(0).toUpperCase() + range.slice(1)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderViewTypeSelector = () => (
    <View style={styles.viewTypeContainer}>
      <TouchableOpacity
        style={[
          styles.viewTypeButton,
          viewType === 'chart' && { backgroundColor: colors.primary + '20' },
        ]}
        onPress={() => setViewType('chart')}
      >
        <Icon
          name="show-chart"
          size={20}
          color={viewType === 'chart' ? colors.primary : colors.textSecondary}
        />
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.viewTypeButton,
          viewType === 'calendar' && { backgroundColor: colors.primary + '20' },
        ]}
        onPress={() => setViewType('calendar')}
      >
        <Icon
          name="calendar-today"
          size={20}
          color={viewType === 'calendar' ? colors.primary : colors.textSecondary}
        />
      </TouchableOpacity>
    </View>
  );

  const renderChart = () => {
    if (chartData.length === 0) {
      return (
        <View style={styles.emptyChart}>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            No mood data available for this period
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.chartContainer}>
        <VictoryChart
          width={chartWidth}
          height={200}
          padding={{ left: 50, top: 20, right: 20, bottom: 40 }}
        >
          <VictoryAxis
            dependentAxis
            tickFormat={(t) => getMoodEmoji(t)}
            style={{
              tickLabels: { fontSize: 16, fill: colors.text },
              grid: { stroke: colors.border, strokeWidth: 0.5 },
            }}
            domain={[1, 5]}
          />
          <VictoryAxis
            style={{
              tickLabels: { fontSize: 12, fill: colors.textSecondary },
              axis: { stroke: colors.border },
            }}
            tickCount={5}
          />
          <VictoryArea
            data={chartData}
            style={{
              data: {
                fill: colors.primary + '30',
                stroke: colors.primary,
                strokeWidth: 2,
              },
            }}
            animate={{
              duration: 1000,
              onLoad: { duration: 500 },
            }}
          />
          <VictoryScatter
            data={chartData}
            size={4}
            style={{
              data: { fill: colors.primary },
            }}
          />
        </VictoryChart>
      </View>
    );
  };

  const renderCalendarView = () => {
    const weeks = [];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - getDaysForRange(timeRange));
    
    // Create calendar grid (simplified version)
    const days = [];
    for (let i = 0; i < getDaysForRange(timeRange); i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      const moodForDate = moods.find(mood => 
        new Date(mood.date).toDateString() === date.toDateString()
      );
      
      days.push({
        date,
        mood: moodForDate,
      });
    }

    return (
      <ScrollView style={styles.calendarContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.calendarGrid}>
          {days.map((day, index) => (
            <View
              key={index}
              style={[
                styles.calendarDay,
                { backgroundColor: colors.surface },
              ]}
            >
              <Text style={[styles.calendarDate, { color: colors.textSecondary }]}>
                {day.date.getDate()}
              </Text>
              {day.mood && (
                <Text style={styles.calendarMood}>
                  {getMoodEmoji(
                    day.mood.mood === 'very-sad' ? 1 :
                    day.mood.mood === 'sad' ? 2 :
                    day.mood.mood === 'neutral' ? 3 :
                    day.mood.mood === 'happy' ? 4 : 5
                  )}
                </Text>
              )}
            </View>
          ))}
        </View>
      </ScrollView>
    );
  };

  const renderStats = () => (
    <View style={[styles.statsContainer, { backgroundColor: colors.surface }]}>
      <View style={styles.statItem}>
        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
          Average Mood
        </Text>
        <View style={styles.statValue}>
          <Text style={styles.statEmoji}>
            {getMoodEmoji(stats.averageMood)}
          </Text>
          <Text style={[styles.statText, { color: colors.text }]}>
            {getMoodLabel(stats.averageMood)}
          </Text>
        </View>
      </View>
      
      <View style={styles.statItem}>
        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
          Total Entries
        </Text>
        <Text style={[styles.statNumber, { color: colors.primary }]}>
          {stats.totalEntries}
        </Text>
      </View>
      
      <View style={styles.statItem}>
        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
          Most Common
        </Text>
        <Text style={[styles.statText, { color: colors.text }]}>
          {stats.mostCommonMood ? getMoodLabel(
            stats.mostCommonMood === 'very-sad' ? 1 :
            stats.mostCommonMood === 'sad' ? 2 :
            stats.mostCommonMood === 'neutral' ? 3 :
            stats.mostCommonMood === 'happy' ? 4 : 5
          ) : 'N/A'}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {renderTimeRangeSelector()}
        {renderViewTypeSelector()}
      </View>
      
      {renderStats()}
      
      <View style={styles.visualizationContainer}>
        {viewType === 'chart' ? renderChart() : renderCalendarView()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  timeRangeContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  timeRangeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  timeRangeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  viewTypeContainer: {
    flexDirection: 'row',
    gap: 4,
  },
  viewTypeButton: {
    padding: 8,
    borderRadius: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  statValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statEmoji: {
    fontSize: 16,
  },
  statText: {
    fontSize: 14,
    fontWeight: '500',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  visualizationContainer: {
    flex: 1,
  },
  chartContainer: {
    alignItems: 'center',
  },
  emptyChart: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
  calendarContainer: {
    flex: 1,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  calendarDay: {
    width: (screenWidth - 64) / 7,
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  calendarDate: {
    fontSize: 10,
    fontWeight: '500',
  },
  calendarMood: {
    fontSize: 16,
    marginTop: 2,
  },
});
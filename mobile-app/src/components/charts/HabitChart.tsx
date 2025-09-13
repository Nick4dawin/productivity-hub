import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { VictoryChart, VictoryLine, VictoryArea, VictoryAxis, VictoryTheme } from 'victory-native';
import { useTheme } from '@/contexts/ThemeContext';
import { WeeklyProgress } from '@/types';

interface HabitChartProps {
  data: WeeklyProgress[];
  title?: string;
  height?: number;
}

const { width: screenWidth } = Dimensions.get('window');

export const HabitChart: React.FC<HabitChartProps> = ({ 
  data, 
  title = 'Habit Progress',
  height = 200 
}) => {
  const { colors } = useTheme();

  // Transform data for Victory
  const chartData = data.map((item, index) => ({
    x: index + 1,
    y: item.percentage,
    label: item.week,
  }));

  return (
    <View style={styles.container}>
      {title && (
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      )}
      <View style={[styles.chartContainer, { height }]}>
        <VictoryChart
          theme={VictoryTheme.material}
          width={screenWidth - 32}
          height={height}
          padding={{ left: 50, top: 20, right: 20, bottom: 50 }}
        >
          <VictoryAxis
            dependentAxis
            tickFormat={(t) => `${t}%`}
            style={{
              axis: { stroke: colors.border },
              tickLabels: { fill: colors.textSecondary, fontSize: 12 },
              grid: { stroke: colors.border, strokeOpacity: 0.3 },
            }}
          />
          <VictoryAxis
            tickFormat={(x) => data[x - 1]?.week || ''}
            style={{
              axis: { stroke: colors.border },
              tickLabels: { fill: colors.textSecondary, fontSize: 12 },
            }}
          />
          <VictoryArea
            data={chartData}
            style={{
              data: { 
                fill: colors.primary, 
                fillOpacity: 0.3,
                stroke: colors.primary,
                strokeWidth: 2,
              },
            }}
            animate={{
              duration: 1000,
              onLoad: { duration: 500 },
            }}
          />
          <VictoryLine
            data={chartData}
            style={{
              data: { stroke: colors.primary, strokeWidth: 3 },
            }}
            animate={{
              duration: 1000,
              onLoad: { duration: 500 },
            }}
          />
        </VictoryChart>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  chartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
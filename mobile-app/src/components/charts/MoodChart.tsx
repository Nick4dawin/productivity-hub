import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { VictoryChart, VictoryLine, VictoryScatter, VictoryAxis, VictoryTheme } from 'victory-native';
import { useTheme } from '@/contexts/ThemeContext';
import { MoodTrendData } from '@/types';

interface MoodChartProps {
  data: MoodTrendData[];
  title?: string;
  height?: number;
}

const { width: screenWidth } = Dimensions.get('window');

export const MoodChart: React.FC<MoodChartProps> = ({ 
  data, 
  title = 'Mood Trend',
  height = 200 
}) => {
  const { colors } = useTheme();

  // Transform data for Victory
  const moodData = data.map((item, index) => ({
    x: index + 1,
    y: item.mood,
    date: item.date,
  }));

  const energyData = data.map((item, index) => ({
    x: index + 1,
    y: item.energy,
    date: item.date,
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
          domain={{ y: [1, 5] }}
        >
          <VictoryAxis
            dependentAxis
            tickFormat={(t) => {
              const moodLabels = ['', 'Very Low', 'Low', 'Neutral', 'Good', 'Great'];
              return moodLabels[t] || '';
            }}
            style={{
              axis: { stroke: colors.border },
              tickLabels: { fill: colors.textSecondary, fontSize: 10 },
              grid: { stroke: colors.border, strokeOpacity: 0.3 },
            }}
          />
          <VictoryAxis
            tickFormat={(x) => {
              const item = data[x - 1];
              if (!item) return '';
              const date = new Date(item.date);
              return `${date.getMonth() + 1}/${date.getDate()}`;
            }}
            style={{
              axis: { stroke: colors.border },
              tickLabels: { fill: colors.textSecondary, fontSize: 12 },
            }}
          />
          
          {/* Mood Line */}
          <VictoryLine
            data={moodData}
            style={{
              data: { stroke: colors.primary, strokeWidth: 3 },
            }}
            animate={{
              duration: 1000,
              onLoad: { duration: 500 },
            }}
          />
          <VictoryScatter
            data={moodData}
            size={4}
            style={{
              data: { fill: colors.primary },
            }}
          />
          
          {/* Energy Line */}
          <VictoryLine
            data={energyData}
            style={{
              data: { stroke: colors.secondary, strokeWidth: 2, strokeDasharray: '5,5' },
            }}
            animate={{
              duration: 1000,
              onLoad: { duration: 500 },
            }}
          />
          <VictoryScatter
            data={energyData}
            size={3}
            style={{
              data: { fill: colors.secondary },
            }}
          />
        </VictoryChart>
      </View>
      
      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: colors.primary }]} />
          <Text style={[styles.legendText, { color: colors.textSecondary }]}>Mood</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: colors.secondary }]} />
          <Text style={[styles.legendText, { color: colors.textSecondary }]}>Energy</Text>
        </View>
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
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 12,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
  },
});
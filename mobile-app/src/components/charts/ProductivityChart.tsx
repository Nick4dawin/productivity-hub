import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { VictoryChart, VictoryBar, VictoryAxis, VictoryTheme } from 'victory-native';
import { useTheme } from '@/contexts/ThemeContext';
import { DailyProductivity } from '@/types';

interface ProductivityChartProps {
  data: DailyProductivity[];
  title?: string;
  height?: number;
}

const { width: screenWidth } = Dimensions.get('window');

export const ProductivityChart: React.FC<ProductivityChartProps> = ({ 
  data, 
  title = 'Daily Productivity',
  height = 200 
}) => {
  const { colors } = useTheme();

  // Transform data for Victory
  const chartData = data.map((item, index) => ({
    x: index + 1,
    y: item.productivity,
    label: new Date(item.date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    }),
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
          domainPadding={{ x: 20 }}
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
            tickFormat={(x) => chartData[x - 1]?.label || ''}
            style={{
              axis: { stroke: colors.border },
              tickLabels: { fill: colors.textSecondary, fontSize: 10, angle: -45 },
            }}
          />
          <VictoryBar
            data={chartData}
            style={{
              data: { 
                fill: ({ datum }) => {
                  if (datum.y >= 80) return colors.success;
                  if (datum.y >= 60) return colors.warning;
                  return colors.error;
                },
              },
            }}
            animate={{
              duration: 1000,
              onLoad: { duration: 500 },
            }}
          />
        </VictoryChart>
      </View>
      
      {/* Productivity Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: colors.success }]} />
          <Text style={[styles.legendText, { color: colors.textSecondary }]}>High (80%+)</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: colors.warning }]} />
          <Text style={[styles.legendText, { color: colors.textSecondary }]}>Medium (60-79%)</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: colors.error }]} />
          <Text style={[styles.legendText, { color: colors.textSecondary }]}>Low (&lt;60%)</Text>
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
    flexWrap: 'wrap',
    marginTop: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 8,
    marginVertical: 2,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
    fontSize: 10,
  },
});
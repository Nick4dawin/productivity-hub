import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { VictoryChart, VictoryBar, VictoryAxis, VictoryTheme } from 'victory-native';

import { useTheme } from '../../contexts/ThemeContext';
import { useGoalProgress } from '../../hooks/useGoals';
import { Goal } from '../../types';

import Card from '../common/Card';

interface GoalProgressProps {
  goals: Goal[];
}

const GoalProgress: React.FC<GoalProgressProps> = ({ goals }) => {
  const { theme } = useTheme();
  const screenWidth = Dimensions.get('window').width;

  // Prepare chart data
  const chartData = goals.map((goal) => {
    const { progress } = useGoalProgress(goal);
    return {
      goal: goal.title.length > 15 ? goal.title.substring(0, 15) + '...' : goal.title,
      progress,
      status: goal.status,
    };
  });

  const getBarColor = (status: Goal['status']) => {
    switch (status) {
      case 'Completed':
        return theme.colors.success;
      case 'In Progress':
        return theme.colors.primary;
      case 'On Hold':
        return theme.colors.warning;
      default:
        return theme.colors.textSecondary;
    }
  };

  if (goals.length === 0) {
    return null;
  }

  return (
    <Card style={styles.container}>
      <Text style={[styles.title, { color: theme.colors.text }]}>
        Goal Progress Overview
      </Text>
      
      <View style={styles.chartContainer}>
        <VictoryChart
          theme={VictoryTheme.material}
          width={screenWidth - 64}
          height={200}
          domainPadding={{ x: 20 }}
          padding={{ left: 60, top: 20, right: 20, bottom: 60 }}
        >
          <VictoryAxis
            dependentAxis
            tickFormat={(t) => `${t}%`}
            style={{
              tickLabels: { fontSize: 12, fill: theme.colors.textSecondary },
              grid: { stroke: theme.colors.border, strokeWidth: 0.5 },
            }}
          />
          <VictoryAxis
            style={{
              tickLabels: { 
                fontSize: 10, 
                fill: theme.colors.textSecondary,
                angle: -45,
              },
            }}
          />
          <VictoryBar
            data={chartData}
            x="goal"
            y="progress"
            style={{
              data: {
                fill: ({ datum }) => getBarColor(datum.status),
              },
            }}
            animate={{
              duration: 1000,
              onLoad: { duration: 500 },
            }}
          />
        </VictoryChart>
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: theme.colors.success }]} />
          <Text style={[styles.legendText, { color: theme.colors.textSecondary }]}>
            Completed
          </Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: theme.colors.primary }]} />
          <Text style={[styles.legendText, { color: theme.colors.textSecondary }]}>
            In Progress
          </Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: theme.colors.warning }]} />
          <Text style={[styles.legendText, { color: theme.colors.textSecondary }]}>
            On Hold
          </Text>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  chartContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 8,
    marginVertical: 4,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    fontWeight: '500',
  },
});

export default GoalProgress;
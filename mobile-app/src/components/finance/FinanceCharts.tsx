import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { VictoryChart, VictoryLine, VictoryArea, VictoryAxis, VictoryPie, VictoryTheme } from 'victory-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Card } from '@/components/common/Card';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { useFinanceAnalytics } from '@/hooks/useFinance';

const { width: screenWidth } = Dimensions.get('window');
const chartWidth = screenWidth - 64; // Account for padding

export const FinanceCharts: React.FC = () => {
  const { colors } = useTheme();
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month');
  const [selectedChart, setSelectedChart] = useState<'trend' | 'category'>('trend');

  const { data: analyticsData, isLoading, error } = useFinanceAnalytics(selectedPeriod);

  const periods = [
    { key: 'week', label: 'Week' },
    { key: 'month', label: 'Month' },
    { key: 'year', label: 'Year' },
  ] as const;

  const chartTypes = [
    { key: 'trend', label: 'Trend' },
    { key: 'category', label: 'Categories' },
  ] as const;

  if (isLoading) {
    return (
      <Card style={styles.card}>
        <LoadingSpinner />
      </Card>
    );
  }

  if (error || !analyticsData) {
    return (
      <Card style={styles.card}>
        <Text style={[styles.errorText, { color: colors.error }]}>
          Unable to load analytics
        </Text>
      </Card>
    );
  }

  const renderTrendChart = () => {
    if (!analyticsData.trendData || analyticsData.trendData.length === 0) {
      return (
        <Text style={[styles.noDataText, { color: colors.textSecondary }]}>
          No trend data available
        </Text>
      );
    }

    return (
      <VictoryChart
        theme={VictoryTheme.material}
        width={chartWidth}
        height={200}
        padding={{ left: 60, top: 20, right: 40, bottom: 40 }}
      >
        <VictoryAxis dependentAxis tickFormat={(t) => `$${t}`} />
        <VictoryAxis />
        
        <VictoryArea
          data={analyticsData.trendData.income}
          x="date"
          y="amount"
          style={{
            data: { fill: colors.success, fillOpacity: 0.3, stroke: colors.success, strokeWidth: 2 }
          }}
        />
        
        <VictoryArea
          data={analyticsData.trendData.expenses}
          x="date"
          y="amount"
          style={{
            data: { fill: colors.error, fillOpacity: 0.3, stroke: colors.error, strokeWidth: 2 }
          }}
        />
      </VictoryChart>
    );
  };

  const renderCategoryChart = () => {
    if (!analyticsData.categoryData || analyticsData.categoryData.length === 0) {
      return (
        <Text style={[styles.noDataText, { color: colors.textSecondary }]}>
          No category data available
        </Text>
      );
    }

    const colorScale = [
      colors.primary,
      colors.secondary,
      colors.success,
      colors.warning,
      colors.error,
      '#8884d8',
      '#82ca9d',
      '#ffc658',
    ];

    return (
      <View style={styles.pieChartContainer}>
        <VictoryPie
          data={analyticsData.categoryData}
          x="category"
          y="amount"
          width={chartWidth}
          height={200}
          colorScale={colorScale}
          labelRadius={({ innerRadius }) => innerRadius as number + 40 }
          labelComponent={<></>} // Hide labels on pie chart
        />
        
        <View style={styles.legend}>
          {analyticsData.categoryData.map((item: any, index: number) => (
            <View key={item.category} style={styles.legendItem}>
              <View
                style={[
                  styles.legendColor,
                  { backgroundColor: colorScale[index % colorScale.length] }
                ]}
              />
              <Text style={[styles.legendText, { color: colors.text }]}>
                {item.category}: ${item.amount.toFixed(0)}
              </Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  return (
    <Card style={styles.card}>
      <Text style={[styles.title, { color: colors.text }]}>Spending Analytics</Text>
      
      <View style={styles.controls}>
        <View style={styles.periodSelector}>
          {periods.map((period) => (
            <TouchableOpacity
              key={period.key}
              style={[
                styles.periodButton,
                selectedPeriod === period.key && { backgroundColor: colors.primary },
              ]}
              onPress={() => setSelectedPeriod(period.key)}
            >
              <Text
                style={[
                  styles.periodButtonText,
                  { color: selectedPeriod === period.key ? '#fff' : colors.text },
                ]}
              >
                {period.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.chartSelector}>
          {chartTypes.map((chart) => (
            <TouchableOpacity
              key={chart.key}
              style={[
                styles.chartButton,
                selectedChart === chart.key && { backgroundColor: colors.secondary },
              ]}
              onPress={() => setSelectedChart(chart.key)}
            >
              <Text
                style={[
                  styles.chartButtonText,
                  { color: selectedChart === chart.key ? '#fff' : colors.text },
                ]}
              >
                {chart.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.chartContainer}>
        {selectedChart === 'trend' ? renderTrendChart() : renderCategoryChart()}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  controls: {
    marginBottom: 16,
  },
  periodSelector: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginHorizontal: 2,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  chartSelector: {
    flexDirection: 'row',
  },
  chartButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginHorizontal: 2,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  chartButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  chartContainer: {
    alignItems: 'center',
  },
  pieChartContainer: {
    alignItems: 'center',
  },
  legend: {
    marginTop: 16,
    alignSelf: 'stretch',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: 14,
  },
  errorText: {
    textAlign: 'center',
    fontSize: 16,
  },
  noDataText: {
    textAlign: 'center',
    fontSize: 16,
    paddingVertical: 40,
  },
});
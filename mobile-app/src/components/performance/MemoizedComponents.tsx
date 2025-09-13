import React, { memo, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { VictoryChart, VictoryLine, VictoryArea, VictoryBar } from 'victory-native';

// Memoized chart component for expensive renders
interface MemoizedChartProps {
  data: Array<{ x: number | string; y: number }>;
  type: 'line' | 'area' | 'bar';
  width?: number;
  height?: number;
  color?: string;
  animate?: boolean;
}

const MemoizedChartComponent: React.FC<MemoizedChartProps> = ({
  data,
  type,
  width = 300,
  height = 200,
  color = '#007AFF',
  animate = true,
}) => {
  // Memoize chart data processing
  const processedData = useMemo(() => {
    return data.map((item, index) => ({
      ...item,
      x: typeof item.x === 'string' ? index : item.x,
    }));
  }, [data]);

  // Memoize chart component based on type
  const ChartComponent = useMemo(() => {
    const commonProps = {
      data: processedData,
      width,
      height,
      animate: animate ? { duration: 1000 } : false,
      style: { data: { fill: color, stroke: color } },
    };

    switch (type) {
      case 'line':
        return <VictoryLine {...commonProps} />;
      case 'area':
        return <VictoryArea {...commonProps} />;
      case 'bar':
        return <VictoryBar {...commonProps} />;
      default:
        return <VictoryLine {...commonProps} />;
    }
  }, [processedData, type, width, height, color, animate]);

  return (
    <View style={styles.chartContainer}>
      <VictoryChart width={width} height={height}>
        {ChartComponent}
      </VictoryChart>
    </View>
  );
};

export const MemoizedChart = memo(MemoizedChartComponent);

// Memoized list item component
interface MemoizedListItemProps {
  id: string;
  title: string;
  subtitle?: string;
  value?: string | number;
  onPress?: (id: string) => void;
  style?: ViewStyle;
  titleStyle?: TextStyle;
  subtitleStyle?: TextStyle;
  valueStyle?: TextStyle;
}

const MemoizedListItemComponent: React.FC<MemoizedListItemProps> = ({
  id,
  title,
  subtitle,
  value,
  onPress,
  style,
  titleStyle,
  subtitleStyle,
  valueStyle,
}) => {
  const handlePress = useCallback(() => {
    onPress?.(id);
  }, [id, onPress]);

  return (
    <View style={[styles.listItem, style]}>
      <View style={styles.listItemContent}>
        <Text style={[styles.listItemTitle, titleStyle]}>{title}</Text>
        {subtitle && (
          <Text style={[styles.listItemSubtitle, subtitleStyle]}>
            {subtitle}
          </Text>
        )}
      </View>
      {value && (
        <Text style={[styles.listItemValue, valueStyle]}>
          {value}
        </Text>
      )}
    </View>
  );
};

export const MemoizedListItem = memo(MemoizedListItemComponent);

// Memoized stats card component
interface MemoizedStatsCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon?: React.ReactNode;
  style?: ViewStyle;
}

const MemoizedStatsCardComponent: React.FC<MemoizedStatsCardProps> = ({
  title,
  value,
  change,
  changeType = 'neutral',
  icon,
  style,
}) => {
  // Memoize change color based on type
  const changeColor = useMemo(() => {
    switch (changeType) {
      case 'positive':
        return '#34C759';
      case 'negative':
        return '#FF3B30';
      default:
        return '#8E8E93';
    }
  }, [changeType]);

  // Memoize change text
  const changeText = useMemo(() => {
    if (change === undefined) return null;
    const prefix = change > 0 ? '+' : '';
    return `${prefix}${change}%`;
  }, [change]);

  return (
    <View style={[styles.statsCard, style]}>
      {icon && <View style={styles.statsIcon}>{icon}</View>}
      <View style={styles.statsContent}>
        <Text style={styles.statsTitle}>{title}</Text>
        <Text style={styles.statsValue}>{value}</Text>
        {changeText && (
          <Text style={[styles.statsChange, { color: changeColor }]}>
            {changeText}
          </Text>
        )}
      </View>
    </View>
  );
};

export const MemoizedStatsCard = memo(MemoizedStatsCardComponent);

// Memoized complex calculation component
interface MemoizedCalculationProps {
  data: number[];
  calculation: 'sum' | 'average' | 'max' | 'min';
  formatter?: (value: number) => string;
}

const MemoizedCalculationComponent: React.FC<MemoizedCalculationProps> = ({
  data,
  calculation,
  formatter = (value) => value.toString(),
}) => {
  // Expensive calculation memoized
  const result = useMemo(() => {
    if (data.length === 0) return 0;

    switch (calculation) {
      case 'sum':
        return data.reduce((acc, val) => acc + val, 0);
      case 'average':
        return data.reduce((acc, val) => acc + val, 0) / data.length;
      case 'max':
        return Math.max(...data);
      case 'min':
        return Math.min(...data);
      default:
        return 0;
    }
  }, [data, calculation]);

  const formattedResult = useMemo(() => {
    return formatter(result);
  }, [result, formatter]);

  return (
    <View style={styles.calculationContainer}>
      <Text style={styles.calculationResult}>{formattedResult}</Text>
    </View>
  );
};

export const MemoizedCalculation = memo(MemoizedCalculationComponent);

const styles = StyleSheet.create({
  chartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  listItemContent: {
    flex: 1,
  },
  listItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  listItemSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  listItemValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#007AFF',
  },
  statsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsIcon: {
    marginRight: 12,
  },
  statsContent: {
    flex: 1,
  },
  statsTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  statsValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  statsChange: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  calculationContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  calculationResult: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#007AFF',
  },
});
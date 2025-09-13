import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Card } from '@/components/common/Card';
import { useNetWorth } from '@/hooks/useFinance';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

export const NetWorthCard: React.FC = () => {
  const { colors } = useTheme();
  const { data: netWorthData, isLoading, error } = useNetWorth();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (isLoading) {
    return (
      <Card style={styles.card}>
        <LoadingSpinner />
      </Card>
    );
  }

  if (error || !netWorthData) {
    return (
      <Card style={styles.card}>
        <Text style={[styles.errorText, { color: colors.error }]}>
          Unable to load net worth
        </Text>
      </Card>
    );
  }

  const { netWorth, assets, liabilities } = netWorthData;

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Net Worth</Text>
      </View>
      
      <View style={styles.netWorthContainer}>
        <Text style={[styles.netWorthAmount, { color: netWorth >= 0 ? colors.success : colors.error }]}>
          {formatCurrency(netWorth)}
        </Text>
      </View>

      <View style={styles.breakdown}>
        <View style={styles.breakdownItem}>
          <Text style={[styles.breakdownLabel, { color: colors.textSecondary }]}>
            Assets
          </Text>
          <Text style={[styles.breakdownAmount, { color: colors.success }]}>
            {formatCurrency(assets)}
          </Text>
        </View>
        
        <View style={styles.breakdownItem}>
          <Text style={[styles.breakdownLabel, { color: colors.textSecondary }]}>
            Liabilities
          </Text>
          <Text style={[styles.breakdownAmount, { color: colors.error }]}>
            {formatCurrency(liabilities)}
          </Text>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  netWorthContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  netWorthAmount: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  breakdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  breakdownItem: {
    flex: 1,
    alignItems: 'center',
  },
  breakdownLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  breakdownAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    textAlign: 'center',
    fontSize: 16,
  },
});
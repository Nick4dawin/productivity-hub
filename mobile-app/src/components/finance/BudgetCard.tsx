import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Budget } from '@/types';
import { useTheme } from '@/contexts/ThemeContext';
import { Card } from '@/components/common/Card';
import { useFinanceEntries } from '@/hooks/useFinance';

interface BudgetCardProps {
  budget: Budget;
  onPress?: () => void;
}

export const BudgetCard: React.FC<BudgetCardProps> = ({ budget, onPress }) => {
  const { colors } = useTheme();
  
  // Get spending for this budget category
  const { data: entries } = useFinanceEntries({
    type: 'expense',
    category: budget.category,
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const calculateSpent = () => {
    if (!entries) return 0;
    
    const now = new Date();
    let startDate: Date;
    
    switch (budget.period) {
      case 'weekly':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
        break;
      case 'monthly':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'yearly':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    return entries
      .filter(entry => new Date(entry.date) >= startDate)
      .reduce((total, entry) => total + entry.amount, 0);
  };

  const spent = calculateSpent();
  const remaining = budget.amount - spent;
  const percentage = Math.min((spent / budget.amount) * 100, 100);
  
  const getProgressColor = () => {
    if (percentage <= 50) return colors.success;
    if (percentage <= 80) return colors.warning;
    return colors.error;
  };

  const getStatusText = () => {
    if (remaining > 0) {
      return `${formatCurrency(remaining)} remaining`;
    } else {
      return `${formatCurrency(Math.abs(remaining))} over budget`;
    }
  };

  return (
    <TouchableOpacity onPress={onPress} disabled={!onPress}>
      <Card style={styles.card}>
        <View style={styles.header}>
          <View style={styles.categoryInfo}>
            <Text style={[styles.categoryName, { color: colors.text }]}>
              {budget.category}
            </Text>
            <Text style={[styles.period, { color: colors.textSecondary }]}>
              {budget.period}
            </Text>
          </View>
          <View style={styles.amountInfo}>
            <Text style={[styles.budgetAmount, { color: colors.text }]}>
              {formatCurrency(budget.amount)}
            </Text>
          </View>
        </View>

        <View style={styles.progressSection}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  backgroundColor: getProgressColor(),
                  width: `${percentage}%`,
                },
              ]}
            />
          </View>
          
          <View style={styles.progressInfo}>
            <Text style={[styles.spentAmount, { color: colors.text }]}>
              Spent: {formatCurrency(spent)}
            </Text>
            <Text
              style={[
                styles.remainingAmount,
                { color: remaining >= 0 ? colors.success : colors.error },
              ]}
            >
              {getStatusText()}
            </Text>
          </View>
        </View>

        {budget.description && (
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            {budget.description}
          </Text>
        )}
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  period: {
    fontSize: 14,
    textTransform: 'capitalize',
  },
  amountInfo: {
    alignItems: 'flex-end',
  },
  budgetAmount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  progressSection: {
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  spentAmount: {
    fontSize: 14,
    fontWeight: '500',
  },
  remainingAmount: {
    fontSize: 14,
    fontWeight: '500',
  },
  description: {
    fontSize: 14,
    marginTop: 8,
    fontStyle: 'italic',
  },
});
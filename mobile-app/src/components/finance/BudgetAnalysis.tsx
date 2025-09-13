import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Card } from '@/components/common/Card';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { useBudgets, useFinanceEntries } from '@/hooks/useFinance';

export const BudgetAnalysis: React.FC = () => {
  const { colors } = useTheme();
  const { data: budgets, isLoading: budgetsLoading } = useBudgets();
  const { data: entries, isLoading: entriesLoading } = useFinanceEntries({ type: 'expense' });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const calculateBudgetVsActual = () => {
    if (!budgets || !entries) return [];

    return budgets.map(budget => {
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

      const spent = entries
        .filter(entry => 
          entry.category === budget.category && 
          new Date(entry.date) >= startDate
        )
        .reduce((total, entry) => total + entry.amount, 0);

      const remaining = budget.amount - spent;
      const percentage = (spent / budget.amount) * 100;

      return {
        ...budget,
        spent,
        remaining,
        percentage: Math.min(percentage, 100),
        isOverBudget: spent > budget.amount,
      };
    });
  };

  const getTotalBudgetSummary = () => {
    const analysis = calculateBudgetVsActual();
    
    const totalBudgeted = analysis.reduce((sum, item) => sum + item.amount, 0);
    const totalSpent = analysis.reduce((sum, item) => sum + item.spent, 0);
    const overBudgetCount = analysis.filter(item => item.isOverBudget).length;
    
    return {
      totalBudgeted,
      totalSpent,
      totalRemaining: totalBudgeted - totalSpent,
      overBudgetCount,
      totalBudgets: analysis.length,
    };
  };

  if (budgetsLoading || entriesLoading) {
    return (
      <Card style={styles.card}>
        <LoadingSpinner />
      </Card>
    );
  }

  if (!budgets || budgets.length === 0) {
    return (
      <Card style={styles.card}>
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
          No budgets found. Create your first budget to see analysis.
        </Text>
      </Card>
    );
  }

  const budgetAnalysis = calculateBudgetVsActual();
  const summary = getTotalBudgetSummary();

  return (
    <Card style={styles.card}>
      <Text style={[styles.title, { color: colors.text }]}>Budget vs Actual</Text>
      
      {/* Summary */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
            Total Budgeted:
          </Text>
          <Text style={[styles.summaryValue, { color: colors.text }]}>
            {formatCurrency(summary.totalBudgeted)}
          </Text>
        </View>
        
        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
            Total Spent:
          </Text>
          <Text style={[styles.summaryValue, { color: colors.text }]}>
            {formatCurrency(summary.totalSpent)}
          </Text>
        </View>
        
        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
            Remaining:
          </Text>
          <Text
            style={[
              styles.summaryValue,
              { color: summary.totalRemaining >= 0 ? colors.success : colors.error },
            ]}
          >
            {formatCurrency(summary.totalRemaining)}
          </Text>
        </View>

        {summary.overBudgetCount > 0 && (
          <View style={styles.alertContainer}>
            <Text style={[styles.alertText, { color: colors.error }]}>
              ⚠️ {summary.overBudgetCount} of {summary.totalBudgets} budgets are over limit
            </Text>
          </View>
        )}
      </View>

      {/* Individual Budget Analysis */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.budgetScroll}>
        {budgetAnalysis.map((budget) => (
          <View key={budget._id} style={[styles.budgetAnalysisCard, { borderColor: colors.border }]}>
            <Text style={[styles.budgetCategory, { color: colors.text }]}>
              {budget.category}
            </Text>
            
            <View style={styles.budgetAmounts}>
              <Text style={[styles.budgetLabel, { color: colors.textSecondary }]}>
                Budget: {formatCurrency(budget.amount)}
              </Text>
              <Text style={[styles.budgetLabel, { color: colors.textSecondary }]}>
                Spent: {formatCurrency(budget.spent)}
              </Text>
              <Text
                style={[
                  styles.budgetLabel,
                  { color: budget.isOverBudget ? colors.error : colors.success },
                ]}
              >
                {budget.isOverBudget ? 'Over' : 'Remaining'}: {formatCurrency(Math.abs(budget.remaining))}
              </Text>
            </View>

            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    backgroundColor: budget.isOverBudget ? colors.error : 
                                   budget.percentage > 80 ? colors.warning : colors.success,
                    width: `${Math.min(budget.percentage, 100)}%`,
                  },
                ]}
              />
            </View>
            
            <Text style={[styles.percentageText, { color: colors.textSecondary }]}>
              {budget.percentage.toFixed(1)}% used
            </Text>
          </View>
        ))}
      </ScrollView>
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
  summaryContainer: {
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 16,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  alertContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    borderRadius: 8,
  },
  alertText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  budgetScroll: {
    marginTop: 8,
  },
  budgetAnalysisCard: {
    width: 180,
    padding: 16,
    borderWidth: 1,
    borderRadius: 12,
    marginRight: 12,
  },
  budgetCategory: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  budgetAmounts: {
    marginBottom: 12,
  },
  budgetLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  percentageText: {
    fontSize: 12,
    textAlign: 'center',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    padding: 20,
    fontStyle: 'italic',
  },
});
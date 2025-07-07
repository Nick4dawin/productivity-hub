"use client";

import { Budget, FinanceEntry } from "@/lib/api";
import { GlassCard } from "@/components/GlassCard";
import { useCurrency } from "@/contexts/currency-context";
import { useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface BudgetOverviewProps {
  budgets: Budget[];
  finances: FinanceEntry[];
}

export function BudgetOverview({ budgets, finances }: BudgetOverviewProps) {
  const { formatAmount } = useCurrency();
  
  // Calculate spending by category for the current month
  const currentMonthSpending = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // Filter finances for current month
    const currentMonthFinances = finances.filter(finance => {
      const financeDate = new Date(finance.date);
      return (
        financeDate.getMonth() === currentMonth && 
        financeDate.getFullYear() === currentYear &&
        finance.type === 'expense'
      );
    });
    
    // Group by category and sum amounts
    const spendingByCategory: Record<string, number> = {};
    currentMonthFinances.forEach(finance => {
      const category = finance.category;
      if (!spendingByCategory[category]) {
        spendingByCategory[category] = 0;
      }
      spendingByCategory[category] += finance.amount;
    });
    
    return spendingByCategory;
  }, [finances]);
  
  // Calculate normalized budget amounts (all converted to monthly)
  const normalizedBudgets = useMemo(() => {
    return budgets.map(budget => {
      let normalizedAmount = budget.amount;
      
      // Convert to monthly equivalent
      if (budget.period === 'yearly') {
        normalizedAmount = budget.amount / 12;
      } else if (budget.period === 'weekly') {
        normalizedAmount = budget.amount * 4.33; // Average weeks in a month
      }
      
      const spent = currentMonthSpending[budget.category] || 0;
      const percentage = normalizedAmount > 0 ? Math.min(100, (spent / normalizedAmount) * 100) : 0;
      const remaining = normalizedAmount - spent;
      
      return {
        ...budget,
        normalizedAmount,
        spent,
        percentage,
        remaining
      };
    });
  }, [budgets, currentMonthSpending]);
  
  // Calculate total budget and total spent
  const totalBudget = useMemo(() => {
    return normalizedBudgets.reduce((sum, budget) => sum + budget.normalizedAmount, 0);
  }, [normalizedBudgets]);
  
  const totalSpent = useMemo(() => {
    return Object.values(currentMonthSpending).reduce((sum, amount) => sum + amount, 0);
  }, [currentMonthSpending]);
  
  // Prepare data for pie chart
  const chartData = useMemo(() => {
    return normalizedBudgets.map(budget => ({
      name: budget.category,
      value: budget.normalizedAmount,
      color: budget.color || '#36A2EB'
    }));
  }, [normalizedBudgets]);
  
  // Prepare data for spending pie chart
  const spendingChartData = useMemo(() => {
    const data: { name: string; value: number; color: string }[] = [];
    
    // Add categories with spending
    Object.entries(currentMonthSpending).forEach(([category, amount]) => {
      const budgetItem = normalizedBudgets.find(b => b.category === category);
      data.push({
        name: category,
        value: amount,
        color: budgetItem?.color || '#36A2EB'
      });
    });
    
    return data;
  }, [currentMonthSpending, normalizedBudgets]);
  
  const remainingBudget = totalBudget - totalSpent;
  const percentUsed = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
  
  return (
    <GlassCard>
      <h3 className="text-lg font-medium mb-4">Monthly Budget Overview</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="mb-4">
            <div className="flex justify-between mb-1">
              <span className="text-sm text-muted-foreground">Total Budget</span>
              <span className="font-medium">{formatAmount(totalBudget)}</span>
            </div>
            <div className="flex justify-between mb-1">
              <span className="text-sm text-muted-foreground">Total Spent</span>
              <span className={`font-medium ${totalSpent > totalBudget ? 'text-red-400' : ''}`}>
                {formatAmount(totalSpent)}
              </span>
            </div>
            <div className="flex justify-between mb-1">
              <span className="text-sm text-muted-foreground">Remaining</span>
              <span className={`font-medium ${remainingBudget < 0 ? 'text-red-400' : 'text-green-400'}`}>
                {formatAmount(Math.abs(remainingBudget))}
                {remainingBudget < 0 ? ' (Over budget)' : ''}
              </span>
            </div>
          </div>
          
          <div className="w-full bg-white/10 rounded-full h-2.5 mb-2">
            <div 
              className="h-2.5 rounded-full" 
              style={{ 
                width: `${Math.min(100, percentUsed)}%`, 
                backgroundColor: percentUsed >= 100 ? '#FF6384' : (percentUsed >= 80 ? '#FFCE56' : '#4BC0C0')
              }}
            />
          </div>
          <div className="text-center text-sm">
            {Math.round(percentUsed)}% of budget used
          </div>
          
          <div className="mt-6">
            <h4 className="text-sm font-medium mb-2">Budget Allocation</h4>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200} aspect={4/3}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatAmount(Number(value))} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No budget data available
              </div>
            )}
          </div>
        </div>
        
        <div>
          <h4 className="text-sm font-medium mb-2">Spending by Category</h4>
          {spendingChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200} aspect={4/3}>
              <PieChart>
                <Pie
                  data={spendingChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {spendingChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatAmount(Number(value))} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No spending data available for this month
            </div>
          )}
          
          <div className="mt-6">
            <h4 className="text-sm font-medium mb-2">Top Spending Categories</h4>
            <div className="space-y-2">
              {Object.entries(currentMonthSpending)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5)
                .map(([category, amount]) => {
                  const budget = normalizedBudgets.find(b => b.category === category);
                  const percentage = budget ? (amount / budget.normalizedAmount) * 100 : 0;
                  
                  return (
                    <div key={category} className="flex justify-between items-center">
                      <div className="flex items-center">
                        <div 
                          className="w-3 h-3 rounded-full mr-2" 
                          style={{ backgroundColor: budget?.color || '#36A2EB' }}
                        />
                        <span className="text-sm">{category}</span>
                      </div>
                      <div className="text-sm">
                        <span>{formatAmount(amount)}</span>
                        {budget && (
                          <span className={`ml-2 ${percentage > 100 ? 'text-red-400' : ''}`}>
                            ({Math.round(percentage)}%)
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              }
              {Object.keys(currentMonthSpending).length === 0 && (
                <div className="text-center py-4 text-muted-foreground text-sm">
                  No spending data available
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </GlassCard>
  );
} 
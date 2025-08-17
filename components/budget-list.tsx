"use client";

import { Budget, FinanceEntry }from "@/lib/api";
import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Edit, Trash } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useCurrency } from "@/contexts/currency-context";
import { useMemo } from "react";

interface BudgetListProps {
  budgets: Budget[];
  finances: FinanceEntry[];
  onEdit: (budget: Budget) => void;
  onDelete: (id: string) => void;
  onViewDetails: (budget: Budget) => void;
  isMobile: boolean;
}

export function BudgetList({ budgets, finances, onEdit, onDelete, onViewDetails, isMobile }: BudgetListProps) {
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
  
  return (
    <div className="space-y-4">
      {normalizedBudgets.length === 0 ? (
        <GlassCard className="text-center py-8">
          <p className="text-muted-foreground">No budgets found. Add your first budget to get started.</p>
        </GlassCard>
      ) : (
        normalizedBudgets.map((budget) => (
          <GlassCard 
            key={budget._id} 
            className={`overflow-hidden ${isMobile ? "cursor-pointer" : ""}`}
            onClick={() => isMobile && onViewDetails(budget)}
          >
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center">
                <div 
                  className="w-4 h-4 rounded-full mr-2" 
                  style={{ backgroundColor: budget.color || '#36A2EB' }}
                />
                <h3 className="font-medium">{budget.category}</h3>
              </div>
              <div className="flex items-center space-x-2">
                {!isMobile && (
                  <span className="text-sm text-muted-foreground">
                    {budget.period.charAt(0).toUpperCase() + budget.period.slice(1)}
                  </span>
                )}
                {!isMobile && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-white/10 border-white/10 backdrop-blur-md">
                      <DropdownMenuItem onClick={() => onEdit(budget)} className="flex items-center">
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onDelete(budget._id)} className="text-red-500 flex items-center">
                        <Trash className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
            
            <div className="mt-2">
              <div className="flex justify-between text-sm mb-1">
                <span>
                  Spent: <span className={budget.spent > budget.normalizedAmount ? 'text-red-400' : ''}>
                    {formatAmount(budget.spent)}
                  </span>
                </span>
                <span>
                  Budget: {formatAmount(budget.normalizedAmount)}
                </span>
              </div>
              
              <div className="w-full bg-white/10 rounded-full h-2.5">
                <div 
                  className="h-2.5 rounded-full" 
                  style={{ 
                    width: `${budget.percentage}%`, 
                    backgroundColor: budget.percentage >= 100 ? '#FF6384' : (budget.percentage >= 80 ? '#FFCE56' : budget.color || '#36A2EB')
                  }}
                />
              </div>
              
              <div className="flex justify-between text-sm mt-1">
                <span className={budget.remaining < 0 ? 'text-red-400' : 'text-green-400'}>
                  {budget.remaining < 0 ? 'Over by: ' : 'Remaining: '}
                  {formatAmount(Math.abs(budget.remaining))}
                </span>
                <span>{Math.round(budget.percentage)}%</span>
              </div>
              
              {budget.description && (
                <p className="text-sm text-muted-foreground mt-2">{budget.description}</p>
              )}
            </div>
          </GlassCard>
        ))
      )}
    </div>
  );
}
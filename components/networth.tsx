"use client";

import { Account } from "@/lib/api";
import { GlassCard } from "@/components/GlassCard";
import { useCurrency } from "@/contexts/currency-context";

interface NetWorthProps {
  accounts: Account[];
}

export function NetWorth({ accounts }: NetWorthProps) {
  const { formatAmount } = useCurrency();
  
  const netWorth = accounts.reduce((acc, account) => {
    if (account.type === 'Credit Card') {
      return acc - account.balance;
    }
    return acc + account.balance;
  }, 0);

  return (
    <GlassCard>
      <h3 className="text-lg font-medium">Net Worth</h3>
      <p className={`text-3xl font-bold ${netWorth >= 0 ? 'text-green-400' : 'text-red-400'}`}>
        {formatAmount(netWorth)}
      </p>
    </GlassCard>
  );
} 
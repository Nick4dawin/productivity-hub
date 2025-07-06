"use client";

import { useCurrency } from "@/contexts/currency-context";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type CurrencyType = "USD" | "EUR" | "GBP" | "INR" | "JPY" | "CAD" | "AUD";

export function CurrencySelector() {
  const { currency, setCurrency } = useCurrency();

  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm text-muted-foreground">Currency:</span>
      <Select
        value={currency}
        onValueChange={(value) => setCurrency(value as CurrencyType)}
      >
        <SelectTrigger className="w-[80px] h-8 bg-white/5 border-white/10 backdrop-blur-sm">
          <SelectValue placeholder="Select currency" />
        </SelectTrigger>
        <SelectContent className="bg-white/10 border-white/10 backdrop-blur-md">
          <SelectItem value="USD">USD</SelectItem>
          <SelectItem value="EUR">EUR</SelectItem>
          <SelectItem value="GBP">GBP</SelectItem>
          <SelectItem value="INR">INR</SelectItem>
          <SelectItem value="JPY">JPY</SelectItem>
          <SelectItem value="CAD">CAD</SelectItem>
          <SelectItem value="AUD">AUD</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
} 
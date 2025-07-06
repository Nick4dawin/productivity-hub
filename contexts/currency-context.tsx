"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from "react";

type CurrencyType = "USD" | "EUR" | "GBP" | "INR" | "JPY" | "CAD" | "AUD";

interface CurrencyContextType {
  currency: CurrencyType;
  setCurrency: (currency: CurrencyType) => void;
  formatAmount: (amount: number) => string;
  currencySymbol: string;
}

const currencySymbols: Record<CurrencyType, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  INR: "₹",
  JPY: "¥",
  CAD: "C$",
  AUD: "A$"
};

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrency] = useState<CurrencyType>("INR");
  const [currencySymbol, setCurrencySymbol] = useState<string>("₹");

  useEffect(() => {
    const savedCurrency = localStorage.getItem("currency") as CurrencyType;
    if (savedCurrency && Object.keys(currencySymbols).includes(savedCurrency)) {
      setCurrency(savedCurrency);
      setCurrencySymbol(currencySymbols[savedCurrency]);
    }
  }, []);

  const updateCurrency = (newCurrency: CurrencyType) => {
    setCurrency(newCurrency);
    setCurrencySymbol(currencySymbols[newCurrency]);
    localStorage.setItem("currency", newCurrency);
  };

  const formatAmount = (amount: number): string => {
    return `${currencySymbol}${amount.toFixed(2)}`;
  };

  return (
    <CurrencyContext.Provider value={{ 
      currency, 
      setCurrency: updateCurrency, 
      formatAmount,
      currencySymbol
    }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
} 
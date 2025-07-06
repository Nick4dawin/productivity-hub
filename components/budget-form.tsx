"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Budget } from "@/lib/api";
import { Textarea } from "@/components/ui/textarea";
import { useCurrency } from "@/contexts/currency-context";

export interface BudgetFormValues {
  category: string;
  amount: number;
  period: 'monthly' | 'yearly' | 'weekly';
  description?: string;
  color?: string;
}

interface BudgetFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: BudgetFormValues) => void;
  defaultValues?: Budget;
}

const CATEGORIES = [
  "Housing",
  "Transportation",
  "Food",
  "Utilities",
  "Insurance",
  "Healthcare",
  "Entertainment",
  "Personal",
  "Education",
  "Savings",
  "Debt",
  "Shopping",
  "Travel",
  "Other"
];

const COLORS = [
  "#FF6384", // Red
  "#36A2EB", // Blue
  "#FFCE56", // Yellow
  "#4BC0C0", // Teal
  "#9966FF", // Purple
  "#FF9F40", // Orange
  "#8AC926", // Green
  "#F15BB5", // Pink
  "#00BBF9", // Light Blue
  "#9B5DE5", // Lavender
  "#F07167", // Coral
  "#2EC4B6", // Turquoise
];

export function BudgetForm({ isOpen, onClose, onSubmit, defaultValues }: BudgetFormProps) {
  const { currencySymbol } = useCurrency();
  
  const [formData, setFormData] = useState<BudgetFormValues>(() => {
    if (defaultValues) {
      return {
        ...defaultValues,
        amount: Number(defaultValues.amount)
      };
    }
    return {
      category: "Housing",
      amount: 0,
      period: "monthly",
      description: "",
      color: COLORS[0]
    };
  });

  const handleChange = (field: keyof BudgetFormValues, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white/10 border-white/10 backdrop-blur-md max-w-md">
        <DialogHeader>
          <DialogTitle>{defaultValues ? "Edit Budget" : "Add Budget"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => handleChange("category", value)}
            >
              <SelectTrigger className="bg-white/5 border-white/10">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent className="bg-white/10 border-white/10 backdrop-blur-md">
                {CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Budget Amount</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {currencySymbol}
              </span>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => handleChange("amount", parseFloat(e.target.value))}
                placeholder="0.00"
                className="bg-white/5 border-white/10 pl-8"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="period">Period</Label>
            <Select
              value={formData.period}
              onValueChange={(value) => handleChange("period", value as 'monthly' | 'yearly' | 'weekly')}
            >
              <SelectTrigger className="bg-white/5 border-white/10">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent className="bg-white/10 border-white/10 backdrop-blur-md">
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="color">Color</Label>
            <div className="grid grid-cols-6 gap-2">
              {COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={`w-8 h-8 rounded-full ${formData.color === color ? 'ring-2 ring-white' : ''}`}
                  style={{ backgroundColor: color }}
                  onClick={() => handleChange("color", color)}
                />
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={formData.description || ""}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Additional details about this budget"
              className="bg-white/5 border-white/10"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit"
              className="bg-white/10 hover:bg-white/20 border border-white/10 backdrop-blur-sm"
            >
              {defaultValues ? "Update" : "Add"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 
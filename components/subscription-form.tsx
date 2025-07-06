"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Subscription } from "@/lib/api";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Switch } from "@/components/ui/switch";

export interface SubscriptionFormValues {
  name: string;
  amount: number;
  billingCycle: 'monthly' | 'yearly' | 'weekly' | 'quarterly';
  category: string;
  nextBillingDate: Date;
  description?: string;
  active: boolean;
}

interface SubscriptionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: SubscriptionFormValues) => void;
  defaultValues?: Subscription;
}

const CATEGORIES = [
  "Entertainment",
  "Streaming",
  "Software",
  "Utilities",
  "Health",
  "Fitness",
  "Food",
  "Shopping",
  "Other"
];

export function SubscriptionForm({ isOpen, onClose, onSubmit, defaultValues }: SubscriptionFormProps) {
  const [formData, setFormData] = useState<SubscriptionFormValues>(() => {
    if (defaultValues) {
      return {
        ...defaultValues,
        nextBillingDate: new Date(defaultValues.nextBillingDate),
        amount: Number(defaultValues.amount)
      };
    }
    return {
      name: "",
      amount: 0,
      billingCycle: "monthly",
      category: "Entertainment",
      nextBillingDate: new Date(),
      description: "",
      active: true
    };
  });

  const handleChange = (field: keyof SubscriptionFormValues, value: string | number | boolean | Date) => {
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
          <DialogTitle>{defaultValues ? "Edit Subscription" : "Add Subscription"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="Netflix, Spotify, etc."
              className="bg-white/5 border-white/10"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => handleChange("amount", parseFloat(e.target.value))}
              placeholder="0.00"
              className="bg-white/5 border-white/10"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="billingCycle">Billing Cycle</Label>
            <Select
              value={formData.billingCycle}
              onValueChange={(value) => handleChange("billingCycle", value as 'monthly' | 'yearly' | 'weekly' | 'quarterly')}
            >
              <SelectTrigger className="bg-white/5 border-white/10">
                <SelectValue placeholder="Select billing cycle" />
              </SelectTrigger>
              <SelectContent className="bg-white/10 border-white/10 backdrop-blur-md">
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
              </SelectContent>
            </Select>
          </div>

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
            <Label htmlFor="nextBillingDate">Next Billing Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal bg-white/5 border-white/10"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.nextBillingDate ? (
                    format(formData.nextBillingDate, "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-white/10 border-white/10 backdrop-blur-md">
                <Calendar
                  mode="single"
                  selected={formData.nextBillingDate}
                  onSelect={(date) => date && handleChange("nextBillingDate", date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Input
              id="description"
              value={formData.description || ""}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Additional details"
              className="bg-white/5 border-white/10"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="active"
              checked={formData.active}
              onCheckedChange={(checked: boolean) => handleChange("active", checked)}
            />
            <Label htmlFor="active">Active Subscription</Label>
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
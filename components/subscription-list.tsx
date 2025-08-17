"use client";

import { Subscription }from "@/lib/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { GlassCard } from "@/components/GlassCard";
import { useCurrency } from "@/contexts/currency-context";

interface SubscriptionListProps {
  subscriptions: Subscription[];
  onEdit: (subscription: Subscription) => void;
  onDelete: (id: string) => void;
  onViewDetails: (subscription: Subscription) => void;
  isMobile: boolean;
}

export function SubscriptionList({ subscriptions, onEdit, onDelete, onViewDetails, isMobile }: SubscriptionListProps) {
  const { formatAmount } = useCurrency();
  
  const monthlyTotal = subscriptions
    .filter(sub => sub.active)
    .reduce((total, sub) => {
      if (sub.billingCycle === 'monthly') return total + sub.amount;
      if (sub.billingCycle === 'yearly') return total + (sub.amount / 12);
      if (sub.billingCycle === 'quarterly') return total + (sub.amount / 3);
      if (sub.billingCycle === 'weekly') return total + (sub.amount * 4.33); // Average weeks in a month
      return total;
    }, 0);
  
  return (
    <GlassCard>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Subscriptions</h3>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Monthly Total</p>
          <p className="text-xl font-bold">{formatAmount(monthlyTotal)}</p>
        </div>
      </div>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            {!isMobile && <TableHead>Category</TableHead>}
            {!isMobile && <TableHead>Billing Cycle</TableHead>}
            {!isMobile && <TableHead>Next Billing</TableHead>}
            {!isMobile && <TableHead>Status</TableHead>}
            {!isMobile && <TableHead className="text-right">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {subscriptions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-4">
                No subscriptions found. Add your first subscription to get started.
              </TableCell>
            </TableRow>
          ) : (
            subscriptions.map((subscription) => (
              <TableRow key={subscription._id} onClick={() => isMobile && onViewDetails(subscription)} className={isMobile ? "cursor-pointer" : ""}>
                <TableCell>{subscription.name}</TableCell>
                <TableCell className="text-right">{formatAmount(subscription.amount)}</TableCell>
                {!isMobile && <TableCell>{subscription.category}</TableCell>}
                {!isMobile && <TableCell className="capitalize">{subscription.billingCycle}</TableCell>}
                {!isMobile && <TableCell>{format(new Date(subscription.nextBillingDate), "PPP")}</TableCell>}
                {!isMobile && (
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      subscription.active ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
                    }`}>
                      {subscription.active ? 'Active' : 'Inactive'}
                    </span>
                  </TableCell>
                )}
                {!isMobile && (
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(subscription)}>
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onDelete(subscription._id)}
                          className="text-red-500"
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </GlassCard>
  );
}
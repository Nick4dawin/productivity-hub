"use client";

import { FinanceEntry }from "@/lib/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { GlassCard } from "@/components/GlassCard";
import { useCurrency } from "@/contexts/currency-context";

interface FinanceListProps {
  finances: FinanceEntry[];
  onEdit: (entry: FinanceEntry) => void;
  onDelete: (id: string) => void;
  onViewDetails: (entry: FinanceEntry) => void;
  isMobile: boolean;
}

export function FinanceList({ finances, onEdit, onDelete, onViewDetails, isMobile }: FinanceListProps) {
  const { formatAmount } = useCurrency();
  
  return (
    <GlassCard>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Type</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            {!isMobile && <TableHead>Category</TableHead>}
            {!isMobile && <TableHead>Description</TableHead>}
            {!isMobile && <TableHead className="text-right">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {finances.map((entry) => (
            <TableRow key={entry._id} onClick={() => isMobile && onViewDetails(entry)} className={isMobile ? "cursor-pointer" : ""}>
              <TableCell>{format(new Date(entry.date), "PPP")}</TableCell>
              <TableCell>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  entry.type === 'income' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
                }`}>
                  {entry.type}
                </span>
              </TableCell>
              <TableCell className="text-right">{formatAmount(entry.amount)}</TableCell>
              {!isMobile && <TableCell>{entry.category}</TableCell>}
              {!isMobile && <TableCell>{entry.description}</TableCell>}
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
                      <DropdownMenuItem onClick={() => onEdit(entry)}>
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onDelete(entry._id)}
                        className="text-red-500"
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </GlassCard>
  );
}
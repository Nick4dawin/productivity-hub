"use client";

import { Account } from "@/lib/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { GlassCard } from "@/components/GlassCard";
import { useCurrency } from "@/contexts/currency-context";

interface AccountListProps {
  accounts: Account[];
  onEdit: (account: Account) => void;
  onDelete: (id: string) => void;
}

export function AccountList({ accounts, onEdit, onDelete }: AccountListProps) {
  const { formatAmount } = useCurrency();
  
  return (
    <GlassCard>
        <h3 className="text-lg font-medium mb-4">Accounts</h3>
        <Table>
            <TableHeader>
            <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Balance</TableHead>
                <TableHead className="text-right">Actions</TableHead>
            </TableRow>
            </TableHeader>
            <TableBody>
            {accounts.map((account) => (
                <TableRow key={account._id}>
                <TableCell>{account.name}</TableCell>
                <TableCell>{account.type}</TableCell>
                <TableCell className="text-right">{formatAmount(account.balance)}</TableCell>
                <TableCell className="text-right">
                    <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(account)}>
                        Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                        onClick={() => onDelete(account._id)}
                        className="text-red-500"
                        >
                        Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                    </DropdownMenu>
                </TableCell>
                </TableRow>
            ))}
            </TableBody>
        </Table>
    </GlassCard>
  );
} 
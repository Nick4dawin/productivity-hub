"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  getFinances, createFinance, updateFinance, deleteFinance, FinanceEntry,
  getAccounts, createAccount, updateAccount, deleteAccount, Account,
  getSubscriptions, createSubscription, updateSubscription, deleteSubscription, Subscription,
  getBudgets, createBudget, updateBudget, deleteBudget, Budget
} from "@/lib/api";
import { Button } from "@/components/ui/button";
import { FinanceForm, FinanceFormValues } from "./finance-form";
import { FinanceList } from "./finance-list";
import { AccountForm, AccountFormValues } from "./account-form";
import { AccountList } from "./account-list";
import { NetWorth } from "./networth";
import { toast } from "./ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useMediaQuery } from '@/hooks/use-media-query';
import { CurrencySelector } from "./currency-selector";
import { SubscriptionList } from "./subscription-list";
import { SubscriptionForm, SubscriptionFormValues } from "./subscription-form";
import { BudgetList } from "./budget-list";
import { BudgetForm, BudgetFormValues } from "./budget-form";
import { BudgetOverview } from "./budget-overview";

export function FinanceTracker() {
  const queryClient = useQueryClient();
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const [isFinanceFormOpen, setIsFinanceFormOpen] = useState(false);
  const [selectedFinanceEntry, setSelectedFinanceEntry] = useState<FinanceEntry | null>(null);
  const [isAccountFormOpen, setIsAccountFormOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [isSubscriptionFormOpen, setIsSubscriptionFormOpen] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const [isBudgetFormOpen, setIsBudgetFormOpen] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);

  const [isFinanceDetailsModalOpen, setIsFinanceDetailsModalOpen] = useState(false);
  const [isAccountDetailsModalOpen, setIsAccountDetailsModalOpen] = useState(false);
  const [isSubscriptionDetailsModalOpen, setIsSubscriptionDetailsModalOpen] = useState(false);
  const [isBudgetDetailsModalOpen, setIsBudgetDetailsModalOpen] = useState(false);

  const { data: finances = [], isLoading: isLoadingFinances } = useQuery<FinanceEntry[]>({
    queryKey: ['finances'],
    queryFn: getFinances,
  });

  const { data: accounts = [], isLoading: isLoadingAccounts } = useQuery<Account[]>({
    queryKey: ['accounts'],
    queryFn: getAccounts,
  });

  const { data: subscriptions = [], isLoading: isLoadingSubscriptions } = useQuery<Subscription[]>({
    queryKey: ['subscriptions'],
    queryFn: getSubscriptions,
  });

  const { data: budgets = [], isLoading: isLoadingBudgets } = useQuery<Budget[]>({
    queryKey: ['budgets'],
    queryFn: getBudgets,
  });

  // Finance Mutations
  const createFinanceMutation = useMutation({
    mutationFn: createFinance,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finances'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      toast({ title: "Success", description: "Transaction added." });
      setIsFinanceFormOpen(false);
    },
  });

  const updateFinanceMutation = useMutation({
    mutationFn: (data: Partial<FinanceEntry> & { _id: string }) => updateFinance(data._id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finances'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      toast({ title: "Success", description: "Transaction updated." });
      setIsFinanceFormOpen(false);
      setSelectedFinanceEntry(null);
    },
  });

  const deleteFinanceMutation = useMutation({
    mutationFn: deleteFinance,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finances'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      toast({ title: "Success", description: "Transaction deleted." });
    },
  });
  
  // Account Mutations
  const createAccountMutation = useMutation({
    mutationFn: createAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      toast({ title: "Success", description: "Account created." });
      setIsAccountFormOpen(false);
    },
  });

  const updateAccountMutation = useMutation({
    mutationFn: (data: Account) => updateAccount(data._id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      toast({ title: "Success", description: "Account updated." });
      setIsAccountFormOpen(false);
      setSelectedAccount(null);
    },
  });

  const deleteAccountMutation = useMutation({
    mutationFn: deleteAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['finances'] });
      toast({ title: "Success", description: "Account deleted." });
    },
  });

  // Subscription Mutations
  const createSubscriptionMutation = useMutation({
    mutationFn: createSubscription,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      toast({ title: "Success", description: "Subscription added." });
      setIsSubscriptionFormOpen(false);
    },
  });

  const updateSubscriptionMutation = useMutation({
    mutationFn: (data: Subscription) => updateSubscription(data._id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      toast({ title: "Success", description: "Subscription updated." });
      setIsSubscriptionFormOpen(false);
      setSelectedSubscription(null);
    },
  });

  const deleteSubscriptionMutation = useMutation({
    mutationFn: deleteSubscription,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      toast({ title: "Success", description: "Subscription deleted." });
    },
  });

  // Budget Mutations
  const createBudgetMutation = useMutation({
    mutationFn: createBudget,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      toast({ title: "Success", description: "Budget added." });
      setIsBudgetFormOpen(false);
    },
  });

  const updateBudgetMutation = useMutation({
    mutationFn: (data: Budget) => updateBudget(data._id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      toast({ title: "Success", description: "Budget updated." });
      setIsBudgetFormOpen(false);
      setSelectedBudget(null);
    },
  });

  const deleteBudgetMutation = useMutation({
    mutationFn: deleteBudget,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      toast({ title: "Success", description: "Budget deleted." });
    },
  });

  const handleFinanceFormSubmit = (data: FinanceFormValues) => {
    const submissionData = {
      ...data,
      date: data.date.toISOString(),
    };
    if (selectedFinanceEntry) {
      updateFinanceMutation.mutate({ ...selectedFinanceEntry, ...submissionData });
    } else {
      createFinanceMutation.mutate(submissionData);
    }
    setIsFinanceDetailsModalOpen(false);
  };
  
  const handleAccountFormSubmit = (data: AccountFormValues) => {
    if (selectedAccount) {
      updateAccountMutation.mutate({ ...selectedAccount, ...data });
    } else {
      createAccountMutation.mutate(data);
    }
    setIsAccountDetailsModalOpen(false);
  };

  const handleSubscriptionFormSubmit = (data: SubscriptionFormValues) => {
    const submissionData = {
      ...data,
      nextBillingDate: data.nextBillingDate.toISOString(),
    };
    
    if (selectedSubscription) {
      updateSubscriptionMutation.mutate({ 
        ...selectedSubscription, 
        ...submissionData 
      });
    } else {
      createSubscriptionMutation.mutate(submissionData);
    }
    setIsSubscriptionDetailsModalOpen(false);
  };

  const handleBudgetFormSubmit = (data: BudgetFormValues) => {
    if (selectedBudget) {
      updateBudgetMutation.mutate({ ...selectedBudget, ...data });
    } else {
      createBudgetMutation.mutate(data);
    }
    setIsBudgetDetailsModalOpen(false);
  };

  const handleEditFinance = (entry: FinanceEntry) => {
    setSelectedFinanceEntry(entry);
    setIsFinanceFormOpen(true);
  };

  const handleEditAccount = (account: Account) => {
    setSelectedAccount(account);
    setIsAccountFormOpen(true);
  };

  const handleEditSubscription = (subscription: Subscription) => {
    setSelectedSubscription(subscription);
    setIsSubscriptionFormOpen(true);
  };

  const handleEditBudget = (budget: Budget) => {
    setSelectedBudget(budget);
    setIsBudgetFormOpen(true);
  };

  const isLoading = isLoadingFinances || isLoadingAccounts || isLoadingSubscriptions || isLoadingBudgets;

  return (
    <div className="space-y-6">
      {/* Net Worth Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          {isLoading ? <p>Loading Net Worth...</p> : <NetWorth accounts={accounts} />}
        </div>
        <div className="flex items-center justify-end gap-2">
          <CurrencySelector />
          <Button 
                onClick={() => { setSelectedAccount(null); setIsAccountFormOpen(true); }}
                className="bg-white/10 hover:bg-white/20 border border-white/10 backdrop-blur-sm"
              >
                {isDesktop ? "Add Account" : "➕"}
              </Button>
              <Button 
                onClick={() => { setSelectedFinanceEntry(null); setIsFinanceFormOpen(true); }} 
                disabled={accounts.length === 0}
                className="bg-white/10 hover:bg-white/20 border border-white/10 backdrop-blur-sm"
              >
                {isDesktop ? "Add Transaction" : "💸"}
              </Button>
        </div>
      </div>
      
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5 bg-white/5 border border-white/10 backdrop-blur-sm">
          <TabsTrigger 
            value="overview" 
            className="data-[state=active]:bg-white/10 data-[state=active]:backdrop-blur-md"
          >
            {isDesktop ? "Overview" : "📊"}
          </TabsTrigger>
          <TabsTrigger 
            value="accounts" 
            className="data-[state=active]:bg-white/10 data-[state=active]:backdrop-blur-md"
          >
            {isDesktop ? "Accounts" : "💳"}
          </TabsTrigger>
          <TabsTrigger 
            value="transactions"
            className="data-[state=active]:bg-white/10 data-[state=active]:backdrop-blur-md"
          >
            {isDesktop ? "Transactions" : "💸"}
          </TabsTrigger>
          <TabsTrigger 
            value="subscriptions"
            className="data-[state=active]:bg-white/10 data-[state=active]:backdrop-blur-md"
          >
            {isDesktop ? "Subscriptions" : "🔄"}
          </TabsTrigger>
          <TabsTrigger 
            value="budgets"
            className="data-[state=active]:bg-white/10 data-[state=active]:backdrop-blur-md"
          >
            {isDesktop ? "Budgets" : "💰"}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="mt-4">
          {isLoading ? <p>Loading Overview...</p> : <BudgetOverview budgets={budgets} finances={finances} />}
        </TabsContent>

        <TabsContent value="accounts" className="mt-4">
          {isLoading ? <p>Loading Accounts...</p> : 
            <AccountList
              accounts={accounts}
            isLoading={isLoadingAccounts}
            onEdit={(account) => {
              setSelectedAccount(account);
              setIsAccountFormOpen(true);
            }}
            onDelete={(id) => deleteAccountMutation.mutate(id)}
            onViewDetails={(account) => {
              setSelectedAccount(account);
              setIsAccountDetailsModalOpen(true);
            }}
            isMobile={!isDesktop}
            />
          }
        </TabsContent>
        
        <TabsContent value="transactions" className="mt-4">
          {isLoading ? <p>Loading Transactions...</p> : 
            <FinanceList 
                finances={finances}
            isLoading={isLoadingFinances}
            onEdit={(entry) => {
              setSelectedFinanceEntry(entry);
              setIsFinanceFormOpen(true);
            }}
            onDelete={(id) => deleteFinanceMutation.mutate(id)}
            onViewDetails={(entry) => {
              setSelectedFinanceEntry(entry);
              setIsFinanceDetailsModalOpen(true);
            }}
            isMobile={!isDesktop}
            />
          }
        </TabsContent>

        <TabsContent value="subscriptions" className="mt-4">
          <div className="flex justify-end mb-4">
            <Button 
              onClick={() => { setSelectedSubscription(null); setIsSubscriptionFormOpen(true); }}
              className="bg-white/10 hover:bg-white/20 border border-white/10 backdrop-blur-sm"
            >
              {isDesktop ? "Add Subscription" : "➕"}
            </Button>
          </div>
          {isLoading ? <p>Loading Subscriptions...</p> : 
            <SubscriptionList 
              subscriptions={subscriptions}
            isLoading={isLoadingSubscriptions}
            onEdit={(subscription) => {
              setSelectedSubscription(subscription);
              setIsSubscriptionFormOpen(true);
            }}
            onDelete={(id) => deleteSubscriptionMutation.mutate(id)}
            onViewDetails={(subscription) => {
              setSelectedSubscription(subscription);
              setIsSubscriptionDetailsModalOpen(true);
            }}
            isMobile={!isDesktop}
            />
          }
        </TabsContent>

        <TabsContent value="budgets" className="mt-4">
          <div className="flex justify-end mb-4">
            <Button 
              onClick={() => { setSelectedBudget(null); setIsBudgetFormOpen(true); }}
              className="bg-white/10 hover:bg-white/20 border border-white/10 backdrop-blur-sm"
            >
              {isDesktop ? "Add Budget" : "➕"}
            </Button>
          </div>
          
          {isLoading ? <p>Loading Budgets...</p> : ( 
            <div className="space-y-6">
              <BudgetOverview budgets={budgets} finances={finances} />
              <BudgetList 
                budgets={budgets}
                finances={finances}
                isLoading={isLoadingBudgets}
                onEdit={(budget) => {
                  setSelectedBudget(budget);
                  setIsBudgetFormOpen(true);
                }}
                onDelete={(id) => deleteBudgetMutation.mutate(id)}
                onViewDetails={(budget) => {
                  setSelectedBudget(budget);
                  setIsBudgetDetailsModalOpen(true);
                }}
                isMobile={!isDesktop}
              />
            </div>
          )}
        </TabsContent>
      </Tabs>

      <FinanceForm
        isOpen={isFinanceFormOpen}
        onClose={() => setIsFinanceFormOpen(false)}
        onSubmit={handleFinanceFormSubmit}
        defaultValues={selectedFinanceEntry || undefined}
        accounts={accounts}
      />

      <AccountForm
        isOpen={isAccountFormOpen}
        onClose={() => setIsAccountFormOpen(false)}
        onSubmit={handleAccountFormSubmit}
        defaultValues={selectedAccount || undefined}
      />

      <SubscriptionForm
        isOpen={isSubscriptionFormOpen}
        onClose={() => setIsSubscriptionFormOpen(false)}
        onSubmit={handleSubscriptionFormSubmit}
        defaultValues={selectedSubscription || undefined}
      />

      <BudgetForm
        isOpen={isBudgetFormOpen}
        onClose={() => setIsBudgetFormOpen(false)}
        onSubmit={handleBudgetFormSubmit}
        defaultValues={selectedBudget || undefined}
      />
    </div>
  );
}
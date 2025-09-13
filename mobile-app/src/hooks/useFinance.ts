import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '@/services/ApiService';
import { Account, FinanceEntry, Budget, Subscription } from '@/types';

// Accounts
export const useAccounts = () => {
  return useQuery({
    queryKey: ['accounts'],
    queryFn: () => apiService.getAccounts(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCreateAccount = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (accountData: Omit<Account, '_id'>) => 
      apiService.createAccount(accountData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
  });
};

export const useUpdateAccount = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Account> }) =>
      apiService.updateAccount(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
  });
};

export const useDeleteAccount = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiService.deleteAccount(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
  });
};

// Finance Entries (Transactions)
export const useFinanceEntries = (filters?: {
  type?: 'income' | 'expense';
  category?: string;
  account?: string;
  startDate?: string;
  endDate?: string;
}) => {
  return useQuery({
    queryKey: ['financeEntries', filters],
    queryFn: () => apiService.getFinanceEntries(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useCreateFinanceEntry = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (entryData: Omit<FinanceEntry, '_id'>) =>
      apiService.createFinanceEntry(entryData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financeEntries'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['financeAnalytics'] });
    },
  });
};

export const useUpdateFinanceEntry = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<FinanceEntry> }) =>
      apiService.updateFinanceEntry(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financeEntries'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['financeAnalytics'] });
    },
  });
};

export const useDeleteFinanceEntry = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiService.deleteFinanceEntry(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financeEntries'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['financeAnalytics'] });
    },
  });
};

// Budgets
export const useBudgets = () => {
  return useQuery({
    queryKey: ['budgets'],
    queryFn: () => apiService.getBudgets(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCreateBudget = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (budgetData: Omit<Budget, '_id'>) =>
      apiService.createBudget(budgetData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
    },
  });
};

export const useUpdateBudget = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Budget> }) =>
      apiService.updateBudget(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
    },
  });
};

export const useDeleteBudget = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiService.deleteBudget(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
    },
  });
};

// Subscriptions
export const useSubscriptions = () => {
  return useQuery({
    queryKey: ['subscriptions'],
    queryFn: () => apiService.getSubscriptions(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCreateSubscription = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (subscriptionData: Omit<Subscription, '_id'>) =>
      apiService.createSubscription(subscriptionData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
    },
  });
};

export const useUpdateSubscription = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Subscription> }) =>
      apiService.updateSubscription(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
    },
  });
};

export const useDeleteSubscription = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiService.deleteSubscription(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
    },
  });
};

// Analytics
export const useFinanceAnalytics = (period?: 'week' | 'month' | 'year') => {
  return useQuery({
    queryKey: ['financeAnalytics', period],
    queryFn: () => apiService.getFinanceAnalytics(period),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useNetWorth = () => {
  return useQuery({
    queryKey: ['netWorth'],
    queryFn: () => apiService.getNetWorth(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
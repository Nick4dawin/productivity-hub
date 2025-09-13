import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '@/services/ApiService';
import { JournalEntry, CreateJournalData, JournalAnalysis } from '@/types';

/**
 * Hook for fetching journal entries
 */
export const useJournalEntries = () => {
  return useQuery({
    queryKey: ['journal-entries'],
    queryFn: () => apiService.getJournalEntries(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook for creating a new journal entry
 */
export const useCreateJournalEntry = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (entryData: CreateJournalData) => apiService.createJournalEntry(entryData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journal-entries'] });
    },
  });
};

/**
 * Hook for updating a journal entry
 */
export const useUpdateJournalEntry = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateJournalData> }) =>
      apiService.updateJournalEntry(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journal-entries'] });
    },
  });
};

/**
 * Hook for deleting a journal entry
 */
export const useDeleteJournalEntry = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => apiService.deleteJournalEntry(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journal-entries'] });
    },
  });
};

/**
 * Hook for analyzing a journal entry with AI
 */
export const useAnalyzeJournalEntry = () => {
  return useMutation({
    mutationFn: (id: string) => apiService.analyzeJournalEntry(id),
  });
};

/**
 * Utility function to get journal entries by category
 */
export const getEntriesByCategory = (entries: JournalEntry[], category: string): JournalEntry[] => {
  return entries.filter(entry => entry.category === category);
};

/**
 * Utility function to search journal entries
 */
export const searchJournalEntries = (entries: JournalEntry[], searchTerm: string): JournalEntry[] => {
  const term = searchTerm.toLowerCase();
  return entries.filter(entry => 
    entry.title.toLowerCase().includes(term) ||
    entry.content.toLowerCase().includes(term) ||
    entry.category.toLowerCase().includes(term)
  );
};

/**
 * Utility function to get recent journal entries
 */
export const getRecentEntries = (entries: JournalEntry[], days: number = 7): JournalEntry[] => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  
  return entries
    .filter(entry => new Date(entry.date) >= cutoffDate)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

/**
 * Utility function to get journal categories
 */
export const getJournalCategories = (entries: JournalEntry[]): string[] => {
  const categories = new Set(entries.map(entry => entry.category));
  return Array.from(categories).sort();
};
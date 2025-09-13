import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '@/services/ApiService';
import { Habit, CreateHabitData } from '@/types';
import { showToast } from '@/utils/toast';

/**
 * Hook for fetching habits
 */
export const useHabits = () => {
  return useQuery({
    queryKey: ['habits'],
    queryFn: () => apiService.getHabits(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};

/**
 * Hook for creating a new habit
 */
export const useCreateHabit = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (habitData: CreateHabitData) => apiService.createHabit(habitData),
    onSuccess: (newHabit: Habit) => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
      showToast(`Habit "${newHabit.name}" created successfully!`);
    },
    onError: (error: any) => {
      showToast(error.message || 'Failed to create habit');
    },
  });
};

/**
 * Hook for updating a habit
 */
export const useUpdateHabit = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateHabitData> }) =>
      apiService.updateHabit(id, data),
    onSuccess: (updatedHabit: Habit) => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
      showToast(`Habit "${updatedHabit.name}" updated successfully!`);
    },
    onError: (error: any) => {
      showToast(error.message || 'Failed to update habit');
    },
  });
};

/**
 * Hook for deleting a habit
 */
export const useDeleteHabit = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => apiService.deleteHabit(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
      showToast('Habit deleted successfully!');
    },
    onError: (error: any) => {
      showToast(error.message || 'Failed to delete habit');
    },
  });
};

/**
 * Hook for toggling habit completion
 */
export const useToggleHabit = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, date }: { id: string; date: string }) =>
      apiService.toggleHabitDate(id, date),
    onSuccess: (updatedHabit: Habit) => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
      // Don't show toast for toggle as it happens frequently
    },
    onError: (error: any) => {
      showToast(error.message || 'Failed to toggle habit');
    },
  });
};

/**
 * Helper function to check if habit is completed today
 */
export const isHabitCompletedToday = (habit: Habit): boolean => {
  const today = new Date().toISOString().split('T')[0];
  return habit.completedDates.includes(today);
};

/**
 * Helper function to get habit completion rate
 */
export const getHabitCompletionRate = (habit: Habit, days: number = 30): number => {
  const today = new Date();
  const startDate = new Date(today.getTime() - (days - 1) * 24 * 60 * 60 * 1000);
  
  let completedDays = 0;
  for (let i = 0; i < days; i++) {
    const checkDate = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
    const dateString = checkDate.toISOString().split('T')[0];
    if (habit.completedDates.includes(dateString)) {
      completedDays++;
    }
  }
  
  return Math.round((completedDays / days) * 100);
};

/**
 * Helper function to get current streak
 */
export const getCurrentStreak = (habit: Habit): number => {
  const today = new Date();
  let streak = 0;
  
  for (let i = 0; i < 365; i++) { // Check up to a year back
    const checkDate = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
    const dateString = checkDate.toISOString().split('T')[0];
    
    if (habit.completedDates.includes(dateString)) {
      streak++;
    } else {
      break;
    }
  }
  
  return streak;
};
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../services/ApiService';
import { Routine, CreateRoutineData } from '../types';
import { useRoutineNotifications } from './useNotifications';

/**
 * Hook for fetching routines
 */
export const useRoutines = () => {
  return useQuery({
    queryKey: ['routines'],
    queryFn: () => apiService.getRoutines(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook for creating a new routine
 */
export const useCreateRoutine = () => {
  const queryClient = useQueryClient();
  const { scheduleRoutineNotifications } = useRoutineNotifications();
  
  return useMutation({
    mutationFn: (routineData: CreateRoutineData) => apiService.createRoutine(routineData),
    onSuccess: (routine) => {
      queryClient.invalidateQueries({ queryKey: ['routines'] });
      // Schedule notifications for the new routine
      scheduleRoutineNotifications(routine);
    },
  });
};

/**
 * Hook for updating a routine
 */
export const useUpdateRoutine = () => {
  const queryClient = useQueryClient();
  const { scheduleRoutineNotifications, cancelRoutineNotifications } = useRoutineNotifications();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateRoutineData> }) =>
      apiService.updateRoutine(id, data),
    onSuccess: (routine) => {
      queryClient.invalidateQueries({ queryKey: ['routines'] });
      // Reschedule notifications for the updated routine
      cancelRoutineNotifications(routine._id);
      scheduleRoutineNotifications(routine);
    },
  });
};

/**
 * Hook for deleting a routine
 */
export const useDeleteRoutine = () => {
  const queryClient = useQueryClient();
  const { cancelRoutineNotifications } = useRoutineNotifications();
  
  return useMutation({
    mutationFn: (id: string) => apiService.deleteRoutine(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['routines'] });
      // Cancel all notifications for the deleted routine
      cancelRoutineNotifications(id);
    },
  });
};
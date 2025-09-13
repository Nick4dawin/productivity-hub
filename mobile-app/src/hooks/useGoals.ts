import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../services/ApiService';
import { Goal, CreateGoalData } from '../types';
import { useGoalNotifications } from './useNotifications';

/**
 * Hook for fetching goals
 */
export const useGoals = () => {
  return useQuery({
    queryKey: ['goals'],
    queryFn: () => apiService.getGoals(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook for creating a new goal
 */
export const useCreateGoal = () => {
  const queryClient = useQueryClient();
  const { scheduleGoalNotifications } = useGoalNotifications();
  
  return useMutation({
    mutationFn: (goalData: CreateGoalData) => apiService.createGoal(goalData),
    onSuccess: (goal) => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      // Schedule notifications for the new goal
      scheduleGoalNotifications(goal);
    },
  });
};

/**
 * Hook for updating a goal
 */
export const useUpdateGoal = () => {
  const queryClient = useQueryClient();
  const { scheduleGoalNotifications, cancelGoalNotifications } = useGoalNotifications();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateGoalData> }) =>
      apiService.updateGoal(id, data),
    onSuccess: (goal) => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      // Reschedule notifications for the updated goal
      cancelGoalNotifications(goal._id);
      if (goal.status !== 'Completed') {
        scheduleGoalNotifications(goal);
      }
    },
  });
};

/**
 * Hook for deleting a goal
 */
export const useDeleteGoal = () => {
  const queryClient = useQueryClient();
  const { cancelGoalNotifications } = useGoalNotifications();
  
  return useMutation({
    mutationFn: (id: string) => apiService.deleteGoal(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      // Cancel all notifications for the deleted goal
      cancelGoalNotifications(id);
    },
  });
};

/**
 * Hook for updating milestone completion
 */
export const useUpdateMilestone = () => {
  const queryClient = useQueryClient();
  const { notifyMilestoneAchievement } = useGoalNotifications();
  
  return useMutation({
    mutationFn: ({ goalId, milestoneId, completed }: { 
      goalId: string; 
      milestoneId: string; 
      completed: boolean 
    }) => apiService.updateMilestone(goalId, milestoneId, completed),
    onSuccess: (goal, { completed, milestoneId }) => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      
      // Notify milestone achievement if completed
      if (completed) {
        const milestone = goal.milestones.find(m => m._id === milestoneId);
        if (milestone) {
          notifyMilestoneAchievement(goal, milestone.title);
        }
      }
    },
  });
};

/**
 * Hook for calculating goal progress
 */
export const useGoalProgress = (goal: Goal) => {
  const completedMilestones = goal.milestones.filter(m => m.completed).length;
  const totalMilestones = goal.milestones.length;
  const progress = totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0;
  
  return {
    completedMilestones,
    totalMilestones,
    progress: Math.round(progress),
  };
};
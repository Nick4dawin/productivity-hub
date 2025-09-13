import { useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { notificationService } from '../services/NotificationService';
import { Goal, Routine } from '../types';

interface NotificationSettings {
  enabled: boolean;
  goals: boolean;
  routines: boolean;
  goalDeadlines: boolean;
  goalCheckIns: boolean;
  routineReminders: boolean;
  milestoneAchievements: boolean;
  morningRoutineTime: string;
  eveningRoutineTime: string;
  goalCheckInDay: number;
  goalCheckInTime: string;
}

/**
 * Hook for managing goal notifications
 */
export const useGoalNotifications = () => {
  const scheduleGoalNotifications = async (goal: Goal) => {
    try {
      const settings = await getNotificationSettings();
      if (!settings.enabled || !settings.goals) return;

      // Schedule deadline reminders if goal has time-bound information
      if (settings.goalDeadlines && goal.timeBound) {
        const deadlineMatch = goal.timeBound.match(/(\d{4}-\d{2}-\d{2})/);
        if (deadlineMatch) {
          const deadlineDate = new Date(deadlineMatch[1]);
          notificationService.scheduleGoalDeadlineReminder(goal.title, goal._id, deadlineDate, 7);
          notificationService.scheduleGoalDeadlineReminder(goal.title, goal._id, deadlineDate, 1);
        }
      }

      // Schedule weekly check-ins
      if (settings.goalCheckIns) {
        const [hour, minute] = settings.goalCheckInTime.split(':').map(Number);
        notificationService.scheduleWeeklyGoalCheckIn(
          goal.title,
          goal._id,
          settings.goalCheckInDay,
          hour
        );
      }

      // Schedule progress reminders every 3 days
      notificationService.scheduleGoalProgressReminder(goal.title, goal._id, 3);

    } catch (error) {
      console.error('Failed to schedule goal notifications:', error);
    }
  };

  const cancelGoalNotifications = (goalId: string) => {
    notificationService.cancelGoalNotifications(goalId);
  };

  const notifyMilestoneAchievement = async (goal: Goal, milestoneTitle: string) => {
    try {
      const settings = await getNotificationSettings();
      if (!settings.enabled || !settings.goals || !settings.milestoneAchievements) return;

      notificationService.scheduleGoalMilestone(goal.title, milestoneTitle, goal._id);
    } catch (error) {
      console.error('Failed to notify milestone achievement:', error);
    }
  };

  return {
    scheduleGoalNotifications,
    cancelGoalNotifications,
    notifyMilestoneAchievement,
  };
};

/**
 * Hook for managing routine notifications
 */
export const useRoutineNotifications = () => {
  const scheduleRoutineNotifications = async (routine: Routine) => {
    try {
      const settings = await getNotificationSettings();
      if (!settings.enabled || !settings.routines || !settings.routineReminders) return;

      if (routine.type === 'Morning') {
        const [hour, minute] = settings.morningRoutineTime.split(':').map(Number);
        notificationService.scheduleMorningRoutineReminder(routine.name, routine._id, hour, minute);
      } else if (routine.type === 'Evening') {
        const [hour, minute] = settings.eveningRoutineTime.split(':').map(Number);
        notificationService.scheduleEveningRoutineReminder(routine.name, routine._id, hour, minute);
      }
      // Custom routines would need user-specified times

    } catch (error) {
      console.error('Failed to schedule routine notifications:', error);
    }
  };

  const cancelRoutineNotifications = (routineId: string) => {
    notificationService.cancelRoutineNotifications(routineId);
  };

  const notifyRoutineCompletion = (routineName: string, completionTime: string, streakCount?: number) => {
    notificationService.notifyRoutineCompletion(routineName, completionTime, streakCount);
  };

  return {
    scheduleRoutineNotifications,
    cancelRoutineNotifications,
    notifyRoutineCompletion,
  };
};

/**
 * Hook for managing notification permissions and settings
 */
export const useNotificationPermissions = () => {
  useEffect(() => {
    checkAndRequestPermissions();
  }, []);

  const checkAndRequestPermissions = async () => {
    try {
      const settings = await getNotificationSettings();
      if (settings.enabled) {
        const hasPermissions = await notificationService.areNotificationsEnabled();
        if (!hasPermissions) {
          await notificationService.requestPermissions();
        }
      }
    } catch (error) {
      console.error('Failed to check notification permissions:', error);
    }
  };

  const requestPermissions = async (): Promise<boolean> => {
    try {
      return await notificationService.requestPermissions();
    } catch (error) {
      console.error('Failed to request notification permissions:', error);
      return false;
    }
  };

  const areNotificationsEnabled = async (): Promise<boolean> => {
    try {
      return await notificationService.areNotificationsEnabled();
    } catch (error) {
      console.error('Failed to check notification status:', error);
      return false;
    }
  };

  return {
    requestPermissions,
    areNotificationsEnabled,
  };
};

/**
 * Hook for bulk notification management
 */
export const useBulkNotifications = () => {
  const scheduleAllGoalNotifications = async (goals: Goal[]) => {
    const { scheduleGoalNotifications } = useGoalNotifications();
    
    for (const goal of goals) {
      if (goal.status !== 'Completed') {
        await scheduleGoalNotifications(goal);
      }
    }
  };

  const scheduleAllRoutineNotifications = async (routines: Routine[]) => {
    const { scheduleRoutineNotifications } = useRoutineNotifications();
    
    for (const routine of routines) {
      await scheduleRoutineNotifications(routine);
    }
  };

  const cancelAllNotifications = () => {
    notificationService.cancelAllNotifications();
  };

  const rescheduleAllNotifications = async (goals: Goal[], routines: Routine[]) => {
    // Cancel all existing notifications
    cancelAllNotifications();
    
    // Reschedule all notifications
    await scheduleAllGoalNotifications(goals);
    await scheduleAllRoutineNotifications(routines);
  };

  return {
    scheduleAllGoalNotifications,
    scheduleAllRoutineNotifications,
    cancelAllNotifications,
    rescheduleAllNotifications,
  };
};

/**
 * Helper function to get notification settings
 */
const getNotificationSettings = async (): Promise<NotificationSettings> => {
  try {
    const stored = await AsyncStorage.getItem('notificationSettings');
    const defaultSettings: NotificationSettings = {
      enabled: true,
      goals: true,
      routines: true,
      goalDeadlines: true,
      goalCheckIns: true,
      routineReminders: true,
      milestoneAchievements: true,
      morningRoutineTime: '07:00',
      eveningRoutineTime: '21:00',
      goalCheckInDay: 0,
      goalCheckInTime: '19:00',
    };

    return stored ? { ...defaultSettings, ...JSON.parse(stored) } : defaultSettings;
  } catch (error) {
    console.error('Failed to get notification settings:', error);
    return {
      enabled: false,
      goals: false,
      routines: false,
      goalDeadlines: false,
      goalCheckIns: false,
      routineReminders: false,
      milestoneAchievements: false,
      morningRoutineTime: '07:00',
      eveningRoutineTime: '21:00',
      goalCheckInDay: 0,
      goalCheckInTime: '19:00',
    };
  }
};

/**
 * Hook for handling notification actions
 */
export const useNotificationActions = () => {
  const handleNotificationPress = (notification: any) => {
    const { userInfo } = notification;
    
    // This would typically use navigation to go to the appropriate screen
    switch (userInfo?.type) {
      case 'goal-milestone':
      case 'goal-deadline':
      case 'goal-checkin':
      case 'goal-progress':
        // Navigate to goal detail screen
        console.log('Navigate to goal:', userInfo.goalId);
        break;
      case 'routine-reminder':
        // Navigate to routine execution screen
        console.log('Navigate to routine:', userInfo.routineId);
        break;
      case 'routine-completion':
        // Show completion celebration or navigate to routines
        console.log('Show routine completion:', userInfo);
        break;
      default:
        console.log('Unknown notification type:', userInfo?.type);
    }
  };

  const handleNotificationAction = (action: string, notification: any) => {
    notificationService.handleNotificationAction(action, notification);
  };

  return {
    handleNotificationPress,
    handleNotificationAction,
  };
};
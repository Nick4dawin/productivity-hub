import PushNotification, { Importance } from 'react-native-push-notification';
import { Platform } from 'react-native';
import { Todo } from '@/types';

/**
 * Service for managing push notifications
 */
export class NotificationService {
  private static instance: NotificationService;

  private constructor() {
    this.configure();
  }

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  /**
   * Configure push notifications
   */
  private configure(): void {
    PushNotification.configure({
      onRegister: (token) => {
        console.log('Push notification token:', token);
      },
      onNotification: (notification) => {
        console.log('Notification received:', notification);
      },
      onAction: (notification) => {
        console.log('Notification action:', notification.action);
      },
      onRegistrationError: (err) => {
        console.error('Push notification registration error:', err);
      },
      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },
      popInitialNotification: true,
      requestPermissions: Platform.OS === 'ios',
    });

    // Create notification channels for Android
    if (Platform.OS === 'android') {
      PushNotification.createChannel(
        {
          channelId: 'todo-reminders',
          channelName: 'Todo Reminders',
          channelDescription: 'Notifications for todo due dates and reminders',
          importance: Importance.HIGH,
          vibrate: true,
        },
        (created) => console.log(`Todo reminders channel created: ${created}`)
      );

      PushNotification.createChannel(
        {
          channelId: 'habit-reminders',
          channelName: 'Habit Reminders',
          channelDescription: 'Notifications for habit tracking reminders',
          importance: Importance.DEFAULT,
          vibrate: true,
        },
        (created) => console.log(`Habit reminders channel created: ${created}`)
      );

      PushNotification.createChannel(
        {
          channelId: 'goal-milestones',
          channelName: 'Goal Milestones',
          channelDescription: 'Notifications for goal achievements and milestones',
          importance: Importance.HIGH,
          vibrate: true,
        },
        (created) => console.log(`Goal milestones channel created: ${created}`)
      );

      PushNotification.createChannel(
        {
          channelId: 'goal-reminders',
          channelName: 'Goal Reminders',
          channelDescription: 'Notifications for goal deadlines and check-ins',
          importance: Importance.DEFAULT,
          vibrate: true,
        },
        (created) => console.log(`Goal reminders channel created: ${created}`)
      );

      PushNotification.createChannel(
        {
          channelId: 'routine-reminders',
          channelName: 'Routine Reminders',
          channelDescription: 'Notifications for routine start times and reminders',
          importance: Importance.DEFAULT,
          vibrate: true,
        },
        (created) => console.log(`Routine reminders channel created: ${created}`)
      );
    }
  }

  /**
   * Request notification permissions
   */
  async requestPermissions(): Promise<boolean> {
    return new Promise((resolve) => {
      PushNotification.requestPermissions((permissions) => {
        resolve(permissions.alert && permissions.badge && permissions.sound);
      });
    });
  }

  /**
   * Schedule a notification for a todo due date
   */
  scheduleTodoReminder(todo: Todo, reminderTime?: Date): void {
    if (!todo.dueDate) return;

    const dueDate = new Date(todo.dueDate);
    const now = new Date();

    // Don't schedule notifications for past due dates
    if (dueDate <= now) return;

    // Default reminder time is 1 hour before due date
    const notificationTime = reminderTime || new Date(dueDate.getTime() - 60 * 60 * 1000);

    // Don't schedule if notification time is in the past
    if (notificationTime <= now) return;

    const notificationId = this.generateNotificationId('todo', todo._id);

    PushNotification.localNotificationSchedule({
      id: notificationId,
      channelId: 'todo-reminders',
      title: 'Todo Reminder',
      message: `Don't forget: ${todo.title}`,
      date: notificationTime,
      allowWhileIdle: true,
      priority: todo.priority === 'high' ? 'high' : 'default',
      vibrate: true,
      vibration: 300,
      playSound: true,
      soundName: 'default',
      actions: ['Complete', 'Snooze'],
      userInfo: {
        type: 'todo-reminder',
        todoId: todo._id,
        priority: todo.priority,
      },
    });

    console.log(`Scheduled todo reminder for ${todo.title} at ${notificationTime}`);
  }

  /**
   * Schedule a notification for overdue todos
   */
  scheduleOverdueReminder(todos: Todo[]): void {
    if (todos.length === 0) return;

    const notificationId = this.generateNotificationId('overdue', 'batch');
    const message = todos.length === 1 
      ? `You have 1 overdue task: ${todos[0].title}`
      : `You have ${todos.length} overdue tasks`;

    PushNotification.localNotification({
      id: notificationId,
      channelId: 'todo-reminders',
      title: 'Overdue Tasks',
      message,
      priority: 'high',
      vibrate: true,
      vibration: 500,
      playSound: true,
      soundName: 'default',
      actions: ['View Tasks'],
      userInfo: {
        type: 'overdue-reminder',
        todoIds: todos.map(t => t._id),
      },
    });
  }

  /**
   * Schedule daily habit reminders
   */
  scheduleHabitReminder(habitName: string, habitId: string, time: Date): void {
    const notificationId = this.generateNotificationId('habit', habitId);

    PushNotification.localNotificationSchedule({
      id: notificationId,
      channelId: 'habit-reminders',
      title: 'Habit Reminder',
      message: `Time for your habit: ${habitName}`,
      date: time,
      repeatType: 'day',
      allowWhileIdle: true,
      priority: 'default',
      vibrate: true,
      vibration: 200,
      playSound: true,
      soundName: 'default',
      actions: ['Mark Complete', 'Skip Today'],
      userInfo: {
        type: 'habit-reminder',
        habitId,
        habitName,
      },
    });

    console.log(`Scheduled daily habit reminder for ${habitName} at ${time}`);
  }

  /**
   * Schedule goal milestone notifications
   */
  scheduleGoalMilestone(goalTitle: string, milestoneTitle: string, goalId: string): void {
    const notificationId = this.generateNotificationId('goal-milestone', goalId);

    PushNotification.localNotification({
      id: notificationId,
      channelId: 'goal-milestones',
      title: 'Goal Milestone Achieved! 🎉',
      message: `${milestoneTitle} in "${goalTitle}"`,
      priority: 'high',
      vibrate: true,
      vibration: [200, 100, 200],
      playSound: true,
      soundName: 'default',
      actions: ['View Goal', 'Share Achievement'],
      userInfo: {
        type: 'goal-milestone',
        goalId,
        goalTitle,
        milestoneTitle,
      },
    });
  }

  /**
   * Schedule goal deadline reminder
   */
  scheduleGoalDeadlineReminder(goalTitle: string, goalId: string, deadlineDate: Date, reminderDays: number = 7): void {
    const reminderTime = new Date(deadlineDate.getTime() - (reminderDays * 24 * 60 * 60 * 1000));
    const now = new Date();

    // Don't schedule if reminder time is in the past
    if (reminderTime <= now) return;

    const notificationId = this.generateNotificationId('goal-deadline', goalId);

    PushNotification.localNotificationSchedule({
      id: notificationId,
      channelId: 'goal-reminders',
      title: 'Goal Deadline Approaching',
      message: `"${goalTitle}" deadline is in ${reminderDays} days`,
      date: reminderTime,
      allowWhileIdle: true,
      priority: 'default',
      vibrate: true,
      vibration: 300,
      playSound: true,
      soundName: 'default',
      actions: ['View Goal', 'Update Progress'],
      userInfo: {
        type: 'goal-deadline',
        goalId,
        goalTitle,
        deadlineDate: deadlineDate.toISOString(),
      },
    });

    console.log(`Scheduled goal deadline reminder for "${goalTitle}" at ${reminderTime}`);
  }

  /**
   * Schedule weekly goal check-in reminder
   */
  scheduleWeeklyGoalCheckIn(goalTitle: string, goalId: string, dayOfWeek: number = 0, hour: number = 19): void {
    const now = new Date();
    const nextCheckIn = new Date();
    
    // Calculate next occurrence of the specified day and time
    const daysUntilTarget = (dayOfWeek + 7 - now.getDay()) % 7;
    nextCheckIn.setDate(now.getDate() + (daysUntilTarget === 0 ? 7 : daysUntilTarget));
    nextCheckIn.setHours(hour, 0, 0, 0);

    const notificationId = this.generateNotificationId('goal-checkin', goalId);

    PushNotification.localNotificationSchedule({
      id: notificationId,
      channelId: 'goal-reminders',
      title: 'Weekly Goal Check-in',
      message: `How's your progress on "${goalTitle}"?`,
      date: nextCheckIn,
      repeatType: 'week',
      allowWhileIdle: true,
      priority: 'default',
      vibrate: true,
      vibration: 200,
      playSound: true,
      soundName: 'default',
      actions: ['Update Progress', 'View Goal'],
      userInfo: {
        type: 'goal-checkin',
        goalId,
        goalTitle,
      },
    });

    console.log(`Scheduled weekly goal check-in for "${goalTitle}" on ${nextCheckIn}`);
  }

  /**
   * Schedule routine start reminder
   */
  scheduleRoutineReminder(routineName: string, routineId: string, time: Date, repeatType?: 'day' | 'week'): void {
    const notificationId = this.generateNotificationId('routine-start', routineId);

    PushNotification.localNotificationSchedule({
      id: notificationId,
      channelId: 'routine-reminders',
      title: 'Routine Reminder',
      message: `Time to start your "${routineName}" routine`,
      date: time,
      repeatType: repeatType || 'day',
      allowWhileIdle: true,
      priority: 'default',
      vibrate: true,
      vibration: 300,
      playSound: true,
      soundName: 'default',
      actions: ['Start Routine', 'Skip Today'],
      userInfo: {
        type: 'routine-reminder',
        routineId,
        routineName,
      },
    });

    console.log(`Scheduled routine reminder for "${routineName}" at ${time}`);
  }

  /**
   * Schedule morning routine reminder
   */
  scheduleMorningRoutineReminder(routineName: string, routineId: string, hour: number = 7, minute: number = 0): void {
    const now = new Date();
    const reminderTime = new Date();
    reminderTime.setHours(hour, minute, 0, 0);

    // If time has passed today, schedule for tomorrow
    if (reminderTime <= now) {
      reminderTime.setDate(reminderTime.getDate() + 1);
    }

    this.scheduleRoutineReminder(routineName, routineId, reminderTime, 'day');
  }

  /**
   * Schedule evening routine reminder
   */
  scheduleEveningRoutineReminder(routineName: string, routineId: string, hour: number = 21, minute: number = 0): void {
    const now = new Date();
    const reminderTime = new Date();
    reminderTime.setHours(hour, minute, 0, 0);

    // If time has passed today, schedule for tomorrow
    if (reminderTime <= now) {
      reminderTime.setDate(reminderTime.getDate() + 1);
    }

    this.scheduleRoutineReminder(routineName, routineId, reminderTime, 'day');
  }

  /**
   * Notify routine completion
   */
  notifyRoutineCompletion(routineName: string, completionTime: string, streakCount?: number): void {
    const message = streakCount 
      ? `Great job! You completed "${routineName}" in ${completionTime}. ${streakCount} day streak! 🔥`
      : `Great job! You completed "${routineName}" in ${completionTime}`;

    PushNotification.localNotification({
      channelId: 'routine-reminders',
      title: 'Routine Completed! 🎉',
      message,
      priority: 'default',
      vibrate: true,
      vibration: [100, 50, 100],
      playSound: true,
      soundName: 'default',
      actions: ['Share Achievement'],
      userInfo: {
        type: 'routine-completion',
        routineName,
        completionTime,
        streakCount,
      },
    });
  }

  /**
   * Schedule goal progress reminder
   */
  scheduleGoalProgressReminder(goalTitle: string, goalId: string, intervalDays: number = 3): void {
    const reminderTime = new Date();
    reminderTime.setDate(reminderTime.getDate() + intervalDays);
    reminderTime.setHours(18, 0, 0, 0); // 6 PM

    const notificationId = this.generateNotificationId('goal-progress', goalId);

    PushNotification.localNotificationSchedule({
      id: notificationId,
      channelId: 'goal-reminders',
      title: 'Goal Progress Check',
      message: `Don't forget to update your progress on "${goalTitle}"`,
      date: reminderTime,
      allowWhileIdle: true,
      priority: 'default',
      vibrate: true,
      vibration: 200,
      playSound: true,
      soundName: 'default',
      actions: ['Update Progress', 'View Goal'],
      userInfo: {
        type: 'goal-progress',
        goalId,
        goalTitle,
      },
    });

    console.log(`Scheduled goal progress reminder for "${goalTitle}" in ${intervalDays} days`);
  }

  /**
   * Cancel goal-related notifications
   */
  cancelGoalNotifications(goalId: string): void {
    this.cancelNotification('goal-milestone', goalId);
    this.cancelNotification('goal-deadline', goalId);
    this.cancelNotification('goal-checkin', goalId);
    this.cancelNotification('goal-progress', goalId);
    console.log(`Cancelled all notifications for goal: ${goalId}`);
  }

  /**
   * Cancel routine-related notifications
   */
  cancelRoutineNotifications(routineId: string): void {
    this.cancelNotification('routine-start', routineId);
    console.log(`Cancelled all notifications for routine: ${routineId}`);
  }

  /**
   * Cancel a specific notification
   */
  cancelNotification(type: string, id: string): void {
    const notificationId = this.generateNotificationId(type, id);
    PushNotification.cancelLocalNotification(notificationId);
    console.log(`Cancelled notification: ${type}-${id}`);
  }

  /**
   * Cancel all notifications of a specific type
   */
  cancelNotificationsByType(type: string): void {
    // Note: React Native Push Notification doesn't have a direct way to cancel by type
    // This would require keeping track of notification IDs in AsyncStorage
    console.log(`Cancelling all notifications of type: ${type}`);
  }

  /**
   * Cancel all notifications
   */
  cancelAllNotifications(): void {
    PushNotification.cancelAllLocalNotifications();
    console.log('Cancelled all notifications');
  }

  /**
   * Get scheduled notifications (Android only)
   */
  getScheduledNotifications(): Promise<any[]> {
    return new Promise((resolve) => {
      PushNotification.getScheduledLocalNotifications((notifications) => {
        resolve(notifications);
      });
    });
  }

  /**
   * Generate a unique notification ID
   */
  private generateNotificationId(type: string, id: string): string {
    return `${type}-${id}`.replace(/[^a-zA-Z0-9-]/g, '');
  }

  /**
   * Check if notifications are enabled
   */
  async areNotificationsEnabled(): Promise<boolean> {
    return new Promise((resolve) => {
      PushNotification.checkPermissions((permissions) => {
        resolve(permissions.alert && permissions.badge && permissions.sound);
      });
    });
  }

  /**
   * Show immediate notification
   */
  showNotification(title: string, message: string, data?: any): void {
    PushNotification.localNotification({
      title,
      message,
      priority: 'default',
      vibrate: true,
      playSound: true,
      soundName: 'default',
      userInfo: data,
    });
  }

  /**
   * Schedule daily productivity summary
   */
  scheduleDailyProductivitySummary(time: Date): void {
    const notificationId = this.generateNotificationId('summary', 'daily');

    PushNotification.localNotificationSchedule({
      id: notificationId,
      channelId: 'todo-reminders',
      title: 'Daily Productivity Summary',
      message: 'Check your progress and plan for tomorrow',
      date: time,
      repeatType: 'day',
      allowWhileIdle: true,
      priority: 'default',
      vibrate: true,
      playSound: true,
      soundName: 'default',
      actions: ['View Summary'],
      userInfo: {
        type: 'daily-summary',
      },
    });
  }

  /**
   * Handle notification actions
   */
  handleNotificationAction(action: string, notification: any): void {
    const { userInfo } = notification;
    
    switch (action) {
      case 'Complete':
        if (userInfo?.type === 'todo-reminder') {
          // Handle todo completion
          console.log('Complete todo:', userInfo.todoId);
        }
        break;
      case 'Snooze':
        if (userInfo?.type === 'todo-reminder') {
          // Reschedule notification for 15 minutes later
          const snoozeTime = new Date(Date.now() + 15 * 60 * 1000);
          // Would need to reschedule the notification
        }
        break;
      case 'Mark Complete':
        if (userInfo?.type === 'habit-reminder') {
          // Handle habit completion
          console.log('Complete habit:', userInfo.habitId);
        }
        break;
      case 'View Goal':
        if (userInfo?.type?.includes('goal')) {
          // Navigate to goal detail screen
          console.log('Navigate to goal:', userInfo.goalId);
        }
        break;
      case 'Update Progress':
        if (userInfo?.type?.includes('goal')) {
          // Navigate to goal progress update
          console.log('Update goal progress:', userInfo.goalId);
        }
        break;
      case 'Start Routine':
        if (userInfo?.type === 'routine-reminder') {
          // Navigate to routine execution screen
          console.log('Start routine:', userInfo.routineId);
        }
        break;
      case 'Skip Today':
        if (userInfo?.type === 'routine-reminder') {
          // Mark routine as skipped for today
          console.log('Skip routine today:', userInfo.routineId);
        }
        break;
      case 'Share Achievement':
        if (userInfo?.type === 'goal-milestone' || userInfo?.type === 'routine-completion') {
          // Open share dialog
          console.log('Share achievement:', userInfo);
        }
        break;
      case 'View Summary':
        if (userInfo?.type === 'daily-summary') {
          // Navigate to dashboard/analytics
          console.log('View daily summary');
        }
        break;
      case 'View Tasks':
        if (userInfo?.type === 'overdue-reminder') {
          // Navigate to todos screen
          console.log('View overdue tasks:', userInfo.todoIds);
        }
        break;
      default:
        console.log('Unknown notification action:', action);
    }
  }
}

// Export singleton instance
export const notificationService = NotificationService.getInstance();
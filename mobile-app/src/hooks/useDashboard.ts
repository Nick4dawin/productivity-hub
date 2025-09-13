import { useState, useEffect, useCallback } from 'react';
import { apiService } from '@/services/ApiService';
import { Habit, Todo, JournalEntry, Mood } from '@/types';

interface DashboardStats {
  habitsCompleted: number;
  totalHabits: number;
  todosCompleted: number;
  totalTodos: number;
  currentStreak: number;
  journalEntries: number;
}

interface ActivityItem {
  id: string;
  type: 'habit' | 'todo' | 'journal' | 'mood';
  title: string;
  description: string;
  timestamp: string;
  icon: string;
}

interface DashboardData {
  stats: DashboardStats;
  recentActivity: ActivityItem[];
  upcomingTasks: Todo[];
  isLoading: boolean;
  error: string | null;
}

export const useDashboard = () => {
  const [data, setData] = useState<DashboardData>({
    stats: {
      habitsCompleted: 0,
      totalHabits: 0,
      todosCompleted: 0,
      totalTodos: 0,
      currentStreak: 0,
      journalEntries: 0,
    },
    recentActivity: [],
    upcomingTasks: [],
    isLoading: true,
    error: null,
  });

  const calculateHabitStats = (habits: Habit[]) => {
    const today = new Date().toISOString().split('T')[0];
    const completedToday = habits.filter(habit => 
      habit.completedDates.includes(today)
    ).length;
    
    // Calculate current streak (simplified - using max streak from habits)
    const maxStreak = Math.max(...habits.map(h => h.streak), 0);
    
    return {
      habitsCompleted: completedToday,
      totalHabits: habits.length,
      currentStreak: maxStreak,
    };
  };

  const calculateTodoStats = (todos: Todo[]) => {
    const completed = todos.filter(todo => todo.completed).length;
    return {
      todosCompleted: completed,
      totalTodos: todos.length,
    };
  };

  const generateRecentActivity = (
    habits: Habit[], 
    todos: Todo[], 
    journalEntries: JournalEntry[], 
    moods: Mood[]
  ): ActivityItem[] => {
    const activities: ActivityItem[] = [];
    const today = new Date().toISOString().split('T')[0];

    // Recent habit completions
    habits.forEach(habit => {
      if (habit.completedDates.includes(today)) {
        activities.push({
          id: `habit-${habit._id}`,
          type: 'habit',
          title: 'Habit Completed',
          description: habit.name,
          timestamp: new Date().toISOString(),
          icon: '✅',
        });
      }
    });

    // Recent todo completions
    todos.filter(todo => todo.completed).slice(0, 3).forEach(todo => {
      activities.push({
        id: `todo-${todo._id}`,
        type: 'todo',
        title: 'Task Completed',
        description: todo.title,
        timestamp: new Date().toISOString(),
        icon: '✓',
      });
    });

    // Recent journal entries
    journalEntries.slice(0, 2).forEach(entry => {
      activities.push({
        id: `journal-${entry._id}`,
        type: 'journal',
        title: 'Journal Entry',
        description: entry.title,
        timestamp: entry.date,
        icon: '📝',
      });
    });

    // Recent mood entries
    moods.slice(0, 2).forEach(mood => {
      activities.push({
        id: `mood-${mood._id}`,
        type: 'mood',
        title: 'Mood Logged',
        description: `Feeling ${mood.mood}`,
        timestamp: mood.date,
        icon: '😊',
      });
    });

    // Sort by timestamp and return latest 8
    return activities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 8);
  };

  const getUpcomingTasks = (todos: Todo[]): Todo[] => {
    const now = new Date();
    return todos
      .filter(todo => !todo.completed)
      .filter(todo => {
        if (!todo.dueDate) return true;
        return new Date(todo.dueDate) >= now;
      })
      .sort((a, b) => {
        // Sort by priority first, then by due date
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
        if (priorityDiff !== 0) return priorityDiff;
        
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      })
      .slice(0, 5);
  };

  const fetchDashboardData = useCallback(async () => {
    try {
      setData(prev => ({ ...prev, isLoading: true, error: null }));

      const [habits, todos, journalEntries, moods] = await Promise.all([
        apiService.getHabits().catch(() => []),
        apiService.getTodos().catch(() => []),
        apiService.getJournalEntries().catch(() => []),
        apiService.getMoods().catch(() => []),
      ]);

      const habitStats = calculateHabitStats(habits);
      const todoStats = calculateTodoStats(todos);
      const recentActivity = generateRecentActivity(habits, todos, journalEntries, moods);
      const upcomingTasks = getUpcomingTasks(todos);

      setData({
        stats: {
          ...habitStats,
          ...todoStats,
          journalEntries: journalEntries.length,
        },
        recentActivity,
        upcomingTasks,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setData(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load dashboard data',
      }));
    }
  }, []);

  const refreshData = useCallback(() => {
    return fetchDashboardData();
  }, [fetchDashboardData]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return {
    ...data,
    refreshData,
  };
};
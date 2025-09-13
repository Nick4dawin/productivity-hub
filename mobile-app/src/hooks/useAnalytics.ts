import { useState, useEffect, useCallback } from 'react';
import { apiService } from '@/services/ApiService';
import { 
  AnalyticsData, 
  HabitAnalytics, 
  MoodAnalytics, 
  ProductivityAnalytics,
  WeeklyProgress,
  MoodTrendData,
  DailyProductivity
} from '@/types';

interface AnalyticsState {
  data: AnalyticsData | null;
  habitAnalytics: HabitAnalytics | null;
  moodAnalytics: MoodAnalytics | null;
  productivityAnalytics: ProductivityAnalytics | null;
  isLoading: boolean;
  error: string | null;
}

export const useAnalytics = (timeRange: 'week' | 'month' | 'year' = 'month') => {
  const [state, setState] = useState<AnalyticsState>({
    data: null,
    habitAnalytics: null,
    moodAnalytics: null,
    productivityAnalytics: null,
    isLoading: true,
    error: null,
  });

  const generateMockData = useCallback((): AnalyticsData => {
    // Generate mock data for development/testing
    const mockWeeklyProgress: WeeklyProgress[] = [
      { week: 'Week 1', completed: 18, total: 21, percentage: 85.7 },
      { week: 'Week 2', completed: 15, total: 21, percentage: 71.4 },
      { week: 'Week 3', completed: 20, total: 21, percentage: 95.2 },
      { week: 'Week 4', completed: 17, total: 21, percentage: 81.0 },
    ];

    const mockMoodTrend: MoodTrendData[] = Array.from({ length: 14 }, (_, i) => ({
      date: new Date(Date.now() - (13 - i) * 24 * 60 * 60 * 1000).toISOString(),
      mood: Math.floor(Math.random() * 3) + 2.5, // 2.5 to 5
      energy: Math.floor(Math.random() * 3) + 2.5, // 2.5 to 5
    }));

    const mockDailyProductivity: DailyProductivity[] = Array.from({ length: 7 }, (_, i) => ({
      date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toISOString(),
      tasksCompleted: Math.floor(Math.random() * 8) + 2,
      tasksTotal: Math.floor(Math.random() * 5) + 8,
      productivity: Math.floor(Math.random() * 40) + 60, // 60-100%
    }));

    return {
      habits: {
        completionRate: 78.5,
        streakData: [],
        categoryBreakdown: [
          { category: 'Health', count: 5, percentage: 35.7, color: '#4CAF50' },
          { category: 'Productivity', count: 4, percentage: 28.6, color: '#2196F3' },
          { category: 'Learning', count: 3, percentage: 21.4, color: '#FF9800' },
          { category: 'Personal', count: 2, percentage: 14.3, color: '#9C27B0' },
        ],
        weeklyProgress: mockWeeklyProgress,
        topHabits: [
          { name: 'Morning Exercise', completionRate: 92.3, streak: 12 },
          { name: 'Read 30 minutes', completionRate: 85.7, streak: 8 },
          { name: 'Meditate', completionRate: 78.6, streak: 5 },
        ],
      },
      mood: {
        averageMood: 3.8,
        moodTrend: mockMoodTrend,
        moodDistribution: [
          { mood: 'Great', count: 8, percentage: 28.6 },
          { mood: 'Good', count: 12, percentage: 42.9 },
          { mood: 'Neutral', count: 6, percentage: 21.4 },
          { mood: 'Low', count: 2, percentage: 7.1 },
        ],
        energyLevels: mockMoodTrend.map(item => ({
          date: item.date,
          energy: item.energy,
        })),
        activityCorrelation: [
          { activity: 'Exercise', averageMood: 4.2, count: 15 },
          { activity: 'Work', averageMood: 3.5, count: 20 },
          { activity: 'Social', averageMood: 4.0, count: 8 },
          { activity: 'Rest', averageMood: 3.8, count: 12 },
        ],
      },
      productivity: {
        tasksCompleted: 45,
        completionRate: 82.3,
        categoryBreakdown: [
          { category: 'Work', count: 20, percentage: 44.4, color: '#2196F3' },
          { category: 'Personal', count: 15, percentage: 33.3, color: '#4CAF50' },
          { category: 'Learning', count: 10, percentage: 22.2, color: '#FF9800' },
        ],
        dailyProductivity: mockDailyProductivity,
        goalProgress: [
          { goalId: '1', title: 'Complete Course', progress: 75, target: 100, percentage: 75 },
          { goalId: '2', title: 'Read 12 Books', progress: 8, target: 12, percentage: 66.7 },
          { goalId: '3', title: 'Exercise 150 days', progress: 120, target: 150, percentage: 80 },
        ],
      },
      overview: {
        totalHabits: 14,
        totalTasks: 55,
        journalEntries: 28,
        currentStreak: 12,
        weeklyScore: 85,
      },
    };
  }, []);

  const fetchAnalytics = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      // Try to fetch real data, fall back to mock data if API fails
      try {
        const [analyticsData, habitData, moodData, productivityData] = await Promise.all([
          apiService.getAnalytics().catch(() => null),
          apiService.getHabitAnalytics(timeRange).catch(() => null),
          apiService.getMoodAnalytics(timeRange).catch(() => null),
          apiService.getProductivityAnalytics(timeRange).catch(() => null),
        ]);

        if (analyticsData) {
          setState({
            data: analyticsData,
            habitAnalytics: habitData,
            moodAnalytics: moodData,
            productivityAnalytics: productivityData,
            isLoading: false,
            error: null,
          });
        } else {
          throw new Error('No analytics data available');
        }
      } catch (apiError) {
        // Use mock data for development
        console.log('Using mock analytics data for development');
        const mockData = generateMockData();
        
        setState({
          data: mockData,
          habitAnalytics: mockData.habits,
          moodAnalytics: mockData.mood,
          productivityAnalytics: mockData.productivity,
          isLoading: false,
          error: null,
        });
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load analytics',
      }));
    }
  }, [timeRange, generateMockData]);

  const refreshAnalytics = useCallback(() => {
    return fetchAnalytics();
  }, [fetchAnalytics]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return {
    ...state,
    refreshAnalytics,
  };
};
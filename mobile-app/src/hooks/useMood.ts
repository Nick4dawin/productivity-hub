import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '@/services/ApiService';
import { Mood, CreateMoodData } from '@/types';

/**
 * Hook for fetching mood entries
 */
export const useMoods = () => {
  return useQuery({
    queryKey: ['moods'],
    queryFn: () => apiService.getMoods(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook for creating a new mood entry
 */
export const useCreateMood = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (moodData: CreateMoodData) => apiService.createMood(moodData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['moods'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
};

/**
 * Hook for updating a mood entry
 */
export const useUpdateMood = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateMoodData> }) =>
      apiService.updateMood(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['moods'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
};

/**
 * Hook for deleting a mood entry
 */
export const useDeleteMood = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => apiService.deleteMood(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['moods'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
};

/**
 * Utility function to get mood entries for a specific date
 */
export const getMoodForDate = (moods: Mood[], date: string): Mood | undefined => {
  const targetDate = new Date(date).toDateString();
  return moods.find(mood => new Date(mood.date).toDateString() === targetDate);
};

/**
 * Utility function to get recent mood entries
 */
export const getRecentMoods = (moods: Mood[], days: number = 7): Mood[] => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  
  return moods
    .filter(mood => new Date(mood.date) >= cutoffDate)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

/**
 * Utility function to calculate mood statistics
 */
export const getMoodStats = (moods: Mood[]) => {
  if (moods.length === 0) {
    return {
      averageMood: 0,
      mostCommonMood: '',
      totalEntries: 0,
      moodDistribution: {},
    };
  }

  const moodValues: { [key: string]: number } = {
    'very-sad': 1,
    'sad': 2,
    'neutral': 3,
    'happy': 4,
    'very-happy': 5,
  };

  const moodCounts: { [key: string]: number } = {};
  let totalMoodValue = 0;

  moods.forEach(mood => {
    moodCounts[mood.mood] = (moodCounts[mood.mood] || 0) + 1;
    totalMoodValue += moodValues[mood.mood] || 3;
  });

  const averageMood = totalMoodValue / moods.length;
  const mostCommonMood = Object.keys(moodCounts).reduce((a, b) => 
    moodCounts[a] > moodCounts[b] ? a : b
  );

  return {
    averageMood,
    mostCommonMood,
    totalEntries: moods.length,
    moodDistribution: moodCounts,
  };
};

/**
 * Utility function to get mood trend data for charts
 */
export const getMoodTrendData = (moods: Mood[], days: number = 30) => {
  const moodValues: { [key: string]: number } = {
    'very-sad': 1,
    'sad': 2,
    'neutral': 3,
    'happy': 4,
    'very-happy': 5,
  };

  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - days);

  const trendData = [];
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    const dateString = currentDate.toDateString();
    const moodForDate = moods.find(mood => 
      new Date(mood.date).toDateString() === dateString
    );

    trendData.push({
      date: currentDate.toISOString().split('T')[0],
      mood: moodForDate ? moodValues[moodForDate.mood] || 3 : null,
    });

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return trendData;
};

/**
 * Utility function to get common activities from mood entries
 */
export const getCommonActivities = (moods: Mood[]): string[] => {
  const activityCounts: { [key: string]: number } = {};

  moods.forEach(mood => {
    mood.activities.forEach(activity => {
      activityCounts[activity] = (activityCounts[activity] || 0) + 1;
    });
  });

  return Object.keys(activityCounts)
    .sort((a, b) => activityCounts[b] - activityCounts[a])
    .slice(0, 20); // Return top 20 activities
};
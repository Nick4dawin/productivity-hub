import { useState, useCallback } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiService } from '@/services/ApiService';
import { ChatMessage, CoachData } from '@/types';

// Chat management
export const useCoachChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  const sendMessage = useMutation({
    mutationFn: async (message: string) => {
      // Add user message immediately
      const userMessage: ChatMessage = {
        sender: 'user',
        text: message,
        timestamp: Date.now(),
      };
      
      setMessages(prev => [...prev, userMessage]);
      setIsTyping(true);

      try {
        const response = await apiService.sendCoachMessage(message);
        
        const aiMessage: ChatMessage = {
          sender: 'ai',
          text: response.response,
          timestamp: Date.now(),
        };
        
        setMessages(prev => [...prev, aiMessage]);
        return response;
      } finally {
        setIsTyping(false);
      }
    },
  });

  const clearChat = useCallback(() => {
    setMessages([]);
  }, []);

  const addSystemMessage = useCallback((text: string) => {
    const systemMessage: ChatMessage = {
      sender: 'ai',
      text,
      timestamp: Date.now(),
    };
    setMessages(prev => [...prev, systemMessage]);
  }, []);

  return {
    messages,
    isTyping,
    sendMessage: sendMessage.mutateAsync,
    isSending: sendMessage.isPending,
    clearChat,
    addSystemMessage,
  };
};

// Coach data for insights
export const useCoachData = () => {
  return useQuery({
    queryKey: ['coachData'],
    queryFn: () => apiService.getCoachData(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Coach insights and suggestions
export const useCoachInsights = () => {
  const { data: coachData, isLoading } = useCoachData();

  const getProductivityInsights = useCallback(() => {
    if (!coachData) return [];

    const insights = [];
    
    // Todo completion rate
    const totalTodos = coachData.todos.length + coachData.completedTasks.length;
    if (totalTodos > 0) {
      const completionRate = (coachData.completedTasks.length / totalTodos) * 100;
      if (completionRate < 50) {
        insights.push({
          type: 'warning',
          title: 'Low Task Completion',
          message: `You've completed ${completionRate.toFixed(1)}% of your tasks. Consider breaking down large tasks into smaller ones.`,
        });
      } else if (completionRate > 80) {
        insights.push({
          type: 'success',
          title: 'Great Progress!',
          message: `You've completed ${completionRate.toFixed(1)}% of your tasks. Keep up the excellent work!`,
        });
      }
    }

    // Habit consistency
    if (coachData.habitProgress.length > 0) {
      const averageStreak = coachData.habitProgress.reduce((sum, habit) => {
        // Calculate current streak (this would need to be implemented based on completedDates)
        return sum + (habit.completedDates?.length || 0);
      }, 0) / coachData.habitProgress.length;

      if (averageStreak < 3) {
        insights.push({
          type: 'tip',
          title: 'Build Consistency',
          message: 'Focus on maintaining habits for at least 3 days in a row to build momentum.',
        });
      }
    }

    // Mood patterns
    if (coachData.moodLog.length > 0) {
      const recentMoods = coachData.moodLog.slice(-7); // Last 7 entries
      const averageMood = recentMoods.reduce((sum, mood) => sum + mood.rating, 0) / recentMoods.length;
      
      if (averageMood < 3) {
        insights.push({
          type: 'support',
          title: 'Mood Check-in',
          message: 'Your recent mood ratings seem low. Consider activities that usually boost your mood.',
        });
      }
    }

    return insights;
  }, [coachData]);

  const getGoalRecommendations = useCallback(() => {
    if (!coachData) return [];

    const recommendations = [];

    // Short-term goals
    if (coachData.goals.shortTerm.length === 0) {
      recommendations.push({
        type: 'suggestion',
        title: 'Set Short-term Goals',
        message: 'Consider setting 1-3 goals you can achieve in the next month.',
        action: 'Create Goal',
      });
    }

    // Long-term goals
    if (coachData.goals.longTerm.length === 0) {
      recommendations.push({
        type: 'suggestion',
        title: 'Think Long-term',
        message: 'Set some long-term goals to give direction to your daily activities.',
        action: 'Create Goal',
      });
    }

    return recommendations;
  }, [coachData]);

  return {
    coachData,
    isLoading,
    getProductivityInsights,
    getGoalRecommendations,
  };
};

// Proactive coaching suggestions
export const useProactiveCoaching = () => {
  const generateDailyCheckIn = useCallback(() => {
    const hour = new Date().getHours();
    
    if (hour < 12) {
      return "Good morning! What's your main focus for today?";
    } else if (hour < 17) {
      return "How's your day going? Any challenges I can help you work through?";
    } else {
      return "How did today go? What went well and what could be improved tomorrow?";
    }
  }, []);

  const generateMotivationalMessage = useCallback(() => {
    const messages = [
      "Remember, progress is progress, no matter how small. Keep going!",
      "You're building great habits. Consistency is key to long-term success.",
      "Every completed task brings you closer to your goals. You've got this!",
      "Take a moment to appreciate how far you've come. You're doing great!",
      "Small daily improvements lead to stunning long-term results.",
    ];
    
    return messages[Math.floor(Math.random() * messages.length)];
  }, []);

  const generateHabitReminder = useCallback((habitName: string) => {
    return `Don't forget about your "${habitName}" habit today. Even a small effort counts!`;
  }, []);

  return {
    generateDailyCheckIn,
    generateMotivationalMessage,
    generateHabitReminder,
  };
};
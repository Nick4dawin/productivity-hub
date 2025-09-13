import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Card } from '@/components/common/Card';
import { useProactiveCoaching, useCoachData } from '@/hooks/useCoach';
import { useHabits } from '@/hooks/useHabits';
import { useTodos } from '@/hooks/useTodos';

interface CoachingPromptProps {
  prompt: {
    id: string;
    type: 'check-in' | 'motivation' | 'habit-reminder' | 'goal-progress';
    title: string;
    message: string;
    action?: string;
  };
  onAction?: () => void;
  onDismiss?: () => void;
}

const CoachingPrompt: React.FC<CoachingPromptProps> = ({ prompt, onAction, onDismiss }) => {
  const { colors } = useTheme();

  const getPromptIcon = () => {
    switch (prompt.type) {
      case 'check-in':
        return '👋';
      case 'motivation':
        return '💪';
      case 'habit-reminder':
        return '🔔';
      case 'goal-progress':
        return '🎯';
      default:
        return '💭';
    }
  };

  const getPromptColor = () => {
    switch (prompt.type) {
      case 'check-in':
        return colors.primary;
      case 'motivation':
        return colors.success;
      case 'habit-reminder':
        return colors.warning;
      case 'goal-progress':
        return colors.secondary;
      default:
        return colors.textSecondary;
    }
  };

  return (
    <Card style={[styles.promptCard, { borderLeftColor: getPromptColor() }]}>
      <View style={styles.promptHeader}>
        <Text style={styles.promptIcon}>{getPromptIcon()}</Text>
        <Text style={[styles.promptTitle, { color: colors.text }]}>
          {prompt.title}
        </Text>
        {onDismiss && (
          <TouchableOpacity onPress={onDismiss} style={styles.dismissButton}>
            <Text style={[styles.dismissText, { color: colors.textSecondary }]}>
              ✕
            </Text>
          </TouchableOpacity>
        )}
      </View>
      
      <Text style={[styles.promptMessage, { color: colors.textSecondary }]}>
        {prompt.message}
      </Text>
      
      {prompt.action && onAction && (
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: getPromptColor() }]}
          onPress={onAction}
        >
          <Text style={styles.actionButtonText}>
            {prompt.action}
          </Text>
        </TouchableOpacity>
      )}
    </Card>
  );
};

export const ProactiveCoaching: React.FC = () => {
  const { colors } = useTheme();
  const [activePrompts, setActivePrompts] = useState<any[]>([]);
  const { generateDailyCheckIn, generateMotivationalMessage, generateHabitReminder } = useProactiveCoaching();
  const { data: coachData } = useCoachData();
  const { data: habits } = useHabits();
  const { data: todos } = useTodos();

  // Generate proactive prompts based on user patterns
  useEffect(() => {
    const generatePrompts = () => {
      const prompts = [];
      const now = new Date();
      const hour = now.getHours();

      // Daily check-in prompts
      if (hour === 9 || hour === 17) { // 9 AM or 5 PM
        prompts.push({
          id: 'daily-checkin',
          type: 'check-in',
          title: 'Daily Check-in',
          message: generateDailyCheckIn(),
          action: 'Start Chat',
        });
      }

      // Habit reminders for incomplete habits
      if (habits) {
        const today = new Date().toISOString().split('T')[0];
        const incompleteHabits = habits.filter(habit => 
          !habit.completedDates.includes(today)
        );

        if (incompleteHabits.length > 0 && hour >= 10 && hour <= 20) {
          const randomHabit = incompleteHabits[Math.floor(Math.random() * incompleteHabits.length)];
          prompts.push({
            id: `habit-reminder-${randomHabit._id}`,
            type: 'habit-reminder',
            title: 'Habit Reminder',
            message: generateHabitReminder(randomHabit.name),
            action: 'Mark Complete',
          });
        }
      }

      // Motivational messages for low completion rates
      if (todos && coachData) {
        const totalTasks = todos.length + coachData.completedTasks.length;
        const completionRate = totalTasks > 0 ? (coachData.completedTasks.length / totalTasks) * 100 : 0;
        
        if (completionRate < 50 && hour >= 14 && hour <= 18) {
          prompts.push({
            id: 'motivation-boost',
            type: 'motivation',
            title: 'Motivation Boost',
            message: generateMotivationalMessage(),
            action: 'View Tasks',
          });
        }
      }

      // Goal progress check (weekly)
      const dayOfWeek = now.getDay();
      if (dayOfWeek === 0 && hour === 19) { // Sunday evening
        prompts.push({
          id: 'weekly-review',
          type: 'goal-progress',
          title: 'Weekly Review',
          message: "How did this week go? Let's review your progress and plan for the upcoming week.",
          action: 'Review Goals',
        });
      }

      setActivePrompts(prompts);
    };

    generatePrompts();
    
    // Update prompts every hour
    const interval = setInterval(generatePrompts, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [habits, todos, coachData, generateDailyCheckIn, generateMotivationalMessage, generateHabitReminder]);

  const handlePromptAction = (prompt: any) => {
    switch (prompt.type) {
      case 'check-in':
        // Navigate to chat tab or open chat
        Alert.alert('Check-in', 'Opening chat interface...');
        break;
      case 'habit-reminder':
        // Mark habit as complete or navigate to habits
        Alert.alert('Habit Reminder', 'Opening habits screen...');
        break;
      case 'motivation':
        // Navigate to todos or show motivational content
        Alert.alert('Motivation', 'Opening tasks screen...');
        break;
      case 'goal-progress':
        // Navigate to goals screen
        Alert.alert('Goal Progress', 'Opening goals screen...');
        break;
    }
    
    // Remove the prompt after action
    dismissPrompt(prompt.id);
  };

  const dismissPrompt = (promptId: string) => {
    setActivePrompts(prev => prev.filter(p => p.id !== promptId));
  };

  if (activePrompts.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
          No coaching prompts right now. Check back later!
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.text }]}>
        🤖 Your AI Coach Says...
      </Text>
      
      {activePrompts.map((prompt) => (
        <CoachingPrompt
          key={prompt.id}
          prompt={prompt}
          onAction={() => handlePromptAction(prompt)}
          onDismiss={() => dismissPrompt(prompt.id)}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  promptCard: {
    marginBottom: 12,
    borderLeftWidth: 4,
  },
  promptHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  promptIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  promptTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  dismissButton: {
    padding: 4,
  },
  dismissText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  promptMessage: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
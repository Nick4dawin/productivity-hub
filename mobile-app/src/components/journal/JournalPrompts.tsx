import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '@/contexts/ThemeContext';
import { Card } from '@/components/common/Card';
import { JournalEntry, Mood } from '@/types';

interface JournalPromptsProps {
  recentEntries: JournalEntry[];
  recentMoods: Mood[];
  onPromptSelect: (prompt: string) => void;
}

interface JournalPrompt {
  id: string;
  text: string;
  category: 'reflection' | 'gratitude' | 'goals' | 'mood' | 'growth' | 'relationships';
  icon: string;
  color: string;
}

export const JournalPrompts: React.FC<JournalPromptsProps> = ({
  recentEntries,
  recentMoods,
  onPromptSelect,
}) => {
  const { colors } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [personalizedPrompts, setPersonalizedPrompts] = useState<JournalPrompt[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const basePrompts: JournalPrompt[] = [
    // Reflection prompts
    {
      id: 'reflect-1',
      text: 'What was the highlight of your day and why did it stand out?',
      category: 'reflection',
      icon: 'lightbulb-outline',
      color: '#FF9800',
    },
    {
      id: 'reflect-2',
      text: 'What challenge did you face today and how did you handle it?',
      category: 'reflection',
      icon: 'psychology',
      color: '#FF9800',
    },
    {
      id: 'reflect-3',
      text: 'What did you learn about yourself today?',
      category: 'reflection',
      icon: 'self-improvement',
      color: '#FF9800',
    },

    // Gratitude prompts
    {
      id: 'gratitude-1',
      text: 'What are three things you\'re grateful for right now?',
      category: 'gratitude',
      icon: 'favorite',
      color: '#E91E63',
    },
    {
      id: 'gratitude-2',
      text: 'Who made a positive impact on your day and how?',
      category: 'gratitude',
      icon: 'people',
      color: '#E91E63',
    },
    {
      id: 'gratitude-3',
      text: 'What small moment brought you joy today?',
      category: 'gratitude',
      icon: 'sentiment-very-satisfied',
      color: '#E91E63',
    },

    // Goals prompts
    {
      id: 'goals-1',
      text: 'What progress did you make toward your goals today?',
      category: 'goals',
      icon: 'flag',
      color: '#2196F3',
    },
    {
      id: 'goals-2',
      text: 'What would you like to accomplish tomorrow?',
      category: 'goals',
      icon: 'trending-up',
      color: '#2196F3',
    },
    {
      id: 'goals-3',
      text: 'What obstacles are preventing you from reaching your goals?',
      category: 'goals',
      icon: 'remove-road',
      color: '#2196F3',
    },

    // Mood prompts
    {
      id: 'mood-1',
      text: 'How are you feeling right now and what might be influencing that?',
      category: 'mood',
      icon: 'mood',
      color: '#9C27B0',
    },
    {
      id: 'mood-2',
      text: 'What activities or people tend to boost your mood?',
      category: 'mood',
      icon: 'sentiment-satisfied',
      color: '#9C27B0',
    },
    {
      id: 'mood-3',
      text: 'When you feel stressed, what helps you feel better?',
      category: 'mood',
      icon: 'spa',
      color: '#9C27B0',
    },

    // Growth prompts
    {
      id: 'growth-1',
      text: 'What skill or habit would you like to develop?',
      category: 'growth',
      icon: 'trending-up',
      color: '#4CAF50',
    },
    {
      id: 'growth-2',
      text: 'What feedback have you received recently and how can you apply it?',
      category: 'growth',
      icon: 'feedback',
      color: '#4CAF50',
    },
    {
      id: 'growth-3',
      text: 'What would you do if you knew you couldn\'t fail?',
      category: 'growth',
      icon: 'rocket-launch',
      color: '#4CAF50',
    },

    // Relationships prompts
    {
      id: 'relationships-1',
      text: 'How did you connect with others today?',
      category: 'relationships',
      icon: 'group',
      color: '#FF5722',
    },
    {
      id: 'relationships-2',
      text: 'What relationship in your life are you most grateful for?',
      category: 'relationships',
      icon: 'favorite-border',
      color: '#FF5722',
    },
    {
      id: 'relationships-3',
      text: 'How can you be a better friend, partner, or family member?',
      category: 'relationships',
      icon: 'handshake',
      color: '#FF5722',
    },
  ];

  const categories = [
    { id: 'all', label: 'All', icon: 'apps' },
    { id: 'reflection', label: 'Reflection', icon: 'lightbulb-outline' },
    { id: 'gratitude', label: 'Gratitude', icon: 'favorite' },
    { id: 'goals', label: 'Goals', icon: 'flag' },
    { id: 'mood', label: 'Mood', icon: 'mood' },
    { id: 'growth', label: 'Growth', icon: 'trending-up' },
    { id: 'relationships', label: 'Relationships', icon: 'group' },
  ];

  const generatePersonalizedPrompts = (): JournalPrompt[] => {
    const prompts: JournalPrompt[] = [];

    // Analyze recent mood patterns
    if (recentMoods.length > 0) {
      const recentMood = recentMoods[0];
      const moodCounts = recentMoods.reduce((acc, mood) => {
        acc[mood.mood] = (acc[mood.mood] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const dominantMood = Object.keys(moodCounts).reduce((a, b) => 
        moodCounts[a] > moodCounts[b] ? a : b
      );

      // Generate mood-specific prompts
      if (dominantMood === 'happy' || dominantMood === 'very-happy') {
        prompts.push({
          id: 'personalized-happy',
          text: 'You\'ve been feeling positive lately! What\'s been contributing to your happiness?',
          category: 'mood',
          icon: 'sentiment-very-satisfied',
          color: '#4CAF50',
        });
      } else if (dominantMood === 'sad' || dominantMood === 'very-sad') {
        prompts.push({
          id: 'personalized-sad',
          text: 'It seems like you\'ve been going through a tough time. What support do you need right now?',
          category: 'mood',
          icon: 'support',
          color: '#FF9800',
        });
      }

      // Activity-based prompts
      const commonActivities = recentMoods
        .flatMap(mood => mood.activities)
        .reduce((acc, activity) => {
          acc[activity] = (acc[activity] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

      const topActivity = Object.keys(commonActivities)[0];
      if (topActivity) {
        prompts.push({
          id: 'personalized-activity',
          text: `You've been doing a lot of ${topActivity.toLowerCase()} lately. How has this been affecting your well-being?`,
          category: 'reflection',
          icon: 'directions-run',
          color: '#2196F3',
        });
      }
    }

    // Analyze journal entry patterns
    if (recentEntries.length > 0) {
      const recentCategories = recentEntries.map(entry => entry.category);
      const categoryCount = recentCategories.reduce((acc, category) => {
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const dominantCategory = Object.keys(categoryCount).reduce((a, b) => 
        categoryCount[a] > categoryCount[b] ? a : b
      );

      if (dominantCategory === 'Work') {
        prompts.push({
          id: 'personalized-work',
          text: 'You\'ve been writing a lot about work. How are you maintaining work-life balance?',
          category: 'reflection',
          icon: 'work',
          color: '#607D8B',
        });
      }
    }

    // Time-based prompts
    const now = new Date();
    const hour = now.getHours();
    
    if (hour < 12) {
      prompts.push({
        id: 'morning-prompt',
        text: 'Good morning! What intentions do you want to set for today?',
        category: 'goals',
        icon: 'wb-sunny',
        color: '#FFC107',
      });
    } else if (hour > 18) {
      prompts.push({
        id: 'evening-prompt',
        text: 'As the day winds down, what are you most proud of accomplishing?',
        category: 'reflection',
        icon: 'bedtime',
        color: '#3F51B5',
      });
    }

    return prompts;
  };

  useEffect(() => {
    setPersonalizedPrompts(generatePersonalizedPrompts());
  }, [recentEntries, recentMoods]);

  const onRefresh = () => {
    setRefreshing(true);
    setPersonalizedPrompts(generatePersonalizedPrompts());
    setTimeout(() => setRefreshing(false), 1000);
  };

  const getFilteredPrompts = () => {
    const allPrompts = [...personalizedPrompts, ...basePrompts];
    
    if (selectedCategory === 'all') {
      return allPrompts;
    }
    
    return allPrompts.filter(prompt => prompt.category === selectedCategory);
  };

  const filteredPrompts = getFilteredPrompts();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          Writing Prompts
        </Text>
        <TouchableOpacity onPress={onRefresh}>
          <Icon name="refresh" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Category Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
        contentContainerStyle={styles.categoriesContent}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryChip,
              {
                backgroundColor: selectedCategory === category.id ? colors.primary : colors.surface,
              },
            ]}
            onPress={() => setSelectedCategory(category.id)}
          >
            <Icon
              name={category.icon}
              size={16}
              color={selectedCategory === category.id ? 'white' : colors.text}
            />
            <Text
              style={[
                styles.categoryText,
                {
                  color: selectedCategory === category.id ? 'white' : colors.text,
                },
              ]}
            >
              {category.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Prompts List */}
      <ScrollView
        style={styles.promptsList}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {personalizedPrompts.length > 0 && selectedCategory === 'all' && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              ✨ Personalized for You
            </Text>
            {personalizedPrompts.map((prompt) => (
              <TouchableOpacity
                key={prompt.id}
                style={[styles.promptCard, { backgroundColor: colors.surface }]}
                onPress={() => onPromptSelect(prompt.text)}
              >
                <View style={styles.promptHeader}>
                  <Icon name={prompt.icon} size={20} color={prompt.color} />
                  <View style={[styles.categoryBadge, { backgroundColor: prompt.color + '20' }]}>
                    <Text style={[styles.categoryBadgeText, { color: prompt.color }]}>
                      {prompt.category}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.promptText, { color: colors.text }]}>
                  {prompt.text}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={styles.section}>
          {personalizedPrompts.length > 0 && selectedCategory === 'all' && (
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              💡 More Ideas
            </Text>
          )}
          {basePrompts
            .filter(prompt => selectedCategory === 'all' || prompt.category === selectedCategory)
            .map((prompt) => (
              <TouchableOpacity
                key={prompt.id}
                style={[styles.promptCard, { backgroundColor: colors.surface }]}
                onPress={() => onPromptSelect(prompt.text)}
              >
                <View style={styles.promptHeader}>
                  <Icon name={prompt.icon} size={20} color={prompt.color} />
                  <View style={[styles.categoryBadge, { backgroundColor: prompt.color + '20' }]}>
                    <Text style={[styles.categoryBadgeText, { color: prompt.color }]}>
                      {prompt.category}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.promptText, { color: colors.text }]}>
                  {prompt.text}
                </Text>
              </TouchableOpacity>
            ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  categoriesContainer: {
    marginBottom: 16,
  },
  categoriesContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '500',
  },
  promptsList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  promptCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  promptHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  categoryBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  promptText: {
    fontSize: 14,
    lineHeight: 20,
  },
});
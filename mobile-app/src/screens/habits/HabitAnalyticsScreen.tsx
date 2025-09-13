import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '@/contexts/ThemeContext';
import { Header } from '@/components/common/Header';
import { HabitAnalytics } from '@/components/habits/HabitAnalytics';
import { HabitInsights } from '@/components/habits/HabitInsights';
import { useHabits } from '@/hooks/useHabits';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Habit } from '@/types';

export const HabitAnalyticsScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const { data: habits = [], isLoading, error } = useHabits();

  const handleHabitPress = (habit: Habit) => {
    navigation.navigate('HabitDetail' as never, { habit } as never);
  };

  const handleBack = () => {
    navigation.goBack();
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Header title="Habit Analytics" showBackButton onLeftPress={handleBack} />
        <LoadingSpinner />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Habit Analytics" showBackButton onLeftPress={handleBack} />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <HabitInsights habits={habits} onHabitPress={handleHabitPress} />
        <HabitAnalytics habits={habits} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '@/contexts/ThemeContext';
import { Header } from '@/components/common/Header';
import { HabitCalendar } from '@/components/habits/HabitCalendar';
import { HabitProgress } from '@/components/habits/HabitProgress';
import { useToggleHabit } from '@/hooks/useHabits';
import { Habit } from '@/types';
import { showToast } from '@/utils/toast';

interface RouteParams {
  habit: Habit;
}

export const HabitDetailScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const { habit } = route.params as RouteParams;

  const toggleHabitMutation = useToggleHabit();

  const handleDatePress = (date: string) => {
    toggleHabitMutation.mutate(
      { id: habit._id, date },
      {
        onSuccess: () => {
          showToast(`Habit ${habit.completedDates.includes(date) ? 'uncompleted' : 'completed'} for ${date}`);
        },
      }
    );
  };

  const handleEdit = () => {
    navigation.navigate('AddHabit' as never, { habit } as never);
  };

  if (!habit) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Header title="Habit Detail" showBackButton onLeftPress={() => navigation.goBack()} />
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: colors.error }]}>
            Habit not found
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title={habit.name}
        showBackButton
        onLeftPress={() => navigation.goBack()}
        rightAction={{
          icon: 'edit',
          onPress: handleEdit,
        }}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Habit Info */}
        <View style={[styles.infoCard, { backgroundColor: colors.surface }]}>
          <View style={styles.infoHeader}>
            <View
              style={[
                styles.colorIndicator,
                { backgroundColor: habit.color || colors.primary },
              ]}
            />
            <View style={styles.infoContent}>
              <Text style={[styles.habitName, { color: colors.text }]}>
                {habit.name}
              </Text>
              <Text style={[styles.habitCategory, { color: colors.textSecondary }]}>
                {habit.category}
              </Text>
            </View>
          </View>
        </View>

        {/* Progress Component */}
        <HabitProgress habit={habit} showAnimation />

        {/* Calendar Component */}
        <HabitCalendar habit={habit} onDatePress={handleDatePress} />

        {/* Quick Stats */}
        <View style={[styles.statsCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.statsTitle, { color: colors.text }]}>
            Quick Stats
          </Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: colors.primary }]}>
                {habit.completedDates.length}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Total Completions
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: colors.success }]}>
                {habit.streak || 0}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Best Streak
              </Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.primary }]}
            onPress={handleEdit}
          >
            <Text style={[styles.actionButtonText, { color: colors.surface }]}>
              Edit Habit
            </Text>
          </TouchableOpacity>
        </View>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
  },
  infoCard: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorIndicator: {
    width: 4,
    height: 40,
    borderRadius: 2,
    marginRight: 16,
  },
  infoContent: {
    flex: 1,
  },
  habitName: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  habitCategory: {
    fontSize: 14,
    textTransform: 'capitalize',
  },
  statsCard: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  actionsContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  actionButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
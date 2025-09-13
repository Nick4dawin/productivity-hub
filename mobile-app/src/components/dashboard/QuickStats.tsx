import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '@/components/common';
import { useTheme } from '@/contexts/ThemeContext';

interface QuickStatsProps {
  stats: {
    habitsCompleted: number;
    totalHabits: number;
    todosCompleted: number;
    totalTodos: number;
    currentStreak: number;
    journalEntries: number;
  };
}

export const QuickStats: React.FC<QuickStatsProps> = ({ stats }) => {
  const { colors } = useTheme();

  const statItems = [
    {
      label: 'Habits Today',
      value: `${stats.habitsCompleted}/${stats.totalHabits}`,
      color: colors.primary,
    },
    {
      label: 'Tasks Done',
      value: `${stats.todosCompleted}/${stats.totalTodos}`,
      color: colors.success,
    },
    {
      label: 'Current Streak',
      value: stats.currentStreak.toString(),
      color: colors.warning,
    },
    {
      label: 'Journal Entries',
      value: stats.journalEntries.toString(),
      color: colors.secondary,
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.text }]}>Quick Stats</Text>
      <View style={styles.statsGrid}>
        {statItems.map((item, index) => (
          <Card key={index} style={styles.statCard} variant="elevated">
            <Text style={[styles.statValue, { color: item.color }]}>{item.value}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{item.label}</Text>
          </Card>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 8,
  },
  statCard: {
    width: '48%',
    margin: '1%',
    padding: 16,
    alignItems: 'center',
    borderRadius: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
});
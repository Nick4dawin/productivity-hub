import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SwipeListView } from 'react-native-swipe-list-view';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '@/contexts/ThemeContext';
import { Header } from '@/components/common/Header';
import { HabitItem, HabitItemHiddenRow } from '@/components/habits/HabitItem';
import { useHabits, useToggleHabit, useDeleteHabit } from '@/hooks/useHabits';
import { Habit } from '@/types';
import { showConfirmDialog } from '@/utils/toast';

export const HabitsScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);

  // Hooks for data management
  const { data: habits = [], isLoading, error, refetch } = useHabits();
  const toggleHabitMutation = useToggleHabit();
  const deleteHabitMutation = useDeleteHabit();

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleToggleHabit = (habitId: string) => {
    const today = new Date().toISOString().split('T')[0];
    toggleHabitMutation.mutate({ id: habitId, date: today });
  };

  const handleEditHabit = (habit: Habit) => {
    navigation.navigate('AddHabit' as never, { habit } as never);
  };

  const handleHabitPress = (habit: Habit) => {
    navigation.navigate('HabitDetail' as never, { habit } as never);
  };

  const handleDeleteHabit = (habitId: string) => {
    const habit = habits.find(h => h._id === habitId);
    showConfirmDialog(
      'Delete Habit',
      `Are you sure you want to delete "${habit?.name}"? This action cannot be undone.`,
      () => deleteHabitMutation.mutate(habitId)
    );
  };

  const handleAddHabit = () => {
    navigation.navigate('AddHabit' as never);
  };

  const handleViewAnalytics = () => {
    navigation.navigate('HabitAnalytics' as never);
  };

  const renderHabitItem = ({ item }: { item: Habit }) => (
    <HabitItem
      habit={item}
      onToggle={handleToggleHabit}
      onEdit={handleEditHabit}
      onDelete={handleDeleteHabit}
      onPress={handleHabitPress}
    />
  );

  const renderHiddenItem = ({ item }: { item: Habit }) => (
    <HabitItemHiddenRow
      onEdit={() => handleEditHabit(item)}
      onDelete={() => handleDeleteHabit(item._id)}
      colors={colors}
    />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={[styles.emptyTitle, { color: colors.text }]}>No Habits Yet</Text>
      <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
        Start building positive habits by creating your first one!
      </Text>
      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: colors.primary }]}
        onPress={handleAddHabit}
      >
        <Text style={[styles.addButtonText, { color: colors.surface }]}>
          Create Your First Habit
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderError = () => (
    <View style={styles.errorState}>
      <Text style={[styles.errorTitle, { color: colors.error }]}>
        Failed to Load Habits
      </Text>
      <Text style={[styles.errorSubtitle, { color: colors.textSecondary }]}>
        {error?.message || 'Something went wrong'}
      </Text>
      <TouchableOpacity
        style={[styles.retryButton, { backgroundColor: colors.primary }]}
        onPress={() => refetch()}
      >
        <Text style={[styles.retryButtonText, { color: colors.surface }]}>
          Try Again
        </Text>
      </TouchableOpacity>
    </View>
  );

  if (isLoading && !refreshing) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Header title="Habits" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Loading your habits...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error && !refreshing) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Header title="Habits" />
        {renderError()}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header 
        title="Habits" 
        rightAction={{
          icon: '+',
          onPress: handleAddHabit,
        }}
      />
      
      {habits.length === 0 ? (
        renderEmptyState()
      ) : (
        <>
          {/* Analytics Button */}
          <TouchableOpacity
            style={[styles.analyticsButton, { backgroundColor: colors.info }]}
            onPress={handleViewAnalytics}
          >
            <Text style={[styles.analyticsButtonText, { color: colors.surface }]}>
              📊 View Analytics & Insights
            </Text>
          </TouchableOpacity>

          <SwipeListView
            data={habits}
            renderItem={renderHabitItem}
            renderHiddenItem={renderHiddenItem}
            rightOpenValue={-168} // Width for two action buttons
            keyExtractor={(item) => item._id}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                colors={[colors.primary]}
                tintColor={colors.primary}
              />
            }
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        </>
      )}

      {/* Floating Action Button */}
      {habits.length > 0 && (
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: colors.primary }]}
          onPress={handleAddHabit}
        >
          <Text style={[styles.fabText, { color: colors.surface }]}>+</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContainer: {
    paddingVertical: 8,
    paddingBottom: 100, // Space for FAB
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  addButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  errorState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  fabText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  analyticsButton: {
    marginHorizontal: 16,
    marginVertical: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  analyticsButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
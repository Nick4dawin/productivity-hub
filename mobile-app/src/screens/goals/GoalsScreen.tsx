import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { useGoals, useDeleteGoal } from '../../hooks/useGoals';
import { useTheme } from '../../contexts/ThemeContext';
import { Goal } from '../../types';

import Header from '../../components/common/Header';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import GoalItem from '../../components/goals/GoalItem';
import GoalProgress from '../../components/goals/GoalProgress';
import GoalStats from '../../components/goals/GoalStats';

const GoalsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const [refreshing, setRefreshing] = useState(false);

  const { data: goals = [], isLoading, refetch } = useGoals();
  const deleteGoalMutation = useDeleteGoal();

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleAddGoal = () => {
    navigation.navigate('AddGoal' as never);
  };

  const handleEditGoal = (goal: Goal) => {
    navigation.navigate('EditGoal' as never, { goalId: goal._id } as never);
  };

  const handleDeleteGoal = (goal: Goal) => {
    Alert.alert(
      'Delete Goal',
      `Are you sure you want to delete "${goal.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteGoalMutation.mutate(goal._id),
        },
      ]
    );
  };

  const handleViewGoal = (goal: Goal) => {
    navigation.navigate('GoalDetail' as never, { goalId: goal._id } as never);
  };

  const renderGoalItem = ({ item }: { item: Goal }) => (
    <GoalItem
      goal={item}
      onPress={() => handleViewGoal(item)}
      onEdit={() => handleEditGoal(item)}
      onDelete={() => handleDeleteGoal(item)}
    />
  );

  const renderHeader = () => (
    <View style={styles.headerContent}>
      <GoalStats goals={goals} />
      <GoalProgress goals={goals} />
    </View>
  );

  const renderEmptyState = () => (
    <Card style={styles.emptyState}>
      <Ionicons 
        name="flag-outline" 
        size={64} 
        color={theme.colors.textSecondary} 
        style={styles.emptyIcon}
      />
      <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
        No Goals Yet
      </Text>
      <Text style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}>
        Create your first SMART goal to start tracking your progress
      </Text>
      <Button
        title="Create Goal"
        onPress={handleAddGoal}
        style={styles.emptyButton}
      />
    </Card>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Header title="Goals" />
        <LoadingSpinner />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Header 
        title="Goals" 
        rightComponent={
          <TouchableOpacity onPress={handleAddGoal}>
            <Ionicons name="add" size={24} color={theme.colors.primary} />
          </TouchableOpacity>
        }
      />
      
      <FlatList
        data={goals}
        renderItem={renderGoalItem}
        keyExtractor={(item) => item._id}
        ListHeaderComponent={goals.length > 0 ? renderHeader : undefined}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    flexGrow: 1,
    padding: 16,
  },
  headerContent: {
    marginBottom: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    marginTop: 64,
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  emptyButton: {
    minWidth: 120,
  },
});

export default GoalsScreen;
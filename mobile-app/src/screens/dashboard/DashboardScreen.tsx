import React from 'react';
import { ScrollView, StyleSheet, RefreshControl, Alert, Text, TouchableOpacity, View } from 'react-native';
import { Container, Header, Card } from '@/components';
import { QuickStats, RecentActivity, UpcomingTasks } from '@/components/dashboard';
import { useTheme } from '@/contexts/ThemeContext';
import { useDashboard } from '@/hooks/useDashboard';
import { LoadingSpinner } from '@/components/common';
import { Todo } from '@/types';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { DashboardStackParamList } from '@/navigation/stacks/DashboardStack';

type DashboardScreenNavigationProp = NativeStackNavigationProp<DashboardStackParamList, 'Dashboard'>;

export const DashboardScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<DashboardScreenNavigationProp>();
  const { stats, recentActivity, upcomingTasks, isLoading, error, refreshData } = useDashboard();

  const handleTaskPress = (task: Todo) => {
    // TODO: Navigate to task detail or todos screen
    Alert.alert('Task Selected', `Selected: ${task.title}`);
  };

  const handleToggleTask = async (taskId: string) => {
    try {
      // TODO: Implement task toggle functionality
      Alert.alert('Toggle Task', `Toggle task: ${taskId}`);
      // After successful toggle, refresh data
      await refreshData();
    } catch (error) {
      Alert.alert('Error', 'Failed to toggle task');
    }
  };

  const handleActivityPress = (activity: any) => {
    // TODO: Navigate to appropriate screen based on activity type
    Alert.alert('Activity Selected', `Selected: ${activity.title}`);
  };

  if (isLoading) {
    return (
      <Container padding="none">
        <Header title="Dashboard" />
        <LoadingSpinner />
      </Container>
    );
  }

  if (error) {
    return (
      <Container padding="none">
        <Header title="Dashboard" />
        <ScrollView
          contentContainerStyle={styles.errorContainer}
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={refreshData} />
          }
        >
          <Text style={[styles.errorText, { color: colors.error }]}>
            {error}
          </Text>
        </ScrollView>
      </Container>
    );
  }

  return (
    <Container padding="none">
      <Header title="Dashboard" />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refreshData}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        <QuickStats stats={stats} />
        
        {/* Analytics Section */}
        <View style={styles.analyticsSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Analytics</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('AnalyticsDetail', { type: 'productivity' })}
            activeOpacity={0.7}
          >
            <Card style={styles.analyticsCard} variant="elevated" touchable>
              <View style={styles.analyticsContent}>
                <Text style={[styles.analyticsTitle, { color: colors.text }]}>
                  View Detailed Analytics
                </Text>
                <Text style={[styles.analyticsDescription, { color: colors.textSecondary }]}>
                  Track your habits, mood, and productivity trends
                </Text>
                <Text style={[styles.analyticsAction, { color: colors.primary }]}>
                  View Charts →
                </Text>
              </View>
            </Card>
          </TouchableOpacity>
        </View>

        <RecentActivity 
          activities={recentActivity} 
          onActivityPress={handleActivityPress}
        />
        <UpcomingTasks 
          tasks={upcomingTasks}
          onTaskPress={handleTaskPress}
          onToggleTask={handleToggleTask}
        />
      </ScrollView>
    </Container>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  content: {
    paddingVertical: 16,
  },
  analyticsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  analyticsCard: {
    marginHorizontal: 16,
  },
  analyticsContent: {
    padding: 16,
  },
  analyticsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  analyticsDescription: {
    fontSize: 14,
    marginBottom: 8,
  },
  analyticsAction: {
    fontSize: 14,
    fontWeight: '500',
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
});
import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Card } from '@/components/common';
import { useTheme } from '@/contexts/ThemeContext';

interface ActivityItem {
  id: string;
  type: 'habit' | 'todo' | 'journal' | 'mood';
  title: string;
  description: string;
  timestamp: string;
  icon: string;
}

interface RecentActivityProps {
  activities: ActivityItem[];
  onActivityPress?: (activity: ActivityItem) => void;
}

export const RecentActivity: React.FC<RecentActivityProps> = ({ 
  activities, 
  onActivityPress 
}) => {
  const { colors } = useTheme();

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'habit':
        return colors.primary;
      case 'todo':
        return colors.success;
      case 'journal':
        return colors.secondary;
      case 'mood':
        return colors.warning;
      default:
        return colors.textSecondary;
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const renderActivityItem = ({ item }: { item: ActivityItem }) => (
    <TouchableOpacity
      onPress={() => onActivityPress?.(item)}
      activeOpacity={0.7}
    >
      <View style={[styles.activityItem, { borderBottomColor: colors.border }]}>
        <View style={[styles.activityIcon, { backgroundColor: getActivityColor(item.type) }]}>
          <Text style={styles.activityIconText}>{item.icon}</Text>
        </View>
        <View style={styles.activityContent}>
          <Text style={[styles.activityTitle, { color: colors.text }]}>{item.title}</Text>
          <Text style={[styles.activityDescription, { color: colors.textSecondary }]}>
            {item.description}
          </Text>
        </View>
        <Text style={[styles.activityTime, { color: colors.textSecondary }]}>
          {formatTime(item.timestamp)}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.text }]}>Recent Activity</Text>
      <Card style={styles.activityCard} variant="elevated" padding="none">
        {activities.length > 0 ? (
          <FlatList
            data={activities}
            renderItem={renderActivityItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false}
          />
        ) : (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No recent activity
            </Text>
          </View>
        )}
      </Card>
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
  activityCard: {
    marginHorizontal: 16,
    padding: 0,
    borderRadius: 12,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activityIconText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  activityDescription: {
    fontSize: 14,
  },
  activityTime: {
    fontSize: 12,
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
  },
});
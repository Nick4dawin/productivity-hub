import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { SwipeListView } from 'react-native-swipe-list-view';
import HapticFeedback from 'react-native-haptic-feedback';
import { useTheme } from '@/contexts/ThemeContext';
import { Habit } from '@/types';
import { isHabitCompletedToday, getCurrentStreak } from '@/hooks/useHabits';

interface HabitItemProps {
  habit: Habit;
  onToggle: (habitId: string) => void;
  onEdit: (habit: Habit) => void;
  onDelete: (habitId: string) => void;
  onPress?: (habit: Habit) => void;
}

const { width: screenWidth } = Dimensions.get('window');

export const HabitItem: React.FC<HabitItemProps> = ({
  habit,
  onToggle,
  onEdit,
  onDelete,
  onPress,
}) => {
  const { colors } = useTheme();
  const isCompleted = isHabitCompletedToday(habit);
  const currentStreak = getCurrentStreak(habit);

  // Animation values
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const checkboxAnim = useRef(new Animated.Value(isCompleted ? 1 : 0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Animate checkbox when completion status changes
    Animated.spring(checkboxAnim, {
      toValue: isCompleted ? 1 : 0,
      useNativeDriver: false,
      tension: 100,
      friction: 8,
    }).start();
  }, [isCompleted]);

  const handleToggle = () => {
    // Provide haptic feedback
    HapticFeedback.trigger('impactLight');
    
    // Scale animation for press feedback
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    // Pulse animation for completion
    if (!isCompleted) {
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }

    onToggle(habit._id);
  };

  const handleEdit = () => {
    HapticFeedback.trigger('impactMedium');
    onEdit(habit);
  };

  const handleDelete = () => {
    HapticFeedback.trigger('impactHeavy');
    onDelete(habit._id);
  };

  const handlePress = () => {
    if (onPress) {
      onPress(habit);
    }
  };

  return (
    <Animated.View 
      style={[
        styles.container, 
        { backgroundColor: colors.surface },
        { transform: [{ scale: scaleAnim }] }
      ]}
    >
      <TouchableOpacity
        style={[
          styles.habitCard,
          { borderLeftColor: habit.color || colors.primary },
        ]}
        onPress={handleToggle}
        onLongPress={handlePress}
        activeOpacity={0.7}
      >
        <View style={styles.leftSection}>
          <Animated.View
            style={[
              styles.checkbox,
              {
                backgroundColor: checkboxAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['transparent', colors.success],
                }),
                borderColor: checkboxAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [colors.border, colors.success],
                }),
                transform: [{ scale: pulseAnim }],
              },
            ]}
          >
            <Animated.View
              style={{
                opacity: checkboxAnim,
                transform: [
                  {
                    scale: checkboxAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 1],
                    }),
                  },
                ],
              }}
            >
              <Text style={[styles.checkmark, { color: colors.surface }]}>✓</Text>
            </Animated.View>
          </Animated.View>
          <View style={styles.habitInfo}>
            <Text
              style={[
                styles.habitName,
                {
                  color: isCompleted ? colors.textSecondary : colors.text,
                  textDecorationLine: isCompleted ? 'line-through' : 'none',
                },
              ]}
            >
              {habit.name}
            </Text>
            <Text style={[styles.habitCategory, { color: colors.textSecondary }]}>
              {habit.category}
            </Text>
          </View>
        </View>
        <View style={styles.rightSection}>
          {currentStreak > 0 && (
            <View style={[styles.streakBadge, { backgroundColor: colors.warning }]}>
              <Text style={[styles.streakText, { color: colors.surface }]}>
                🔥 {currentStreak}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// Hidden row component for swipe actions
export const HabitItemHiddenRow: React.FC<{
  onEdit: () => void;
  onDelete: () => void;
  colors: any;
}> = ({ onEdit, onDelete, colors }) => (
  <View style={styles.hiddenRow}>
    <TouchableOpacity
      style={[styles.actionButton, styles.editButton, { backgroundColor: colors.info }]}
      onPress={onEdit}
    >
      <Text style={[styles.actionText, { color: colors.surface }]}>Edit</Text>
    </TouchableOpacity>
    <TouchableOpacity
      style={[styles.actionButton, styles.deleteButton, { backgroundColor: colors.error }]}
      onPress={onDelete}
    >
      <Text style={[styles.actionText, { color: colors.surface }]}>Delete</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 4,
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
  habitCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderLeftWidth: 4,
    borderRadius: 12,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkmark: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  habitInfo: {
    flex: 1,
  },
  habitName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  habitCategory: {
    fontSize: 12,
    textTransform: 'capitalize',
  },
  rightSection: {
    alignItems: 'flex-end',
  },
  streakBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 40,
    alignItems: 'center',
  },
  streakText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  hiddenRow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingRight: 16,
    marginHorizontal: 16,
    marginVertical: 4,
  },
  actionButton: {
    width: 80,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    borderRadius: 8,
  },
  editButton: {
    // backgroundColor will be set from colors.info
  },
  deleteButton: {
    // backgroundColor will be set from colors.error
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
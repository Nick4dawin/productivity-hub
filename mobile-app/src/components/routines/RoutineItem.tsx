import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Swipeable } from 'react-native-gesture-handler';

import { useTheme } from '../../contexts/ThemeContext';
import { Routine } from '../../types';

import Card from '../common/Card';
import Button from '../common/Button';

interface RoutineItemProps {
  routine: Routine;
  onPress: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onExecute: () => void;
}

const RoutineItem: React.FC<RoutineItemProps> = ({
  routine,
  onPress,
  onEdit,
  onDelete,
  onExecute,
}) => {
  const { theme } = useTheme();

  const getTypeColor = (type: Routine['type']) => {
    switch (type) {
      case 'Morning':
        return '#FF9500'; // Orange
      case 'Evening':
        return '#5856D6'; // Purple
      default:
        return theme.colors.primary;
    }
  };

  const getTypeIcon = (type: Routine['type']) => {
    switch (type) {
      case 'Morning':
        return 'sunny';
      case 'Evening':
        return 'moon';
      default:
        return 'time';
    }
  };

  const renderRightActions = () => (
    <View style={styles.rightActions}>
      <TouchableOpacity
        style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
        onPress={onEdit}
      >
        <Ionicons name="pencil" size={20} color="white" />
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.actionButton, { backgroundColor: theme.colors.error }]}
        onPress={onDelete}
      >
        <Ionicons name="trash" size={20} color="white" />
      </TouchableOpacity>
    </View>
  );

  return (
    <Swipeable renderRightActions={renderRightActions}>
      <Card style={styles.container}>
        <TouchableOpacity onPress={onPress} style={styles.content}>
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              <Text style={[styles.title, { color: theme.colors.text }]} numberOfLines={2}>
                {routine.name}
              </Text>
              <View style={styles.typeContainer}>
                <Ionicons
                  name={getTypeIcon(routine.type)}
                  size={16}
                  color={getTypeColor(routine.type)}
                />
                <Text style={[styles.type, { color: getTypeColor(routine.type) }]}>
                  {routine.type}
                </Text>
              </View>
            </View>
          </View>

          {/* Description */}
          {routine.description && (
            <Text style={[styles.description, { color: theme.colors.textSecondary }]} numberOfLines={2}>
              {routine.description}
            </Text>
          )}

          {/* Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Ionicons name="checkmark-circle-outline" size={16} color={theme.colors.textSecondary} />
              <Text style={[styles.statText, { color: theme.colors.textSecondary }]}>
                {routine.tasks?.length || 0} tasks
              </Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="repeat-outline" size={16} color={theme.colors.textSecondary} />
              <Text style={[styles.statText, { color: theme.colors.textSecondary }]}>
                {routine.habits?.length || 0} habits
              </Text>
            </View>
          </View>

          {/* Action Button */}
          <View style={styles.actionContainer}>
            <Button
              title="Start Routine"
              onPress={onExecute}
              style={styles.executeButton}
              variant="primary"
            />
          </View>
        </TouchableOpacity>
      </Card>
    </Swipeable>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  type: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  statsContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  statText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  actionContainer: {
    alignItems: 'flex-start',
  },
  executeButton: {
    paddingHorizontal: 24,
    paddingVertical: 8,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    width: 60,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default RoutineItem;
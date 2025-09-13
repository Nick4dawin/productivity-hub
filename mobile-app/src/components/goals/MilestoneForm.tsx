import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../../contexts/ThemeContext';
import { Milestone } from '../../types';

import Card from '../common/Card';
import Input from '../common/Input';
import Button from '../common/Button';

interface MilestoneFormProps {
  milestones: Milestone[];
  onMilestonesChange: (milestones: Milestone[]) => void;
}

const MilestoneForm: React.FC<MilestoneFormProps> = ({
  milestones,
  onMilestonesChange,
}) => {
  const { theme } = useTheme();
  const [newMilestoneTitle, setNewMilestoneTitle] = useState('');
  const [newMilestoneDueDate, setNewMilestoneDueDate] = useState('');

  const addMilestone = () => {
    if (!newMilestoneTitle.trim()) {
      Alert.alert('Error', 'Please enter a milestone title');
      return;
    }

    const newMilestone: Milestone = {
      _id: Date.now().toString(), // Temporary ID for new milestones
      title: newMilestoneTitle.trim(),
      completed: false,
      dueDate: newMilestoneDueDate || undefined,
    };

    onMilestonesChange([...milestones, newMilestone]);
    setNewMilestoneTitle('');
    setNewMilestoneDueDate('');
  };

  const removeMilestone = (id: string) => {
    onMilestonesChange(milestones.filter(m => m._id !== id));
  };

  const toggleMilestone = (id: string) => {
    onMilestonesChange(
      milestones.map(m =>
        m._id === id ? { ...m, completed: !m.completed } : m
      )
    );
  };

  const updateMilestone = (id: string, field: keyof Milestone, value: any) => {
    onMilestonesChange(
      milestones.map(m =>
        m._id === id ? { ...m, [field]: value } : m
      )
    );
  };

  return (
    <Card style={styles.container}>
      <Text style={[styles.title, { color: theme.colors.text }]}>
        Milestones
      </Text>
      <Text style={[styles.description, { color: theme.colors.textSecondary }]}>
        Break down your goal into smaller, trackable milestones
      </Text>

      {/* Existing Milestones */}
      {milestones.map((milestone, index) => (
        <View key={milestone._id} style={styles.milestoneItem}>
          <View style={styles.milestoneHeader}>
            <TouchableOpacity
              onPress={() => toggleMilestone(milestone._id)}
              style={styles.checkbox}
            >
              <Ionicons
                name={milestone.completed ? 'checkmark-circle' : 'ellipse-outline'}
                size={24}
                color={milestone.completed ? theme.colors.success : theme.colors.textSecondary}
              />
            </TouchableOpacity>
            <View style={styles.milestoneContent}>
              <Input
                value={milestone.title}
                onChangeText={(text) => updateMilestone(milestone._id, 'title', text)}
                placeholder="Milestone title"
                style={[
                  styles.milestoneInput,
                  milestone.completed && styles.completedText,
                ]}
              />
              <Input
                value={milestone.dueDate || ''}
                onChangeText={(text) => updateMilestone(milestone._id, 'dueDate', text)}
                placeholder="Due date (optional)"
                style={styles.dueDateInput}
              />
            </View>
            <TouchableOpacity
              onPress={() => removeMilestone(milestone._id)}
              style={styles.removeButton}
            >
              <Ionicons name="trash-outline" size={20} color={theme.colors.error} />
            </TouchableOpacity>
          </View>
        </View>
      ))}

      {/* Add New Milestone */}
      <View style={styles.addMilestoneContainer}>
        <Text style={[styles.addMilestoneTitle, { color: theme.colors.text }]}>
          Add New Milestone
        </Text>
        <Input
          value={newMilestoneTitle}
          onChangeText={setNewMilestoneTitle}
          placeholder="Enter milestone title"
          style={styles.addInput}
        />
        <Input
          value={newMilestoneDueDate}
          onChangeText={setNewMilestoneDueDate}
          placeholder="Due date (optional)"
          style={styles.addInput}
        />
        <Button
          title="Add Milestone"
          onPress={addMilestone}
          variant="outline"
          style={styles.addButton}
          disabled={!newMilestoneTitle.trim()}
        />
      </View>

      {/* Milestone Progress */}
      {milestones.length > 0 && (
        <View style={styles.progressContainer}>
          <Text style={[styles.progressText, { color: theme.colors.textSecondary }]}>
            Progress: {milestones.filter(m => m.completed).length} of {milestones.length} completed
          </Text>
          <View style={[styles.progressBar, { backgroundColor: theme.colors.border }]}>
            <View
              style={[
                styles.progressFill,
                {
                  backgroundColor: theme.colors.primary,
                  width: `${(milestones.filter(m => m.completed).length / milestones.length) * 100}%`,
                },
              ]}
            />
          </View>
        </View>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  milestoneItem: {
    marginBottom: 12,
  },
  milestoneHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkbox: {
    marginRight: 12,
    marginTop: 8,
  },
  milestoneContent: {
    flex: 1,
  },
  milestoneInput: {
    marginBottom: 8,
  },
  dueDateInput: {
    fontSize: 12,
  },
  completedText: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  removeButton: {
    marginLeft: 12,
    marginTop: 8,
  },
  addMilestoneContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  addMilestoneTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  addInput: {
    marginBottom: 8,
  },
  addButton: {
    marginTop: 8,
  },
  progressContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  progressText: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 8,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
});

export default MilestoneForm;
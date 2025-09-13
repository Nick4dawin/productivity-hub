import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../../contexts/ThemeContext';
import { CreateRoutineData } from '../../types';

import Card from '../common/Card';
import Button from '../common/Button';

interface RoutineTemplatesProps {
  visible: boolean;
  onClose: () => void;
  onSelectTemplate: (template: CreateRoutineData) => void;
}

const RoutineTemplates: React.FC<RoutineTemplatesProps> = ({
  visible,
  onClose,
  onSelectTemplate,
}) => {
  const { theme } = useTheme();
  const screenHeight = Dimensions.get('window').height;

  const templates: (CreateRoutineData & { 
    id: string; 
    icon: string; 
    color: string; 
    preview: string[];
  })[] = [
    {
      id: 'morning-energizer',
      name: 'Morning Energizer',
      description: 'Start your day with energy and focus',
      type: 'Morning',
      icon: 'sunny',
      color: '#FF9500',
      preview: [
        'Wake up at 6:00 AM',
        'Drink a glass of water',
        'Do 10 minutes of stretching',
        'Meditate for 5 minutes',
        'Review daily goals',
        'Eat a healthy breakfast',
      ],
      tasks: [],
      habits: [],
    },
    {
      id: 'evening-wind-down',
      name: 'Evening Wind Down',
      description: 'Relax and prepare for restful sleep',
      type: 'Evening',
      icon: 'moon',
      color: '#5856D6',
      preview: [
        'Put away electronic devices',
        'Take a warm shower',
        'Read for 20 minutes',
        'Write in gratitude journal',
        'Do breathing exercises',
        'Set out clothes for tomorrow',
      ],
      tasks: [],
      habits: [],
    },
    {
      id: 'workout-routine',
      name: 'Workout Routine',
      description: 'Complete fitness routine for strength and cardio',
      type: 'Custom',
      icon: 'fitness',
      color: '#34C759',
      preview: [
        '5-minute warm-up',
        '20 minutes strength training',
        '15 minutes cardio',
        '5-minute cool-down',
        'Log workout in app',
        'Drink protein shake',
      ],
      tasks: [],
      habits: [],
    },
    {
      id: 'productivity-boost',
      name: 'Productivity Boost',
      description: 'Maximize focus and get things done',
      type: 'Custom',
      icon: 'rocket',
      color: '#007AFF',
      preview: [
        'Review task list',
        'Set 3 priority tasks',
        'Use Pomodoro technique',
        'Take regular breaks',
        'Clear workspace',
        'Plan next day',
      ],
      tasks: [],
      habits: [],
    },
    {
      id: 'self-care-sunday',
      name: 'Self-Care Sunday',
      description: 'Dedicate time to personal wellness',
      type: 'Custom',
      icon: 'heart',
      color: '#FF3B30',
      preview: [
        'Sleep in (no alarm)',
        'Enjoy leisurely breakfast',
        'Take a relaxing bath',
        'Do a face mask',
        'Call a friend or family',
        'Meal prep for the week',
      ],
      tasks: [],
      habits: [],
    },
    {
      id: 'study-session',
      name: 'Study Session',
      description: 'Focused learning and skill development',
      type: 'Custom',
      icon: 'book',
      color: '#8E8E93',
      preview: [
        'Gather study materials',
        'Review previous notes',
        'Study new material (45 min)',
        'Take 15-minute break',
        'Practice problems',
        'Summarize key points',
      ],
      tasks: [],
      habits: [],
    },
  ];

  const handleSelectTemplate = (template: CreateRoutineData) => {
    onSelectTemplate(template);
  };

  const renderTemplate = (template: typeof templates[0]) => (
    <Card key={template.id} style={styles.templateCard}>
      <View style={styles.templateHeader}>
        <View style={[styles.iconContainer, { backgroundColor: template.color }]}>
          <Ionicons name={template.icon as any} size={24} color="white" />
        </View>
        <View style={styles.templateInfo}>
          <Text style={[styles.templateName, { color: theme.colors.text }]}>
            {template.name}
          </Text>
          <Text style={[styles.templateDescription, { color: theme.colors.textSecondary }]}>
            {template.description}
          </Text>
          <View style={styles.templateType}>
            <Text style={[styles.typeLabel, { color: template.color }]}>
              {template.type} Routine
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.previewContainer}>
        <Text style={[styles.previewTitle, { color: theme.colors.text }]}>
          What's included:
        </Text>
        {template.preview.slice(0, 4).map((item, index) => (
          <View key={index} style={styles.previewItem}>
            <Ionicons name="checkmark" size={14} color={theme.colors.success} />
            <Text style={[styles.previewText, { color: theme.colors.textSecondary }]}>
              {item}
            </Text>
          </View>
        ))}
        {template.preview.length > 4 && (
          <Text style={[styles.moreItems, { color: theme.colors.textSecondary }]}>
            +{template.preview.length - 4} more steps
          </Text>
        )}
      </View>

      <Button
        title="Use This Template"
        onPress={() => handleSelectTemplate(template)}
        style={styles.selectButton}
      />
    </Card>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            Routine Templates
          </Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={theme.colors.text} />
          </TouchableOpacity>
        </View>

        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          Choose a template to get started quickly, or create your own custom routine
        </Text>

        <ScrollView 
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {templates.map(renderTemplate)}
          
          <Card style={styles.customCard}>
            <View style={styles.customContent}>
              <Ionicons name="add-circle-outline" size={48} color={theme.colors.primary} />
              <Text style={[styles.customTitle, { color: theme.colors.text }]}>
                Create Custom Routine
              </Text>
              <Text style={[styles.customDescription, { color: theme.colors.textSecondary }]}>
                Build your own routine from scratch with personalized tasks and habits
              </Text>
              <Button
                title="Start from Scratch"
                onPress={onClose}
                variant="outline"
                style={styles.customButton}
              />
            </View>
          </Card>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 22,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  templateCard: {
    marginBottom: 16,
    padding: 20,
  },
  templateHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  templateInfo: {
    flex: 1,
  },
  templateName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  templateDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  templateType: {
    alignSelf: 'flex-start',
  },
  typeLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  previewContainer: {
    marginBottom: 20,
  },
  previewTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  previewItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  previewText: {
    fontSize: 12,
    marginLeft: 8,
    flex: 1,
  },
  moreItems: {
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 4,
    marginLeft: 22,
  },
  selectButton: {
    marginTop: 8,
  },
  customCard: {
    marginTop: 16,
    padding: 32,
  },
  customContent: {
    alignItems: 'center',
  },
  customTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  customDescription: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  customButton: {
    minWidth: 160,
  },
});

export default RoutineTemplates;
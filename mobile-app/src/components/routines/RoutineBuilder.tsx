import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { Ionicons } from '@expo/vector-icons';
import DraggableFlatList, {
  RenderItemParams,
  ScaleDecorator,
} from 'react-native-draggable-flatlist';

import { useTheme } from '../../contexts/ThemeContext';
import { useTodos } from '../../hooks/useTodos';
import { useHabits } from '../../hooks/useHabits';
import { CreateRoutineData, Routine, Todo, Habit } from '../../types';

import Input from '../common/Input';
import Button from '../common/Button';
import Card from '../common/Card';

interface RoutineBuilderProps {
  initialData?: Routine;
  onSubmit: (data: CreateRoutineData) => void;
  isLoading?: boolean;
}

interface FormData {
  name: string;
  description: string;
  type: Routine['type'];
}

interface RoutineStep {
  id: string;
  type: 'task' | 'habit' | 'custom';
  title: string;
  description?: string;
  duration?: number;
  originalId?: string;
}

const RoutineBuilder: React.FC<RoutineBuilderProps> = ({
  initialData,
  onSubmit,
  isLoading = false,
}) => {
  const { theme } = useTheme();
  const { data: todos = [] } = useTodos();
  const { data: habits = [] } = useHabits();

  const [steps, setSteps] = useState<RoutineStep[]>([]);
  const [showAddStep, setShowAddStep] = useState(false);
  const [newStepTitle, setNewStepTitle] = useState('');
  const [newStepDescription, setNewStepDescription] = useState('');
  const [newStepDuration, setNewStepDuration] = useState('');

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<FormData>({
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      type: initialData?.type || 'Custom',
    },
    mode: 'onChange',
  });

  const routineTypes: Routine['type'][] = ['Morning', 'Evening', 'Custom'];

  const addTodoToRoutine = (todo: Todo) => {
    const newStep: RoutineStep = {
      id: `todo-${todo._id}-${Date.now()}`,
      type: 'task',
      title: todo.title,
      originalId: todo._id,
    };
    setSteps([...steps, newStep]);
  };

  const addHabitToRoutine = (habit: Habit) => {
    const newStep: RoutineStep = {
      id: `habit-${habit._id}-${Date.now()}`,
      type: 'habit',
      title: habit.name,
      originalId: habit._id,
    };
    setSteps([...steps, newStep]);
  };

  const addCustomStep = () => {
    if (!newStepTitle.trim()) {
      Alert.alert('Error', 'Please enter a step title');
      return;
    }

    const newStep: RoutineStep = {
      id: `custom-${Date.now()}`,
      type: 'custom',
      title: newStepTitle.trim(),
      description: newStepDescription.trim() || undefined,
      duration: newStepDuration ? parseInt(newStepDuration) : undefined,
    };

    setSteps([...steps, newStep]);
    setNewStepTitle('');
    setNewStepDescription('');
    setNewStepDuration('');
    setShowAddStep(false);
  };

  const removeStep = (stepId: string) => {
    setSteps(steps.filter(step => step.id !== stepId));
  };

  const renderStep = ({ item, drag, isActive }: RenderItemParams<RoutineStep>) => {
    const getStepIcon = (type: RoutineStep['type']) => {
      switch (type) {
        case 'task':
          return 'checkmark-circle-outline';
        case 'habit':
          return 'repeat-outline';
        default:
          return 'ellipse-outline';
      }
    };

    const getStepColor = (type: RoutineStep['type']) => {
      switch (type) {
        case 'task':
          return theme.colors.primary;
        case 'habit':
          return theme.colors.success;
        default:
          return theme.colors.textSecondary;
      }
    };

    return (
      <ScaleDecorator>
        <Card style={[styles.stepCard, isActive && styles.activeStep]}>
          <View style={styles.stepContent}>
            <TouchableOpacity onLongPress={drag} style={styles.dragHandle}>
              <Ionicons name="reorder-three" size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
            
            <View style={styles.stepInfo}>
              <View style={styles.stepHeader}>
                <Ionicons
                  name={getStepIcon(item.type)}
                  size={20}
                  color={getStepColor(item.type)}
                />
                <Text style={[styles.stepTitle, { color: theme.colors.text }]}>
                  {item.title}
                </Text>
              </View>
              
              {item.description && (
                <Text style={[styles.stepDescription, { color: theme.colors.textSecondary }]}>
                  {item.description}
                </Text>
              )}
              
              {item.duration && (
                <Text style={[styles.stepDuration, { color: theme.colors.textSecondary }]}>
                  Duration: {item.duration} minutes
                </Text>
              )}
            </View>

            <TouchableOpacity
              onPress={() => removeStep(item.id)}
              style={styles.removeButton}
            >
              <Ionicons name="close" size={20} color={theme.colors.error} />
            </TouchableOpacity>
          </View>
        </Card>
      </ScaleDecorator>
    );
  };

  const onFormSubmit = (data: FormData) => {
    if (steps.length === 0) {
      Alert.alert('Error', 'Please add at least one step to your routine');
      return;
    }

    const routineData: CreateRoutineData = {
      ...data,
      tasks: steps.filter(s => s.type === 'task' && s.originalId).map(s => s.originalId!),
      habits: steps.filter(s => s.type === 'habit' && s.originalId).map(s => s.originalId!),
    };

    onSubmit(routineData);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Basic Info */}
      <Card style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Routine Details
        </Text>
        
        <Controller
          control={control}
          name="name"
          rules={{
            required: 'Routine name is required',
            minLength: {
              value: 3,
              message: 'Name must be at least 3 characters',
            },
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              placeholder="Enter routine name"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.name?.message}
              style={styles.input}
            />
          )}
        />

        <Controller
          control={control}
          name="description"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              placeholder="Describe your routine (optional)"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              multiline
              numberOfLines={3}
              style={styles.input}
            />
          )}
        />

        <Text style={[styles.fieldLabel, { color: theme.colors.text }]}>
          Routine Type
        </Text>
        <Controller
          control={control}
          name="type"
          render={({ field: { onChange, value } }) => (
            <View style={styles.typeContainer}>
              {routineTypes.map((type) => (
                <Button
                  key={type}
                  title={type}
                  variant={value === type ? 'primary' : 'outline'}
                  onPress={() => onChange(type)}
                  style={styles.typeButton}
                />
              ))}
            </View>
          )}
        />
      </Card>

      {/* Routine Steps */}
      <Card style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Routine Steps
        </Text>
        <Text style={[styles.sectionDescription, { color: theme.colors.textSecondary }]}>
          Drag and drop to reorder steps. Long press to move items.
        </Text>

        {steps.length > 0 ? (
          <DraggableFlatList
            data={steps}
            renderItem={renderStep}
            keyExtractor={(item) => item.id}
            onDragEnd={({ data }) => setSteps(data)}
            scrollEnabled={false}
          />
        ) : (
          <View style={styles.emptySteps}>
            <Ionicons name="list-outline" size={48} color={theme.colors.textSecondary} />
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
              No steps added yet
            </Text>
          </View>
        )}
      </Card>

      {/* Add Steps */}
      <Card style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Add Steps
        </Text>

        {/* Add from existing todos */}
        {todos.length > 0 && (
          <View style={styles.addSection}>
            <Text style={[styles.addSectionTitle, { color: theme.colors.text }]}>
              From Your Tasks
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {todos.slice(0, 10).map((todo) => (
                <TouchableOpacity
                  key={todo._id}
                  onPress={() => addTodoToRoutine(todo)}
                  style={[styles.addItem, { borderColor: theme.colors.primary }]}
                >
                  <Ionicons name="checkmark-circle-outline" size={16} color={theme.colors.primary} />
                  <Text style={[styles.addItemText, { color: theme.colors.text }]} numberOfLines={2}>
                    {todo.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Add from existing habits */}
        {habits.length > 0 && (
          <View style={styles.addSection}>
            <Text style={[styles.addSectionTitle, { color: theme.colors.text }]}>
              From Your Habits
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {habits.slice(0, 10).map((habit) => (
                <TouchableOpacity
                  key={habit._id}
                  onPress={() => addHabitToRoutine(habit)}
                  style={[styles.addItem, { borderColor: theme.colors.success }]}
                >
                  <Ionicons name="repeat-outline" size={16} color={theme.colors.success} />
                  <Text style={[styles.addItemText, { color: theme.colors.text }]} numberOfLines={2}>
                    {habit.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Add custom step */}
        <View style={styles.addSection}>
          <Text style={[styles.addSectionTitle, { color: theme.colors.text }]}>
            Custom Step
          </Text>
          
          {!showAddStep ? (
            <Button
              title="Add Custom Step"
              variant="outline"
              onPress={() => setShowAddStep(true)}
              style={styles.addCustomButton}
            />
          ) : (
            <View style={styles.customStepForm}>
              <Input
                placeholder="Step title"
                value={newStepTitle}
                onChangeText={setNewStepTitle}
                style={styles.customInput}
              />
              <Input
                placeholder="Description (optional)"
                value={newStepDescription}
                onChangeText={setNewStepDescription}
                style={styles.customInput}
              />
              <Input
                placeholder="Duration in minutes (optional)"
                value={newStepDuration}
                onChangeText={setNewStepDuration}
                keyboardType="numeric"
                style={styles.customInput}
              />
              <View style={styles.customActions}>
                <Button
                  title="Cancel"
                  variant="outline"
                  onPress={() => setShowAddStep(false)}
                  style={styles.customActionButton}
                />
                <Button
                  title="Add Step"
                  onPress={addCustomStep}
                  style={styles.customActionButton}
                />
              </View>
            </View>
          )}
        </View>
      </Card>

      {/* Submit Button */}
      <View style={styles.submitContainer}>
        <Button
          title={initialData ? 'Update Routine' : 'Create Routine'}
          onPress={handleSubmit(onFormSubmit)}
          loading={isLoading}
          disabled={!isValid || isLoading}
          style={styles.submitButton}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 16,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  input: {
    marginBottom: 12,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  typeContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  typeButton: {
    flex: 1,
  },
  stepCard: {
    marginBottom: 8,
    padding: 12,
  },
  activeStep: {
    opacity: 0.8,
    transform: [{ scale: 1.02 }],
  },
  stepContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dragHandle: {
    marginRight: 12,
    padding: 4,
  },
  stepInfo: {
    flex: 1,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
    flex: 1,
  },
  stepDescription: {
    fontSize: 12,
    marginLeft: 28,
    marginBottom: 2,
  },
  stepDuration: {
    fontSize: 12,
    marginLeft: 28,
    fontStyle: 'italic',
  },
  removeButton: {
    marginLeft: 12,
    padding: 4,
  },
  emptySteps: {
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 14,
    marginTop: 8,
  },
  addSection: {
    marginBottom: 20,
  },
  addSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  addItem: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginRight: 8,
    minWidth: 120,
    maxWidth: 150,
    alignItems: 'center',
  },
  addItemText: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  },
  addCustomButton: {
    alignSelf: 'flex-start',
  },
  customStepForm: {
    marginTop: 8,
  },
  customInput: {
    marginBottom: 8,
  },
  customActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  customActionButton: {
    flex: 1,
  },
  submitContainer: {
    marginTop: 16,
    marginBottom: 32,
  },
  submitButton: {
    marginHorizontal: 0,
  },
});

export default RoutineBuilder;
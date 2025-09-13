import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';

import { useTheme } from '../../contexts/ThemeContext';
import { CreateGoalData, Goal } from '../../types';

import Input from '../common/Input';
import Button from '../common/Button';
import Card from '../common/Card';
import MilestoneForm from './MilestoneForm';

interface GoalFormProps {
  initialData?: Goal;
  onSubmit: (data: CreateGoalData) => void;
  isLoading?: boolean;
}

interface FormData {
  title: string;
  specific: string;
  measurable: string;
  achievable: string;
  relevant: string;
  timeBound: string;
  status: Goal['status'];
}

const GoalForm: React.FC<GoalFormProps> = ({
  initialData,
  onSubmit,
  isLoading = false,
}) => {
  const { theme } = useTheme();
  const [milestones, setMilestones] = useState(initialData?.milestones || []);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    watch,
  } = useForm<FormData>({
    defaultValues: {
      title: initialData?.title || '',
      specific: initialData?.specific || '',
      measurable: initialData?.measurable || '',
      achievable: initialData?.achievable || '',
      relevant: initialData?.relevant || '',
      timeBound: initialData?.timeBound || '',
      status: initialData?.status || 'Not Started',
    },
    mode: 'onChange',
  });

  const statusOptions: Goal['status'][] = ['Not Started', 'In Progress', 'Completed', 'On Hold'];

  const onFormSubmit = (data: FormData) => {
    const goalData: CreateGoalData = {
      ...data,
      milestones: milestones.map(m => ({
        title: m.title,
        completed: m.completed,
        dueDate: m.dueDate,
      })),
    };

    onSubmit(goalData);
  };

  const validateSMARTGoal = () => {
    const formData = watch();
    const missingFields = [];

    if (!formData.specific?.trim()) missingFields.push('Specific');
    if (!formData.measurable?.trim()) missingFields.push('Measurable');
    if (!formData.achievable?.trim()) missingFields.push('Achievable');
    if (!formData.relevant?.trim()) missingFields.push('Relevant');
    if (!formData.timeBound?.trim()) missingFields.push('Time-bound');

    if (missingFields.length > 0) {
      Alert.alert(
        'Incomplete SMART Goal',
        `Please fill in the following sections to make this a complete SMART goal:\n\n${missingFields.join(', ')}`,
        [{ text: 'OK' }]
      );
      return false;
    }

    return true;
  };

  const handleFormSubmit = () => {
    if (validateSMARTGoal()) {
      handleSubmit(onFormSubmit)();
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Card style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Goal Title
        </Text>
        <Controller
          control={control}
          name="title"
          rules={{
            required: 'Goal title is required',
            minLength: {
              value: 3,
              message: 'Title must be at least 3 characters',
            },
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              placeholder="Enter your goal title"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.title?.message}
            />
          )}
        />
      </Card>

      <Card style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          SMART Goal Framework
        </Text>
        <Text style={[styles.sectionDescription, { color: theme.colors.textSecondary }]}>
          Define your goal using the SMART criteria for better success
        </Text>

        {/* Specific */}
        <View style={styles.smartField}>
          <Text style={[styles.smartLabel, { color: theme.colors.primary }]}>
            Specific
          </Text>
          <Text style={[styles.smartDescription, { color: theme.colors.textSecondary }]}>
            What exactly do you want to accomplish?
          </Text>
          <Controller
            control={control}
            name="specific"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                placeholder="Be specific about what you want to achieve"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                multiline
                numberOfLines={3}
              />
            )}
          />
        </View>

        {/* Measurable */}
        <View style={styles.smartField}>
          <Text style={[styles.smartLabel, { color: theme.colors.primary }]}>
            Measurable
          </Text>
          <Text style={[styles.smartDescription, { color: theme.colors.textSecondary }]}>
            How will you measure progress and success?
          </Text>
          <Controller
            control={control}
            name="measurable"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                placeholder="Define metrics and milestones"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                multiline
                numberOfLines={3}
              />
            )}
          />
        </View>

        {/* Achievable */}
        <View style={styles.smartField}>
          <Text style={[styles.smartLabel, { color: theme.colors.primary }]}>
            Achievable
          </Text>
          <Text style={[styles.smartDescription, { color: theme.colors.textSecondary }]}>
            Is this goal realistic and attainable?
          </Text>
          <Controller
            control={control}
            name="achievable"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                placeholder="Explain why this goal is achievable"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                multiline
                numberOfLines={3}
              />
            )}
          />
        </View>

        {/* Relevant */}
        <View style={styles.smartField}>
          <Text style={[styles.smartLabel, { color: theme.colors.primary }]}>
            Relevant
          </Text>
          <Text style={[styles.smartDescription, { color: theme.colors.textSecondary }]}>
            Why is this goal important to you?
          </Text>
          <Controller
            control={control}
            name="relevant"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                placeholder="Describe the relevance and importance"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                multiline
                numberOfLines={3}
              />
            )}
          />
        </View>

        {/* Time-bound */}
        <View style={styles.smartField}>
          <Text style={[styles.smartLabel, { color: theme.colors.primary }]}>
            Time-bound
          </Text>
          <Text style={[styles.smartDescription, { color: theme.colors.textSecondary }]}>
            When do you want to achieve this goal?
          </Text>
          <Controller
            control={control}
            name="timeBound"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                placeholder="Set a deadline and timeline"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                multiline
                numberOfLines={3}
              />
            )}
          />
        </View>
      </Card>

      {/* Status */}
      <Card style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Goal Status
        </Text>
        <Controller
          control={control}
          name="status"
          render={({ field: { onChange, value } }) => (
            <View style={styles.statusContainer}>
              {statusOptions.map((status) => (
                <Button
                  key={status}
                  title={status}
                  variant={value === status ? 'primary' : 'outline'}
                  onPress={() => onChange(status)}
                  style={styles.statusButton}
                />
              ))}
            </View>
          )}
        />
      </Card>

      {/* Milestones */}
      <MilestoneForm
        milestones={milestones}
        onMilestonesChange={setMilestones}
      />

      {/* Submit Button */}
      <View style={styles.submitContainer}>
        <Button
          title={initialData ? 'Update Goal' : 'Create Goal'}
          onPress={handleFormSubmit}
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
  smartField: {
    marginBottom: 20,
  },
  smartLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  smartDescription: {
    fontSize: 12,
    marginBottom: 8,
    fontStyle: 'italic',
  },
  statusContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusButton: {
    flex: 1,
    minWidth: '45%',
  },
  submitContainer: {
    marginTop: 16,
    marginBottom: 32,
  },
  submitButton: {
    marginHorizontal: 0,
  },
});

export default GoalForm;
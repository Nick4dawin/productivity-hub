import React from 'react';
import {
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

import { useCreateGoal } from '../../hooks/useGoals';
import { useTheme } from '../../contexts/ThemeContext';
import { CreateGoalData } from '../../types';

import Header from '../../components/common/Header';
import GoalForm from '../../components/goals/GoalForm';

const AddGoalScreen: React.FC = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const createGoalMutation = useCreateGoal();

  const handleSubmit = async (data: CreateGoalData) => {
    try {
      await createGoalMutation.mutateAsync(data);
      Alert.alert(
        'Success',
        'Goal created successfully!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      Alert.alert(
        'Error',
        'Failed to create goal. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Header 
        title="Create Goal" 
        showBackButton
        onBackPress={() => navigation.goBack()}
      />
      
      <GoalForm
        onSubmit={handleSubmit}
        isLoading={createGoalMutation.isPending}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default AddGoalScreen;
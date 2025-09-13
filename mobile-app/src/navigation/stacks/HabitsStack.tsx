import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { HabitsScreen } from '@/screens/habits/HabitsScreen';
import { HabitDetailScreen } from '@/screens/habits/HabitDetailScreen';
import { AddHabitScreen } from '@/screens/habits/AddHabitScreen';
import { HabitAnalyticsScreen } from '@/screens/habits/HabitAnalyticsScreen';

export type HabitsStackParamList = {
  Habits: undefined;
  HabitDetail: {
    habitId: string;
  };
  AddHabit: undefined;
  HabitAnalytics: undefined;
};

const Stack = createNativeStackNavigator<HabitsStackParamList>();

export const HabitsStack: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Habits" component={HabitsScreen} />
      <Stack.Screen name="HabitDetail" component={HabitDetailScreen} />
      <Stack.Screen name="AddHabit" component={AddHabitScreen} />
      <Stack.Screen name="HabitAnalytics" component={HabitAnalyticsScreen} />
    </Stack.Navigator>
  );
};
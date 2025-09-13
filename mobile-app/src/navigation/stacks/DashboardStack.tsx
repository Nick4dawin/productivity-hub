import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { DashboardScreen } from '@/screens/dashboard/DashboardScreen';
import { AnalyticsDetailScreen } from '@/screens/dashboard/AnalyticsDetailScreen';

export type DashboardStackParamList = {
  Dashboard: undefined;
  AnalyticsDetail: {
    type: 'habits' | 'mood' | 'finance' | 'productivity';
  };
};

const Stack = createNativeStackNavigator<DashboardStackParamList>();

export const DashboardStack: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Dashboard" component={DashboardScreen} />
      <Stack.Screen name="AnalyticsDetail" component={AnalyticsDetailScreen} />
    </Stack.Navigator>
  );
};
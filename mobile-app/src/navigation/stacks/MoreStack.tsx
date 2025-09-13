import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { MoreScreen } from '@/screens/more/MoreScreen';
import { GoalsScreen } from '@/screens/goals/GoalsScreen';
import { RoutinesScreen } from '@/screens/routines/RoutinesScreen';
import { MediaScreen } from '@/screens/media/MediaScreen';
import { AddMediaScreen } from '@/screens/media/AddMediaScreen';
import { MediaDetailScreen } from '@/screens/media/MediaDetailScreen';
import { MediaAnalyticsScreen } from '@/screens/media/MediaAnalyticsScreen';
import { FinanceScreen } from '@/screens/finance/FinanceScreen';
import { CoachScreen } from '@/screens/coach/CoachScreen';
import { MoodScreen } from '@/screens/mood/MoodScreen';
import { SettingsScreen } from '@/screens/settings/SettingsScreen';
import { ProfileScreen } from '@/screens/settings/ProfileScreen';
import { ChangePasswordScreen } from '@/screens/settings/ChangePasswordScreen';
import { DeleteAccountScreen } from '@/screens/settings/DeleteAccountScreen';
import { DataManagementScreen } from '@/screens/settings/DataManagementScreen';

export type MoreStackParamList = {
  More: undefined;
  Goals: undefined;
  Routines: undefined;
  Media: undefined;
  AddMedia: undefined;
  MediaDetail: { media: any };
  MediaAnalytics: undefined;
  Finance: undefined;
  Coach: undefined;
  Mood: undefined;
  Settings: undefined;
  Profile: undefined;
  ChangePassword: undefined;
  DeleteAccount: undefined;
  DataManagement: undefined;
};

const Stack = createNativeStackNavigator<MoreStackParamList>();

export const MoreStack: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="More" component={MoreScreen} />
      <Stack.Screen name="Goals" component={GoalsScreen} />
      <Stack.Screen name="Routines" component={RoutinesScreen} />
      <Stack.Screen name="Media" component={MediaScreen} />
      <Stack.Screen name="AddMedia" component={AddMediaScreen} />
      <Stack.Screen name="MediaDetail" component={MediaDetailScreen} />
      <Stack.Screen name="MediaAnalytics" component={MediaAnalyticsScreen} />
      <Stack.Screen name="Finance" component={FinanceScreen} />
      <Stack.Screen name="Coach" component={CoachScreen} />
      <Stack.Screen name="Mood" component={MoodScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
      <Stack.Screen name="DeleteAccount" component={DeleteAccountScreen} />
      <Stack.Screen name="DataManagement" component={DataManagementScreen} />
    </Stack.Navigator>
  );
};
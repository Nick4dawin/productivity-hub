import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { JournalScreen } from '@/screens/journal/JournalScreen';
import { JournalEntryScreen } from '@/screens/journal/JournalEntryScreen';
import { JournalAnalysisScreen } from '@/screens/journal/JournalAnalysisScreen';

export type JournalStackParamList = {
  Journal: undefined;
  JournalEntry: {
    entryId?: string;
  };
  JournalAnalysis: {
    entryId: string;
  };
};

const Stack = createNativeStackNavigator<JournalStackParamList>();

export const JournalStack: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Journal" component={JournalScreen} />
      <Stack.Screen name="JournalEntry" component={JournalEntryScreen} />
      <Stack.Screen name="JournalAnalysis" component={JournalAnalysisScreen} />
    </Stack.Navigator>
  );
};
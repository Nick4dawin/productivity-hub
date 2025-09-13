import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { useTheme } from '@/contexts/ThemeContext';
import { DashboardStack } from './stacks/DashboardStack';
import { HabitsStack } from './stacks/HabitsStack';
import { JournalStack } from './stacks/JournalStack';
import { TodosStack } from './stacks/TodosStack';
import { MoreStack } from './stacks/MoreStack';

export type MainTabParamList = {
  DashboardTab: undefined;
  HabitsTab: undefined;
  JournalTab: undefined;
  TodosTab: undefined;
  MoreTab: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

export const MainTabNavigator: React.FC = () => {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          switch (route.name) {
            case 'DashboardTab':
              iconName = 'dashboard';
              break;
            case 'HabitsTab':
              iconName = 'check-circle';
              break;
            case 'JournalTab':
              iconName = 'book';
              break;
            case 'TodosTab':
              iconName = 'list';
              break;
            case 'MoreTab':
              iconName = 'more-horiz';
              break;
            default:
              iconName = 'circle';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      })}
    >
      <Tab.Screen
        name="DashboardTab"
        component={DashboardStack}
        options={{ tabBarLabel: 'Dashboard' }}
      />
      <Tab.Screen
        name="HabitsTab"
        component={HabitsStack}
        options={{ tabBarLabel: 'Habits' }}
      />
      <Tab.Screen
        name="JournalTab"
        component={JournalStack}
        options={{ tabBarLabel: 'Journal' }}
      />
      <Tab.Screen
        name="TodosTab"
        component={TodosStack}
        options={{ tabBarLabel: 'Todos' }}
      />
      <Tab.Screen
        name="MoreTab"
        component={MoreStack}
        options={{ tabBarLabel: 'More' }}
      />
    </Tab.Navigator>
  );
};
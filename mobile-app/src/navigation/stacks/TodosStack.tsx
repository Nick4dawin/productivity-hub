import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { TodosScreen } from '@/screens/todos/TodosScreen';
import { AddTodoScreen } from '@/screens/todos/AddTodoScreen';

export type TodosStackParamList = {
  Todos: undefined;
  AddTodo: undefined;
};

const Stack = createNativeStackNavigator<TodosStackParamList>();

export const TodosStack: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Todos" component={TodosScreen} />
      <Stack.Screen name="AddTodo" component={AddTodoScreen} />
    </Stack.Navigator>
  );
};
import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider } from '../contexts/AuthContext';
import { ThemeProvider } from '../contexts/ThemeContext';
import { OfflineProvider } from '../contexts/OfflineContext';

// Mock data generators
export const mockUser = {
  _id: 'user123',
  email: 'test@example.com',
  name: 'Test User',
  profilePicture: 'https://example.com/avatar.jpg',
};

export const mockHabit = {
  _id: 'habit123',
  name: 'Morning Exercise',
  category: 'Health',
  completedDates: ['2024-01-01', '2024-01-02'],
  streak: 2,
  color: '#007AFF',
};

export const mockTodo = {
  _id: 'todo123',
  title: 'Complete project',
  completed: false,
  dueDate: '2024-01-15',
  priority: 'high' as const,
  category: 'Work',
};

export const mockJournalEntry = {
  _id: 'journal123',
  title: 'Great Day',
  content: 'Today was amazing!',
  category: 'Personal',
  date: '2024-01-01',
  analysis: {
    summary: 'Positive entry',
    sentiment: 'positive',
    keywords: ['amazing', 'great'],
    suggestions: ['Keep it up!'],
    insights: 'User is in a good mood',
  },
};

export const mockGoal = {
  _id: 'goal123',
  title: 'Learn React Native',
  description: 'Master mobile development',
  category: 'Learning',
  targetDate: '2024-06-01',
  progress: 50,
  milestones: [
    { id: '1', title: 'Setup environment', completed: true },
    { id: '2', title: 'Build first app', completed: false },
  ],
};

// Test providers wrapper
interface AllProvidersProps {
  children: React.ReactNode;
  initialAuthState?: {
    user: typeof mockUser | null;
    isAuthenticated: boolean;
  };
}

const AllProviders: React.FC<AllProvidersProps> = ({ 
  children, 
  initialAuthState = { user: mockUser, isAuthenticated: true } 
}) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: Infinity,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <NavigationContainer>
        <ThemeProvider>
          <AuthProvider initialState={initialAuthState}>
            <OfflineProvider>
              {children}
            </OfflineProvider>
          </AuthProvider>
        </ThemeProvider>
      </NavigationContainer>
    </QueryClientProvider>
  );
};

// Custom render function
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'> & {
    initialAuthState?: AllProvidersProps['initialAuthState'];
  }
) => {
  const { initialAuthState, ...renderOptions } = options || {};
  
  return render(ui, {
    wrapper: ({ children }) => (
      <AllProviders initialAuthState={initialAuthState}>
        {children}
      </AllProviders>
    ),
    ...renderOptions,
  });
};

// Mock navigation
export const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
  reset: jest.fn(),
  setParams: jest.fn(),
  dispatch: jest.fn(),
  setOptions: jest.fn(),
  isFocused: jest.fn(() => true),
  canGoBack: jest.fn(() => true),
  getId: jest.fn(),
  getParent: jest.fn(),
  getState: jest.fn(),
};

export const mockRoute = {
  key: 'test-route',
  name: 'TestScreen',
  params: {},
};

// Mock API responses
export const mockApiResponses = {
  login: {
    token: 'mock-jwt-token',
    user: mockUser,
  },
  habits: [mockHabit],
  todos: [mockTodo],
  journalEntries: [mockJournalEntry],
  goals: [mockGoal],
};

// Test helpers
export const waitForLoadingToFinish = () => 
  new Promise(resolve => setTimeout(resolve, 0));

export const createMockApiService = () => ({
  login: jest.fn().mockResolvedValue(mockApiResponses.login),
  register: jest.fn().mockResolvedValue(mockApiResponses.login),
  getHabits: jest.fn().mockResolvedValue(mockApiResponses.habits),
  createHabit: jest.fn().mockResolvedValue(mockHabit),
  toggleHabitDate: jest.fn().mockResolvedValue(mockHabit),
  getTodos: jest.fn().mockResolvedValue(mockApiResponses.todos),
  createTodo: jest.fn().mockResolvedValue(mockTodo),
  updateTodo: jest.fn().mockResolvedValue(mockTodo),
  getJournalEntries: jest.fn().mockResolvedValue(mockApiResponses.journalEntries),
  createJournalEntry: jest.fn().mockResolvedValue(mockJournalEntry),
  getGoals: jest.fn().mockResolvedValue(mockApiResponses.goals),
  createGoal: jest.fn().mockResolvedValue(mockGoal),
});

// Performance testing helpers
export const measureRenderTime = async (renderFn: () => void) => {
  const start = performance.now();
  renderFn();
  const end = performance.now();
  return end - start;
};

export const expectRenderTimeUnder = async (
  renderFn: () => void, 
  maxTime: number
) => {
  const renderTime = await measureRenderTime(renderFn);
  expect(renderTime).toBeLessThan(maxTime);
};

// Re-export everything from testing library
export * from '@testing-library/react-native';
export { customRender as render };
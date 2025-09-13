# Design Document

## Overview

This design document outlines the architecture and implementation approach for converting the existing Next.js productivity hub application into a React Native mobile application. The design maintains feature parity while optimizing for mobile user experience and native platform capabilities.

The conversion will use React Native with TypeScript, implementing a modular architecture that mirrors the existing web application structure while adapting to mobile-specific patterns and navigation paradigms.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    React Native App                          │
├─────────────────────────────────────────────────────────────┤
│  Presentation Layer                                         │
│  ├── Screens (Dashboard, Habits, Journal, etc.)            │
│  ├── Components (Reusable UI components)                   │
│  └── Navigation (Tab/Stack navigators)                     │
├─────────────────────────────────────────────────────────────┤
│  State Management Layer                                     │
│  ├── Context Providers (Auth, Theme, etc.)                 │
│  ├── React Query (API state management)                    │
│  └── AsyncStorage (Local persistence)                      │
├─────────────────────────────────────────────────────────────┤
│  Service Layer                                              │
│  ├── API Services (HTTP client, endpoints)                 │
│  ├── Authentication Service                                │
│  ├── Offline Storage Service                               │
│  └── Notification Service                                  │
├─────────────────────────────────────────────────────────────┤
│  Platform Layer                                            │
│  ├── Native Modules (Camera, Notifications, etc.)         │
│  ├── Device APIs (Haptics, Keychain, etc.)                │
│  └── Platform-specific implementations                     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                 Existing Backend API                        │
│  (No changes required - same endpoints)                     │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

- **Framework**: React Native 0.73+
- **Language**: TypeScript
- **Navigation**: React Navigation 6
- **State Management**: React Context + React Query
- **UI Library**: React Native Elements + Custom components
- **Storage**: AsyncStorage + React Native Keychain
- **HTTP Client**: Axios
- **Authentication**: React Native Google Signin
- **Notifications**: React Native Push Notification
- **Charts**: Victory Native
- **Forms**: React Hook Form
- **Testing**: Jest + React Native Testing Library

## Components and Interfaces

### Navigation Structure

```typescript
// Navigation hierarchy
AppNavigator
├── AuthStack (when not authenticated)
│   ├── LoginScreen
│   ├── RegisterScreen
│   └── OnboardingScreen
└── MainTabNavigator (when authenticated)
    ├── DashboardStack
    │   ├── DashboardScreen
    │   └── AnalyticsDetailScreen
    ├── HabitsStack
    │   ├── HabitsScreen
    │   ├── HabitDetailScreen
    │   └── AddHabitScreen
    ├── JournalStack
    │   ├── JournalScreen
    │   ├── JournalEntryScreen
    │   └── JournalAnalysisScreen
    ├── TodosStack
    │   ├── TodosScreen
    │   └── AddTodoScreen
    └── MoreStack
        ├── MoreScreen
        ├── GoalsScreen
        ├── RoutinesScreen
        ├── MediaScreen
        ├── FinanceScreen
        ├── CoachScreen
        └── SettingsScreen
```

### Core Component Architecture

#### Screen Components
```typescript
interface BaseScreenProps {
  navigation: NavigationProp<any>;
  route: RouteProp<any>;
}

// Example screen structure
const DashboardScreen: React.FC<BaseScreenProps> = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <Header title="Dashboard" />
      <ScrollView refreshControl={<RefreshControl />}>
        <QuickStats />
        <RecentActivity />
        <UpcomingTasks />
      </ScrollView>
    </SafeAreaView>
  );
};
```

#### Reusable Components
```typescript
// Component library structure
components/
├── common/
│   ├── Button/
│   ├── Input/
│   ├── Card/
│   ├── Header/
│   └── LoadingSpinner/
├── forms/
│   ├── HabitForm/
│   ├── TodoForm/
│   ├── JournalForm/
│   └── GoalForm/
├── lists/
│   ├── HabitList/
│   ├── TodoList/
│   ├── JournalList/
│   └── MediaList/
└── charts/
    ├── MoodChart/
    ├── HabitChart/
    └── FinanceChart/
```

### API Service Layer

```typescript
// API service structure matching existing endpoints
class ApiService {
  private baseURL: string;
  private authToken: string | null;

  // Authentication
  async login(credentials: LoginCredentials): Promise<AuthResponse>
  async register(userData: RegisterData): Promise<AuthResponse>
  async refreshToken(): Promise<string>

  // Habits
  async getHabits(): Promise<Habit[]>
  async createHabit(habit: CreateHabitData): Promise<Habit>
  async toggleHabitDate(id: string, date: string): Promise<Habit>

  // Journal
  async getJournalEntries(): Promise<JournalEntry[]>
  async createJournalEntry(entry: CreateJournalData): Promise<JournalEntry>
  async analyzeJournalEntry(id: string): Promise<JournalAnalysis>

  // [Additional methods for all existing endpoints]
}
```

### State Management Design

#### Context Providers
```typescript
// Auth Context
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

// Theme Context
interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  colors: ColorScheme;
}

// Offline Context
interface OfflineContextType {
  isOnline: boolean;
  pendingSync: SyncItem[];
  syncData: () => Promise<void>;
}
```

#### React Query Integration
```typescript
// Query hooks for data fetching
const useHabits = () => {
  return useQuery({
    queryKey: ['habits'],
    queryFn: () => apiService.getHabits(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

const useCreateHabit = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: apiService.createHabit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
    },
  });
};
```

## Data Models

### Core Data Types (Matching existing API)

```typescript
// User and Authentication
interface User {
  _id: string;
  email: string;
  name: string;
  profilePicture?: string;
  preferences?: UserPreferences;
}

interface AuthResponse {
  token: string;
  user: User;
}

// Habits
interface Habit {
  _id: string;
  name: string;
  category: string;
  completedDates: string[];
  streak: number;
  color?: string;
}

// Journal
interface JournalEntry {
  _id: string;
  title: string;
  content: string;
  category: string;
  date: string;
  analysis?: JournalAnalysis;
  mood?: ExtractedMood;
}

interface JournalAnalysis {
  summary: string;
  sentiment: string;
  keywords: string[];
  suggestions: string[];
  insights: string;
}

// Todos
interface Todo {
  _id: string;
  title: string;
  completed: boolean;
  dueDate?: string;
  priority: 'low' | 'medium' | 'high';
  category: string;
}

// [Additional interfaces matching existing API types]
```

### Mobile-Specific Data Models

```typescript
// Offline sync
interface SyncItem {
  id: string;
  type: 'create' | 'update' | 'delete';
  endpoint: string;
  data: any;
  timestamp: number;
}

// App state
interface AppState {
  isFirstLaunch: boolean;
  lastSyncTime: number;
  notificationSettings: NotificationSettings;
  cacheSettings: CacheSettings;
}

// Navigation state
interface NavigationState {
  currentTab: string;
  screenHistory: string[];
}
```

## Error Handling

### Error Handling Strategy

```typescript
// Centralized error handling
class ErrorHandler {
  static handle(error: Error, context: string) {
    // Log error
    console.error(`Error in ${context}:`, error);
    
    // Show user-friendly message
    if (error instanceof NetworkError) {
      showToast('Network error. Please check your connection.');
    } else if (error instanceof AuthError) {
      // Redirect to login
      navigationRef.navigate('Login');
    } else {
      showToast('Something went wrong. Please try again.');
    }
    
    // Report to crash analytics (if implemented)
    crashlytics().recordError(error);
  }
}

// Error boundaries for React components
class ErrorBoundary extends React.Component {
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    ErrorHandler.handle(error, 'React Component');
  }
}
```

### Network Error Handling

```typescript
// API client with retry logic
class ApiClient {
  async request(config: RequestConfig) {
    try {
      return await this.axiosInstance.request(config);
    } catch (error) {
      if (error.code === 'NETWORK_ERROR') {
        // Queue for offline sync
        await this.queueForSync(config);
        throw new OfflineError('Request queued for sync');
      }
      throw error;
    }
  }
}
```

## Testing Strategy

### Testing Pyramid

```
┌─────────────────────────────────────┐
│           E2E Tests (10%)           │  ← Detox
├─────────────────────────────────────┤
│       Integration Tests (20%)       │  ← React Native Testing Library
├─────────────────────────────────────┤
│         Unit Tests (70%)            │  ← Jest
└─────────────────────────────────────┘
```

### Test Structure

```typescript
// Unit tests for utilities and services
describe('ApiService', () => {
  it('should authenticate user successfully', async () => {
    const mockResponse = { token: 'abc123', user: mockUser };
    mockAxios.post.mockResolvedValue({ data: mockResponse });
    
    const result = await apiService.login(mockCredentials);
    expect(result).toEqual(mockResponse);
  });
});

// Component tests
describe('HabitList', () => {
  it('should render habits correctly', () => {
    const { getByText } = render(
      <HabitList habits={mockHabits} onToggle={mockToggle} />
    );
    
    expect(getByText('Morning Exercise')).toBeTruthy();
  });
});

// Integration tests
describe('Habit Flow', () => {
  it('should create and display new habit', async () => {
    const { getByText, getByPlaceholderText } = render(<HabitsScreen />);
    
    fireEvent.press(getByText('Add Habit'));
    fireEvent.changeText(getByPlaceholderText('Habit name'), 'New Habit');
    fireEvent.press(getByText('Save'));
    
    await waitFor(() => {
      expect(getByText('New Habit')).toBeTruthy();
    });
  });
});
```

## Mobile UI/UX Design Patterns

### Design System

```typescript
// Theme configuration
const theme = {
  colors: {
    primary: '#007AFF',
    secondary: '#5856D6',
    success: '#34C759',
    warning: '#FF9500',
    error: '#FF3B30',
    background: '#F2F2F7',
    surface: '#FFFFFF',
    text: '#000000',
    textSecondary: '#8E8E93',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  typography: {
    h1: { fontSize: 28, fontWeight: 'bold' },
    h2: { fontSize: 22, fontWeight: '600' },
    body: { fontSize: 16, fontWeight: 'normal' },
    caption: { fontSize: 12, fontWeight: 'normal' },
  },
};
```

### Mobile-Optimized Components

```typescript
// Touch-friendly components
const TouchableCard: React.FC<CardProps> = ({ children, onPress }) => (
  <TouchableOpacity
    style={styles.card}
    onPress={onPress}
    activeOpacity={0.7}
    accessibilityRole="button"
  >
    {children}
  </TouchableOpacity>
);

// Swipe gestures for list items
const SwipeableListItem: React.FC<SwipeableProps> = ({ 
  children, 
  onSwipeLeft, 
  onSwipeRight 
}) => (
  <Swipeable
    renderLeftActions={() => <DeleteAction onPress={onSwipeLeft} />}
    renderRightActions={() => <EditAction onPress={onSwipeRight} />}
  >
    {children}
  </Swipeable>
);
```

### Navigation Patterns

```typescript
// Bottom tab navigation for main sections
const MainTabs = createBottomTabNavigator();

const MainTabNavigator = () => (
  <MainTabs.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        const iconName = getTabIcon(route.name);
        return <Icon name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: theme.colors.primary,
      tabBarInactiveTintColor: theme.colors.textSecondary,
    })}
  >
    <MainTabs.Screen name="Dashboard" component={DashboardStack} />
    <MainTabs.Screen name="Habits" component={HabitsStack} />
    <MainTabs.Screen name="Journal" component={JournalStack} />
    <MainTabs.Screen name="Todos" component={TodosStack} />
    <MainTabs.Screen name="More" component={MoreStack} />
  </MainTabs.Navigator>
);
```

## Performance Optimization

### Rendering Optimization

```typescript
// Memoized components for list performance
const HabitItem = React.memo<HabitItemProps>(({ habit, onToggle }) => (
  <TouchableCard onPress={() => onToggle(habit._id)}>
    <Text>{habit.name}</Text>
    <Switch value={habit.completedToday} onValueChange={onToggle} />
  </TouchableCard>
));

// Virtualized lists for large datasets
const HabitList: React.FC<HabitListProps> = ({ habits }) => (
  <FlatList
    data={habits}
    renderItem={({ item }) => <HabitItem habit={item} />}
    keyExtractor={(item) => item._id}
    getItemLayout={(data, index) => ({
      length: ITEM_HEIGHT,
      offset: ITEM_HEIGHT * index,
      index,
    })}
    removeClippedSubviews={true}
    maxToRenderPerBatch={10}
    windowSize={10}
  />
);
```

### Image and Asset Optimization

```typescript
// Optimized image loading
const OptimizedImage: React.FC<ImageProps> = ({ source, ...props }) => (
  <FastImage
    source={{
      uri: source,
      priority: FastImage.priority.normal,
      cache: FastImage.cacheControl.immutable,
    }}
    resizeMode={FastImage.resizeMode.cover}
    {...props}
  />
);
```

## Offline Capabilities

### Offline Storage Strategy

```typescript
// Offline data management
class OfflineManager {
  async cacheData(key: string, data: any) {
    await AsyncStorage.setItem(key, JSON.stringify({
      data,
      timestamp: Date.now(),
      version: 1,
    }));
  }

  async getCachedData(key: string, maxAge: number = 24 * 60 * 60 * 1000) {
    const cached = await AsyncStorage.getItem(key);
    if (!cached) return null;

    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp > maxAge) return null;

    return data;
  }

  async queueSync(operation: SyncOperation) {
    const queue = await this.getSyncQueue();
    queue.push(operation);
    await AsyncStorage.setItem('syncQueue', JSON.stringify(queue));
  }
}
```

### Sync Strategy

```typescript
// Background sync when online
class SyncManager {
  async syncPendingOperations() {
    const queue = await this.getSyncQueue();
    
    for (const operation of queue) {
      try {
        await this.executeOperation(operation);
        await this.removeFromQueue(operation.id);
      } catch (error) {
        console.error('Sync failed for operation:', operation.id);
        // Keep in queue for retry
      }
    }
  }

  async executeOperation(operation: SyncOperation) {
    switch (operation.type) {
      case 'CREATE_HABIT':
        return await apiService.createHabit(operation.data);
      case 'UPDATE_TODO':
        return await apiService.updateTodo(operation.id, operation.data);
      // Handle all operation types
    }
  }
}
```

## Security Considerations

### Secure Storage

```typescript
// Secure token storage
import { Keychain } from 'react-native-keychain';

class SecureStorage {
  async storeToken(token: string) {
    await Keychain.setInternetCredentials(
      'app_auth_token',
      'user',
      token
    );
  }

  async getToken(): Promise<string | null> {
    try {
      const credentials = await Keychain.getInternetCredentials('app_auth_token');
      return credentials ? credentials.password : null;
    } catch (error) {
      return null;
    }
  }

  async clearToken() {
    await Keychain.resetInternetCredentials('app_auth_token');
  }
}
```

### API Security

```typescript
// Request interceptors for security
apiClient.interceptors.request.use((config) => {
  // Add auth token
  const token = await SecureStorage.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Add request signing (if needed)
  config.headers['X-Request-ID'] = generateRequestId();
  
  return config;
});

// Response interceptors for token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired, try to refresh
      try {
        await authService.refreshToken();
        return apiClient.request(error.config);
      } catch (refreshError) {
        // Redirect to login
        navigationRef.navigate('Login');
      }
    }
    return Promise.reject(error);
  }
);
```

This design provides a comprehensive foundation for converting the Next.js productivity hub into a React Native mobile application while maintaining all existing functionality and optimizing for mobile user experience.
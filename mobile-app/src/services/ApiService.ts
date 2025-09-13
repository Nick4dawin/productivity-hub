import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import NetInfo from '@react-native-community/netinfo';
import { SecureStorage } from './SecureStorage';
import { networkManager } from './NetworkManager';
import { offlineManager } from './OfflineManager';
import { errorHandler } from './ErrorHandler';
import {
  ApiResponse,
  AuthResponse,
  LoginCredentials,
  RegisterData,
  User,
  Habit,
  CreateHabitData,
  Todo,
  CreateTodoData,
  Mood,
  CreateMoodData,
  JournalEntry,
  CreateJournalData,
  JournalAnalysis,
  Goal,
  CreateGoalData,
  Routine,
  CreateRoutineData,
  Media,
  CreateMediaData,
  Account,
  FinanceEntry,
  Budget,
  Subscription,
  ChatMessage,
  CoachData,
  AnalyticsData,
  HabitAnalytics,
  MoodAnalytics,
  ProductivityAnalytics,
  ApiError,
  NetworkError,
  AuthError,
  OfflineError,
  SyncItem,
} from '@/types';

/**
 * API Service class for handling all HTTP requests with authentication
 * Includes automatic token management, request/response interceptors, and offline support
 */
export class ApiService {
  private static instance: ApiService;
  private axiosInstance: AxiosInstance;
  private baseURL: string;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value?: any) => void;
    reject: (error?: any) => void;
  }> = [];

  private constructor() {
    // Use environment variable or default to localhost for development
    // For Android emulator, use 10.0.2.2 instead of localhost
    this.baseURL = __DEV__ 
      ? 'http://10.0.2.2:5000' 
      : 'https://productivity-hub-p1rc.onrender.com';

    this.axiosInstance = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (this.axiosInstance) {
      this.setupInterceptors();
    }
  }

  /**
   * Get singleton instance of ApiService
   */
  public static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  /**
   * Setup request and response interceptors
   */
  private setupInterceptors(): void {
    // Request interceptor - add auth token
    this.axiosInstance.interceptors.request.use(
      async (config) => {
        // Check network connectivity
        const netInfo = await NetInfo.fetch();
        if (!netInfo.isConnected) {
          throw new NetworkError('No internet connection');
        }

        // Add auth token if available
        const token = await SecureStorage.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Add request ID for tracking
        config.headers['X-Request-ID'] = this.generateRequestId();

        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor - handle token refresh and error reporting
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // Add breadcrumb for API error
        errorHandler.addBreadcrumb(
          `API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url}`,
          'api_error'
        );

        // Handle network errors
        if (!error.response) {
          const networkError = new NetworkError('Network request failed');
          errorHandler.handleApiError(error, {
            screen: 'api_service',
            action: 'network_request',
          });
          throw networkError;
        }

        // Handle 401 errors with token refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            // If already refreshing, queue the request
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            }).then((token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return this.axiosInstance(originalRequest);
            }).catch((err) => {
              return Promise.reject(err);
            });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            const refreshToken = await SecureStorage.getRefreshToken();
            if (!refreshToken) {
              throw new AuthError('No refresh token available');
            }

            const newToken = await this.refreshToken(refreshToken);
            await SecureStorage.storeToken(newToken);

            // Process failed queue
            this.processQueue(null, newToken);

            // Retry original request
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return this.axiosInstance(originalRequest);
          } catch (refreshError) {
            this.processQueue(refreshError, null);
            await this.clearAuthData();
            
            const authError = new AuthError('Session expired. Please login again.');
            errorHandler.handleError(authError, {
              context: {
                screen: 'api_service',
                action: 'token_refresh_failed',
              },
              showUserMessage: false, // Let the auth context handle this
            });
            
            throw authError;
          } finally {
            this.isRefreshing = false;
          }
        }

        // Handle other API errors and report them
        const apiError = new ApiError(
          error.response?.data?.message || error.message,
          error.response?.status || 500,
          error.response?.data?.code
        );

        // Report API error to error handler
        errorHandler.handleApiError(error, {
          screen: 'api_service',
          action: `${error.config?.method?.toUpperCase()}_${error.config?.url}`,
        });

        return Promise.reject(apiError);
      }
    );
  }

  /**
   * Process queued requests after token refresh
   */
  private processQueue(error: any, token: string | null): void {
    this.failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else {
        resolve(token);
      }
    });

    this.failedQueue = [];
  }

  /**
   * Generate unique request ID
   */
  private generateRequestId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Clear all authentication data
   */
  private async clearAuthData(): Promise<void> {
    await SecureStorage.clearAll();
  }

  /**
   * Make HTTP request with error handling and offline support
   */
  private async request<T>(config: AxiosRequestConfig): Promise<T> {
    // Check network connectivity
    const isOnline = networkManager.isOnline();
    
    // For GET requests, try cache first when offline
    if (!isOnline && config.method?.toUpperCase() === 'GET') {
      const cacheKey = this.getCacheKey(config);
      const cachedData = await offlineManager.getCachedData<T>(cacheKey);
      
      if (cachedData !== null) {
        return cachedData;
      }
      
      throw new Error('No cached data available offline');
    }

    try {
      const response: AxiosResponse<ApiResponse<T>> = await this.axiosInstance(config);
      
      if (response.data.success === false) {
        throw new ApiError(
          response.data.message || 'API request failed',
          response.status
        );
      }

      const result = response.data.data || response.data;

      // Cache successful GET responses
      if (config.method?.toUpperCase() === 'GET' && result) {
        const cacheKey = this.getCacheKey(config);
        await offlineManager.cacheData(cacheKey, result, 5 * 60 * 1000); // 5 minutes
      }

      return result;
    } catch (error) {
      // Handle network errors
      if (this.isNetworkError(error)) {
        // Queue write operations for offline sync
        if (['POST', 'PUT', 'DELETE'].includes(config.method?.toUpperCase() || '')) {
          await this.queueForSync(config);
          throw new Error('Request queued for sync when online');
        }
        
        // For GET requests, try to return cached data
        if (config.method?.toUpperCase() === 'GET') {
          const cacheKey = this.getCacheKey(config);
          const cachedData = await offlineManager.getCachedData<T>(cacheKey);
          
          if (cachedData !== null) {
            return cachedData;
          }
        }
      }
      
      throw error;
    }
  }

  /**
   * Generate cache key for request
   */
  private getCacheKey(config: AxiosRequestConfig): string {
    const url = config.url || '';
    const params = config.params ? JSON.stringify(config.params) : '';
    return `api_${url}_${params}`.replace(/[^a-zA-Z0-9_]/g, '_');
  }

  /**
   * Check if error is network-related
   */
  private isNetworkError(error: any): boolean {
    return (
      error.code === 'NETWORK_ERROR' ||
      error.message?.includes('Network Error') ||
      error.message?.includes('timeout') ||
      !networkManager.isOnline()
    );
  }

  /**
   * Queue request for offline sync
   */
  private async queueForSync(config: AxiosRequestConfig): Promise<void> {
    const method = config.method?.toUpperCase() || 'GET';
    let operationType: 'create' | 'update' | 'delete';
    
    switch (method) {
      case 'POST':
        operationType = 'create';
        break;
      case 'PUT':
      case 'PATCH':
        operationType = 'update';
        break;
      case 'DELETE':
        operationType = 'delete';
        break;
      default:
        return; // Don't queue GET requests
    }

    await offlineManager.queueSync({
      type: operationType,
      endpoint: config.url || '',
      data: config.data,
    });
  }

  /**
   * Get operation type from HTTP method
   */
  private getOperationType(method: string): 'create' | 'update' | 'delete' {
    switch (method) {
      case 'POST':
        return 'create';
      case 'PUT':
      case 'PATCH':
        return 'update';
      case 'DELETE':
        return 'delete';
      default:
        return 'create';
    }
  }

  // Authentication Methods

  /**
   * Login user with email and password
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>({
      method: 'POST',
      url: '/api/auth/login',
      data: credentials,
    });

    // Store tokens securely
    await SecureStorage.storeToken(response.token);
    await SecureStorage.storeUserData(JSON.stringify(response.user));

    return response;
  }

  /**
   * Register new user
   */
  async register(userData: RegisterData): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>({
      method: 'POST',
      url: '/api/auth/register',
      data: userData,
    });

    // Store tokens securely
    await SecureStorage.storeToken(response.token);
    await SecureStorage.storeUserData(JSON.stringify(response.user));

    return response;
  }

  /**
   * Google OAuth login
   */
  async googleLogin(googleToken: string): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>({
      method: 'POST',
      url: '/api/auth/google',
      data: { token: googleToken },
    });

    // Store tokens securely
    await SecureStorage.storeToken(response.token);
    await SecureStorage.storeUserData(JSON.stringify(response.user));

    return response;
  }

  /**
   * Refresh authentication token
   */
  async refreshToken(refreshToken: string): Promise<string> {
    const response = await this.request<{ token: string }>({
      method: 'POST',
      url: '/api/auth/refresh',
      data: { refreshToken },
    });

    return response.token;
  }

  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<User> {
    return this.request<User>({
      method: 'GET',
      url: '/api/auth/me',
    });
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      await this.request({
        method: 'POST',
        url: '/api/auth/logout',
      });
    } catch (error) {
      // Continue with logout even if API call fails
      console.warn('Logout API call failed:', error);
    } finally {
      await this.clearAuthData();
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(profileData: Partial<User>): Promise<User> {
    return this.request<User>({
      method: 'PUT',
      url: '/api/auth/profile',
      data: profileData,
    });
  }

  /**
   * Change user password
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    return this.request<void>({
      method: 'PUT',
      url: '/api/auth/password',
      data: {
        currentPassword,
        newPassword,
      },
    });
  }

  /**
   * Delete user account permanently
   */
  async deleteUserAccount(password: string): Promise<void> {
    return this.request<void>({
      method: 'DELETE',
      url: '/api/auth/account',
      data: {
        password,
      },
    });
  }

  // Habit Methods

  /**
   * Get all habits for current user
   */
  async getHabits(): Promise<Habit[]> {
    return this.request<Habit[]>({
      method: 'GET',
      url: '/api/habits',
    });
  }

  /**
   * Create new habit
   */
  async createHabit(habitData: CreateHabitData): Promise<Habit> {
    return this.request<Habit>({
      method: 'POST',
      url: '/api/habits',
      data: habitData,
    });
  }

  /**
   * Update habit
   */
  async updateHabit(id: string, habitData: Partial<CreateHabitData>): Promise<Habit> {
    return this.request<Habit>({
      method: 'PUT',
      url: `/api/habits/${id}`,
      data: habitData,
    });
  }

  /**
   * Delete habit
   */
  async deleteHabit(id: string): Promise<void> {
    return this.request<void>({
      method: 'DELETE',
      url: `/api/habits/${id}`,
    });
  }

  /**
   * Toggle habit completion for specific date
   */
  async toggleHabitDate(id: string, date: string): Promise<Habit> {
    return this.request<Habit>({
      method: 'POST',
      url: `/api/habits/${id}/toggle`,
      data: { date },
    });
  }

  // Todo Methods

  /**
   * Get all todos for current user
   */
  async getTodos(): Promise<Todo[]> {
    return this.request<Todo[]>({
      method: 'GET',
      url: '/api/todos',
    });
  }

  /**
   * Create new todo
   */
  async createTodo(todoData: CreateTodoData): Promise<Todo> {
    return this.request<Todo>({
      method: 'POST',
      url: '/api/todos',
      data: todoData,
    });
  }

  /**
   * Update todo
   */
  async updateTodo(id: string, todoData: Partial<CreateTodoData>): Promise<Todo> {
    return this.request<Todo>({
      method: 'PUT',
      url: `/api/todos/${id}`,
      data: todoData,
    });
  }

  /**
   * Delete todo
   */
  async deleteTodo(id: string): Promise<void> {
    return this.request<void>({
      method: 'DELETE',
      url: `/api/todos/${id}`,
    });
  }

  /**
   * Toggle todo completion
   */
  async toggleTodo(id: string): Promise<Todo> {
    return this.request<Todo>({
      method: 'PUT',
      url: `/api/todos/${id}/toggle`,
    });
  }

  // Mood Methods

  /**
   * Get all moods for current user
   */
  async getMoods(): Promise<Mood[]> {
    return this.request<Mood[]>({
      method: 'GET',
      url: '/api/moods',
    });
  }

  /**
   * Create new mood entry
   */
  async createMood(moodData: CreateMoodData): Promise<Mood> {
    return this.request<Mood>({
      method: 'POST',
      url: '/api/moods',
      data: moodData,
    });
  }

  /**
   * Update mood entry
   */
  async updateMood(id: string, moodData: Partial<CreateMoodData>): Promise<Mood> {
    return this.request<Mood>({
      method: 'PUT',
      url: `/api/moods/${id}`,
      data: moodData,
    });
  }

  /**
   * Delete mood entry
   */
  async deleteMood(id: string): Promise<void> {
    return this.request<void>({
      method: 'DELETE',
      url: `/api/moods/${id}`,
    });
  }

  // Journal Methods

  /**
   * Get all journal entries for current user
   */
  async getJournalEntries(): Promise<JournalEntry[]> {
    return this.request<JournalEntry[]>({
      method: 'GET',
      url: '/api/journal',
    });
  }

  /**
   * Create new journal entry
   */
  async createJournalEntry(entryData: CreateJournalData): Promise<JournalEntry> {
    return this.request<JournalEntry>({
      method: 'POST',
      url: '/api/journal',
      data: entryData,
    });
  }

  /**
   * Update journal entry
   */
  async updateJournalEntry(id: string, entryData: Partial<CreateJournalData>): Promise<JournalEntry> {
    return this.request<JournalEntry>({
      method: 'PUT',
      url: `/api/journal/${id}`,
      data: entryData,
    });
  }

  /**
   * Delete journal entry
   */
  async deleteJournalEntry(id: string): Promise<void> {
    return this.request<void>({
      method: 'DELETE',
      url: `/api/journal/${id}`,
    });
  }

  /**
   * Analyze journal entry with AI
   */
  async analyzeJournalEntry(id: string): Promise<JournalAnalysis> {
    return this.request<JournalAnalysis>({
      method: 'POST',
      url: `/api/journal/${id}/analyze`,
    });
  }

  // Finance API methods
  
  /**
   * Get all accounts for current user
   */
  async getAccounts(): Promise<Account[]> {
    return this.request<Account[]>({
      method: 'GET',
      url: '/api/accounts',
    });
  }

  /**
   * Create a new account
   */
  async createAccount(accountData: Omit<Account, '_id'>): Promise<Account> {
    return this.request<Account>({
      method: 'POST',
      url: '/api/accounts',
      data: accountData,
    });
  }

  /**
   * Update an account
   */
  async updateAccount(id: string, data: Partial<Account>): Promise<Account> {
    return this.request<Account>({
      method: 'PUT',
      url: `/api/accounts/${id}`,
      data,
    });
  }

  /**
   * Delete an account
   */
  async deleteAccount(id: string): Promise<void> {
    return this.request<void>({
      method: 'DELETE',
      url: `/api/accounts/${id}`,
    });
  }

  /**
   * Get finance entries with optional filters
   */
  async getFinanceEntries(filters?: {
    type?: 'income' | 'expense';
    category?: string;
    account?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<FinanceEntry[]> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
    }
    
    return this.request<FinanceEntry[]>({
      method: 'GET',
      url: `/api/finance/entries?${params.toString()}`,
    });
  }

  /**
   * Create a new finance entry
   */
  async createFinanceEntry(entryData: Omit<FinanceEntry, '_id'>): Promise<FinanceEntry> {
    return this.request<FinanceEntry>({
      method: 'POST',
      url: '/api/finance/entries',
      data: entryData,
    });
  }

  /**
   * Update a finance entry
   */
  async updateFinanceEntry(id: string, data: Partial<FinanceEntry>): Promise<FinanceEntry> {
    return this.request<FinanceEntry>({
      method: 'PUT',
      url: `/api/finance/entries/${id}`,
      data,
    });
  }

  /**
   * Delete a finance entry
   */
  async deleteFinanceEntry(id: string): Promise<void> {
    return this.request<void>({
      method: 'DELETE',
      url: `/api/finance/entries/${id}`,
    });
  }

  /**
   * Get all budgets for current user
   */
  async getBudgets(): Promise<Budget[]> {
    return this.request<Budget[]>({
      method: 'GET',
      url: '/api/budgets',
    });
  }

  /**
   * Create a new budget
   */
  async createBudget(budgetData: Omit<Budget, '_id'>): Promise<Budget> {
    return this.request<Budget>({
      method: 'POST',
      url: '/api/budgets',
      data: budgetData,
    });
  }

  /**
   * Update a budget
   */
  async updateBudget(id: string, data: Partial<Budget>): Promise<Budget> {
    return this.request<Budget>({
      method: 'PUT',
      url: `/api/budgets/${id}`,
      data,
    });
  }

  /**
   * Delete a budget
   */
  async deleteBudget(id: string): Promise<void> {
    return this.request<void>({
      method: 'DELETE',
      url: `/api/budgets/${id}`,
    });
  }

  /**
   * Get all subscriptions for current user
   */
  async getSubscriptions(): Promise<Subscription[]> {
    return this.request<Subscription[]>({
      method: 'GET',
      url: '/api/subscriptions',
    });
  }

  /**
   * Create a new subscription
   */
  async createSubscription(subscriptionData: Omit<Subscription, '_id'>): Promise<Subscription> {
    return this.request<Subscription>({
      method: 'POST',
      url: '/api/subscriptions',
      data: subscriptionData,
    });
  }

  /**
   * Update a subscription
   */
  async updateSubscription(id: string, data: Partial<Subscription>): Promise<Subscription> {
    return this.request<Subscription>({
      method: 'PUT',
      url: `/api/subscriptions/${id}`,
      data,
    });
  }

  /**
   * Delete a subscription
   */
  async deleteSubscription(id: string): Promise<void> {
    return this.request<void>({
      method: 'DELETE',
      url: `/api/subscriptions/${id}`,
    });
  }

  /**
   * Get finance analytics
   */
  async getFinanceAnalytics(period?: 'week' | 'month' | 'year'): Promise<any> {
    const params = period ? `?period=${period}` : '';
    return this.request<any>({
      method: 'GET',
      url: `/api/finance/analytics${params}`,
    });
  }

  /**
   * Get net worth calculation
   */
  async getNetWorth(): Promise<{ netWorth: number; assets: number; liabilities: number }> {
    return this.request<{ netWorth: number; assets: number; liabilities: number }>({
      method: 'GET',
      url: '/api/finance/net-worth',
    });
  }

  // Additional methods for Goals, Routines, Media, etc. would follow the same pattern...
  // For brevity, I'll add a few key ones:

  /**
   * Get all goals for current user
   */
  async getGoals(): Promise<Goal[]> {
    return this.request<Goal[]>({
      method: 'GET',
      url: '/api/goals',
    });
  }

  /**
   * Create new goal
   */
  async createGoal(goalData: CreateGoalData): Promise<Goal> {
    return this.request<Goal>({
      method: 'POST',
      url: '/api/goals',
      data: goalData,
    });
  }

  /**
   * Update existing goal
   */
  async updateGoal(id: string, goalData: Partial<CreateGoalData>): Promise<Goal> {
    return this.request<Goal>({
      method: 'PUT',
      url: `/api/goals/${id}`,
      data: goalData,
    });
  }

  /**
   * Delete goal
   */
  async deleteGoal(id: string): Promise<void> {
    return this.request<void>({
      method: 'DELETE',
      url: `/api/goals/${id}`,
    });
  }

  /**
   * Update milestone completion status
   */
  async updateMilestone(goalId: string, milestoneId: string, completed: boolean): Promise<Goal> {
    return this.request<Goal>({
      method: 'PUT',
      url: `/api/goals/${goalId}/milestones/${milestoneId}`,
      data: { completed },
    });
  }

  /**
   * Get all routines for current user
   */
  async getRoutines(): Promise<Routine[]> {
    return this.request<Routine[]>({
      method: 'GET',
      url: '/api/routines',
    });
  }

  /**
   * Create new routine
   */
  async createRoutine(routineData: CreateRoutineData): Promise<Routine> {
    return this.request<Routine>({
      method: 'POST',
      url: '/api/routines',
      data: routineData,
    });
  }

  /**
   * Update existing routine
   */
  async updateRoutine(id: string, routineData: Partial<CreateRoutineData>): Promise<Routine> {
    return this.request<Routine>({
      method: 'PUT',
      url: `/api/routines/${id}`,
      data: routineData,
    });
  }

  /**
   * Delete routine
   */
  async deleteRoutine(id: string): Promise<void> {
    return this.request<void>({
      method: 'DELETE',
      url: `/api/routines/${id}`,
    });
  }

  /**
   * Get all media for current user
   */
  async getMedia(): Promise<Media[]> {
    return this.request<Media[]>({
      method: 'GET',
      url: '/api/media',
    });
  }

  /**
   * Create new media entry
   */
  async createMedia(mediaData: CreateMediaData): Promise<Media> {
    return this.request<Media>({
      method: 'POST',
      url: '/api/media',
      data: mediaData,
    });
  }

  /**
   * Update existing media entry
   */
  async updateMedia(id: string, mediaData: Partial<CreateMediaData>): Promise<Media> {
    return this.request<Media>({
      method: 'PUT',
      url: `/api/media/${id}`,
      data: mediaData,
    });
  }

  /**
   * Delete media entry
   */
  async deleteMedia(id: string): Promise<void> {
    return this.request<void>({
      method: 'DELETE',
      url: `/api/media/${id}`,
    });
  }

  /**
   * Search external media APIs
   */
  async searchExternalMedia(query: string, type: 'Movie' | 'TV Show' | 'Book' | 'Game'): Promise<any[]> {
    return this.request<any[]>({
      method: 'GET',
      url: `/api/media/search?q=${encodeURIComponent(query)}&type=${type}`,
    });
  }

  /**
   * Get coach data for AI analysis
   */
  async getCoachData(): Promise<CoachData> {
    return this.request<CoachData>({
      method: 'GET',
      url: '/api/coach/data',
    });
  }

  /**
   * Send message to AI coach
   */
  async sendCoachMessage(message: string): Promise<{ response: string }> {
    return this.request<{ response: string }>({
      method: 'POST',
      url: '/api/coach/chat',
      data: { message },
    });
  }

  /**
   * Get analytics data for dashboard
   */
  async getAnalytics(): Promise<AnalyticsData> {
    return this.request<AnalyticsData>({
      method: 'GET',
      url: '/api/analytics',
    });
  }

  /**
   * Get habit analytics
   */
  async getHabitAnalytics(timeRange: 'week' | 'month' | 'year' = 'month'): Promise<HabitAnalytics> {
    return this.request<HabitAnalytics>({
      method: 'GET',
      url: `/api/analytics/habits?range=${timeRange}`,
    });
  }

  /**
   * Get mood analytics
   */
  async getMoodAnalytics(timeRange: 'week' | 'month' | 'year' = 'month'): Promise<MoodAnalytics> {
    return this.request<MoodAnalytics>({
      method: 'GET',
      url: `/api/analytics/mood?range=${timeRange}`,
    });
  }

  /**
   * Get productivity analytics
   */
  async getProductivityAnalytics(timeRange: 'week' | 'month' | 'year' = 'month'): Promise<ProductivityAnalytics> {
    return this.request<ProductivityAnalytics>({
      method: 'GET',
      url: `/api/analytics/productivity?range=${timeRange}`,
    });
  }

  /**
   * Check API health
   */
  async checkHealth(): Promise<{ status: string; timestamp: string }> {
    return this.request<{ status: string; timestamp: string }>({
      method: 'GET',
      url: '/health',
    });
  }
}

// Export singleton instance
export const apiService = ApiService.getInstance();
// Core data types matching the existing API
export interface User {
  _id: string;
  email: string;
  name: string;
  profilePicture?: string;
  preferences?: UserPreferences;
}

export interface UserPreferences {
  theme: 'light' | 'dark';
  notifications: NotificationSettings;
  privacy: PrivacySettings;
}

export interface NotificationSettings {
  habits: boolean;
  goals: boolean;
  routines: boolean;
  coach: boolean;
}

export interface PrivacySettings {
  analytics: boolean;
  crashReporting: boolean;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
}

// Habit types
export interface Habit {
  _id: string;
  name: string;
  category: string;
  completedDates: string[];
  streak: number;
  color?: string;
}

export interface CreateHabitData {
  name: string;
  category: string;
  color?: string;
}

// Todo types
export interface Todo {
  _id: string;
  title: string;
  completed: boolean;
  dueDate?: string;
  priority: 'low' | 'medium' | 'high';
  category: string;
}

export interface CreateTodoData {
  title: string;
  dueDate?: string;
  priority: 'low' | 'medium' | 'high';
  category: string;
}

// Mood types
export interface Mood {
  _id: string;
  mood: string;
  energy: string;
  activities: string[];
  note: string;
  date: string;
  source?: 'manual' | 'journal_ai';
}

export interface CreateMoodData {
  mood: string;
  energy: string;
  activities: string[];
  note: string;
  date: string;
}

// Journal types
export interface JournalEntry {
  _id: string;
  user: string;
  title: string;
  content: string;
  category: string;
  date: string;
  analysis?: JournalAnalysis;
  createdAt?: string;
  updatedAt?: string;
}

export interface JournalAnalysis {
  summary: string;
  sentiment: string;
  keywords: string[];
  suggestions: string[];
  insights: string;
}

export interface CreateJournalData {
  title: string;
  content: string;
  category: string;
  date: string;
}

// Goal types
export interface Goal {
  _id: string;
  title: string;
  specific?: string;
  measurable?: string;
  achievable?: string;
  relevant?: string;
  timeBound?: string;
  status: 'Not Started' | 'In Progress' | 'Completed' | 'On Hold';
  milestones: Milestone[];
}

export interface Milestone {
  _id: string;
  title: string;
  completed: boolean;
  dueDate?: string;
}

export interface CreateGoalData {
  title: string;
  specific?: string;
  measurable?: string;
  achievable?: string;
  relevant?: string;
  timeBound?: string;
  status: 'Not Started' | 'In Progress' | 'Completed' | 'On Hold';
  milestones?: Omit<Milestone, '_id'>[];
}

// Routine types
export interface Routine {
  _id: string;
  name: string;
  description?: string;
  tasks: Todo[];
  habits: Habit[];
  type: 'Morning' | 'Evening' | 'Custom';
}

export interface CreateRoutineData {
  name: string;
  description?: string;
  tasks?: string[];
  habits?: string[];
  type: 'Morning' | 'Evening' | 'Custom';
}

// Media types
export interface Media {
  _id: string;
  user: string;
  title: string;
  type: 'Movie' | 'TV Show' | 'Book' | 'Game';
  genre?: string;
  status?: 'Completed' | 'In Progress' | 'Planned';
  rating?: number;
  review?: string;
  imageUrl?: string;
  episodesWatched?: number;
  totalEpisodes?: number;
  pagesRead?: number;
  totalPages?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateMediaData {
  title: string;
  type: 'Movie' | 'TV Show' | 'Book' | 'Game';
  genre?: string;
  status?: 'Completed' | 'In Progress' | 'Planned';
  rating?: number;
  review?: string;
  imageUrl?: string;
  episodesWatched?: number;
  totalEpisodes?: number;
  pagesRead?: number;
  totalPages?: number;
}

// Finance types
export interface Account {
  _id: string;
  name: string;
  type: 'Checking' | 'Savings' | 'Investment' | 'Credit Card' | 'Cash' | 'Other';
  balance: number;
}

export interface FinanceEntry {
  _id: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  description?: string;
  date: string;
  account: Account | string;
}

export interface Budget {
  _id: string;
  category: string;
  amount: number;
  period: 'monthly' | 'yearly' | 'weekly';
  description?: string;
  color?: string;
}

export interface Subscription {
  _id: string;
  name: string;
  amount: number;
  billingCycle: 'monthly' | 'yearly' | 'weekly' | 'quarterly';
  category: string;
  nextBillingDate: string;
  description?: string;
  active: boolean;
}

// Coach types
export interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
  timestamp: number;
}

export interface CoachData {
  todos: Todo[];
  completedTasks: Todo[];
  moodLog: Mood[];
  habitProgress: Habit[];
  goals: {
    shortTerm: Goal[];
    longTerm: Goal[];
  };
}

// Mobile-specific types
export interface SyncItem {
  id: string;
  type: 'create' | 'update' | 'delete';
  endpoint: string;
  data: any;
  timestamp: number;
}

export interface AppState {
  isFirstLaunch: boolean;
  lastSyncTime: number;
  notificationSettings: NotificationSettings;
  cacheSettings: CacheSettings;
}

export interface CacheSettings {
  maxAge: number;
  maxSize: number;
  autoCleanup: boolean;
}

// Navigation types
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

export type MainTabParamList = {
  Dashboard: undefined;
  Habits: undefined;
  Journal: undefined;
  Todos: undefined;
  More: undefined;
};

export type MoreStackParamList = {
  MoreHome: undefined;
  Goals: undefined;
  Routines: undefined;
  Media: undefined;
  Finance: undefined;
  Coach: undefined;
  Settings: undefined;
};

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Error types
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class NetworkError extends Error {
  constructor(message: string = 'Network error occurred') {
    super(message);
    this.name = 'NetworkError';
  }
}

export class AuthError extends Error {
  constructor(message: string = 'Authentication failed') {
    super(message);
    this.name = 'AuthError';
  }
}

export class OfflineError extends Error {
  constructor(message: string = 'Operation queued for sync') {
    super(message);
    this.name = 'OfflineError';
  }
}
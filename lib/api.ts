const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

// Types
export type AuthHeaders = Record<string, string>;

// Helper function to get auth token
const getAuthHeaders = async (): Promise<Record<string, string>> => {
  try {
    // In client components, you should use useAuth() hook directly
    // This is a fallback for server components or utils
    const token = localStorage.getItem('token');
    
    if (!token) {
      console.warn("No authentication token available");
      return { 'Content-Type': 'application/json' };
    }
    
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  } catch (error) {
    console.error("Error getting auth headers:", error);
    return { 'Content-Type': 'application/json' };
  }
};

// Types
export interface User {
  _id: string;
  email: string;
  name: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Habit {
  _id: string;
  name: string;
  category: string;
  completedDates: string[];
  streak: number;
}

export interface Todo {
  _id: string;
  title: string;
  completed: boolean;
  dueDate?: string;
  priority: 'low' | 'medium' | 'high';
  category: string;
}

export interface Mood {
  _id: string;
  mood: string;
  energy: string;
  activities: string[];
  note: string;
  date: string;
  source?: 'manual' | 'journal_ai';
}

export interface JournalEntry {
  _id: string;
  user: string;
  title: string;
  content: string;
  category: string;
  date: string;
  analysis?: {
    summary: string;
    sentiment: string;
    keywords: string[];
    suggestions: string[];
    insights: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

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

export interface Routine {
  _id: string;
  name: string;
  description?: string;
  tasks: Todo[];
  habits: Habit[];
  type: 'Morning' | 'Evening' | 'Custom';
}

export interface Milestone {
  _id: string;
  title: string;
  completed: boolean;
  dueDate?: string;
}

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

// Auth API calls
export async function register(data: { email: string; password: string; name: string }): Promise<AuthResponse> {
  console.log('Registering user:', data.email);
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    console.error('Registration failed:', error);
    throw new Error(error.message || 'Registration failed');
  }

  const result = await response.json();
  console.log('Registration successful:', result.user);
  if (typeof window !== 'undefined') {
    localStorage.setItem('token', result.token);
    localStorage.setItem('user', JSON.stringify(result.user));
  }
  return result;
}

export async function login(data: { email: string; password: string }): Promise<AuthResponse> {
  console.log('Logging in user:', data.email);
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    console.error('Login failed:', error);
    throw new Error(error.message || 'Login failed');
  }

  const result = await response.json();
  console.log('Login successful:', result.user);
  if (typeof window !== 'undefined') {
    localStorage.setItem('token', result.token);
    localStorage.setItem('user', JSON.stringify(result.user));
  }
  return result;
}

// Habit API calls
export async function getHabits(): Promise<Habit[]> {
  console.log('Fetching habits');
  const response = await fetch(`${API_BASE_URL}/habits`, {
    headers: await getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    console.error('Failed to fetch habits:', error);
    throw new Error(error.message || 'Failed to fetch habits');
  }

  const data = await response.json();
  console.log('Fetched habits:', data);
  return data;
}

export async function createHabit(data: { name: string; category: string }): Promise<Habit> {
  console.log('Creating habit:', data);
  const response = await fetch(`${API_BASE_URL}/habits`, {
    method: 'POST',
    headers: await getAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    console.error('Failed to create habit:', error);
    throw new Error(error.message || 'Failed to create habit');
  }

  const result = await response.json();
  console.log('Created habit:', result);
  return result;
}

export async function toggleHabitDate(id: string, date: string): Promise<Habit> {
  console.log('Toggling habit date:', { id, date });
  const response = await fetch(`${API_BASE_URL}/habits/${id}/toggle/${date}`, {
    method: 'POST',
    headers: await getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    console.error('Failed to toggle habit:', error);
    throw new Error(error.message || 'Failed to toggle habit');
  }

  const result = await response.json();
  console.log('Toggled habit:', result);
  return result;
}

export async function updateHabit(id: string, data: Partial<Omit<Habit, '_id'>>): Promise<Habit> {
  console.log('Updating habit:', { id, data });
  const response = await fetch(`${API_BASE_URL}/habits/${id}`, {
    method: 'PUT',
    headers: await getAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    console.error('Failed to update habit:', error);
    throw new Error(error.message || 'Failed to update habit');
  }

  const result = await response.json();
  console.log('Updated habit:', result);
  return result;
}

export async function deleteHabit(id: string): Promise<void> {
  console.log('Deleting habit:', id);
  const response = await fetch(`${API_BASE_URL}/habits/${id}`, {
    method: 'DELETE',
    headers: await getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    console.error('Failed to delete habit:', error);
    throw new Error(error.message || 'Failed to delete habit');
  }

  console.log('Deleted habit:', id);
}

// Todo API calls
export async function getTodos(): Promise<Todo[]> {
  console.log('Fetching todos');
  const response = await fetch(`${API_BASE_URL}/todos`, {
    headers: await getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    console.error('Failed to fetch todos:', error);
    throw new Error(error.message || 'Failed to fetch todos');
  }

  const data = await response.json();
  console.log('Fetched todos:', data);
  return data;
}

export async function createTodo(data: Omit<Todo, '_id'>): Promise<Todo> {
  console.log('Creating todo:', data);
  const response = await fetch(`${API_BASE_URL}/todos`, {
    method: 'POST',
    headers: await getAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    console.error('Failed to create todo:', error);
    throw new Error(error.message || 'Failed to create todo');
  }

  const result = await response.json();
  console.log('Created todo:', result);
  return result;
}

export async function updateTodo(id: string, data: Partial<Todo>): Promise<Todo> {
  console.log('Updating todo:', { id, data });
  const response = await fetch(`${API_BASE_URL}/todos/${id}`, {
    method: 'PUT',
    headers: await getAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    console.error('Failed to update todo:', error);
    throw new Error(error.message || 'Failed to update todo');
  }

  const result = await response.json();
  console.log('Updated todo:', result);
  return result;
}

export async function deleteTodo(id: string): Promise<void> {
  console.log('Deleting todo:', id);
  const response = await fetch(`${API_BASE_URL}/todos/${id}`, {
    method: 'DELETE',
    headers: await getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    console.error('Failed to delete todo:', error);
    throw new Error(error.message || 'Failed to delete todo');
  }
  console.log('Deleted todo:', id);
}

// Mood API calls
export async function getMoods(): Promise<Mood[]> {
  console.log('Fetching moods');
  const response = await fetch(`${API_BASE_URL}/moods`, {
    headers: await getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    console.error('Failed to fetch moods:', error);
    throw new Error(error.message || 'Failed to fetch moods');
  }

  const data = await response.json();
  console.log('Fetched moods:', data);
  return data;
}

export async function createMood(data: Omit<Mood, '_id'>): Promise<Mood> {
  console.log('Creating mood:', data);
  const response = await fetch(`${API_BASE_URL}/moods`, {
    method: 'POST',
    headers: await getAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    console.error('Failed to create mood:', error);
    throw new Error(error.message || 'Failed to create mood');
  }

  const result = await response.json();
  console.log('Created mood:', result);
  return result;
}

export async function updateMood(id: string, data: Partial<Mood>): Promise<Mood> {
  console.log('Updating mood:', { id, data });
  const response = await fetch(`${API_BASE_URL}/moods/${id}`, {
    method: 'PUT',
    headers: await getAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    console.error('Failed to update mood:', error);
    throw new Error(error.message || 'Failed to update mood');
  }

  const result = await response.json();
  console.log('Updated mood:', result);
  return result;
}

export async function deleteMood(id: string): Promise<void> {
  console.log('Deleting mood:', id);
  const response = await fetch(`${API_BASE_URL}/moods/${id}`, {
    method: 'DELETE',
    headers: await getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    console.error('Failed to delete mood:', error);
    throw new Error(error.message || 'Failed to delete mood');
  }

  console.log('Deleted mood:', id);
}

// Journal API calls
export async function getJournalEntries(): Promise<JournalEntry[]> {
  console.log('Fetching journal entries');
  const response = await fetch(`${API_BASE_URL}/journal`, {
    headers: await getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    console.error('Failed to fetch journal entries:', error);
    throw new Error(error.message || 'Failed to fetch journal entries');
  }

  const data = await response.json();
  console.log('Fetched journal entries:', data);
  return data;
}

export async function createJournalEntry(data: Omit<JournalEntry, '_id'>): Promise<JournalEntry> {
  console.log('Creating journal entry:', data);
  const response = await fetch(`${API_BASE_URL}/journal`, {
    method: 'POST',
    headers: await getAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    console.error('Failed to create journal entry:', error);
    throw new Error(error.message || 'Failed to create journal entry');
  }

  const result = await response.json();
  console.log('Created journal entry:', result);
  return result;
}

export async function updateJournalEntry(id: string, data: Partial<JournalEntry>): Promise<JournalEntry> {
  console.log('Updating journal entry:', { id, data });
  const response = await fetch(`${API_BASE_URL}/journal/${id}`, {
    method: 'PUT',
    headers: await getAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    console.error('Failed to update journal entry:', error);
    throw new Error(error.message || 'Failed to update journal entry');
  }

  const result = await response.json();
  console.log('Updated journal entry:', result);
  return result;
}

export async function deleteJournalEntry(id: string): Promise<void> {
  console.log('Deleting journal entry:', id);
  const response = await fetch(`${API_BASE_URL}/journal/${id}`, {
    method: 'DELETE',
    headers: await getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    console.error('Failed to delete journal entry:', error);
    throw new Error(error.message || 'Failed to delete journal entry');
  }
  console.log('Deleted journal entry:', id);
}

// Routine API calls
export async function getRoutines(): Promise<Routine[]> {
  console.log('Fetching routines');
  const response = await fetch(`${API_BASE_URL}/routines`, {
    headers: await getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    console.error('Failed to fetch routines:', error);
    throw new Error(error.message || 'Failed to fetch routines');
  }

  const data = await response.json();
  console.log('Fetched routines:', data);
  return data;
}

export async function createRoutine(data: Omit<Routine, '_id' | 'tasks' | 'habits'> & { tasks?: string[], habits?: string[] }): Promise<Routine> {
  console.log('Creating routine:', data);
  const response = await fetch(`${API_BASE_URL}/routines`, {
    method: 'POST',
    headers: await getAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    console.error('Failed to create routine:', error);
    throw new Error(error.message || 'Failed to create routine');
  }

  const result = await response.json();
  console.log('Created routine:', result);
  return result;
}

export async function updateRoutine(id: string, data: Partial<Omit<Routine, '_id' | 'tasks' | 'habits'>> & { tasks?: string[], habits?: string[] }): Promise<Routine> {
  console.log('Updating routine:', id, data);
  const response = await fetch(`${API_BASE_URL}/routines/${id}`, {
    method: 'PUT',
    headers: await getAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    console.error('Failed to update routine:', error);
    throw new Error(error.message || 'Failed to update routine');
  }

  const result = await response.json();
  console.log('Updated routine:', result);
  return result;
}

export async function deleteRoutine(id: string): Promise<void> {
  console.log('Deleting routine:', id);
  const response = await fetch(`${API_BASE_URL}/routines/${id}`, {
    method: 'DELETE',
    headers: await getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    console.error('Failed to delete routine:', error);
    throw new Error(error.message || 'Failed to delete routine');
  }

  console.log('Deleted routine');
}

// Goal API calls
export async function getGoals(): Promise<Goal[]> {
  const response = await fetch(`${API_BASE_URL}/goals`, {
    headers: await getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Failed to fetch goals');
  return response.json();
}

export async function createGoal(data: Omit<Goal, '_id' | 'milestones'> & { milestones?: Omit<Milestone, '_id'>[] }): Promise<Goal> {
  const response = await fetch(`${API_BASE_URL}/goals`, {
    method: 'POST',
    headers: await getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to create goal');
  return response.json();
}

export async function updateGoal(id: string, data: Partial<Omit<Goal, '_id' | 'milestones'>> & { milestones?: Partial<Milestone>[] }): Promise<Goal> {
    const response = await fetch(`${API_BASE_URL}/goals/${id}`, {
    method: 'PUT',
    headers: await getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to update goal');
  return response.json();
}

export async function deleteGoal(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/goals/${id}`, {
    method: 'DELETE',
    headers: await getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Failed to delete goal');
}

// Media API
export async function getMedia(headers?: AuthHeaders): Promise<Media[]> {
  const authHeaders = headers || await getAuthHeaders();
  const res = await fetch(`${API_BASE_URL}/media`, { headers: authHeaders });
  if (!res.ok) throw new Error('Failed to fetch media');
  return res.json();
}

export async function createMedia(mediaData: Partial<Media>, headers?: AuthHeaders): Promise<Media> {
  console.log('➕ Creating media with data:', mediaData);
  const authHeaders = headers || await getAuthHeaders();
  console.log('🔑 Using headers:', !!authHeaders);
  
  const res = await fetch(`${API_BASE_URL}/media`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify(mediaData),
  });
  
  console.log('📡 Create response status:', res.status);
  
  if (!res.ok) {
    console.error('❌ Failed to create media. Status:', res.status);
    const errorText = await res.text();
    console.error('❌ Error response:', errorText);
    throw new Error('Failed to create media entry');
  }
  
  const result = await res.json();
  console.log('✅ Media created successfully:', result);
  return result;
}

export async function updateMedia(id: string, mediaData: Partial<Media>, headers?: AuthHeaders): Promise<Media> {
  console.log('🔄 Updating media with ID:', id);
  console.log('📝 Update data:', mediaData);
  const authHeaders = headers || await getAuthHeaders();
  console.log('🔑 Using headers:', !!authHeaders);
  
  const res = await fetch(`${API_BASE_URL}/media/${id}`, {
    method: 'PUT',
    headers: authHeaders,
    body: JSON.stringify(mediaData),
  });
  
  console.log('📡 Update response status:', res.status);
  
  if (!res.ok) {
    console.error('❌ Failed to update media. Status:', res.status);
    const errorText = await res.text();
    console.error('❌ Error response:', errorText);
    throw new Error('Failed to update media entry');
  }
  
  const result = await res.json();
  console.log('✅ Media updated successfully:', result);
  return result;
}

export async function deleteMedia(headers: AuthHeaders, id: string): Promise<void> {
  console.log('🗑️ Deleting media with ID:', id);
  console.log('🔑 Headers available:', !!headers);
  
  const res = await fetch(`${API_BASE_URL}/media/${id}`, {
    method: 'DELETE',
    headers,
  });
  
  console.log('📡 Delete response status:', res.status);
  
  if (!res.ok) {
    console.error('❌ Failed to delete media entry. Status:', res.status);
    const errorText = await res.text();
    console.error('❌ Error response:', errorText);
    throw new Error('Failed to delete media entry');
  }
  
  console.log('✅ Media deleted successfully');
}

export const searchExternalMedia = async (type: string, query: string, headers?: AuthHeaders) => {
    const url = new URL(`${API_BASE_URL}/media/search`);
    url.searchParams.append('type', type);
    url.searchParams.append('query', query);
    
    const authHeaders = headers || await getAuthHeaders();
    const response = await fetch(url.toString(), {
        method: 'GET',
        headers: authHeaders,
    });
    if (!response.ok) throw new Error('Failed to search external media');
    return response.json();
};

// Account API
export interface Account {
  _id: string;
  name: string;
  type: 'Checking' | 'Savings' | 'Investment' | 'Credit Card' | 'Cash' | 'Other';
  balance: number;
}

export const getAccounts = async (): Promise<Account[]> => {
  const response = await fetch(`${API_BASE_URL}/accounts`, { headers: await getAuthHeaders() });
  const data = await response.json();
  return data;
};

export const createAccount = async (account: Omit<Account, '_id'>): Promise<Account> => {
  const response = await fetch(`${API_BASE_URL}/accounts`, { 
    method: 'POST', 
    headers: await getAuthHeaders(), 
    body: JSON.stringify(account) 
  });
  const data = await response.json();
  return data;
};

export const updateAccount = async (id: string, account: Partial<Account>): Promise<Account> => {
  const response = await fetch(`${API_BASE_URL}/accounts/${id}`, { 
    method: 'PUT', 
    headers: await getAuthHeaders(), 
    body: JSON.stringify(account) 
  });
  const data = await response.json();
  return data;
};

export const deleteAccount = async (id: string): Promise<{ msg: string }> => {
  const response = await fetch(`${API_BASE_URL}/accounts/${id}`, { 
    method: 'DELETE', 
    headers: await getAuthHeaders() 
  });
  const data = await response.json();
  return data;
};

// Finance API
export interface FinanceEntry {
  _id: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  description?: string;
  date: string;
  account: {
    _id: string;
    name: string;
    type: string;
  } | string;
}

export const getFinances = async (): Promise<FinanceEntry[]> => {
  const response = await fetch(`${API_BASE_URL}/finance`, { headers: await getAuthHeaders() });
  const data = await response.json();
  return data;
};

export const createFinance = async (entry: Omit<FinanceEntry, '_id'>): Promise<FinanceEntry> => {
  const response = await fetch(`${API_BASE_URL}/finance`, { 
    method: 'POST', 
    headers: await getAuthHeaders(), 
    body: JSON.stringify(entry) 
  });
  const data = await response.json();
  return data;
};

export const updateFinance = async (id: string, entry: Partial<FinanceEntry>): Promise<FinanceEntry> => {
  const response = await fetch(`${API_BASE_URL}/finance/${id}`, { 
    method: 'PUT', 
    headers: await getAuthHeaders(), 
    body: JSON.stringify(entry) 
  });
  const data = await response.json();
  return data;
};

export const deleteFinance = async (id: string): Promise<{ msg: string }> => {
  const response = await fetch(`${API_BASE_URL}/finance/${id}`, { 
    method: 'DELETE', 
    headers: await getAuthHeaders() 
  });
  const data = await response.json();
  return data;
};

// Subscription API
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

export const getSubscriptions = async (): Promise<Subscription[]> => {
  const response = await fetch(`${API_BASE_URL}/subscriptions`, { headers: await getAuthHeaders() });
  const data = await response.json();
  return data;
};

export const createSubscription = async (subscription: Omit<Subscription, '_id'>): Promise<Subscription> => {
  const response = await fetch(`${API_BASE_URL}/subscriptions`, { 
    method: 'POST', 
    headers: await getAuthHeaders(), 
    body: JSON.stringify(subscription) 
  });
  const data = await response.json();
  return data;
};

export const updateSubscription = async (id: string, subscription: Partial<Subscription>): Promise<Subscription> => {
  const response = await fetch(`${API_BASE_URL}/subscriptions/${id}`, { 
    method: 'PUT', 
    headers: await getAuthHeaders(), 
    body: JSON.stringify(subscription) 
  });
  const data = await response.json();
  return data;
};

export const deleteSubscription = async (id: string): Promise<{ msg: string }> => {
  const response = await fetch(`${API_BASE_URL}/subscriptions/${id}`, { 
    method: 'DELETE', 
    headers: await getAuthHeaders() 
  });
  const data = await response.json();
  return data;
};

// Budget API
export interface Budget {
  _id: string;
  category: string;
  amount: number;
  period: 'monthly' | 'yearly' | 'weekly';
  description?: string;
  color?: string;
}

export const getBudgets = async (): Promise<Budget[]> => {
  const response = await fetch(`${API_BASE_URL}/budgets`, { headers: await getAuthHeaders() });
  const data = await response.json();
  return data;
};

export const createBudget = async (budget: Omit<Budget, '_id'>): Promise<Budget> => {
  const response = await fetch(`${API_BASE_URL}/budgets`, { 
    method: 'POST', 
    headers: await getAuthHeaders(), 
    body: JSON.stringify(budget) 
  });
  const data = await response.json();
  return data;
};

export const updateBudget = async (id: string, budget: Partial<Budget>): Promise<Budget> => {
  const response = await fetch(`${API_BASE_URL}/budgets/${id}`, { 
    method: 'PUT', 
    headers: await getAuthHeaders(), 
    body: JSON.stringify(budget) 
  });
  const data = await response.json();
  return data;
};

export const deleteBudget = async (id: string): Promise<{ msg: string }> => {
  const response = await fetch(`${API_BASE_URL}/budgets/${id}`, {
    method: 'DELETE',
    headers: await getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Failed to delete budget');
  return await response.json();
};

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

// Coach API
export const getCoachSummary = async (data: CoachData): Promise<{ summary: string }> => {
  console.log('Getting coach summary for data:', data);
  const response = await fetch(`${API_BASE_URL}/coach/summary`, {
    method: 'POST',
    headers: await getAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    console.error('Failed to get coach summary:', error);
    throw new Error(error.message || 'Failed to get coach summary');
  }

  const result = await response.json();
  console.log('Got coach summary:', result);
  return result;
};

export interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
}

export const getCoachResponse = async (messages: ChatMessage[]): Promise<{ response: string }> => {
  console.log('Getting coach response for messages:', messages);
  const response = await fetch(`${API_BASE_URL}/coach/chat`, {
    method: 'POST',
    headers: await getAuthHeaders(),
    body: JSON.stringify({ messages }),
  });

  if (!response.ok) {
    const error = await response.json();
    console.error('Failed to get coach response:', error);
    throw new Error(error.message || 'Failed to get coach response');
  }

  const result = await response.json();
  console.log('Got coach response:', result);
  return result;
};

export async function getMilestoneSuggestions(title: string, description?: string): Promise<{ suggestions: string[] }> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/goals/suggest-milestones`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ title, description }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to get milestone suggestions');
    }

    return await response.json();
}

export async function completeOnboarding(): Promise<{ user: User }> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/users/complete-onboarding`, {
        method: 'PUT',
        headers,
    });
    if (!response.ok) {
        throw new Error('Failed to complete onboarding');
    }
    return response.json();
}

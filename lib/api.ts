import { authStore } from './auth';

const API_BASE_URL = 'http://localhost:5000/api';

// Helper function to get auth token
const getAuthHeaders = async () => {
  if (!authStore.getToken) {
    throw new Error("AuthProvider not initialized");
  }
  const token = await authStore.getToken();
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
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
}

export interface JournalEntry {
  _id: string;
  title: string;
  content: string;
  category: string;
  date: string;
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

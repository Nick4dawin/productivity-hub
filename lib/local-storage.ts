// Local storage keys
const KEYS = {
  HABITS: 'productivity-hub-habits',
  TODOS: 'productivity-hub-todos',
  MOODS: 'productivity-hub-moods',
  USER: 'productivity-hub-user',
} as const

// Helper functions
const getItem = <T>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') return defaultValue
  const item = window.localStorage.getItem(key)
  return item ? JSON.parse(item) : defaultValue
}

const setItem = <T>(key: string, value: T): void => {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(key, JSON.stringify(value))
}

// User
export const getUser = () => getItem(KEYS.USER, null)
export const setUser = (user: any) => setItem(KEYS.USER, user)
export const removeUser = () => window.localStorage.removeItem(KEYS.USER)

// Habits
export interface Habit {
  _id: string
  name: string
  category: string
  completedDates: string[]
  streak: number
}

export const getHabits = (): Habit[] => getItem(KEYS.HABITS, [])

export const setHabits = (habits: Habit[]) => setItem(KEYS.HABITS, habits)

export const createHabit = (data: { name: string; category: string }): Habit => {
  const habits = getHabits()
  const newHabit: Habit = {
    _id: Date.now().toString(),
    name: data.name,
    category: data.category,
    completedDates: [],
    streak: 0,
  }
  setHabits([...habits, newHabit])
  return newHabit
}

export const toggleHabitDate = (id: string, date: string): Habit => {
  const habits = getHabits()
  const habit = habits.find(h => h._id === id)
  if (!habit) throw new Error('Habit not found')

  const isCompleted = habit.completedDates.includes(date)
  let completedDates = isCompleted
    ? habit.completedDates.filter(d => d !== date)
    : [...habit.completedDates, date].sort()

  // Calculate streak
  let streak = 0
  const today = new Date()
  const dates = completedDates.map(d => new Date(d))
  dates.sort((a, b) => b.getTime() - a.getTime()) // Sort in descending order

  for (let i = 0; i < dates.length; i++) {
    const date = dates[i]
    const prevDate = i > 0 ? dates[i - 1] : today
    const diffDays = Math.floor((prevDate.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffDays <= 1) {
      streak++
    } else {
      break
    }
  }

  const updatedHabit = {
    ...habit,
    completedDates,
    streak,
  }

  setHabits(habits.map(h => h._id === id ? updatedHabit : h))
  return updatedHabit
}

// Todos
export interface Todo {
  _id: string
  title: string
  completed: boolean
  dueDate?: Date
  priority: 'low' | 'medium' | 'high'
  category: string
}

export const getTodos = (): Todo[] => getItem(KEYS.TODOS, [])
export const setTodos = (todos: Todo[]) => setItem(KEYS.TODOS, todos)

// Moods
export interface Mood {
  _id: string
  rating: number
  note: string
  date: string
}

export const getMoods = (): Mood[] => getItem(KEYS.MOODS, [])
export const setMoods = (moods: Mood[]) => setItem(KEYS.MOODS, moods)

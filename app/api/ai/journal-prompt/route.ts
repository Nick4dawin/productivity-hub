import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Define types
interface Todo {
  title: string;
  dueDate?: string;
  priority?: string;
}

interface Mood {
  mood: string;
  date: string;
  energy?: string;
}

interface Habit {
  name: string;
  streak: number;
  frequency?: string;
}

interface Media {
  title: string;
  type: string;
  status: string;
}

interface JournalEntry {
  content: string;
  date: string;
  mood?: string;
  energy?: string;
}

interface ContextData {
  upcomingTodos?: Todo[];
  recentMoods?: Mood[];
  activeHabits?: Habit[];
  recentMedia?: Media[];
  recentJournals?: JournalEntry[];
}

export async function POST(request: Request) {
  try {
    // Get the token from cookies
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: 'You must be logged in to access this endpoint' },
        { status: 401 }
      );
    }

    const contextData: ContextData = await request.json();

    // Format context data for the AI prompt
    const formattedData = {
      todos: contextData.upcomingTodos?.map((todo) => ({
        title: todo.title,
        dueDate: todo.dueDate,
        priority: todo.priority
      })) || [],
      
      moods: contextData.recentMoods?.map((mood) => ({
        mood: mood.mood,
        date: mood.date,
        energy: mood.energy
      })) || [],
      
      habits: contextData.activeHabits?.map((habit) => ({
        name: habit.name,
        streak: habit.streak,
        frequency: habit.frequency
      })) || [],
      
      media: contextData.recentMedia?.map((media) => ({
        title: media.title,
        type: media.type,
        status: media.status
      })) || [],
      
      journals: contextData.recentJournals || []
    };

    // Call the backend API service to generate a journal prompt
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

    const response = await fetch(`${API_BASE_URL}/ai/journal-prompt`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(formattedData)
    });

    if (!response.ok) {
      return NextResponse.json(
        { prompt: 'What\'s on your mind today?' },
        { status: 200 }
      );
    }

    const promptResponse = await response.json();
    return NextResponse.json(promptResponse);
  } catch (error) {
    console.error('Error generating journal prompt:', error);
    return NextResponse.json(
      { prompt: 'What\'s on your mind today?' },
      { status: 200 }
    );
  }
} 
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    // Get the token
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: 'You must be logged in to access this endpoint' },
        { status: 401 }
      );
    }

    const data = await request.json();
    const { content, mood, energy, activities } = data;
    
    if (!content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    // Call the backend API
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
    
    const response = await fetch(`${API_BASE_URL}/ai/analyze-journal`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        content,
        mood,
        energy,
        activities
      })
    });

    if (!response.ok) {
      throw new Error('Failed to analyze journal content');
    }

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error analyzing journal content:', error);
    return NextResponse.json(
      { 
        error: 'Failed to analyze journal content',
        analysis: {
          summary: 'Could not analyze entry.',
          sentiment: 'Neutral',
          keywords: [],
          suggestions: [],
          insights: 'No insights available.',
          extracted: {
            mood: '',
            todos: [],
            media: [],
            habits: []
          }
        }
      },
      { status: 200 } // Return 200 with empty analysis rather than error
    );
  }
} 
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    // Get the token from cookies
    const token = cookies().get('token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: 'You must be logged in to access this endpoint' },
        { status: 401 }
      );
    }

    // Call the backend API
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
    
    const response = await fetch(`${API_BASE_URL}/journal/context`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch journal context');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching journal context:', error);
    return NextResponse.json(
      { error: 'Failed to fetch journal context' },
      { status: 500 }
    );
  }
} 
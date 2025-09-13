import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function PUT(request: Request) {
  try {
    // Get the token from cookies
    const token = cookies().get('token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: 'You must be logged in to access this endpoint' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { avatarUrl } = body;

    if (!avatarUrl) {
      return NextResponse.json(
        { msg: 'Avatar URL is required' },
        { status: 400 }
      );
    }

    // Call the backend API
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
    
    const response = await fetch(`${API_BASE_URL}/user/avatar`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ avatarUrl })
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { msg: errorData.msg || 'Failed to update avatar' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating avatar:', error);
    return NextResponse.json(
      { msg: 'Failed to update avatar' },
      { status: 500 }
    );
  }
}

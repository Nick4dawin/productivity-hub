import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // Get the pathname
  const path = request.nextUrl.pathname;

  // Define public paths that don't require authentication
  const isPublicPath = path === '/login' || path === '/register';
  
  // Get the token from the cookies
  const token = request.cookies.get('token')?.value || '';

  // If the user is not logged in and trying to access a protected route,
  // redirect them to the login page
  if (!token && !isPublicPath) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If the user is logged in and trying to access a login/register page,
  // redirect them to the home page
  if (token && isPublicPath) {
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  // Otherwise, continue with the request
  return NextResponse.next();
}

// Define which paths this middleware will run on
export const config = {
  matcher: ['/', '/login', '/register', '/journal/:path*', '/goals/:path*', '/routines/:path*', '/media/:path*'],
}; 
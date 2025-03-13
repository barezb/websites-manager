// File: src/app/api/login/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { loginUser, setSessionCookie } from '@/lib/authcopy'

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    // Validate input
    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    // Attempt login
    const { user, token } = await loginUser(username, password);

    // Create a response
    const response = NextResponse.json({
      id: user.id,
      username: user.username
    }, { status: 200 });

    // Set session cookie
    setSessionCookie(token, request, response);

    return response;

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Login failed' },
      { status: 401 }
    );
  }
}
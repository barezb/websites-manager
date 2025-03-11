// File: src/app/api/register/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { registerUser, loginUser, setSessionCookie } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const { username, password } = await request.json()

    // Validate input
    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      )
    }

    // Validate username
    if (username.length < 3) {
      return NextResponse.json(
        { error: 'Username must be at least 3 characters long' },
        { status: 400 }
      )
    }

    // Validate password
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      )
    }

    // Register user
    const user = await registerUser(username, password)

    // Automatically log in the user after registration
    const { token } = await loginUser(username, password)

    // Create a response
    const response = NextResponse.json({
      id: user.id,
      username: user.username
    }, { status: 201 })

    // Set session cookie
    setSessionCookie(token, request, response)

    return response

  } catch (error) {
    console.error('Registration error:', error)

    // Handle unique constraint violation (duplicate username)
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json(
        { error: 'Username already exists' },
        { status: 409 }
      )
    }

    // Generic error response
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Registration failed' },
      { status: 500 }
    )
  }
}
// File: src/app/api/logout/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    // Delete the user session cookie
    (await
      // Delete the user session cookie
      cookies()).delete('user_session')

    return NextResponse.json(
      { message: 'Logged out successfully' },
      {
        status: 200,
        headers: {
          'Set-Cookie': `user_session=; Path=/; HttpOnly; Max-Age=0`
        }
      }
    )
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
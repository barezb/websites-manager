// File: src/lib/auth.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import {
  getCookie,
  setCookie,
  deleteCookie
} from 'cookies-next';
import { NextRequest } from 'next/server';

const prisma = new PrismaClient()

export async function registerUser(username: string, password: string) {
  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10)

  try {
    // Create user in database
    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword
      }
    })
    return user
  } catch (error) {
    console.log(error);
    throw new Error('Registration failed. Username might already exist.')
  }
}

export async function loginUser(username: string, password: string) {
  // Find user in database
  const user = await prisma.user.findUnique({
    where: { username }
  })

  if (!user) {
    throw new Error('Invalid username or password')
  }

  // Compare passwords
  const isPasswordValid = await bcrypt.compare(password, user.password)

  if (!isPasswordValid) {
    throw new Error('Invalid username or password')
  }

  // Generate session token
  const token = generateSessionToken()

  // Update user with session token
  await prisma.user.update({
    where: { id: user.id },
    data: {
      sessionToken: token,
      lastLogin: new Date()
    }
  })

  return { user, token }
}

export async function logoutUser(userId: string) {
  // Clear session token in database
  await prisma.user.update({
    where: { id: userId },
    data: { sessionToken: null }
  })
}

// Utility function to generate a session token
function generateSessionToken() {
  return Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
}

// Server-side session validation
export async function validateSession(token: string) {
  if (!token) return null

  const user = await prisma.user.findFirst({
    where: { sessionToken: token }
  })

  return user
}

// Get current session on server
export async function getServerSession(req?: any, res?: any) {
  try {
    const token = getCookie('session_token', { req, res })

    if (!token) return null

    return await validateSession(token as string)
  } catch (error) {
    return null
  }
}

// Middleware-friendly authentication check
export async function authenticate(req: NextRequest, res?: any) {
  try {
    const token = getCookie('session_token', { req, res })

    if (!token) {
      return { authenticated: false }
    }

    const user = await validateSession(token as string)

    return {
      authenticated: !!user,
      user
    }
  } catch (error) {
    return { authenticated: false }
  }
}

// Set session cookie
export async function setSessionCookie(token: string, req?: any, res?: any) {
  setCookie('session_token', token, {
    req,
    res,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7, // 1 week
    path: '/'
  })
}

// Delete session cookie
export async function deleteSessionCookie(req?: any, res?: any) {
  deleteCookie('session_token', { req, res })
}
// File: src/middleware.ts
import { NextResponse, NextRequest } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const protectedRoutes = [
    '/dashboard',
    '/dashboard/websites',
    '/dashboard/clients',
    '/dashboard/categories'
]

const authRoutes = ['/login', '/register']
export async function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname;
    const session = request.cookies.get('user_session')?.value;

    // Check if the route is protected
    const isProtectedRoute = protectedRoutes.some(route =>
        path.startsWith(route)
    );

    // Check if the route is an auth route
    const isAuthRoute = authRoutes.includes(path);

    // If no session and trying to access protected route, redirect to login
    if (isProtectedRoute && !session) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // If session exists and trying to access auth routes, redirect to dashboard
    if (isAuthRoute && session) {
        // Optional: Verify the session is valid
        try {
            const user = await prisma.user.findUnique({
                where: { id: session }
            });

            if (user) {
                return NextResponse.redirect(new URL('/dashboard', request.url));
            }
        } catch (error) {
            console.error('Session validation error:', error);
        }
    }

    return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
    matcher: [
        '/dashboard/:path*',
        '/login',
        '/register'
    ]
}
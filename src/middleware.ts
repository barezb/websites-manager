import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/pirsma';
import { auth } from './auth';

export async function middleware(request: NextRequest) {
  const session = await auth();

  if (!session) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Example of using Prisma client
  const username = session.user?.username;
  if (!username) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const user = await prisma.user.findUnique({
    where: { username },
  });

  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}
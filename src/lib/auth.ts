import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { setCookie, getCookie, deleteCookie } from 'cookies-next';
import { redirect } from 'next/navigation';

const prisma = new PrismaClient();

export async function registerUser(username: string, password: string) {
  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    // Create user in database
    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
      },
    });
    return user;
  } catch (error) {
    console.log(error);
    throw new Error('Registration failed. Username might already exist.');
  }
}

export async function loginUser(username: string, password: string, req: any, res: any) {
  // Find user in database
  const user = await prisma.user.findUnique({ where: { username } });

  if (!user) {
    throw new Error('Invalid username or password');
  }

  // Compare passwords
  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw new Error('Invalid username or password');
  }

  // Create session cookie
  setCookie('user_session', user.id, {
    req,
    res,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7, // 1 week
  });

  return user;
}

export async function logoutUser(req: any, res: any) {
  // Delete session cookie
  deleteCookie('user_session', { req, res });
  redirect('/login');
}

export async function requireAuth(req: any, res: any) {
  // Check for session cookie
  const session = getCookie('user_session', { req, res });

  if (!session) {
    redirect('/login');
  }

  // Optional: Verify user exists in database
  const user = await prisma.user.findUnique({ where: { id: session as string } });

  if (!user) {
    throw new Error('User not found');
    redirect('/login');
  }

  return user;
}
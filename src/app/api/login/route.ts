// File: src/app/api/websites/route.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { loginUser } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { username, password } = req.body;

    try {
      const user = await loginUser(username, password, req, res);
      res.status(200).json(user);
    } catch (error) {
      console.error('Login failed:', error);
      res.status(401).json({ error: 'Invalid username or password' });
    }
  } else {
    res.status(405).end(); // Method Not Allowed
  }
}
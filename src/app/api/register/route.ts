import { NextApiRequest, NextApiResponse } from 'next';
import { registerUser } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { username, password } = req.body;

    try {
      const user = await registerUser(username, password);
      res.status(201).json(user);
    } catch (error) {
      console.error('Registration failed:', error);
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(400).json({ error: 'An unknown error occurred' });
      }
    }
  } else {
    res.status(405).end(); // Method Not Allowed
  }
}
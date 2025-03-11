import { NextApiRequest, NextApiResponse } from 'next';
import { logoutUser } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      await logoutUser(req, res);
      res.status(200).json({ message: 'Logout successful' });
    } catch (error) {
      console.error('Logout failed:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.status(405).end(); // Method Not Allowed
  }
}
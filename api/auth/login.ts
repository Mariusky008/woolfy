import { VercelRequest, VercelResponse } from '@vercel/node';
import { loginUser } from '../../src/server/controllers/AuthController';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  // Handle actual login request
  if (req.method === 'POST') {
    try {
      const { email, password } = req.body;
      const result = await loginUser(email, password);
      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
} 
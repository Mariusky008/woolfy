import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', 'https://www.woolfy.fr');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Handle logout
  if (req.method === 'POST') {
    try {
      // Clear any session data or cookies if needed
      res.setHeader('Set-Cookie', [
        'session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; Secure; SameSite=Strict',
        'connect.sid=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; Secure; SameSite=Strict'
      ]);

      return res.status(200).json({
        success: true,
        message: 'Déconnexion réussie'
      });
    } catch (error: any) {
      console.error('Logout error:', error);
      return res.status(500).json({
        success: false,
        message: 'Une erreur est survenue lors de la déconnexion',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Handle unknown methods
  return res.status(405).json({
    success: false,
    message: 'Méthode non autorisée'
  });
} 
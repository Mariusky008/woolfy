import { VercelRequest, VercelResponse } from '@vercel/node';
import { connectDB } from '../../src/server/config/db';
import { User, IUser } from '../../src/server/models/User';
import { Types } from 'mongoose';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log('Received request with headers:', req.headers);
  console.log('Request method:', req.method);
  console.log('Request origin:', req.headers.origin);

  // Enable CORS
  const origin = req.headers.origin;
  console.log('Setting CORS headers for origin:', origin);

  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', origin || '');
  res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    console.log('Handling OPTIONS request');
    res.status(204).end();
    return;
  }

  try {
    // Connect to MongoDB
    await connectDB();

    // Handle login
    if (req.method === 'POST') {
      console.log('Processing login request');
      const { email, password } = req.body;
      console.log('Login attempt for email:', email);

      // Validate input
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email et mot de passe requis'
        });
      }

      // Find user
      const user = await User.findOne({ email }).exec() as IUser;
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Email ou mot de passe incorrect'
        });
      }

      // Check password
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Email ou mot de passe incorrect'
        });
      }

      // Return user data
      return res.status(200).json({
        success: true,
        message: 'Connexion réussie',
        user: {
          _id: (user._id as Types.ObjectId).toString(),
          username: user.username,
          email: user.email,
          createdAt: user.createdAt,
          gamesPlayed: user.gamesPlayed,
          gamesWon: user.gamesWon,
          badges: user.badges,
          trophies: user.trophies,
          points: user.points,
          rank: user.rank
        }
      });
    }

    // Handle unknown methods
    return res.status(405).json({
      success: false,
      message: 'Méthode non autorisée'
    });

  } catch (error: any) {
    console.error('API Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Une erreur est survenue',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
} 
import { VercelRequest, VercelResponse } from '@vercel/node';
import { connectDB } from '../../src/server/config/db';
import { User, IUser } from '../../src/server/models/User';
import { Types } from 'mongoose';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS with credentials
  const origin = req.headers.origin;
  const allowedOrigins = ['https://www.woolfy.fr', 'https://woolfy.vercel.app'];
  
  // Allow requests from our domains
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  }

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // Connect to MongoDB
    await connectDB();

    // Handle registration
    if (req.method === 'POST') {
      console.log('Received registration request:', req.body);
      const { username, email, password } = req.body;

      // Validate input
      if (!username || !email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Tous les champs sont requis'
        });
      }

      // Check if user exists
      const existingUser = await User.findOne({
        $or: [{ email }, { username }]
      }).exec();

      if (existingUser) {
        if (existingUser.email === email) {
          return res.status(400).json({
            success: false,
            message: 'Un compte existe déjà avec cet email'
          });
        } else {
          return res.status(400).json({
            success: false,
            message: 'Ce nom d\'utilisateur est déjà pris'
          });
        }
      }

      // Create user
      const user = new User({
        username,
        email,
        password,
        gamesPlayed: 0,
        gamesWon: 0,
        badges: [],
        trophies: [],
        points: 0,
        rank: 'Louveteau'
      });

      const savedUser = await user.save() as IUser;

      return res.status(201).json({
        success: true,
        message: 'Inscription réussie',
        user: {
          _id: (savedUser._id as Types.ObjectId).toString(),
          username: savedUser.username,
          email: savedUser.email,
          createdAt: savedUser.createdAt,
          gamesPlayed: savedUser.gamesPlayed,
          gamesWon: savedUser.gamesWon,
          badges: savedUser.badges,
          trophies: savedUser.trophies,
          points: savedUser.points,
          rank: savedUser.rank
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
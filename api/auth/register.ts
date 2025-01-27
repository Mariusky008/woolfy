import { VercelRequest, VercelResponse } from '@vercel/node';
import { connectDB } from '../../src/server/config/db';
import { User, IUser } from '../../src/server/models/User';
import { Types } from 'mongoose';
import Cors from 'cors';

// Initializing the cors middleware
const cors = Cors({
  origin: 'https://woolfy.vercel.app',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
});

// Helper method to wait for a middleware to execute before continuing
function runMiddleware(req: VercelRequest, res: VercelResponse, fn: Function) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Run the CORS middleware
  await runMiddleware(req, res, cors);

  try {
    // Connect to MongoDB
    await connectDB();

    // Handle registration
    if (req.method === 'POST') {
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
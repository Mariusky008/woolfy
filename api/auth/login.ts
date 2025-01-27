import { VercelRequest, VercelResponse } from '@vercel/node';
import { connectDB } from '../../src/server/config/db';
import { User, IUser } from '../../src/server/models/User';
import { Types } from 'mongoose';
import Cors from 'cors';

// Initialize CORS middleware
const cors = Cors({
  origin: function (origin: string | undefined, callback: (err: Error | null, origin?: boolean | string) => void) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'https://www.woolfy.fr',
      'https://woolfy.fr',
      'https://woolfy.vercel.app',
      'http://localhost:5173'
    ];

    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, origin);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 204
});

// Helper method to run middleware
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

    // Handle login
    if (req.method === 'POST') {
      const { email, password } = req.body;

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
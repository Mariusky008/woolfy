import { VercelRequest, VercelResponse } from '@vercel/node';
import { connectDB } from '../src/server/config/db';
import { User, IUser } from '../src/server/models/User';
import { Types } from 'mongoose';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', 'https://woolfy.fr');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // Connect to MongoDB
    await connectDB();

    // Handle login
    if (req.method === 'POST' && req.url === '/api/auth/login') {
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

    // Handle registration
    if (req.method === 'POST' && req.url === '/api/auth/register') {
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

    // Handle unknown routes
    return res.status(404).json({
      success: false,
      message: 'Route non trouvée'
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
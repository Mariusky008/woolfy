import { Request, Response } from 'express';
import { User, IUser } from '../models/User';

// Extend Express.Session type
declare module 'express-session' {
  interface Session {
    userId: string | undefined;
  }
}

type SafeUser = {
  _id: string;
  username: string;
  email: string;
  createdAt: Date;
  stats: {
    gamesPlayed: number;
    gamesWon: number;
    badges: string[];
    trophies: string[];
    points: number;
    rank: number;
  };
};

export class AuthController {
  private sanitizeUser(user: IUser): SafeUser {
    const { _id, username, email, createdAt, stats } = user.toObject();
    return {
      _id: _id.toString(),
      username,
      email,
      createdAt,
      stats
    };
  }

  // Register new user
  async register(req: Request, res: Response) {
    try {
      const { username, email, password } = req.body;

      // Validate input
      if (!username || !email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Tous les champs sont requis'
        });
      }

      // Check if user already exists
      const existingUser = await User.findOne({ 
        $or: [{ email }, { username }] 
      }).exec();

      if (existingUser) {
        return res.status(400).json({ 
          success: false,
          message: existingUser.email === email 
            ? 'Cet email est déjà utilisé' 
            : 'Ce nom d\'utilisateur est déjà pris' 
        });
      }

      // Create new user with default stats
      const user = await User.create({
        username,
        email,
        password,
        stats: {
          gamesPlayed: 0,
          gamesWon: 0,
          badges: [],
          trophies: [],
          points: 0,
          rank: 0
        }
      });

      if (!user) {
        return res.status(500).json({
          success: false,
          message: 'Erreur lors de la création de l\'utilisateur'
        });
      }

      // Set user session
      const userId = user._id?.toString();
      if (!userId) {
        return res.status(500).json({
          success: false,
          message: 'Erreur lors de la création de l\'utilisateur'
        });
      }
      req.session.userId = userId;

      // Save session before sending response
      return new Promise<void>((resolve, reject) => {
        req.session.save((err) => {
          if (err) {
            console.error('Session save error:', err);
            reject(err);
            return;
          }

          const safeUser = this.sanitizeUser(user);
          res.status(201).json({
            success: true,
            message: 'Inscription réussie',
            user: safeUser
          });
          resolve();
        });
      });

    } catch (error: any) {
      console.error('Registration error:', error);
      res.status(500).json({ 
        success: false,
        message: 'Erreur lors de l\'inscription',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Login user
  async login(req: Request, res: Response) {
    try {
      console.log('Login attempt:', req.body);
      const { email, password } = req.body;

      // Validate input
      if (!email || !password) {
        console.log('Missing credentials');
        return res.status(400).json({
          success: false,
          message: 'Email et mot de passe requis'
        });
      }

      // Find user by email
      const user = await User.findOne({ email }).exec();
      console.log('User found:', user ? 'yes' : 'no');

      if (!user) {
        return res.status(401).json({ 
          success: false,
          message: 'Email ou mot de passe incorrect' 
        });
      }

      // Check password
      const isMatch = await user.comparePassword(password);
      console.log('Password match:', isMatch);

      if (!isMatch) {
        return res.status(401).json({ 
          success: false,
          message: 'Email ou mot de passe incorrect' 
        });
      }

      // Set user session
      const userId = user._id?.toString();
      if (!userId) {
        console.log('No user ID');
        return res.status(500).json({
          success: false,
          message: 'Erreur lors de la connexion'
        });
      }
      req.session.userId = userId;
      console.log('Session ID set:', userId);

      // Save session before sending response
      return new Promise<void>((resolve, reject) => {
        req.session.save((err) => {
          if (err) {
            console.error('Session save error:', err);
            reject(err);
            return res.status(500).json({
              success: false,
              message: 'Erreur lors de la création de la session'
            });
          }

          const safeUser = this.sanitizeUser(user);
          console.log('Login successful, sending response');
          res.status(200).json({
            success: true,
            message: 'Connexion réussie',
            user: safeUser
          });
          resolve();
        });
      });

    } catch (error: any) {
      console.error('Login error:', error);
      return res.status(500).json({ 
        success: false,
        message: 'Erreur lors de la connexion',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Logout user
  async logout(req: Request, res: Response) {
    try {
      if (!req.session) {
        return res.status(200).json({ 
          success: true,
          message: 'Déconnexion réussie' 
        });
      }

      req.session.destroy((err) => {
        if (err) {
          console.error('Logout error:', err);
          return res.status(500).json({ 
            success: false,
            message: 'Erreur lors de la déconnexion' 
          });
        }
        res.json({ 
          success: true,
          message: 'Déconnexion réussie' 
        });
      });

    } catch (error: any) {
      console.error('Logout error:', error);
      res.status(500).json({ 
        success: false,
        message: 'Erreur lors de la déconnexion',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Get current user
  async getCurrentUser(req: Request, res: Response) {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ 
          success: false,
          message: 'Non authentifié' 
        });
      }

      const user = await User.findById(req.session.userId).exec();

      if (!user) {
        return res.status(404).json({ 
          success: false,
          message: 'Utilisateur non trouvé' 
        });
      }

      const safeUser = this.sanitizeUser(user);
      res.json({ 
        success: true,
        user: safeUser
      });

    } catch (error: any) {
      console.error('Get current user error:', error);
      res.status(500).json({ 
        success: false,
        message: 'Erreur lors de la récupération de l\'utilisateur',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
} 
import { Request, Response } from 'express';
import { User, IUser } from '../models/User';
import { Types } from 'mongoose';

// Extend Express.Session type
declare module 'express-session' {
  interface Session {
    userId: string | undefined;
  }
}

type SafeUser = Omit<IUser, 'password' | 'comparePassword'> & {
  _id: string;
};

export class AuthController {
  private sanitizeUser(user: IUser & { _id: Types.ObjectId }): SafeUser {
    const { password, comparePassword, ...safeUser } = user.toObject();
    const userId = user._id.toString();
    return {
      ...safeUser,
      _id: userId
    };
  }

  // Register a new user
  async register(req: Request, res: Response) {
    try {
      const { username, email, password } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ 
        $or: [{ email }, { username }] 
      }).exec();

      if (existingUser) {
        return res.status(400).json({ 
          message: existingUser.email === email 
            ? 'Cet email est déjà utilisé' 
            : 'Ce nom d\'utilisateur est déjà pris' 
        });
      }

      // Create new user
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

      // Set user session
      const typedUser = user as unknown as { _id: Types.ObjectId };
      req.session.userId = typedUser._id.toString();

      res.status(201).json({
        message: 'Inscription réussie',
        user: this.sanitizeUser(user as IUser & { _id: Types.ObjectId })
      });

    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ 
        message: 'Erreur lors de l\'inscription' 
      });
    }
  }

  // Login user
  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      // Find user by email
      const user = await User.findOne({ email }).exec();

      if (!user) {
        return res.status(401).json({ 
          message: 'Email ou mot de passe incorrect' 
        });
      }

      // Check password
      const isMatch = await user.comparePassword(password);

      if (!isMatch) {
        return res.status(401).json({ 
          message: 'Email ou mot de passe incorrect' 
        });
      }

      // Set user session
      const typedUser = user as unknown as { _id: Types.ObjectId };
      req.session.userId = typedUser._id.toString();

      res.json({
        message: 'Connexion réussie',
        user: this.sanitizeUser(user as IUser & { _id: Types.ObjectId })
      });

    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ 
        message: 'Erreur lors de la connexion' 
      });
    }
  }

  // Logout user
  async logout(req: Request, res: Response) {
    try {
      req.session.destroy((err) => {
        if (err) {
          console.error('Logout error:', err);
          return res.status(500).json({ 
            message: 'Erreur lors de la déconnexion' 
          });
        }
        res.json({ message: 'Déconnexion réussie' });
      });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({ 
        message: 'Erreur lors de la déconnexion' 
      });
    }
  }

  // Get current user
  async getCurrentUser(req: Request, res: Response) {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ 
          message: 'Non authentifié' 
        });
      }

      const user = await User.findById(req.session.userId).exec();

      if (!user) {
        return res.status(404).json({ 
          message: 'Utilisateur non trouvé' 
        });
      }

      res.json({ 
        user: this.sanitizeUser(user as IUser & { _id: Types.ObjectId })
      });

    } catch (error) {
      console.error('Get current user error:', error);
      res.status(500).json({ 
        message: 'Erreur lors de la récupération de l\'utilisateur' 
      });
    }
  }
} 
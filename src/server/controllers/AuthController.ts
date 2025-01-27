import { Request, Response } from 'express';
import { User, IUser } from '../models/User';
import { Types } from 'mongoose';

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
  gamesPlayed: number;
  gamesWon: number;
  badges: string[];
  trophies: string[];
  points: number;
  rank: string;
};

export class AuthController {
  public sanitizeUser(user: IUser): SafeUser {
    const { _id, username, email, createdAt, gamesPlayed, gamesWon, badges, trophies, points, rank } = user;
    return {
      _id: (_id as Types.ObjectId).toString(),
      username,
      email,
      createdAt,
      gamesPlayed,
      gamesWon,
      badges,
      trophies,
      points,
      rank
    };
  }

  // Register new user
  register = async (req: Request, res: Response) => {
    try {
      const { username, email, password } = req.body;

      // Validate input
      if (!username || !email || !password) {
        return res.status(400).json({
          message: 'Tous les champs sont requis'
        });
      }

      // Check if user already exists
      const existingUser = await User.findOne({
        $or: [
          { email },
          { username }
        ]
      }).exec();

      if (existingUser) {
        if (existingUser.email === email) {
          return res.status(400).json({ message: 'Un compte existe déjà avec cet email' });
        } else {
          return res.status(400).json({ message: 'Ce nom d\'utilisateur est déjà pris' });
        }
      }

      // Create new user with default stats
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

      const savedUser = await user.save();

      // Set user session with type checking
      if (req.session && savedUser._id) {
        req.session.userId = savedUser._id.toString();
      } else {
        throw new Error('Session or user ID not available');
      }

      // Save session before sending response
      return new Promise<void>((resolve, reject) => {
        req.session.save((err) => {
          if (err) {
            console.error('Session save error:', err);
            reject(err);
            return;
          }

          const safeUser = this.sanitizeUser(savedUser);
          res.status(201).json({
            success: true,
            message: 'Inscription réussie',
            user: safeUser
          });
          resolve();
        });
      });

    } catch (error: any) {
      console.warn('Registration error:', error);
      
      // Gestion des erreurs de validation Mongoose
      if (error.name === 'ValidationError') {
        const validationErrors = Object.values(error.errors).map((err: any) => {
          switch (err.path) {
            case 'username':
              if (err.kind === 'minlength') {
                return 'Le nom d\'utilisateur doit contenir au moins 3 caractères';
              }
              return 'Le nom d\'utilisateur est invalide';
            case 'email':
              return 'L\'email est invalide';
            case 'password':
              if (err.kind === 'minlength') {
                return 'Le mot de passe doit contenir au moins 6 caractères';
              }
              return 'Le mot de passe est invalide';
            default:
              return err.message;
          }
        });
        return res.status(400).json({ message: validationErrors.join('. ') });
      }

      // Gestion des erreurs de duplication MongoDB
      if (error.code === 11000) {
        if (error.keyPattern.email) {
          return res.status(400).json({ message: 'Un compte existe déjà avec cet email' });
        }
        if (error.keyPattern.username) {
          return res.status(400).json({ message: 'Ce nom d\'utilisateur est déjà pris' });
        }
      }

      return res.status(500).json({ message: 'Une erreur est survenue lors de l\'inscription' });
    }
  }

  // Login user
  login = async (req: Request, res: Response) => {
    try {
      console.log('=== Login Attempt Start ===');
      console.log('Request headers:', req.headers);
      console.log('Request body:', req.body);
      console.log('Session before login:', req.session);
      
      const { email, password } = req.body;

      // Validate input
      if (!email || !password) {
        console.log('Login failed: Missing credentials');
        console.log('Email provided:', !!email);
        console.log('Password provided:', !!password);
        return res.status(400).json({
          success: false,
          message: 'Email et mot de passe requis'
        });
      }

      // Find user by email
      const user = await User.findOne({ email }).exec();
      console.log('Database query completed');
      console.log('User found:', user ? 'yes' : 'no');
      console.log('User ID if found:', user?._id);

      if (!user) {
        console.log('Login failed: User not found');
        return res.status(401).json({ 
          success: false,
          message: 'Email ou mot de passe incorrect' 
        });
      }

      // Check password
      const isMatch = await user.comparePassword(password);
      console.log('Password verification completed');
      console.log('Password match:', isMatch);

      if (!isMatch) {
        console.log('Login failed: Password mismatch');
        return res.status(401).json({ 
          success: false,
          message: 'Email ou mot de passe incorrect' 
        });
      }

      // Set user session
      const userId = user._id?.toString();
      console.log('User ID to be set in session:', userId);
      
      if (!userId) {
        console.log('Login failed: No user ID available');
        return res.status(500).json({
          success: false,
          message: 'Erreur lors de la connexion'
        });
      }

      req.session.userId = userId;
      console.log('Session after setting userId:', req.session);

      // Save session before sending response
      return new Promise<void>((resolve, reject) => {
        console.log('Attempting to save session...');
        req.session.save((err) => {
          if (err) {
            console.error('Session save error:', err);
            console.error('Session save error details:', {
              name: err.name,
              message: err.message,
              stack: err.stack
            });
            reject(err);
            return res.status(500).json({
              success: false,
              message: 'Erreur lors de la création de la session'
            });
          }

          const safeUser = this.sanitizeUser(user);
          console.log('Session saved successfully');
          console.log('Final session state:', req.session);
          console.log('=== Login Attempt End - Success ===');
          
          res.status(200).json({
            success: true,
            message: 'Connexion réussie',
            user: safeUser
          });
          resolve();
        });
      });

    } catch (error: any) {
      console.error('=== Login Attempt End - Error ===');
      console.error('Login error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      
      if (error.name === 'MongoError' || error.name === 'MongoServerError') {
        console.error('MongoDB specific error:', error);
        return res.status(500).json({ 
          success: false,
          message: 'Erreur de connexion à la base de données'
        });
      }
      
      return res.status(500).json({ 
        success: false,
        message: 'Erreur lors de la connexion',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Logout user
  logout = async (req: Request, res: Response) => {
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
  getCurrentUser = async (req: Request, res: Response) => {
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

// Standalone login function for API routes
export const loginUser = async (email: string, password: string) => {
  if (!email || !password) {
    throw new Error('Email et mot de passe requis');
  }

  // Find user by email
  const user = await User.findOne({ email }).exec();

  if (!user) {
    throw new Error('Email ou mot de passe incorrect');
  }

  // Check password
  const isMatch = await user.comparePassword(password);

  if (!isMatch) {
    throw new Error('Email ou mot de passe incorrect');
  }

  // Return safe user data
  const authController = new AuthController();
  const safeUser = authController.sanitizeUser(user);
  
  return {
    success: true,
    message: 'Connexion réussie',
    user: safeUser
  };
}; 
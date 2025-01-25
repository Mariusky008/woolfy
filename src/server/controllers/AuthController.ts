import { Request, Response } from 'express';
import { User } from '../models/User';

export class AuthController {
  // Register a new user
  async register(req: Request, res: Response) {
    try {
      const { username, email, password } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ 
        $or: [{ email }, { username }] 
      });

      if (existingUser) {
        return res.status(400).json({ 
          message: existingUser.email === email 
            ? 'Cet email est déjà utilisé' 
            : 'Ce nom d\'utilisateur est déjà pris' 
        });
      }

      // Create new user
      const user = new User({
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

      await user.save();

      // Set user session
      req.session.userId = user._id;

      // Return user without password
      const userResponse = user.toObject();
      delete userResponse.password;

      res.status(201).json({
        message: 'Inscription réussie',
        user: userResponse
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
      const user = await User.findOne({ email });

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
      req.session.userId = user._id;

      // Return user without password
      const userResponse = user.toObject();
      delete userResponse.password;

      res.json({
        message: 'Connexion réussie',
        user: userResponse
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

      const user = await User.findById(req.session.userId);

      if (!user) {
        return res.status(404).json({ 
          message: 'Utilisateur non trouvé' 
        });
      }

      // Return user without password
      const userResponse = user.toObject();
      delete userResponse.password;

      res.json({ user: userResponse });

    } catch (error) {
      console.error('Get current user error:', error);
      res.status(500).json({ 
        message: 'Erreur lors de la récupération de l\'utilisateur' 
      });
    }
  }
} 
const express = require('express');
import { AuthController } from '../controllers/AuthController';

const router = express.Router();
const authController = new AuthController();

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.get('/me', authController.getCurrentUser);

// Auth check route with detailed error handling
router.get('/check', (req, res) => {
  try {
    console.log('Auth check request received');
    console.log('Headers:', req.headers);
    console.log('Session:', req.session);
    console.log('Session ID:', req.sessionID);
    console.log('Cookies:', req.cookies);

    // Vérifier si le middleware de session est initialisé
    if (!req.session) {
      console.error('Session middleware not properly initialized');
      return res.status(500).json({
        isAuthenticated: false,
        error: {
          message: 'Session middleware not properly initialized',
          code: 'SESSION_MIDDLEWARE_ERROR'
        }
      });
    }

    // Vérifier si l'ID de session existe
    if (!req.sessionID) {
      console.log('No session ID found');
      return res.status(401).json({
        isAuthenticated: false,
        error: {
          message: 'No session ID found',
          code: 'NO_SESSION_ID'
        }
      });
    }

    // Vérifier si l'utilisateur est authentifié
    const isAuthenticated = !!req.session.userId;
    console.log('Is authenticated:', isAuthenticated);
    console.log('User ID in session:', req.session.userId);

    // Renvoyer la réponse avec des informations détaillées
    return res.status(200).json({
      isAuthenticated,
      message: isAuthenticated ? 'Authenticated' : 'Not authenticated',
      debug: process.env.NODE_ENV === 'development' ? {
        sessionId: req.sessionID,
        hasSession: !!req.session,
        userId: req.session.userId,
        cookies: req.cookies
      } : undefined
    });

  } catch (error) {
    console.error('Auth check error:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    return res.status(500).json({
      isAuthenticated: false,
      error: {
        message: 'Error checking authentication status',
        details: process.env.NODE_ENV === 'development' ? {
          message: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined
        } : undefined
      }
    });
  }
});

export default router; 
import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import { Session } from 'express-session';

// Étendre l'interface Request pour inclure l'utilisateur
declare module 'express' {
  interface Request {
    user?: {
      _id: Types.ObjectId;
      username: string;
      email: string;
    };
  }
}

// Étendre l'interface Session
declare module 'express-session' {
  interface SessionData {
    user?: {
      _id: Types.ObjectId;
      username: string;
      email: string;
    };
  }
}

// Middleware d'authentification
export const authenticateUser = (req: Request, res: Response, next: NextFunction) => {
  // Vérifier si l'utilisateur est dans la session
  if (!req.session || !req.session.user) {
    return res.status(401).json({ error: 'Non authentifié' });
  }

  // Ajouter l'utilisateur à la requête
  req.user = req.session.user;
  next();
};

// Extend Express Request type to include userId in session
declare module 'express-session' {
  interface SessionData {
    userId: string;
  }
} 
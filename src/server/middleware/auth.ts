import { Request, Response, NextFunction } from 'express';

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: 'Authentification requise' });
  }
  next();
};

// Extend Express Request type to include userId in session
declare module 'express-session' {
  interface SessionData {
    userId: string;
  }
} 
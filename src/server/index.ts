import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import cors from 'cors';
import path from 'path';
import { connectDB } from './config/db';
import gameRoutes from './routes/gameRoutes';
import authRoutes from './routes/authRoutes';
import { GameService } from './services/GameService';

const app = express();
const isProduction = process.env.NODE_ENV === 'production';
const clientUrl = isProduction ? 'https://woolfy.fr' : 'http://localhost:5173';

// Middleware
app.use(express.json());

// CORS configuration
app.use(cors({
  origin: clientUrl,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Add headers middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  res.header('Access-Control-Allow-Origin', clientUrl);
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'woolfy-secret-key',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI || 'mongodb://localhost:27017/woolfy',
    ttl: 24 * 60 * 60 // 1 day
  }),
  cookie: {
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 24 * 60 * 60 * 1000, // 1 day
    domain: isProduction ? '.woolfy.fr' : undefined
  }
}));

// API Routes - Make sure they are before static files
app.use('/api/games', gameRoutes);
app.use('/api/auth', authRoutes);

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ message: 'Une erreur est survenue' });
});

// Serve static files in production
if (isProduction) {
  const distPath = path.join(__dirname, '../../dist');
  app.use(express.static(distPath));

  // Handle client-side routing
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../dist/index.html'));
  });
}

// Initialize game service
const gameService = new GameService();

// Connect to MongoDB and start server
const port = process.env.PORT || 3000;

connectDB()
  .then(() => {
    console.log('MongoDB connected successfully');
    
    app.listen(port, () => {
      console.log(`Server is running on port ${port} in ${process.env.NODE_ENV} mode`);
      console.log(`CORS enabled for origin: ${clientUrl}`);
      gameService.start();
    });
  })
  .catch((err: Error) => {
    console.error('Failed to connect to MongoDB:', err);
    process.exit(1);
  }); 
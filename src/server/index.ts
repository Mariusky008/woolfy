import 'dotenv/config';
import express from 'express';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import cors from 'cors';
import path from 'path';
import { createServer } from 'http';
import { connectDB } from './config/db';
import authRoutes from './routes/authRoutes';
import { createGameRouter } from './routes/gameRoutes';
import { messageRoutes } from './routes/messageRoutes';
import { createProfileRouter } from './routes/profileRoutes';
import { GameService } from './services/GameService';
import { NotificationService } from './services/NotificationService';
import { BadgeService } from './services/BadgeService';
import { initSocketService } from './services/SocketService';

const app = express();
const httpServer = createServer(app);
const isProduction = process.env.NODE_ENV === 'production';
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

// Define allowed origins
const allowedOrigins = [
  'http://localhost:5173',
  'https://www.woolfy.fr',
  'https://woolfy.fr',
  'https://woolfy-api.vercel.app',
  'https://woolfy.vercel.app'
];

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// CORS configuration
app.use(cors({
  origin: true, // Allow all origins for now
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Set-Cookie', 'set-cookie']
}));

// Add CORS headers middleware for preflight
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

// Session configuration
const sessionConfig = {
  secret: process.env.SESSION_SECRET || 'dev-secret',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    ttl: 24 * 60 * 60
  }),
  cookie: {
    secure: isProduction,
    sameSite: isProduction ? 'none' as const : 'lax' as const,
    maxAge: 24 * 60 * 60 * 1000,
    domain: isProduction ? '.woolfy.fr' : undefined
  },
  name: 'woolfy.sid'
};

if (isProduction) {
  app.set('trust proxy', 1);
}

app.use(session(sessionConfig));

// Initialize services
const notificationService = new NotificationService(httpServer);
const gameService = new GameService(notificationService);
const badgeService = new BadgeService(notificationService);

// Initialize badges
badgeService.createDefaultBadges().catch(error => {
  console.error('Error creating default badges:', error);
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/games', createGameRouter(notificationService));
app.use('/api/messages', messageRoutes);
app.use('/api/profile', createProfileRouter(notificationService));

// Serve static files in production
if (isProduction) {
  app.use(express.static(path.join(__dirname, '../../dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../dist/index.html'));
  });
}

// Error handling
app.use((err: Error, req: any, res: any, next: any) => {
  console.error('Server Error:', err);
  res.status(500).json({ 
    message: 'Une erreur est survenue',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
const port = process.env.PORT || 3000;

connectDB().then(() => {
  // Initialize Socket.IO after database connection
  const socketService = initSocketService(httpServer);
  
  httpServer.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log(`Client URL: ${clientUrl}`);
    gameService.start();
  });
}).catch(err => {
  console.error('Database connection failed:', err);
  process.exit(1);
}); 
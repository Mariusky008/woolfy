import 'dotenv/config';
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const cors = require('cors');
const path = require('path');
const { createServer } = require('http');
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
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5175';

// Define allowed origins
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5175',
  'http://localhost:3001',
  'https://www.woolfy.fr',
  'https://woolfy.fr',
  'https://woolfy-api.vercel.app',
  'https://woolfy.vercel.app'
];

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// CORS configuration with preflight
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Set-Cookie']
}));

// Session configuration
const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET || 'dev-secret',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    ttl: 24 * 60 * 60,
    autoRemove: 'native',
    touchAfter: 24 * 3600
  }),
  cookie: {
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 24 * 60 * 60 * 1000,
    domain: isProduction ? '.woolfy.fr' : undefined,
    path: '/',
    httpOnly: true
  },
  name: 'woolfy.sid'
});

// Enable trust proxy in production
if (isProduction) {
  app.set('trust proxy', 1);
}

// Apply session middleware
app.use(sessionMiddleware);

// Debug middleware
app.use((req, res, next) => {
  console.log('Session Debug:', {
    sessionID: req.sessionID,
    session: req.session,
    cookies: req.cookies,
    signedCookies: req.signedCookies,
    headers: req.headers
  });
  next();
});

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

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  console.error('Error Stack:', err.stack);
  
  // Send detailed error in development, generic in production
  const error = process.env.NODE_ENV === 'development' ? {
    message: err.message,
    stack: err.stack,
    session: req.session,
    sessionID: req.sessionID,
    headers: req.headers
  } : { message: 'An error occurred' };

  res.status(err.status || 500).json({ error });
});

// Serve static files in production
if (isProduction) {
  app.use(express.static(path.join(__dirname, '../../dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../dist/index.html'));
  });
}

// Start server
const port = process.env.PORT || 3001;

connectDB().then(() => {
  // Initialize Socket.IO with session middleware
  const io = initSocketService(httpServer, sessionMiddleware);
  
  httpServer.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log(`Client URL: ${clientUrl}`);
    console.log('Allowed origins:', allowedOrigins);
    gameService.start();
  });
}).catch(err => {
  console.error('Database connection failed:', err);
  process.exit(1);
}); 
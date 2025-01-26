import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import cors from 'cors';
import path from 'path';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import { connectDB } from './config/db';
import authRoutes from './routes/authRoutes';
import { createGameRouter } from './routes/gameRoutes';
import { GameService } from './services/GameService';
import { NotificationService } from './services/NotificationService';

const app = express();
const httpServer = createServer(app);
const isProduction = process.env.NODE_ENV === 'production';
const clientUrl = process.env.CLIENT_URL || (isProduction ? 'https://woolfy.fr' : 'http://localhost:5173');
const allowedOrigins = isProduction 
  ? ['https://woolfy.fr', 'https://www.woolfy.fr']
  : ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://192.168.1.219:5173'];

// Initialize notification service
const notificationService = new NotificationService(httpServer);

// Middleware
app.use(express.json({
  verify: (req: Request, res: Response, buf: Buffer, encoding: BufferEncoding) => {
    try {
      JSON.parse(buf.toString(encoding));
    } catch (e: any) {
      res.status(400).json({ 
        success: false,
        message: 'Invalid JSON payload',
        error: process.env.NODE_ENV === 'development' ? e.message : undefined
      });
      throw e;
    }
  }
}));
app.use(cookieParser());

// CORS configuration
app.use(cors({
  origin: function(origin, callback) {
    console.log('=== CORS Check ===');
    console.log('Request origin:', origin);
    console.log('Allowed origins:', allowedOrigins);
    
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      console.log('No origin provided - allowing request');
      return callback(null, true);
    }
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      console.log('Origin allowed:', origin);
      callback(null, true);
    } else {
      console.log('Origin rejected:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Set-Cookie']
}));

// Handle preflight requests
app.options('*', cors());

// Session configuration
console.log('=== Session Configuration ===');
console.log('Environment:', process.env.NODE_ENV);
console.log('Production mode:', isProduction);
console.log('MongoDB URI exists:', !!process.env.MONGODB_URI);
console.log('Session secret exists:', !!process.env.SESSION_SECRET);

const sessionConfig = {
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    ttl: 24 * 60 * 60, // 1 day
    autoRemove: 'native',
    touchAfter: 24 * 3600 // 24 hours
  }),
  cookie: {
    secure: isProduction,
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24, // 1 day
    sameSite: isProduction ? ('none' as const) : ('lax' as const),
    domain: isProduction ? '.woolfy.fr' : undefined,
    path: '/'
  },
  name: 'woolfy.sid'
};

console.log('Session configuration:', {
  ...sessionConfig,
  secret: sessionConfig.secret ? '[SECRET]' : undefined,
  store: sessionConfig.store ? '[STORE]' : undefined,
  cookie: {
    ...sessionConfig.cookie,
    secure: sessionConfig.cookie.secure,
    sameSite: sessionConfig.cookie.sameSite,
    domain: sessionConfig.cookie.domain
  }
});

app.set('trust proxy', 1);
app.use(session(sessionConfig));

// Add session debug middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log('=== Session Debug ===');
  console.log('Session ID:', req.sessionID);
  console.log('Session data:', req.session);
  console.log('Cookies:', req.headers.cookie);
  next();
});

// Initialize game service with notification service
const gameService = new GameService(notificationService);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/games', createGameRouter(notificationService));

// Serve static files in production
if (isProduction) {
  const distPath = path.join(__dirname, '../../dist');
  app.use(express.static(distPath));

  // Handle client-side routing
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../dist/index.html'));
  });
}

// Error handling middleware (must be after all routes)
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Global Error Handler:', err);
  // Ensure we don't send headers if they're already sent
  if (res.headersSent) {
    return next(err);
  }
  // Always return JSON
  res.status(500).json({ 
    success: false,
    message: 'Une erreur est survenue',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Connect to MongoDB and start server
const port = process.env.PORT || 3000;

connectDB()
  .then(() => {
    console.log('MongoDB connected successfully');
    
    httpServer.listen({
      port: port,
      host: '0.0.0.0'
    }, () => {
      console.log(`Server is running on port ${port} in ${process.env.NODE_ENV} mode`);
      console.log(`CORS enabled for origin: ${allowedOrigins.join(', ')}`);
      gameService.start();
    });
  })
  .catch((err: Error) => {
    console.error('Failed to connect to MongoDB:', err);
    process.exit(1);
  }); 
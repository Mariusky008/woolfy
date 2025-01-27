import createRankingRouter from './routes/rankingRoutes';

// Initialize services
const badgeService = new BadgeService();
await badgeService.createDefaultBadges();

// Routes
app.use('/api/auth', createAuthRouter());
app.use('/api/game', createGameRouter());
app.use('/api/profile', createProfileRouter());
app.use('/api/ranking', createRankingRouter()); 
import express from 'express';
import { RankingController } from '../controllers/RankingController';
import { authenticateToken } from '../middleware/auth';

export const createRankingRouter = () => {
  const router = express.Router();
  const rankingController = new RankingController();

  // Routes publiques
  router.get('/', rankingController.getGlobalRanking);
  router.get('/rank/:rank/top', rankingController.getTopPlayersByRank);
  router.get('/user/:userId/context', rankingController.getUserRankingContext);

  // Routes protégées (nécessitent une authentification)
  router.put('/user/:userId/update', authenticateToken, rankingController.updateUserRank);

  return router;
};

export default createRankingRouter; 
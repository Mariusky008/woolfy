import { Router } from 'express';
import { GameController } from '../controllers/GameController';
import { NotificationService } from '../services/NotificationService';

export function createGameRouter(notificationService: NotificationService) {
  const router = Router();
  const gameController = new GameController(notificationService);

  // Public routes
  router.get('/', gameController.getAvailableGames.bind(gameController));

  // Protected routes
  router.post('/:gameId/register', gameController.registerToGame.bind(gameController));

  return router;
}

export default createGameRouter; 
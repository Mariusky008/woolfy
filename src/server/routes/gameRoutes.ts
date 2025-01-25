import { Router } from 'express';
import { GameController } from '../controllers/GameController';

const router = Router();
const gameController = new GameController();

// Public routes
router.get('/', gameController.getAvailableGames);

// Protected routes
router.post('/:gameId/register', gameController.registerToGame);

export default router; 
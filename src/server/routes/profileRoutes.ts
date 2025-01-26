import express from 'express';
import { ProfileController } from '../controllers/ProfileController';
import { NotificationService } from '../services/NotificationService';
import { authenticateUser } from '../middleware/auth';

export const createProfileRouter = (notificationService: NotificationService) => {
  const router = express.Router();
  const profileController = new ProfileController(notificationService);

  // Routes publiques (accessibles sans authentification)
  router.get('/:userId/badges', profileController.getUserBadges);
  router.get('/:userId/history', profileController.getGameHistory);
  router.get('/:userId/roles', profileController.getRoleStats);

  // Routes protégées (nécessitent une authentification)
  router.put('/', authenticateUser, profileController.updateProfile);
  router.get('/badges', authenticateUser, profileController.getUserBadges);
  router.get('/history', authenticateUser, profileController.getGameHistory);
  router.get('/roles', authenticateUser, profileController.getRoleStats);
  router.post('/badges/check', authenticateUser, profileController.checkBadges);

  return router;
};

export default createProfileRouter; 
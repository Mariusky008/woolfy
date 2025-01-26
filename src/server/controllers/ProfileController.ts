import { Request, Response } from 'express';
import { User } from '../models/User';
import { BadgeService } from '../services/BadgeService';
import { RoleStatsService } from '../services/RoleStatsService';
import { NotificationService } from '../services/NotificationService';
import { Types } from 'mongoose';

export class ProfileController {
  private badgeService: BadgeService;
  private roleStatsService: RoleStatsService;

  constructor(notificationService: NotificationService) {
    this.badgeService = new BadgeService(notificationService);
    this.roleStatsService = new RoleStatsService();
  }

  // Mettre à jour le profil
  updateProfile = async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId;
      const { avatar, bio } = req.body;

      if (!userId) {
        return res.status(401).json({ message: 'Non authentifié' });
      }

      const user = await User.findById(new Types.ObjectId(userId));
      if (!user) {
        return res.status(404).json({ message: 'Utilisateur non trouvé' });
      }

      if (avatar) user.avatar = avatar;
      if (bio) user.bio = bio;

      await user.save();

      res.json({
        message: 'Profil mis à jour avec succès',
        user: {
          avatar: user.avatar,
          bio: user.bio
        }
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      res.status(500).json({ message: 'Erreur lors de la mise à jour du profil' });
    }
  }

  // Récupérer les badges d'un utilisateur
  getUserBadges = async (req: Request, res: Response) => {
    try {
      const userId = req.params.userId || req.session.userId;
      if (!userId) {
        return res.status(401).json({ message: 'Non authentifié' });
      }

      const badges = await this.badgeService.getUserBadges(userId);
      res.json(badges);
    } catch (error) {
      console.error('Error fetching badges:', error);
      res.status(500).json({ message: 'Erreur lors de la récupération des badges' });
    }
  }

  // Récupérer l'historique des parties d'un utilisateur
  getGameHistory = async (req: Request, res: Response) => {
    try {
      const userId = req.params.userId || req.session.userId;
      if (!userId) {
        return res.status(401).json({ message: 'Non authentifié' });
      }

      const user = await User.findById(new Types.ObjectId(userId))
        .populate('gameHistory')
        .exec();

      if (!user) {
        return res.status(404).json({ message: 'Utilisateur non trouvé' });
      }

      res.json(user.gameHistory || []);
    } catch (error) {
      console.error('Error fetching game history:', error);
      res.status(500).json({ message: 'Erreur lors de la récupération de l\'historique' });
    }
  }

  // Récupérer les statistiques par rôle d'un utilisateur
  getRoleStats = async (req: Request, res: Response) => {
    try {
      const userId = req.params.userId || req.session.userId;
      if (!userId) {
        return res.status(401).json({ message: 'Non authentifié' });
      }

      const roleStats = await this.roleStatsService.getUserRoleStats(userId);
      
      // Calculer les statistiques supplémentaires pour chaque rôle
      const enhancedStats = roleStats.map(stat => ({
        ...stat,
        winRate: stat.gamesPlayed > 0 ? (stat.wins / stat.gamesPlayed) * 100 : 0,
        killsPerGame: stat.gamesPlayed > 0 && stat.kills ? stat.kills / stat.gamesPlayed : 0,
        specialActionsPerGame: stat.gamesPlayed > 0 && stat.specialActions ? stat.specialActions / stat.gamesPlayed : 0
      }));

      // Trier par nombre de parties jouées
      const sortedStats = enhancedStats.sort((a, b) => b.gamesPlayed - a.gamesPlayed);

      res.json(sortedStats);
    } catch (error) {
      console.error('Error fetching role stats:', error);
      res.status(500).json({ message: 'Erreur lors de la récupération des statistiques par rôle' });
    }
  }

  // Vérifier et attribuer les badges
  checkBadges = async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ message: 'Non authentifié' });
      }

      const user = await User.findById(new Types.ObjectId(userId));
      if (!user) {
        return res.status(404).json({ message: 'Utilisateur non trouvé' });
      }

      const newBadges = await this.badgeService.checkAndAwardBadges(user);
      res.json({ newBadges });
    } catch (error) {
      console.error('Error checking badges:', error);
      res.status(500).json({ message: 'Erreur lors de la vérification des badges' });
    }
  }
} 
import { Request, Response } from 'express';
import { RankingService } from '../services/RankingService';

export class RankingController {
  private rankingService: RankingService;

  constructor() {
    this.rankingService = new RankingService();
  }

  // Obtenir le classement global
  getGlobalRanking = async (req: Request, res: Response): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 100;
      
      const rankings = await this.rankingService.getGlobalRanking(page, limit);
      res.json(rankings);
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la récupération du classement global' });
    }
  };

  // Obtenir le classement autour d'un utilisateur
  getUserRankingContext = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.params.userId;
      const range = parseInt(req.query.range as string) || 5;
      
      const rankingContext = await this.rankingService.getUserRankingContext(userId, range);
      res.json(rankingContext);
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la récupération du contexte de classement' });
    }
  };

  // Obtenir les meilleurs joueurs d'un rang spécifique
  getTopPlayersByRank = async (req: Request, res: Response): Promise<void> => {
    try {
      const rank = req.params.rank;
      const limit = parseInt(req.query.limit as string) || 10;
      
      const topPlayers = await this.rankingService.getTopPlayersByRank(rank, limit);
      res.json(topPlayers);
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la récupération des meilleurs joueurs' });
    }
  };

  // Mettre à jour le rang d'un utilisateur
  updateUserRank = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.params.userId;
      const updatedRank = await this.rankingService.updateUserRank(userId);
      res.json(updatedRank);
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la mise à jour du rang' });
    }
  };
} 
import { GameHistory, IGameHistory } from '../models/GameHistory';
import { RoleStatsService } from './RoleStatsService';
import { RankingService } from './RankingService';
import { User } from '../models/User';
import { Types } from 'mongoose';

interface GameEndResult {
  gameId: Types.ObjectId;
  type: 'free' | 'cash' | 'classic' | 'pro' | 'elite';
  duration: number;
  players: Array<{
    userId: Types.ObjectId;
    username: string;
    avatar?: string;
    role: string;
    isWinner: boolean;
    kills: number;
    specialActions: number;
    accuracy: {
      correct: number;
      total: number;
    };
  }>;
  events: Array<{
    type: 'kill' | 'vote' | 'special_action';
    timestamp: Date;
    actor: Types.ObjectId;
    target?: Types.ObjectId;
    description: string;
  }>;
}

export class GameHistoryService {
  private roleStatsService: RoleStatsService;
  private rankingService: RankingService;

  constructor() {
    this.roleStatsService = new RoleStatsService();
    this.rankingService = new RankingService();
  }

  // Enregistrer une partie terminée
  async recordGameEnd(gameEndResult: GameEndResult): Promise<IGameHistory> {
    // Calculer les points pour chaque joueur
    const pointsPerPlayer = this.calculatePoints(gameEndResult);

    // Créer l'historique de la partie
    const gameHistory = await GameHistory.create({
      gameId: gameEndResult.gameId,
      type: gameEndResult.type,
      date: new Date(),
      duration: gameEndResult.duration,
      players: gameEndResult.players.map(player => ({
        userId: player.userId,
        username: player.username,
        avatar: player.avatar,
        role: player.role,
        result: player.isWinner ? 'winner' : 'loser',
        kills: player.kills,
        specialActions: player.specialActions,
        accuracy: player.accuracy
      })),
      events: gameEndResult.events,
      points: {
        base: 100, // Points de base pour la participation
        bonus: 50, // Bonus pour la victoire
        total: 150 // Total des points
      }
    });

    // Mettre à jour les statistiques pour chaque joueur
    await Promise.all(gameEndResult.players.map(async (player) => {
      // Mettre à jour les stats par rôle
      await this.roleStatsService.updateStats({
        userId: player.userId.toString(),
        role: player.role,
        won: player.isWinner,
        kills: player.kills,
        specialActions: player.specialActions,
        accuracy: player.accuracy
      });

      // Mettre à jour les stats globales du joueur
      const points = pointsPerPlayer.get(player.userId.toString()) || 0;
      await User.findByIdAndUpdate(player.userId, {
        $inc: {
          gamesPlayed: 1,
          gamesWon: player.isWinner ? 1 : 0,
          totalKills: player.kills,
          correctAccusations: player.accuracy.correct,
          totalAccusations: player.accuracy.total,
          points: points
        },
        $push: {
          gameHistory: gameHistory._id
        }
      });

      // Mettre à jour le rang du joueur
      await this.rankingService.updateUserRank(player.userId.toString());
    }));

    return gameHistory;
  }

  // Calculer les points gagnés pour chaque joueur
  private calculatePoints(game: GameEndResult): Map<string, number> {
    const points = new Map<string, number>();

    for (const player of game.players) {
      let playerPoints = 0;

      // Points de base selon le type de partie
      switch (game.type) {
        case 'free':
          playerPoints += 50;
          break;
        case 'cash':
          playerPoints += 100;
          break;
        case 'classic':
          playerPoints += 150;
          break;
        case 'pro':
          playerPoints += 250;
          break;
        case 'elite':
          playerPoints += 500;
          break;
      }

      // Bonus de victoire
      if (player.isWinner) {
        playerPoints *= 1.5;
      }

      // Bonus pour les kills
      playerPoints += player.kills * 20;

      // Bonus pour les actions spéciales
      playerPoints += player.specialActions * 30;

      // Bonus pour la précision
      const accuracy = player.accuracy.total > 0 
        ? (player.accuracy.correct / player.accuracy.total) * 100 
        : 0;
      if (accuracy >= 80) {
        playerPoints *= 1.2;
      }

      points.set(player.userId.toString(), Math.round(playerPoints));
    }

    return points;
  }

  // Récupérer l'historique des parties d'un joueur
  async getUserGameHistory(userId: string, limit: number = 10): Promise<IGameHistory[]> {
    const history = await GameHistory.find({
      'players.userId': new Types.ObjectId(userId)
    })
    .sort({ date: -1 })
    .limit(limit);

    return history;
  }

  // Récupérer les détails d'une partie
  async getGameDetails(gameId: string): Promise<IGameHistory | null> {
    const game = await GameHistory.findById(gameId);
    return game;
  }
} 
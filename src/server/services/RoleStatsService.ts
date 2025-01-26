import { RoleStats, IRoleStats } from '../models/RoleStats';
import { Types } from 'mongoose';

interface GameResult {
  userId: string;
  role: string;
  won: boolean;
  kills: number;
  specialActions: number;
  accuracy: {
    correct: number;
    total: number;
  };
}

export class RoleStatsService {
  // Mettre à jour les statistiques après une partie
  async updateStats(gameResult: GameResult): Promise<IRoleStats> {
    const stats = await RoleStats.findOneAndUpdate(
      {
        userId: new Types.ObjectId(gameResult.userId),
        role: gameResult.role
      },
      {
        $inc: {
          gamesPlayed: 1,
          gamesWon: gameResult.won ? 1 : 0,
          kills: gameResult.kills,
          specialActions: gameResult.specialActions,
          'accuracy.correct': gameResult.accuracy.correct,
          'accuracy.total': gameResult.accuracy.total
        },
        $set: {
          lastPlayed: new Date()
        }
      },
      {
        new: true,
        upsert: true
      }
    );

    return stats;
  }

  // Récupérer les statistiques d'un utilisateur pour tous les rôles
  async getUserRoleStats(userId: string): Promise<IRoleStats[]> {
    const stats = await RoleStats.find({
      userId: new Types.ObjectId(userId)
    }).sort({ lastPlayed: -1 });

    return stats;
  }

  // Récupérer les statistiques d'un utilisateur pour un rôle spécifique
  async getUserRoleStatsByRole(userId: string, role: string): Promise<IRoleStats | null> {
    const stats = await RoleStats.findOne({
      userId: new Types.ObjectId(userId),
      role
    });

    return stats;
  }

  // Récupérer le rôle le plus joué d'un utilisateur
  async getMostPlayedRole(userId: string): Promise<{ role: string; gamesPlayed: number } | null> {
    const stats = await RoleStats.findOne({
      userId: new Types.ObjectId(userId)
    })
    .sort({ gamesPlayed: -1 })
    .limit(1);

    if (!stats) return null;

    return {
      role: stats.role,
      gamesPlayed: stats.gamesPlayed
    };
  }

  // Récupérer le meilleur rôle d'un utilisateur (basé sur le taux de victoire)
  async getBestRole(userId: string): Promise<{ role: string; winRate: number } | null> {
    const stats = await RoleStats.aggregate([
      {
        $match: {
          userId: new Types.ObjectId(userId),
          gamesPlayed: { $gt: 5 } // Minimum 5 parties pour être significatif
        }
      },
      {
        $project: {
          role: 1,
          winRate: {
            $multiply: [
              { $divide: ['$gamesWon', '$gamesPlayed'] },
              100
            ]
          }
        }
      },
      {
        $sort: { winRate: -1 }
      },
      {
        $limit: 1
      }
    ]);

    if (!stats.length) return null;

    return {
      role: stats[0].role,
      winRate: stats[0].winRate
    };
  }

  // Récupérer les statistiques globales pour un rôle
  async getGlobalRoleStats(role: string): Promise<{
    totalGames: number;
    averageWinRate: number;
    averageKills: number;
    averageAccuracy: number;
  }> {
    const stats = await RoleStats.aggregate([
      {
        $match: { role }
      },
      {
        $group: {
          _id: null,
          totalGames: { $sum: '$gamesPlayed' },
          totalWins: { $sum: '$gamesWon' },
          totalKills: { $sum: '$kills' },
          totalCorrect: { $sum: '$accuracy.correct' },
          totalAttempts: { $sum: '$accuracy.total' }
        }
      }
    ]);

    if (!stats.length) {
      return {
        totalGames: 0,
        averageWinRate: 0,
        averageKills: 0,
        averageAccuracy: 0
      };
    }

    const result = stats[0];
    return {
      totalGames: result.totalGames,
      averageWinRate: (result.totalWins / result.totalGames) * 100,
      averageKills: result.totalKills / result.totalGames,
      averageAccuracy: result.totalAttempts > 0 
        ? (result.totalCorrect / result.totalAttempts) * 100 
        : 0
    };
  }
} 
import { User, IUser } from '../models/User';
import { Types } from 'mongoose';

interface RankTier {
  name: string;
  minPoints: number;
  maxPoints: number;
  division: 1 | 2 | 3 | 4;
}

export class RankingService {
  private readonly rankTiers: RankTier[] = [
    { name: 'Louveteau', minPoints: 0, maxPoints: 999, division: 4 },
    { name: 'Louveteau', minPoints: 1000, maxPoints: 1999, division: 3 },
    { name: 'Louveteau', minPoints: 2000, maxPoints: 2999, division: 2 },
    { name: 'Louveteau', minPoints: 3000, maxPoints: 3999, division: 1 },
    
    { name: 'Loup Solitaire', minPoints: 4000, maxPoints: 4999, division: 4 },
    { name: 'Loup Solitaire', minPoints: 5000, maxPoints: 5999, division: 3 },
    { name: 'Loup Solitaire', minPoints: 6000, maxPoints: 6999, division: 2 },
    { name: 'Loup Solitaire', minPoints: 7000, maxPoints: 7999, division: 1 },
    
    { name: 'Loup Alpha', minPoints: 8000, maxPoints: 8999, division: 4 },
    { name: 'Loup Alpha', minPoints: 9000, maxPoints: 9999, division: 3 },
    { name: 'Loup Alpha', minPoints: 10000, maxPoints: 10999, division: 2 },
    { name: 'Loup Alpha', minPoints: 11000, maxPoints: 11999, division: 1 },
    
    { name: 'Loup Légendaire', minPoints: 12000, maxPoints: 13999, division: 4 },
    { name: 'Loup Légendaire', minPoints: 14000, maxPoints: 15999, division: 3 },
    { name: 'Loup Légendaire', minPoints: 16000, maxPoints: 17999, division: 2 },
    { name: 'Loup Légendaire', minPoints: 18000, maxPoints: 19999, division: 1 },
    
    { name: 'Grand Alpha', minPoints: 20000, maxPoints: Infinity, division: 1 }
  ];

  // Mettre à jour le rang d'un utilisateur
  async updateUserRank(userId: string): Promise<{
    rank: string;
    division: number;
    points: number;
    position: number;
  }> {
    const user = await User.findById(new Types.ObjectId(userId));
    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }

    // Trouver le rang correspondant aux points
    const currentTier = this.rankTiers.find(
      tier => user.points >= tier.minPoints && user.points <= tier.maxPoints
    );

    if (!currentTier) {
      throw new Error('Impossible de déterminer le rang');
    }

    // Calculer la position dans le classement
    const position = await User.countDocuments({
      points: { $gt: user.points }
    }) + 1;

    // Mettre à jour le rang de l'utilisateur
    user.rank = currentTier.name;
    await user.save();

    return {
      rank: currentTier.name,
      division: currentTier.division,
      points: user.points,
      position
    };
  }

  // Obtenir le classement global
  async getGlobalRanking(page: number = 1, limit: number = 100): Promise<{
    rankings: Array<{
      userId: string;
      username: string;
      rank: string;
      points: number;
      position: number;
    }>;
    total: number;
  }> {
    const skip = (page - 1) * limit;
    const total = await User.countDocuments();

    const rankings = await User.find()
      .sort({ points: -1 })
      .skip(skip)
      .limit(limit)
      .select('username rank points')
      .lean();

    return {
      rankings: rankings.map((user, index) => ({
        userId: user._id.toString(),
        username: user.username,
        rank: user.rank,
        points: user.points,
        position: skip + index + 1
      })),
      total
    };
  }

  // Obtenir le classement autour d'un utilisateur
  async getUserRankingContext(userId: string, range: number = 5): Promise<{
    above: Array<{
      userId: string;
      username: string;
      rank: string;
      points: number;
      position: number;
    }>;
    user: {
      userId: string;
      username: string;
      rank: string;
      points: number;
      position: number;
    };
    below: Array<{
      userId: string;
      username: string;
      rank: string;
      points: number;
      position: number;
    }>;
  }> {
    const user = await User.findById(new Types.ObjectId(userId));
    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }

    // Trouver la position de l'utilisateur
    const position = await User.countDocuments({
      points: { $gt: user.points }
    }) + 1;

    // Récupérer les joueurs au-dessus
    const above = await User.find({
      points: { $gt: user.points }
    })
      .sort({ points: 1 })
      .limit(range)
      .select('username rank points')
      .lean();

    // Récupérer les joueurs en-dessous
    const below = await User.find({
      points: { $lt: user.points }
    })
      .sort({ points: -1 })
      .limit(range)
      .select('username rank points')
      .lean();

    return {
      above: above.reverse().map((u, i) => ({
        userId: u._id.toString(),
        username: u.username,
        rank: u.rank,
        points: u.points,
        position: position - (above.length - i)
      })),
      user: {
        userId: user._id.toString(),
        username: user.username,
        rank: user.rank,
        points: user.points,
        position
      },
      below: below.map((u, i) => ({
        userId: u._id.toString(),
        username: u.username,
        rank: u.rank,
        points: u.points,
        position: position + i + 1
      }))
    };
  }

  // Obtenir les meilleurs joueurs d'un rang spécifique
  async getTopPlayersByRank(rank: string, limit: number = 10): Promise<Array<{
    userId: string;
    username: string;
    points: number;
    position: number;
  }>> {
    const players = await User.find({ rank })
      .sort({ points: -1 })
      .limit(limit)
      .select('username points')
      .lean();

    return players.map((player, index) => ({
      userId: player._id.toString(),
      username: player.username,
      points: player.points,
      position: index + 1
    }));
  }
} 
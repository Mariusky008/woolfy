import { User, IUser } from '../models/User';
import { Badge, IBadge } from '../models/Badge';

export class RewardService {
  // Vérifier et attribuer les récompenses après une partie
  static async processGameRewards(userId: string, gameType: string, isWinner: boolean) {
    try {
      const user = await User.findById(userId);
      if (!user) throw new Error('Utilisateur non trouvé');

      // Mettre à jour les statistiques de base
      user.gamesPlayed += 1;
      if (isWinner) user.gamesWon += 1;

      // Ajouter les points de base pour la participation
      const basePoints = this.calculateBasePoints(gameType);
      const winBonus = isWinner ? this.calculateWinBonus(gameType) : 0;
      user.points += basePoints + winBonus;

      // Vérifier les badges disponibles
      await this.checkAndAwardBadges(user, gameType);

      // Mettre à jour le rang
      await this.updateUserRank(user);

      await user.save();

      return {
        newPoints: user.points,
        newBadges: user.badges,
        newTrophies: user.trophies,
        newRank: user.rank
      };
    } catch (error) {
      console.error('Erreur lors du traitement des récompenses:', error);
      throw error;
    }
  }

  // Calculer les points de base selon le type de partie
  private static calculateBasePoints(gameType: string): number {
    const pointsMap: { [key: string]: number } = {
      'free': 50,
      'cash': 100,
      'classic': 150,
      'pro': 200,
      'elite': 300
    };
    return pointsMap[gameType] || 50;
  }

  // Calculer le bonus de victoire
  private static calculateWinBonus(gameType: string): number {
    const bonusMap: { [key: string]: number } = {
      'free': 25,
      'cash': 50,
      'classic': 75,
      'pro': 100,
      'elite': 150
    };
    return bonusMap[gameType] || 25;
  }

  // Vérifier et attribuer les badges
  private static async checkAndAwardBadges(user: IUser, gameType: string) {
    const availableBadges = await Badge.find({
      name: { $nin: user.badges } // Exclure les badges déjà obtenus
    });

    for (const badge of availableBadges) {
      if (this.userMeetsBadgeRequirements(user, badge, gameType)) {
        user.badges.push(badge.name);
        user.points += badge.pointsValue; // Points bonus pour l'obtention du badge
      }
    }
  }

  // Vérifier si l'utilisateur remplit les conditions pour un badge
  private static userMeetsBadgeRequirements(user: IUser, badge: IBadge, gameType: string): boolean {
    const req = badge.requirements;

    if (req.gameType && req.gameType !== gameType) return false;
    if (req.minGamesPlayed && user.gamesPlayed < req.minGamesPlayed) return false;
    if (req.minGamesWon && user.gamesWon < req.minGamesWon) return false;
    if (req.minPoints && user.points < req.minPoints) return false;

    return true;
  }

  // Mettre à jour le rang de l'utilisateur
  private static async updateUserRank(user: IUser) {
    const ranks = [
      { name: 'Louveteau', minPoints: 0 },
      { name: 'Loup Solitaire', minPoints: 1000 },
      { name: 'Loup Alpha', minPoints: 5000 },
      { name: 'Loup Légendaire', minPoints: 10000 },
      { name: 'Grand Alpha', minPoints: 20000 }
    ];

    for (let i = ranks.length - 1; i >= 0; i--) {
      if (user.points >= ranks[i].minPoints) {
        user.rank = ranks[i].name;
        break;
      }
    }
  }
} 
import { Badge, IBadge } from '../models/Badge';
import { User, IUser } from '../models/User';
import { NotificationService } from './NotificationService';

export class BadgeService {
  private notificationService: NotificationService;

  constructor(notificationService: NotificationService) {
    this.notificationService = notificationService;
  }

  // Vérifier et attribuer les badges pour un utilisateur
  async checkAndAwardBadges(user: IUser): Promise<string[]> {
    const badges = await Badge.find();
    const newBadges: string[] = [];

    for (const badge of badges) {
      if (!user.badges.includes(badge.name)) {
        const isEarned = await this.checkBadgeRequirements(user, badge);
        if (isEarned) {
          user.badges.push(badge.name);
          newBadges.push(badge.name);
          
          // Notifier l'utilisateur
          this.notificationService.notifyUser(user._id.toString(), 'badge_earned', {
            badgeName: badge.name,
            description: badge.description,
            rarity: badge.rarity
          });
        }
      }
    }

    if (newBadges.length > 0) {
      await user.save();
    }

    return newBadges;
  }

  // Vérifier si un utilisateur remplit les conditions pour un badge
  private async checkBadgeRequirements(user: IUser, badge: IBadge): Promise<boolean> {
    const { type, value } = badge.requirements;

    switch (type) {
      case 'games_played':
        return user.gamesPlayed >= value;

      case 'win_rate':
        const winRate = user.gamesPlayed > 0 
          ? (user.gamesWon / user.gamesPlayed) * 100 
          : 0;
        return winRate >= value;

      case 'kills':
        return user.totalKills >= value;

      case 'accuracy':
        const accuracy = user.totalAccusations > 0 
          ? (user.correctAccusations / user.totalAccusations) * 100 
          : 0;
        return accuracy >= value;

      case 'special_actions':
        // À implémenter quand nous aurons les actions spéciales
        return false;

      default:
        return false;
    }
  }

  // Récupérer tous les badges d'un utilisateur avec leurs détails
  async getUserBadges(userId: string) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }

    const badges = await Badge.find({
      name: { $in: user.badges }
    });

    return badges;
  }

  // Créer les badges par défaut du jeu
  async createDefaultBadges() {
    const defaultBadges = [
      {
        name: 'Première Chasse',
        description: 'Participez à votre première partie',
        icon: '🐺',
        rarity: 'common',
        requirements: {
          type: 'games_played',
          value: 1
        },
        category: 'achievement'
      },
      {
        name: 'Chasseur Expérimenté',
        description: 'Jouez 50 parties',
        icon: '🎯',
        rarity: 'rare',
        requirements: {
          type: 'games_played',
          value: 50
        },
        category: 'achievement'
      },
      {
        name: 'Maître de la Meute',
        description: 'Atteignez un taux de victoire de 60%',
        icon: '👑',
        rarity: 'epic',
        requirements: {
          type: 'win_rate',
          value: 60
        },
        category: 'achievement'
      },
      {
        name: 'Prédateur Légendaire',
        description: 'Éliminez 100 joueurs',
        icon: '☠️',
        rarity: 'legendary',
        requirements: {
          type: 'kills',
          value: 100
        },
        category: 'achievement'
      },
      {
        name: 'Œil de Lynx',
        description: 'Atteignez une précision de 80% dans vos accusations',
        icon: '🎯',
        rarity: 'epic',
        requirements: {
          type: 'accuracy',
          value: 80
        },
        category: 'achievement'
      }
    ];

    for (const badge of defaultBadges) {
      await Badge.findOneAndUpdate(
        { name: badge.name },
        badge,
        { upsert: true, new: true }
      );
    }
  }
} 
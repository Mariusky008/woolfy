import { GameController } from '../controllers/GameController';
import { Game } from '../models/Game';
import { NotificationService } from './NotificationService';

export class GameService {
  private gameController: GameController;
  private checkInterval: NodeJS.Timeout | null = null;

  constructor(notificationService: NotificationService) {
    this.gameController = new GameController(notificationService);
  }

  start() {
    // Create initial daily games
    this.createDailyGames();

    // Check games every minute
    this.checkInterval = setInterval(() => {
      this.gameController.checkAndStartGames();
    }, 60 * 1000);

    // Schedule daily game creation at midnight
    this.scheduleDailyGames();
  }

  stop() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  private async createDailyGames() {
    try {
      // Create free games
      await Game.create({
        name: 'Partie Gratuite Express',
        type: 'free',
        players: { min: 5, max: 5, current: 0, registered: [] },
        startTime: 'auto',
        duration: 30,
        minPlayersToStart: 4,
        rewards: {
          badge: 'Loup Rapide',
          points: 50
        }
      });

      await Game.create({
        name: 'Partie Gratuite Standard',
        type: 'free',
        players: { min: 15, max: 15, current: 0, registered: [] },
        startTime: 'auto',
        duration: 45,
        minPlayersToStart: 11,
        rewards: {
          badge: 'Stratège',
          trophy: 'Meute',
          points: 100
        }
      });

      await Game.create({
        name: 'Grande Partie Gratuite',
        type: 'free',
        players: { min: 20, max: 20, current: 0, registered: [] },
        startTime: 'auto',
        duration: 90,
        minPlayersToStart: 15,
        rewards: {
          badge: 'Meute Alpha',
          trophy: 'Grande Meute',
          points: 200
        }
      });

      // Create scheduled games
      await Game.create({
        name: 'Partie Cash',
        type: 'cash',
        players: { min: 3, max: 5, current: 0, registered: [] },
        startTime: '12:00',
        duration: 30,
        minPlayersToStart: 2,
        prize: '1-4€',
        rewards: {
          badge: 'Cash Hunter',
          points: 25
        }
      });

      await Game.create({
        name: 'Partie Classique',
        type: 'classic',
        players: { min: 15, max: 20, current: 0, registered: [] },
        startTime: '18:00',
        duration: 60,
        minPlayersToStart: 11,
        prize: '10-20€',
        rewards: {
          badge: 'Classique',
          trophy: 'Vétéran',
          points: 150
        }
      });

      await Game.create({
        name: 'Tournoi Pro',
        type: 'pro',
        players: { min: 25, max: 30, current: 0, registered: [] },
        startTime: '21:00',
        duration: 90,
        minPlayersToStart: 18,
        prize: '100-500€',
        rewards: {
          badge: 'Pro League',
          trophy: 'Champion',
          points: 500
        }
      });

      await Game.create({
        name: 'Tournoi Élite',
        type: 'elite',
        players: { min: 20, max: 25, current: 0, registered: [] },
        startTime: '21:00',
        duration: 120,
        minPlayersToStart: 14,
        prize: '1000€',
        rank: 'Top 100',
        rewards: {
          badge: 'Élite',
          trophy: 'Légendaire',
          points: 1000
        }
      });

      console.log('Daily games created successfully');
    } catch (error) {
      console.error('Error creating daily games:', error);
    }
  }

  private scheduleDailyGames() {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const timeUntilMidnight = tomorrow.getTime() - now.getTime();

    setTimeout(() => {
      this.createDailyGames();
      // Reschedule for the next day
      this.scheduleDailyGames();
    }, timeUntilMidnight);
  }
} 
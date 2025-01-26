import { Game, IGame } from '../models/Game';
import { Request, Response } from 'express';
import { NotificationService } from '../services/NotificationService';
import { User } from '../models/User';
import { Types } from 'mongoose';

export class GameController {
  private notificationService: NotificationService;

  constructor(notificationService: NotificationService) {
    this.notificationService = notificationService;
  }

  // Récupérer toutes les parties disponibles
  async getAvailableGames(req: Request, res: Response) {
    try {
      const games = await Game.find({ status: 'waiting' });
      res.json(games);
    } catch (error) {
      console.error('Error fetching games:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Inscription à une partie
  async registerToGame(req: Request, res: Response) {
    try {
      const { gameId } = req.params;
      const userId = req.session.userId;

      if (!userId) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      const game = await Game.findById(gameId);
      if (!game) {
        return res.status(404).json({ message: 'Game not found' });
      }

      if (game.status !== 'waiting') {
        return res.status(400).json({ message: 'Game is not available for registration' });
      }

      if (game.players.current >= game.players.max) {
        return res.status(400).json({ message: 'Game is full' });
      }

      // Get user info for notification
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Add player to game
      game.players.current += 1;
      game.players.registered.push(new Types.ObjectId(userId));
      await game.save();

      // Send notification
      this.notificationService.notifyPlayerJoined(game, user.username);

      // Check game type and start conditions
      const minRequired = Math.ceil(game.players.min * 0.7);
      const isScheduledGame = ['classic', 'pro', 'elite'].includes(game.type);
      const isAutoStartGame = game.type === 'free' && game.startTime === 'auto';
      const shouldStartNow = isAutoStartGame && !isScheduledGame && game.players.current >= minRequired;

      if (shouldStartNow) {
        this.notificationService.notifyGameStarting(game);
        setTimeout(() => this.startGame(new Types.ObjectId(gameId)), 60000); // Start in 1 minute
      }

      res.json({ message: 'Successfully registered to game' });
    } catch (error) {
      console.error('Error registering to game:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Vérifier et démarrer les parties
  async checkAndStartGames() {
    try {
      const games = await Game.find({ status: 'waiting' });
      
      for (const game of games) {
        const minRequired = Math.ceil(game.players.min * 0.7);
        const now = new Date();
        const currentHour = now.getHours();
        const currentMinutes = now.getMinutes();

        // For scheduled games (classic, pro, elite), check if it's time to start
        const isScheduledGame = ['classic', 'pro', 'elite'].includes(game.type);
        if (isScheduledGame && game.startTime.includes(':')) {
          const [scheduledHour, scheduledMinutes] = game.startTime.split(':').map(Number);
          const isTimeToStart = currentHour === scheduledHour && 
                              currentMinutes === scheduledMinutes && 
                              game.players.current >= minRequired;
          
          if (isTimeToStart) {
            this.notificationService.notifyGameStarting(game);
            setTimeout(() => this.startGame(game._id), 60000);
          }
        }
        // For auto-start games (free games), check if minimum players are reached
        else if (game.type === 'free' && game.startTime === 'auto' && game.players.current >= minRequired) {
          this.notificationService.notifyGameStarting(game);
          setTimeout(() => this.startGame(game._id), 60000);
        }
      }
    } catch (error) {
      console.error('Error checking games:', error);
    }
  }

  // Démarrer une partie
  private async startGame(gameId: Types.ObjectId) {
    try {
      const game = await Game.findById(gameId);
      if (!game) return;

      game.status = 'in_progress';
      await game.save();

      // Notify players that the game has started
      this.notificationService.notifyGameStarted(game);

      // TODO: Implement role distribution and game start logic
      console.log(`Game ${gameId} started with ${game.players.current} players`);
    } catch (error) {
      console.error('Error starting game:', error);
    }
  }

  // Reprogrammer une partie au lendemain
  private async rescheduleGame(gameId: string) {
    try {
      const game = await Game.findById(gameId);
      if (!game) return;

      // Ajouter 24h à la date prévue
      const newDate = new Date(game.scheduledFor);
      newDate.setDate(newDate.getDate() + 1);
      game.scheduledFor = newDate;

      // Réinitialiser les joueurs
      game.players.registered = [];
      game.players.current = 0;
      game.status = 'waiting';

      await game.save();
    } catch (error) {
      console.error('Erreur lors de la reprogrammation de la partie:', error);
    }
  }

  // Créer les parties quotidiennes
  async createDailyGames() {
    try {
      // Parties gratuites à démarrage automatique
      await this.createGame({
        name: 'Partie Gratuite Express',
        type: 'free',
        players: { max: 5, min: 5, current: 0, registered: [] },
        startTime: 'auto',
        duration: '30min',
        rank: 'Débutant',
        autoStart: true,
        rewards: {
          badge: 'Badge Loup Rapide',
          points: 50
        }
      });

      await this.createGame({
        name: 'Partie Gratuite Standard',
        type: 'free',
        players: { max: 15, min: 15, current: 0, registered: [] },
        startTime: 'auto',
        duration: '1h',
        rank: 'Top 1000',
        autoStart: true,
        rewards: {
          badge: 'Badge Stratège',
          trophy: 'Trophée Meute',
          points: 100
        }
      });

      // Parties à horaire fixe
      const today = new Date();
      
      // Cash Game à 12h
      await this.createScheduledGame({
        name: 'Cash Game',
        type: 'cash',
        players: { max: 5, min: 3, current: 0, registered: [] },
        startTime: '12:00',
        duration: '30min',
        prize: '5€',
        rewards: {
          badge: 'Badge Cash Hunter',
          points: 25
        }
      }, 12);

      // Partie Classique à 18h
      await this.createScheduledGame({
        name: 'Partie Classique',
        type: 'classic',
        players: { max: 20, min: 15, current: 0, registered: [] },
        startTime: '18:00',
        duration: '1h',
        prize: '20€',
        rewards: {
          badge: 'Badge Classique',
          trophy: 'Trophée Vétéran',
          points: 150
        }
      }, 18);

      // Tournois à 21h
      await this.createScheduledGame({
        name: 'Tournoi Pro',
        type: 'pro',
        players: { max: 30, min: 25, current: 0, registered: [] },
        startTime: '21:00',
        duration: '2h',
        prize: '500€',
        rewards: {
          badge: 'Badge Pro League',
          trophy: 'Trophée Champion',
          points: 500
        }
      }, 21);

      await this.createScheduledGame({
        name: 'Tournoi Élite',
        type: 'elite',
        players: { max: 25, min: 20, current: 0, registered: [] },
        startTime: '21:00',
        duration: '3h',
        rank: 'Top 100',
        rewards: {
          badge: 'Badge Élite',
          trophy: 'Trophée Légendaire',
          points: 1000
        }
      }, 21);

    } catch (error) {
      console.error('Erreur lors de la création des parties quotidiennes:', error);
    }
  }

  // Méthode utilitaire pour créer une partie
  private async createGame(gameData: Partial<IGame>) {
    const existingGame = await Game.findOne({
      name: gameData.name,
      status: 'waiting'
    });

    if (!existingGame) {
      await Game.create(gameData);
    }
  }

  // Méthode utilitaire pour créer une partie programmée
  private async createScheduledGame(gameData: Partial<IGame>, hour: number) {
    const today = new Date();
    today.setHours(hour, 0, 0, 0);

    const existingGame = await Game.findOne({
      name: gameData.name,
      status: 'waiting',
      scheduledFor: today
    });

    if (!existingGame) {
      await Game.create({
        ...gameData,
        scheduledFor: today,
        autoStart: false
      });
    }
  }
} 